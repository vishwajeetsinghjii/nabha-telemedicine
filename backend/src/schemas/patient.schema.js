/**
 * Patient & Vitals Schemas - Nabha Telemedicine Backend
 * Zod validation schemas with range checking
 */

const { z } = require('zod');

const createPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  age: z.number().min(0).max(120, 'Age must be between 0 and 120'),
  gender: z.enum(['Female', 'Male', 'Other']),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a 10-digit number'),
  village: z.string().min(2, 'Village is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  existingConditions: z.string().optional(),
  medicalHistory: z.string().optional()
});

const updatePatientSchema = createPatientSchema.partial();

const recordVitalsSchema = z.object({
  temperature: z.string().optional(),
  systolicBp: z.number().min(40).max(300, 'Systolic BP must be between 40 and 300 mmHg').optional(),
  diastolicBp: z.number().min(20).max(200, 'Diastolic BP must be between 20 and 200 mmHg').optional(),
  heartRate: z.number().min(30).max(220, 'Heart rate must be between 30 and 220 bpm').optional(),
  spo2: z.number().min(50).max(100, 'SpO2 must be between 50% and 100%').optional(),
  weight: z.string().optional(),
  respiratoryRate: z.number().min(5).max(60).optional()
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  recordVitalsSchema
};
