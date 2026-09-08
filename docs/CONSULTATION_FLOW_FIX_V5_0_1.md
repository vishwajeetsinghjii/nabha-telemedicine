# Consultation Flow Fix — v5.0.1

## Fixes included

1. **Assigned doctor patient access**
   - A doctor assigned by the administrator to a consultation request can now access the exact patient's record through the related appointment, consultation, or consultation request.
   - This preserves the existing health-centre operational scope for doctors who are not assigned to a specific patient.

2. **Admin patient profile loading**
   - `patient-profile.html` now accepts both `patientId` and legacy `id` query parameters.
   - This fixes dashboard links that open `patient-profile.html?patientId=...` and prevents the page from silently falling back to the administrator's dashboard profile.
   - Patient loading failures are now displayed instead of leaving an indefinite "Loading patient..." state.

3. **Admin doctor assignment transaction**
   - Fixed appointment handling after creation: the appointment repository returns the created appointment directly, so notification/audit data now uses `a.id` rather than the invalid `a.rows[0].id`.
   - This prevents the assignment transaction from rolling back after the appointment has been created.

## Intended end-to-end flow

Patient registers → patient submits consultation request → admin receives request → admin assigns an approved active doctor → doctor and patient are notified → doctor reviews and accepts → patient sees waiting state → doctor starts consultation → consultation record is created and video session is provisioned → doctor records clinical notes/assessment/treatment → doctor completes consultation → appointment/request are completed → patient is notified → patient can view released clinical notes and assessment/treatment from the dashboard.

## Local verification

After replacing the deployment files, rebuild/restart the Docker stack and hard-refresh the browser. The database migration state does not need a new migration for these code/UI fixes.
