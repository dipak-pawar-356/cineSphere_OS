# CineSphere OS - Project Overview

> **Tagline:** The Operating System for Modern Cinemas  
> **Status:** Phase 1 Complete (Foundation, Design System, Layouts, Dashboard UIs, Responsive Motion & Mock Data Architecture)  
> **Target Audience:** Multi-Tenant Cinema Operators, Auditorium Managers, Box Office Staff, Platform Super Admins, and Moviegoers.

---

## 1. Executive Summary

**CineSphere OS** is an enterprise-grade multi-tenant Cinema Management Platform and Operating System engineered for modern cinema circuits. Unlike traditional consumer ticketing portals that act purely as retail storefronts, CineSphere OS integrates the entire vertical exhibition stack:

- **Auditorium Management:** Screen calibration, seating category layouts, projection engines, and acoustic profiling (IMAX with Laser, Dolby Atmos, 4DX, ScreenX).
- **Show Programming:** Intelligent schedule matrices, multi-language audio track mapping, and real-time turnstile verification.
- **Box Office & Concessions:** Integrated ticket booking, gourmet in-seat butler dispatch, automated reconciliation, and distributor split reporting.
- **Enterprise Multi-Tenancy:** Unified management plane allowing Super Admins to oversee regional multiplex circuits while granting localized Theatre Admins and Hall Managers autonomous control.

---

## 2. Core Personas & Role Hierarchy

```
                      ┌────────────────────────────────┐
                      │          Super Admin           │
                      │  (Platform Owner & Governance) │
                      └───────────────┬────────────────┘
                                      │
                      ┌───────────────▼────────────────┐
                      │         Theatre Admin          │
                      │ (Multiplex General Operations) │
                      └───────────────┬────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
┌───────────▼───────────┐                           ┌───────────▼───────────┐
│     Hall Manager      │                           │      Floor Staff      │
│ (Screen Ops & Audio)  │                           │  (Concessions & Gate) │
└───────────┬───────────┘                           └───────────┬───────────┘
            │                                                   │
            └─────────────────────────┬─────────────────────────┘
                                      │
                      ┌───────────────▼────────────────┐
                      │            Customer            │
                      │  (Guest Discovery & Ticketing) │
                      └────────────────────────────────┘
```

1. **Super Admin:** Platform owner overseeing global multi-tenant settings, cinema chain onboarding, distributor KDM ingestion, network health, and macro financial analytics.
2. **Theatre Admin:** Multiplex General Manager managing cinema halls, daily showtime schedules, localized ticket pricing, concessions inventory, staff shifts, and box office settlements.
3. **Hall Manager:** Technical lead responsible for projection lamp hours, audio matrix equalization, seating layout integrity, and real-time auditorium turnaround.
4. **Floor & Concession Staff:** Frontline personnel managing turnstile QR ticket validation, mobile box office counters, and in-seat dining delivery.
5. **Customer / Guest:** Cinephile discovering showtimes, booking premium seats, pre-ordering gourmet snacks, and managing digital wallet passes.

---

## 3. Technology Stack

- **Framework:** Next.js 15.5.29 (App Router)
- **Runtime & UI Engine:** React 19, TypeScript 5.9
- **Styling:** Tailwind CSS v4, Custom CSS Tokens, Glassmorphism
- **Iconography:** Lucide React
- **Motion & Interactions:** GSAP (GreenSock), Lenis Smooth Scroll
- **Package Manager:** pnpm v10+
- **Hosting Target:** Vercel Edge Runtime / Multi-Region Cloudflare CDN

---

## 4. Phase 1 Achievements

Phase 1 establishes the complete static foundation without premature backend coupling:
- 100% type-safe models across all cinema business domains.
- 50+ interactive pages across Public, Super Admin, and Theatre Admin portals.
- 25+ reusable UI and cinema-specific component primitives.
- Mobile (320px) to Ultrawide (2560px) responsive layout system.
- Accessible motion framework with `prefers-reduced-motion` compliance.
- Realistic, localized Indian cinema mock data layer (INR `₹`, `en-IN`, `Asia/Kolkata`).

