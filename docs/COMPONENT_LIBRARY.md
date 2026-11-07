# CineSphere OS - Component Library Guide

## 1. Component Philosophy

All components in CineSphere OS adhere to strict engineering standards:
- **Tailwind CSS v4 & CSS Variables:** Completely styling agnostic of hard-coded colors.
- **Composition over Inheritance:** Composable subcomponents (e.g. `CardHeader`, `CardContent`, `CardFooter`).
- **Full TypeScript Signatures:** Fully typed props with no implicit `any`.
- **Accessibility (a11y):** Keyboard navigation, ARIA attributes, semantic HTML.

---

## 2. Core UI Primitives (`components/ui/`)

| Component | Key Props | Description |
|---|---|---|
| `Button` | `variant` (`default`, `primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`, `icon`), `isLoading` | Interactive button primitive with active click ripple and disabled states. |
| `Badge` | `variant` (`default`, `primary`, `success`, `warning`, `danger`, `gold`, `outline`), `size` | Compact metadata pill for formats, statuses, and genres. |
| `Card` | `variant` (`default`, `glass`, `subtle`, `interactive`), `padding` | Elevated surface container with subtle glass border highlights. |
| `Input` | `label`, `error`, `icon`, `leftElement`, `rightElement` | Styled text input with floating label support and validation states. |
| `Select` | `options`, `value`, `onChange`, `placeholder` | Accessible select dropdown with chevron indicator. |
| `Modal` | `isOpen`, `onClose`, `title`, `description`, `size` | Backdrop-blurred dialog overlay with escape key listener and focus trap. |
| `Tabs` | `tabs`, `activeTab`, `onChange`, `variant` | Horizontal tab navigation rail with animated active indicator. |
| `Table` | `columns`, `data`, `emptyText` | Semantic data table container with hover rows and responsive wrapping. |
| `Avatar` | `src`, `alt`, `fallback`, `size`, `status` | User profile avatar with fallback initials and duty status ring. |
| `Drawer` | `isOpen`, `onClose`, `position` (`left`, `right`) | Slide-over drawer container for mobile navigation and detail sheets. |

---

## 3. Cinema Domain Components (`components/cards/` & `components/common/`)

### `MovieCard` (`components/cards/movie-card.tsx`)
- Standardized vertical movie poster (aspect ratio 2:3).
- Format overlay chips (IMAX, Dolby Cinema).
- Certification badge (U/A 16+, A, U).
- Hover metadata sheen revealing director, duration, and "Book Tickets" CTA.

### `TheatreCard` (`components/cards/theatre-card.tsx`)
- Cinema chain badge and star rating display.
- Distance indicator in kilometers from user's selected location.
- Multi-format screen chips and amenities count.

### `ShowtimeChip` (`components/common/showtime-chip.tsx`)
- Time label with format indicator (e.g., "10:30 AM · IMAX").
- Language subtitle badge (e.g., "Eng Sub").
- Dynamic filling status indicator: "Filling Fast" (amber) or "Housefull" (red).

### `SeatLegend` (`components/common/seat-legend.tsx`)
- Unified visual guide showing color codes and pricing for:
  - Silver Tier (`₹400`)
  - Gold Tier (`₹550`)
  - Platinum Tier (`₹750`)
  - VIP Motorized Recliner (`₹1,100`)
  - Royal Suite Lounger (`₹1,500`)
  - Occupied / Booked Seat

### `MetricCard` (`components/cards/metric-card.tsx`)
- Key performance indicator card for Super Admin and Theatre Admin dashboards.
- Displays metric title, formatted value, positive/negative delta pill, and Lucide icon.

### `StatusBadge` (`components/common/status-badge.tsx`)
- Deterministic color variant mapping for statuses:
  - "Active" / "Operational" / "Confirmed" / "Paid" -> `success`
  - "Housefull" / "Cancelled" / "Failed" -> `danger`
  - "Pending" / "Maintenance" / "Filling Fast" -> `warning`
  - "Running" / "Tickets Open" -> `primary`

