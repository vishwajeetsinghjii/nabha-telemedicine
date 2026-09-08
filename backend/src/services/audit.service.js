/**
 * Audit Service - Nabha Telemedicine Backend
 */

const auditRepository = require('../repositories/audit.repository');
const patientRepository = require('../repositories/patient.repository');
const consultationRepository = require('../repositories/consultation.repository');
const appointmentRepository = require('../repositories/appointment.repository');
const syncRepository = require('../repositories/sync.repository');

class AuditService {
  async logEvent(action, resourceType, resourceId, userId, requestId, metadata) {
    return auditRepository.log(action, resourceType, resourceId, userId, requestId, metadata);
  }

  async getAuditLogs(limit, offset) {
    return auditRepository.findAll(limit, offset);
  }

  async getAdminDistrictMetrics() {
    const patients = await patientRepository.findAll(1, 0);
    const consultations = await consultationRepository.findAll(1, 0);
    const appointments = await appointmentRepository.findAll(1, 0);
    const syncStatus = await syncRepository.getSyncStatus();

    return {
      overview: {
        totalPatientsRegistered: patients.total || 0,
        activeConsultationsToday: consultations.total || 0,
        upcomingAppointments: appointments.total || 0,
        healthCentersActive: 12,
        activeAshaWorkers: 0
      },
      offlineSyncMetrics: syncStatus,
      systemHealth: 'OPERATIONAL'
    };
  }
}

module.exports = new AuditService();
