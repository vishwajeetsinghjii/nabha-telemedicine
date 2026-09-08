document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');
  if (!form) return;
  const msg = document.getElementById('resetMessage');
  const devLink = document.getElementById('developmentResetLink');
  const field = document.getElementById('resetEmail');
  const err = document.getElementById('resetEmailError');
  const btn = document.getElementById('resetRequestButton');
  const text = document.getElementById('resetRequestText');
  const loader = document.getElementById('resetRequestLoader');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    err.textContent = '';
    msg.hidden = true;
    devLink.hidden = true;
    const value = field.value.trim();
    const mobile = value.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '');
    const validEmail = /^\S+@\S+\.\S+$/.test(value);
    const validMobile = /^\d{10}$/.test(mobile);
    if (!validEmail && !validMobile) {
      err.textContent = 'Enter a valid 10-digit mobile number or email address.';
      return;
    }

    btn.disabled = true;
    text.hidden = true;
    loader.hidden = false;
    try {
      const result = await window.api.forgotPassword(value);
      msg.textContent = 'If an account matches, a secure password reset link has been sent to the recovery contact available on that account.';
      msg.className = 'login-message success';
      msg.hidden = false;
      if (result?.developmentResetUrl) {
        devLink.innerHTML = '<strong>Local development reset link</strong><br><a href="' + result.developmentResetUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">Open password reset page</a>';
        devLink.hidden = false;
      }
      form.reset();
    } catch (e) {
      msg.textContent = e.message || 'Unable to process the password reset request. Please try again later.';
      msg.className = 'login-message error';
      msg.hidden = false;
    } finally {
      btn.disabled = false;
      text.hidden = false;
      loader.hidden = true;
    }
  });
});
