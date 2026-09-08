# Disaster Recovery Runbook

## RPO & RTO Objectives
- **RPO (Recovery Point Objective)**: Max 1 hour data loss.
- **RTO (Recovery Time Objective)**: Max 30 minutes service downtime.

## Recovery Procedures
1. **Database Restore Procedure**:
   ```bash
   pg_restore -U postgres -d nabha_telemedicine -v /backups/nabha_latest.dump
   ```
2. **WAN Outage Resilience**: Devices continue recording vitals and patient registrations in local IndexedDB. Automatic sync resumes when WAN reconnects.
