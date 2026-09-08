/**
 * Onboarding Validation Schemas - Nabha Telemedicine Backend
 */

const { z } = require('zod');

const registerPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  age: z.number().int().positive('Age must be a positive integer'),
  gender: z.enum(['Male', 'Female', 'Other']),
  village: z.string().min(2, 'Village is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  existingConditions: z.string().optional(),
  medicalHistory: z.string().optional()
});

const applyDoctorSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  qualification: z.string().min(2, 'Medical qualification required (e.g. MBBS, MD)'),
  licenseNumber: z.string().min(3, 'Medical License / Registration Number required'),
  specialization: z.string().min(2, 'Specialization required (e.g. General Medicine, Pediatrics)'),
  experienceYears: z.number().int().nonnegative('Years of experience must be 0 or greater'),
  preferredCenterId: z.string().uuid().optional()
});

const inviteAshaSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().email('Valid email required').optional(),
  healthCenterId: z.string().uuid('Valid Health Center ID required'),
  village: z.string().min(2, 'Assigned village is required')
});

const reviewDoctorSchema = z.object({
  notes: z.string().optional()
});

module.exports = {
  registerPatientSchema,
  applyDoctorSchema,
  inviteAshaSchema,
  reviewDoctorSchema
};
