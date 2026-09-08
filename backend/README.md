# Nabha Rural Telemedicine Platform — Backend (SIH25018)

A production-grade, modular, offline-first Node.js/Express backend built for rural telemedicine delivery in India.

---

## Architecture & Layered Design

```text
Request → Route → Middleware → Controller → Service → Repository → PostgreSQL
```

- **Runtime**: Node.js v18+ & Express.js
- **Database**: PostgreSQL (native `pg` pool with parameterized SQL)
- **Security**: Helmet headers, CORS policy, rate limiting, request context correlation (`X-Request-ID`), centralized error handler.
- **API Versioning**: All business APIs route under `/api/v1/`.

---

## Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── env.js              # Environment startup validation
│   │   └── database.js         # PostgreSQL pg.Pool connection pool
│   │
│   ├── middleware/
│   │   ├── requestId.middleware.js  # X-Request-ID header generator
│   │   ├── error.middleware.js      # Centralized error handler
│   │   └── rateLimit.middleware.js  # Security rate limiting
│   │
│   ├── utils/
│   │   ├── logger.js           # Winston structured logger
│   │   ├── errors.js           # Standardized AppError hierarchy
│   │   └── response.js         # API response formatters
│   │
│   ├── app.js                  # Express app setup, CORS, /health
│   └── server.js               # HTTP listener & SIGTERM/SIGINT graceful shutdown
│
├── tests/
│   └── health.test.js          # Supertest integration test suite
│
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd d:/nabha-telemedicine/backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Automated Tests
```bash
npm test
```

---

## Diagnostic Health Endpoint

```http
GET /health
```

### Healthy Response (200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "environment": "development",
  "timestamp": "2026-08-31T16:00:00.000Z"
}
```
