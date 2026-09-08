# SIH25018 Nabha Telemedicine — Authentication & RBAC Specification

## JWT Architecture
- **Access Tokens**: Short-lived (15 minutes), signed with `JWT_SECRET`. Contains `sub` (User ID), `role`, and `mobile`.
- **Refresh Tokens**: Long-lived (7 days), signed with `REFRESH_TOKEN_SECRET`.

## Server-Side Role Permissions (RBAC)
- **PATIENT**: Access own profile, vitals, consultations, and prescriptions.
- **ASHA**: Register patients, record vitals, request teleconsultations, push offline sync queue.
- **DOCTOR**: Conduct teleconsultations, write notes, complete consultations, issue prescriptions.
- **ADMIN**: Access district statistics, monitor sync health, view audit logs.
