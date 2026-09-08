# SIH25018 Nabha Telemedicine — Database Schema Documentation

## Database Engine
- **Engine**: PostgreSQL 15+
- **Primary Key Strategy**: UUID v4 (`uuid-ossp`)

## Core Tables Summary
1. `users`: Auth accounts, mobile numbers, bcrypt hashes, roles (`PATIENT`, `DOCTOR`, `ASHA`, `ADMIN`).
2. `patients`: Demographic information, village, emergency contacts, medical history.
3. `patient_vitals`: Temperature, BP, HR, SpO2, weight, respiratory rate.
4. `appointments`: Scheduled tele-health consultations.
5. `consultations`: Clinical consultation lifecycle (`SCHEDULED`, `WAITING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
6. `consultation_notes`: Chronological clinical notes.
7. `prescriptions` & `prescription_items`: Medication items and PDF storage paths.
8. `sync_operations`: Transaction-safe offline synchronization log with `operation_id` uniqueness.
9. `ai_triage_results`: AI preliminary triage assessments and risk scores.
10. `video_sessions`: Consultation room tokens.
11. `ivr_events`: Telephony webhook log.
12. `audit_logs`: Operational security audit records.
13. `refresh_tokens`: Session refresh tokens.
