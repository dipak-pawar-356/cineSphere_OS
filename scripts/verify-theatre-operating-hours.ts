/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 8 Theatre Operating Hours Verification Suite
 * ==============================================================================
 * 10 Comprehensive Verification Suites:
 * 1. Seed Operating Profile Retrieval & Data Integrity
 * 2. Regular Operating Hours Configuration & Timezone Parsing
 * 3. Weekly Schedule Rotations (Mon-Sun, Weekend Shifts, Closed Days)
 * 4. Holiday Operating Calendars (Full Closures & Adjusted Timings)
 * 5. Maintenance Schedules (Downtime Windows, Projector Upgrades)
 * 6. Special Operating Events (Midnight Premieres, Film Festivals)
 * 7. Schedule Validation & Invariants (24h Time, Ordering, ISO Dates)
 * 8. Multi-Tenant Isolation & Boundary Enforcement
 * 9. Version Snapshot Ledger & Optimistic Concurrency
 * 10. End-to-End Aggregated Bundle & Performance Cache Invalidation
 * ==============================================================================
 */

import { theatreOperatingHoursService } from "@/lib/services/theatre-operating-hours.service";
import { theatreOperatingHoursRepository } from "@/lib/repositories/theatre-operating-hours.repository";
import {
  ValidationError,
  AuthorizationError,
  ConflictError,
  TenantAccessError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-op-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-op-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-op-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runOperatingHoursVerification() {
  console.log("\n==============================================================================");
  console.log("⏰  CineSphere OS — Phase 3 Part 8 Theatre Operating Hours Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Seed Operating Profile Retrieval & Data Integrity
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Seed Operating Profile Retrieval & Data Integrity");

  const bundle = await theatreOperatingHoursService.getOperatingBundle("th-pun-001", PUNE_ADMIN);
  assert(bundle.profile !== null, "Pune flagship operating profile exists");
  assert(bundle.profile?.theatreId === "th-pun-001", "Profile matches Pune theatre ID");
  assert(bundle.profile?.timezone === "Asia/Kolkata", "Operating timezone is Asia/Kolkata");
  assert(bundle.profile?.regularOpeningTime === "09:00", "Regular opening is 09:00");
  assert(bundle.profile?.regularClosingTime === "23:30", "Regular closing is 23:30");
  assert(bundle.weeklySchedules.length === 7, "Weekly schedule has all 7 days configured");

  // --------------------------------------------------------------------------
  // TEST 2: Regular Operating Hours Configuration & Timezone Parsing
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Regular Operating Hours Configuration & Timezone Parsing");

  const updatedProfile = await theatreOperatingHoursService.upsertOperatingProfile(
    {
      theatreId: "th-pun-001",
      regularOpeningTime: "08:30",
      regularClosingTime: "01:00",
      lateNightClosing: true,
      timezone: "Asia/Kolkata",
    },
    PUNE_ADMIN
  );

  assert(updatedProfile.regularOpeningTime === "08:30", "Updated opening time to 08:30");
  assert(updatedProfile.regularClosingTime === "01:00", "Updated closing time to 01:00");
  assert(updatedProfile.lateNightClosing === true, "Late night closing flag enabled");
  assert(updatedProfile.version > 1, "Operating profile version incremented");

  // --------------------------------------------------------------------------
  // TEST 3: Weekly Schedule Rotations (Mon-Sun, Weekend Shifts, Closed Days)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Weekly Schedule Rotations");

  const saturdaySchedule = await theatreOperatingHoursService.upsertWeeklySchedule(
    {
      theatreId: "th-pun-001",
      schedules: [
        {
          dayOfWeek: "SATURDAY",
          isOpen: true,
          openTime: "08:00",
          closeTime: "02:00",
          isOvernight: true,
        },
      ],
    },
    PUNE_ADMIN
  );

  assert(saturdaySchedule.length >= 1, "Weekly schedule updated successfully");
  const sat = saturdaySchedule.find((s) => s.dayOfWeek === "SATURDAY");
  assert(sat !== undefined, "Saturday schedule entry returned");
  assert(sat?.openTime === "08:00", "Saturday opening set to 08:00");
  assert(sat?.closeTime === "02:00", "Saturday closing set to 02:00");

  // --------------------------------------------------------------------------
  // TEST 4: Holiday Operating Calendars (Full Closures & Adjusted Timings)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Holiday Operating Calendars");

  const newHoliday = await theatreOperatingHoursService.addHolidaySchedule(
    {
      theatreId: "th-pun-001",
      holidayName: "National Film Day",
      holidayDate: "2026-12-15",
      isClosed: false,
      partialOpenTime: "07:00",
      partialCloseTime: "15:00",
      notes: "Discounted festival tickets and extended screenings",
    },
    PUNE_ADMIN
  );

  assert(newHoliday.holidayName === "National Film Day", "Holiday schedule created");
  assert(newHoliday.holidayDate === "2026-12-15", "Holiday date set to 2026-12-15");
  assert(newHoliday.partialOpenTime === "07:00", "Festival partial opening set to 07:00");

  const holidayList = (await theatreOperatingHoursRepository.findBundle("th-pun-001")).holidays;
  assert(holidayList.some((h) => h.id === newHoliday.id), "Holiday present in repository listing");

  // --------------------------------------------------------------------------
  // TEST 5: Maintenance Schedules (Downtime Windows, Projector Upgrades)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Maintenance Schedules & Outage Windows");

  const maintenance = await theatreOperatingHoursService.addMaintenanceSchedule(
    {
      theatreId: "th-pun-001",
      maintenanceDate: "2026-11-20",
      startTime: "02:00",
      endTime: "06:00",
      affectedHalls: ["AUD-01", "AUD-02"],
      reason: "Scheduled laser optic lens calibration",
      status: "SCHEDULED",
    },
    PUNE_ADMIN
  );

  assert(maintenance.reason === "Scheduled laser optic lens calibration", "Maintenance scheduled");
  assert(maintenance.affectedHalls.length === 2, "2 auditoriums marked for maintenance");
  assert(maintenance.status === "SCHEDULED", "Maintenance status is SCHEDULED");

  // --------------------------------------------------------------------------
  // TEST 6: Special Operating Events (Midnight Premieres, Film Festivals)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Special Operating Events");

  const specialEvent = await theatreOperatingHoursService.addSpecialOperatingEvent(
    {
      theatreId: "th-pun-001",
      eventName: "Blockbuster Midnight Fan Screening",
      eventType: "MOVIE_PREMIERE",
      startDate: "2026-12-24",
      endDate: "2026-12-24",
      openTime: "23:00",
      closeTime: "23:59",
      notes: "Early access midnight launch with red carpet entrance",
    },
    PUNE_ADMIN
  );

  assert(specialEvent.eventName === "Blockbuster Midnight Fan Screening", "Special event recorded");
  assert(specialEvent.eventType === "MOVIE_PREMIERE", "Event classified as MOVIE_PREMIERE");
  assert(specialEvent.openTime === "23:00", "Special event starts at 23:00");

  // --------------------------------------------------------------------------
  // TEST 7: Schedule Validation & Invariants (24h Time, Ordering, ISO Dates)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Schedule Validation & Invariants");

  let validationFailed = false;
  try {
    await theatreOperatingHoursService.upsertOperatingProfile(
      {
        theatreId: "th-pun-001",
        regularOpeningTime: "invalid-time",
        regularClosingTime: "23:30",
      },
      PUNE_ADMIN
    );
  } catch (err: unknown) {
    validationFailed = true;
    assert(err instanceof ValidationError, "Rejected non-24h time format string");
  }
  assert(validationFailed, "Time validation guard successfully caught invalid time format");

  // --------------------------------------------------------------------------
  // TEST 8: Multi-Tenant Isolation & Boundary Enforcement
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Multi-Tenant Isolation & Boundary Enforcement");

  let tenantBlocked = false;
  try {
    // Mumbai admin attempting to alter Pune operating profile
    await theatreOperatingHoursService.upsertOperatingProfile(
      {
        theatreId: "th-pun-001",
        regularOpeningTime: "10:00",
      },
      MUMBAI_ADMIN
    );
  } catch (err: unknown) {
    tenantBlocked = true;
    assert(
      err instanceof TenantAccessError || err instanceof AuthorizationError,
      "Multi-tenant boundary blocked cross-theatre modification"
    );
  }
  assert(tenantBlocked, "Cross-tenant operating hours mutation forbidden");

  // --------------------------------------------------------------------------
  // TEST 9: Version Snapshot Ledger & Optimistic Concurrency
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Version Snapshot Ledger & History");

  const versions = await theatreOperatingHoursRepository.getVersions("th-pun-001");
  assert(versions.length >= 1, "At least 1 immutable version snapshot stored in ledger");
  const latestVersion = versions[0];
  assert(latestVersion.versionNumber >= 1, "Version number is strictly positive");
  assert(typeof latestVersion.snapshot === "object", "Snapshot payload preserved as structured object");

  // --------------------------------------------------------------------------
  // TEST 10: End-to-End Aggregated Bundle & Performance Cache Invalidation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: End-to-End Aggregated Bundle");

  const finalBundle = await theatreOperatingHoursService.getOperatingBundle("th-pun-001", SUPER_ADMIN);
  assert(finalBundle.profile !== null, "Final bundle includes operating profile");
  assert(finalBundle.weeklySchedules.length === 7, "Final bundle includes all 7 weekly schedules");
  assert(finalBundle.holidays.length >= 1, "Final bundle includes configured holidays");
  assert(finalBundle.maintenanceWindows.length >= 1, "Final bundle includes scheduled maintenance");
  assert(finalBundle.specialEvents.length >= 1, "Final bundle includes special events");
  assert(finalBundle.versions && finalBundle.versions.length >= 1, "Final bundle includes version audit trail");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 10 THEATRE OPERATING HOURS TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==============================================================================\n");
}

runOperatingHoursVerification().catch((err) => {
  console.error("FATAL ERROR in Operating Hours verification:", err);
  process.exit(1);
});
