# Phase 3 Implementation

This release converts the core application layer from prototype/demo behavior to database-backed role workspaces.

## Included

- Password login using mobile number or email as the identifier.
- Backend-derived role; there is no role selector during login.
- Patient accounts activate immediately after registration.
- ASHA and Doctor accounts remain pending until administrative approval.
- PostgreSQL-only core patient, appointment, vital, consultation and prescription repositories.
- Patient ownership checks for patient accounts.
- Health-center assignment checks for ASHA and Doctor operational access.
- Role-specific live dashboards backed by `GET /api/v1/dashboard`.
- Removal of frontend mock API/demo login assets.
- Canonical database migrations under `database/migrations/`, including migration 005 for Phase 3 indexes and operational security fields.
- Production compose configuration with secrets supplied through environment variables rather than committed credentials.

## API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register/patient`
- `POST /api/v1/auth/register/asha`
- `POST /api/v1/auth/register/doctor`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard`
- Existing patient, appointment, consultation, vitals and prescription APIs are now database-backed and authorization-aware.

## Deployment requirements

Set real values for PostgreSQL credentials, JWT secrets, IVR webhook secret, CORS origin and external provider credentials. Do not copy demo credentials into production.

The production compose file intentionally does not expose PostgreSQL or the backend directly. Put the services behind a TLS reverse proxy/API gateway and serve the frontend from the same public origin or configure an explicit production CORS allow-list.
