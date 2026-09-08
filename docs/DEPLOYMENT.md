# SIH25018 Nabha Telemedicine — Production Deployment Specification

## Multi-Container Docker Stack (`docker-compose.yml`)

```bash
docker compose up --build -d
```

### Stack Components:
- **`postgres`**: PostgreSQL 15 database container on port 5432.
- **`backend`**: Node.js REST API container on port 5000.
- **`ai-service`**: Python FastAPI microservice on port 8001.

## Single Laptop Local Standalone Execution (SIH Demo Mode)
1. Frontend static server: `http://localhost:8000`
2. Node backend REST API: `http://localhost:5000`
3. Python FastAPI AI service: `http://localhost:8001`

## Phase-complete deployment additions

The repository now includes a production static frontend container (`frontend/Dockerfile`) and explicit AI-service CORS configuration. Run `database/migrations` before starting the backend, provide secrets through the deployment environment, and expose services through a TLS reverse proxy/WAF.
