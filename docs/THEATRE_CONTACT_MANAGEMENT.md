# 📞 Phase 3 – Part 6: Theatre Contact Management

## 1. Architectural Overview

Phase 3 Part 6 establishes the enterprise-grade **Theatre Contact Management** subsystem for CineSphere OS. As a multi-tenant cinema SaaS platform, theatres require multi-channel, role-differentiated communication lines for customer inquiries, box office bookings, escalations, 24/7 fire and medical emergency command desks, and public social presence.

The architecture decouples communication channels into a unified **Theatre Contact Directory**, allowing contact methods to evolve flexibly without database schema modifications while maintaining strict multi-tenant boundary isolation, single-primary channel governance, optimistic concurrency control, and tamper-evident audit history.

```
Platform
    │
    ▼
Theatre (Tenant Isolation Boundary)
    │
    ▼
Theatre Contact Directory
    │
    ├── Customer Support (Voice / Email / WhatsApp)
    ├── Box Office & Reservations (Ticketing / Inquiries)
    ├── 24/7 Emergency Response Desk (Fire / Evacuation / Incident Command)
    ├── Duty Operations Manager (Escalation Tier / Night Shift)
    ├── Corporate & B2B Inquiries (Group Bookings / Advertising)
    ├── Official Web Portal (Sanitized & Encrypted Domain)
    └── Social Media Presence (Instagram / Facebook / X / YouTube / Threads / Custom)
```

---

## 2. Core Architectural Capabilities

### 2.1 Capability 1: Multi-Channel Communication Directory
Supports 10 structured channel types defined via `ContactChannelType`:
- `PHONE`: Voice lines, helplines, direct desk numbers, and toll-free lines.
- `EMAIL`: Departmental inboxes (Customer Support, Management, Box Office, VIP Concierge).
- `WEBSITE`: Verified official web portal.
- `SOCIAL_LINK`: Verified social profiles (Instagram, Facebook, X, YouTube, LinkedIn, Threads, Custom).
- `EMERGENCY`: Dedicated 24/7 emergency response desks and fire safety command lines.
- `MANAGER`: Duty and general managers with escalation tier ratings.
- `WHATSAPP`: Official messaging lines with instant patron chat capabilities.
- `TELEGRAM`, `LIVE_CHAT`, `CALL_CENTER`: Extended omnichannel integrations.

### 2.2 Capability 2: Contact Availability Modes
Rather than a naive binary boolean, contacts communicate operational readiness via `ContactAvailabilityMode`:
1. `STANDARD_BUSINESS_HOURS`: Regular operational shifts (e.g., 09:00 AM - 10:00 PM).
2. `TWENTY_FOUR_SEVEN`: 24/7 nonstop priority lines (emergency desks, security control).
3. `EMERGENCY_ONLY`: Dedicated strictly to safety, fire marshal, or medical emergencies.
4. `SHOWTIME_ONLY`: Active during active auditorium screenings and night show cut-offs.
5. `TEMPORARILY_INACTIVE`: Suspended line under maintenance or shift transition.

### 2.3 Capability 3: Verification Status & Trusted Badges
Verification lifecycle managed via `ContactVerificationStatus`:
- `UNVERIFIED`: Newly entered channel awaiting authentication.
- `PENDING_VERIFICATION`: In review by Super Admin or platform security.
- `VERIFIED`: Authenticated line displaying trusted verification checkmarks to patrons.
- `REJECTED`: Invalid or fraudulent contact submission.

### 2.4 Capability 4: Reusable Generic Entity Mapping
Contacts feature generic entity mapping attributes:
- `entityType`: `THEATRE`, `CHAIN`, `CORPORATE`, `VENDOR`, `SUPPORT_CENTER`.
- `entityId`: Enables attaching contacts to auditorium booths, concession bars, or regional chain hubs in future phases without schema migration.

### 2.5 Capability 5: Phone Governance & Single-Primary Rule
- Validates E.164 and country code formatting (`+91`, `+1`, `+44`, etc.).
- Categorizes phone types: `MOBILE`, `LANDLINE`, `DIRECT_DESK`, `TOLL_FREE`.
- Flags WhatsApp and SMS support capabilities.
- **Single-Primary Enforcement**: Marking a phone as primary automatically clears previous primary flags for that channel type within the theatre tenant.

### 2.6 Capability 6: Email Inbox Governance & Single-Primary Rule
- Strict email syntax validation and departmental tagging (`Customer Support`, `Management`, `Accounts`).
- Single-primary enforcement prevents split primary email destinations.

### 2.7 Capability 7: Safe URL Sanitization & Social Media Presence
- Stored XSS defense: strictly rejects `javascript:`, `data:`, and `vbscript:` URI schemes.
- Handles official multiplex website URLs and verified social media handles (`@cinesphere_official`).
- Supports standard platforms (`INSTAGRAM`, `FACEBOOK`, `X_TWITTER`, `YOUTUBE`, `LINKEDIN`, `THREADS`) and `CUSTOM` community platforms (e.g., Letterboxd, Discord).

### 2.8 Capability 8: 24/7 Emergency Contact Desk & Incident Command
- Dedicated records for incident commanders, fire safety marshals, and trauma teams.
- Stores primary phone, alternate phone, dispatch availability, emergency type, and operational muster procedures.

### 2.9 Capability 9: Duty / Operations Manager Escalation Tiers
- Tracks designated duty managers, direct phone, email, shift hours, and escalation tiers (Tier 1, Tier 2, Tier 3) for operational conflict resolution.

### 2.10 Capability 10: Multi-Tenant Boundary Isolation & Version Ledger
- Enforces strict tenant separation via `tenantService.assertTenantAccess`.
- Prevents cross-tenant reads, mutations, and reordering.
- Employs Optimistic Concurrency Control (`expectedVersion`) throwing `ConflictError` on stale updates.
- Records every modification in an immutable version ledger (`theatreContactVersions`).

---

## 3. Relational Schema & Storage Engine

The contact directory architecture is defined across eight PostgreSQL tables in [theatre-contact.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-contact.ts):

1. **`theatre_contacts`**: Core directory directory record containing title, description, `channelType`, `contactRole`, `isPrimary`, `visibility`, `availabilityMode`, `businessHours`, `verificationStatus`, `status`, `displayOrder`, `version`.
2. **`theatre_phones`**: Phone details (`countryCode`, `phoneNumber`, `extension`, `phoneType`, `isSmsEnabled`, `isWhatsappEnabled`, `isVerified`).
3. **`theatre_emails`**: Email inboxes (`email`, `emailType`, `department`, `isPrimary`, `isVerified`).
4. **`theatre_websites`**: Official web portal (`url`, `websiteType`, `title`, `isPrimary`, `isVerified`).
5. **`theatre_contact_social_links`**: Social media profiles (`platform`, `customPlatform`, `url`, `handle`, `displayOrder`, `status`).
6. **`theatre_emergency_contacts`**: Emergency response desk (`contactPersonName`, `roleOrDesignation`, `primaryPhone`, `alternatePhone`, `availabilityHours`, `emergencyType`, `operatingProcedures`).
7. **`theatre_manager_contacts`**: Duty managers (`managerName`, `designation`, `phone`, `email`, `department`, `shiftHours`, `escalationTier`).
8. **`theatre_contact_versions`**: Immutable audit version ledger (`contactId`, `theatreId`, `versionNumber`, `changeType`, `changeSummary`, `snapshot`, `changedBy`, `changedRole`).

---

## 4. UI Architecture & Portals

### 4.1 Theatre Admin Portal (`/theatre/contacts`)
- **KPI Summary Cards**: Total Channels, Active Lines, Verified Badges, 24/7 Response Desks.
- **Filter Tabs**: `ALL`, `PHONE`, `EMAIL`, `WEBSITE`, `SOCIAL_LINK`, `EMERGENCY`, `MANAGER`.
- **Search & Filters**: Search by title, phone, email, contact person, role, and availability mode.
- **Channel Operations**: Add Phone, Add Email, Emergency Desk, Duty Manager, Configure Web & Socials.
- **Sequential Reordering**: Move Up / Move Down buttons persisting contiguous order.
- **Rich Cards**: Badges for channel type, role, availability mode, verification status, and primary flag with copy-to-clipboard and direct call (`tel:`) / email (`mailto:`) actions.

### 4.2 Super Admin Portal (`/dashboard/theatres/[id]`)
- Integrated under the dedicated **"Contact Directory"** tab (`activeTab === "contacts"`).
- Enables platform administrators to review, verify badges, audit emergency lines, and manage contacts with Super Admin privileges.

### 4.3 Public Patron Discovery (`/theatre/[slug]`)
- **Section 9 ("Official Contact Directory & Response Desks")**:
  - Displays primary voice helpline with one-click `tel:` calling.
  - Displays verified guest support email with `mailto:` action.
  - Displays official website with security checkmarks.
  - Displays 24/7 emergency priority line with incident commander details.
  - Displays duty manager escalation desk.
  - Displays official social media presence chips with external links.

---

## 5. Automated Verification Suite

Run automated verification:
```powershell
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-theatre-contact.ts
```

| Suite | Description | Status |
| :--- | :--- | :---: |
| **Test 1** | Multi-Channel Directory Architecture & Initial State | ✅ PASSED |
| **Test 2** | Role-Based Contact Categorization & Channel Validation | ✅ PASSED |
| **Test 3** | Phone & Country Code Validation & Primary Voice Governance | ✅ PASSED |
| **Test 4** | Email Address Validation & Primary Support Email Governance | ✅ PASSED |
| **Test 5** | Safe URL Sanitization, Website Governance & Social Links | ✅ PASSED |
| **Test 6** | 24/7 Emergency Contact Desk & Incident Procedures | ✅ PASSED |
| **Test 7** | Duty / General Manager Escalation Tier & Contact Directory | ✅ PASSED |
| **Test 8** | Availability Modes, Verification Badges & Search/Filter Queries | ✅ PASSED |
| **Test 9** | Multi-Tenant Boundary Isolation & Pre-Pagination Security | ✅ PASSED |
| **Test 10** | Optimistic Concurrency Control, Reordering & Immutable Version Ledger | ✅ PASSED |
