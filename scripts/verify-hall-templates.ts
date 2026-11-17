/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 14: Hall Templates Verification Suite
 * ==============================================================================
 * Automated test runner verifying the 8 built-in platform templates catalog,
 * template inheritance, custom template authoring, blueprint layout generation,
 * template immutability, and multi-tenant template governance.
 * ==============================================================================
 */

import { hallTemplatesService } from "../lib/services/hall-templates.service";
import { HallTemplatesRepository } from "../lib/repositories/hall-templates.repository";
import { HallTemplateEngine } from "../lib/engine/hall-template-engine";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  loadTemplatesAction,
  getTemplateDetailsAction,
  createTemplateAction,
  updateTemplateAction,
  duplicateTemplateAction,
  archiveTemplateAction,
  generateLayoutFromTemplateAction,
  loadTemplateConfigAction,
  saveTemplateConfigAction,
  restoreTemplateAction,
  previewTemplateAction,
  exportTemplateAction,
  importTemplateAction,
  syncInheritedTemplateAction,
  loadTemplateRegistryAction,
} from "../actions/hall-templates-actions";

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

async function runHallTemplatesVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 14: HALL TEMPLATES VERIFICATION");
  console.log("==================================================================\n");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage", "template:manage"],
    correlationId: "corr-pune-tpl-test",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mum-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage", "template:manage"],
    correlationId: "corr-mum-tpl-test",
  };

  // ----------------------------------------------------------------------------
  // Section 1: 8 Built-in Platform Templates Catalog
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: 8 Built-in Platform Templates Catalog ---");
  const builtIns = await hallTemplatesService.getTemplates(puneAdmin, "th-pun-001");
  assert(builtIns.length >= 8, `Catalog contains at least 8 built-in templates (Found: ${builtIns.length})`);

  const smallTpl = builtIns.find((t) => t.category === "SMALL_THEATRE");
  assert(Boolean(smallTpl), "Found Small Theatre template");
  assert(smallTpl!.seats.length === 40, "Small Theatre has 40 seats");

  const multiTpl = builtIns.find((t) => t.category === "MULTIPLEX");
  assert(Boolean(multiTpl), "Found Multiplex template");
  assert(multiTpl!.seats.length === 120, "Multiplex has 120 seats");

  const premTpl = builtIns.find((t) => t.category === "PREMIUM");
  assert(Boolean(premTpl), "Found Premium template");
  assert(premTpl!.seats.length === 60, "Premium has 60 seats");

  const imaxTpl = builtIns.find((t) => t.category === "IMAX");
  assert(Boolean(imaxTpl), "Found IMAX template");
  assert(imaxTpl!.seats.length === 180, "IMAX has 180 seats");

  const fdxTpl = builtIns.find((t) => t.category === "4DX");
  assert(Boolean(fdxTpl), "Found 4DX template");
  assert(fdxTpl!.seats.length === 80, "4DX has 80 seats");

  const openTpl = builtIns.find((t) => t.category === "OPEN_AIR");
  assert(Boolean(openTpl), "Found Open Air template");
  assert(openTpl!.seats.length === 150, "Open Air has 150 seats");

  const miniTpl = builtIns.find((t) => t.category === "MINI_THEATRE");
  assert(Boolean(miniTpl), "Found Mini Theatre template");
  assert(miniTpl!.seats.length === 24, "Mini Theatre has 24 seats");

  const audTpl = builtIns.find((t) => t.category === "AUDITORIUM");
  assert(Boolean(audTpl), "Found Auditorium template");
  assert(audTpl!.seats.length === 250, "Auditorium has 250 seats");

  // ----------------------------------------------------------------------------
  // Section 2: Template Inheritance & Custom Template Overrides
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Template Inheritance & Custom Templates ---");
  const customInherited = await hallTemplatesService.createTemplate(puneAdmin, {
    theatreId: "th-pun-001",
    name: "Pune VIP Gold Multiplex",
    code: "PUN_VIP_GOLD",
    category: "MULTIPLEX",
    description: "Customized multiplex template with extra VIP rows and recliner spacing",
    parentTemplateId: multiTpl!.id,
    canvasSettings: { ...multiTpl!.canvasSettings, theme: "dark" },
    gridConfig: { ...multiTpl!.gridConfig },
    sections: multiTpl!.sections,
    seats: multiTpl!.seats,
    structuralObjects: multiTpl!.structuralObjects,
  });

  assert(customInherited.theatreId === "th-pun-001", "Custom template assigned to Pune theatre");
  assert(customInherited.parentTemplateId === multiTpl!.id, "Tracks parent template ID for inheritance");
  assert(customInherited.isBuiltIn === false, "Custom template marked as isBuiltIn: false");

  // Attempt to modify platform built-in template - MUST BE REJECTED
  let platformMutationBlocked = false;
  try {
    await hallTemplatesService.updateTemplate(puneAdmin, {
      templateId: multiTpl!.id,
      theatreId: "th-pun-001",
      name: "Mutated Multiplex",
    });
  } catch (err: any) {
    platformMutationBlocked = err.name === "TenantAccessError" || err.message.includes("Immutable Platform Template");
  }
  assert(platformMutationBlocked, "Built-in platform templates are read-only and reject mutations");

  // ----------------------------------------------------------------------------
  // Section 3: Blueprint Layout Generation (Instantiate Layout Definition)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Blueprint Layout Generation ---");
  const genResult = await hallTemplatesService.generateLayoutFromTemplate(puneAdmin, {
    templateId: customInherited.id,
    theatreId: "th-pun-001",
    targetHallId: "hall-pun-aud2",
    layoutName: "Pune Screen 2 Luxury Layout",
    layoutDescription: "Generated from Pune VIP Gold Multiplex template",
  });

  assert(genResult.success === true, "Layout generation completed successfully");
  assert(genResult.layoutDefinitionId.startsWith("layout-"), "Generated valid layoutDefinitionId");
  assert(genResult.layoutVersionId.startsWith("ver-"), "Generated valid initial layoutVersionId (v1)");
  assert(genResult.totalSeats === 120, "Generated layout contains 120 seats matching template");
  assert(genResult.sourceTemplateId === customInherited.id, "Tracks source template ID");

  // ----------------------------------------------------------------------------
  // Section 4: Template Immutability (Core Invariant)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Template Immutability Invariant ---");
  const templateBefore = await hallTemplatesService.getTemplateById(puneAdmin, customInherited.id, "th-pun-001");
  assert(templateBefore.seats.length === 120, "Template seats count remains exactly 120");
  assert(templateBefore.versionNumber === 1, "Template version remains untouched at v1");

  // ----------------------------------------------------------------------------
  // Section 5: Template Duplication & Archiving
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Template Duplication & Archiving ---");
  const dupTemplate = await hallTemplatesService.duplicateTemplate(puneAdmin, {
    sourceTemplateId: customInherited.id,
    theatreId: "th-pun-001",
    newName: "Pune VIP Gold (Clone B)",
    newCode: "PUN_VIP_CLONE_B",
    customNotes: "Cloned for weekend festival setup",
  });

  assert(dupTemplate.id !== customInherited.id, "Duplicate template receives fresh unique ID");
  assert(dupTemplate.name === "Pune VIP Gold (Clone B)", "Duplicate template receives new name");

  const archived = await hallTemplatesService.archiveTemplate(puneAdmin, dupTemplate.id, "th-pun-001");
  assert(archived.status === "ARCHIVED", "Template status transitioned to ARCHIVED");

  // ----------------------------------------------------------------------------
  // Section 6: Multi-Tenant Template Library Isolation
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Multi-Tenant Template Library Isolation ---");
  const mumbaiTemplates = await hallTemplatesService.getTemplates(mumbaiAdmin, "th-mum-002");
  const foundPuneCustomInMumbai = mumbaiTemplates.some((t) => t.id === customInherited.id);
  assert(foundPuneCustomInMumbai === false, "Pune custom templates are invisible to Mumbai tenant");

  let crossTenantBlocked = false;
  try {
    await hallTemplatesService.getTemplateById(mumbaiAdmin, customInherited.id, "th-mum-002");
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError" || err.message.includes("restricted to theatre");
  }
  assert(crossTenantBlocked, "Direct cross-tenant template lookup blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 7: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");
  const actLoad = await loadTemplatesAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoad.success === true, "loadTemplatesAction executed cleanly");
  assert(Array.isArray(actLoad.data), "Action returned template array");

  const actDetails = await getTemplateDetailsAction(
    { theatreId: "th-pun-001", templateId: customInherited.id },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actDetails.success === true, "getTemplateDetailsAction executed cleanly");
  assert(actDetails.data?.id === customInherited.id, "Loaded exact template details");

  const actGenLayout = await generateLayoutFromTemplateAction(
    {
      theatreId: "th-pun-001",
      templateId: smallTpl!.id,
      targetHallId: "hall-pun-aud3",
      layoutName: "Pune Screen 3 Art-House",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actGenLayout.success === true, "generateLayoutFromTemplateAction executed cleanly");
  assert(actGenLayout.data?.totalSeats === 40, "Action generated 40-seat layout from Small Theatre template");

  const actLoadConfig = await loadTemplateConfigAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoadConfig.success === true, "loadTemplateConfigAction executed cleanly");

  const actSaveConfig = await saveTemplateConfigAction(
    { theatreId: "th-pun-001", maxCustomTemplates: 45 },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSaveConfig.success === true, "saveTemplateConfigAction executed cleanly");
  assert(actSaveConfig.data?.maxCustomTemplates === 45, "Updated max custom templates to 45");

  // ----------------------------------------------------------------------------
  // Section 8: Restore, Preview, Export/Import, Inheritance Sync & Registry
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 8: Restore, Preview, Export/Import, Inheritance Sync & Registry ---");
  const actRestore = await restoreTemplateAction(
    { theatreId: "th-pun-001", templateId: dupTemplate.id },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actRestore.success === true, "restoreTemplateAction executed cleanly");
  assert(actRestore.data?.status === "ACTIVE", "Archived template restored back to ACTIVE status");

  const actPreview = await previewTemplateAction(
    { theatreId: "th-pun-001", templateId: imaxTpl!.id },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actPreview.success === true, "previewTemplateAction executed cleanly");
  assert(actPreview.data?.totalSeats === 180, "Template preview reports exact IMAX seat capacity (180)");
  assert(actPreview.data?.totalSections === imaxTpl!.sections.length, `Template preview reports exact section count (${imaxTpl!.sections.length})`);

  const actExport = await exportTemplateAction(
    { theatreId: "th-pun-001", templateId: customInherited.id },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actExport.success === true, "exportTemplateAction executed cleanly");
  assert(actExport.data?.schemaVersion === "1.0", "Export envelope uses canonical schema v1.0");

  const actImport = await importTemplateAction(
    {
      theatreId: "th-pun-001",
      envelope: actExport.data!,
      overrideName: "Pune Imported Multiplex Clone",
      overrideCode: "PUN_IMP_CLONE",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actImport.success === true, "importTemplateAction executed cleanly");
  assert(actImport.data?.theatreId === "th-pun-001", "Imported template isolated to Pune tenant");
  assert(actImport.data?.seats.length === 120, "Imported template preserved all 120 seats");

  const actSyncInherit = await syncInheritedTemplateAction(
    {
      theatreId: "th-pun-001",
      templateId: "tpl-th-pun-001-premium-multiplex",
      preserveCanvasOverrides: true,
      preserveSectionColors: true,
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSyncInherit.success === true, "syncInheritedTemplateAction executed cleanly");
  assert(actSyncInherit.data?.preservedOverrides.includes("sectionColors") === true, "Inheritance sync preserved custom Pune section colors");
  assert(actSyncInherit.data?.newVersionNumber === 2, "Inheritance sync incremented custom template version to v2");

  const actRegistry = await loadTemplateRegistryAction(
    { theatreId: "th-pun-001", includeArchived: true },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actRegistry.success === true, "loadTemplateRegistryAction executed cleanly");
  assert((actRegistry.data?.length ?? 0) >= 11, "Template registry lists 8 built-ins + Pune seeded & custom templates");

  console.log("\n==================================================================");
  console.log("HALL TEMPLATES VERIFICATION COMPLETED");
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runHallTemplatesVerification().catch((err) => {
  console.error("FATAL ERROR IN HALL TEMPLATES VERIFICATION:", err);
  process.exit(1);
});
