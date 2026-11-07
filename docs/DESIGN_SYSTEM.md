# CineSphere OS - Luxury Cinema Design System

## 1. Aesthetic Foundations

The CineSphere OS visual identity reflects the ambiance of a world-class cinema pavilion:
- **True OLED Void:** Deep blacks (`#050507`, `#0A0B10`) prevent eye strain in darkened rooms and deliver true infinite contrast on modern OLED displays.
- **Cinema Red Accent:** Vibrant, electric red (`hsl(356, 92%, 52%)`) inspired by auditorium velvet drapery and premiere red carpets.
- **Cinema Gold:** Warm champagne gold (`hsl(43, 96%, 56%)`) reserved for VIP lounges, Royal Suites, and loyalty badges.
- **Glassmorphism:** Layered surfaces with high-blur diffusion (`backdrop-blur-xl`), subtle rim-lighting borders (`rgba(255, 255, 255, 0.08)`), and soft radial gradients.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex / Value | Usage |
|---|---|---|
| `--background` | `#050507` | Deepest root viewport background |
| `--surface-1` | `#0A0B10` | Base container & card background |
| `--surface-2` | `#12131A` | Elevated cards, dialogs, popovers |
| `--surface-3` | `#1A1B24` | Hover states, chips, input fields |
| `--border` | `#262730` | Subtle structural dividers |
| `--border-highlight` | `rgba(255,255,255,0.12)`| Hover rims and active glow outlines |
| `--primary` | `#E50914` | Primary CTAs, active badges, highlights |
| `--primary-glow` | `rgba(229,9,20,0.35)` | Radial backdrops and focus rings |
| `--gold` | `#F59E0B` | VIP recliners, reviews, loyalty tiers |
| `--success` | `#10B981` | Tickets confirmed, operational screens |
| `--warning` | `#F59E0B` | Fast filling shows, maintenance notice |
| `--danger` | `#EF4444` | Housefull, cancelled shows, errors |

---

## 3. Typography Scale

Powered by Next.js font optimization using `Geist Sans` (UI readability) and `Geist Mono` (timestamps, codes, prices):

- **Display:** 48px - 64px (`font-bold tracking-tight`) — Hero titles & cinema billboards.
- **Heading 1:** 32px - 40px (`font-bold tracking-tight`) — Page headers & dashboard titles.
- **Heading 2:** 24px - 28px (`font-semibold tracking-normal`) — Section titles & card groups.
- **Heading 3:** 18px - 20px (`font-medium`) — Card headlines & table headers.
- **Body Large:** 16px (`leading-relaxed`) — Synopsis, editorial text.
- **Body:** 14px (`leading-normal`) — Default interface text, descriptions.
- **Caption:** 12px (`font-medium tracking-wide`) — Badges, format labels, timestamps.
- **Micro:** 10px (`uppercase font-bold tracking-wider`) — Status chips, seat tags.

---

## 4. Seating Tier Color Guidelines

The design system standardizes seating colors across all booking flows:

- **Silver Tier:** Slate / Zinc (`text-zinc-400`, `border-zinc-700`)
- **Gold Tier:** Amber / Yellow (`text-amber-400`, `border-amber-500/50`)
- **Platinum Tier:** Sky / Cyan (`text-sky-400`, `border-sky-500/50`)
- **VIP Recliner:** Purple / Indigo (`text-purple-400`, `border-purple-500/50`)
- **Royal Suite Lounger:** Gold / Champagne (`text-yellow-300`, `border-yellow-400`)

---

## 5. Animation Tokens & Easing

- **Standard Duration:** 200ms - 350ms for micro-interactions (buttons, hovers, drawers).
- **Page Transitions:** 400ms - 600ms smooth fade and slide.
- **Easing Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Power4 Out equivalent) for buttery deceleration.
- **Reduced Motion:** Fully integrated with CSS `@media (prefers-reduced-motion: reduce)` and Lenis disable hooks.
