# Nabha Rural Telemedicine Platform (SIH25018)

A high-performance, offline-first, progressive web application (PWA) designed for low-bandwidth rural telemedicine delivery in India. Built for field ASHA health workers, rural patients, specialist doctors, and health mission administrators.

---

## Key Features

- ⚡ **Zero External Heavy Framework Dependencies**: Built purely with HTML5, CSS3, and modular Vanilla JavaScript.
- 📱 **Mobile-First & Touch-Optimized**: Designed for low-cost Android smartphones, field tablets, and desktops (320px to 1280px+).
- 📶 **Offline-First & Low-Bandwidth**: Complete local functionality using IndexedDB and Service Worker shell caching with a background Sync Engine.
- 🌐 **Multilingual Support (i18n)**: Instant switching between **English**, **Hindi (हिंदी)**, and **Punjabi (ਪੰਜਾਬੀ)**.
- ♿ **Low-Literacy & Accessible UX**: High contrast, large touch targets (≥48px), screen reader support, reduced motion compliance, and icon-assisted action tiles.
- 🔐 **Real Authentication & Role Routing**: Role-aware navigation and dashboard routing for Patient, ASHA Worker, Doctor, and Admin accounts.

---

## Directory Architecture

```text
frontend/
├── index.html                  # Lightweight landing page with value checklist & production entry points
├── login.html                  # Mobile number input + mobile/email + password login
├── dashboard.html              # Dynamic role-based dispatcher
├── patient-dashboard.html      # Patient portal (consultations, prescriptions, appointments)
├── asha-dashboard.html         # ASHA field worker portal (patient registration, vitals, sync)
├── doctor-dashboard.html       # Doctor console (waiting patient queue, triage levels)
├── admin-dashboard.html        # Health Mission admin portal (KPI stats & CSS progress bars)
├── emergency.html              # Emergency help screen (108 Helpline, Ambulance 102, PHC)
├── offline.html                # Offline fallback screen
├── manifest.json               # Web App Manifest for PWA installation
├── service-worker.js           # Service Worker caching application shell and static assets
│
├── css/
│   ├── reset.css               # Modern CSS reset
│   ├── variables.css           # Design tokens, color palette, typography, breakpoints
│   ├── main.css                # Base typography, grid & flex utilities
│   ├── components.css          # Buttons, cards, badges, toast alerts, action tiles
│   ├── forms.css               # Accessible form controls, 6-digit OTP boxes, steppers
│   ├── dashboard.css           # KPI cards, stats grids, activity lists, CSS data bars
│   ├── responsive.css          # Desktop sidebar vs Mobile top bar + bottom navigation
│   └── accessibility.css       # High-visibility focus rings, sr-only, reduced motion
│
├── js/
│   ├── config.js               # Centralized constants, production configuration and endpoints
│   ├── storage.js              # Safe LocalStorage wrapper with memory fallback
│   ├── i18n.js                 # Multilingual translation engine
│   ├── auth.js                 # authentication manager, role verification, session guard
│   ├── ui.js                   # Application shell renderer, notification toasts, network pill
│   └── app.js                  # Master application initializer & SW bootstrap
│
├── i18n/
│   ├── en.json                 # English translation dictionary
│   ├── hi.json                 # Hindi (हिंदी) translation dictionary
│   └── pa.json                 # Punjabi (ਪੰਜਾਬੀ) translation dictionary
│
└── assets/
    └── icons/                  # Inline & crisp SVG vector icons for health features
```

---

## How to Run Locally

Because the frontend uses standard modern ES6 web standards and Service Workers, it should be served over HTTP/HTTPS:

### Option 1: Python HTTP Server (Built-in)
```bash
# Navigate to the workspace root or frontend directory
cd d:/nabha-telemedicine/frontend

# Launch local server on port 8000
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Option 2: Node.js `serve` or `http-server`
```bash
npx serve d:/nabha-telemedicine/frontend -p 8000
```

---

## Production Authentication

The frontend uses real backend authentication with mobile number or email plus password. There is no public role selector during login and no demo credentials. Patients can register directly; ASHA and Doctor applications require administrative approval.

## Implementation Checklist & Status

- [x] **Step 1: Project Structure & Assets**: Modular folder hierarchy & crisp SVG icons.
- [x] **Step 2: CSS Foundation**: 8 comprehensive, accessible stylesheets.
- [x] **Step 3: Application Shell & i18n**: Responsive Desktop Sidebar + Mobile Bottom Navigation + English/Hindi/Punjabi i18n engine.
- [x] **Step 4: Login & Authentication**: Mobile/email + password authentication with role-aware route protection.
- [x] **Step 5: Patient Dashboard**: Portal with consultation overview & health services access (`patient-dashboard.html`).
- [x] **Step 6: ASHA Dashboard**: Field portal with registration, vitals, and sync action tiles (`asha-dashboard.html`).
- [x] **Step 7: Doctor Dashboard**: Clinical console with waiting patient queue and triage risk flags (`doctor-dashboard.html`).
- [x] **Step 8: Admin Dashboard**: Health mission portal with KPI metrics and CSS progress bars (`admin-dashboard.html`).
- [x] **Step 9: Patient Registration**: Multi-step offline-first registration form (`patient-registration.html`).
- [x] **Step 10: IndexedDB Storage Engine**: Persistent offline database (`js/indexeddb.js`) with offline data storage without fictional seed records.
- [x] **Step 11: Connectivity Manager**: Network quality & backend ping checker (`js/offline.js`).
- [x] **Step 12: Offline Sync Engine**: Background queue engine (`js/sync.js`) for CRUD operations.
- [x] **Step 13: Production API gateway**: Centralized production API client (`js/api.js`).
- [x] **Step 14: Consultation UI**: Teleconsultation workspace with video session integration and network-aware UI, AI triage, & doctor notes (`consultation.html`).
- [x] **Step 15: Prescription UI**: Digital prescription document viewer with real backend records and download support (`prescription.html`).
- [x] **Step 16: AI Triage UI**: Symptom risk analyzer (`js/ai.js`) with warning flags and medical disclaimers.
- [x] **Step 17: Appointments**: Appointment scheduler & tabbed status list (`appointments.html`).
- [x] **Step 18: Emergency Screen**: Accessible emergency help screen (`emergency.html`) with helpline 108 & ambulance 102.
- [x] **Step 19: i18n Engine**: Dynamic translation switching for English, Hindi, and Punjabi.
- [x] **Step 20: PWA & Service Worker**: Offline asset caching (`service-worker.js`) & web app manifest (`manifest.json`).

---

## Connecting to Node.js Backend Later

All backend interaction is centralized via `CONFIG.API_BASE_URL` in `js/config.js`. Later when the Express/Node.js backend is introduced:

1. Update `CONFIG.USE_MOCK_API = false`
2. Update `CONFIG.API_BASE_URL` to point to the live backend service.
