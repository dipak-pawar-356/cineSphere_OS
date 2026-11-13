/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 9 Dynamic Theatre Configuration Verification Suite
 * ==============================================================================
 * 10 Comprehensive Verification Suites:
 * 1. Seed Dynamic Configuration Bundle Retrieval & Relational Independence
 * 2. Localization Configuration (Currency, Timezone, Languages, Number Formats)
 * 3. Booking Quotas & Seat Hold Rules (Min/Max limits, advance windows, hold timers)
 * 4. Cancellation Rules & Auto-Cancellation (Deadlines, fees, forfeiture)
 * 5. Refund Policies & Settlement Routing (Payout %, gateway routing, processing days)
 * 6. Censor Rating Matrix & Age Safeguards (U <= UA <= A hierarchy, gate ID check)
 * 7. Modular Feature Flags (Loyalty, Coupons, Dynamic Pricing, AI Recommendations)
 * 8. Customer Legal Terms & Checkout Agreements (Booking terms, refund caveats)
 * 9. Configuration Versioning, Publishing & Rollback Snapshot Restoration
 * 10. Multi-Tenant Boundary Isolation & Input Validation Guards
 * ==============================================================================
 */

import { theatreConfigurationService } from "@/lib/services/theatre-configuration.service";
import { theatreConfigurationRepository } from "@/lib/repositories/theatre-configuration.repository";
import {
  ValidationError,
  AuthorizationError,
  ConflictError,
  TenantAccessError,
  BusinessRuleError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type {
  UpdateLocalizationConfigInput,
  UpdateBookingConfigInput,
  UpdateCancellationConfigInput,
  UpdateRefundConfigInput,
  UpdateAgeRestrictionConfigInput,
  UpdateFeatureFlagsInput,
  UpdateConfigurationTermsInput,
  PublishTheatreConfigurationInput,
  RestoreConfigurationVersionInput,
} from "@/types/theatre-configuration.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-cfg-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-cfg-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-cfg-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runConfigurationVerification() {
  console.log("\n==============================================================================");
  console.log("⚙️   CineSphere OS — Phase 3 Part 9 Dynamic Configuration Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Seed Dynamic Configuration Bundle Retrieval
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Seed Dynamic Configuration Bundle Retrieval & Relational Independence");

  const bundle = await theatreConfigurationService.getConfigurationBundle("th-pun-001", PUNE_ADMIN);
  assert(bundle.configuration !== null, "Pune configuration root record exists");
  assert(bundle.configuration?.theatreId === "th-pun-001", "Root matches Pune theatre ID");
  assert(bundle.localization !== null, "Localization entity decoupled & populated");
  assert(bundle.booking !== null, "Booking rules entity decoupled & populated");
  assert(bundle.cancellation !== null, "Cancellation rules entity decoupled & populated");
  assert(bundle.refund !== null, "Refund policy entity decoupled & populated");
  assert(bundle.ageRestriction !== null, "Age restriction entity decoupled & populated");
  assert(bundle.featureFlags !== null, "Feature flags entity decoupled & populated");
  assert(bundle.terms !== null, "Configuration terms entity decoupled & populated");

  // --------------------------------------------------------------------------
  // TEST 2: Localization Configuration & Country Formatting
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Localization Configuration & Country Formatting");

  const updatedLoc = await theatreConfigurationService.updateLocalizationConfig(
    {
      theatreId: "th-pun-001",
      currency: "INR",
      timezone: "Asia/Kolkata",
      primaryLanguage: "en",
      supportedLanguages: ["en", "hi", "mr"],
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12H",
      numberFormat: "INDIAN",
      measurementUnits: "METRIC",
    },
    PUNE_ADMIN
  );

  assert(updatedLoc.currency === "INR", "Currency is INR");
  assert(updatedLoc.dateFormat === "DD/MM/YYYY", "Date format updated to DD/MM/YYYY");
  assert(updatedLoc.numberFormat === "INDIAN", "Number format is INDIAN (Lakhs/Crores)");

  // --------------------------------------------------------------------------
  // TEST 3: Booking Quotas & Seat Hold Rules
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Booking Quotas & Seat Hold Lock Rules");

  const updatedBooking = await theatreConfigurationService.updateBookingConfig(
    {
      theatreId: "th-pun-001",
      minSeatsPerBooking: 1,
      maxSeatsPerBooking: 8,
      advanceBookingDays: 45,
      bookingCutoffMinutes: 20,
      seatHoldDurationSeconds: 480, // 8 minutes
      maxConcurrentBookingsPerUser: 4,
    },
    PUNE_ADMIN
  );

  assert(updatedBooking.maxSeatsPerBooking === 8, "Max seats per booking restricted to 8");
  assert(updatedBooking.advanceBookingDays === 45, "Advance booking window expanded to 45 days");
  assert(updatedBooking.seatHoldDurationSeconds === 480, "Seat hold lock timer set to 480 seconds");

  // --------------------------------------------------------------------------
  // TEST 4: Cancellation Rules & Auto-Cancellation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Cancellation Rules & Auto-Cancellation");

  const updatedCancel = await theatreConfigurationService.updateCancellationConfig(
    {
      theatreId: "th-pun-001",
      cancellationAllowed: true,
      cancellationDeadlineMinutes: 180,
      cancellationFeePercent: "20.00",
      autoCancellationEnabled: true,
      autoCancellationTimeoutMinutes: 12,
      notes: "Cancellation allowed up to 3 hours prior to showtime.",
    },
    PUNE_ADMIN
  );

  assert(updatedCancel.cancellationAllowed === true, "Cancellation permitted");
  assert(updatedCancel.cancellationDeadlineMinutes === 180, "Notice deadline set to 180 minutes");
  assert(updatedCancel.cancellationFeePercent === "20.00", "Cancellation fee is 20.00%");
  assert(updatedCancel.autoCancellationTimeoutMinutes === 12, "Auto unpaid hold timeout is 12 mins");

  // --------------------------------------------------------------------------
  // TEST 5: Refund Policies & Settlement Routing
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Refund Policies & Settlement Routing");

  const updatedRefund = await theatreConfigurationService.updateRefundConfig(
    {
      theatreId: "th-pun-001",
      refundWindowHours: 48,
      refundPercentage: "80.00",
      refundMethod: "WALLET",
      processingTimeDays: 1,
      gatewayAutoRefund: true,
    },
    PUNE_ADMIN
  );

  assert(updatedRefund.refundPercentage === "80.00", "Refund payout is 80.00%");
  assert(updatedRefund.refundMethod === "WALLET", "Refund directed to CineSphere in-app wallet");
  assert(updatedRefund.processingTimeDays === 1, "Instant wallet turnaround in 1 day");

  // --------------------------------------------------------------------------
  // TEST 6: Censor Rating Matrix & Age Safeguards
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Censor Rating Matrix & Minor Safeguards");

  const updatedAge = await theatreConfigurationService.updateAgeRestrictionConfig(
    {
      theatreId: "th-pun-001",
      minAgeU: 0,
      minAgeUA: 12,
      minAgeA: 18,
      minAgeS: 18,
      guardianRequiredUnderAge: 12,
      requireAgeVerificationAtGate: true,
      customAgeRules: "Physical government ID mandatory for A-certified films.",
    },
    PUNE_ADMIN
  );

  assert(updatedAge.minAgeU === 0, "U-rating min age is 0");
  assert(updatedAge.minAgeUA === 12, "UA-rating min age is 12");
  assert(updatedAge.minAgeA === 18, "A-rating min age is 18");
  assert(updatedAge.requireAgeVerificationAtGate === true, "Gate ID verification enforced");

  // --------------------------------------------------------------------------
  // TEST 7: Modular Feature Flags
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Modular Feature Flags");

  const updatedFlags = await theatreConfigurationService.updateFeatureFlags(
    {
      theatreId: "th-pun-001",
      enableLoyalty: true,
      enableCoupons: true,
      enableGiftCards: true,
      enableMemberships: true,
      enableDynamicPricing: true,
      enableAiRecommendations: true,
      enableWaitlist: true,
    },
    PUNE_ADMIN
  );

  assert(updatedFlags.enableDynamicPricing === true, "Dynamic surge pricing enabled");
  assert(updatedFlags.enableMemberships === true, "VIP memberships enabled");
  assert(updatedFlags.enableWaitlist === true, "Sold-out show waitlist enabled");

  // --------------------------------------------------------------------------
  // TEST 8: Customer Legal Terms & Checkout Agreements
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Customer Legal Terms & Checkout Agreements");

  const updatedTerms = await theatreConfigurationService.updateConfigurationTerms(
    {
      theatreId: "th-pun-001",
      bookingTerms: "Strict non-transferable digital QR tickets.",
      refundTerms: "Fee deductions applied automatically based on cutoff tiers.",
      customerAgreement: "Patron covenants to follow safety and anti-piracy covenants.",
    },
    PUNE_ADMIN
  );

  assert(updatedTerms.bookingTerms.includes("Strict non-transferable"), "Booking terms updated");
  assert(updatedTerms.version >= 1, "Terms version tracked");

  // --------------------------------------------------------------------------
  // TEST 9: Versioning, Publishing & Rollback Snapshot Restoration
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Versioning, Publishing & Rollback Restoration");

  const publishedConfig = await theatreConfigurationService.publishConfiguration(
    {
      theatreId: "th-pun-001",
      summary: "Published production-ready configuration snapshot v2",
    },
    PUNE_ADMIN
  );

  assert(publishedConfig.status === "PUBLISHED", "Configuration status transitioned to PUBLISHED");
  assert(publishedConfig.publishedAt !== null, "Published timestamp stamped");

  const versionsList = await theatreConfigurationRepository.getVersions("th-pun-001");
  assert(versionsList.length >= 1, "Version ledger contains published snapshot");
  const publishedVersionNum = publishedConfig.version;

  // Now test restoration
  const restoredBundle = await theatreConfigurationService.restoreConfigurationVersion(
    {
      theatreId: "th-pun-001",
      versionNumber: publishedVersionNum,
    },
    PUNE_ADMIN
  );

  assert(restoredBundle.configuration?.status === "DRAFT", "Restored version creates a working DRAFT");
  assert((restoredBundle.configuration?.version || 0) > publishedVersionNum, "Restored configuration version increments monotonically");

  // --------------------------------------------------------------------------
  // TEST 10: Multi-Tenant Boundary Isolation & Validation Guards
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Multi-Tenant Isolation & Validation Guards");

  let crossTenantBlocked = false;
  try {
    // Mumbai admin attempting to alter Pune dynamic configuration
    await theatreConfigurationService.updateBookingConfig(
      {
        theatreId: "th-pun-001",
        maxSeatsPerBooking: 20,
      },
      MUMBAI_ADMIN
    );
  } catch (err: unknown) {
    crossTenantBlocked = true;
    assert(
      err instanceof TenantAccessError || err instanceof AuthorizationError,
      "Multi-tenant boundary blocked cross-theatre configuration modification"
    );
  }
  assert(crossTenantBlocked, "Cross-tenant configuration update strictly blocked");

  // Hierarchy validation test: Min Age U > UA
  let hierarchyBlocked = false;
  try {
    await theatreConfigurationService.updateAgeRestrictionConfig(
      {
        theatreId: "th-pun-001",
        minAgeU: 15,
        minAgeUA: 10, // Invalid: U cannot exceed UA
      },
      PUNE_ADMIN
    );
  } catch (err: unknown) {
    hierarchyBlocked = true;
    assert(err instanceof ValidationError, "Validation caught invalid age hierarchy");
  }
  assert(hierarchyBlocked, "Invalid censor hierarchy prevented");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 10 DYNAMIC THEATRE CONFIGURATION TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==============================================================================\n");
}

runConfigurationVerification().catch((err) => {
  console.error("FATAL ERROR in Dynamic Configuration verification:", err);
  process.exit(1);
});
