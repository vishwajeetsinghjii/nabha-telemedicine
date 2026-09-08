# SIH25018 Nabha Telemedicine — API Documentation Specification

All business endpoints are versioned under `/api/v1/`.

## Endpoints Overview

### Auth (`/api/v1/auth`)
- `POST /request-otp`: Password-based login using mobile/email identifier.
- `POST /verify-otp`: Verify OTP and issue JWT access & refresh tokens.
- `POST /login`: Credential login.
- `POST /refresh`: Refresh session token.
- `POST /logout`: Terminate session.

### Patients (`/api/v1/patients`)
- `POST /`: Register patient.
- `GET /`: Get paginated patient list.
- `GET /:id`: Get patient profile.
- `PUT /:id`: Update patient profile.
- `POST /:id/vitals`: Record vitals.
- `GET /:id/vitals`: Get vitals history.
- `GET /:id/history`: Get full medical history.

### Offline Sync (`/api/v1/sync`)
- `POST /push`: Push client IndexedDB operations.
- `POST /pull`: Pull server changes since `lastSyncAt`.
- `GET /status`: Get synchronization metrics.

### AI Triage (`/api/v1/ai`)
- `POST /triage`: Evaluate symptoms and vitals.

### Interactive Swagger Docs
Access interactive API documentation at:
`http://localhost:5000/api-docs`
