/**
 * Appointment & Consultation Schemas - Nabha Telemedicine Backend
 */

const { z } = require('zod');

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().optional(),
  ashaId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'),
  consultationType: z.enum(['VIDEO', 'AUDIO', 'PHONE', 'IN_PERSON']).default('VIDEO'),
  status: z.enum(['SCHEDULED', 'WAITING']).optional()
});

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
});

const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().optional(),
  ashaId: z.string().optional(),
  appointmentId: z.string().optional(),
  symptoms: z.string().min(3, 'Symptoms description is required')
});

const consultationNoteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty')
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  createConsultationSchema,
  consultationNoteSchema
};
