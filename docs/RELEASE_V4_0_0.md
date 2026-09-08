# Nabha Telemedicine 4.0.1

## Delivered
- Admin verification queue with role/status/search/sort/pagination
- Private doctor document viewer with authorization, no-store response headers, file-size and magic-signature validation
- Immutable verification review history
- Verification audit events correlated with request IDs
- Approval/rejection in one database transaction
- In-app and email verification decisions
- Doctor verification status, specialization, qualification and experience
- Patient live specialist availability
- Appointment and consultation notification/audit hooks
- Dashboard timeout/retry handling and responsive states
- Patient/doctor/ASHA/admin common shell and notification center
- Missing-ID guards for patient, appointment, consultation and document requests
- Production fail-closed AI behavior; development fallback only outside production
- Production fail-closed video; real Zoom Server-to-Server meeting creation supported
- Migration tracking with schema_migrations
- Database indexes for verification/audit/video workloads

## Required production configuration
1. Set `VIDEO_PROVIDER=zoom`, `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, and `ZOOM_CLIENT_SECRET` for Zoom Server-to-Server OAuth, or replace the provider with a properly packaged official Agora token service.
2. Configure `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY`, and `EMAIL_FROM` for verification notifications.
3. Configure private object storage before large-scale credential-document growth. The pilot currently stores verification documents in PostgreSQL with private admin-only access.
4. Use strong unique secrets for JWT, database and webhooks.

## Operations
- PostgreSQL backup scripts are included for Linux/macOS shell and PowerShell environments.
- Backend, AI service and frontend container health checks are configured.
- End-to-end smoke script no longer uses OTP/demo credentials.
