/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 7 Theatre Business Information Management Verification Suite
 * ==============================================================================
 * Comprehensive verification of Theatre Business Profile & Legal Compliance:
 * 1. Business Profile Creation & Legal Identity
 * 2. Registration Data (GST, PAN, CIN) Format & Validation
 * 3. Ownership Structure & Signatory Information
 * 4. Country-Aware Tax Configuration (GST / VAT / Sales Tax)
 * 5. Invoice Sequence, Prefix & Layout Governance
 * 6. Decoupled Document Attachment Vault
 * 7. Super Admin Compliance Verification Workflow & Strict Authorization
 * 8. Multi-Faceted Search, Category Filtering & Scoped Queries
 * 9. Multi-Tenant Boundary Isolation & Security Assertions
 * 10. Optimistic Concurrency Control & Immutable Version Ledger
 * ==============================================================================
 */

import { theatreBusinessService } from "@/lib/services/theatre-business.service";
import { theatreBusinessRepository } from "@/lib/repositories/theatre-business.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import {
  ValidationError,
  AuthorizationError,
  ConflictError,
  TenantAccessError,
  BusinessRuleError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type {
  CreateTheatreBusinessProfileInput,
  UpdateTheatreBusinessProfileInput,
  UpdateTheatreTaxConfigurationInput,
  UpdateTheatreInvoiceConfigurationInput,
  VerifyTheatreBusinessProfileInput,
  AddTheatreBusinessDocumentInput,
} from "@/types/theatre-business.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-biz-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-biz-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-biz-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runBusinessVerification() {
  console.log("\n==============================================================================");
  console.log("🏢  CineSphere OS — Phase 3 Part 7 Theatre Business Management Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Business Profile Creation & Legal Identity
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Business Profile Creation & Legal Identity");

  const puneBundle = await theatreBusinessService.getBusinessBundle("th-pun-001", PUNE_ADMIN);
  assert(puneBundle.profile !== null, "Pune business profile successfully retrieved");
  assert(
    puneBundle.profile?.legalBusinessName === "CineSphere Entertainment Private Limited",
    "Legal business name matches seed"
  );
  assert(puneBundle.profile?.businessCategory === "PRIVATE_LIMITED", "Category is PRIVATE_LIMITED");
  assert(puneBundle.profile?.version === 1, "Initial version is 1");

  // Create profile for another theatre (e.g. th-del-001)
  const delTheatreId = "th-del-001";
  // Ensure dummy theatre exists in lifecycle repo for validation check
  await theatreLifecycleRepository.create({
    id: delTheatreId,
    publicId: "CSP-DEL-001",
    name: "CineSphere Delhi Mall",
    chain: "CineSphere Circuits",
    slug: "cinesphere-delhi",
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    capabilities: { allowBookings: true, allowPayments: true, allowShows: true, isReadOnly: false },
    grossRevenueMonthly: 2500000,
    hallCount: 6,
    address: "Select Citywalk, Saket",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    pinCode: "110017",
    createdBy: "usr-super-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createdDel = await theatreBusinessService.createBusinessProfile(
    {
      theatreId: delTheatreId,
      legalBusinessName: "Delhi Cinema Exhibition Private Limited",
      registeredEntityName: "Delhi Screenworks Pvt Ltd",
      businessCategory: "PRIVATE_LIMITED",
      registration: {
        gstNumber: "07AABCD1234E1Z5",
        panNumber: "AABCD1234E",
      },
      owner: {
        ownerName: "Ananya Sharma",
        ownershipType: "DIRECT_OWNERSHIP",
      },
    },
    SUPER_ADMIN
  );

  assert(createdDel.id !== undefined, "Delhi business profile created with unique ID");
  assert(createdDel.legalBusinessName === "Delhi Cinema Exhibition Private Limited", "Delhi legal name persisted");
  assert(createdDel.registration?.gstNumber === "07AABCD1234E1Z5", "Delhi GSTIN recorded");

  // Attempt duplicate creation -> assert ConflictError
  let caughtConflict = false;
  try {
    await theatreBusinessService.createBusinessProfile(
      {
        theatreId: delTheatreId,
        legalBusinessName: "Duplicate Entity",
        businessCategory: "PRIVATE_LIMITED",
      },
      SUPER_ADMIN
    );
  } catch (err) {
    if (err instanceof ConflictError) caughtConflict = true;
  }
  assert(caughtConflict, "Duplicate business profile creation rejected with ConflictError");

  // --------------------------------------------------------------------------
  // TEST 2: Registration Data (GST, PAN, CIN) Format & Validation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Registration Data (GST, PAN, CIN) Format & Validation");

  const reg = puneBundle.registration;
  assert(reg !== null, "Pune registration record exists");
  assert(reg?.gstNumber === "27AABCU9603R1ZM", "GSTIN matches 15-character statutory format");
  assert(reg?.panNumber === "AABCU9603R", "PAN matches 10-character statutory format");
  assert(reg?.cinNumber === "U92100MH2021PTC358912", "CIN matches 21-character MCA format");
  assert(reg?.isGstVerified === true, "GST is verified");
  assert(reg?.isPanVerified === true, "PAN is verified");

  // Invalid GST test
  let caughtGstError = false;
  try {
    await theatreBusinessService.updateBusinessProfile(
      {
        theatreId: delTheatreId,
        registration: {
          gstNumber: "INVALID_GST_NUMBER",
        },
      },
      SUPER_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) caughtGstError = true;
  }
  assert(caughtGstError, "Malformed GSTIN rejected with ValidationError");

  // Invalid PAN test
  let caughtPanError = false;
  try {
    await theatreBusinessService.updateBusinessProfile(
      {
        theatreId: delTheatreId,
        registration: {
          panNumber: "123456",
        },
      },
      SUPER_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) caughtPanError = true;
  }
  assert(caughtPanError, "Malformed PAN rejected with ValidationError");

  // --------------------------------------------------------------------------
  // TEST 3: Ownership Structure & Signatory Information
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Ownership Structure & Signatory Information");

  const owner = puneBundle.owner;
  assert(owner !== null, "Pune owner record exists");
  assert(owner?.ownerName === "Vikramaditya Singhania", "Owner name verified");
  assert(owner?.ownershipType === "DIRECT_OWNERSHIP", "Ownership structure verified");
  assert(owner?.authorizedSignatory === "Rajesh Kulkarni (VP Legal & Compliance)", "Signatory matches");

  // Update owner details
  const updatedPune = await theatreBusinessService.updateBusinessProfile(
    {
      theatreId: "th-pun-001",
      expectedVersion: puneBundle.profile?.version,
      owner: {
        businessContactPhone: "+91 98220 99999",
        businessEmail: "corporate.governance@cinesphere.com",
      },
    },
    PUNE_ADMIN
  );
  assert(
    updatedPune.owner?.businessContactPhone === "+91 98220 99999",
    "Owner contact phone successfully updated"
  );
  assert(
    updatedPune.owner?.businessEmail === "corporate.governance@cinesphere.com",
    "Owner legal email successfully updated"
  );

  // --------------------------------------------------------------------------
  // TEST 4: Country-Aware Tax Configuration (GST / VAT / Sales Tax)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Country-Aware Tax Configuration (GST / VAT / Sales Tax)");

  const tax = puneBundle.taxConfiguration;
  assert(tax !== null, "Tax configuration exists");
  assert(tax?.taxSystemType === "GST", "System type is GST");
  assert(tax?.taxJurisdictionCountry === "IND", "Jurisdiction country is IND");
  assert(tax?.taxPercentage === "18.00", "Default tax percentage is 18.00%");
  assert(tax?.pricingTaxModel === "TAX_INCLUSIVE", "Pricing model is TAX_INCLUSIVE");

  // Test updating tax configuration to VAT or custom
  const updatedTax = await theatreBusinessService.updateTaxConfiguration(
    {
      theatreId: "th-pun-001",
      taxSystemType: "GST",
      taxPercentage: "18.00",
      notes: "Updated GST compliance notes for exhibition tickets.",
    },
    PUNE_ADMIN
  );
  assert(updatedTax.notes === "Updated GST compliance notes for exhibition tickets.", "Tax notes updated");

  // Test invalid tax percentage rejection
  let caughtTaxRateError = false;
  try {
    await theatreBusinessService.updateTaxConfiguration(
      {
        theatreId: "th-pun-001",
        taxPercentage: "150.00",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) caughtTaxRateError = true;
  }
  assert(caughtTaxRateError, "Tax percentage > 100 rejected with ValidationError");

  // --------------------------------------------------------------------------
  // TEST 5: Invoice Sequence, Prefix & Layout Governance
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Invoice Sequence, Prefix & Layout Governance");

  const inv = puneBundle.invoiceConfiguration;
  assert(inv !== null, "Invoice configuration exists");
  assert(inv?.invoicePrefix === "CSP-PUN-", "Invoice prefix is CSP-PUN-");
  assert(inv?.invoiceSequenceNext === 10452, "Sequence counter matches seed");
  assert(inv?.enableEInvoice === true, "E-Invoice capability enabled");
  assert(inv?.enablePdfInvoice === true, "PDF generation enabled");

  // Update invoice configuration
  const updatedInv = await theatreBusinessService.updateInvoiceConfiguration(
    {
      theatreId: "th-pun-001",
      invoicePrefix: "CSP-PNX-",
      invoiceSequenceNext: 10500,
      invoiceNotes: "Subject to Pune Municipal Corporation entertainment jurisdiction.",
    },
    PUNE_ADMIN
  );
  assert(updatedInv.invoicePrefix === "CSP-PNX-", "Invoice prefix updated to CSP-PNX-");
  assert(updatedInv.invoiceSequenceNext === 10500, "Sequence counter updated to 10500");

  // Reset prefix back to CSP-PUN-
  await theatreBusinessService.updateInvoiceConfiguration(
    {
      theatreId: "th-pun-001",
      invoicePrefix: "CSP-PUN-",
      invoiceSequenceNext: 10452,
    },
    PUNE_ADMIN
  );

  // --------------------------------------------------------------------------
  // TEST 6: Decoupled Document Attachment Vault
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Decoupled Document Attachment Vault");

  assert(puneBundle.documents.length >= 4, `Pune has ${puneBundle.documents.length} seeded compliance documents`);
  const docTypes = new Set(puneBundle.documents.map((d) => d.documentType));
  assert(docTypes.has("CIN_INCORPORATION"), "Vault contains CIN Incorporation document");
  assert(docTypes.has("GST_CERTIFICATE"), "Vault contains GST Certificate");
  assert(docTypes.has("PAN_CARD"), "Vault contains PAN Card");
  assert(docTypes.has("FIRE_SAFETY_NOC"), "Vault contains Fire Safety NOC");

  // Attach a new document
  const newDoc = await theatreBusinessService.addDocument(
    {
      theatreId: "th-pun-001",
      documentType: "MUNICIPAL_TRADE_LICENSE",
      documentTitle: "Pune Municipal Trade License 2026-27",
      documentNumber: "PMC/TRADE/2026/4412",
      fileUrl: "/docs/registrations/pmc-trade-license-2026.pdf",
      expiryDate: "2027-03-31",
      displayOrder: 5,
    },
    PUNE_ADMIN
  );
  assert(newDoc.id !== undefined, "Attached trade license with unique ID");
  assert(newDoc.verificationStatus === "PENDING", "New document starts in PENDING status");

  // Verify it appears in documents query
  const allDocs = await theatreBusinessRepository.getDocuments("th-pun-001");
  assert(allDocs.some((d) => d.id === newDoc.id), "New document present in vault list");

  // Delete the test document
  const deleted = await theatreBusinessService.deleteDocument(
    {
      theatreId: "th-pun-001",
      documentId: newDoc.id,
    },
    PUNE_ADMIN
  );
  assert(deleted === true, "Document successfully deleted from vault");

  // --------------------------------------------------------------------------
  // TEST 7: Super Admin Compliance Verification Workflow
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Super Admin Compliance Verification Workflow");

  // Attempt verification by non-Super Admin (Pune Theatre Admin) -> assert AuthorizationError
  let caughtUnauthorizedVerification = false;
  try {
    await theatreBusinessService.verifyBusinessProfile(
      {
        theatreId: "th-pun-001",
        verificationStatus: "VERIFIED",
        verificationRemarks: "Unauthorized verification attempt",
      },
      PUNE_ADMIN // NOT Super Admin
    );
  } catch (err) {
    if (err instanceof AuthorizationError) caughtUnauthorizedVerification = true;
  }
  assert(caughtUnauthorizedVerification, "Theatre Admin cannot verify compliance profiles (Super Admin only)");

  // Super Admin transitions Delhi to VERIFIED
  const verifiedDel = await theatreBusinessService.verifyBusinessProfile(
    {
      theatreId: delTheatreId,
      verificationStatus: "VERIFIED",
      verificationRemarks: "Verified against Ministry of Corporate Affairs database.",
      riskScore: "LOW",
    },
    SUPER_ADMIN
  );
  assert(verifiedDel.verificationStatus === "VERIFIED", "Compliance verified by Super Admin");
  assert(verifiedDel.verifiedBy === SUPER_ADMIN.userId, "Super Admin ID recorded as verifier");

  const delProfileAfter = await theatreBusinessRepository.findByTheatreId(delTheatreId);
  assert(delProfileAfter?.status === "VERIFIED", "Parent business profile updated to VERIFIED");

  // --------------------------------------------------------------------------
  // TEST 8: Multi-Faceted Search, Category Filtering & Scoped Queries
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Multi-Faceted Search, Category Filtering & Scoped Queries");

  // Search by legal name keyword
  const nameSearchResults = await theatreBusinessService.searchBusinessProfiles(
    { query: "CineSphere" },
    SUPER_ADMIN
  );
  assert(nameSearchResults.total >= 1, "Found CineSphere entities via keyword search");

  // Search by GSTIN
  const gstSearchResults = await theatreBusinessService.searchBusinessProfiles(
    { query: "27AABCU9603R1ZM" },
    SUPER_ADMIN
  );
  assert(gstSearchResults.total === 1, "Found exact match by GSTIN query");
  assert(gstSearchResults.items[0].theatreId === "th-pun-001", "Correct theatre matched by GSTIN");

  // Filter by category
  const categoryResults = await theatreBusinessService.searchBusinessProfiles(
    { category: "PRIVATE_LIMITED" },
    SUPER_ADMIN
  );
  assert(categoryResults.total >= 2, "Filtered profiles by category 'PRIVATE_LIMITED'");

  // Filter by compliance status
  const verifiedResults = await theatreBusinessService.searchBusinessProfiles(
    { complianceStatus: "VERIFIED" },
    SUPER_ADMIN
  );
  assert(verifiedResults.total >= 2, "Filtered profiles by compliance status 'VERIFIED'");

  // --------------------------------------------------------------------------
  // TEST 9: Multi-Tenant Boundary Isolation & Security Assertions
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Multi-Tenant Boundary Isolation & Security Assertions");

  // Pune Admin attempting to view Mumbai business profile -> assert TenantAccessError
  let caughtTenantViolation = false;
  try {
    await theatreBusinessService.getBusinessBundle("th-mum-001", PUNE_ADMIN);
  } catch (err) {
    if (err instanceof TenantAccessError) caughtTenantViolation = true;
  }
  assert(caughtTenantViolation, "Pune Admin blocked from reading Mumbai business profile");

  // Mumbai Admin attempting to update Pune business profile -> assert TenantAccessError
  let caughtTenantMutation = false;
  try {
    await theatreBusinessService.updateBusinessProfile(
      {
        theatreId: "th-pun-001",
        legalBusinessName: "Malicious Cross-Tenant Overwrite",
      },
      MUMBAI_ADMIN
    );
  } catch (err) {
    if (err instanceof TenantAccessError) caughtTenantMutation = true;
  }
  assert(caughtTenantMutation, "Mumbai Admin blocked from mutating Pune business profile");

  // --------------------------------------------------------------------------
  // TEST 10: Optimistic Concurrency Control & Immutable Version Ledger
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Optimistic Concurrency Control & Immutable Version Ledger");

  const currentPune = await theatreBusinessRepository.findByTheatreId("th-pun-001");
  assert(currentPune !== null, "Current profile retrieved");

  // Attempt update with stale version
  let caughtOptimisticLock = false;
  try {
    await theatreBusinessService.updateBusinessProfile(
      {
        theatreId: "th-pun-001",
        expectedVersion: 9999, // Stale version
        legalBusinessName: "Stale Update",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof BusinessRuleError) caughtOptimisticLock = true;
  }
  assert(caughtOptimisticLock, "Stale expectedVersion rejected with Optimistic Lock failure");

  // Inspect version ledger
  const versions = await theatreBusinessService.getVersions("th-pun-001", PUNE_ADMIN);
  assert(versions.length >= 3, `Version ledger contains ${versions.length} immutable snapshots`);
  const changeTypes = new Set(versions.map((v) => v.changeType));
  assert(changeTypes.has("INITIAL_PROVISIONING") || changeTypes.has("PROFILE_UPDATED"), "Ledger recorded change types");
  assert(versions[0].snapshot !== undefined, "Version record includes cryptographic payload snapshot");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 10 VERIFICATION TESTS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!");
  console.log("==============================================================================\n");
}

runBusinessVerification().catch((err) => {
  console.error("\n💥 Verification failed:", err);
  process.exit(1);
});
