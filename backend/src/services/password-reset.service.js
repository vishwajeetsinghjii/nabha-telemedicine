const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const users = require('../repositories/user.repository');
const resetRepo = require('../repositories/password-reset.repository');
const { sendPasswordResetEmail } = require('./email.service');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const env = require('../config/env');

function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function normalizeMobile(value) { const s=String(value||'').trim().replace(/\s+/g,'').replace(/^\+91/,'').replace(/^91(?=\d{10}$)/,''); return s; }
function assertPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new ValidationError('Password must be 8 to 128 characters and include uppercase, lowercase, number and special character');
  }
}
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function buildResetUrl(token) {
  return `${env.FRONTEND_BASE_URL.replace(/\/+$/, '')}/reset-password.html?token=${encodeURIComponent(token)}`;
}

async function requestReset(identifierInput) {
  const raw = String(identifierInput || '').trim();
  const email = normalizeEmail(raw);
  const mobile = normalizeMobile(raw);
  const isEmail = /^\S+@\S+\.\S+$/.test(email);
  const isMobile = /^\d{10}$/.test(mobile);
  if (!isEmail && !isMobile) throw new ValidationError('Enter a valid 10-digit mobile number or email address');

  const user = isEmail ? await users.findByEmail(email) : await users.findByMobile(mobile);
  // Deliberately return the same success response for unknown/ineligible accounts.
  if (!user || user.accountStatus === 'DISABLED') return { accepted: true };
  // A reset link can only be delivered through a configured recovery channel.
  // For local development, the link is returned only when explicitly enabled.
  const recoveryEmail = user.email;
  if (!recoveryEmail && !(env.NODE_ENV !== 'production' && process.env.ALLOW_PASSWORD_RESET_LOG === 'true')) {
    return { accepted: true };
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);

  await db.transaction(async client => {
    await resetRepo.invalidateActiveForUser(user.id, client);
    await resetRepo.create({ userId: user.id, tokenHash, expiresAt }, client);
  });

  const resetUrl = buildResetUrl(token);
  try {
    if (recoveryEmail) {
      await sendPasswordResetEmail({ to: recoveryEmail, name: user.name, resetUrl });
    } else {
      console.warn(`[Password Reset][development only] Reset link for ${mobile}: ${resetUrl}`);
    }
  } catch (error) {
    await db.query('DELETE FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]).catch(() => {});
    console.error('[Password Reset] Recovery delivery failed:', error.message);
    return { accepted: true };
  }

  const result = { accepted: true };
  if (env.NODE_ENV !== 'production' && process.env.ALLOW_PASSWORD_RESET_LOG === 'true') {
    result.developmentResetUrl = resetUrl;
  }
  return result;
}

async function resetPassword(tokenInput, newPassword) {
  const token = String(tokenInput || '').trim();
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) throw new AuthenticationError('This password reset link is invalid or expired');
  assertPassword(newPassword);

  const tokenHash = hashToken(token);
  const reset = await resetRepo.findValidByHash(tokenHash);
  if (!reset) throw new AuthenticationError('This password reset link is invalid or expired');

  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_ROUNDS || 12));

  await db.transaction(async client => {
    const updated = await client.query(
      `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1 AND is_active = TRUE RETURNING id`,
      [reset.user_id, passwordHash]
    );
    if (!updated.rows[0]) throw new AuthenticationError('This account cannot reset its password');

    const marked = await resetRepo.markUsed(reset.id, client);
    if (!marked) throw new AuthenticationError('This password reset link is invalid or expired');

    await client.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [reset.user_id]);
    await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2`, [reset.user_id, reset.id]);
  });

  return { reset: true };
}

module.exports = { requestReset, resetPassword };
