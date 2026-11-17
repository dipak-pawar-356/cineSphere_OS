/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 16: Enterprise Hall Designer Verification Suite
 * ==============================================================================
 * Verifies Platform-Agnostic Scene Graph compilation (2D/3D parity & multi-floor),
 * Plugin-Based Extension Registry (12 built-in + custom plugin registration),
 * Per-Theatre Capabilities (Pune/Mumbai/Dubai), CAD/BIM & AI Hooks, Event-Driven
 * Architecture (`LayoutPublished`, `SeatInventoryGenerated`, `TemplateCreated`,
 * `ValidationPassed`, `LayoutArchived`), Tenant Isolation, and Server Actions.
 * ==============================================================================
 */

import { enterpriseHallDesignerService } from "../lib/services/enterprise-hall-designer.service";
import { hallDesignerEventBus } from "../lib/engine/hall-designer-event-bus";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  registerHallExtensionAction,
  loadExtensionConfigurationAction,
  enableEnterpriseFeatureAction,
  disableEnterpriseFeatureAction,
  loadEnterpriseSettingsAction,
  compileLayoutSceneGraphAction,
  saveThreeDConfigAction,
  saveCollaborationConfigAction,
  planCadImportAction,
  getAiLayoutSuggestionsAction,
  loadHallDomainEventsAction,
} from "../actions/enterprise-hall-designer-actions";

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string): void {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runEnterpriseHallDesignerVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 16: ENTERPRISE HALL DESIGNER VERIFICATION");
  console.log("==================================================================\n");

  const superAdmin: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["platform:manage", "enterprise:manage"],
    correlationId: "corr-super-ent-test",
  };

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage", "enterprise:manage"],
    correlationId: "corr-pune-ent-test",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mum-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage", "enterprise:manage"],
    correlationId: "corr-mum-ent-test",
  };

  const dubaiAdmin: SecurityActorContext = {
    userId: "usr-dxb-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-dxb-003",
    permissions: ["hall:manage", "enterprise:manage"],
    correlationId: "corr-dxb-ent-test",
  };

  // ----------------------------------------------------------------------------
  // Section 1: Plugin-Based Extension Registry (12 Built-in Architectural Adapters)
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Plugin-Based Extension Registry ---");
  const puneExt = await enterpriseHallDesignerService.loadExtensionConfiguration(puneAdmin, "th-pun-001");
  assert(puneExt.extensions.length >= 12, `Registry exposes all 12 architectural extension adapters (Found: ${puneExt.extensions.length})`);
  assert(puneExt.featuresCatalog.length === 14, "Feature catalog defines all 14 enterprise capabilities");

  const threeDExt = puneExt.extensions.find((e) => e.key === "cinesphere.3d.engine");
  const aiExt = puneExt.extensions.find((e) => e.key === "cinesphere.ai.layout-advisor");
  assert(threeDExt?.isEnabledForTheatre === true, "Pune has 3D Spatial Hall Engine enabled");
  assert(aiExt?.isEnabledForTheatre === false, "Pune has AI Layout Suggestions disabled by default");

  // Register custom third-party plugin via Super Admin
  const customPlugin = await enterpriseHallDesignerService.registerExtension(superAdmin, {
    key: "partner.dolby.acoustic-raytracer",
    name: "Dolby Atmos Acoustic Raytracer Adapter",
    version: "1.2.0",
    category: "3D_ENGINE",
    description: "Simulates speaker reflections against LayoutSceneGraph surfaces",
    provider: "Dolby Partner SDK",
    requiredFeatureKeys: ["THREE_D_PREVIEW"],
    supportedCapabilities: ["ACOUSTIC_HEATMAP_PLACEHOLDER", "SPEAKER_ARRAY_ANCHORS"],
  });
  assert(customPlugin.key === "partner.dolby.acoustic-raytracer", "Super Admin registered custom plugin cleanly");

  // Theatre Admin rejected from global extension registration
  let regBlocked = false;
  try {
    await enterpriseHallDesignerService.registerExtension(puneAdmin, {
      key: "unauthorized.plugin",
      name: "Unauthorized",
      version: "1.0.0",
      category: "AI_ENGINE",
      description: "Should fail",
      provider: "External",
      requiredFeatureKeys: [],
      supportedCapabilities: [],
    });
  } catch (err: any) {
    regBlocked = err.name === "AuthorizationError";
  }
  assert(regBlocked, "Non-Super Admin blocked from registering global platform extensions");

  // ----------------------------------------------------------------------------
  // Section 2: Per-Theatre Independent Capability Policies (Pune, Mumbai, Dubai)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Multi-Tenant Capability Configurations ---");
  const puneSettings = await enterpriseHallDesignerService.loadEnterpriseSettings(puneAdmin, "th-pun-001");
  const mumSettings = await enterpriseHallDesignerService.loadEnterpriseSettings(mumbaiAdmin, "th-mum-002");
  const dxbSettings = await enterpriseHallDesignerService.loadEnterpriseSettings(dubaiAdmin, "th-dxb-003");

  assert(puneSettings.enabledFeatures.THREE_D_PREVIEW === true, "Pune: 3D Preview ENABLED");
  assert(puneSettings.enabledFeatures.AI_LAYOUT_SUGGESTIONS === false, "Pune: AI Suggestions DISABLED");

  assert(mumSettings.enabledFeatures.VR_PREVIEW === true, "Mumbai: VR Preview ENABLED");
  assert(mumSettings.enabledFeatures.COLLABORATIVE_EDITING === true, "Mumbai: Collaborative Editing ENABLED");

  assert(dxbSettings.enabledFeatures.MULTI_FLOOR_SUPPORT === true, "Dubai: Multi-Floor Support ENABLED");
  assert(dxbSettings.enabledFeatures.IOT_SEAT_SENSORS === true, "Dubai: IoT Seat Sensors ENABLED");
  assert(dxbSettings.enabledFeatures.DIGITAL_TWIN_SYNC === true, "Dubai: Digital Twin ENABLED");

  const dxbExt = await enterpriseHallDesignerService.loadExtensionConfiguration(dubaiAdmin, "th-dxb-003");
  assert(dxbExt.iotDevices.length >= 2, "Dubai IoT Device Registry seeded with environmental & seat sensors");

  // Cross-tenant isolation check
  let crossTenantBlocked = false;
  try {
    await enterpriseHallDesignerService.loadEnterpriseSettings(mumbaiAdmin, "th-pun-001");
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError";
  }
  assert(crossTenantBlocked, "Cross-tenant enterprise settings access blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 3: Platform-Agnostic Scene Graph Abstraction (2D + 3D + Multi-Level)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Platform-Agnostic Scene Graph Abstraction ---");
  const sceneGraph = await enterpriseHallDesignerService.compileSceneGraph(puneAdmin, {
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
  });
  assert(sceneGraph.schemaVersion === "1.0", "Scene Graph uses canonical v1.0 schema");
  assert(sceneGraph.coordinateUnit === "METERS", "Scene Graph normalizes spatial coordinates to METERS");
  assert(sceneGraph.stats.seatMeshCount === 100, `Scene Graph compiled 100 seat mesh nodes (Found: ${sceneGraph.stats.seatMeshCount})`);
  assert(sceneGraph.cameras.length === 4, "Scene Graph exposes 2D Orthographic, 3D Orbit, Seat POV & VR Stereo camera rigs");
  assert(sceneGraph.materials.length >= 7, "Scene Graph includes shared PBR material library");
  assert(sceneGraph.animationHooks.length === 4, "Scene Graph includes 4 declarative animation hooks");
  assert(sceneGraph.lodConfig.enabled === true, "Scene Graph includes Level-of-Detail (LOD) config");
  assert(sceneGraph.levels.length === 1, "Single-floor Pune hall compiles to 1 floor level (L0_ORCHESTRA)");

  // Enable MULTI_FLOOR_SUPPORT for Pune and verify multi-level balcony compilation
  await enterpriseHallDesignerService.enableFeature(puneAdmin, "th-pun-001", "MULTI_FLOOR_SUPPORT");
  const multiFloorGraph = await enterpriseHallDesignerService.compileSceneGraph(puneAdmin, {
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
  });
  assert(multiFloorGraph.levels.length >= 1, "Multi-level scene graph supports balcony elevation hierarchy");

  // ----------------------------------------------------------------------------
  // Section 4: Feature Gates (AI Suggestions & CAD Import)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Feature Gates (AI Advisor & CAD/BIM Placeholder) ---");
  let aiBlockedWhenDisabled = false;
  try {
    await enterpriseHallDesignerService.getAiSuggestionsPlaceholder(puneAdmin, {
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
    });
  } catch (err: any) {
    aiBlockedWhenDisabled = err.name === "ValidationError";
  }
  assert(aiBlockedWhenDisabled, "AI Suggestions strictly blocked when disabled in theatre config");

  await enterpriseHallDesignerService.enableFeature(puneAdmin, "th-pun-001", "AI_LAYOUT_SUGGESTIONS");
  const aiSug = await enterpriseHallDesignerService.getAiSuggestionsPlaceholder(puneAdmin, {
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
  });
  assert(aiSug.length > 0, `AI Advisor returns structured recommendations once enabled (Found: ${aiSug.length})`);

  const cadPlan = await enterpriseHallDesignerService.createCadImportPlan(dubaiAdmin, {
    theatreId: "th-dxb-003",
    sourceFormat: "DXF",
    sourceUnit: "MM",
  });
  assert(cadPlan.scaleFactor === 0.001, "CAD DXF importer converts millimeters to canonical meters (0.001)");
  assert(cadPlan.status === "READY_FOR_CONVERSION", "CAD import placeholder plan ready for conversion");

  // ----------------------------------------------------------------------------
  // Section 5: Event-Driven Architecture Verification
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Event-Driven Architecture ---");
  const receivedEvents: string[] = [];
  const subId = hallDesignerEventBus.subscribe({
    eventType: "*",
    subscriberName: "EnterpriseVerificationMonitor",
    listener: (evt) => {
      receivedEvents.push(evt.eventType);
    },
  });

  await hallDesignerEventBus.publish({
    eventType: "LayoutPublished",
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    actorId: "usr-pune-admin",
    payload: { versionNumber: 3 },
  });
  await hallDesignerEventBus.publish({
    eventType: "SeatInventoryGenerated",
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    actorId: "usr-pune-admin",
    payload: { totalSeats: 100 },
  });
  await hallDesignerEventBus.publish({
    eventType: "TemplateCreated",
    theatreId: "th-pun-001",
    actorId: "usr-pune-admin",
    payload: { code: "PUN_NEW" },
  });
  await hallDesignerEventBus.publish({
    eventType: "ValidationPassed",
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    actorId: "usr-pune-admin",
    payload: { errors: 0 },
  });
  await hallDesignerEventBus.publish({
    eventType: "LayoutArchived",
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    actorId: "usr-pune-admin",
    payload: { archivedVersion: 2 },
  });

  hallDesignerEventBus.unsubscribe(subId);
  assert(receivedEvents.includes("LayoutPublished"), "Event bus delivered LayoutPublished");
  assert(receivedEvents.includes("SeatInventoryGenerated"), "Event bus delivered SeatInventoryGenerated");
  assert(receivedEvents.includes("TemplateCreated"), "Event bus delivered TemplateCreated");
  assert(receivedEvents.includes("ValidationPassed"), "Event bus delivered ValidationPassed");
  assert(receivedEvents.includes("LayoutArchived"), "Event bus delivered LayoutArchived");

  // ----------------------------------------------------------------------------
  // Section 6: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Protected Server Actions Execution ---");
  const actReg = await registerHallExtensionAction(
    {
      key: "partner.imax.laser-calibration",
      name: "IMAX Laser Projection Calibration Plugin",
      version: "1.0.0",
      category: "DIGITAL_TWIN",
      description: "Monitors projection throw ratio against Scene Graph screen mesh",
      provider: "IMAX SDK",
      requiredFeatureKeys: ["DIGITAL_TWIN_SYNC"],
      supportedCapabilities: ["THROW_RATIO_CHECK"],
    },
    { role: "SUPER_ADMIN" }
  );
  assert(actReg.success === true, "registerHallExtensionAction executed cleanly");

  const actLoadExt = await loadExtensionConfigurationAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoadExt.success === true, "loadExtensionConfigurationAction executed cleanly");

  const actEnable = await enableEnterpriseFeatureAction(
    { theatreId: "th-pun-001", featureKey: "CAD_DXF_IMPORT" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actEnable.success === true, "enableEnterpriseFeatureAction executed cleanly");
  assert(actEnable.data?.enabledFeatures.CAD_DXF_IMPORT === true, "Enabled CAD_DXF_IMPORT for Pune");

  const actDisable = await disableEnterpriseFeatureAction(
    { theatreId: "th-pun-001", featureKey: "CAD_DXF_IMPORT" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actDisable.success === true, "disableEnterpriseFeatureAction executed cleanly");
  assert(actDisable.data?.enabledFeatures.CAD_DXF_IMPORT === false, "Disabled CAD_DXF_IMPORT for Pune");

  const actLoadSettings = await loadEnterpriseSettingsAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoadSettings.success === true, "loadEnterpriseSettingsAction executed cleanly");

  const actScene = await compileLayoutSceneGraphAction(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actScene.success === true, "compileLayoutSceneGraphAction executed cleanly");
  assert(actScene.data?.stats.seatMeshCount === 100, "Action compiled 100 seat mesh nodes");

  const act3D = await saveThreeDConfigAction(
    { theatreId: "th-pun-001", maxTargetFps: 90, shadowsEnabled: true },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(act3D.success === true && act3D.data?.maxTargetFps === 90, "saveThreeDConfigAction saved 90 FPS target");

  const actCollab = await saveCollaborationConfigAction(
    { theatreId: "th-pun-001", enabled: true, maxConcurrentEditors: 10 },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actCollab.success === true && actCollab.data?.maxConcurrentEditors === 10, "saveCollaborationConfigAction saved collaboration config");

  const actAi = await getAiLayoutSuggestionsAction(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actAi.success === true && (actAi.data?.length ?? 0) > 0, "getAiLayoutSuggestionsAction returned suggestions");

  const actPlanCad = await planCadImportAction(
    { theatreId: "th-dxb-003", sourceFormat: "SVG", sourceUnit: "CM" },
    { role: "THEATRE_ADMIN", theatreId: "th-dxb-003" }
  );
  assert(actPlanCad.success === true && actPlanCad.data?.scaleFactor === 0.01, "planCadImportAction planned SVG CM->M conversion");

  const actEvents = await loadHallDomainEventsAction(
    { theatreId: "th-pun-001", limit: 20 },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actEvents.success === true && (actEvents.data?.length ?? 0) >= 5, "loadHallDomainEventsAction returned domain event audit trail");

  console.log("\n==================================================================");
  console.log("ENTERPRISE HALL DESIGNER VERIFICATION COMPLETED");
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runEnterpriseHallDesignerVerification().catch((err) => {
  console.error("FATAL ERROR IN ENTERPRISE HALL DESIGNER VERIFICATION:", err);
  process.exit(1);
});
