/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 6 Theatre Contact Management Verification Suite
 * ==============================================================================
 * Comprehensive verification of the Theatre Contact Directory:
 * Multi-channel architecture, Role-based contacts, Availability modes,
 * Phone/Country Code validation, Primary channel governance, Safe URL & XSS defense,
 * 24/7 Emergency desk, Duty manager escalation, Multi-tenant boundary isolation,
 * Optimistic Concurrency Control, Sequential reordering, Public patron projection,
 * and Immutable Version Ledger.
 * ==============================================================================
 */

import { theatreContactService } from "@/lib/services/theatre-contact.service";
import { theatreContactRepository } from "@/lib/repositories/theatre-contact.repository";
import {
  ValidationError,
  AuthorizationError,
  ConflictError,
  TenantAccessError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type {
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
} from "@/types/theatre-contact.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-cnt-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-cnt-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-cnt-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runContactVerification() {
  console.log("\n==============================================================================");
  console.log("📞  CineSphere OS — Phase 3 Part 6 Theatre Contact Management Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Multi-Channel Directory Architecture & Initial State
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Multi-Channel Directory Architecture & Initial State");

  const initialBundle = await theatreContactService.getTheatreContactBundle("th-pun-001");
  assert(initialBundle !== null, "Directory bundle retrieved for Pune complex");
  assert(initialBundle.totalContacts >= 9, `Seeded with ${initialBundle.totalContacts} initial directory channels`);
  assert(initialBundle.primaryPhone !== null, "Primary voice desk is configured");
  assert(initialBundle.primaryEmail !== null, "Primary support email is configured");
  assert(initialBundle.primaryWebsite !== null, "Primary official website is configured");

  const initialList = await theatreContactService.getTheatreContacts("th-pun-001", undefined, PUNE_ADMIN);
  const channels = new Set(initialList.map((c) => c.channelType));
  assert(channels.has("PHONE"), "Directory contains PHONE channel");
  assert(channels.has("EMAIL"), "Directory contains EMAIL channel");
  assert(channels.has("WEBSITE"), "Directory contains WEBSITE channel");
  assert(channels.has("EMERGENCY"), "Directory contains EMERGENCY channel");
  assert(channels.has("MANAGER"), "Directory contains MANAGER channel");
  assert(channels.has("SOCIAL_LINK"), "Directory contains SOCIAL_LINK channel");

  // --------------------------------------------------------------------------
  // TEST 2: Role-Based Contact Categorization & Channel Validation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Role-Based Contact Categorization & Channel Validation");

  const roles = new Set(initialList.map((c) => c.contactRole));
  assert(roles.has("CUSTOMER_SUPPORT"), "Supports CUSTOMER_SUPPORT role");
  assert(roles.has("EMERGENCY_DESK"), "Supports EMERGENCY_DESK role");
  assert(roles.has("DUTY_MANAGER"), "Supports DUTY_MANAGER role");
  assert(roles.has("BUSINESS_DEVELOPMENT"), "Supports BUSINESS_DEVELOPMENT role");

  // Attempt invalid creation with missing title
  let caughtValidationError = false;
  try {
    await theatreContactService.createContact(
      {
        theatreId: "th-pun-001",
        channelType: "PHONE",
        contactRole: "CUSTOMER_SUPPORT",
        title: "", // empty title
        phone: {
          countryCode: "+91",
          phoneNumber: "9876543210",
        },
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtValidationError = true;
    }
  }
  assert(caughtValidationError, "Validation rejected contact creation with empty title");

  // --------------------------------------------------------------------------
  // TEST 3: Phone & Country Code Validation & Primary Voice Governance
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Phone & Country Code Validation & Primary Voice Governance");

  // Invalid country code format
  let caughtInvalidCountryCode = false;
  try {
    await theatreContactService.createContact(
      {
        theatreId: "th-pun-001",
        channelType: "PHONE",
        contactRole: "GENERAL_ENQUIRY",
        title: "Invalid Phone Test",
        phone: {
          countryCode: "91", // missing +
          phoneNumber: "9876543210",
        },
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtInvalidCountryCode = true;
    }
  }
  assert(caughtInvalidCountryCode, "Validation rejected country code without leading +");

  // Create a new phone as primary
  const newPrimaryPhone = await theatreContactService.createContact(
    {
      theatreId: "th-pun-001",
      channelType: "PHONE",
      contactRole: "CUSTOMER_SUPPORT",
      title: "VIP Executive Voice Helpline",
      isPrimary: true,
      availabilityMode: "STANDARD_BUSINESS_HOURS",
      businessHours: "08:00 AM - 11:30 PM Daily",
      phone: {
        countryCode: "+91",
        phoneNumber: "9876500001",
        phoneType: "DIRECT_DESK",
        isWhatsappEnabled: true,
      },
    },
    PUNE_ADMIN
  );
  assert(newPrimaryPhone.isPrimary === true, "New phone created as PRIMARY");
  assert(newPrimaryPhone.phone?.phoneNumber === "9876500001", "Phone child record saved correctly");
  assert(newPrimaryPhone.phone?.isWhatsappEnabled === true, "WhatsApp capability enabled");

  // Verify single-primary rule: previous primary phone is cleared
  const refreshedListAfterPhone = await theatreContactService.getTheatreContacts("th-pun-001", undefined, PUNE_ADMIN);
  const primaryPhones = refreshedListAfterPhone.filter(
    (c) => c.channelType === "PHONE" && c.isPrimary
  );
  assert(primaryPhones.length === 1, "Single-Primary enforcement: exactly ONE primary phone exists");
  assert(primaryPhones[0].id === newPrimaryPhone.id, "The newly created phone holds primary status");

  // --------------------------------------------------------------------------
  // TEST 4: Email Address Validation & Primary Support Email Governance
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Email Address Validation & Primary Support Email Governance");

  // Invalid email format
  let caughtInvalidEmail = false;
  try {
    await theatreContactService.createContact(
      {
        theatreId: "th-pun-001",
        channelType: "EMAIL",
        contactRole: "GENERAL_ENQUIRY",
        title: "Bad Email",
        email: {
          email: "not-an-email-address",
        },
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtInvalidEmail = true;
    }
  }
  assert(caughtInvalidEmail, "Validation rejected malformed email address syntax");

  // Create new primary email
  const newPrimaryEmail = await theatreContactService.createContact(
    {
      theatreId: "th-pun-001",
      channelType: "EMAIL",
      contactRole: "CUSTOMER_SUPPORT",
      title: "Priority Guest Services Email",
      isPrimary: true,
      email: {
        email: "priority.support@cinesphere.in",
        department: "VIP Concierge",
        emailType: "PRIORITY",
      },
    },
    PUNE_ADMIN
  );
  assert(newPrimaryEmail.isPrimary === true, "New email created as PRIMARY");
  assert(newPrimaryEmail.email?.email === "priority.support@cinesphere.in", "Email record saved correctly");

  // Verify single-primary rule: previous primary email is cleared
  const refreshedListAfterEmail = await theatreContactService.getTheatreContacts("th-pun-001", undefined, PUNE_ADMIN);
  const primaryEmails = refreshedListAfterEmail.filter(
    (c) => c.channelType === "EMAIL" && c.isPrimary
  );
  assert(primaryEmails.length === 1, "Single-Primary enforcement: exactly ONE primary email exists");
  assert(primaryEmails[0].id === newPrimaryEmail.id, "The newly created email holds primary status");

  // --------------------------------------------------------------------------
  // TEST 5: Safe URL Sanitization, Website Governance & Social Links
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Safe URL Sanitization, Website Governance & Social Links");

  // Dangerous javascript: URL injection
  let caughtDangerousUrl = false;
  try {
    await theatreContactService.updateWebsite(
      {
        theatreId: "th-pun-001",
        url: "javascript:alert(document.cookie)",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtDangerousUrl = true;
    }
  }
  assert(caughtDangerousUrl, "XSS defense blocked javascript: URL protocol");

  // Dangerous data: URL injection
  let caughtDataUrl = false;
  try {
    await theatreContactService.updateWebsite(
      {
        theatreId: "th-pun-001",
        url: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtDataUrl = true;
    }
  }
  assert(caughtDataUrl, "XSS defense blocked data: URL protocol");

  // Valid website update
  const updatedWeb = await theatreContactService.updateWebsite(
    {
      theatreId: "th-pun-001",
      url: "https://phoenix.cinesphere.in",
      title: "Phoenix Grand Box Office Portal",
    },
    PUNE_ADMIN
  );
  assert(updatedWeb.website?.url === "https://phoenix.cinesphere.in", "Official website updated cleanly");
  assert(updatedWeb.isPrimary === true, "Website is set as primary web portal");

  // Social Links batch update
  const updatedSocials = await theatreContactService.updateSocialLinks(
    {
      theatreId: "th-pun-001",
      socialLinks: [
        {
          platform: "INSTAGRAM",
          url: "https://instagram.com/cinesphere_pune",
          handle: "@cinesphere_pune",
          displayOrder: 1,
        },
        {
          platform: "FACEBOOK",
          url: "https://facebook.com/cinespherepune",
          handle: "cinespherepune",
          displayOrder: 2,
        },
        {
          platform: "X_TWITTER",
          url: "https://x.com/cinesphere_pun",
          handle: "@cinesphere_pun",
          displayOrder: 3,
        },
        {
          platform: "YOUTUBE",
          url: "https://youtube.com/@cinesphereofficial",
          displayOrder: 4,
        },
        {
          platform: "CUSTOM",
          customPlatform: "Letterboxd",
          url: "https://letterboxd.com/cinesphere",
          handle: "cinesphere",
          displayOrder: 5,
        },
      ],
    },
    PUNE_ADMIN
  );
  assert(updatedSocials.length === 5, "Configured 5 social links including CUSTOM platform");
  const platforms = updatedSocials.map((s) => s.socialLink?.platform);
  assert(platforms.includes("INSTAGRAM"), "Instagram channel configured");
  assert(platforms.includes("CUSTOM"), "Custom platform (Letterboxd) configured");

  // --------------------------------------------------------------------------
  // TEST 6: 24/7 Emergency Contact Desk & Incident Procedures
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: 24/7 Emergency Contact Desk & Incident Procedures");

  const emergencyDesk = await theatreContactService.createContact(
    {
      theatreId: "th-pun-001",
      channelType: "EMERGENCY",
      contactRole: "EMERGENCY_DESK",
      title: "Rapid Response & Fire Command Center",
      availabilityMode: "TWENTY_FOUR_SEVEN",
      businessHours: "24/7 Dedicated Emergency Operations Center",
      emergencyContact: {
        contactPersonName: "Captain R. K. Shinde",
        roleOrDesignation: "Chief Incident Commander & Fire Safety Marshal",
        primaryPhone: "+91 98220 99999",
        alternatePhone: "+91 20 6600 9911",
        availabilityHours: "24/7 Immediate Dispatch",
        emergencyType: "FIRE_SAFETY_EVACUATION",
        operatingProcedures: "Direct patch to Pune Municipal Fire Brigade (Control Room 101) & In-house Trauma Squad",
      },
    },
    PUNE_ADMIN
  );
  assert(emergencyDesk.channelType === "EMERGENCY", "Created EMERGENCY channel type");
  assert(emergencyDesk.availabilityMode === "TWENTY_FOUR_SEVEN", "Emergency availability is 24/7");
  assert(emergencyDesk.emergencyContact?.contactPersonName === "Captain R. K. Shinde", "Incident commander stored");
  assert(
    emergencyDesk.emergencyContact?.operatingProcedures?.includes("Pune Municipal Fire Brigade") ?? false,
    "Operating procedures and muster protocols stored"
  );

  // --------------------------------------------------------------------------
  // TEST 7: Duty / General Manager Escalation Tier & Contact Directory
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Duty / General Manager Escalation Tier & Contact Directory");

  const dutyManagerContact = await theatreContactService.createContact(
    {
      theatreId: "th-pun-001",
      channelType: "MANAGER",
      contactRole: "DUTY_MANAGER",
      title: "Night Operations Duty Manager",
      availabilityMode: "SHOWTIME_ONLY",
      businessHours: "05:00 PM - 02:00 AM (Night Operations Shift)",
      managerContact: {
        managerName: "Ananya Deshmukh",
        designation: "Assistant General Manager - Night Floor Ops",
        phone: "+91 98220 77112",
        email: "ananya.deshmukh@cinesphere.in",
        department: "Cinema Operations",
        shiftHours: "Evening & Late Night Cut-off",
        escalationTier: 1,
      },
    },
    PUNE_ADMIN
  );
  assert(dutyManagerContact.channelType === "MANAGER", "Created MANAGER channel type");
  assert(dutyManagerContact.managerContact?.managerName === "Ananya Deshmukh", "Duty manager name stored");
  assert(dutyManagerContact.managerContact?.escalationTier === 1, "Escalation tier 1 verified");

  // --------------------------------------------------------------------------
  // TEST 8: Availability Modes, Verification Badges & Search/Filter Queries
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Availability Modes, Verification Badges & Search/Filter Queries");

  // Update verification status via Super Admin
  const verifiedContact = await theatreContactService.updateContact(
    {
      contactId: dutyManagerContact.id,
      theatreId: "th-pun-001",
      verificationStatus: "VERIFIED",
    },
    SUPER_ADMIN
  );
  assert(verifiedContact.verificationStatus === "VERIFIED", "Super Admin verified contact badge");
  assert(verifiedContact.verifiedBy === SUPER_ADMIN.userId, "Verification actor recorded");

  // Filter by channelType
  const phonesOnly = await theatreContactService.getTheatreContacts(
    "th-pun-001",
    { channelType: "PHONE" },
    PUNE_ADMIN
  );
  assert(phonesOnly.every((c) => c.channelType === "PHONE"), "Filtered contacts: only PHONE channels returned");

  // Filter by contactRole
  const emergencyOnly = await theatreContactService.getTheatreContacts(
    "th-pun-001",
    { contactRole: "EMERGENCY_DESK" },
    PUNE_ADMIN
  );
  assert(emergencyOnly.length >= 1, "Filtered contacts: EMERGENCY_DESK role returned");

  // Search query filter
  const searchResults = await theatreContactService.getTheatreContacts(
    "th-pun-001",
    { query: "Shinde" },
    PUNE_ADMIN
  );
  assert(searchResults.length >= 1, "Search query resolved contact person 'Shinde'");
  assert(searchResults[0].id === emergencyDesk.id, "Correct emergency desk matched by person name");

  // --------------------------------------------------------------------------
  // TEST 9: Multi-Tenant Boundary Isolation & Pre-Pagination Security
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Multi-Tenant Boundary Isolation & Pre-Pagination Security");

  // Mumbai admin attempting to read Pune contacts
  let caughtCrossTenantRead = false;
  try {
    await theatreContactService.getTheatreContacts("th-pun-001", undefined, MUMBAI_ADMIN);
  } catch (err) {
    if (err instanceof TenantAccessError || err instanceof AuthorizationError) {
      caughtCrossTenantRead = true;
    }
  }
  assert(caughtCrossTenantRead, "Tenant Boundary: Mumbai admin CANNOT read Pune contact directory");

  // Mumbai admin attempting to mutate Pune contact
  let caughtCrossTenantMutation = false;
  try {
    await theatreContactService.updateContact(
      {
        contactId: newPrimaryPhone.id,
        theatreId: "th-pun-001",
        title: "Malicious Hijack",
      },
      MUMBAI_ADMIN
    );
  } catch (err) {
    if (err instanceof TenantAccessError || err instanceof AuthorizationError) {
      caughtCrossTenantMutation = true;
    }
  }
  assert(caughtCrossTenantMutation, "Tenant Boundary: Mumbai admin CANNOT mutate Pune contact");

  // Mumbai admin attempting cross-tenant contact ID manipulation
  let caughtCrossTenantIdMismatch = false;
  try {
    await theatreContactService.updateContact(
      {
        contactId: newPrimaryPhone.id, // Pune contact ID
        theatreId: "th-mum-001",       // Claimed Mumbai theatre
        title: "Cross Tenant Spoof",
      },
      MUMBAI_ADMIN
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      caughtCrossTenantIdMismatch = true;
    }
  }
  assert(caughtCrossTenantIdMismatch, "Tenant Boundary: Contact ID ownership validation prevented cross-tenant spoofing");

  // --------------------------------------------------------------------------
  // TEST 10: Optimistic Concurrency Control, Reordering & Immutable Version Ledger
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Optimistic Concurrency Control, Reordering & Immutable Version Ledger");

  // OCC: Stale version update rejection
  let caughtOccConflict = false;
  try {
    await theatreContactService.updateContact(
      {
        contactId: newPrimaryPhone.id,
        theatreId: "th-pun-001",
        title: "Concurrent Edit Attempt",
        expectedVersion: 999, // Stale version
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      caughtOccConflict = true;
    }
  }
  assert(caughtOccConflict, "Optimistic Concurrency Control: Stale expectedVersion rejected with ConflictError");

  // Sequential reordering
  const contactsBeforeReorder = await theatreContactService.getTheatreContacts("th-pun-001", undefined, PUNE_ADMIN);
  const reversedIds = [...contactsBeforeReorder].reverse().map((c) => c.id);
  const reordered = await theatreContactService.reorderContacts(
    {
      theatreId: "th-pun-001",
      orderedContactIds: reversedIds,
    },
    PUNE_ADMIN
  );
  assert(reordered.length === reversedIds.length, "Reordered contacts successfully");
  assert(reordered[0].id === reversedIds[0], "First contact in sequence matches requested order");

  // Public Patron Projection
  const publicBundle = await theatreContactService.getPublicTheatreContacts("th-pun-001");
  assert(publicBundle !== null, "Public directory bundle returned for public consumer");
  assert(publicBundle?.primaryPhone?.phone?.formattedPhone !== undefined, "Public phone formatted with country code");
  assert(publicBundle?.supportEmail !== null, "Public support email exposed");
  assert(publicBundle?.emergencyDesk !== null, "Public emergency desk exposed");
  assert(publicBundle?.officialWebsite !== null, "Public official website exposed");

  // Check version ledger snapshots
  const versionHistory = await theatreContactRepository.getVersionHistory({ theatreId: "th-pun-001" });
  assert(versionHistory.length >= 6, `Recorded ${versionHistory.length} immutable version history snapshots`);
  const changeTypes = versionHistory.map((v) => v.changeType);
  assert(changeTypes.includes("CONTACT_CREATED"), "Version history recorded CONTACT_CREATED snapshots");
  assert(changeTypes.includes("CONTACT_UPDATED"), "Version history recorded CONTACT_UPDATED snapshots");

  // Cleanly delete the test phone and verify CONTACT_DELETED version snapshot
  await theatreContactService.deleteContact(newPrimaryPhone.id, "th-pun-001", PUNE_ADMIN);
  const postDeleteList = await theatreContactService.getTheatreContacts("th-pun-001", undefined, PUNE_ADMIN);
  const deletedStillPresent = postDeleteList.some((c) => c.id === newPrimaryPhone.id);
  assert(!deletedStillPresent, "Test primary phone deleted cleanly");

  const postDeleteVersions = await theatreContactRepository.getVersionHistory({ theatreId: "th-pun-001" });
  assert(
    postDeleteVersions.some((v) => v.changeType === "CONTACT_DELETED"),
    "Version history tracks CONTACT_DELETED snapshot"
  );

  console.log("\n==============================================================================");
  console.log("🎉 ALL 10 THEATRE CONTACT DIRECTORY VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runContactVerification().catch((err) => {
  console.error("FATAL: Contact verification suite failed:", err);
  process.exit(1);
});
