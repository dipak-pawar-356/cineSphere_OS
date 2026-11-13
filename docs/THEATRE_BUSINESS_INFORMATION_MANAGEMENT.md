# 🏢 Phase 3 – Part 7: Theatre Business Information Management

## 1. Architectural Overview

Phase 3 Part 7 establishes the enterprise **Theatre Business Information Management** subsystem for CineSphere OS. As an enterprise multi-tenant cinema SaaS platform, theatres operate as corporate entities with distinct statutory, tax, invoicing, and legal obligations. 

The architecture decouples financial identity, statutory registrations, country-aware tax rules, consumer billing sequencing, Super Admin compliance verification, and document archives into a structured, relational domain model:

```
Platform
    │
    ▼
Theatre (Tenant Isolation Boundary)
    │
    ▼
Theatre Business Profile
    │
    ├── Legal Information (Entity Name, Category, Corporate Description, Industry)
    ├── Registration Credentials (GSTIN [15 chars], PAN [10 chars], CIN/LLPIN [21 chars], ROC Authority)
    ├── Ownership & Governance (Principal Owner, Structure, Managing Director, Authorized Signatory)
    ├── Country-Aware Tax Configuration (GST, VAT, Sales Tax, % Rate, Inclusive/Exclusive Model)
    ├── Invoice & Billing Configuration (Prefix, Next Sequence, Header, Legal Footer, E-Invoice IRN, PDF)
    ├── Compliance Verification Workflow (DRAFT, PENDING_VERIFICATION, VERIFIED, REJECTED, ARCHIVED)
    ├── Decoupled Document Attachment Vault (Incorporation, GST, PAN, Fire NOC, Municipal Licenses)
    └── Immutable Audit Version Ledger (Cryptographic Snapshots, Concurrency Control)
```

This clean Domain-Driven Design (DDD) model ensures CineSphere OS can operate across India (GST), Europe/UK (VAT), North America (Sales Tax), and custom regional jurisdictions without requiring schema changes or breaking tenant isolation.

---

## 2. Core Architectural Capabilities

### 2.1 Capability 1: Legal Identity & Corporate Categorization
Captures comprehensive corporate entity data:
- `legalBusinessName`: Official registered legal name (e.g., `CineSphere Entertainment Private Limited`).
- `registeredEntityName`: Trade or commercial DBA name.
- `businessCategory`: Enumerated classification covering `PRIVATE_LIMITED`, `LLP`, `MULTIPLEX`, `SINGLE_SCREEN`, `ENTERTAINMENT_COMPANY`, `CINEMA_CHAIN`, `PARTNERSHIP`, `PROPRIETORSHIP`, `TRUST`, `GOVERNMENT`, and `CUSTOM`.
- `businessType`: Operational domain (`CINEMA_EXHIBITION`, `ENTERTAINMENT_COMPLEX`, etc.).
- `industry`: Standardized sector tagging (`Media & Entertainment / Cinema Exhibition`).

### 2.2 Capability 2: Statutory Registration Credentials (GSTIN, PAN, CIN)
- **Indian GSTIN**: Validates standard 15-character statutory alphanumeric regex:
  `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- **Permanent Account Number (PAN)**: Validates standard 10-character alphanumeric regex:
  `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
- **Corporate Identification Number (CIN)**: Validates 21-character MCA alphanumeric regex:
  `^([LUu])[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$`
- Normalizes all registration identifiers to uppercase upon ingestion.
- Tracks `registrationAuthority` (e.g., ROC Pune & MCA) and `registrationDate`.

### 2.3 Capability 3: Ownership Structure & Corporate Governance
- Supports ownership classification via `businessOwnershipTypeEnum`:
  `DIRECT_OWNERSHIP`, `LEASE_OPERATED`, `FRANCHISE`, `JOINT_VENTURE`, `MANAGEMENT_CONTRACT`.
- Tracks key corporate personnel: Principal Owner/Promoter, Managing Director / CEO, and Authorized Legal Signatory.
- Securely stores dedicated corporate legal contacts (`businessContactPhone`, `businessEmail`).

### 2.4 Capability 4: Country-Aware Tax Configuration
Configured to support domestic and international admission tax regimes without schema changes:
- `taxSystemType`: `GST` (India/Australia/Singapore), `VAT` (UK/EU/UAE), `SALES_TAX` (US), `CUSTOM`.
- `taxJurisdictionCountry`: ISO 3166-1 alpha-3 code (`IND`, `USA`, `GBR`, etc.).
- `taxPercentage`: Exact statutory percentage rate (e.g., `18.00%`).
- `pricingTaxModel`:
  - `TAX_INCLUSIVE`: The patron pays the face value shown on screen (tax calculated backwards).
  - `TAX_EXCLUSIVE`: Tax is computed and added on top of the base ticket rate at checkout.
- `isTaxExempt` & `exemptionReason`: Legal exemption tracking for cultural festivals or municipal waivers.
- `regionalTaxCode`: State/provincial tax code (e.g., `MH-27`).

### 2.5 Capability 5: Billing & Invoice Sequencing Governance
Configures ticket receipt and tax invoice generation parameters:
- `invoicePrefix`: 2-10 alphanumeric characters (e.g., `CSP-PUN-`).
- `invoiceSequenceNext`: Monotonically incrementing serial counter (e.g., `10452`).
- `invoiceHeader`: Statutory header (e.g., `Tax Invoice / Entertainment Receipt`).
- `invoiceFooter`: Statutory legal disclosure and municipal compliance notice.
- Feature flags: `enableEInvoice` (IRN schema), `enablePdfInvoice` (PDF download), `enableCreditNotes`.

### 2.6 Capability 6: Decoupled Document Attachment Vault
Decouples binary file references into `theatre_business_documents`:
- Document types: `CIN_INCORPORATION`, `GST_CERTIFICATE`, `PAN_CARD`, `FIRE_SAFETY_NOC`, `MUNICIPAL_TRADE_LICENSE`, `ENTERTAINMENT_TAX_PERMIT`, `AUTHORIZATION_LETTER`, `BOARD_RESOLUTION`, `OTHER`.
- Stores `fileUrl`, `fileSize`, `mimeType`, `documentNumber`, and `expiryDate`.
- Independent verification status per document (`PENDING`, `VERIFIED`, `REJECTED`).

### 2.7 Capability 7: Super Admin Compliance Verification Workflow
- Controlled status machine: `DRAFT` ➔ `PENDING_VERIFICATION` ➔ `VERIFIED` / `REJECTED` / `ARCHIVED`.
- **Strict Authorization Rule**: Only users holding the `SUPER_ADMIN` platform role can verify or reject business compliance profiles. Attempts by Theatre Admins are rejected with `AuthorizationError`.
- Automatic cross-verification: Upon verification, GST and PAN status flags are confirmed in registration records.

### 2.8 Capability 8: Multi-Tenant Boundary Isolation
- Cross-tenant boundaries are strictly enforced via `tenantService.assertTenantAccess`.
- Prevents cross-tenant access between theatres (e.g., Pune Admin cannot read or modify Mumbai business profiles).

### 2.9 Capability 9: Optimistic Concurrency Control & Immutable Audit Ledger
- Records maintain a `version` counter. Modifications specifying `expectedVersion` guarantee no lost updates.
- All lifecycle mutations generate immutable snapshots in `theatre_business_versions` with change types (`CREATED`, `PROFILE_UPDATED`, `TAX_CONFIG_UPDATED`, `INVOICE_CONFIG_UPDATED`, `COMPLIANCE_STATUS_CHANGED`, `DOCUMENT_ATTACHED`, `DOCUMENT_REMOVED`, `ARCHIVED`).

---

## 3. Database Schema Specification

| Table Name | Description | Key Indexes |
| :--- | :--- | :--- |
| `theatre_business_profiles` | Primary business identity | Unique(`theatre_id`), Index(`legal_business_name`), Index(`status`) |
| `theatre_business_registrations` | GST, PAN, CIN & trade registration | Unique(`business_profile_id`), Index(`gst_number`), Index(`pan_number`) |
| `theatre_business_owners` | Principal owner, MD & signatory details | Unique(`business_profile_id`), Index(`theatre_id`) |
| `theatre_tax_configurations` | Country-aware tax & pricing rules | Unique(`business_profile_id`), Index(`tax_status`) |
| `theatre_invoice_configurations` | Invoicing prefix, counter & footers | Unique(`business_profile_id`), Index(`theatre_id`) |
| `theatre_business_compliances` | Super Admin audit & compliance status | Unique(`business_profile_id`), Index(`verification_status`) |
| `theatre_business_documents` | Decoupled compliance document vault | Index(`business_profile_id`), Index(`theatre_id`), Index(`document_type`) |
| `theatre_business_versions` | Immutable audit snapshot ledger | Index(`business_profile_id`), Index(`theatre_id`) |

---

## 4. Protected Server Actions

All mutations are protected with `createProtectedAction`:
- `getTheatreBusinessProfileAction`
- `getTheatreBusinessBundleAction`
- `createTheatreBusinessProfileAction`
- `updateTheatreBusinessProfileAction`
- `updateTheatreTaxConfigurationAction`
- `updateTheatreInvoiceConfigurationAction`
- `verifyTheatreBusinessProfileAction` (Super Admin restricted)
- `archiveTheatreBusinessProfileAction`
- `addTheatreBusinessDocumentAction`
- `deleteTheatreBusinessDocumentAction`

---

## 5. Automated Verification Results

A dedicated verification suite (`scripts/verify-theatre-business.ts`) validates all 10 core architectural capabilities:
- **Test 1**: Business Profile Creation & Legal Identity
- **Test 2**: Registration Data (GST, PAN, CIN) Format & Validation
- **Test 3**: Ownership Structure & Signatory Information
- **Test 4**: Country-Aware Tax Configuration (GST / VAT / Sales Tax)
- **Test 5**: Invoice Sequence, Prefix & Layout Governance
- **Test 6**: Decoupled Document Attachment Vault
- **Test 7**: Super Admin Compliance Verification Workflow & Strict Authorization
- **Test 8**: Multi-Faceted Search, Category Filtering & Scoped Queries
- **Test 9**: Multi-Tenant Boundary Isolation & Security Assertions
- **Test 10**: Optimistic Concurrency Control & Immutable Version Ledger
