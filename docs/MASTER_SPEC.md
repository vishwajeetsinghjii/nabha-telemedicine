# SIH25018 Nabha Rural Telemedicine Platform — Master Specification

## Executive Overview
The **Nabha Rural Telemedicine Platform** is an offline-first, low-bandwidth PWA and microservices architecture designed to bridge healthcare access in rural India (SIH Problem Statement SIH25018 / Nabha Project).

---

## System Capabilities
1. **Offline-First Patient Care**: ASHA health workers register patients, record vitals, and initiate consultations offline via IndexedDB.
2. **Idempotent Synchronization Engine**: Automatic push sync with transaction-safe `operationId` deduplication.
3. **AI Preliminary Triage Microservice**: Python FastAPI explainable clinical rule engine categorizing risk (`LOW`, `MODERATE`, `HIGH`, `EMERGENCY`).
4. **Multi-Role Portals**: Customized UX for Patients, ASHAs, Doctors, and Administrators.
5. **Low-Bandwidth Teleconsultation**: Video, audio fallback, and Exotel IVR phone integration.
6. **Digital Prescriptions**: Server-side PDF summary generator.
