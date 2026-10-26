# Company Engagement Portal (CEP)
### Institutional Company & Industry Engagement Management System
**The LNM Institute of Information Technology, Jaipur (LNMIIT)**  
**Course:** Software Development Laboratory (CS314) | **Team ID:** T066  
**Team Members:** Hitesh Jain (24UCS123), Anand Patidar (24UCS125), Pranav Vashisth (24UCS126), Avesh Khan (24UCS127)

---

## 🌟 Executive Summary

The **Company Engagement Portal (CEP)** is a web-based institutional interaction platform designed to centralize and organize institutional engagements with recruiting companies, industry partners, and campus talent teams. 

It replaces fragmented or manual records by providing an integrated system to maintain company profiles, contacts, campus visit delegations, recruitment drive lifecycles, institutional approval workflows, and historical engagement timelines.

This prototype is built strictly based on the Software Requirements Specification (SRS v1.0), UML scenarios, and design specifications defined in `T066_SD-Lab_Assignment_1to7.docx`.

---

## 🏗️ Architecture & Technology Stack

The system follows an **N-Tier Layered Architecture** with a decoupled Client-Server model as specified in Assignment 6:

```
┌────────────────────────────────────────────────────────┐
│     Presentation Layer (React 18 + Vite + Tailwind)    │
│    S1 Login, S2 Company Details, S3 Record Visit,      │
│     S4 Activity Details, S5 Approval Review Queue      │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON APIs (CORS)
┌───────────────────────────▼────────────────────────────┐
│      Controller / API Layer (FastAPI + Pydantic)       │
│   Auth, Companies, Contacts, Visits, Activities,       │
│        Approvals, Engagement, Reports, Admin           │
└───────────────────────────┬────────────────────────────┘
                            │ Service Invocations
┌───────────────────────────▼────────────────────────────┐
│     Business Logic Layer (Services & Validation)       │
│  ValidationService, EngagementHistoryService, Auth     │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy ORM (SQL)
┌───────────────────────────▼────────────────────────────┐
│      Data Access & Database Layer (SQLite3 Engine)     │
│   users, companies, contacts, visits, visit_attendees, │
│     recruitment_activities, approvals, engagements     │
└────────────────────────────────────────────────────────┘
```

### Frontend Stack
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom brand palette and dark/light mode
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Sector Diversity Pie & Activity Pipeline Bar)
- **HTTP Client:** Axios with backend proxy

### Backend Stack
- **Framework:** Python FastAPI
- **Data Validation:** Pydantic v2 schemas
- **ORM:** SQLAlchemy 2.0
- **Database:** SQLite3 (`company_portal.db`)
- **Server:** Uvicorn ASGI

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+)

### 1. Start the Backend API
In a terminal, navigate to the `backend` directory:
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py        # Populates realistic LNMIIT demo data & users
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI interactive Swagger UI will be available at: **http://127.0.0.1:8000/docs**

### 2. Start the Frontend Development Server
In a second terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to: **http://localhost:5173/**

---

## 👥 Demo Personas & 1-Click Role Switcher

For live evaluations and presentations, the top navigation bar features a **1-Click Demo Persona Switcher** allowing you to instantly switch roles without retyping credentials:

| Persona Name | Institutional Role | Primary Responsibilities & Use Cases | Default Email |
| :--- | :--- | :--- | :--- |
| **Hitesh Jain** | `COORDINATOR` | Create Company (FR-006), Record Visit (UC-006), Draft & Submit Drives (UC-008) | `hitesh.coordinator@lnmiit.ac.in` |
| **Dr. Anand Patidar** | `APPROVER` | Review submitted drives, Approve (UC-009), Reject with reasons (UC-010) | `anand.approver@lnmiit.ac.in` |
| **Pranav Vashisth** | `ADMIN` | User administration (FR-004), role assignment, account status toggle | `pranav.admin@lnmiit.ac.in` |
| **Avesh Khan** | `COORDINATOR` | Company engagement logging & contact management | `avesh.coordinator@lnmiit.ac.in` |

*Default password for manual login on S1:* `password123`

---

## 🎯 Core Features & Requirements Implementation

### 1. UC-006: Record Company Visit (Screen S3)
- **Workflow:** Coordinator selects a partner company, specifies date, purpose, adds multiple delegation attendees (with dynamic badge tags), outcomes, and internal notes.
- **Validation:** Enforces mandatory date, purpose, outcome, attendees, and verified company existence.
- **Persistence & Audit:** Atomic transaction saving the `Visit` and `VisitAttendee` records, while automatically appending an audited `VISIT` entry to the company's `EngagementRecord` timeline (FR-030).

### 2. UC-008: Submit Recruitment Activity (Screen S4)
- **Workflow:** Coordinator creates a recruitment drive, selects company, drive type (`ON_CAMPUS`, `VIRTUAL`, `POOL_CAMPUS`, `INTERNSHIP_DRIVE`, `HACKATHON`), drive date, eligibility criteria, positions offered, and compensation details.
- **Drafting:** Supports saving incomplete drives as `DRAFT` (FR-022).
- **Submission:** Validates all required fields and current status (`DRAFT` or `REVISION`), transitioning status to `SUBMITTED` for institutional review.
- **Business Rule (BR-007):** Cancelled activities are permanently locked and cannot be edited or submitted.

### 3. UC-009 & UC-010: Approve / Reject Recruitment Activity (Screen S5)
- **Workflow:** Approving Authority accesses the dedicated `Approval Queue` to inspect pending drives.
- **Decision Capture (BR-010):** Approver enters evaluation comments. On approval, the drive status transitions to `APPROVED`, recording the approver's identity and decision timestamp.
- **Rejection Enforcement (FR-027):** Rejection strictly enforces a non-empty rationale/reason (e.g. date clash with mid-term exams).
- **Lifecycle Progression:** Once approved, drives can be scheduled (`SCHEDULED` -> `ONGOING` -> `COMPLETED`).

### 4. Company Profiles & Contacts (Screens S2 & FR-006 - FR-015)
- **Directory:** Search companies by name/keyword with sector and status filters (`ACTIVE`, `INACTIVE`, `ARCHIVED`).
- **Profile Details (S2):** Tabbed interface with company overview, contact leads, visits history, recruitment activities, and engagement timeline.
- **Unique Companies (BR-004):** Duplication of existing company profiles is prevented at the database and API level.
- **Composition Contacts (BR-009):** Contacts are tied directly to an existing company profile with designation, email, phone, and department.

### 5. Engagement History & Timeline (FR-030 - FR-032)
- **Automatic Logging:** Automatically logs all milestone interactions (visits, contact updates, drive submissions, approvals).
- **Chronological Presentation:** Sorted in descending order with visual markers and recorded-by user attribution.
- **Archival Rule (BR-008):** History records cannot be hard deleted, only archived for compliance and audit preservation.

### 6. Reports & Analytics (FR-036 - FR-039)
- **Dashboard Metrics:** Real-time KPI summary cards and interactive charts.
- **CSV Data Export:** One-click CSV downloads for:
  - `companies_report.csv` (FR-036)
  - `visits_report.csv` (FR-038)
  - `recruitment_activities_report.csv` (FR-037)

### 7. User & Access Administration (FR-004 & FR-005)
- Administrator dashboard allowing role updates (`COORDINATOR`, `APPROVER`, `ADMIN`) and account activation/deactivation (`ACTIVE` / `INACTIVE`).

---

## 💎 Meaningful Enhancements

1. **Light / Dark Mode:** Full UI theme toggling with automatic OS preference detection and local storage persistence.
2. **Interactive Visualizations:** Recharts sector distribution donut chart and recruitment drive status pipeline bar chart.
3. **1-Click Demo Persona Bar:** Instant switcher for presentation and role testing.
4. **Live Approval Counter:** Pulsing badge indicator in the sidebar showing real-time pending approvals.
5. **CSV Export Endpoints:** Native streaming CSV generation for institutional audits.

---

## 🗄️ Database Entity-Relationship Mapping

The SQLite database (`backend/company_portal.db`) is structured according to Section 1.4 of Assignment 6:

- **`users`**: `user_id` (PK), `name`, `email` (Unique), `password_hash`, `role`, `account_status`, `created_at`
- **`companies`**: `company_id` (PK), `name` (Unique), `industry`, `address`, `website`, `status`, `notes`, `created_at`
- **`contacts`**: `contact_id` (PK), `company_id` (FK), `name`, `designation`, `email`, `phone`, `department`, `created_at`
- **`visits`**: `visit_id` (PK), `company_id` (FK), `recorded_by` (FK), `visit_date`, `purpose`, `outcome`, `notes`, `created_at`
- **`visit_attendees`**: `id` (PK), `visit_id` (FK), `attendee_name`
- **`recruitment_activities`**: `activity_id` (PK), `company_id` (FK), `created_by` (FK), `title`, `type`, `activity_date`, `eligibility_criteria`, `positions_offered`, `package_details`, `status`, `created_at`, `updated_at`
- **`approvals`**: `approval_id` (PK), `activity_id` (FK), `approver_id` (FK), `decision`, `comments`, `decision_date`
- **`engagement_records`**: `record_id` (PK), `company_id` (FK), `type`, `description`, `record_date`, `recorded_by` (FK), `archived` (Boolean)

---

## 🧪 Verification & Automated Testing

The application was validated end-to-end with automated browser sessions:
- Recorded browser walkthroughs saved in the project artifacts directory:
  - `cep_workflow_demo_1793047366781.webp` (Company search, profile view, UC-006 visit recording)
  - `cep_approval_flow_1793047540788.webp` (Persona switch to Approver, UC-009 drive approval, BR-010 audit trail)
