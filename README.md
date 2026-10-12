# Rida Admin Dashboard — Frontend

For the implemented admin API connections, local setup, backend limitations, and validation commands, see [Admin API integration](docs/ADMIN_API_INTEGRATION.md). Some product capabilities described below are planned and have no backend endpoint yet.

> **Tanzania Ride-Hailing Operations Platform**  
> Operational administration, driver fleet management, rider safety, trips, transactions (TZS), and reporting.

---

## 1. Project Purpose

**Rida Admin Dashboard** is the centralized web administration console for Rida, an on-demand ride-hailing service in Tanzania. The platform provides real-time oversight for operational dispatch, driver accreditation and verification, rider safety, dispute arbitration, mobile money transactions (M-Pesa, Tigo Pesa, Airtel Money, Halopesa), and regulatory reporting.

- **Target Market:** Tanzania
- **Primary Operating Currency:** Tanzanian Shilling (`TZS` / `TSh`)
- **Default Timezone:** `Africa/Dar_es_Salaam` (EAT / UTC+3)
- **Supported Languages:** English (default), Swahili (scaffolded)

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TypeScript (Strict Mode), Vite |
| **Routing** | React Router v7 (Code-split with Suspense) |
| **Styling & Design System** | Tailwind CSS v3, CSS Custom Properties (`hsl`), Inter Font |
| **UI Component Primitives** | shadcn/ui conventions, Radix UI Primitives, Lucide React, CVA |
| **Global Client State** | Zustand |
| **Server State & Cache** | TanStack Query v5 (`@tanstack/react-query`) |
| **Forms & Validation** | React Hook Form, Zod v4, `@hookform/resolvers` |
| **HTTP Communication** | Axios (configured with timeout, credentials, interceptors) |
| **Utilities & Formatting** | `date-fns`, `sonner` (toasts), `clsx`, `tailwind-merge` |
| **Code Quality** | ESLint 10 (Flat Config), Prettier with Tailwind Plugin |

---

## 3. Project Architecture

The codebase utilizes a **feature-driven architecture**. Feature modules encapsulate their own components, hooks, schemas, services, and pages, preventing large monolithic directories.

```text
src/
├── app/                  # Application bootstrap, routing, and provider composition
│   ├── App.tsx           # Top-level application shell
│   ├── providers/        # Global context (TanStack Query, Sonner Toaster)
│   └── router/           # Centralized route definitions and route guards
│
├── assets/               # Static assets (images, icons, illustrations)
│
├── components/           # Shared, reusable application-wide UI components
│   ├── ui/               # Foundational primitives (Button, Input, Card, etc.)
│   ├── common/           # Cross-cutting UI (NotFoundPage, ErrorState)
│   ├── feedback/         # Suspense loading spinners, skeletons, modals
│   └── layout/           # Route guards (ProtectedRoute), dev placeholders
│
├── features/             # Business domain feature modules
│   ├── auth/             # Login, credentials validation, session restoration
│   ├── dashboard/        # Operational KPIs, overview metrics
│   ├── drivers/          # Driver onboarding, licensing, vehicle verification
│   ├── customers/        # Rider directory, accounts, verification
│   ├── rides/            # Live dispatch monitoring, trip history
│   ├── payments/         # TZS transactions, mobile money, driver settlements
│   ├── analytics/        # Aggregate reporting, regional heatmaps
│   ├── support/          # Dispute management, support tickets
│   ├── notifications/    # Push notifications, SMS dispatch alerts
│   └── settings/         # Fare matrix, system settings, RBAC roles
│
├── hooks/                # Cross-cutting custom React hooks
├── lib/                  # Infrastructure libraries and utilities
│   ├── api/              # Axios client instance, error transformers, types
│   ├── constants/        # System configuration, route constants, locales
│   ├── utils/            # Tanzania locale & TZS currency formatters
│   └── utils.ts          # Tailwind cn() helper
│
├── services/             # Cross-module background services
├── stores/               # Global Zustand stores (useAuthStore, useUiStore)
├── styles/               # Global stylesheet and CSS design tokens (globals.css)
├── types/                # Core domain and TypeScript type definitions
└── main.tsx              # DOM mounting and root initialization
```

---

## 4. Design System & Tokens

Visual identity tokens are modeled from the Rida administration palette:

- **Deep Teal:** `#173B3B` (`--brand-deep-teal`)
- **Primary Teal:** `#1C7C70` (`--brand-primary-teal`)
- **Soft Mint:** `#D7EFE8` (`--brand-soft-mint`)
- **Off-white Background:** `#F5F7F8` (`--background`)
- **Surfaces:** `#FFFFFF` (`--card`)
- **Main Text:** `#172B36` (`--foreground`)
- **Secondary Text:** `#64748B` (`--muted-foreground`)
- **Borders:** `#D7E0E5` (`--border`)
- **Error:** `#DC4C4C` (`--destructive`)
- **Success:** `#168568` (`--success`)

Accessible focus rings, smooth transitions, and reduced-motion queries (`prefers-reduced-motion`) are enforced globally.

---

## 5. Getting Started

### Prerequisites

- **Node.js:** `>= 20.x` (Tested on Node v24)
- **npm:** `>= 10.x`

### Installation

```bash
# Clone the repository and enter the directory
cd admin-frontend

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env.local
```

Configurable variables:

```env
# Base URL for backend API services
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Environment name: development | staging | production
VITE_APP_ENV=development

# Default locale
VITE_DEFAULT_LOCALE=en
```

---

## 6. Development Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server on `http://localhost:3000` |
| `npm run build` | Compiles TypeScript and builds production assets to `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Executes TypeScript strict compiler check without emitting files |
| `npm run lint` | Runs ESLint 10 checks across TypeScript and React source files |
| `npm run format` | Formats source files using Prettier and Tailwind CSS plugin |
| `npm run format:check` | Verifies formatting compliance in CI/CD pipelines |

---

## 7. Current Implementation Status (Phases 1, 2, 3, & 4 Completed)

- [x] **Phase 1 Foundation:** Vite + React 19 + TypeScript strict setup, design tokens, Axios client, Zustand, TanStack Query, and formatters.
- [x] **Phase 2 Login Experience:** Pixel-accurate, split-screen Rida Admin login page with Zod validation, password toggle, localization (EN/SW), and access policy modal.
- [x] **Phase 3 Dashboard & Navigation System:**
  - Complete branding migration to **Rida Admin** with official brand mark and typography.
  - Persistent `AdminLayout` shell with collapsible `Sidebar`, `Topbar`, `Breadcrumbs`, and `MobileNavDrawer`.
  - Executive Operations Dashboard (`/dashboard`) with 4 metric cards, Recharts ride activity area chart, live operations status cards, and recent rides table in TZS.
  - Live Operations route (`/live-operations`) with radar metrics and geospatial dispatch map shell.
- [x] **Phase 4 Driver Management Module:**
  - Driver Management Overview (`/drivers`) with 4 KPI statistic cards, debounced search (300ms), multi-select filters, and responsive data table with server-style pagination.
  - Driver Registration Workflow (`AddDriverDialog`) with React Hook Form and Zod validation for Tanzanian phone (+255) and vehicle specifications.
  - Comprehensive Driver Profile Details (`/drivers/:driverId`) featuring 6 tabs: Overview, Vehicle & LATRA Inspection, Documents, Ride History, Performance Metrics, and Audit Activity Trail.
  - Driver Profile Editing (`/drivers/:driverId/edit`) with prefill, dirty state detection, and validation.
  - Driver Verification Management Queue (`/drivers/verifications`) tracking pending compliance submissions.
  - Verification Inspection Workspace (`/drivers/verifications/:verificationId`) with document viewer, approval confirmation, and structured rejection modal with explanatory notes.
  - Safe Driver Account Suspension & Reactivation dialogs with regulatory audit logging.

---

## 8. Planned Future Phases

1. **Phase 5:** Customer Accounts, Rider Profiles & Safety Center.
2. **Phase 6:** Full Geospatial Ride Dispatch Tracking & Real-Time Driver Map.
3. **Phase 7:** Payments & Tanzanian Mobile Money Settlement Reconciliation (M-Pesa, Tigo Pesa, Airtel Money, Halopesa).
4. **Phase 8:** Analytics, Auditing & Granular RBAC Permissions.

