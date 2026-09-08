# SIH25018 Nabha Telemedicine — System Architecture

```text
                                USER
                                 │
                                 ▼
                         FRONTEND / PWA
                    (HTML5 / CSS3 / Vanilla JS)
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                  ONLINE                  OFFLINE
                     │                       │
                     ▼                       ▼
               NODE / EXPRESS            IndexedDB
            (Port 5000 REST API)             │
                     │                  Sync Queue
                     │                       │
                     └───────────┬───────────┘
                                 │
                                 ▼
                            PostgreSQL
                       (Database Engine)
                                 │
                     ┌───────────┼────────────┐
                     │           │            │
                     ▼           ▼            ▼
                 Python       Video         IVR
                FastAPI      Provider     Provider
             (Port 8001 AI)  (Mock/Agora) (Mock/Exotel)
```

## Layered Design & Communication
- **Frontend PWA**: Serves shell statically on port 8000, caches static shell using Service Worker.
- **Backend Core**: Express application on port 5000 managing auth, RBAC, CRUD repositories, PDF storage, and sync idempotency.
- **AI Microservice**: Python FastAPI app on port 8001 evaluating triage requests.
- **Database Layer**: PostgreSQL database persisting 14 core schemas.
