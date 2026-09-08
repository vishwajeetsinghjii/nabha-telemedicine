# Observability & Monitoring Specification

## Operational Health Endpoints
- **Backend Health Check**: `http://localhost:5000/health` (Database status, environment)
- **AI Microservice Health Check**: `http://localhost:8001/health` (FastAPI status)

## Core Metrics Monitored
1. **API Response Latency**: Target p95 < 200ms.
2. **Offline Sync Backlog**: Count of pending sync operations in `sync_operations`.
3. **AI Triage Request Volume**: Distribution of LOW, MODERATE, HIGH, and EMERGENCY triage assessments.
