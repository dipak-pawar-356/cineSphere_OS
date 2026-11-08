# CineSphere OS - Routes & Navigation Map

## 1. Public Guest Portal (`(public)`)

| Path | Description | Access |
|---|---|---|
| `/` | Cinema Landing Page, Hero Billboard & Quick Discovery | Public |
| `/movies` | Filterable Movie Catalog (Now Showing / Upcoming) | Public |
| `/movies/[id]` | Movie Overview, Cast & Crew, Trailers, Showtimes | Public |
| `/theatres` | Cinema Locator, City Selectors, Screen Specifications | Public |
| `/theatres/[id]` | Auditorium Profiles, Amenities, Driving Directions | Public |
| `/events` | Live Stand-Up, Concert Screenings, Motorsports F1 | Public |
| `/offers` | Promotions, Banking Discounts, Student Passes | Public |
| `/about` | Architecture Philosophy, Vision, Tech Stack | Public |
| `/contact` | 24/7 Guest Care Helpline, Office Map, FAQs | Public |

---

## 2. Super Admin Platform (`(super-admin)`)

The primary Super Admin Control Plane is hosted under `/dashboard/...` (with legacy `/admin` routes retained for Phase 1 compatibility):

| Path | Description | Access |
|---|---|---|
| `/dashboard` | Master Executive Governance Command Center & KPIs | Super Admin |
| `/dashboard/platform` | System Infrastructure Health & Edge Telemetry Studio | Super Admin |
| `/dashboard/theatres` | Cinema Onboarding & Theatre Approval Workflow Studio | Super Admin |
| `/dashboard/theatres/[id]` | Deep-Dive Multi-Tab Cinema Inspector (General, Admin, UPI, SaaS) | Super Admin |
| `/dashboard/subscriptions` | SaaS Commercial Plans & Tier Pricing Management | Super Admin |
| `/dashboard/payments` | Cross-Tenant Payments Ledger & Gateway Health | Super Admin |
| `/dashboard/bookings` | Cross-Tenant Bookings Ledger & Transaction Stream | Super Admin |
| `/dashboard/users` | Unified Multi-Tenant Identity Directory & Role Management | Super Admin |
| `/dashboard/reports` | Cross-Platform Financial, Tax & Operational Analytics (PDF/Excel/CSV) | Super Admin |
| `/dashboard/settings` | Platform Configuration Studio (Maintenance mode, fees, security) | Super Admin |
| `/dashboard/cities` | Metropolitan & Geographic Hub Governance (Tier 1/2/3, coords) | Super Admin |
| `/dashboard/amenities` | Master Luxury Cinema Amenities Catalog | Super Admin |
| `/dashboard/announcements` | System Broadcast & Targeted Push Dispatch Center | Super Admin |
| `/dashboard/support` | Enterprise Support Ticket Management Center | Super Admin |
| `/dashboard/audit` | Tamper-Evident Security & Compliance Audit Log Vault | Super Admin |
| `/dashboard/media` | Centralized Digital Media & Brand Asset Vault | Super Admin |
| `/admin` *(Legacy)* | Phase 1 Platform Overview | Super Admin |
| `/admin/theatres` *(Legacy)* | Phase 1 Cinema Circuit Onboarding | Super Admin |
| `/admin/movies` *(Legacy)* | Phase 1 Global Movie Distribution | Super Admin |
| `/admin/analytics` *(Legacy)* | Phase 1 Macro Revenue & Format Split | Super Admin |
| `/admin/system` *(Legacy)* | Phase 1 Service Health Telemetry | Super Admin |
| `/admin/settings` *(Legacy)* | Phase 1 Multi-Tenant Governance | Super Admin |

---

## 3. Theatre Admin Console (`(theatre-admin)`)

Default Flagship: *CineSphere Grand Cinemas* (`th-pun-001`, Phoenix Marketcity, Pune)

| Path | Description | Access |
|---|---|---|
| `/theatre` | Operational Overview & Today's Box Office | Theatre Admin |
| `/theatre/profile` | Cinema Profile, Address, Contact, Operating Hours | Theatre Admin |
| `/theatre/compliance` | Fire Safety, Health NOC & DCI Licenses | Theatre Admin |
| `/theatre/gallery` | High-Resolution Foyer & Auditorium Photos | Theatre Admin |
| `/theatre/amenities` | Projector Engines, Dolby Audio, Valet Specs | Theatre Admin |
| `/theatre/halls` | 8 Auditoriums, Screen Formats, Occupancy | Theatre Admin |
| `/theatre/halls/[id]` | Single Hall Seating Layout, Projector Specs | Theatre Admin |
| `/theatre/movies` | Active Movie Licenses & Prints Ingested | Theatre Admin |
| `/theatre/shows` | Daily Schedule Grid, Showtimes & Pricing | Theatre Admin |
| `/theatre/shows/create` | Program New Showtime, Hall Assignment | Theatre Admin |
| `/theatre/bookings` | Master Ticket Bookings Stream & QR Status | Theatre Admin |
| `/theatre/customers` | Customer CRM, Loyalty Tiers, Spend History | Theatre Admin |
| `/theatre/staff` | Roster, Shift Allocations, Employee Codes | Theatre Admin |
| `/theatre/revenue` | Gross Sales, F&B Concessions Split, SPH | Theatre Admin |
| `/theatre/payments` | Payment Gateway Settlements, UPI Reconciliations | Theatre Admin |
| `/theatre/transactions` | Real-Time Payment Log with Gateway References | Theatre Admin |
| `/theatre/offers` | Localized Theatre Promo Deals & Food Combos | Theatre Admin |
| `/theatre/events` | Venue Event Bookings & Live Broadcasts | Theatre Admin |
| `/theatre/analytics` | Peak Hours, Occupancy Heatmap, ATP Analysis | Theatre Admin |
| `/theatre/reports` | Daily Box Office, Occupancy & GST Exports | Theatre Admin |
| `/theatre/notifications`| Operational Broadcasts & Equipment Alerts | Theatre Admin |
| `/theatre/support` | Guest Care Helpdesk & Lost and Found Log | Theatre Admin |
| `/theatre/settings` | Operational Parameters, Turnstile QR Rules | Theatre Admin |
| `/theatre/media` | Creative Asset Vault, Posters, Logos & Photos | Theatre Admin |
| `/theatre/upi` | Dedicated UPI Rail, VPA & Settlement Gateways | Theatre Admin |

