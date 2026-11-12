# CineSphere OS — Theatre Profile Management Architecture (Phase 3 – Part 3)

## 1. Theatre Profile Architecture Overview

The **Theatre Profile Management** module keeps the core `theatres` tenant entity lightweight (holding only Tenant Identity, Status, and Lifecycle pointers) while isolating public and business-facing attributes inside dedicated profile tables:

```
Platform
  │
  ▼
Theatre (Identity · Lifecycle · Status · Tenant Boundary)
  │
  ▼
TheatreProfile (theatre_profiles)
  ├── Basic Information      (Theatre Name, Legal Name, Display Name, Descriptions, Established Year, Category Type)
  ├── Public Profile Slug    (publicSlug decoupled from internal theatre.slug)
  ├── Business Information   (Screens Count, Total & Avg Capacity, Website, Contact Placeholders)
  ├── TheatreLanguage        (Multi-language support + single Primary Language)
  ├── TheatreSocialLink      (Website, Facebook, Instagram, X, YouTube, LinkedIn, Threads, Custom)
  ├── Localization Map       (localizedFields JSONB keyed by locale code for future translation)
  ├── Completion Score       (0–100 score combining profile setup + Branding Module Logo/Banner)
  └── TheatreProfileVersion  (Immutable change snapshots tracking previousValues & updatedFields)
```

---

## 2. Profile Entity & Public Slug Separation

Defined in `db/schema/theatre-profile.ts` (`theatreProfiles`) and typed in `types/theatre-profile.types.ts` (`TheatreProfileRecord`):

- **Identity & Governance:** `id`, `theatreId` (unique FK -> `theatres.id`), `version` (optimistic locking), `status` (`DRAFT` | `PUBLISHED` | `HIDDEN` | `ARCHIVED`), `createdAt`, `updatedAt`.
- **Dedicated Public Profile Slug (`publicSlug`):** Stored independently from `theatres.slug` (`internalTheatreSlug`). Both slugs can resolve on the public discovery layer without altering internal tenant routing keys.
- **Localization Support (`localizedFields`):** Optional multi-locale copy overrides (`theatreName`, `displayName`, `shortDescription`, `fullDescription`, `aboutTheatre`, `tagline`) keyed by locale (`en`, `hi`, etc.), allowing zero-schema-change multilingual expansion.
- **Categories & Ownership:** Supports `MULTIPLEX`, `SINGLE_SCREEN`, `LUXURY_CINEMA`, `DRIVE_IN_CINEMA`, `MINI_THEATRE`, `INDEPENDENT_THEATRE`, `CHAIN_THEATRE`, and extensible `CUSTOM` (`customTheatreType`), paired with `CHAIN` / `INDEPENDENT` (`ownershipModel`).

---

## 3. Business Information & Profile Completion Score

- **Capacity Derivation:** `averageCapacityPerScreen` is computed consistently as `Math.round(totalSeatingCapacity / screensCount)` and validated to reject sub-threshold ratios (`totalSeatingCapacity >= screensCount * 10`).
- **Profile Completion Score (`0–100`):** Evaluated dynamically by `computeProfileCompletion` across 8 onboarding milestones, including live checks against `TheatreMediaRepository` (`hasLogoUploaded`, `hasBannerUploaded`):
  1. Basic Identity & Legal Name (`15%`)
  2. Descriptions & About Theatre (`15%`)
  3. Active Logo uploaded in Branding Studio (`15%`)
  4. Active Banner uploaded in Branding Studio (`10%`)
  5. Official Website configured (`15%`)
  6. Active Social Links connected (`10%`)
  7. Supported Languages & Primary Language set (`10%`)
  8. Screens Count & Seating Capacity verified (`10%`)

---

## 4. Language Support & Social Presence

- **`TheatreLanguage` (`theatre_languages`):** Stores `languageCode`, `displayName`, and `isPrimary`. Domain service (`TheatreProfileService.updateLanguages`) deduplicates codes and guarantees exactly one primary language, keeping `primaryLanguageCode` synchronized on the parent profile. Supported presets include `English`, `Hindi`, `Marathi`, `Tamil`, `Telugu`, `Kannada`, `Malayalam`, `Gujarati`, `Punjabi`, and `Bengali`, plus custom ISO codes.
- **`TheatreSocialLink` (`theatre_social_links`):** Supports `WEBSITE`, `FACEBOOK`, `INSTAGRAM`, `X_TWITTER`, `YOUTUBE`, `LINKEDIN`, `THREADS`, and `CUSTOM`. Server-side Zod validation (`TheatreSocialLinkInputSchema`) enforces `http://` / `https://` protocol safety, strips XSS/script payloads via `sanitizeUrl`, and verifies domain hints for standard social networks.

---

## 5. Profile Versioning & Future Rollback

Every create, field edit, status transition, language change, social link change, or rollback writes an immutable record in `theatre_profile_versions` (`TheatreProfileVersionRecord`) capturing:
- `versionNumber`
- `previousValues` & `nextValues`
- `updatedFields` (`string[]`)
- `changeSummary`
- `updatedBy`, `updatedByRole`, `updatedAt`

`rollbackToVersion` restores field values from `previousValues` cleanly as a non-destructive forward version increment (`vN -> vN+1`).

---

## 6. Security, Tenant Isolation, Caching & Developer Notes

### Protected Server Actions (`actions/theatre-profile-actions.ts`)
- `createTheatreProfileAction`
- `updateTheatreProfileAction`
- `publishTheatreProfileAction`
- `hideTheatreProfileAction`
- `archiveTheatreProfileAction` (`SUPER_ADMIN` only)
- `retrieveTheatreProfilesAction`
- `getTheatreProfileDetailAction`
- `updateTheatreLanguagesAction`
- `updateTheatreSocialLinksAction`
- `rollbackTheatreProfileVersionAction`
- `getPublicTheatreProfileAction` (public discovery projection joining active Logo & Banner from Phase 3 Part 2 Branding Module)

### Search, Filters & Role Boundaries
- **Search:** Matches `Theatre Name`, `Legal Name`, `Theatre Type`, `Language`, and `Website`.
- **Filters:** `Theatre Type`, `Ownership Model (Chain / Independent)`, `Status (Published / Draft / Hidden / Archived)`, `Language`, and `Established Year`.
- **Tenant Isolation:** `THEATRE_ADMIN` operations validate ownership via `tenantService.assertTenantAccess` and pre-pagination query scoping (`scopedTenantId`).
- **Cache Hooks:** Uses `CACHE_TAGS.THEATRE_PROFILE(theatreId)` and `CACHE_TAGS.PUBLIC_THEATRE_PROFILE(slugOrId)` with `withQueryCache` and `invalidateCacheByTag`.

### Verification Suite
Run `.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-theatre-profile.ts` to run all 10 verification suites.

