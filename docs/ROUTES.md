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

## 2. Super Admin Control Plane (`(admin)`)

| Path | Description | Access |
|---|---|---|
| `/admin` | Platform Overview, Gross Box Office, Admissions | Super Admin |
| `/admin/theatres` | Cinema Circuit Onboarding & License Approvals | Super Admin |
| `/admin/movies` | Global Movie Distribution & CBFC Ingestion | Super Admin |
| `/admin/analytics` | Macro Revenue, City Breakdown, Format Split | Super Admin |
| `/admin/system` | Service Health Telemetry, Redis, Edge CDN | Super Admin |
| `/admin/settings` | Multi-Tenant Governance, Currency, GST Rules | Super Admin |

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

