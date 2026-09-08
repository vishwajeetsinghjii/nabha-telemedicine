# Local testing without Docker

This project can run directly on Windows for development.

## 1. PostgreSQL

Create a PostgreSQL database and application user:

```sql
CREATE USER nabha_app WITH PASSWORD 'CHANGE_ME_LONG_RANDOM_PASSWORD';
CREATE DATABASE nabha_telemedicine OWNER nabha_app;
```

## 2. Backend environment

Copy `backend/.env.example` to `backend/.env` and replace the placeholder secrets.

The backend uses PostgreSQL at `localhost:5432`, listens on `localhost:5000`, and connects to the AI service at `localhost:8001`.

## 3. Start backend

```powershell
cd backend
npm install
npm run db:migrate
npm start
```

## 4. Start AI service

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## 5. Start frontend

```powershell
cd frontend
python -m http.server 8000
```

Open `http://localhost:8000`.

The frontend automatically uses `http://localhost:5000/api/v1` when served on port 8000, so no reverse proxy is required for local development.

Backend health: `http://localhost:5000/health`
AI health: `http://localhost:8001/health`

## Development admin

Set `SEED_PASSWORD` in `backend/.env`, then run:

```powershell
npm run db:seed
```

The development admin account uses mobile `9000000001` and email `dev-admin@localhost`.

Never use development secrets or the seeded development admin credentials in production.
