/**
 * Prescription Schemas - Nabha Telemedicine Backend
 */

const { z } = require('zod');

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional()
});

const createPrescriptionSchema = z.object({
  consultationId: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  assessment: z.string().min(3, 'Assessment diagnosis is required'),
  instructions: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required')
});

module.exports = {
  createPrescriptionSchema,
  prescriptionItemSchema
};
