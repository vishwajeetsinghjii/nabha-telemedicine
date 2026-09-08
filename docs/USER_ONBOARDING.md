# Production User Onboarding & Role Governance Specification
## SIH25018 Nabha Telemedicine Platform

---

## 1. Overview & Security Principles

This document specifies the production onboarding procedures, account lifecycle transitions, administrative approval workflows, and backend security controls for the **Nabha Rural Telemedicine Platform**.

### Core Governance Principles:
1. **Least Privilege**: Deny by default; roles grant explicitly enumerated resource permissions.
2. **Anti-Self-Promotion**: Client-supplied role attributes are strictly ignored during public registration.
3. **No Unrestricted Privileged Registration**: `DOCTOR`, `ASHA`, and `ADMIN` accounts cannot self-register with immediate active privileges.
4. **Audit Trail Accountability**: Administrative approvals, rejections, invitations, and status changes are permanently recorded in `audit_logs`.

---

## 2. Role Onboarding Matrix

| Role | Public Self-Registration | Default Initial Status | Active Permissions Granted | Onboarding Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **PATIENT** | **YES** | `ACTIVE` | Immediately upon OTP verification | `POST /api/v1/auth/register/patient` |
| **DOCTOR** | **YES (Application)** | `PENDING` | **NO** (Requires explicit Admin Approval) | `POST /api/v1/auth/register/doctor` |
| **ASHA** | **NO** | `ACTIVE` | Restricted to assigned Health Center | Admin Invitation: `POST /api/v1/admin/asha/invite` |
| **ADMIN** | **NO** | `ACTIVE` | System-wide Operational Access | Secure Deployment Provisioning / CLI script |

---

## 3. Account Lifecycle State Machine

```text
                      DOCTOR APPLICATION
                               │
                               ▼
                            PENDING
                               │
                        UNDER_REVIEW
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
              APPROVED                    REJECTED
           (Status: ACTIVE)
                 │
           ┌─────┴─────┐
           ▼           ▼
       SUSPENDED   DEACTIVATED
```

### Supported States:
- `PENDING`: Application registered, pending credential and medical license verification.
- `UNDER_REVIEW`: Application opened and undergoing administrative check.
- `ACTIVE`: Fully verified and authorized to perform role operations.
- `SUSPENDED`: Temporarily restricted from logging in or performing actions.
- `REJECTED`: Application denied due to invalid or unverified credentials.
- `DEACTIVATED`: Account closed by administrator.

---

## 4. Onboarding Workflows

### A. Patient Self-Registration Workflow
```text
Patient Registration Form (PWA)
       │
       ▼
POST /api/v1/auth/register/patient
       │
       ├─► User account created (Role: PATIENT)
       ├─► Patient profile created
       ├─► Human-friendly ID generated (NAB-XXXXXX)
       └─► JWT Access & Refresh Tokens issued
```

### B. Doctor Application & Review Workflow
```text
Doctor Application Form (PWA)
       │
       ▼
POST /api/v1/auth/register/doctor
       │
       ▼
Status: PENDING (No doctor permissions)
       │
       ▼
Admin Reviews Application (Admin Portal)
GET /api/v1/admin/doctor-applications
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
POST /.../approve                 POST /.../reject
       │                                 │
Role upgraded to DOCTOR           Status: REJECTED
Account status: ACTIVE            Audit log recorded
Audit log recorded
```

### C. ASHA Account Provisioning
```text
Admin Portal (ASHA Invitation Modal)
       │
       ▼
POST /api/v1/admin/asha/invite
       │
       ├─► User created (Role: ASHA, Status: ACTIVE)
       ├─► Assigned to Health Center ID & Village
       └─► Audit record logged with Admin ID & timestamp
```

---

## 5. Security Model & Privilege Escalation Protections

- **Server-Side Enforcement**: Backend controllers validate access using `requireRole('ADMIN')` and `requireAuth`.
- **Role Parameter Sanitization**: Input parameters specifying `role: "ADMIN"` in public registration payloads are discarded. Roles are assigned strictly by backend logic.
- **Horizontal & Vertical Isolation**: Users cannot modify other users' roles or access records outside assigned health center scopes.

---

## 6. Demo Accounts (For Staging & Evaluation)

| Role | Mobile | Password / OTP | Default Status |
| :--- | :--- | :--- | :--- |
| **Administrator** | `9876543213` | `[removed demo password]` / `[removed demo OTP/password]` | `ACTIVE` |
| **Doctor** | `9876543210` | `[removed demo password]` / `[removed demo OTP/password]` | `ACTIVE` |
| **ASHA Worker** | `9876543211` | `[removed demo OTP/password]` | `ACTIVE` |
| **Patient** | `9876543212` | `[removed demo OTP/password]` | `ACTIVE` |
