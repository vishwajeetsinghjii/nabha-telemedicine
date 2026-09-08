# SIH25018 Nabha Telemedicine — Offline Synchronization Architecture

## Offline Architecture & Sync Lifecycle
1. **Client Persistence**: Operations performed offline are written to IndexedDB store `syncQueue`.
2. **Connectivity Monitoring**: Monitored via browser events and backend `/health` pings.
3. **Push Sync Engine**: On reconnection, `sync.js` posts operations to `/api/v1/sync/push`.
4. **Idempotency Guarantee**: Each operation carries a unique `operationId`. The backend uses PostgreSQL unique constraints to reject duplicates, returning `{ idempotent: true, status: 'SYNCED' }`.
5. **Conflict Resolution**: Detected using optimistic locking (`updated_at` / `version`).
