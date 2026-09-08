# Consultation Flow Fix v5.0.3

## Root cause
Doctor patient-record access queried `consultation_requests.doctor_id`, but the canonical schema column is `assigned_doctor_id`.

## Fix
The doctor scope check now uses `consultation_requests.assigned_doctor_id`, matching migration 015 and the consultation request repository.

## Expected behavior
An assigned doctor can open the patient record associated with their appointment/request/consultation without being permanently assigned to the patient health centre.
