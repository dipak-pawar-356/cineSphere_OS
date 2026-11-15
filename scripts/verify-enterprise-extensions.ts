/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extensions Verification Test Suite (Phase 3 – Part 16)
 * ==============================================================================
 * 14 comprehensive test categories validating the Enterprise Extension Framework:
 * 1. Domain Event Bus Pub/Sub Delivery & Unsubscribe
 * 2. Domain Event Bus Priority Sorting & Ordering
 * 3. Domain Event Bus Predicate Filtering
 * 4. Domain Event Bus Error Isolation & Resilience
 * 5. Domain Event Bus History, Buffer Limits & Replay
 * 6. 4-Tier Feature Flag Cascading Precedence (User > Theatre > Org > Platform > Default)
 * 7. Feature Flag Scoped Override Removal & Granular Scope Isolation
 * 8. Deterministic Canary Rollout Hashing & Percentage Boundaries
 * 9. Extension SDK Lifecycle Hooks (Install, Enable, Disable, Upgrade)
 * 10. Extension SDK Dependency Validation & Cascade Checks
 * 11. Extension SDK Route, Permission & Job Aggregation
 * 12. Organization Hierarchy, Franchises & Corporate Accounts
 * 13. Dynamic & Surge Pricing Rule Evaluation & Formatting
 * 14. IoT Device Registry & Telemetry Recording
 * + Service-Level Integration Tests & Security Actor Isolation
 * ==============================================================================
 */

import { EnterpriseDomainEventBus } from "../lib/enterprise/event-bus";
import { EnterpriseFeatureFlagManager } from "../lib/enterprise/feature-flags";
import { EnterpriseExtensionRegistry } from "../lib/enterprise/extension-sdk";
import { EnterpriseExtensionsRepository } from "../lib/repositories/enterprise-extensions.repository";
import { EnterpriseExtensionsService } from "../lib/services/enterprise-extensions.service";
import {
  OrganizationManagementModule,
  LoyaltyAndMembershipsModule,
  DynamicPricingRulesModule,
  DeviceAndIoTModule,
  EnterpriseApiModule,
} from "../lib/enterprise/mock-modules";
import {
  EnterpriseFeatureFlag,
  EnterpriseModuleDefinition,
  DomainEventPayload,
} from "../types/enterprise-extension-framework.types";
import { SecurityActorContext } from "../types/security-hardening.types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

async function runTestSuite() {
  console.log("\n==============================================================================");
  console.log("CineSphere OS — Enterprise Extension Framework Verification Suite (Part 16)");
  console.log("==============================================================================\n");

  const eventBus = EnterpriseDomainEventBus.getInstance();
  const featureFlags = EnterpriseFeatureFlagManager.getInstance();
  const extensionRegistry = EnterpriseExtensionRegistry.getInstance();
  const repository = EnterpriseExtensionsRepository.getInstance();
  const service = EnterpriseExtensionsService.getInstance();

  const superAdminActor: SecurityActorContext = {
    userId: "super-admin-test",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "test-super-corr",
  };
  const theatreAdminActor: SecurityActorContext = {
    userId: "theatre-admin-test",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["THEATRE_MANAGE"],
    correlationId: "test-theatre-corr",
  };
  const staffActor: SecurityActorContext = {
    userId: "staff-test",
    role: "STAFF",
    theatreId: "th-pun-001",
    permissions: ["SHOWS_VIEW"],
    correlationId: "test-staff-corr",
  };

  // ----------------------------------------------------------------------------
  // Suite 1: Domain Event Bus Pub/Sub Delivery & Unsubscribe
  // ----------------------------------------------------------------------------
  console.log("Suite 1: Domain Event Bus Pub/Sub Delivery & Unsubscribe");
  eventBus.reset();

  let receivedBookingEvent: DomainEventPayload | null = null;
  const subId1 = eventBus.subscribe({
    subscriberModuleId: "TEST_SUBSCRIBER_1",
    eventTypes: ["BOOKING_CONFIRMED"],
    priority: 10,
    handler: (evt) => {
      receivedBookingEvent = evt;
    },
  });

  assert(typeof subId1 === "string" && subId1.startsWith("sub_"), "Subscription ID generated with 'sub_' prefix");
  assert(eventBus.getSubscribers("BOOKING_CONFIRMED").length === 1, "Subscribers count matches registered listener");

  const publishRes1 = await eventBus.publish({
    eventType: "BOOKING_CONFIRMED",
    correlationId: "corr-book-101",
    tenantId: "th-pun-001",
    data: { bookingId: "bk-999", totalAmount: 750 },
  });

  assert(publishRes1.deliveredCount === 1, "Delivered count equals 1");
  assert(receivedBookingEvent !== null, "Subscriber received event payload");
  assert((receivedBookingEvent as any)?.data?.bookingId === "bk-999", "Event data matches payload");
  assert((receivedBookingEvent as any)?.tenantId === "th-pun-001", "Event carries tenant ID");

  // Unsubscribe test
  const unsubSuccess = eventBus.unsubscribe(subId1);
  assert(unsubSuccess === true, "Unsubscribe returns true for existing subscription");
  assert(eventBus.getSubscribers("BOOKING_CONFIRMED").length === 0, "Subscribers list empty after unsubscribe");

  const publishResUnsub = await eventBus.publish({
    eventType: "BOOKING_CONFIRMED",
    correlationId: "corr-book-102",
    data: { bookingId: "bk-1000" },
  });
  assert(publishResUnsub.deliveredCount === 0, "No delivery after listener unsubscribed");

  // ----------------------------------------------------------------------------
  // Suite 2: Domain Event Bus Priority Sorting & Ordering
  // ----------------------------------------------------------------------------
  console.log("\nSuite 2: Domain Event Bus Priority Sorting & Ordering");
  const executionOrder: string[] = [];

  eventBus.subscribe({
    subscriberModuleId: "LOW_PRIORITY_SUB",
    eventTypes: ["PAYMENT_COMPLETED"],
    priority: 10,
    handler: () => {
      executionOrder.push("LOW");
    },
  });

  eventBus.subscribe({
    subscriberModuleId: "HIGH_PRIORITY_SUB",
    eventTypes: ["PAYMENT_COMPLETED"],
    priority: 100,
    handler: () => {
      executionOrder.push("HIGH");
    },
  });

  eventBus.subscribe({
    subscriberModuleId: "MEDIUM_PRIORITY_SUB",
    eventTypes: ["PAYMENT_COMPLETED"],
    priority: 50,
    handler: () => {
      executionOrder.push("MEDIUM");
    },
  });

  assert(eventBus.getSubscribers("PAYMENT_COMPLETED").length === 3, "Registered 3 subscribers for PAYMENT_COMPLETED");

  await eventBus.publish({
    eventType: "PAYMENT_COMPLETED",
    correlationId: "corr-pay-202",
    data: { paymentId: "pay-111" },
  });

  assert(executionOrder.length === 3, "All 3 subscribers executed");
  assert(executionOrder[0] === "HIGH", "First executed is priority 100 (HIGH)");
  assert(executionOrder[1] === "MEDIUM", "Second executed is priority 50 (MEDIUM)");
  assert(executionOrder[2] === "LOW", "Third executed is priority 10 (LOW)");

  // ----------------------------------------------------------------------------
  // Suite 3: Domain Event Bus Predicate Filtering
  // ----------------------------------------------------------------------------
  console.log("\nSuite 3: Domain Event Bus Predicate Filtering");
  let puneEventsCount = 0;
  let dubaiEventsCount = 0;

  eventBus.subscribe({
    subscriberModuleId: "PUNE_FILTERED_SUB",
    eventTypes: ["SHOW_CREATED"],
    priority: 10,
    filterPredicate: (evt) => evt.tenantId === "th-pun-001",
    handler: () => {
      puneEventsCount++;
    },
  });

  eventBus.subscribe({
    subscriberModuleId: "DUBAI_FILTERED_SUB",
    eventTypes: ["SHOW_CREATED"],
    priority: 10,
    filterPredicate: (evt) => evt.tenantId === "th-dxb-003",
    handler: () => {
      dubaiEventsCount++;
    },
  });

  await eventBus.publish({
    eventType: "SHOW_CREATED",
    correlationId: "corr-show-1",
    tenantId: "th-mum-002",
    data: { showId: "show-mum-1" },
  });
  assert(puneEventsCount === 0, "Mumbai event filtered out by Pune predicate");
  assert(dubaiEventsCount === 0, "Mumbai event filtered out by Dubai predicate");

  await eventBus.publish({
    eventType: "SHOW_CREATED",
    correlationId: "corr-show-2",
    tenantId: "th-pun-001",
    data: { showId: "show-pun-1" },
  });
  assert(puneEventsCount === 1, "Pune predicate matches Pune show event");
  assert(dubaiEventsCount === 0, "Dubai subscriber still unaffected");

  await eventBus.publish({
    eventType: "SHOW_CREATED",
    correlationId: "corr-show-3",
    tenantId: "th-dxb-003",
    data: { showId: "show-dxb-1" },
  });
  assert(dubaiEventsCount === 1, "Dubai predicate matches Dubai show event");

  // ----------------------------------------------------------------------------
  // Suite 4: Domain Event Bus Error Isolation & Resilience
  // ----------------------------------------------------------------------------
  console.log("\nSuite 4: Domain Event Bus Error Isolation & Resilience");
  let resilientSubDelivered: boolean = false;

  eventBus.subscribe({
    subscriberModuleId: "FAILING_SUB",
    eventTypes: ["THEATRE_ACTIVATED"],
    priority: 100,
    handler: () => {
      throw new Error("Simulated fatal exception in subscriber handler!");
    },
  });

  eventBus.subscribe({
    subscriberModuleId: "RESILIENT_SUB",
    eventTypes: ["THEATRE_ACTIVATED"],
    priority: 50,
    handler: () => {
      resilientSubDelivered = true;
    },
  });

  const publishRes4 = await eventBus.publish({
    eventType: "THEATRE_ACTIVATED",
    correlationId: "corr-act-1",
    data: { theatreId: "th-pun-001" },
  });

  assert(publishRes4.errors.length === 1, "Captured error from failing subscriber without crashing the bus");
  assert(publishRes4.errors[0].subscriberModuleId === "FAILING_SUB", "Error tracks correct subscriber module ID");
  assert(publishRes4.errors[0].error.includes("Simulated fatal exception"), "Error message preserved in result");
  assert(Boolean(resilientSubDelivered), "Subsequent subscribers executed despite previous subscriber failure");
  assert(publishRes4.deliveredCount === 1, "Delivered count reflects successful delivery");

  // ----------------------------------------------------------------------------
  // Suite 5: Domain Event Bus History, Buffer Limits & Replay
  // ----------------------------------------------------------------------------
  console.log("\nSuite 5: Domain Event Bus History, Buffer Limits & Replay");
  const history = eventBus.getEventHistory({ limit: 10 });
  assert(history.length >= 6, "Event history recorded multiple dispatched domain events");
  assert(history[0].eventType === "THEATRE_ACTIVATED", "Most recent event is at index 0");

  const filteredHistory = eventBus.getEventHistory({ tenantId: "th-pun-001" });
  assert(filteredHistory.length > 0, "History has events for Pune tenant");
  assert(filteredHistory.every((e) => e.tenantId === "th-pun-001"), "History filtering by tenantId is 100% accurate");

  const showCreatedHistory = eventBus.getEventHistory({ eventType: "SHOW_CREATED" });
  assert(showCreatedHistory.length === 3, "History filtering by eventType returns exact 3 SHOW_CREATED events");

  eventBus.clearHistory();
  assert(eventBus.getEventHistory().length === 0, "clearHistory successfully empties the buffer");

  // ----------------------------------------------------------------------------
  // Suite 6: 4-Tier Feature Flag Cascading Precedence
  // ----------------------------------------------------------------------------
  console.log("\nSuite 6: 4-Tier Feature Flag Cascading Precedence");
  featureFlags.reset();

  const testFlagKey = "test.advanced_feature";
  const testFlag: EnterpriseFeatureFlag = {
    flagKey: testFlagKey,
    name: "Advanced Feature Test",
    description: "Testing 4-tier cascading precedence",
    valueType: "BOOLEAN",
    defaultValue: false,
    platformEnabled: true,
    organizationOverrides: {},
    theatreOverrides: {},
    userOverrides: {},
  };
  featureFlags.registerFlag(testFlag);

  // Tier 5: Default Fallback
  const resDefault = featureFlags.resolveFlag(testFlagKey, {});
  assert(resDefault.effectiveValue === false, "Tier 5: Effective value is false");
  assert(resDefault.resolvedLevel === "DEFAULT", "Tier 5: Resolved level is 'DEFAULT'");
  assert(resDefault.isOverridden === false, "Tier 5: Not overridden");

  // Tier 4: Platform Disable
  featureFlags.setPlatformFlag(testFlagKey, false);
  const resPlatformDisabled = featureFlags.resolveFlag(testFlagKey, {});
  assert(resPlatformDisabled.effectiveValue === false, "Tier 4: Global platform disable returns false");
  assert(resPlatformDisabled.resolvedLevel === "PLATFORM", "Tier 4: Resolved level is 'PLATFORM'");

  // Re-enable platform
  featureFlags.setPlatformFlag(testFlagKey, true);

  // Tier 3: Organization Override
  featureFlags.setOrganizationOverride(testFlagKey, "org-cinesphere-global", true);
  const resOrg = featureFlags.resolveFlag(testFlagKey, { organizationId: "org-cinesphere-global" });
  assert(resOrg.effectiveValue === true, "Tier 3: Org override value is true");
  assert(resOrg.resolvedLevel === "ORGANIZATION", "Tier 3: Resolved level is 'ORGANIZATION'");
  assert(resOrg.isOverridden === true, "Tier 3: isOverridden is true");

  // Unrelated Org falls back to Platform / Default
  const resOtherOrg = featureFlags.resolveFlag(testFlagKey, { organizationId: "org-apex-circuit" });
  assert(resOtherOrg.effectiveValue === false && resOtherOrg.resolvedLevel === "DEFAULT", "Unrelated org without override falls back to Default");

  // Tier 2: Theatre Override (overrides Organization)
  featureFlags.setTheatreOverride(testFlagKey, "th-pun-001", false);
  const resTheatre = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-pun-001",
  });
  assert(resTheatre.effectiveValue === false, "Tier 2: Theatre override value is false");
  assert(resTheatre.resolvedLevel === "THEATRE", "Tier 2: Resolved level is 'THEATRE'");
  assert(resTheatre.isOverridden === true, "Tier 2: isOverridden is true");

  // Another theatre under same Org still inherits Org override
  const resMumTheatre = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-mum-002",
  });
  assert(resMumTheatre.effectiveValue === true && resMumTheatre.resolvedLevel === "ORGANIZATION", "Sibling theatre without override inherits Org override");

  // Tier 1: User Override (overrides Theatre, Org, Platform)
  featureFlags.setUserOverride(testFlagKey, "usr-vip-001", true);
  const resUser = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-pun-001",
    userId: "usr-vip-001",
  });
  assert(resUser.effectiveValue === true, "Tier 1: User override value is true");
  assert(resUser.resolvedLevel === "USER", "Tier 1: Resolved level is 'USER'");
  assert(resUser.isOverridden === true, "Tier 1: isOverridden is true");

  // ----------------------------------------------------------------------------
  // Suite 7: Feature Flag Scoped Override Removal & Granular Scope Isolation
  // ----------------------------------------------------------------------------
  console.log("\nSuite 7: Feature Flag Scoped Override Removal & Granular Scope Isolation");
  const removedUser = featureFlags.removeOverride(testFlagKey, "USER", "usr-vip-001");
  assert(removedUser === true, "removeOverride returns true for existing USER override");

  const resAfterUserRemoval = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-pun-001",
    userId: "usr-vip-001",
  });
  assert(resAfterUserRemoval.resolvedLevel === "THEATRE", "After User override removal, falls back to Theatre tier");
  assert(resAfterUserRemoval.effectiveValue === false, "Effective value reflects Theatre override (false)");

  const removedTheatre = featureFlags.removeOverride(testFlagKey, "THEATRE", "th-pun-001");
  assert(removedTheatre === true, "removeOverride returns true for existing THEATRE override");

  const resAfterTheatreRemoval = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-pun-001",
  });
  assert(resAfterTheatreRemoval.resolvedLevel === "ORGANIZATION", "After Theatre override removal, falls back to Organization tier");
  assert(resAfterTheatreRemoval.effectiveValue === true, "Effective value reflects Organization override (true)");

  const removedOrg = featureFlags.removeOverride(testFlagKey, "ORGANIZATION", "org-cinesphere-global");
  assert(removedOrg === true, "removeOverride returns true for existing ORGANIZATION override");

  const resAfterOrgRemoval = featureFlags.resolveFlag(testFlagKey, {
    organizationId: "org-cinesphere-global",
    theatreId: "th-pun-001",
  });
  assert(resAfterOrgRemoval.resolvedLevel === "DEFAULT", "After Organization override removal, falls back to Default tier");
  assert(resAfterOrgRemoval.effectiveValue === false, "Effective value reflects Default value (false)");

  // ----------------------------------------------------------------------------
  // Suite 8: Deterministic Canary Rollout Hashing & Percentage Boundaries
  // ----------------------------------------------------------------------------
  console.log("\nSuite 8: Deterministic Canary Rollout Hashing & Percentage Boundaries");
  const canaryFlagKey = "test.canary_feature";
  featureFlags.registerFlag({
    flagKey: canaryFlagKey,
    name: "Canary Feature",
    description: "Canary rollout testing",
    valueType: "BOOLEAN",
    defaultValue: true,
    platformEnabled: true,
    rolloutPercentage: 50,
    organizationOverrides: {},
    theatreOverrides: {},
    userOverrides: {},
  });

  const resEntityA1 = featureFlags.resolveFlag(canaryFlagKey, { theatreId: "th-entity-alpha" });
  const resEntityA2 = featureFlags.resolveFlag(canaryFlagKey, { theatreId: "th-entity-alpha" });
  assert(resEntityA1.effectiveValue === resEntityA2.effectiveValue, "Canary evaluation is 100% deterministic for identical entity key");

  // 0% rollout -> always false
  featureFlags.registerFlag({
    flagKey: "test.zero_percent",
    name: "Zero Percent Canary",
    description: "0% rollout",
    valueType: "BOOLEAN",
    defaultValue: true,
    platformEnabled: true,
    rolloutPercentage: 0,
    organizationOverrides: {},
    theatreOverrides: {},
    userOverrides: {},
  });
  const resZero = featureFlags.resolveFlag("test.zero_percent", { theatreId: "th-random-1" });
  assert(resZero.effectiveValue === false, "0% rollout percentage resolves to false");

  // 100% rollout -> always enabled
  featureFlags.registerFlag({
    flagKey: "test.hundred_percent",
    name: "Hundred Percent Canary",
    description: "100% rollout",
    valueType: "BOOLEAN",
    defaultValue: true,
    platformEnabled: true,
    rolloutPercentage: 100,
    organizationOverrides: {},
    theatreOverrides: {},
    userOverrides: {},
  });
  const resHundred = featureFlags.resolveFlag("test.hundred_percent", { theatreId: "th-random-2" });
  assert(resHundred.effectiveValue === true, "100% rollout percentage resolves to true");

  // ----------------------------------------------------------------------------
  // Suite 9: Extension SDK Lifecycle Hooks
  // ----------------------------------------------------------------------------
  console.log("\nSuite 9: Extension SDK Lifecycle Hooks");
  extensionRegistry.reset();

  let installedHookRan: boolean = false;
  let enabledHookRan: boolean = false;
  let disabledHookRan: boolean = false;
  let upgradeHookRan: boolean = false;

  const sampleModule: EnterpriseModuleDefinition = {
    manifest: {
      moduleId: "ORG_MANAGEMENT",
      platformKey: "ORGANIZATION_PLATFORM",
      name: "Sample Lifecycle Module",
      version: "1.0.0",
      description: "Testing lifecycle",
      author: "Test Author",
      dependencies: [],
      minPlatformCoreVersion: "3.16.0",
    },
    onInstall: async () => {
      installedHookRan = true;
      return true;
    },
    onEnable: async () => {
      enabledHookRan = true;
      return true;
    },
    onDisable: async () => {
      disabledHookRan = true;
      return true;
    },
    onUpgrade: async (fromVer, toVer) => {
      upgradeHookRan = true;
      return true;
    },
  };

  extensionRegistry.registerModule(sampleModule);
  assert(extensionRegistry.getModuleState("ORG_MANAGEMENT") === "INSTALLED", "Module initial state is INSTALLED");

  await extensionRegistry.installModule("ORG_MANAGEMENT", superAdminActor);
  assert(Boolean(installedHookRan), "onInstall hook executed successfully");

  await extensionRegistry.enableModule("ORG_MANAGEMENT", superAdminActor);
  assert(Boolean(enabledHookRan), "onEnable hook executed successfully");
  assert(extensionRegistry.getModuleState("ORG_MANAGEMENT") === "ENABLED", "Module transitioned to ENABLED");

  await extensionRegistry.upgradeModule("ORG_MANAGEMENT", "2.0.0", superAdminActor);
  assert(Boolean(upgradeHookRan), "onUpgrade hook executed successfully");
  assert(extensionRegistry.getModule("ORG_MANAGEMENT")?.manifest.version === "2.0.0", "Manifest version upgraded to 2.0.0");

  await extensionRegistry.disableModule("ORG_MANAGEMENT", superAdminActor);
  assert(Boolean(disabledHookRan), "onDisable hook executed successfully");
  assert(extensionRegistry.getModuleState("ORG_MANAGEMENT") === "DISABLED", "Module transitioned to DISABLED");

  // ----------------------------------------------------------------------------
  // Suite 10: Extension SDK Dependency Validation & Cascade Checks
  // ----------------------------------------------------------------------------
  console.log("\nSuite 10: Extension SDK Dependency Validation & Cascade Checks");
  extensionRegistry.reset();

  // Register dependent module without base module
  extensionRegistry.registerModule(LoyaltyAndMembershipsModule);
  const depCheck1 = extensionRegistry.validateDependencies("LOYALTY_PROGRAMS");
  assert(depCheck1.isValid === false, "Dependency check fails when base dependency is not enabled");
  assert(depCheck1.missingDependencies.includes("ORG_MANAGEMENT"), "Identifies missing 'ORG_MANAGEMENT' dependency");

  const enableBlocked = await extensionRegistry.enableModule("LOYALTY_PROGRAMS", superAdminActor);
  assert(enableBlocked === false, "enableModule blocked when dependencies not satisfied");

  // Enable base dependency first
  extensionRegistry.registerModule(OrganizationManagementModule);
  await extensionRegistry.enableModule("ORG_MANAGEMENT", superAdminActor);

  const depCheck2 = extensionRegistry.validateDependencies("LOYALTY_PROGRAMS");
  assert(depCheck2.isValid === true, "Dependency check succeeds after base module is ENABLED");
  assert(depCheck2.missingDependencies.length === 0, "No missing dependencies left");

  const enableSuccess = await extensionRegistry.enableModule("LOYALTY_PROGRAMS", superAdminActor);
  assert(enableSuccess === true, "Dependent module enables cleanly once dependencies satisfied");
  assert(extensionRegistry.getModuleState("LOYALTY_PROGRAMS") === "ENABLED", "Module state is ENABLED");

  // ----------------------------------------------------------------------------
  // Suite 11: Route, Permission & Background Job Aggregation
  // ----------------------------------------------------------------------------
  console.log("\nSuite 11: Route, Permission & Background Job Aggregation");
  extensionRegistry.registerModule(DynamicPricingRulesModule);
  await extensionRegistry.enableModule("DYNAMIC_PRICING_RULES", superAdminActor);

  const superAdminRoutes = extensionRegistry.getAggregatedRoutes("SUPER_ADMIN");
  assert(superAdminRoutes.some((r) => r.path === "/pricing/dynamic-rules"), "Aggregates Dynamic Pricing route for SUPER_ADMIN");
  assert(superAdminRoutes.some((r) => r.path === "/admin/organizations"), "Aggregates Circuits route for SUPER_ADMIN");

  const staffRoutes = extensionRegistry.getAggregatedRoutes("STAFF");
  assert(!staffRoutes.some((r) => r.path === "/admin/organizations"), "Hides super admin routes from STAFF");

  const permissions = extensionRegistry.getAggregatedPermissions();
  assert(permissions.some((p) => p.permissionKey === "PRICING_MANAGE"), "Aggregates PRICING_MANAGE permission definition");
  assert(permissions.some((p) => p.permissionKey === "LOYALTY_REDEEM"), "Aggregates LOYALTY_REDEEM permission definition");
  assert(permissions.some((p) => p.permissionKey === "ORG_MANAGE"), "Aggregates ORG_MANAGE permission definition");

  const jobs = extensionRegistry.getAggregatedBackgroundJobs();
  assert(jobs.some((j) => j.jobName === "recalculate-occupancy-pricing"), "Aggregates background recurring cron jobs for pricing");
  assert(jobs.some((j) => j.jobName === "sync-branch-hierarchies"), "Aggregates background job for org hierarchy");

  // ----------------------------------------------------------------------------
  // Suite 12: Organization Hierarchy, Franchises & Corporate Accounts
  // ----------------------------------------------------------------------------
  console.log("\nSuite 12: Organization Hierarchy, Franchises & Corporate Accounts");
  repository.reset();

  const orgs = repository.listOrganizations();
  assert(orgs.length === 2, "Seeded 2 enterprise organizations (Global & Circuit)");
  assert(orgs[0].tier === "GLOBAL_NETWORK", "First organization has GLOBAL_NETWORK tier");
  assert(orgs[1].tier === "ENTERPRISE_CIRCUIT", "Second organization has ENTERPRISE_CIRCUIT tier");

  const regionalOffices = repository.listRegionalOffices("org-cinesphere-global");
  assert(regionalOffices.length === 2, "Seeded 2 regional offices for Global organization");
  assert(regionalOffices[0].regionCode === "IN-WEST", "First regional office is IN-WEST");

  const branches = repository.listBranches("org-cinesphere-global");
  assert(branches.length === 3, "Seeded 3 branches for Global organization (Pune, Mumbai, Dubai)");

  const branchPune = repository.getBranchByTheatreId("th-pun-001");
  assert(branchPune !== undefined && branchPune?.branchCode === "PUN-MAGARPATTA", "getBranchByTheatreId maps Pune venue");

  const franchise = repository.listFranchiseAgreements("org-cinesphere-global");
  assert(franchise.length === 1 && franchise[0].revenueSharingPercent === 12.5, "Seeded franchise agreement with 12.5% revenue sharing");
  assert(franchise[0].complianceStatus === "COMPLIANT", "Franchise agreement compliance status is COMPLIANT");

  const corpAccounts = repository.listCorporateAccounts("org-cinesphere-global");
  assert(corpAccounts.length === 1 && corpAccounts[0].creditLimit === 500000, "Seeded corporate B2B account with 500,000 INR credit limit");
  assert(corpAccounts[0].discountPercent === 15, "Corporate account discount is 15%");

  // Customer Experience items
  const memberships = repository.listMembershipPlans();
  assert(memberships.length === 2, "Seeded 2 VIP membership plans");
  assert(memberships[0].planCode === "VIP-GOLD-MONTHLY", "First membership is VIP-GOLD-MONTHLY");

  const giftCards = repository.listGiftCards("th-pun-001");
  assert(giftCards.length === 1 && giftCards[0].currentBalance === 2450, "Seeded gift card with 2,450 INR balance");

  const loyalty = repository.listLoyaltyPrograms("org-cinesphere-global");
  assert(loyalty.length === 1 && loyalty[0].programName === "CineSphere Star Rewards", "Seeded Star Rewards loyalty program");

  // ----------------------------------------------------------------------------
  // Suite 13: Dynamic & Surge Pricing Rule Evaluation & Formatting
  // ----------------------------------------------------------------------------
  console.log("\nSuite 13: Dynamic & Surge Pricing Rule Evaluation & Formatting");
  // Weekend surge test: Sat 20:00, 85% occupancy
  const surgeEvaluation = repository.evaluatePricing({
    basePrice: 400,
    theatreId: "th-pun-001",
    showTime: "2026-11-21T20:00:00Z", // Saturday 20:00
    currentOccupancyPercent: 85,
    format: "IMAX",
  });

  assert(surgeEvaluation.priceMultiplier === 1.25, "Applies 1.25x surge multiplier on weekend high occupancy");
  assert(surgeEvaluation.effectivePrice === 500, "Calculates 500 INR effective price (400 * 1.25)");
  assert(surgeEvaluation.appliedRuleIds.includes("rule-weekend-surge"), "Includes 'rule-weekend-surge' in applied rules");

  // Weekday morning test: Mon 09:30, 20% occupancy
  const earlyBirdEvaluation = repository.evaluatePricing({
    basePrice: 300,
    theatreId: "th-pun-001",
    showTime: "2026-11-23T09:30:00Z", // Monday 09:30
    currentOccupancyPercent: 20,
    format: "2D",
  });
  assert(earlyBirdEvaluation.priceMultiplier === 0.85, "Applies 0.85x early-bird discount on morning show");
  assert(earlyBirdEvaluation.effectivePrice === 255, "Calculates 255 INR effective price (300 * 0.85)");
  assert(earlyBirdEvaluation.appliedRuleIds.includes("rule-early-bird"), "Includes 'rule-early-bird' in applied rules");

  // Normal show without triggers: Wed 15:00, 40% occupancy
  const normalEvaluation = repository.evaluatePricing({
    basePrice: 350,
    theatreId: "th-pun-001",
    showTime: "2026-11-25T15:00:00Z", // Wednesday 15:00
    currentOccupancyPercent: 40,
    format: "2D",
  });
  assert(normalEvaluation.priceMultiplier === 1.0, "Multiplier is 1.0 when no rules match");
  assert(normalEvaluation.effectivePrice === 350, "Effective price matches base price (350 INR)");
  assert(normalEvaluation.appliedRuleIds.length === 0, "No rules applied");

  // ----------------------------------------------------------------------------
  // Suite 14: IoT Device Registry & Telemetry Recording
  // ----------------------------------------------------------------------------
  console.log("\nSuite 14: IoT Device Registry & Telemetry Recording");
  const devices = repository.listDevices("th-pun-001");
  assert(devices.length === 3, "Seeded 3 IoT devices for Pune venue");

  const sensor = repository.getDeviceById("dev-sensor-hall1-01");
  assert(sensor !== null && sensor?.deviceType === "ENVIRONMENTAL_SENSOR", "Sensor device registry record retrieved");

  const kiosk = repository.getDeviceById("dev-kiosk-lobby-01");
  assert(kiosk !== null && kiosk?.deviceType === "KIOSK", "Kiosk device registry record retrieved");

  const signage = repository.getDeviceById("dev-signage-ent-01");
  assert(signage !== null && signage?.deviceType === "LOBBY_DISPLAY", "Signage device registry record retrieved");

  // Record live telemetry
  repository.recordTelemetry({
    deviceId: "dev-sensor-hall1-01",
    timestamp: new Date().toISOString(),
    metrics: {
      temperatureCelsius: 22.0,
      humidityPercent: 50,
      powerWatts: 18,
    },
  });

  const telemLogs = repository.getTelemetry("dev-sensor-hall1-01");
  assert(telemLogs.length >= 2, "Recorded new telemetry entry in historical buffer");
  assert(telemLogs[0].metrics.temperatureCelsius === 22.0, "Most recent telemetry matches recorded metric");

  // Register new device
  repository.registerDevice({
    deviceId: "dev-turnstile-gate-1",
    theatreId: "th-pun-001",
    deviceType: "TURNSTILE",
    model: "SmartGate-Alpha",
    status: "ONLINE",
    lastHeartbeat: new Date().toISOString(),
    firmwareVersion: "1.0.0",
  });
  assert(repository.getDeviceById("dev-turnstile-gate-1") !== undefined, "Successfully registered new turnstile device");

  // ----------------------------------------------------------------------------
  // Suite 15: Service-Level Integration Tests & Security Actor Isolation
  // ----------------------------------------------------------------------------
  console.log("\nSuite 15: Service-Level Integration Tests & Security Actor Isolation");
  const overview = await service.getEnterpriseOverview(superAdminActor);
  assert(overview.totalOrganizations >= 2, "Overview returns >= 2 organizations");
  assert(overview.totalBranches >= 3, "Overview returns >= 3 branches");
  assert(overview.totalRegisteredModules >= 5, "Overview returns >= 5 registered enterprise modules");
  assert(overview.totalFeatureFlags >= 13, "Overview returns >= 13 registered feature flags");
  assert(overview.totalDevices >= 4, "Overview returns >= 4 registered devices");

  // Super Admin can toggle extension module
  const toggleRes = await service.toggleExtensionModule(superAdminActor, "DYNAMIC_PRICING_RULES", false);
  assert(toggleRes.success === true && toggleRes.state === "DISABLED", "Super Admin can disable module");

  const toggleBack = await service.toggleExtensionModule(superAdminActor, "DYNAMIC_PRICING_RULES", true);
  assert(toggleBack.success === true && toggleBack.state === "ENABLED", "Super Admin can re-enable module");

  // Theatre Admin cannot disable global modules (AuthorizationError check)
  let staffBlocked = false;
  try {
    await service.toggleExtensionModule(staffActor, "DYNAMIC_PRICING_RULES", false);
  } catch (err: any) {
    staffBlocked = true;
  }
  assert(staffBlocked === true, "Theatre staff blocked from toggling global enterprise modules");

  // Dynamic pricing bypass check when disabled
  featureFlags.setTheatreOverride("enterprise.dynamic_pricing", "th-pun-001", false);
  const bypassedEvaluation = service.evaluateDynamicPricing(superAdminActor, {
    basePrice: 400,
    theatreId: "th-pun-001",
    showTime: "2026-11-21T20:00:00Z",
    currentOccupancyPercent: 85,
    format: "IMAX",
  });
  assert(bypassedEvaluation.dynamicPricingEnabled === false, "Pricing engine detects dynamic pricing flag is disabled for venue");
  assert(bypassedEvaluation.effectivePrice === 400, "Returns unadjusted base price when feature flag is OFF");

  // Re-enable pricing on venue
  featureFlags.setTheatreOverride("enterprise.dynamic_pricing", "th-pun-001", true);
  const reenabledEvaluation = service.evaluateDynamicPricing(superAdminActor, {
    basePrice: 400,
    theatreId: "th-pun-001",
    showTime: "2026-11-21T20:00:00Z",
    currentOccupancyPercent: 85,
    format: "IMAX",
  });
  assert(reenabledEvaluation.dynamicPricingEnabled === true, "Pricing engine activates when flag overridden to true");
  assert(reenabledEvaluation.effectivePrice === 500, "Surge evaluated to 500 INR when flag is ON");

  // ----------------------------------------------------------------------------
  // Final Results
  // ----------------------------------------------------------------------------
  console.log("\n==============================================================================");
  console.log(`Verification Suite Results: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==============================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution aborted with error:", err);
  process.exit(1);
});
