/**
 * ==============================================================================
 * CineSphere OS - Phase 2 Part 12: Payment Configuration Verification Suite
 * ==============================================================================
 * 
 * Verifies:
 * 1. Multi-Configuration per Theatre (1:N relationship)
 * 2. Provider enum & status enforcement
 * 3. Primary configuration designation & auto-demotion of previous primary
 * 4. Dynamic NPCI UPI intent & QR payload derivation (MCC 7832)
 * 5. UPI VPA format validation
 * 6. Strict tenant isolation (cross-tenant mutation prevention)
 * 7. Dynamic Booking Payment Session preparation
 * 8. Role-based security & credential sanitization
 * 9. Configuration versioning & immutable audit trail logging
 * 
 * Run with: pnpm dlx tsx scripts/verify-payment-config.ts
 * ==============================================================================
 */

import {
  validateUpiId,
  deriveUpiQrPayload,
  createPaymentConfiguration,
  updatePaymentConfiguration,
  deletePaymentConfiguration,
  activatePaymentConfiguration,
  deactivatePaymentConfiguration,
  setPrimaryPaymentConfiguration,
  getTheatreActivePaymentConfiguration,
  getTheatrePaymentConfigurations,
  searchPaymentConfigurations,
  prepareBookingPaymentSession,
  getPaymentAuditLogs,
  resetPaymentEngineState,
} from "../lib/engine/payment-config-engine";
import { PaymentProvider, PaymentProviderStatus } from "../types/payment-config.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runVerificationSuite() {
  console.log("================================================================================");
  console.log("🎬 CineSphere OS — Phase 2 Part 12: Payment Architecture Verification");
  console.log("================================================================================\n");

  resetPaymentEngineState();

  // ----------------------------------------------------------------------------
  // Point 1: Multi-Configuration per Theatre (1:N Relationship)
  // ----------------------------------------------------------------------------
  console.log("🔹 1. Testing 1:N Payment Configurations per Theatre...");
  const puneConfigs = getTheatrePaymentConfigurations("th-pun-001");
  assert(
    puneConfigs.length >= 3,
    `Expected at least 3 seeded configurations for th-pun-001, got ${puneConfigs.length}`
  );
  const providersPresent = puneConfigs.map((c) => c.provider);
  assert(
    providersPresent.includes("UPI") && providersPresent.includes("RAZORPAY"),
    "Expected both UPI and RAZORPAY rails to be present for Pune"
  );
  console.log(`   ✅ th-pun-001 has ${puneConfigs.length} configured rails: [${providersPresent.join(", ")}]`);

  // ----------------------------------------------------------------------------
  // Point 2: Provider Enum & Status Enforcement
  // ----------------------------------------------------------------------------
  console.log("\n🔹 2. Testing Provider Enum and Status States...");
  const newRail = createPaymentConfiguration({
    theatreId: "th-pun-001",
    businessName: "CineSphere Premiere Private Limited",
    merchantName: "CineSphere VIP Concessions",
    merchantDisplayName: "Concessions Bar #02",
    provider: "CASH_COUNTER",
    upiId: "cinesphere.cash@icici",
    merchantCode: "5812",
    isPrimary: false,
    status: "ACTIVE",
    bankName: "ICICI Bank",
  });
  assert(newRail.provider === "CASH_COUNTER", "Expected CASH_COUNTER provider to be set");
  assert(newRail.status === "ACTIVE", "Expected ACTIVE status");
  console.log(`   ✅ Created ${newRail.provider} rail '${newRail.merchantDisplayName}' with status ${newRail.status}`);

  // ----------------------------------------------------------------------------
  // Point 3: Primary Configuration Designation & Auto-Demotion
  // ----------------------------------------------------------------------------
  console.log("\n🔹 3. Testing Primary Rail Designation & Auto-Demotion of Prior Primary...");
  const initialPrimary = getTheatreActivePaymentConfiguration("th-pun-001");
  assert(initialPrimary !== null && initialPrimary.isPrimary === true, "Expected active primary config initially");
  console.log(`   Initial primary rail: '${initialPrimary?.merchantDisplayName}' (${initialPrimary?.id})`);

  // Create a new UPI config flagged as primary
  const newPrimary = createPaymentConfiguration({
    theatreId: "th-pun-001",
    businessName: "CineSphere Premiere Private Limited",
    merchantName: "CineSphere IMAX Priority Rail",
    merchantDisplayName: "IMAX Priority Checkout",
    provider: "UPI",
    upiId: "cinesphere.imax@icici",
    isPrimary: true,
  });

  // Verify new config is primary
  assert(newPrimary.isPrimary === true, "New config must be primary");

  // Verify initial config was automatically demoted to non-primary
  const refreshedInitial = getTheatrePaymentConfigurations("th-pun-001").find(
    (c) => c.id === initialPrimary?.id
  );
  assert(
    refreshedInitial !== undefined && refreshedInitial.isPrimary === false,
    "Prior primary must be demoted to isPrimary = false"
  );
  console.log(`   ✅ Prior primary '${initialPrimary?.merchantDisplayName}' successfully demoted to non-primary.`);
  console.log(`   ✅ New primary '${newPrimary.merchantDisplayName}' is active.`);

  // ----------------------------------------------------------------------------
  // Point 4: Dynamic NPCI UPI Intent & QR Payload Derivation (MCC 7832)
  // ----------------------------------------------------------------------------
  console.log("\n🔹 4. Testing Dynamic NPCI UPI Intent & QR Payload Derivation...");
  const derived = deriveUpiQrPayload({
    upiId: "cinesphere.pune@icici",
    merchantName: "CineSphere Grand Cinemas",
    amount: 520.5,
    reference: "TXN-TEST-9901",
    transactionNote: "2x IMAX Laser Seats",
    merchantCode: "7832",
    currency: "INR",
  });

  assert(derived.upiIntentUri.startsWith("upi://pay?"), "URI must begin with upi://pay?");
  assert(derived.upiIntentUri.includes("pa=cinesphere.pune%40icici"), "URI must contain encoded UPI ID");
  assert(derived.upiIntentUri.includes("mc=7832"), "URI must specify MCC 7832");
  assert(derived.upiIntentUri.includes("am=520.50"), "URI must format amount with 2 decimal places");
  assert(derived.upiIntentUri.includes("cu=INR"), "URI must specify INR currency");
  assert(derived.qrImageUrl.includes("api.qrserver.com"), "QR image URL must be derived dynamically");
  console.log(`   ✅ Derived NPCI Intent URI: ${derived.upiIntentUri}`);
  console.log(`   ✅ Derived Dynamic QR: ${derived.qrImageUrl.substring(0, 75)}...`);

  // ----------------------------------------------------------------------------
  // Point 5: UPI VPA Format Validation
  // ----------------------------------------------------------------------------
  console.log("\n🔹 5. Testing UPI VPA Format Validation...");
  const validVpas = ["cinesphere.pune@icici", "theatre@hdfcbank", "booking-box1@axisbank", "user.name_1@okaxis"];
  for (const vpa of validVpas) {
    const res = validateUpiId(vpa);
    assert(res.isValid === true, `Expected '${vpa}' to be valid`);
  }

  const invalidVpas = ["", "invalid", "name@@bank", "user@bank@extra", "missinghandle.com"];
  for (const vpa of invalidVpas) {
    const res = validateUpiId(vpa);
    assert(res.isValid === false, `Expected '${vpa}' to be invalid`);
  }
  console.log(`   ✅ Validated ${validVpas.length} valid and ${invalidVpas.length} invalid UPI vectors.`);

  // ----------------------------------------------------------------------------
  // Point 6: Strict Multi-Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\n🔹 6. Testing Multi-Tenant Isolation & Cross-Tenant Protection...");
  const mumbaiConfigs = getTheatrePaymentConfigurations("th-mum-001");
  const mumbaiRail = mumbaiConfigs[0];
  assert(mumbaiRail.theatreId === "th-mum-001", "Rail must belong to Mumbai");

  let crossTenantViolationCaught = false;
  try {
    // Attempt to delete Mumbai's rail using Pune's tenant identity
    deletePaymentConfiguration(mumbaiRail.id, "th-pun-001");
  } catch (err: any) {
    crossTenantViolationCaught = true;
    assert(
      err.message.includes("Cross-tenant violation"),
      `Expected cross-tenant error message, got: ${err.message}`
    );
  }
  assert(crossTenantViolationCaught, "Cross-tenant mutation must throw violation");
  console.log("   ✅ Successfully blocked cross-tenant mutation attempt from th-pun-001 to th-mum-001.");

  // ----------------------------------------------------------------------------
  // Point 7: Dynamic Booking Payment Session Preparation
  // ----------------------------------------------------------------------------
  console.log("\n🔹 7. Testing Dynamic Booking Payment Session Preparation...");
  const paymentSession = prepareBookingPaymentSession({
    theatreId: "th-pun-001",
    amount: 780,
    customerId: "cust-vip-101",
    notes: "Booking Kalki 2898 AD Row E",
  });

  assert(paymentSession.sessionId.startsWith("pay-sess-"), "Must have valid session ID");
  assert(paymentSession.theatreId === "th-pun-001", "Session must bind to theatre th-pun-001");
  assert(paymentSession.amount === 780, "Amount must be 780");
  assert(paymentSession.currency === "INR", "Currency must be INR");
  assert(paymentSession.merchantCode === "7832", "MCC must be 7832");
  assert(paymentSession.upiIntentUri.includes("am=780.00"), "Intent URI must contain am=780.00");
  assert(paymentSession.qrImageUrl.length > 0, "QR image URL must be provided");
  assert(new Date(paymentSession.expiresAt).getTime() > Date.now(), "Session must have future expiration");
  console.log(`   ✅ Generated Session '${paymentSession.sessionId}' (Ref: ${paymentSession.reference})`);
  console.log(`   ✅ Expires At: ${paymentSession.expiresAt}`);

  // ----------------------------------------------------------------------------
  // Point 8: Role-Based Security & Credential Sanitization
  // ----------------------------------------------------------------------------
  console.log("\n🔹 8. Testing Role-Based Security & Credential Masking...");
  // Query under CUSTOMER role
  const customerView = getTheatrePaymentConfigurations("th-pun-001", "CUSTOMER");
  for (const cfg of customerView) {
    assert(cfg.status === "ACTIVE", "Customer must only see ACTIVE rails");
    // Secret keys must not be exposed
    if (cfg.credentials) {
      assert(
        (cfg.credentials as any).secretKey === undefined,
        "Secret keys must be sanitized from customer view"
      );
    }
  }
  console.log(`   ✅ Customer view returns ${customerView.length} sanitized active rails with credentials masked.`);

  // ----------------------------------------------------------------------------
  // Point 9: Configuration Versioning & Audit Trail Logging
  // ----------------------------------------------------------------------------
  console.log("\n🔹 9. Testing Configuration Versioning & Audit Logging...");
  const targetConfig = puneConfigs[0];
  const initialVersion = targetConfig.configVersion;

  const updatedConfig = updatePaymentConfiguration(targetConfig.id, {
    description: "Updated description for operational test",
  });

  assert(
    updatedConfig.configVersion === initialVersion + 1,
    `Config version should increment from ${initialVersion} to ${initialVersion + 1}`
  );

  const auditLogs = getPaymentAuditLogs("th-pun-001", "THEATRE_ADMIN");
  assert(auditLogs.length > 0, "Audit logs must contain recorded events");
  const latestLog = auditLogs[0];
  assert(latestLog.theatreId === "th-pun-001", "Audit log must match theatre ID");
  assert(latestLog.action !== undefined, "Audit log must specify action");
  console.log(`   ✅ Config version incremented to v${updatedConfig.configVersion}`);
  console.log(`   ✅ Audit trail has ${auditLogs.length} events logged. Latest: [${latestLog.action}] ${latestLog.details}`);

  console.log("\n================================================================================");
  console.log("🎉 ALL 9 VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("================================================================================\n");
}

runVerificationSuite().catch((err) => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
