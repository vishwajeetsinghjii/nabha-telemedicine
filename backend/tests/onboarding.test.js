const request = require('supertest');
const app = require('../src/app');

describe('Production User Onboarding & Privileged Role Governance', () => {
  let adminToken;
  let patientToken;
  let doctorApplicationId;

  beforeAll(async () => {
    // Obtain Admin token
    const adminRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ mobile: '9876543213', otp: '123456' });
    adminToken = adminRes.body.data.accessToken;

    // Obtain Patient token
    const patientRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ mobile: '9876543212', otp: '123456' });
    patientToken = patientRes.body.data.accessToken;
  });

  describe('1. Patient Self-Registration Workflow', () => {
    it('should register a new patient, auto-create profile and generate NAB-XXXXXX code', async () => {
      const mobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await request(app)
        .post('/api/v1/auth/register/patient')
        .send({
          name: 'Jaswinder Kaur',
          mobile,
          age: 29,
          gender: 'Female',
          village: 'Nabha Khurd',
          emergencyContact: 'Surjit Singh - 9876543299'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('PATIENT');
      expect(res.body.data.patient.id).toBeDefined();
      expect(res.body.data.patient.patientCode).toMatch(/^NAB-\d{6}$/);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });
  });

  describe('2. Doctor Application & Admin Approval Workflow', () => {
    it('should allow doctor application registration with PENDING status (no active permissions)', async () => {
      const mobile = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
      const licenseNumber = `PMC-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await request(app)
        .post('/api/v1/auth/register/doctor')
        .send({
          fullName: 'Dr. Manpreet Singh',
          mobile,
          email: 'manpreet@nabha-telemed.in',
          password: 'password123',
          qualification: 'MBBS, MD General Medicine',
          licenseNumber,
          specialization: 'General Medicine',
          experienceYears: 8
        });

      expect(res.statusCode).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      doctorApplicationId = res.body.data.applicationId;
    });

    it('should allow Admin to list doctor applications and approve doctor', async () => {
      // List applications
      const listRes = await request(app)
        .get('/api/v1/admin/doctor-applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.statusCode).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      // Approve doctor application
      if (doctorApplicationId) {
        const approveRes = await request(app)
          .post(`/api/v1/admin/doctor-applications/${doctorApplicationId}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ notes: 'Medical license PMC verified with Punjab Medical Council' });

        expect(approveRes.statusCode).toBe(200);
        expect(approveRes.body.success).toBe(true);
        expect(approveRes.body.data.accountStatus).toBe('ACTIVE');
      }
    });
  });

  describe('3. Admin ASHA Provisioning Workflow', () => {
    it('should allow Admin to provision ASHA account with health center scope', async () => {
      const mobile = `96${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await request(app)
        .post('/api/v1/admin/asha/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Kulwinder Kaur',
          mobile,
          email: 'kulwinder@nabha-telemed.in',
          healthCenterId: '11111111-1111-4111-a111-111111111111',
          village: 'Alhoran'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ASHA');
    });
  });

  describe('4. Anti-Escalation & Authorization Boundaries Security Tests', () => {
    it('should DENY Patient from accessing Admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should DENY Patient from calling ASHA provisioning (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/asha/invite')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ fullName: 'Hacker', mobile: '9999999999', healthCenterId: '11111111-1111-4111-a111-111111111111', village: 'Test' });

      expect(res.statusCode).toBe(403);
    });
  });
});
