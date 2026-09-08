# Nabha Telemedicine — Remaining Phase Completion

This release completes the application hardening work that follows Phase 3.

## Included

- Public, unauthenticated AI symptom checker on the landing page.
- Public AI endpoint with input validation, rate limiting and a mandatory non-diagnostic disclaimer.
- AI service accepts age, gender and optional vitals.
- Emergency triage output is supported by the persistence schema.
- Multilingual landing experience for English, Hindi and Punjabi.
- i18n selector binding is event-based rather than dependent on inline handlers.
- No fictional IndexedDB patient/consultation/prescription seed data is created.
- Refresh-token persistence, rotation and revocation.
- User organization/health-center identifiers are persisted.
- Notification inbox API.
- Appointment conflict protection at the database level.
- Consultation UI no longer falls back to fictional patient/doctor identifiers.

## Public symptom checker

`POST /api/v1/ai/public-triage` is intentionally unauthenticated so a patient can use the checker before registration. It does not persist personally identifiable health data. It is rate limited and should remain behind HTTPS/WAF in production.

The checker is not a diagnosis and must not be presented as one. Emergency symptoms should be escalated to emergency services.

## Deployment

Run database migrations before starting application instances. Supply production secrets through the deployment environment. Configure a real AI provider/service, video provider, IVR provider, PostgreSQL, object storage and observability stack before production launch.
