# CineSphere OS - Developer Guidelines

## 1. Development Principles

To maintain enterprise-grade codebase health, all engineers must observe the following rules:

1. **Strict TypeScript:** No `any`, no implicit types, no `@ts-ignore` without explicit peer architectural review.
2. **Component Purity:** Keep components focused on presentation and state orchestration. Offload data transformations to pure helper functions in `lib/` or `data/utils/`.
3. **Responsive by Default:** Build mobile-first (320px) up to ultrawide cinema monitors (2560px). Utilize the `responsive-container` and `responsive-grid` primitives rather than ad-hoc nested flexboxes.
4. **Motion Gracefulness:** All animated surfaces must check for user motion preferences via `@media (prefers-reduced-motion)` or GSAP matchMedia.
5. **Zero Remote Push Policy:** Commits must remain purely local on developer branches unless explicit multi-agent coordination commands a remote sync.

---

## 2. Path Aliases

All imports should use the configured root aliases in `tsconfig.json`:

```typescript
import { Button } from "@/components/ui/button";
import { MOCK_MOVIES } from "@/data";
import { formatCurrency } from "@/data/utils/mock-formatters";
import { useResponsive } from "@/lib/motion/breakpoints";
import type { Movie, Hall } from "@/types";
```

---

## 3. Code Verification Commands

Before staging or committing any code, run the following verification suite:

```bash
# 1. Type Verification (Strict TypeScript compiler check)
pnpm run type-check

# 2. Linting Verification (Next.js ESLint rules)
pnpm run lint

# 3. Production Build Smoke Test (Edge runtime verification)
pnpm run build
```

---

## 4. Git Commit Standards

Follow the Conventional Commits specification:
- `feat:` A new feature or screen (e.g. `feat(theatre): add live auditorium sound diagnostics`)
- `fix:` A bug fix (e.g. `fix(common): escape unescaped apostrophes in showtimes`)
- `docs:` Documentation only changes (e.g. `docs: update architecture guide`)
- `style:` Changes that do not affect code logic (formatting, white-space)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Build process or tooling changes

