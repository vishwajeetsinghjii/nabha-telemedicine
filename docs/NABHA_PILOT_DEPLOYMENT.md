# Controlled Pilot Deployment Guide — Nabha, Punjab, India

## 1. Executive Summary & Pilot Scope
This runbook details the production deployment, infrastructure configuration, and operational procedures for conducting a controlled real-world pilot of the **Nabha Rural Telemedicine Platform** in Nabha Tehsil, Patiala District, Punjab, India.

---

## 2. Targeted Pilot Scope (Phase A)
- **Target Location**: Nabha Tehsil (Primary Health Center Nabha, Sub-Center Alhoran, Sub-Center Nabha Khurd).
- **Participants**:
  - 1–5 Primary Health Centers (PHC)
  - 10–50 ASHA field workers
  - 5–20 Duty Doctors
  - Thousands of patient records

---

## 3. Server & Infrastructure Sizing
- **API & Application Server**: 4 vCPU, 8 GB RAM, Ubuntu 22.04 LTS (Port 5000 Node API, Port 8001 Python AI Service).
- **PostgreSQL Database Server**: 4 vCPU, 16 GB RAM, 100 GB SSD (Port 5432).
- **Reverse Proxy & SSL**: NGINX / Caddy with Let's Encrypt TLS 1.3 certificate.

---

## 4. Database Setup & Migrations
```bash
# Run schema migrations
cd backend
npm run db:migrate

# Seed demo & baseline reference data
npm run db:seed
```

---

## 5. Automated Backup & Recovery Strategy (RPO / RTO)
- **Recovery Point Objective (RPO)**: <= 1 Hour (Automated Hourly PostgreSQL WAL Archiving).
- **Recovery Time Objective (RTO)**: <= 30 Minutes (Automated Standby Restore Script).
- **Daily Full Backup Script**:
  ```bash
  pg_dump -U postgres -d nabha_telemedicine -F c -b -v -f /backups/nabha_$(date +%Y%m%d_%H%M%S).dump
  ```

---

## 6. Pilot Rollout & Onboarding Schedule
1. **Week 1**: Internal technical staging & load test verification.
2. **Week 2**: Health worker (ASHA) training at PHC Nabha.
3. **Week 3**: Controlled rollout in 3 target villages (Nabha Khurd, Alhoran, Rohti Chhanna).
4. **Week 4**: Nabha Tehsil expansion.
