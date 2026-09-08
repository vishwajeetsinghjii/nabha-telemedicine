# Consultation and Specialist Flow

The consultation page now has two explicit modes.

## Patient / booking mode
- Select patient record.
- Describe reason for consultation.
- Browse specialty categories.
- Specialist cards are backed by active approved doctor accounts.
- Online doctors can receive a live connection request.
- Offline doctors offer future appointment booking.

## Workspace mode
The clinical workspace opens only with a real `appointmentId` and `patientId`.
It does not contain seeded symptoms, diagnosis, medication, or clinical notes.
Patients see a waiting room and patient summary.
Doctors/admins can enter assessment and treatment and complete the consultation.

## Presence
Active doctors publish ONLINE/AWAY presence from the doctor dashboard using a database-backed `doctor_presence` table. Stale presence is treated as offline.

## Media
The workspace is intentionally explicit that actual audio/video requires a configured production media provider. The UI does not claim that a video call is connected when a provider is not configured.
