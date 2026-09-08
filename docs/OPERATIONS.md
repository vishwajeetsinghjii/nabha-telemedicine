# Operations & Administration Runbook

## Routine Operations
1. **Service Restart**:
   ```bash
   docker compose restart backend ai-service
   ```
2. **Database Migration Verification**:
   ```bash
   cd backend && npm run db:migrate
   ```
3. **Audit Trail Review**: Inspect `/api/v1/admin/audit-logs` for compliance verification.
