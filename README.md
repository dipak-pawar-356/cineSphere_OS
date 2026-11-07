# 🎬 CineSphere OS
> **The Operating System for Modern Cinemas**  
> *An enterprise-grade, Multi-Tenant SaaS platform engineered for global cinema circuits, multiplex chains, and boutique auditoriums.*

---

## 📌 Project Overview
**CineSphere OS** is a modern, scalable Multi-Tenant SaaS platform built from the ground up to orchestrate cinema operations at enterprise scale. Rather than a simple consumer ticket-booking website, CineSphere OS serves as the foundational operating system connecting:
- **Super Administrators**: Overseeing global tenant organizations, hardware fleets, and platform billing.
- **Theatre Administrators**: Managing venue circuits, distributor split contracts, and concession revenues.
- **Hall Managers**: Controlling daily auditorium environments, projection calibrations, and turnarounds.
- **Operational Staff**: Processing rapid barcode admissions, POS concessions, and incident reports.
- **Patrons & Guests**: Reserving tickets through high-velocity omnichannel storefronts.

---

## 🌟 Strategic Vision
Modern cinema complexes require real-time synchronization between spatial hall acoustics, projection hardware telemetry, distributor box office reporting, and millions of concurrent seat reservations. CineSphere OS eliminates fragmented legacy POS systems by providing a unified, sub-second reactive architecture designed to scale seamlessly over the next decade.

---

## ⚡ Current Phase: Foundation (Phase 0 -> Phase 1)
> **Notice**: In this phase, **no business features, databases, APIs, or authentication logic have been built**. This release strictly establishes the enterprise architectural blueprint, typed contracts, modular route groups, design tokens, security abstractions, and developer tooling.

---

## 🛠️ Technology Stack

### Frontend & Core
- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router, Server & Client Components)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with enterprise design tokens
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Abstracted store blueprints)
- **Form Architecture & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Animation Orchestration (Future-Ready)**: `motion`, `gsap`, `lenis`

### Tooling & Quality Assurance
- **Linting & Formatting**: ESLint 9, Prettier
- **Git Hooks & Commits**: Husky, lint-staged, Commitlint (Conventional Commits)
- **Editor Standards**: EditorConfig, VS Code Workspace Recommended Settings

### Future Infrastructure (Reserved)
- **Database & Persistence**: PostgreSQL, Prisma ORM
- **Cache & Message Broker**: Redis
- **Cloud Storage**: AWS S3, Cloudinary
- **Payment Orchestration**: Razorpay, Stripe
- **Microservice Backend**: Spring Boot / Node.js

---

## 📂 Project Folder Structure

```
cineSphere_OS/
├── app/
│   ├── (auth)/                  # Identity & SSO route group (login, register)
│   ├── (public)/                # Public discovery storefront (home, movies, theatres, offers, events)
│   ├── (admin)/                 # Central executive command (dashboard)
│   ├── (super-admin)/           # Platform multi-tenancy & organization orchestration
│   ├── (theatre-admin)/         # Venue screen calibrations & scheduling
│   ├── (customer)/              # Patron bookings & pass wallet
│   ├── layout.tsx               # Root layout with providers & theme
│   ├── loading.tsx              # Luxury CS pulsating loader
│   ├── error.tsx                # Client error boundary
│   ├── global-error.tsx         # Root error boundary
│   ├── not-found.tsx            # Cinematic 404 page
│   ├── robots.ts                # SEO crawler rules
│   ├── sitemap.ts               # Automated dynamic sitemap
│   ├── manifest.ts              # Web application manifest
│   └── globals.css              # Tailwind v4 theme, CSS variables & glassmorphism
│
├── components/
│   ├── ui/                      # Base buttons, cards, badges, chips, skeletons
│   ├── layout/                  # Navbar, footer, sidebars, mobile drawers
│   ├── cards/                   # Domain card representations
│   ├── forms/                   # Form field wrappers & input controls
│   ├── tables/                  # Telemetry & activity tables
│   ├── navigation/              # Region selectors, spotlight search dialogs
│   ├── feedback/                # Enterprise alerts & notifications
│   ├── charts/                  # Analytics & occupancy preview visualizers
│   ├── placeholders/            # Standardized page placeholder scaffolds
│   ├── loaders/                 # Spinners & loading states
│   └── providers/               # Theme, Toast, and Modal context providers
│
├── config/                      # Site metadata, tenant settings, and role definitions
├── constants/                   # Static data catalogs and circuit metrics
├── hooks/                       # Reusable React hooks (media query, click outside)
├── lib/
│   ├── security/                # Auth, RBAC, tenant isolation, API client abstractions
│   └── types/                   # TypeScript interfaces & domain models
│
├── services/                    # Typed API contract blueprints (Theatre, Movie, Booking)
├── store/                       # Zustand store blueprints (Auth, Tenant, UI, Booking)
├── styles/                      # Design system tokens and styling constants
├── types/                       # Global type re-exports
├── utils/                       # Modular utilities (Date, Currency, Formatter, Validator, Storage)
├── public/                      # Static assets (images, logos, icons, posters, illustrations)
├── middleware.ts                # Next.js request & tenant resolution middleware
└── tsconfig.json                # TypeScript paths & compiler configuration
```

---

## 🧭 Path Aliases Configuration

All project imports are configured via clean path aliases defined in `tsconfig.json`:

| Alias | Target Path | Description |
| :--- | :--- | :--- |
| `@/*` | `./*` | Root workspace alias |
| `@/components/*` | `./components/*` | Reusable design system components |
| `@/hooks/*` | `./hooks/*` | Custom React hooks |
| `@/lib/*` | `./lib/*` | Security, types, and core infrastructure |
| `@/utils/*` | `./utils/*` | Date, currency, formatting, and storage helpers |
| `@/config/*` | `./config/*` | Application and site configuration |
| `@/constants/*` | `./constants/*` | Mock constants and system fixtures |
| `@/types/*` | `./types/*` | Domain data models and TypeScript definitions |
| `@/store/*` | `./store/*` | Zustand state management stores |
| `@/services/*` | `./services/*` | API client service layer contracts |
| `@/assets/*` | `./assets/*` | Internal graphical assets |
| `@/styles/*` | `./styles/*` | Design system tokens |

---

## 💻 Development Setup

### Prerequisites
- Node.js `v20.x` or higher
- `pnpm` (recommended), `npm`, or `yarn`

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/dipak-pawar-356/cineSphere_OS.git
cd cineSphere_OS

# 2. Configure environment variables
cp .env.example .env.local

# 3. Install dependencies
pnpm install

# 4. Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect the platform.

### Developer Commands

```bash
# Type-check TypeScript codebase
pnpm run type-check

# Run ESLint validation
pnpm run lint

# Format code with Prettier
pnpm run format

# Verify production build compilation
pnpm run build
```

---

## 📐 Coding Standards & Guidelines

- **Strict TypeScript**: No implicit `any` types; all payloads and props must be strongly typed.
- **Server Components by Default**: Utilize React Server Components (`RSC`) wherever possible. Apply `"use client"` exclusively for interactive components with local state or event listeners.
- **Semantic & Accessible Markup**: Ensure proper heading order (`h1` -> `h2` -> `h3`), ARIA labels on icon buttons, and high-contrast color standards.
- **Zero Inline Styles**: All styling must adhere to Tailwind CSS utility classes and design system tokens.
- **Deterministic Imports**: Leverage the configured path aliases rather than brittle relative paths (`../../`).

---

## 🔮 Future Roadmap

- [ ] **Phase 2 (Identity & Multi-Tenancy)**: Connect NextAuth / Supabase / Okta SSO with tenant subdomain routing and RBAC permission checks.
- [ ] **Phase 3 (Spatial 3D Hall Designer)**: Three.js WebGL canvas for interactive screen curvature, seating risers, and Dolby Atmos audio cones.
- [ ] **Phase 4 (Ticketing & Reservation Engine)**: High-concurrency seat locking with Redis and sub-second checkout.
- [ ] **Phase 5 (Box Office POS & Concessions)**: Counter register barcode scanning and kitchen display system sync.
- [ ] **Phase 6 (Payment Gateways & Ledgers)**: Multi-currency payment processing (Razorpay, Stripe) with automated distributor split settlements.

---

## 🤝 Contributing Guidelines

1. Create a feature branch: `git checkout -b feat/tenant-isolation-spec`.
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`).
3. Ensure all tests and linters pass: `pnpm run type-check && pnpm run lint`.
4. Submit a Pull Request targeting the `main` branch.

---

## 🔖 Version & License

- **Version**: `1.0.0-foundation`
- **License**: [MIT License](LICENSE) — Copyright © 2026 CineSphere OS Inc.
