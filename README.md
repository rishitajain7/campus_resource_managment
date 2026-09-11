# Campus Resource and Booking Management System

A modern, responsive, university-grade frontend prototype for a college **Campus Resource and Booking Management System** built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Lucide Icons**, and **React Router v7**.

Designed for campus societies, students, permission in-charges, and campus administrators to request, review, and schedule campus rooms and resources.

---

## 🏛️ Campus Locations Covered (12 Designated Zones)

1. **LP** — Library Plaza & Amphitheatre
2. **LT** — Lecture Theatres Complex (LT-101, LT-102, LT-201, LT-202)
3. **TAN** — TAN Activity Centre (Dance & Dramatics Studios)
4. **B Block** — Academic Block B (Classrooms & Seminar Halls)
5. **C Block** — Academic Block C (Computer Science Seminar & Labs)
6. **D Block** — Academic Block D (Audio-Visual & Engineering Halls)
7. **E Block** — Academic Block E (Presentation Suites & Discussion Rooms)
8. **F Block** — Academic Block F (Lecture Theatres & Tutorial Rooms)
9. **Main Auditorium** — Grand Hall (1,500 seats), Stage & VIP Lounge
10. **GR1** — Green Reservation 1 (Festival Lawns & Event Stage)
11. **GR2** — Green Reservation 2 (Sports Pavilion & Track Grounds)
12. **CR** — Central Conference & Common Room

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (recommended)
- **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
# Clone the repository (or navigate to the project directory)
cd campus-resource-portal

# Install dependencies
npm install
```

### 3. Run Locally (Dev Server)
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

---

## 👥 Demo Personas (1-Click Login)

The portal provides 1-click demo logins on the Login page and a live persona switcher in the top navbar:

| Persona | Name | Role | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Student / Society** | Aayati Sharma | President (*IEEE Student Branch*) | 8-step booking wizard, My Bookings, live room availability, status tracking. |
| **Permission In-charge** | Dr. R. K. Verma | Associate Dean (Student Affairs) | Pending approval queue, Approve/Reject modals with justification, review filters. |
| **Campus Admin** | Prof. Sandeep Bansal | Campus Resource Director | Room inventory CRUD, society directory management, system overview. |

---

## 📂 Project Architecture

```text
campus-resource-portal/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts               # Complete TypeScript models (Booking, Room, Society, User, Notification)
    ├── data/
    │   └── mockData.ts            # Realistic seed data (all 12 zones, rooms, societies, initial bookings)
    ├── services/
    │   └── storageService.ts      # Reactive localStorage state, collision detection, and notification dispatch
    ├── context/
    │   └── AuthContext.tsx        # Authentication & persona switching context
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.tsx         # University branding, live persona switcher, notifications dropdown
    │   │   ├── Sidebar.tsx        # Responsive role-aware navigation drawer
    │   │   ├── StatusBadge.tsx    # Standardized color-coded status chips
    │   │   ├── Modal.tsx          # Accessible modal dialog
    │   │   └── MetricCard.tsx     # KPI stat cards with trend indicators
    │   └── booking/
    │       ├── BookingDetailsModal.tsx # Inspection view with specifications and approval info
    │       └── RejectionModal.tsx      # Formal rejection dialog with reason prompt
    ├── layouts/
    │   └── DashboardLayout.tsx    # Master layout combining Navbar, Sidebar, and Outlet
    └── pages/
        ├── LoginPage.tsx          # Institutional login with 1-click persona buttons
        ├── StudentDashboard.tsx   # Student home with stats and upcoming bookings
        ├── BookResourcePage.tsx   # 8-step booking wizard with real-time conflict detector
        ├── MyBookingsPage.tsx     # Filterable bookings table with status tabs
        ├── InChargeDashboard.tsx  # Permission approval queue with decision workflows
        ├── AdminDashboard.tsx     # Resource & society administration
        ├── AvailabilityPage.tsx   # Interactive hourly slot viewer (08:00 AM - 10:00 PM)
        └── NotificationsPage.tsx  # System notifications center
```

---

## 🔄 Core User Flow

```text
Login 
  └── Student Dashboard
        └── Book a Resource
              ├── Step 1: Select Activity Type (Society Prep / Workshop / Event)
              ├── Step 2: Select Society (IEEE, CSI, EDC, etc.)
              ├── Step 3: Select Campus Location (12 Zones)
              ├── Step 4: Select Room / Venue (Capacity & AV tags)
              ├── Step 5: Select Date & Time (Live collision detection)
              ├── Step 6: Select Morning / Night Permission
              ├── Step 7: Enter Activity Details (Contextual Form)
              └── Step 8: Review Summary & Submit Request
                    └── Transmitted to Permission In-charge
                          └── In-Charge Dashboard (Approve or Reject with Reason)
                                └── Real-time Status Update in Student Dashboard & My Bookings
```

---

## 🛠️ How to Push to Your GitHub Repository

```bash
# 1. Initialize git inside this project directory
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "feat: Initial commit for Campus Resource & Booking Management System"

# 4. Rename default branch to main
git branch -M main

# 5. Link to your GitHub remote repository
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git

# 6. Push code to GitHub
git push -u origin main
```

