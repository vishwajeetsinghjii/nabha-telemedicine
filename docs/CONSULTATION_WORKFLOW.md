# Admin-Mediated Consultation Workflow

## Production workflow

1. **Patient registers and logs in** with mobile/email + password. No doctor directory is shown to patients.
2. **Patient requests consultation** from `consultation.html`, confirms their patient details, enters symptoms, preferred language and urgency.
3. **Admin is notified** and the request appears in the Admin Dashboard consultation-request queue.
4. **Admin assigns an approved active doctor**. The assignment is recorded transactionally, an appointment is created, and both doctor and patient are notified.
5. **Doctor reviews and accepts** the assigned appointment. The request becomes `ACCEPTED`, the appointment becomes `WAITING`, and the patient is notified.
6. **Doctor starts the consultation**. The consultation record is created automatically and linked to the request/appointment in one transaction. The request and appointment become `IN_PROGRESS`.
7. **Clinical conversation and documentation** happen in the doctor workspace. Only the assigned doctor can add clinical notes.
8. **Doctor completes the consultation** with clinical notes, assessment and treatment/advice. Completion updates consultation, appointment and request atomically and notifies the patient.
9. **Patient receives the released clinical record**. Clinical notes, assessment and treatment are visible to the patient only after the consultation is `COMPLETED`.
10. **Video** is created only after the doctor starts the consultation. Patients can retrieve the active room but cannot create one. Configure a real provider such as Zoom for production.

## State machine

`REQUESTED -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED`

Cancellation is available to authorized staff before completion. Direct patient appointment creation and direct patient doctor selection are not part of this workflow.
