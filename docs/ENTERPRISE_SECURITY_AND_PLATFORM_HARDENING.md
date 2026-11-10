# 🛡️ Enterprise Security, Production Readiness & Platform Hardening

> **CineSphere OS — Architectural Specification & Engineering Guide**  
> *Phase 2 – Part 16: Layered Security Architecture, Domain Service Pattern, Optimistic Locking, Threat Monitoring & Observability*

---

## 📌 1. Executive Summary

As CineSphere OS completes **Phase 2 (Core Operating System Services)**, the platform is hardened for high-scale enterprise production. Operating cinema circuits screening thousands of daily shows across multiple metropolitan complexes requires strict separation of concerns, absolute multi-tenant data isolation, non-repudiation, tamper-evident audit logging, and sub-millisecond reliability.

This release achieves three foundational goals:
1. **Layered Defense-in-Depth:** Separates edge security, application security, business authorization, tenant isolation, database protection, observability, and performance optimization into distinct, auditable architectural tiers.
2. **Domain Service & Repository Decoupling:** Introduces a clean service layer between Next.js Server Actions and PostgreSQL, isolating cinema business rules (booking validation, pricing resolution, payment configuration lookup, tenant checks) from framework transport details.
3. **Resilience & Concurrency Hardening:** Enforces native optimistic locking for booking mutations, sliding-window rate limiting, input sanitization against XSS/SQLi/Prototype Pollution, cryptographically secure CSRF protection, and zero credential leakage in production logs.

---

## 🏛️ 2. Layered Security Architecture

CineSphere OS enforces a strict 8-tier unidirectional defense pipeline. Every incoming user interaction and network packet traverses these layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. Client Security                                     │
│    - Memory isolation, sanitized DOM text rendering    │
│    - No localStorage for sensitive keys or credentials │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. Edge Security (Next.js Middleware)                   │
│    - Request tracing headers (x-correlation-id)        │
│    - CSRF & Origin validation on mutation methods      │
│    - Edge rate limiting for auth endpoints             │
│    - Enterprise security headers (CSP, HSTS, CORS)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. Application Security (Server Action Guard)          │
│    - Input sanitization (XSS, SQLi, Prototype Pollut.) │
│    - Strict Zod schema validation (zero untrusted data)│
│    - Application rate limiting (Sliding Window buckets)│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. Business Authorization (RBAC)                       │
│    - 5-Tier role hierarchy (Super Admin down to Guest) │
│    - Fine-grained permission matrix evaluation         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 5. Tenant Isolation (Multi-Tenancy Guard)              │
│    - Verification against assigned theatreId           │
│    - Automatic TENANT_VIOLATION event recording        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 6. Database Protection (Drizzle ORM & Neon)            │
│    - 100% Parameterized queries (no raw string SQL)    │
│    - Optimistic locking (version checking)             │
│    - Connection pooling & timeout fail-safes           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 7. Observability & Auditing                            │
│    - Structured JSON logging with Correlation IDs      │
│    - Security events intrusion logging                 │
│    - Tamper-evident business audit trails              │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 8. Performance Optimization & Caching                  │
│    - In-memory query memoization                       │
│    - Tagged cache invalidation                         │
│    - Health probes (/api/health, /live, /ready)        │
└────────────────────────────────────────────────────────┘
```

---

## 🧩 3. Domain Service & Repository Architecture

To eliminate tight coupling between Next.js React Server Actions and the raw database schema, CineSphere OS implements the **Enterprise Domain Service Pattern**:

```
UI (Client Components / Forms / Modals)
             │
             ▼
Server Actions (@/actions/*)
  [Validates transport, invokes Protected Action Guard]
             │
             ▼
Domain Services (@/lib/services/*)
  [Encapsulates cinema business logic, pricing resolution,
   concurrency retry loops, and tenant isolation rules]
             │
             ▼
Repositories (@/lib/repositories/*)
  [Abstracts data persistence, optimistic lock verification,
   and mock datamart fallbacks]
             │
             ▼
Drizzle ORM & PostgreSQL (@/db/schema/*)
  [Type-safe parameterized SQL execution on Neon PostgreSQL]
```

### Architectural Benefits:
- **Framework Independence:** Core business rules (e.g. `updateBookingStatusWithLock`, `resolveActivePaymentConfig`) can be tested in pure Node.js environments without mocking Next.js HTTP contexts.
- **Zero Duplicate Logic:** Both Theatre Admin consoles and public booking APIs invoke the same unified domain services.
- **Testability:** Repositories can be cleanly mocked or substituted without altering business rules.

---

## 🛡️ 4. Server-Side Validation & Input Sanitization

### Never Trust Client Input
All user input is treated as hostile until sanitized and validated on the server.

1. **`sanitizeString(val)`:** Strips null bytes, control characters, and inline script tags.
2. **`stripHtml(html)`:** Completely strips HTML markup for pure text fields.
3. **`sanitizeUrl(url)`:** Blocks `javascript:`, `data:`, `file:`, and CRLF injection. Only permits `http:`, `https:`, `mailto:`, and `tel:`.
4. **`sanitizeEmail(email)`:** Eliminates CRLF headers and normalizes according to RFC 5322.
5. **`sanitizePhone(phone)`:** Strips non-digit and malicious characters.
6. **`sanitizeObject(obj)`:** Recursively traverses complex JSON objects, discarding any keys matching `__proto__`, `prototype`, or `constructor` to prevent **Prototype Pollution**.
7. **`sanitizeHeaderValue(val)`:** Strips `\r` and `\n` to prevent HTTP Response Splitting.

---

## 🔒 5. CSRF & Request Origin Defense

State-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) are guarded at both the edge middleware and server action layers:

- **Origin & Referer Verification:** Rejects requests whose `Origin` or `Referer` does not match the valid application `Host` header.
- **Cryptographic Tokens:** Double-submit CSRF tokens generated via `crypto.getRandomValues(32)` with constant-time `timingSafeEqual` comparison to defeat timing attacks.
- **Cookie Security Attributes:**
  - `SameSite: "lax"` (or `"strict"` for financial operations)
  - `HttpOnly: true` (inaccessible to JavaScript)
  - `Secure: true` in production (enforces HTTPS)

---

## ⏱️ 6. Sliding-Window Rate Limiting Engine

To protect against credential stuffing, brute-force attacks, ticket hoarding, and API scraping, CineSphere OS includes an in-memory sliding-window rate limiter:

| Category | Window Size | Max Requests | Block Duration | Target Endpoints |
| :--- | :---: | :---: | :---: | :--- |
| `LOGIN` | 15 minutes | 5 | 15 minutes | `/login`, auth verification |
| `REGISTRATION` | 1 hour | 3 | 1 hour | `/register` |
| `FORGOT_PASSWORD` | 1 hour | 3 | 1 hour | Password reset triggers |
| `SEARCH` | 1 minute | 60 | — | Film directory, theatre locator |
| `BOOKING_REQUEST` | 1 minute | 15 | — | Seat selection, session start |
| `PAYMENT_REQUEST` | 1 minute | 10 | — | Payment intent derivation |
| `NOTIFICATION_REQUEST` | 1 minute | 30 | — | Push, email dispatch triggers |
| `ADMIN_API` | 1 minute | 120 | — | Multiplex operational APIs |
| `PUBLIC_DEFAULT` | 1 minute | 100 | — | General public traffic |

### Breach Reaction:
When a rate limit is exceeded, the subsystem:
1. Returns HTTP `429 Too Many Requests` with a calculated `Retry-After` header.
2. Emits a `RATE_LIMIT_TRIGGERED` event to the Security Events Logger.
3. Automatically triggers garbage collection of expired timestamps every 5 minutes.

---

## 🌐 7. Enterprise Secure Headers

Configured directly in `next.config.ts` and `auth/middleware/auth-middleware.ts`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

---

## 🏢 8. Absolute Multi-Tenant Isolation

In CineSphere OS, **the Theatre is the atomic tenant**:
- Theatre Admins manage strictly their assigned complex (e.g. `th-pun-001`).
- Attempting to view, modify, or query records from another complex (e.g. `th-mum-001`) immediately throws a typed `TenantAccessError`.
- Every breach attempt generates a `TENANT_VIOLATION` event logged with the actor's ID, assigned complex, target complex, IP address, and correlation ID.
- Super Admins (Level 100) retain circuit-wide governance across all properties.

---

## 🔄 9. Booking Concurrency & Optimistic Locking

To guarantee that two patrons or box office cashiers cannot simultaneously book or modify the same reservation, the database schema implements **Version-Based Optimistic Locking**:

```sql
UPDATE bookings 
SET booking_status = 'CANCELLED', version = version + 1, updated_at = NOW() 
WHERE id = 'bk-202611-001' AND version = 1;
```

### Invariant & Conflict Handling:
- If 0 rows are updated, another process has modified the record in the interim.
- The engine throws a `ConflictError(409)` detailing `currentVersion` vs `expectedVersion`.
- Emits a `BOOKING_CONFLICT` security audit record.
- The `executeWithOptimisticRetry` utility automatically retries safe mutations up to 3 times with exponential backoff and randomized jitter.

---

## 💳 10. Payment Abstraction Maintenance

Booking and checkout logic **never directly touch raw UPI VPAs, merchant IDs, or secret keys**:

```
Platform
   ↓
Theatre (Multi-Tenant Host)
   ↓
Payment Configuration (1:N)
   ├── UPI (Instant Settlement)
   ├── Razorpay (Multi-Rail Aggregator)
   ├── PhonePe (Direct Gateway)
   ├── Paytm (Wallet / PG)
   └── Stripe (International Tourist FX)
   ↓
Booking (Resolves Theatre's Active Config)
   ↓
Payment Transaction (Ledger)
```

### Abstraction Enforcement:
- The Booking Engine invokes `paymentDomainService.resolveActivePaymentConfig(theatreId, { amount, bookingRef })`.
- The domain service queries `TheatreRepository`, resolves the cinema's active rail, sanitizes secret credentials, and dynamically synthesizes the NPCI UPI Intent URI or public gateway Key ID.
- Adding future payment providers requires zero modifications to booking business logic.

---

## 📝 11. Structured Logging & Observability

All operational, security, and financial events are formatted as single-line JSON structured logs:

```json
{
  "logId": "log-1731189421000-abc1234",
  "requestId": "req-1731189421000",
  "correlationId": "corr-1731189421000-xyz",
  "traceId": "trace-1731189421000-xyz",
  "userId": "usr-th-admin-01",
  "userRole": "THEATRE_ADMIN",
  "theatreId": "th-pun-001",
  "severity": "INFO",
  "category": "BOOKING",
  "module": "BookingDomainService",
  "message": "Booking 'bk-202611-001' updated to 'COMPLETED' (v2)",
  "timestamp": "2026-11-10T03:15:21.000Z",
  "durationMs": 14,
  "metadata": {
    "bookingId": "bk-202611-001",
    "password": "[REDACTED]",
    "token": "[REDACTED]"
  }
}
```

### Automatic Redaction:
Fields matching `password`, `token`, `secret`, `authorization`, `accountNumber`, or `encrypted` are automatically scrubbed and replaced with `[REDACTED]`.

---

## 🚨 12. Security Events & Threat Monitoring

CineSphere OS tracks 10 distinct security incident types:

1. `FAILED_LOGIN` — Authentication failure on login portal.
2. `MULTIPLE_LOGIN_ATTEMPTS` — Sustained password guessing.
3. `PERMISSION_VIOLATION` — Attempt to perform action exceeding user role.
4. `TENANT_VIOLATION` — Attempted cross-theatre data access.
5. `RATE_LIMIT_TRIGGERED` — Request volume exceeding bucket threshold.
6. `BOOKING_CONFLICT` — Optimistic locking version collision.
7. `PAYMENT_FAILURE` — Transaction amount mismatch or gateway error.
8. `CONFIGURATION_CHANGE` — Modification of payment rails or tax slabs.
9. `SUSPICIOUS_PAYLOAD` — Blocked XSS or prototype pollution attempt.
10. `CSRF_VIOLATION` — Origin or referer header mismatch.

Supervisors can review and resolve incidents via `fetchSecurityEventsAction` and `resolveSecurityEvent`.

---

## 🩺 13. System Health & Monitoring Probes

Standard HTTP health check probes designed for container orchestrators and edge load balancers:

- **`/api/health/live` (Liveness Probe):** Lightweight check returning HTTP `200 { "status": "alive" }`.
- **`/api/health/ready` (Readiness Probe):** Verifies PostgreSQL connectivity and returns HTTP `200 { "status": "ready" }` (or `503 Service Unavailable`).
- **`/api/health` (Deep Diagnostic):** Comprehensive health report detailing:
  - Database ping latency (ms)
  - Memory heap usage (MB used vs total)
  - Active rate limit keys
  - Application uptime in seconds

---

## 🛠️ 14. Developer Security Guidelines

When adding new server actions, API routes, or database entities:

1. **Always Use `createProtectedAction`:** Wrap server actions with `createProtectedAction` to inherit automatic input sanitization, Zod validation, rate limiting, RBAC, tenant isolation, and error redaction.
2. **Never Query Raw Database Tables from Actions:** Call domain services (`@/lib/services/*`) or repositories (`@/lib/repositories/*`).
3. **Never Log Sensitive Information:** Do not log passwords, full credit card numbers, secret keys, or unmasked bank accounts.
4. **Never Expose Internal Errors to Patrons:** Throw typed exceptions from `AppError` (`ValidationError`, `ConflictError`, `TenantAccessError`); they will be cleanly formatted with technical details redacted in production.
5. **Always Pass `theatreId` in Multi-Tenant Actions:** The security guard verifies ownership against the authenticated actor's assigned cinema complex.

