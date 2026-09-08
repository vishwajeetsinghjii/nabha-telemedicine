/**
 * End-to-End Master Acceptance Integration Test Suite - Nabha Telemedicine Backend
 * Verifies full clinical workflow (ASHA -> Patient -> Vitals -> Consultation -> AI Triage -> Doctor -> Rx -> Audit -> Sync Idempotency)
 */

const request = require('supertest');
const app = require('../src/app');

describe('SIH25018 Master Acceptance Clinical Workflow & Sync Test', () => {
  let ashaToken = '';
  let doctorToken = '';
  let patientId = '';
  let appointmentId = '';
  let consultationId = '';
  let prescriptionId = '';

  // 1. Authentication Tests
  describe('Phase 3: Authentication & Role Tokens', () => {
    it('ASHA Login via OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ mobile: '9876543211', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ASHA');
      ashaToken = res.body.data.accessToken;
    });

    it('Doctor Login via Password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ mobile: '9876543210', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('DOCTOR');
      doctorToken = res.body.data.accessToken;
    });
  });

  // 2. Patient Registration & Vitals
  describe('Phase 4: Patient Registration & Vitals Recording', () => {
    it('ASHA registers a rural patient', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          name: 'Ramesh Lal',
          age: 52,
          gender: 'Male',
          mobile: '9876549999',
          village: 'Nabha Rural',
          address: 'Main Bazaar, Nabha',
          emergencyContact: '9876540000',
          bloodGroup: 'B+'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      patientId = res.body.data.id;
    });

    it('ASHA records patient vitals', async () => {
      const res = await request(app)
        .post(`/api/v1/patients/${patientId}/vitals`)
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          temperature: '99.2°F',
          systolicBp: 135,
          diastolicBp: 88,
          heartRate: 82,
          spo2: 96,
          weight: '72 kg'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patientId).toBe(patientId);
    });
  });

  // 3. Appointments & Consultations
  describe('Phase 5: Appointment Booking & Consultation Lifecycle', () => {
    it('ASHA books a teleconsultation appointment', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          patientId,
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          consultationType: 'VIDEO'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      appointmentId = res.body.data.id;
    });

    it('ASHA initiates a clinical consultation', async () => {
      const res = await request(app)
        .post('/api/v1/consultations')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          patientId,
          appointmentId,
          symptoms: 'Patient reports high fever, persistent dry cough, and weakness'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      consultationId = res.body.data.id;
    });
  });

  // 4. AI Preliminary Triage Integration
  describe('Phase 7: AI Preliminary Triage', () => {
    it('Runs AI preliminary triage for consultation', async () => {
      const res = await request(app)
        .post('/api/v1/ai/triage')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          patientId,
          consultationId,
          symptoms: 'fever and persistent dry cough',
          vitals: { spo2: 96, temperature: 99.2 }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.disclaimer).toContain('AI-assisted preliminary triage');
      expect(res.body.data.assessment.riskLevel).toBeDefined();
    });
  });

  // 5. Doctor Actions & Prescriptions
  describe('Phase 10: Doctor Consultation Completion & Digital Rx', () => {
    it('Doctor starts consultation session', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/start`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('Doctor adds clinical note', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/notes`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ note: 'Bilateral lung sounds clear. Mild pharyngeal congestion.' });

      expect(res.status).toBe(201);
    });

    it('Doctor completes consultation with diagnosis', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          assessment: 'Mild Viral Upper Respiratory Tract Infection',
          treatment: 'Symptomatic management, hydration, oral analgesics'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('Doctor creates digital prescription', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId,
          consultationId,
          assessment: 'Mild Viral Upper Respiratory Tract Infection',
          instructions: 'Take medications strictly after meals',
          items: [
            { medicineName: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '3 Days', instructions: 'After meals' },
            { medicineName: 'Cetirizine 10mg', dosage: '1 Tablet', frequency: '0-0-1', duration: '5 Days', instructions: 'At bedtime' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.pdfPath).toBeDefined();
      prescriptionId = res.body.data.id;
    });
  });

  // 6. Offline Synchronization & Idempotency Testing
  describe('Phase 6: Offline Sync Push & Idempotency Enforcement', () => {
    const testOpId = `op-test-${Date.now()}`;

    it('Pushes offline created patient operation', async () => {
      const res = await request(app)
        .post('/api/v1/sync/push')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          operations: [
            {
              operationId: testOpId,
              entityType: 'PATIENT',
              entityId: `p-sync-${Date.now()}`,
              operationType: 'CREATE',
              payload: {
                name: 'Offline Synced Patient',
                age: 40,
                gender: 'Female',
                mobile: '9876500000',
                village: 'Nabha East'
              },
              clientCreatedAt: new Date().toISOString()
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.results[0].status).toBe('SYNCED');
    });

    it('Re-submits SAME operationId -> Enforces Idempotency (no duplicates)', async () => {
      const res = await request(app)
        .post('/api/v1/sync/push')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          operations: [
            {
              operationId: testOpId, // Exact same operation ID
              entityType: 'PATIENT',
              entityId: `p-sync-${Date.now()}`,
              operationType: 'CREATE',
              payload: { name: 'Offline Synced Patient' },
              clientCreatedAt: new Date().toISOString()
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.results[0].idempotent).toBe(true);
      expect(res.body.data.results[0].status).toBe('SYNCED');
    });
  });
});
