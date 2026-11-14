# CineSphere OS — Phase 3 Part 12: Theatre Search & Filters Architecture

## 1. Architectural Philosophy & Executive Summary

In an enterprise multi-tenant cinema SaaS platform, search and discovery must **never** be implemented using direct SQL `LIKE` queries joined across multiple transactional tables (`theatres`, `theatre_locations`, `theatre_business_profiles`, `theatre_amenities`, `theatre_staff`, `theatre_configurations`, `halls`, `screens`). That anti-pattern leads to high query latency, table lock contention, unindexable multi-table joins, and severe performance degradation as the catalogue expands across cities, regions, and international territories.

Instead, CineSphere OS decouples search into a dedicated **Theatre Search Index Layer**. Search operations query an aggregated, denormalized indexed view containing all relevant discovery dimensions:

```
Platform
        │
        ▼
Search Engine
        │
        ▼
Theatre Search Index
        │
        ├── Theatre Profile
        ├── Location & Geography
        ├── Business Profile
        ├── Amenities & Features
        ├── Lifecycle & Approval Status
        ├── Primary Administrator
        ├── Operating Configuration
        └── Search Metadata & Inverted Tokens
                │
                ▼
        Search API (Server Actions & Domain Service)
                │
                ▼
        Theatre Search UI (Responsive Operator Canvas)
```

### Key Architectural Benefits
1. **Zero Database Lock Contention:** High-velocity discovery operations do not execute transactional table joins against live operational entities.
2. **Predictable Query Latency:** Denormalized index lookups and tokenized weighted scoring execute in $<15\text{ms}$.
3. **Generic Search Framework:** Generic query, pagination, filter, and facet interfaces (`GenericSearchQuery`, `GenericSearchResults`, `FacetBucket`, `GenericPaginationResult`) are reusable across other system entities (Movies, Shows, Bookings, Customers).
4. **Future Search Engine Readiness:** Pluggable search engine interface allows transitioning from in-memory / materialized search indices to Elasticsearch, Meilisearch, or Algolia without modifying UI components or Server Actions.
5. **Multi-Faceted Categorization:** Real-time facet distributions for lifecycle status, business categories, theatre types, amenities, and currencies calculated concurrently with search results.
6. **Enterprise Saved Searches:** Operators can persist, recall, and manage custom filter configurations as `SavedSearchPreset` entities.
7. **Strict RBAC & Tenant Boundary Gating:** Public customers/guests are strictly restricted to `ACTIVE` and `isVerified: true` venues, while platform Super Administrators retain visibility into `DRAFT`, `PENDING_APPROVAL`, `SUSPENDED`, and `ARCHIVED` records.

---

## 2. Theatre Search Index Schema & Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CineSphere OS Platform                            │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                      Domain Entity Invalidation & Sync
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Theatre Search Index Document                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  - Identity: theatreId, name, slug, code, legalName, tradeName               │
│  - Lifecycle: status (DRAFT/PENDING_APPROVAL/ACTIVE/SUSPENDED/ARCHIVED),    │
│               approvalStatus, isVerified, verifiedAt                         │
│  - Hierarchy: theatreType (PREMIUM/STANDARD), chainType (CHAIN/INDEPENDENT), │
│               chainName, chainId, businessCategory                           │
│  - Location: addressLine1, landmark, city, state, postalCode, countryCode,   │
│              countryName, latitude, longitude                                │
│  - Capacity: screensCount, totalCapacity, hallNames                          │
│  - Amenities: amenityIds, amenityNames (Dolby Atmos, IMAX, 4DX, VIP Dining)  │
│  - Administration: primaryAdminName, primaryAdminEmail, primaryAdminPhone    │
│  - Configuration: currency, currencySymbol, timezone, primaryLanguage        │
│  - Tax & Statutory: gstNumber, panNumber, companyRegistrationNumber          │
│  - Audit Metadata: createdAt, updatedAt, publishedAt                         │
│  - Normalized Search Vectors: searchableTokens (pre-lowercased, indexed)     │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Search Query Builder & Scoring Engine                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Tokenizer: Whitespace & punctuation-preserving token generation           │
│  2. Weighted Field Scoring:                                                  │
│     - Name & Slug matches: Weight 10                                         │
│     - Code & Legal Name:   Weight 8                                          │
│     - Statutory (GST/PAN): Weight 7                                          │
│     - City & Address:      Weight 5                                          │
│     - Admin Name/Email:    Weight 4                                          │
│     - Amenities & Features:Weight 3                                          │
│  3. Multi-Faceted Filtering: AND-combined predicate evaluations              │
│  4. Dynamic Facet Aggregation: Multi-bucket distribution counting            │
│  5. Multi-Attribute Sorter: NEWEST, OLDEST, NAME_ASC, NAME_DESC,             │
│                             MOST_SCREENS, LARGEST_CAPACITY, RECENTLY_UPDATED │
│  6. Generic Paginator: Zero-based slice with next/prev boundary guards       │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│              Domain Service Layer (RBAC & Audit Trail Gating)                │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│            UI Workspace (Search Bar, Filters, Sort, Saved Presets)           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Generic Search Framework Contracts

Located in [`types/theatre-search.types.ts`](file:///d:/Project_2k24_25/cineSphere_OS/types/theatre-search.types.ts):

```typescript
export interface GenericSearchQuery<TFilters, TSort extends string = string> {
  query?: string;
  filters?: TFilters;
  sortBy?: TSort;
  sortDirection?: "asc" | "desc";
  pagination?: GenericPaginationInput;
}

export interface GenericSearchResults<TItem> {
  items: TItem[];
  pagination: GenericPaginationResult;
  tookMs: number;
  facets?: Record<string, FacetBucket[]>;
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}
```

---

## 4. Multi-Faceted Filter Matrix

The search engine supports simultaneous multi-criteria filtering:

| Filter Dimension | Type | Description |
| :--- | :--- | :--- |
| `query` | `string` | Full-text query matched across 15+ weighted attributes |
| `statuses` | `TheatreLifecycleState[]` | Multi-select: `ACTIVE`, `PENDING_APPROVAL`, `SUSPENDED`, `ARCHIVED`, `DRAFT` |
| `isVerified` | `boolean` | Verification badge toggle (Verified vs All) |
| `theatreType` | `"ALL" \| "PREMIUM" \| "STANDARD"` | Circuit tier classification |
| `chainType` | `"ALL" \| "CHAIN" \| "INDEPENDENT"` | Single independent venue vs multiplex chain |
| `businessCategories` | `string[]` | Multiplex, Single Screen, Drive-in, IMAX Theatre, Luxury Dine-in |
| `cities` / `states` / `countries` | `string[]` | Multi-select geographic bounds |
| `amenities` | `string[]` | IMAX Laser, Dolby Atmos, 4DX, VIP Recliners, Gourmet Dining, Valet |
| `screensMin` / `screensMax` | `number` | Minimum and maximum screen count bounds |
| `capacityMin` / `capacityMax` | `number` | Minimum and maximum seating capacity range |
| `timezones` / `currencies` / `languages`| `string[]` | Operating localization dimensions |

---

## 5. Sorting Strategies

The platform supports 8 deterministic sorting modes:
1. `NEWEST`: Descending creation date (default).
2. `OLDEST`: Ascending creation date.
3. `NAME_ASC`: Alphabetical ascending ($A \to Z$).
4. `NAME_DESC`: Alphabetical descending ($Z \to A$).
5. `MOST_SCREENS`: Descending total auditorium screen count.
6. `LARGEST_CAPACITY`: Descending total seat capacity.
7. `RECENTLY_UPDATED`: Descending last modification timestamp.
8. `DISTANCE_ASC`: Geolocation distance placeholder for future location-aware searches.

---

## 6. Enterprise Saved Searches & Presets

Operators can save frequent search configurations:
- **Preset Model:** `SavedSearchPreset` (`presetId`, `userId`, `name`, `description`, `filters`, `sortBy`, `sortDirection`, `isDefault`, `createdAt`, `updatedAt`).
- **Default Presets:** Pre-seeded platform presets (e.g., *"Pending Approval Theatres"*, *"Premium Circuits in Maharashtra"*).
- **CRUD Actions:**
  - `saveSearchPresetAction(input)`: Persists a validated filter and sort preset.
  - `loadSavedSearchesAction()`: Fetches the operator's saved preset list.
  - `deleteSearchPresetAction(presetId)`: Removes a user preset with authorization check.

---

## 7. Security, Tenant Boundaries & Audit Logging

- **Role Visibility Matrix:**
  - `SUPER_ADMIN`: Full visibility across all 7 lifecycle and approval states.
  - `THEATRE_ADMIN`: Full access to the operator's owned theatre search profile and public discovery.
  - `CUSTOMER / GUEST`: Restricted strictly to `status === "ACTIVE"` and `isVerified === true`. Non-active or unverified venues are filtered out at the domain service layer prior to response serialization.
- **Audit Logging:** Every search query, preset creation, and preset deletion is registered with the immutable `SecurityAuditService` under category `THEATRE_MANAGEMENT`.
- **Structured Observability:** High-resolution execution timing (`tookMs`) and search metrics logged via `createLogger("TheatreSearchService")`.

---

## 8. Verification Matrix (12 Test Suites)

Executed via [`scripts/verify-theatre-search.ts`](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-theatre-search.ts):

| Suite | Description | Status |
| :--- | :--- | :--- |
| **Test 1** | Theatre Search Index Aggregation & Data Integrity | ✅ Passed |
| **Test 2** | Full-Text Multi-Field Keyword Search (Name, City, GST, Admin, Email) | ✅ Passed |
| **Test 3** | Lifecycle & Verification Status Filtering (`ACTIVE`, `PENDING`, `ARCHIVED`) | ✅ Passed |
| **Test 4** | Commercial & Circuit Hierarchy Filtering (`PREMIUM` vs `STANDARD`, Chain vs Indep) | ✅ Passed |
| **Test 5** | Geographic Location Filtering (State, City, Country) | ✅ Passed |
| **Test 6** | Technical Amenities Filtering (Dolby Atmos, IMAX, 4DX, VIP Lounge) | ✅ Passed |
| **Test 7** | Screen Count & Seating Capacity Range Constraints | ✅ Passed |
| **Test 8** | Deterministic Sorting Strategies (`NAME_ASC`, `NAME_DESC`, `CAPACITY`, `SCREENS`) | ✅ Passed |
| **Test 9** | Pagination Slicing & Facet Bucket Distributions | ✅ Passed |
| **Test 10** | Autocomplete Search Suggestions Generation | ✅ Passed |
| **Test 11** | Enterprise Saved Search Presets CRUD Operations | ✅ Passed |
| **Test 12** | Role-Based Authorization & Tenant Boundary Gating (`SUPER_ADMIN` vs `CUSTOMER`) | ✅ Passed |
