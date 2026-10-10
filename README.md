# PikiPiki Admin Dashboard — Frontend

> **Tanzania Ride-Hailing Operations Platform**  
> Operational administration, driver fleet management, rider safety, trips, transactions (TZS), and reporting.

---

## 1. Project Purpose

**PikiPiki Admin Dashboard** is the centralized web administration console for PikiPiki, an on-demand ride-hailing service in Tanzania. The platform provides real-time oversight for operational dispatch, driver accreditation and verification, rider safety, dispute arbitration, mobile money transactions (M-Pesa, Tigo Pesa, Airtel Money, Halopesa), and regulatory reporting.

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

Visual identity tokens are modeled from the PikiPiki administration palette:

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

## 7. Current Implementation Status (Phase 1)

- [x] Vite + React 19 + TypeScript strict setup
- [x] Tailwind CSS v3 + CSS variables design system with PikiPiki brand tokens
- [x] Centralized React Router with lazy loading and Suspense fallbacks
- [x] Protected route abstraction with Phase 1 development preview mode
- [x] Centralized Axios client supporting HttpOnly session cookies and standardized error handling
- [x] Zustand client state (`useAuthStore`, `useUiStore`)
- [x] TanStack Query provider configured with 5-minute stale time
- [x] shadcn/ui primitives (`Button`, `Input`, `Label`, `Card`, `Separator`, `Skeleton`)
- [x] Tanzanian Shilling (`formatTZS`) and `Africa/Dar_es_Salaam` date formatters
- [x] ESLint and Prettier tooling verified
- [x] Phase 1 initial application screen deployed on `/login`

---

## 8. Planned Future Phases

1. **Phase 2:** Pixel-Accurate PikiPiki Login Page Implementation (Two-panel layout, brand artwork, responsive form).
2. **Phase 3:** Executive Operations Dashboard (KPI counters, active drivers map, real-time demand charts).
3. **Phase 4:** Driver Management & Document Verification (LATRA, driver license review workflows).
4. **Phase 5:** Customer Accounts & Safety Center.
5. **Phase 6:** Ride Dispatch Monitoring & Trip Heatmaps.
6. **Phase 7:** Payments & Tanzanian Mobile Money Settlement Reconciliation.
7. **Phase 8:** Analytics, Auditing & Administrative Role-Based Access Control (RBAC).
