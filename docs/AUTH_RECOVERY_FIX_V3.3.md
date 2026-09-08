# Authentication and password recovery fix — v3.3

- Explicitly exposes `window.CONFIG`, `window.api`, `window.AuthManager`, and `window.auth`.
- Adds cache-busting/no-store rules for authentication assets to prevent stale service-worker/browser files from producing `auth is not defined`.
- Forgot password accepts email or 10-digit mobile.
- Local development can return a reset URL when `ALLOW_PASSWORD_RESET_LOG=true`; production never returns the token.
- Production recovery requires a configured email recovery channel for email-based accounts. SMS delivery must be added before advertising mobile-only recovery in production.
- Set `NODE_ENV=development` for local Docker testing.

Created migration 008 to repair the existing patients_gender_check constraint and normalize legacy values.
