# APSRTC Smart Passenger Information Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/Tests-34%20Passed-success.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Python%20Flask%20%7C%20SQLAlchemy%20%7C%20JWT-orange.svg)]()

A unified, accessible, and secure digital platform engineered for passengers of the **Andhra Pradesh State Road Transport Corporation (APSRTC)**.

---

## 1. Core Principles & Real Data Guarantee

* **100% Authentic Station Board Data**: Sourced directly from 5 transcribed photos of verified timetable display boards at **APSRTC Eluru Depot / New Bus Stand** (Main Board, Platform 1, Platform 2, Platform 4).
* **Zero Fictional Timings**: If an arrival time or intermediate stop is unstated on the depot board, the platform honestly marks it as *"Not listed on station board"* rather than inventing artificial estimates.
* **No Simulated GPS**: Never fabricates live bus positions on a map without authorized vehicle GPS transponders.
* **Zero Background Tracking**: Geolocation coordinates for Women's Safety are captured **only** upon explicit user interaction and immediately terminate when sharing is stopped.

---

## 2. Integrated Features

The platform unifies all five required services into a single responsive web interface:

1. **Bus Schedules & Directional Timetables**:
   - Search by source, destination, and travel date.
   - Enforces stop order sequence validation ($SEQ_{source} < SEQ_{destination}$).
   - Date-based rules checking operating days (e.g. Daily, selected weekdays) and service validity ranges.
   - Accurately displays boarding departure time from the passenger's selected source stop.

2. **Women's Safety Assistance (Suraksha)**:
   - Save up to 5 verified emergency contacts with primary designation.
   - Consensual, temporary live location sharing with interactive Leaflet (OpenStreetMap) rendering and self-expiring security tokens.
   - Instant one-click direct telephone dialer for **112 Emergency Services**.

3. **Passenger Grievance Redressal Portal**:
   - File complaints across categories (*Bus delay, Staff behaviour, Cleanliness, Bus condition, Route-related issue, Other*).
   - Secure image attachment upload with MIME and 5MB size enforcement.
   - Auto-generated unique Reference ID (`APSRTC-CMP-YYYYMMDD-XXXXX`).
   - Public and authenticated tracking with chronological status change history.

4. **SMS-Based Route Information**:
   - Offline route enquiries for passengers with basic feature phones.
   - Active route codes (`VJY`, `HYD`, `RJY`, `TPG`, `VSKP`).
   - Carrier-ready incoming SMS webhook receiver with 160-character response formatting.
   - Built-in interactive test simulator console.

5. **Multilingual Voice Assistant**:
   - Native bilingual support for **English** and **Telugu (తెలుగు)**.
   - Web Speech API integration (`SpeechRecognition` voice input and `SpeechSynthesis` spoken output) with fallback text chat.
   - Answers timetable queries using real database records.

6. **Administrative Operations Center**:
   - Role-based authorization (`@roles_required(['admin'])`).
   - Timetable creation, verification, stop sequence ordering, and deactivation.
   - Full CSV export and import.
   - Grievance management: internal notes, passenger-visible responses, status transitions.
   - Comprehensive administrative audit trail.

---

## 3. Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide React, Leaflet, OpenStreetMap.
* **Backend**: Python 3.9+, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS, PyJWT, Bcrypt, Marshmallow.
* **Database**: PostgreSQL (Production / Supabase) with local SQLite zero-dependency capability.
* **Testing**: Pytest, Pytest-Flask.

---

## 4. Local Installation & Development Guide

### Prerequisites
* Python 3.9+
* Node.js v18+ and npm

### Backend Setup

```bash
# 1. Navigate to project root
cd /path/to/Smart_Transportation

# 2. Setup virtual environment & activate
python3 -m venv backend/venv
source backend/venv/bin/activate

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. Initialize environment file
cp backend/.env.example backend/.env

# 5. Seed database with real Eluru Depot timetable records
PYTHONPATH=backend python backend/run.py seed

# 6. Run Flask API server (runs on http://127.0.0.1:5001)
PYTHONPATH=backend python backend/run.py
```

### Frontend Setup

```bash
# 1. In a new terminal window, navigate to frontend
cd /path/to/Smart_Transportation/frontend

# 2. Install npm packages
npm install

# 3. Start Vite development server (runs on http://localhost:3000)
npm run dev
```

---

## 5. Automated Test Suite Execution

Run all 34 backend unit and integration tests:

```bash
cd /path/to/Smart_Transportation
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests/ -v
```

### Verified Test Scenarios (34 Passed):
- `test_01_valid_source_and_destination`: Returns scheduled buses with origin boarding times.
- `test_02_source_equals_destination`: Rejects identical origin and destination.
- `test_03_destination_appears_before_source`: Correctly handles one-way stop sequencing.
- `test_04_source_or_destination_not_in_route`: Rejects non-connected stops.
- `test_05_no_matching_bus_exists`: Handles unserved queries honestly.
- `test_06_bus_operates_daily`: Verifies continuous daily schedules.
- `test_07_bus_operates_only_on_selected_weekdays`: Enforces weekday-specific rules.
- `test_08_bus_outside_validity_dates`: Excludes dates outside operational validity.
- `test_09_bus_is_inactive`: Filters out decommissioned services.
- `test_10_multiple_buses_match_same_search`: Returns and sorts all matching services.
- `test_11_selected_date_changes_the_results`: Dynamic date filtering.
- `test_12_boarding_time_comes_from_selected_source_stop`: Uses boarding stop departure time.
- `test_13_arrival_time_comes_from_destination_stop`: Links arrival time to destination stop.
- `test_14_missing_arrival_time_is_displayed_honestly`: No fabricated estimates.
- `test_15_invalid_timetable_records_rejected`: Enforces strict data integrity.
- `test_auth_*`: Registration, duplicate prevention, password strength, login, RBAC.
- `test_complaints_*`: Submission, image upload validation, reference tracking, status updates.
- `test_safety_*`: Trusted contacts CRUD, location sharing start, update, and explicit revocation.
- `test_sms_*`: Webhook processing, code lookup, concise SMS formatting.
- `test_assistant_*`: English and Telugu NLP database queries and guidance.

---

## 6. Default Credentials for Evaluation

### Initial System Administrator
* **URL**: `/admin/login`
* **Email**: `admin@apsrtc.ap.gov.in`
* **Password**: `ApsrtcAdmin@2026#Secure`

### Seeded Passenger Account
* **URL**: `/login`
* **Email**: `passenger@example.com`
* **Password**: `Passenger@2026`

---

## 7. API Reference Overview

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/auth/register` | POST | Public | Register new passenger |
| `/api/v1/auth/login` | POST | Public | Login with email or mobile |
| `/api/v1/schedules/stops` | GET | Public | Searchable list of bus stations |
| `/api/v1/schedules/search` | GET | Public | Date and stop sequence schedule search |
| `/api/v1/schedules/services/<id>` | GET | Public | Full stop-by-stop timetable details |
| `/api/v1/safety/contacts` | GET/POST | Passenger | Emergency contacts management |
| `/api/v1/safety/location/start` | POST | Passenger | Start live location session |
| `/api/v1/safety/location/stop` | POST | Passenger | Stop sharing & revoke link |
| `/api/v1/complaints` | POST | Passenger | Submit grievance with optional photo |
| `/api/v1/complaints/track/<ref>` | GET | Public | Track complaint status timeline |
| `/api/v1/sms/codes` | GET | Public | Active SMS query route codes |
| `/api/v1/sms/webhook` | POST | Public/Carrier | Inbound SMS webhook receiver |
| `/api/v1/assistant/query` | POST | Public | Bilingual voice & text assistant query |
| `/api/v1/admin/services` | GET/POST | Admin | Timetable service management |
| `/api/v1/admin/services/export-csv` | GET | Admin | Download all timetables as CSV |
| `/api/v1/admin/complaints` | GET | Admin | Review complaints with photo evidence |
| `/api/v1/admin/complaints/<id>/status`| PUT | Admin | Update status with staff notes & response |

---

## 8. Deployment & Environment Configuration

### Connecting Supabase / PostgreSQL (Production)
1. In `backend/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
2. Run database migrations:
   ```bash
   PYTHONPATH=backend python backend/run.py seed
   ```

### Connecting SMS Gateway (Twilio / MSG91)
1. In `backend/.env`, configure:
   ```env
   SMS_PROVIDER=twilio
   SMS_API_KEY=your_live_token
   SMS_WEBHOOK_SECRET=your_signature_secret
   ```
2. Point carrier webhook to `https://your-domain.com/api/v1/sms/webhook`.
