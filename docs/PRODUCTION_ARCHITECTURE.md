# Production Architecture Specification

## Monorepo Microservices & Component Layout

```text
               PUBLIC CLIENTS (ASHA / Doctor / Patient / Admin)
                                     │
                                     ▼
                          NGINX Reverse Proxy / CDN
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       Frontend PWA Shell                      Node.js REST API
      http://localhost:8000                  http://localhost:5000
                                                         │
                                     ┌───────────────────┼───────────────────┐
                                     ▼                   ▼                   ▼
                                PostgreSQL          FastAPI AI            Worker
                              (Port 5432)          (Port 8001)        (Async Queue)
```

## Scale & Resilience
- **Stateless API Tier**: Express API nodes can be horizontally scaled behind an NGINX load balancer.
- **Circuit Breaker & Fallback**: External dependencies (AI service, video providers, IVR provider) use graceful fallback logic so WAN timeouts never crash clinical operations.
