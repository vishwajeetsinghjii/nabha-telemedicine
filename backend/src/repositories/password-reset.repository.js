const db = require('../config/database');

async function invalidateActiveForUser(userId, client = db) {
  await client.query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [userId]
  );
}

async function create({ userId, tokenHash, expiresAt }, client = db) {
  const result = await client.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findValidByHash(tokenHash, client = db) {
  const result = await client.query(
    `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM password_reset_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function markUsed(id, client = db) {
  const result = await client.query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL RETURNING id`,
    [id]
  );
  return !!result.rows[0];
}

module.exports = { invalidateActiveForUser, create, findValidByHash, markUsed };
