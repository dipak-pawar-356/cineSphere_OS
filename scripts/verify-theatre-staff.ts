/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 10 Theatre Staff Management Verification Suite
 * ==============================================================================
 * 12 Comprehensive Verification Suites:
 * 1. Platform Permission Catalog & Role Templates Retrieval
 * 2. Staff Onboarding & Unique Employee Code Generation
 * 3. Staff Invitation Workflow (INVITED lifecycle state)
 * 4. Custom Theatre Role Creation & Hierarchies
 * 5. Platform Template Instantiation into Tenant Roles
 * 6. Dynamic Role Assignment & Multi-Role Capabilities
 * 7. Permission-Based Authorization Enforcement (Not Hardcoded Names)
 * 8. Role Transition Audit History Ledger
 * 9. Staff Lifecycle Transitions (Active -> Suspended -> Archived)
 * 10. Multi-Faceted Staff Search, Filtering & Pagination
 * 11. Multi-Tenant Boundary Isolation & Cross-Tenant Guards
 * 12. Multi-Theatre Staff Hierarchy Matrix (Theatre A vs B vs C)
 * ==============================================================================
 */

import { theatreStaffService } from "@/lib/services/theatre-staff.service";
import { theatreStaffRepository, PLATFORM_PERMISSION_CATALOG } from "@/lib/repositories/theatre-staff.repository";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  AuthorizationError,
  TenantAccessError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-staff-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-staff-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-staff-mumbai",
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runStaffVerification(): Promise<void> {
  console.log("\n==============================================================================");
  console.log("👥  CineSphere OS — Phase 3 Part 10 Theatre Staff Management Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Platform Permission Catalog & Role Templates Retrieval
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Platform Permission Catalog & Role Templates Retrieval");

  assert(PLATFORM_PERMISSION_CATALOG.length >= 20, "Platform permission catalog contains 20+ granular permissions");
  assert(
    PLATFORM_PERMISSION_CATALOG.some((p) => p.key === "bookings:create" && p.module === "BOOKINGS"),
    "Permission 'bookings:create' mapped to BOOKINGS module"
  );
  assert(
    PLATFORM_PERMISSION_CATALOG.some((p) => p.key === "halls:calibrate" && p.module === "HALLS"),
    "Permission 'halls:calibrate' mapped to HALLS module"
  );

  const templates = await theatreStaffService.getRoleTemplates(SUPER_ADMIN);
  assert(templates.length >= 10, "Platform exposes 10+ standard role templates");
  assert(
    templates.some((t) => t.templateCode === "TEMPLATE_THEATRE_ADMIN"),
    "Template 'TEMPLATE_THEATRE_ADMIN' exists"
  );
  assert(
    templates.some((t) => t.templateCode === "TEMPLATE_HALL_MGR"),
    "Template 'TEMPLATE_HALL_MGR' exists"
  );
  assert(
    templates.some((t) => t.templateCode === "TEMPLATE_PROJECTION"),
    "Template 'TEMPLATE_PROJECTION' exists"
  );

  // --------------------------------------------------------------------------
  // TEST 2: Staff Onboarding & Unique Employee Code Generation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Staff Onboarding & Unique Employee Code Generation");

  const onboarded = await theatreStaffService.createStaff(
    {
      theatreId: "th-pun-001",
      employeeCode: "EMP-PUN-099",
      firstName: "Devendra",
      lastName: "Koli",
      email: "devendra.koli@cinesphere.in",
      phone: "+91 98200 44556",
      designation: "Assistant Projectionist",
      departmentId: "dept-pun-ops",
      roleId: "role-pun-hallmgr",
      notes: "Apprentice projectionist onboarded for Laser 4K setup.",
    },
    PUNE_ADMIN
  );

  assert(onboarded.employeeCode === "EMP-PUN-099", "Staff onboarded with explicit employee code");
  assert(onboarded.employmentStatus === "ACTIVE", "Staff initial status is ACTIVE");
  assert(onboarded.primaryRole?.id === "role-pun-hallmgr", "Assigned initial role 'role-pun-hallmgr'");

  // Duplicate email check
  let duplicateEmailCaught = false;
  try {
    await theatreStaffService.createStaff(
      {
        theatreId: "th-pun-001",
        firstName: "Duplicate",
        lastName: "User",
        email: "devendra.koli@cinesphere.in", // duplicate
        phone: "+91 98200 11111",
        designation: "Trainee",
      },
      PUNE_ADMIN
    );
  } catch (err: unknown) {
    duplicateEmailCaught = true;
    assert(err instanceof ConflictError, "Duplicate staff email rejected with ConflictError");
  }
  assert(duplicateEmailCaught, "Duplicate email guard prevented double-onboarding");

  // Duplicate employee code check
  let duplicateCodeCaught = false;
  try {
    await theatreStaffService.createStaff(
      {
        theatreId: "th-pun-001",
        employeeCode: "EMP-PUN-099", // duplicate
        firstName: "Other",
        lastName: "Person",
        email: "other.person@cinesphere.in",
        phone: "+91 98200 22222",
        designation: "Trainee",
      },
      PUNE_ADMIN
    );
  } catch (err: unknown) {
    duplicateCodeCaught = true;
    assert(err instanceof ConflictError, "Duplicate employee code rejected with ConflictError");
  }
  assert(duplicateCodeCaught, "Duplicate employee code rejected in same theatre");

  // --------------------------------------------------------------------------
  // TEST 3: Staff Invitation Workflow (INVITED lifecycle state)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Staff Invitation Workflow");

  const invited = await theatreStaffService.inviteStaff(
    {
      theatreId: "th-pun-001",
      firstName: "Neha",
      lastName: "Joshi",
      email: "neha.joshi@cinesphere.in",
      designation: "Customer Relationship Officer",
      roleId: "role-pun-vipmgr",
      notes: "Invited to join Pune VIP Concierge wing.",
    },
    PUNE_ADMIN
  );

  assert(invited.employmentStatus === "INVITED", "Invited staff receives 'INVITED' status");
  assert(invited.employeeCode.startsWith("INV-"), "Invited staff receives 'INV-' code prefix");
  assert(invited.primaryRole?.id === "role-pun-vipmgr", "Invitation includes assigned role");

  // --------------------------------------------------------------------------
  // TEST 4: Custom Theatre Role Creation & Hierarchies
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Custom Theatre Role Creation & Hierarchies");

  const customRole = await theatreStaffService.createTheatreRole(
    {
      theatreId: "th-pun-001",
      roleCode: "BUTLER_CHEF_LEAD",
      name: "Butler Dining Chef Lead",
      description: "Oversees in-theatre gourmet service and kitchen preparation.",
      hierarchyLevel: 3,
      permissions: ["dashboard:view", "shows:read", "tickets:validate"],
    },
    PUNE_ADMIN
  );

  assert(customRole.roleCode === "BUTLER_CHEF_LEAD", "Custom role code created");
  assert(customRole.isCustom === true, "Role marked isCustom: true");
  assert(customRole.theatreId === "th-pun-001", "Custom role belongs to Pune tenant");

  // --------------------------------------------------------------------------
  // TEST 5: Platform Template Instantiation into Tenant Roles
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Platform Template Instantiation into Tenant Roles");

  const instantiatedRole = await theatreStaffService.instantiateRoleFromTemplate(
    {
      theatreId: "th-pun-001",
      templateId: "tmpl-food-court",
      customName: "Gourmet Concessions Lead",
      customDescription: "Instantiated from standard platform food court template.",
    },
    PUNE_ADMIN
  );

  assert(instantiatedRole.name === "Gourmet Concessions Lead", "Instantiated role applied custom display name");
  assert(instantiatedRole.templateId === "tmpl-food-court", "Instantiated role tracks source template ID");
  assert(instantiatedRole.theatreId === "th-pun-001", "Instantiated role is owned strictly by Pune theatre");

  // --------------------------------------------------------------------------
  // TEST 6: Dynamic Role Assignment & Multi-Role Capabilities
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Dynamic Role Assignment & Multi-Role Capabilities");

  const reAssigned = await theatreStaffService.assignRole(
    {
      theatreId: "th-pun-001",
      staffId: onboarded.id,
      roleId: customRole.id,
      isPrimary: false, // Secondary role
      reason: "Secondary cross-training for Butler Dining",
    },
    PUNE_ADMIN
  );

  assert(reAssigned.roles.length >= 2, "Crew member holds multiple roles");
  assert(
    reAssigned.roles.some((r) => r.id === customRole.id),
    "Secondary role 'BUTLER_CHEF_LEAD' assigned"
  );
  assert(reAssigned.primaryRole?.id === "role-pun-hallmgr", "Primary role remains 'role-pun-hallmgr'");

  // --------------------------------------------------------------------------
  // TEST 7: Permission-Based Authorization Enforcement
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Permission-Based Authorization Enforcement");

  // The crew member Devendra has roles with halls:read, halls:calibrate, shows:read, tickets:validate, dashboard:view
  const canReadHalls = await theatreStaffService.hasPermission(onboarded.id, "halls:read");
  assert(canReadHalls === true, "Staff with Hall Manager role authorized for 'halls:read'");

  const canCalibrate = await theatreStaffService.hasPermission(onboarded.id, "halls:calibrate");
  assert(canCalibrate === true, "Staff authorized for 'halls:calibrate'");

  const canManagePlatform = await theatreStaffService.hasPermission(onboarded.id, "platform:manage");
  assert(canManagePlatform === false, "Theatre crew member strictly DENIED platform:manage permission");

  // --------------------------------------------------------------------------
  // TEST 8: Role Transition Audit History Ledger
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Role Transition Audit History Ledger");

  const history = await theatreStaffService.getRoleHistory("th-pun-001", onboarded.id, PUNE_ADMIN);
  assert(history.length >= 2, "Role history contains both initial onboarding and secondary assignment");
  assert(history[0].changeType === "ASSIGNED", "Latest role transition recorded as 'ASSIGNED'");

  // --------------------------------------------------------------------------
  // TEST 9: Staff Lifecycle Transitions (Active -> Suspended -> Archived)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Staff Lifecycle Transitions (Active -> Suspended -> Archived)");

  const suspended = await theatreStaffService.suspendStaff(
    {
      id: onboarded.id,
      theatreId: "th-pun-001",
      reason: "Temporary safety audit suspension pending projector certification renewal",
    },
    PUNE_ADMIN
  );

  assert(suspended.employmentStatus === "SUSPENDED", "Staff status transitioned to SUSPENDED");

  // Suspended staff immediately loses all authorization capabilities
  const suspendedPermissionCheck = await theatreStaffService.hasPermission(onboarded.id, "halls:read");
  assert(suspendedPermissionCheck === false, "Suspended crew member immediately denied all module permissions");

  // Archive staff
  const archived = await theatreStaffService.archiveStaff(
    {
      id: onboarded.id,
      theatreId: "th-pun-001",
      reason: "Archived off the active operations register",
    },
    PUNE_ADMIN
  );
  assert(archived.employmentStatus === "ARCHIVED", "Staff status transitioned to ARCHIVED");

  // --------------------------------------------------------------------------
  // TEST 10: Multi-Faceted Staff Search, Filtering & Pagination
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Multi-Faceted Staff Search, Filtering & Pagination");

  const searchByName = await theatreStaffService.searchStaff(
    {
      theatreId: "th-pun-001",
      query: "Rajesh",
    },
    PUNE_ADMIN
  );
  assert(searchByName.items.length >= 1, "Found staff by first name keyword 'Rajesh'");
  assert(searchByName.items[0].displayName === "Rajesh Sharma", "Matched Rajesh Sharma");

  const searchByCode = await theatreStaffService.searchStaff(
    {
      theatreId: "th-pun-001",
      query: "EMP-PUN-001",
    },
    PUNE_ADMIN
  );
  assert(searchByCode.items.length === 1, "Found exact match by employee code 'EMP-PUN-001'");

  const filterByDept = await theatreStaffService.searchStaff(
    {
      theatreId: "th-pun-001",
      departmentId: "dept-pun-ops",
    },
    PUNE_ADMIN
  );
  assert(filterByDept.items.length >= 1, "Filtered staff by Operations department");

  // --------------------------------------------------------------------------
  // TEST 11: Multi-Tenant Boundary Isolation & Cross-Tenant Guards
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 11: Multi-Tenant Boundary Isolation & Cross-Tenant Guards");

  let crossTenantReadBlocked = false;
  try {
    // Mumbai Admin attempting to read Pune staff bundle
    await theatreStaffService.getOrganizationBundle("th-pun-001", MUMBAI_ADMIN);
  } catch (err: unknown) {
    crossTenantReadBlocked = true;
    assert(
      err instanceof TenantAccessError || err instanceof AuthorizationError,
      "Multi-tenant boundary strictly blocked Mumbai admin from accessing Pune staff organization"
    );
  }
  assert(crossTenantReadBlocked, "Cross-tenant staff read blocked");

  let crossTenantMutateBlocked = false;
  try {
    // Mumbai Admin attempting to onboard staff into Pune
    await theatreStaffService.createStaff(
      {
        theatreId: "th-pun-001",
        firstName: "Intruder",
        lastName: "Attempt",
        email: "intruder@cinesphere.com",
        phone: "+91 99999 99999",
        designation: "Illegal Role",
      },
      MUMBAI_ADMIN
    );
  } catch (err: unknown) {
    crossTenantMutateBlocked = true;
    assert(
      err instanceof TenantAccessError || err instanceof AuthorizationError,
      "Multi-tenant boundary strictly blocked cross-tenant staff onboarding"
    );
  }
  assert(crossTenantMutateBlocked, "Cross-tenant staff onboarding mutation blocked");

  // --------------------------------------------------------------------------
  // TEST 12: Multi-Theatre Staff Hierarchy Matrix (Theatre A vs B vs C)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 12: Multi-Theatre Staff Hierarchy Matrix (Theatre A vs B vs C)");

  const bundleA = await theatreStaffService.getOrganizationBundle("th-pun-001", SUPER_ADMIN);
  const bundleB = await theatreStaffService.getOrganizationBundle("th-mum-001", SUPER_ADMIN);
  const bundleC = await theatreStaffService.getOrganizationBundle("th-dxb-001", SUPER_ADMIN);

  // Theatre A checks
  assert(
    bundleA.roles.some((r) => r.roleCode === "VIP_LOUNGE_MGR"),
    "Theatre A has custom role 'VIP_LOUNGE_MGR'"
  );
  assert(
    bundleA.roles.some((r) => r.roleCode === "SNACK_MGR"),
    "Theatre A has custom role 'SNACK_MGR'"
  );
  assert(
    bundleA.staff.some((s) => s.employeeCode === "EMP-PUN-001"),
    "Theatre A staff roster includes Rajesh Sharma"
  );

  // Theatre B checks
  assert(
    bundleB.roles.some((r) => r.roleCode === "CINEMA_MANAGER"),
    "Theatre B has custom role 'CINEMA_MANAGER'"
  );
  assert(
    bundleB.roles.some((r) => r.roleCode === "PROJECTION_ENGINEER"),
    "Theatre B has custom role 'PROJECTION_ENGINEER'"
  );
  assert(
    bundleB.staff.some((s) => s.employeeCode === "EMP-MUM-101"),
    "Theatre B staff roster includes Carlos Mendez"
  );

  // Theatre C checks
  assert(
    bundleC.roles.some((r) => r.roleCode === "OPERATIONS_HEAD"),
    "Theatre C has custom role 'OPERATIONS_HEAD'"
  );
  assert(
    bundleC.staff.some((s) => s.employeeCode === "EMP-DXB-201"),
    "Theatre C staff roster includes Tariq Al-Mansoor"
  );

  // Assert isolation: Theatre B does NOT have VIP_LOUNGE_MGR
  assert(
    !bundleB.roles.some((r) => r.roleCode === "VIP_LOUNGE_MGR"),
    "Theatre B does NOT inherit Theatre A's custom 'VIP_LOUNGE_MGR' role"
  );
  // Assert isolation: Theatre C does NOT have CINEMA_MANAGER
  assert(
    !bundleC.roles.some((r) => r.roleCode === "CINEMA_MANAGER"),
    "Theatre C does NOT inherit Theatre B's custom 'CINEMA_MANAGER' role"
  );

  console.log("\n==============================================================================");
  console.log("🎉  ALL 12 THEATRE STAFF MANAGEMENT TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==============================================================================\n");
}

runStaffVerification().catch((err) => {
  console.error("FATAL ERROR in Theatre Staff verification:", err);
  process.exit(1);
});
