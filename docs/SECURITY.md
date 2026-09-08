# SIH25018 Nabha Telemedicine — Security Specification

## Security Hardening Controls
1. **Transport & Headers**: Helmet HTTP security headers, CORS origin enforcement.
2. **Brute-Force Rate Limiting**: `express-rate-limit` on auth routes (20 req / 15 mins) and API routes (300 req / 15 mins).
3. **Database Protection**: Parameterized SQL queries preventing SQL injection.
4. **Audit Trail**: Operational audit log recording auth and medical data access (`audit_logs`).
5. **Data Privacy**: No medical records or passwords stored in JWT claims or URL parameters.
