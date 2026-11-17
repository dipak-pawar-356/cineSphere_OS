# Hall Analytics & Enterprise Hall Designer Architecture

**CineSphere OS — Phase 4: Parts 15 & 16**  
*Analytics Projection Layer, Read-Only Occupancy & Revenue Simulation Engine, Platform-Agnostic Scene Graph Abstraction, Plugin-Based Extension Framework, and Event-Driven Domain Architecture*

---

## 1. Executive Architectural Overview

Rather than reading analytics directly from mutable draft hall layouts or tightly coupling future 3D/VR/AR/AI/CAD/IoT capabilities to the 2D canvas editor, CineSphere OS introduces four foundational architectural boundaries across the Hall Designer Layout Core:

```
                              ┌───────────────────────────┐
                              │        Layout Core        │
                              │ (Immutable Published vN + │
                              │   Platform-Agnostic SG)   │
                              └─────────────┬─────────────┘
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │                                                 │
                   ▼                                                 ▼
      ┌─────────────────────────┐                      ┌───────────────────────────┐
      │ Analytics Projection    │                      │ Enterprise Extension      │
      │ Layer & BI Engine       │                      │ Layer (Plugin Registry)   │
      │ (Phase 4 – Part 15)     │                      │ (Phase 4 – Part 16)       │
      ├─────────────────────────┤                      ├───────────────────────────┤
      │ • Capacity & Sections   │                      │ • 3D Spatial Engine       │
      │ • Distribution & ADA    │                      │ • WebGL2 / WebGPU Adapter │
      │ • Occupancy Simulation  │                      │ • Three.js / R3F Adapter  │
      │ • Read-Only Revenue Sim │                      │ • VR & AR Engines         │
      │ • Design Health Score   │                      │ • AI Layout Advisor       │
      │ • Snapshot Ledger       │                      │ • Real-Time Collaboration │
      └────────────┬────────────┘                      │ • CAD / DXF / SVG / BIM   │
                   │                                   │ • Digital Twin & IoT Hub  │
                   ▼                                   └─────────────┬─────────────┘
          Dashboards & Reports                                       │
                                                                     ▼
                                                 ┌───────────────────────────────────┐
                                                 │ HallDesignerEventBus (Pub/Sub)    │
                                                 │ • LayoutPublished                 │
                                                 │ • SeatInventoryGenerated          │
                                                 │ • TemplateCreated                 │
                                                 │ • ValidationPassed                │
                                                 │ • LayoutArchived                  │
                                                 │ • AnalyticsProjectionRefreshed    │
                                                 │ • EnterpriseFeatureToggled        │
                                                 └───────────────────────────────────┘
```

---

## 2. Phase 4 – Part 15: Hall Analytics (Analytics Projection Layer)

### 2.1 Immutable Projection Invariant
- `HallAnalyticsEngine.buildProjection(...)` strictly accepts only `PUBLISHED` or `ARCHIVED` `LayoutVersion` records (paired optionally with immutable `InventorySnapshotRecord` data).
- Passing an editable `DRAFT` layout version throws `ValidationError("Immutable Projection Invariant Violation")`, preventing volatile work-in-progress designs from contaminating executive dashboards or historical trends.

### 2.2 Analytics Domains Computed (`lib/engine/hall-analytics-engine.ts`)
1. **Capacity Analytics:** Total seats, available/reserved/booked/blocked/maintenance counts (from inventory snapshots), VIP/Recliner/Couple/Standard counts, VIP & Premium ratios, accessible & companion seats, section capacities, and row capacities.
2. **Section Analytics:** Per-section seat counts, hall share %, category distribution, accessibility coverage %, premium distribution %, and average row density.
3. **Seat Distribution:** Category breakdown, seat ratios, 6-zone spatial statistics (`FRONT`, `MIDDLE`, `REAR`, `LEFT_WING`, `CENTER`, `RIGHT_WING`), and a `6×4` spatial `heatmapPlaceholder` (`READY_FOR_HISTORICAL_INGESTION`).
4. **Accessibility Analytics:** Accessible seat count, companion pairing count, `ACCESSIBLE_PATH` route count, `EMERGENCY_EXIT` count, `0–100` Accessibility Score, and ADA 2010 / ISO 21542 `compliancePlaceholder`.
5. **Occupancy Simulation:** Simulates `25%`, `50%`, `75%`, `100%`, and `PEAK_LOAD` occupancy scenarios along with an NFPA 101 `emergencyEvacuationPlaceholder` estimating full auditorium egress time in seconds.
6. **Read-Only Revenue Simulation (`isReadOnlyProjection: true`):** Uses `SeatInventoryEngine.resolveSeatPricing(...)` with dynamic show-time multipliers, day-type multipliers, convenience fees, and GST to project net/gross revenue, ATP, and RevPAS across occupancy tiers — strictly read-only, never mutating live pricing or bookings.
7. **Layout Health & Optimization Placeholders:** Weighted `0–100` composite `overallDesignHealth` (`seatDensityScore` 20%, `accessibilityScore` 25%, `geometryQuality` 20%, `sectionBalance` 15%, `validationScore` 20%) with letter grade (`A+` to `D`) and structured `optimizationSuggestions`.

### 2.3 Per-Theatre Analytics Configuration (`analytics_configurations`)

| Policy Dimension | Pune (`th-pun-001`) | Mumbai (`th-mum-002`) | Dubai (`th-dxb-003`) |
|---|---|---|---|
| **Revenue Simulation** | Enabled (`INR`, ₹250) | Disabled (`USD`, $18) | Enabled (`AED`, 65) |
| **Accessibility Reports** | Enabled | Enabled | Enabled |
| **VIP Analytics** | Enabled | Disabled | Enabled |
| **Premium Layout Metrics** | Enabled | Enabled | Enabled |
| **Occupancy Simulation** | Enabled | Enabled | Enabled |
| **Custom KPI Dashboard** | Disabled | Disabled | Enabled |
| **Advanced Capacity Analysis** | Enabled | Disabled | Enabled |

### 2.4 Database Schema (`db/schema/hall-analytics.ts`)
- `analytics_projections` (`analyticsProjections`)
- `hall_analytics` (`hallAnalytics`)
- `analytics_snapshots` (`analyticsSnapshots`)
- `analytics_configurations` (`analyticsConfigurations`)

### 2.5 Protected Server Actions (`actions/hall-analytics-actions.ts`)
- `generateHallAnalyticsAction`
- `refreshHallAnalyticsAction`
- `runHallSimulationsAction`
- `loadHallAnalyticsDashboardAction`
- `exportHallAnalyticsAction`
- `loadHallAnalyticsConfigAction`
- `saveHallAnalyticsConfigAction`

---

## 3. Phase 4 – Part 16: Enterprise Hall Designer Architecture

### 3.1 Platform-Agnostic Scene Graph Abstraction (`lib/engine/layout-scene-graph-engine.ts`)
- `LayoutSceneGraphEngine.compileSceneGraph(...)` converts any `LayoutVersion` + `StructuralObject[]` into a canonical `LayoutSceneGraph` normalized to `METERS`.
- **Hierarchy:** `ROOT` → `FLOOR_LEVEL` / `BALCONY_LEVEL` → `SECTION_GROUP` → `SEAT_MESH` & `SCREEN_SURFACE` / `STRUCTURAL_MESH`.
- **Shared 2D & 3D Primitives:** Includes stadium rake elevation math, seat sightline angle calculations, 4 camera rigs (`TOP_DOWN_2D`, `ORBIT_OVERVIEW`, `SEAT_POV`, `VR_STEREO`), PBR material definitions, lighting rig, LOD config, and declarative animation hooks.
- **Multi-Level Support:** Supports `MAIN_FLOOR`, `BALCONY`, `MEZZANINE`, `SKY_BOX`, and `VIP_LOUNGE` floor definitions with elevation meters, ceiling heights, and elevator connectivity flags.

### 3.2 Plugin-Based Extension Framework (`lib/engine/hall-extension-registry.ts`)
- Registers 12 built-in architectural adapters (`3D_ENGINE`, `WEBGL_RENDERER`, `THREEJS_ADAPTER`, `VR_ENGINE`, `AR_ENGINE`, `AI_ENGINE`, `COLLABORATION_ENGINE`, `DIGITAL_TWIN`, `CAD_IMPORT`, `BIM_ADAPTER`, `IOT_INTEGRATION`, `ENTERPRISE_TEMPLATES`) plus allows `SUPER_ADMIN` runtime registration of partner plugins via `registerHallExtensionAction`.
- Exposes lifecycle hooks (`onRegister`, `onEnable`, `onDisable`, `onSceneGraphCompiled`) with isolated error boundaries.

### 3.3 Event-Driven Domain Architecture (`lib/engine/hall-designer-event-bus.ts`)
- Publishes canonical Phase 4 events:
  - `LayoutPublished` (emitted by `PublishingWorkflowService`, subscribed to by `HallAnalyticsService` for automatic projection refresh)
  - `ValidationPassed` & `LayoutArchived` (emitted by `PublishingWorkflowService`)
  - `SeatInventoryGenerated` (emitted by `SeatInventoryIntegrationService`)
  - `TemplateCreated` (emitted by `HallTemplatesService`)
  - `AnalyticsProjectionRefreshed` & `EnterpriseFeatureToggled`

### 3.4 Per-Theatre Enterprise Capabilities (`enterprise_configurations`)

| Enterprise Capability | Pune (`th-pun-001`) | Mumbai (`th-mum-002`) | Dubai (`th-dxb-003`) |
|---|---|---|---|
| **3D Preview** | Enabled (`WEBGL2`, 60 FPS) | Enabled (`WEBGL2`, 90 FPS) | Enabled (`WEBGPU_PLACEHOLDER`, 120 FPS) |
| **VR Preview** | Disabled | Enabled (`VR_STEREO`) | Disabled |
| **AI Layout Suggestions** | Disabled | Disabled | Enabled |
| **Collaborative Editing** | Disabled | Enabled (CRDT, 12 editors) | Enabled (WebRTC, 16 editors) |
| **Multi-Floor Support** | Disabled (1 floor) | Enabled (2 floors) | Enabled (4 floors + Sky Box) |
| **Digital Twin & IoT Sensors** | Disabled | Disabled | Enabled (Seeded IoT Devices) |
| **CAD / BIM Placeholders** | Disabled | Disabled | Enabled |

### 3.5 Database Schema (`db/schema/enterprise-hall-designer.ts`)
- `enterprise_features` (`enterpriseFeatures`)
- `extension_registry` (`extensionRegistry`)
- `enterprise_configurations` (`enterpriseConfigurations`)
- `three_d_configurations` (`threeDConfigurations`)
- `collaboration_configurations` (`collaborationConfigurations`)

### 3.6 Protected Server Actions (`actions/enterprise-hall-designer-actions.ts`)
- `registerHallExtensionAction`
- `loadExtensionConfigurationAction`
- `enableEnterpriseFeatureAction`
- `disableEnterpriseFeatureAction`
- `loadEnterpriseSettingsAction`
- `compileLayoutSceneGraphAction`
- `saveThreeDConfigAction`
- `saveCollaborationConfigAction`
- `planCadImportAction`
- `getAiLayoutSuggestionsAction`
- `loadHallDomainEventsAction`

---

## 4. Verification & Developer Commands

```powershell
# TypeScript verification (0 errors)
pnpm run type-check

# Part 15: Hall Analytics verification (41 / 41 passed)
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-hall-analytics.ts

# Part 16: Enterprise Hall Designer verification (47 / 47 passed)
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-enterprise-hall-designer.ts
```
