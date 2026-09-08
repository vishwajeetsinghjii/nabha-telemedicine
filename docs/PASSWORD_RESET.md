# Password Reset Configuration

The login flow now includes a real password-recovery flow:

1. User selects **Forgot password?** and submits a registered email address.
2. The backend creates a single-use, hashed reset token with a short expiry.
3. The reset link is delivered through the configured email provider.
4. The reset page validates the token and changes the password.
5. All active refresh tokens for the account are revoked after a successful reset.

## Email provider

The production implementation supports the Resend HTTP API without adding an SMTP library to the backend image.

Set these values in the deployment environment (not in source control):

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=<secret>
EMAIL_FROM=Nabha Telemedicine <no-reply@your-verified-domain.example>
FRONTEND_BASE_URL=https://your-frontend-domain.example
PASSWORD_RESET_EXPIRES_MINUTES=30
```

For local development only, you can use:

```env
EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=
ALLOW_PASSWORD_RESET_LOG=true
FRONTEND_BASE_URL=http://localhost:8000
```

When `ALLOW_PASSWORD_RESET_LOG=true` and `NODE_ENV` is not `production`, the backend prints the reset URL to its logs instead of sending an email. Never enable this in production.

## Security behavior

- Unknown email addresses receive the same generic response as known addresses.
- Reset tokens are stored only as SHA-256 hashes.
- Tokens expire automatically and can be used only once.
- Request and reset endpoints are rate-limited by the authentication limiter.
- A successful reset revokes all active refresh tokens for the account.
- Passwords must be 8–128 characters and contain uppercase, lowercase, a number, and a special character.
