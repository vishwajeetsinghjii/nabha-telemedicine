const env = require('../config/env');
const { ExternalServiceError } = require('../utils/errors');

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const provider = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  const from = process.env.EMAIL_FROM || '';

  if (!provider || !from) {
    if (env.NODE_ENV !== 'production' && process.env.ALLOW_PASSWORD_RESET_LOG === 'true') {
      console.warn(`[Password Reset][development only] Reset link for ${to}: ${resetUrl}`);
      return { delivered: false, development: true };
    }
    throw new ExternalServiceError('Password reset email service is not configured');
  }

  if (provider !== 'resend') {
    throw new ExternalServiceError(`Unsupported EMAIL_PROVIDER '${provider}'. Configure 'resend'.`);
  }

  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) throw new ExternalServiceError('Password reset email API key is not configured');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Reset your Nabha Telemedicine password',
      text: `Hello ${name || 'there'},\n\nWe received a request to reset your Nabha Telemedicine password. Use the link below within ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\nNabha Telemedicine`,
      html: `<p>Hello ${escapeHtml(name || 'there')},</p><p>We received a request to reset your Nabha Telemedicine password.</p><p><a href="${escapeAttribute(resetUrl)}">Reset your password</a></p><p>This link expires in ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes.</p><p>If you did not request this, you can safely ignore this email.</p><p>Nabha Telemedicine</p>`
    })
  });

  if (!response.ok) {
    let detail = 'Email provider rejected the request';
    try {
      const body = await response.json();
      if (body?.message) detail = body.message;
    } catch {}
    throw new ExternalServiceError(detail);
  }

  return { delivered: true };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
function escapeAttribute(value) { return escapeHtml(value); }

async function sendVerificationDecisionEmail({ to, name, role, decision, notes='' }) {
  const provider = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  const from = process.env.EMAIL_FROM || '';
  const approved = decision === 'APPROVED';
  const subject = approved ? 'Your Nabha Telemedicine verification is approved' : 'Update on your Nabha Telemedicine verification';
  const text = `Hello ${name || 'there'},\n\nYour ${String(role || '').toLowerCase()} account verification has been ${approved ? 'approved' : 'rejected'}.\n${!approved ? `Reason: ${notes}\n\n` : ''}${approved ? 'You can now sign in and use your approved account.' : 'Please review the reason and contact the platform administrator if you need clarification.'}\n\nNabha Telemedicine`;
  if (!provider || !from) {
    if (env.NODE_ENV !== 'production' && process.env.ALLOW_PASSWORD_RESET_LOG === 'true') {
      console.warn(`[Verification][development only] ${to}: ${decision} ${notes || ''}`);
      return { delivered:false, development:true };
    }
    return { delivered:false, skipped:true };
  }
  if (provider !== 'resend') throw new ExternalServiceError(`Unsupported EMAIL_PROVIDER '${provider}'. Configure 'resend'.`);
  const apiKey=process.env.EMAIL_API_KEY; if(!apiKey) throw new ExternalServiceError('Verification email API key is not configured');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,text,html:`<p>Hello ${escapeHtml(name || 'there')},</p><p>Your <strong>${escapeHtml(String(role || '').toLowerCase())}</strong> account verification has been <strong>${approved?'approved':'rejected'}</strong>.</p>${approved?'<p>You can now sign in and use your approved account.</p>':`<p><strong>Reason:</strong> ${escapeHtml(notes)}</p><p>Please contact the platform administrator if you need clarification.</p>`}<p>Nabha Telemedicine</p>`})});
  if(!response.ok){let detail='Email provider rejected the request';try{const body=await response.json();if(body?.message)detail=body.message;}catch{}throw new ExternalServiceError(detail);}
  return {delivered:true};
}

module.exports = { sendPasswordResetEmail, sendVerificationDecisionEmail };
