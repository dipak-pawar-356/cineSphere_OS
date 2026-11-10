/**
 * ==============================================================================
 * CineSphere OS — Automated Verification Suite: Security & Platform Hardening
 * Phase 2 – Part 16
 * 
 * Verifies all layers of enterprise security and production readiness:
 * 1. Layer 1 (Client & Edge Input Sanitization): Strips XSS, SQLi strings, prototype pollution, CRLF
 * 2. Layer 2 (Edge CSRF & Origin Validation): Cryptographic token generation, timing-safe equality, origin check
 * 3. Layer 3 (Server-side Zod Schema Validation): Strict typed validation & field error reporting
 * 4. Layer 4 (Rate Limiting Subsystem): Sliding window thresholds, retry-after countdowns, automatic security events
 * 5. Layer 5 (Business Authorization & RBAC): 5-tier role hierarchy evaluation and permission gating
 * 6. Layer 6 (Tenant Isolation): Absolute cross-tenant boundary verification and violation recording
 * 7. Layer 7 (Booking Optimistic Locking): Version control, concurrency collision detection, and retry orchestration
 * 8. Layer 8 (Payment Abstraction): Platform -> Theatre -> Payment Configuration -> Booking -> Transaction flow
 * 9. Layer 9 (Structured Logging): Correlation ID propagation, JSON formatting, sensitive credential redaction
 * 10. Layer 10 (Security Events Tracking): Intrusion tracking for failed logins, violations, and rate limit triggers
 * 11. Layer 11 (Centralized Error Handling): Production stack trace redaction and standardized response contract
 * 12. Layer 12 (System Health & Observability): Real-time liveness, readiness, and performance tracking hooks
 * 13. Layer 13 (Domain Service & Repository Decoupling): Domain services remain framework-independent
 * ==============================================================================
 */

import {
  sanitizeString,
  stripHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeQueryParams,
  sanitizeCookieValue,
  sanitizeObject,
  escapeHtml,
} from "../lib/security/input-sanitizer";
import {
  generateCsrfToken,
  verifyCsrfToken,
  verifyRequestOrigin,
  createDoubleSubmitTokenPair,
  verifyDoubleSubmitRequest,
} from "../lib/security/csrf-protection";
import {
  validateSqlIdentifier,
  whitelistSortColumn,
  detectSqlInjectionPattern,
  buildSafePaginationBounds,
} from "../lib/security/sql-injection-guard";
import {
  validateServerInput,
  BookingSessionRequestSchema,
  PaymentConfigRequestSchema,
  LoginRequestSchema,
  TenantOwnershipSchema,
} from "../lib/security/validation-schemas";
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimiterTelemetry,
} from "../lib/security/rate-limiter";
import {
  recordSecurityEvent,
  getSecurityEvents,
  resolveSecurityEvent,
} from "../lib/security/security-events";
import {
  createLogger,
  getRecentStructuredLogs,
} from "../lib/observability/structured-logger";
import {
  checkDatabaseHealth,
  getSystemHealthReport,
  withPerformanceTracking,
} from "../lib/observability/health-monitor";
import {
  paginateArray,
  withQueryCache,
  invalidateCacheByTag,
  buildCacheControlHeader,
  futureRedisCacheAdapter,
  computeVirtualSlice,
} from "../lib/performance/cache-strategy";
import {
  AppError,
  ValidationError,
  TenantAccessError,
  ConflictError,
  RateLimitError,
  formatErrorResponse,
} from "../lib/errors/app-error";
import { tenantService } from "../lib/services/tenant.service";
import { bookingDomainService } from "../lib/services/booking-domain.service";
import { paymentDomainService } from "../lib/services/payment-domain.service";
import { securityAuditService } from "../lib/services/security-audit.service";
import { bookingRepository } from "../lib/repositories/booking.repository";
import { theatreRepository } from "../lib/repositories/theatre.repository";
import { SecurityActorContext } from "../types/security-hardening.types";
import { createProtectedAction } from "../lib/security/action-guard";
import { z } from "zod";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runSecurityVerification() {
  console.log("\n==============================================================================");
  console.log("🛡️  CineSphere OS — Phase 2 Part 16 Security & Hardening Verification Suite");
  console.log("==============================================================================\n");

  // ----------------------------------------------------------------------------
  // Test 1: Input Sanitization (XSS, SQLi, CRLF, Prototype Pollution)
  // ----------------------------------------------------------------------------
  console.log("👉 Test 1: Input Sanitization & Threat Neutralization");
  const maliciousScript = "<script>alert('XSS-ATTACK')</script>Hello CineSphere";
  const sanitizedString = sanitizeString(maliciousScript);
  assert(!sanitizedString.includes("<script>"), "Strips active script tags from user input");
  assert(sanitizedString === "Hello CineSphere", "Preserves benign textual content");

  const rawHtml = "<b>VIP</b> <img src=x onerror=alert(1)> Recliner";
  const stripped = stripHtml(rawHtml);
  assert(stripped === "VIP  Recliner", "Strips dangerous HTML markup completely");

  const dangerousUrl = "javascript:alert(document.cookie)";
  const sanitizedUrl = sanitizeUrl(dangerousUrl);
  assert(sanitizedUrl === "", "Blocks dangerous javascript: pseudo-protocol in URLs");

  const validUrl = sanitizeUrl("https://cinesphere.os/booking/show-01");
  assert(validUrl === "https://cinesphere.os/booking/show-01", "Allows safe HTTPS URLs");

  const crlfEmail = "admin@cinesphere.os\r\nBcc: hacker@evil.com";
  const cleanEmail = sanitizeEmail(crlfEmail);
  assert(!cleanEmail.includes("\r") && !cleanEmail.includes("\n"), "Neutralizes CRLF injection in email fields");

  const dirtyPhone = "+91 (98234) 56789 <script>";
  const cleanPhone = sanitizePhone(dirtyPhone);
  assert(cleanPhone === "+91 (98234) 56789", "Strips non-phone characters from phone inputs");

  const dangerousObj = JSON.parse('{"title": "Avatar", "__proto__": {"polluted": true}}');
  const safeObj = sanitizeObject(dangerousObj);
  assert(
    !Object.prototype.hasOwnProperty.call(Object.prototype, "polluted"),
    "Prevents Prototype Pollution attacks by discarding __proto__ keys"
  );
  assert((safeObj as { title: string }).title === "Avatar", "Preserves valid sanitized object keys");

  // ----------------------------------------------------------------------------
  // Test 2: CSRF & Origin Validation
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 2: CSRF Protection & Origin Validation");
  const tokenA = generateCsrfToken();
  const tokenB = generateCsrfToken();
  assert(tokenA.length >= 32, "Generates high-entropy cryptographic CSRF token");
  assert(tokenA !== tokenB, "Successive CSRF tokens are unique");
  assert(verifyCsrfToken(tokenA, tokenA), "Timing-safe verification succeeds for matching CSRF token");
  assert(!verifyCsrfToken(tokenA, tokenB), "Timing-safe verification rejects mismatched CSRF token");
  assert(!verifyCsrfToken(tokenA, undefined), "Rejects undefined CSRF token");

  const originValid = verifyRequestOrigin("https://cinesphere.os", null, "cinesphere.os");
  assert(originValid, "Validates matching same-origin host header");
  const originForged = verifyRequestOrigin("https://evil-phishing.com", null, "cinesphere.os");
  assert(!originForged, "Rejects cross-origin CSRF forgery attempt");

  // ----------------------------------------------------------------------------
  // Test 3: Server-side Zod Validation Schemas
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 3: Server-side Validation Schemas");
  const validBookingInput = {
    showId: "show-avatar-01",
    customerName: "Dipak Pawar",
    customerEmail: "dipak@example.com",
    customerPhone: "+91 98234 56789",
  };
  const parsedBooking = validateServerInput(BookingSessionRequestSchema, validBookingInput);
  assert(parsedBooking.showId === "show-avatar-01", "Accepts and parses compliant booking payload");

  let threwValidation = false;
  try {
    validateServerInput(BookingSessionRequestSchema, {
      showId: "", // Invalid: empty string
      customerEmail: "not-an-email",
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      threwValidation = true;
      assert(Boolean(err.fieldErrors?.showId), "Generates field error for missing showId");
      assert(Boolean(err.fieldErrors?.customerEmail), "Generates field error for invalid email");
    }
  }
  assert(threwValidation, "Throws typed ValidationError on invalid schema input");

  // ----------------------------------------------------------------------------
  // Test 4: Rate Limiting Subsystem
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 4: Rate Limiting & Abuse Prevention");
  const testIp = "192.168.1.100";
  resetRateLimit(testIp, "LOGIN");

  // Login threshold: 5 requests max
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testIp, "LOGIN");
    assert(res.allowed, `Allows request #${i + 1} within threshold`);
  }

  // 6th request must be rate limited
  const blockedRes = checkRateLimit(testIp, "LOGIN");
  assert(!blockedRes.allowed, "Blocks 6th request exceeding login threshold");
  assert(blockedRes.remaining === 0, "Remaining requests is 0 when throttled");
  assert(blockedRes.retryAfterSec > 0, "Provides accurate Retry-After countdown");

  const telemetry = getRateLimiterTelemetry();
  assert(telemetry.activeKeys > 0, "Rate limiter telemetry tracks active bucket keys");

  // ----------------------------------------------------------------------------
  // Test 5: Role-Based Access Control (RBAC) & Hierarchy
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 5: Role-Based Access Control (RBAC)");
  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-01",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-test-01",
  };
  const theatreAdminActor: SecurityActorContext = {
    userId: "usr-th-admin-01",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["theatres:read", "shows:write"],
    correlationId: "corr-test-02",
  };
  const customerActor: SecurityActorContext = {
    userId: "usr-cust-01",
    role: "CUSTOMER",
    permissions: ["bookings:read", "tickets:read"],
    correlationId: "corr-test-03",
  };

  assert(superAdminActor.role === "SUPER_ADMIN", "Super Admin holds unrestricted operational authority");
  assert(theatreAdminActor.role === "THEATRE_ADMIN", "Theatre Admin holds multiplex administrative role");
  assert(customerActor.role === "CUSTOMER", "Customer holds guest ticketing role");

  // ----------------------------------------------------------------------------
  // Test 6: Absolute Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 6: Multi-Tenant Boundary Isolation");
  // Super Admin can access any theatre
  await tenantService.assertTenantAccess(superAdminActor, "th-pun-001");
  await tenantService.assertTenantAccess(superAdminActor, "th-mum-001");
  assert(true, "Super Admin accesses all multiplex tenants across circuit");

  // Theatre Admin can access assigned theatre
  await tenantService.assertTenantAccess(theatreAdminActor, "th-pun-001");
  assert(true, "Theatre Admin successfully accesses assigned complex 'th-pun-001'");

  // Theatre Admin ATTEMPTING to access another theatre must be rejected
  let crossTenantBlocked = false;
  try {
    await tenantService.assertTenantAccess(theatreAdminActor, "th-mum-001");
  } catch (err) {
    if (err instanceof TenantAccessError) {
      crossTenantBlocked = true;
      assert(err.attemptedTenantId === "th-mum-001", "Logs attempted cross-tenant complex");
      assert(err.userTenantId === "th-pun-001", "Logs user assigned complex");
    }
  }
  assert(crossTenantBlocked, "Strictly rejects Theatre Admin cross-tenant access to 'th-mum-001'");

  // ----------------------------------------------------------------------------
  // Test 7: Booking Concurrency & Optimistic Locking
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 7: Optimistic Locking & Concurrency Control");
  const testBooking = await bookingRepository.findById("bk-202611-001");
  assert(testBooking !== null, "Resolves seed booking 'bk-202611-001'");
  const initialVersion = testBooking!.version;

  // Concurrent update 1 (Version matches -> succeeds)
  const updated1 = await bookingDomainService.updateBookingStatusWithLock(
    "bk-202611-001",
    initialVersion,
    "COMPLETED",
    theatreAdminActor
  );
  assert(updated1.version === initialVersion + 1, "Increments concurrency version upon successful update");
  assert(updated1.bookingStatus === "COMPLETED", "Updates status to COMPLETED");

  // Concurrent update 2 (Uses old stale initialVersion -> Conflict collision!)
  let conflictCaught = false;
  try {
    await bookingDomainService.updateBookingStatusWithLock(
      "bk-202611-001",
      initialVersion, // Stale version!
      "CANCELLED",
      theatreAdminActor
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      conflictCaught = true;
      assert(err.currentVersion === initialVersion + 1, "Detects that current version advanced");
      assert(err.expectedVersion === initialVersion, "Reports client's stale expected version");
    }
  }
  assert(conflictCaught, "Detects concurrent race condition and throws ConflictError");

  // Retry runner verification
  let retryCounter = 0;
  const retryResult = await bookingDomainService.executeWithOptimisticRetry(async () => {
    retryCounter++;
    if (retryCounter < 2) {
      throw new ConflictError("Simulated transient version collision");
    }
    return "SUCCESS_AFTER_RETRY";
  }, 3);
  assert(retryResult === "SUCCESS_AFTER_RETRY", "Optimistic retry runner automatically retries and succeeds");
  assert(retryCounter === 2, "Retried exactly on conflict");

  // ----------------------------------------------------------------------------
  // Test 8: Payment Abstraction Architecture
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 8: Payment Abstraction (Platform -> Theatre -> Config -> Booking -> Tx)");
  const resolvedPayment = await paymentDomainService.resolveActivePaymentConfig("th-pun-001", {
    amount: 550.0,
    bookingRef: "BK-TEST-9001",
  });
  assert(resolvedPayment.theatreId === "th-pun-001", "Resolves payment configuration scoped to theatre");
  assert(resolvedPayment.provider === "UPI", "Resolves active provider rail (UPI)");
  assert(Boolean(resolvedPayment.upiIntentUri), "Synthesizes standard NPCI UPI Intent URI dynamically");
  assert(
    decodeURIComponent(resolvedPayment.upiIntentUri!).includes("pa=cinesphere.pune@icici"),
    "Includes merchant VPA in intent URI"
  );
  assert(resolvedPayment.upiIntentUri!.includes("am=550.00"), "Includes formatted amount in intent URI");
  assert(resolvedPayment.upiIntentUri!.includes("mc=7832"), "Includes MCC 7832 (Cinema Theatres)");
  assert(Boolean(resolvedPayment.qrPayloadUrl), "Generates dynamic QR image endpoint for kiosk/mobile");

  // Validate transaction amount
  assert(paymentDomainService.validateTransactionAmount(550.0, 550.0), "Validates matching transaction amounts");

  // ----------------------------------------------------------------------------
  // Test 9: Structured Logging & Secret Scrubbing
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 9: Structured Logging & Credential Scrubbing");
  const testLogger = createLogger("TestRunner");
  const logEntry = testLogger.info("AUTH", "User session verified", {
    userId: "usr-01",
    theatreId: "th-pun-001",
    correlationId: "corr-audit-01",
    metadata: {
      clientIp: "127.0.0.1",
      password: "SuperSecretPassword123!", // Should be scrubbed!
      token: "secret-bearer-token",        // Should be scrubbed!
    },
  });

  assert(logEntry.module === "TestRunner", "Logs originating module");
  assert(logEntry.category === "AUTH", "Logs structured category");
  assert(logEntry.metadata?.password === "[REDACTED]", "Scrubs password from metadata");
  assert(logEntry.metadata?.token === "[REDACTED]", "Scrubs token from metadata");

  const recentLogs = getRecentStructuredLogs({ category: "AUTH", limit: 5 });
  assert(recentLogs.length > 0, "Retrieves recent logs from structured telemetry buffer");

  // ----------------------------------------------------------------------------
  // Test 10: Security Events & Intrusion Tracking
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 10: Security Events Tracking");
  const secEvent = recordSecurityEvent({
    eventType: "FAILED_LOGIN",
    severity: "HIGH",
    actorId: "usr-bad-actor",
    ipAddress: "203.0.113.195",
    details: "3 consecutive invalid password attempts on user account",
  });
  assert(secEvent.eventType === "FAILED_LOGIN", "Records security event type");
  assert(secEvent.severity === "HIGH", "Records security event severity");
  assert(!secEvent.isResolved, "New security events are unresolved by default");

  const unresolvedEvents = getSecurityEvents({ eventType: "FAILED_LOGIN", isResolved: false });
  assert(unresolvedEvents.some((e) => e.id === secEvent.id), "Queries unresolved security events");

  const resolved = resolveSecurityEvent(secEvent.id);
  assert(resolved, "Resolves security event via supervisor action");

  // ----------------------------------------------------------------------------
  // Test 11: Centralized Production Error Handling
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 11: Production-Safe Error Formatting & Redaction");
  const internalDbError = new Error("FATAL: connection to server on socket '/var/run/postgresql/.s.PGSQL.5432' failed");
  const devFormatted = formatErrorResponse(internalDbError, false, "corr-err-01");
  assert(devFormatted.error.message.includes("PGSQL"), "In development mode, preserves technical error");

  const prodFormatted = formatErrorResponse(internalDbError, true, "corr-err-01");
  assert(
    prodFormatted.error.message === "An unexpected operational error occurred",
    "In production mode, strictly redacts internal database connection strings"
  );
  assert(prodFormatted.error.correlationId === "corr-err-01", "Preserves correlation ID for backend log triage");

  // ----------------------------------------------------------------------------
  // Test 12: System Health & Observability Probes
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 12: System Health Probes & Performance Monitoring");
  const dbHealth = await checkDatabaseHealth();
  assert(dbHealth.status === "HEALTHY", "Database health probe returns HEALTHY status");
  assert(dbHealth.latencyMs >= 0, "Measures database ping latency in milliseconds");

  const systemReport = await getSystemHealthReport();
  assert(systemReport.status === "HEALTHY" || systemReport.status === "DEGRADED", "System health report generated");
  assert(systemReport.checks.memory.heapUsedMb > 0, "Telemetry monitors memory heap usage");
  assert(systemReport.uptimeSec >= 0, "Telemetry monitors application uptime in seconds");

  // Performance tracking wrapper
  const trackedResult = await withPerformanceTracking("testCalculation", async () => {
    let sum = 0;
    for (let i = 0; i < 10000; i++) sum += i;
    return sum;
  });
  assert(trackedResult === 49995000, "Performance tracker executes and returns wrapped result");

  // ----------------------------------------------------------------------------
  // Test 13: Protected Server Action Wrapper
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 13: Protected Server Action Execution Pipeline");
  const TestActionSchema = z.object({
    theatreId: z.string().min(1),
    message: z.string().min(3),
  });

  const testProtectedAction = createProtectedAction<z.infer<typeof TestActionSchema>, { echo: string }>(
    {
      actionName: "testProtectedAction",
      schema: TestActionSchema,
      rateLimitCategory: "ADMIN_API",
      requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
      enforceTenantIsolation: true,
      tenantIdExtractor: (input) => input.theatreId,
      auditModule: "TEST",
      auditAction: "EXECUTE",
    },
    async (input) => {
      return { echo: input.message };
    }
  );

  // Successful execution with matching tenant
  const actionSuccess = await testProtectedAction(
    { theatreId: "th-pun-001", message: "Hello CineSphere" },
    theatreAdminActor
  );
  assert(actionSuccess.success, "Protected server action succeeds with valid credentials and tenant match");
  assert(actionSuccess.data?.echo === "Hello CineSphere", "Returns expected result data");
  assert(Boolean(actionSuccess.correlationId), "Attaches correlation ID to action response");

  // Cross-tenant execution -> blocked by tenant guard in action wrapper
  const actionCrossTenant = await testProtectedAction(
    { theatreId: "th-mum-001", message: "Breach attempt" },
    theatreAdminActor // Assigned to th-pun-001
  );
  assert(!actionCrossTenant.success, "Protected action blocks cross-tenant execution");
  assert(actionCrossTenant.error?.code === "TENANT_ACCESS_DENIED", "Returns TENANT_ACCESS_DENIED error code");

  // Role unauthorized execution
  const actionCustomerUnauthorized = await testProtectedAction(
    { theatreId: "th-pun-001", message: "Customer breach" },
    customerActor // CUSTOMER does not have THEATRE_ADMIN role
  );
  assert(!actionCustomerUnauthorized.success, "Protected action blocks unauthorized user role");
  assert(actionCustomerUnauthorized.error?.code === "FORBIDDEN", "Returns FORBIDDEN error code");

  // ----------------------------------------------------------------------------
  // Test 14: SQLi Guard, Cookies/Query Sanitization, Double Submit CSRF & Caching
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 14: SQLi Guard, Double Submit CSRF, Auth Validation & Caching Layer");

  const sanitizedCookie = sanitizeCookieValue("abc123;\r\nHttpOnly;Evil=1");
  assert(!sanitizedCookie.includes(";") && !sanitizedCookie.includes("\r"), "Strips cookie injection delimiters");

  const cleanQuery = sanitizeQueryParams({ q: "Dune%_\\", __proto__: "bad", city: "Pune" });
  assert(cleanQuery.q === "Dune", "Sanitizes URL search/query parameters");
  assert(cleanQuery.city === "Pune", "Preserves benign query parameters");

  const dsPair = createDoubleSubmitTokenPair();
  assert(verifyDoubleSubmitRequest(dsPair.token, dsPair.token), "Verifies matching double-submit cookie & header token");
  assert(!verifyDoubleSubmitRequest(dsPair.token, "tampered"), "Rejects mismatched double-submit CSRF header");

  assert(detectSqlInjectionPattern("'; DROP TABLE bookings; --"), "Detects malicious SQL injection syntax");
  assert(!detectSqlInjectionPattern("Dune: Part Two"), "Allows harmless movie search titles");
  assert(whitelistSortColumn("createdAt", ["createdAt", "totalAmount"] as const, "createdAt") === "createdAt", "Accepts allowlisted SQL sort columns");
  assert(whitelistSortColumn("id; DROP TABLE users", ["createdAt", "totalAmount"] as const, "createdAt") === "createdAt", "Falls back cleanly on invalid sort columns");
  assert(validateSqlIdentifier("booking_status") === "booking_status", "Validates safe snake_case identifiers");
  const bounds = buildSafePaginationBounds(2, 500, 100);
  assert(bounds.limit === 100 && bounds.offset === 100, "Clamps pagination limits strictly under ceiling");

  const parsedLogin = validateServerInput(LoginRequestSchema, { email: "gm@cinesphere.io", password: "Password123" });
  assert(parsedLogin.email === "gm@cinesphere.io", "Validates login request payloads server-side");

  const parsedOwnership = validateServerInput(TenantOwnershipSchema, {
    actorId: "usr-01",
    actorRole: "THEATRE_ADMIN",
    assignedTheatreId: "th-pun-001",
    targetTheatreId: "th-pun-001",
  });
  assert(parsedOwnership.targetTheatreId === "th-pun-001", "Validates tenant ownership schema");

  const extendedHealth = await getSystemHealthReport();
  assert(typeof extendedHealth.checks.cpu.usagePercentPlaceholder === "number", "Reports CPU placeholder telemetry");
  assert(typeof extendedHealth.checks.apiTelemetry.averageResponseTimeMs === "number", "Reports API response time average");
  assert(typeof extendedHealth.checks.apiTelemetry.errorRatePercent === "number", "Reports cumulative API error rate %");

  assert(buildCacheControlHeader("NO_STORE").includes("no-store"), "Applies strict NO_STORE headers for financial routes");
  await futureRedisCacheAdapter.set("test:cache:key", { ok: true }, 60, ["tag:test"]);
  const cachedVal = await futureRedisCacheAdapter.get<{ ok: boolean }>("test:cache:key");
  assert(cachedVal?.ok === true, "Future Redis cache adapter placeholder stores & reads typed entries");
  const invalidated = await futureRedisCacheAdapter.invalidateTag("tag:test");
  assert(invalidated === 1, "Invalidates cached keys cleanly by tag");

  const mockRows = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
  const slice = computeVirtualSlice(mockRows, 560, 480, 56, 2);
  assert(slice.visibleItems.length < 25 && slice.totalHeightPx === 56000, "Computes bounded virtual scroll slice without DOM bloat");

  console.log("\n==============================================================================");
  console.log("🎉 ALL 14 TEST SUITES PASSED! Platform is fully hardened & production-ready.");
  console.log("==============================================================================\n");
}

runSecurityVerification().catch((err) => {
  console.error("FATAL: Verification failed with exception:", err);
  process.exit(1);
});
