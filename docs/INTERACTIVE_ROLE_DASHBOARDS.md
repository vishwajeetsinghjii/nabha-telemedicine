# Interactive Role Dashboards

Version 3.1 introduces a unified interactive dashboard experience for PATIENT, ASHA, DOCTOR and ADMIN.

## Design principles

- One visual system and one interaction model across all roles.
- Role-specific information and actions are rendered from the authenticated server-side role.
- Dashboard metrics and lists use live API/database data; no fictional patient, doctor, appointment or prescription records are rendered by the dashboard.
- Patient and professional records are opened in contextual drawers instead of forcing unnecessary page navigation.
- Notifications, account profile, refresh, network state and responsive navigation use the common application shell.
- ASHA and operational workflows expose synchronization state and preserve the existing offline-first architecture.
- Doctor queues are ordered by the latest persisted AI triage risk, while explicitly treating triage as decision support rather than a diagnosis.
- Admin approval actions call the protected admin API and refresh the dashboard after success.

## Dashboard data contract

`GET /api/v1/dashboard` now returns role-specific data:

- PATIENT: profile, KPI counts, upcoming appointments, recent consultations, recent prescriptions, latest vitals and a small vitals history for trend visualization.
- ASHA: scoped patient list, today's assigned appointments and synchronization totals.
- DOCTOR: today's prioritized queue with latest vitals/triage, KPI counts and recent consultations.
- ADMIN: platform KPI counts, pending doctor/ASHA applications, recent users and recent audit activity.

The backend continues to apply the authenticated user's role and operational scope when constructing these datasets.

## Frontend entry points

All four role pages use the same shell and `frontend/js/role-dashboard.js` renderer:

- `frontend/patient-dashboard.html`
- `frontend/asha-dashboard.html`
- `frontend/doctor-dashboard.html`
- `frontend/admin-dashboard.html`
- `frontend/js/role-dashboard.js`
- `frontend/css/role-dashboard.css`

The service-worker cache was bumped to v6 so deployed clients receive the new dashboard assets.

## Important production note

The dashboard UI does not replace clinical authorization, backend access control, audit logging or data governance. Those controls remain server-side and must be maintained independently of the browser.
