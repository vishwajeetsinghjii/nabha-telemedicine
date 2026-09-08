# UI & Consultation fixes — v3.8

- Dashboard styling is included in both `role-dashboard.css` and the shared `dashboard.css` fallback.
- Dashboard and consultation CSS/JS use explicit 3.8 cache-busting.
- Service worker fetch fallback always returns a `Response`, preventing `Failed to convert value to 'Response'`.
- Consultation keeps the application shell/sidebar.
- Consultation starts in specialist selection unless `patientId` and `appointmentId` are present.
- No hard-coded clinical notes, diagnosis, medicines, symptoms, or triage are used in the consultation workspace.
- Patient details are displayed and must be explicitly confirmed before connecting/booking.
- Specialists are database-backed; live doctors show Connect now, unavailable doctors show Book consultation.
- Production video/audio still requires a configured real media provider.
