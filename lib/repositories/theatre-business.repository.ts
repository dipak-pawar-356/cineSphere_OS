import { BaseRepository } from "./base.repository";
import { paginateArray, type PaginatedResult } from "@/lib/performance/cache-strategy";
import type {
  TheatreBusinessProfileRecord,
  TheatreBusinessRegistrationRecord,
  TheatreBusinessOwnerRecord,
  TheatreTaxConfigurationRecord,
  TheatreInvoiceConfigurationRecord,
  TheatreBusinessComplianceRecord,
  TheatreBusinessDocumentRecord,
  TheatreBusinessVersionRecord,
  TheatreBusinessBundle,
  TheatreBusinessProfileWithDetails,
  CreateTheatreBusinessProfileInput,
  UpdateTheatreBusinessProfileInput,
  UpdateTheatreTaxConfigurationInput,
  UpdateTheatreInvoiceConfigurationInput,
  SearchTheatreBusinessFilters,
  BusinessComplianceStatus,
  TaxSystemType,
  BusinessCategory,
} from "@/types/theatre-business.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Repository (Phase 3 – Part 7)
 * ==============================================================================
 * Multi-tenant enterprise legal identity, corporate registration credentials,
 * country-aware tax configuration, invoice sequence/layout governance,
 * compliance verification workflows, document attachments, and immutable audit versions.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Initial Seed Data: Business Profile for Pune Flagship (th-pun-001)
// ------------------------------------------------------------------------------
const SEED_PUN_PROFILE: TheatreBusinessProfileRecord = {
  id: "biz-pun-001",
  theatreId: "th-pun-001",
  legalBusinessName: "CineSphere Entertainment Private Limited",
  registeredEntityName: "CineSphere Entertainment Pvt Ltd",
  businessCategory: "PRIVATE_LIMITED",
  customCategory: null,
  businessType: "CINEMA_EXHIBITION",
  businessDescription:
    "Premier cinema exhibition and multiplex entertainment management entity operating CineSphere flagship theatres.",
  industry: "Media & Entertainment / Cinema Exhibition",
  status: "VERIFIED",
  version: 1,
  createdBy: "usr-super-1",
  updatedBy: "usr-th-pun",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_REGISTRATION: TheatreBusinessRegistrationRecord = {
  id: "reg-pun-001",
  businessProfileId: "biz-pun-001",
  theatreId: "th-pun-001",
  gstNumber: "27AABCU9603R1ZM",
  panNumber: "AABCU9603R",
  cinNumber: "U92100MH2021PTC358912",
  businessRegistrationNumber: "MH-PUN-CIN-2021-9981",
  registrationDate: "2021-04-15",
  registrationAuthority: "Registrar of Companies, Pune & Maharashtra MCA",
  certificateUrl: "/docs/registrations/cinesphere-mca-incorporation.pdf",
  isGstVerified: true,
  isPanVerified: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_OWNER: TheatreBusinessOwnerRecord = {
  id: "own-pun-001",
  businessProfileId: "biz-pun-001",
  theatreId: "th-pun-001",
  ownerName: "Vikramaditya Singhania",
  ownershipType: "DIRECT_OWNERSHIP",
  businessContactPhone: "+91 98220 12345",
  businessEmail: "corporate.legal@cinesphere.com",
  managingDirector: "Vikramaditya Singhania",
  authorizedSignatory: "Rajesh Kulkarni (VP Legal & Compliance)",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_TAX_CONFIG: TheatreTaxConfigurationRecord = {
  id: "tax-pun-001",
  businessProfileId: "biz-pun-001",
  theatreId: "th-pun-001",
  taxSystemType: "GST",
  taxJurisdictionCountry: "IND",
  taxPercentage: "18.00",
  pricingTaxModel: "TAX_INCLUSIVE",
  isTaxExempt: false,
  exemptionReason: null,
  regionalTaxCode: "MH-27",
  internationalTaxNumber: null,
  taxStatus: "ACTIVE",
  notes: "Standard Indian GST applied on exhibition services (18% inclusive).",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_INVOICE_CONFIG: TheatreInvoiceConfigurationRecord = {
  id: "inv-pun-001",
  businessProfileId: "biz-pun-001",
  theatreId: "th-pun-001",
  invoicePrefix: "CSP-PUN-",
  invoiceSequenceNext: 10452,
  invoiceHeader: "Tax Invoice / Entertainment Receipt",
  invoiceFooter:
    "Thank you for choosing CineSphere Multiplex. Computer generated invoice under Rule 54 of CGST Rules.",
  invoiceNotes: "Subject to Pune Jurisdiction. GSTIN: 27AABCU9603R1ZM.",
  invoiceLogoUrl: "/brand/cinesphere-invoice-logo.svg",
  enableEInvoice: true,
  enablePdfInvoice: true,
  enableCreditNotes: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_COMPLIANCE: TheatreBusinessComplianceRecord = {
  id: "cmp-pun-001",
  businessProfileId: "biz-pun-001",
  theatreId: "th-pun-001",
  verificationStatus: "VERIFIED",
  verifiedBy: "usr-super-1",
  verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  verificationRemarks:
    "Verified against official ROC corporate registry and GST portal. All documentation verified by CineSphere Legal Dept.",
  riskScore: "LOW",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_DOCUMENTS: TheatreBusinessDocumentRecord[] = [
  {
    id: "doc-pun-001",
    businessProfileId: "biz-pun-001",
    theatreId: "th-pun-001",
    documentType: "CIN_INCORPORATION",
    documentTitle: "MCA Certificate of Incorporation",
    documentNumber: "U92100MH2021PTC358912",
    fileUrl: "/docs/registrations/cinesphere-mca-incorporation.pdf",
    fileSize: 2458000,
    mimeType: "application/pdf",
    verificationStatus: "VERIFIED",
    expiryDate: null,
    displayOrder: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "doc-pun-002",
    businessProfileId: "biz-pun-001",
    theatreId: "th-pun-001",
    documentType: "GST_CERTIFICATE",
    documentTitle: "GST Registration Certificate (Form REG-06)",
    documentNumber: "27AABCU9603R1ZM",
    fileUrl: "/docs/registrations/gst-certificate-27AABCU9603R1ZM.pdf",
    fileSize: 1850000,
    mimeType: "application/pdf",
    verificationStatus: "VERIFIED",
    expiryDate: null,
    displayOrder: 2,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "doc-pun-003",
    businessProfileId: "biz-pun-001",
    theatreId: "th-pun-001",
    documentType: "PAN_CARD",
    documentTitle: "Permanent Account Number Card",
    documentNumber: "AABCU9603R",
    fileUrl: "/docs/registrations/pan-card-AABCU9603R.pdf",
    fileSize: 950000,
    mimeType: "application/pdf",
    verificationStatus: "VERIFIED",
    expiryDate: null,
    displayOrder: 3,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "doc-pun-004",
    businessProfileId: "biz-pun-001",
    theatreId: "th-pun-001",
    documentType: "FIRE_SAFETY_NOC",
    documentTitle: "Pune Municipal Corporation Fire NOC",
    documentNumber: "PMC/FIRE/NOC/2026/884",
    fileUrl: "/docs/registrations/pmc-fire-noc-2026.pdf",
    fileSize: 3120000,
    mimeType: "application/pdf",
    verificationStatus: "VERIFIED",
    expiryDate: "2027-12-31",
    displayOrder: 4,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

// Seed for Mumbai Palladium (th-mum-001) for multi-tenant boundary checks
const SEED_MUM_PROFILE: TheatreBusinessProfileRecord = {
  id: "biz-mum-001",
  theatreId: "th-mum-001",
  legalBusinessName: "Palladium Screenworks LLP",
  registeredEntityName: "Palladium Screenworks Limited Liability Partnership",
  businessCategory: "LLP",
  customCategory: null,
  businessType: "CINEMA_EXHIBITION",
  businessDescription: "Luxury cinema exhibition operations at Palladium Mall, Lower Parel.",
  industry: "Media & Entertainment / Cinema Exhibition",
  status: "VERIFIED",
  version: 1,
  createdBy: "usr-super-1",
  updatedBy: "usr-th-mum",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_REGISTRATION: TheatreBusinessRegistrationRecord = {
  id: "reg-mum-001",
  businessProfileId: "biz-mum-001",
  theatreId: "th-mum-001",
  gstNumber: "27AAECP1122Q1ZB",
  panNumber: "AAECP1122Q",
  cinNumber: "AAB-4567",
  businessRegistrationNumber: "MH-MUM-LLP-2022-4412",
  registrationDate: "2022-02-10",
  registrationAuthority: "Registrar of Companies, Mumbai MCA",
  certificateUrl: "/docs/registrations/palladium-llp.pdf",
  isGstVerified: true,
  isPanVerified: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_OWNER: TheatreBusinessOwnerRecord = {
  id: "own-mum-001",
  businessProfileId: "biz-mum-001",
  theatreId: "th-mum-001",
  ownerName: "Devendra Mehta",
  ownershipType: "DIRECT_OWNERSHIP",
  businessContactPhone: "+91 98200 98765",
  businessEmail: "legal@palladiumscreens.com",
  managingDirector: "Devendra Mehta",
  authorizedSignatory: "Devendra Mehta",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_TAX_CONFIG: TheatreTaxConfigurationRecord = {
  id: "tax-mum-001",
  businessProfileId: "biz-mum-001",
  theatreId: "th-mum-001",
  taxSystemType: "GST",
  taxJurisdictionCountry: "IND",
  taxPercentage: "18.00",
  pricingTaxModel: "TAX_INCLUSIVE",
  isTaxExempt: false,
  exemptionReason: null,
  regionalTaxCode: "MH-27",
  internationalTaxNumber: null,
  taxStatus: "ACTIVE",
  notes: "Standard GST 18%",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_INVOICE_CONFIG: TheatreInvoiceConfigurationRecord = {
  id: "inv-mum-001",
  businessProfileId: "biz-mum-001",
  theatreId: "th-mum-001",
  invoicePrefix: "CSP-MUM-",
  invoiceSequenceNext: 20114,
  invoiceHeader: "Tax Invoice / Entertainment Receipt",
  invoiceFooter: "Subject to Mumbai Jurisdiction.",
  invoiceNotes: null,
  invoiceLogoUrl: null,
  enableEInvoice: false,
  enablePdfInvoice: true,
  enableCreditNotes: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_COMPLIANCE: TheatreBusinessComplianceRecord = {
  id: "cmp-mum-001",
  businessProfileId: "biz-mum-001",
  theatreId: "th-mum-001",
  verificationStatus: "VERIFIED",
  verifiedBy: "usr-super-1",
  verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  verificationRemarks: "Verified entity.",
  riskScore: "LOW",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// ------------------------------------------------------------------------------
// Theatre Business Repository Class
// ------------------------------------------------------------------------------

export class TheatreBusinessRepository extends BaseRepository<TheatreBusinessProfileRecord> {
  protected entityName = "TheatreBusinessProfile";
  protected tableName = "theatre_business_profiles";

  private profilesStore: Map<string, TheatreBusinessProfileRecord> = new Map();
  private registrationsStore: Map<string, TheatreBusinessRegistrationRecord> = new Map();
  private ownersStore: Map<string, TheatreBusinessOwnerRecord> = new Map();
  private taxConfigsStore: Map<string, TheatreTaxConfigurationRecord> = new Map();
  private invoiceConfigsStore: Map<string, TheatreInvoiceConfigurationRecord> = new Map();
  private compliancesStore: Map<string, TheatreBusinessComplianceRecord> = new Map();
  private documentsStore: Map<string, TheatreBusinessDocumentRecord> = new Map();
  private versionsStore: TheatreBusinessVersionRecord[] = [];

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    // Seed Pune Flagship
    this.profilesStore.set(SEED_PUN_PROFILE.id, { ...SEED_PUN_PROFILE });
    this.registrationsStore.set(SEED_PUN_REGISTRATION.businessProfileId, { ...SEED_PUN_REGISTRATION });
    this.ownersStore.set(SEED_PUN_OWNER.businessProfileId, { ...SEED_PUN_OWNER });
    this.taxConfigsStore.set(SEED_PUN_TAX_CONFIG.businessProfileId, { ...SEED_PUN_TAX_CONFIG });
    this.invoiceConfigsStore.set(SEED_PUN_INVOICE_CONFIG.businessProfileId, { ...SEED_PUN_INVOICE_CONFIG });
    this.compliancesStore.set(SEED_PUN_COMPLIANCE.businessProfileId, { ...SEED_PUN_COMPLIANCE });
    SEED_PUN_DOCUMENTS.forEach((doc) => this.documentsStore.set(doc.id, { ...doc }));

    // Seed Initial Version Snapshot
    this.versionsStore.push({
      id: "ver-pun-001",
      businessProfileId: SEED_PUN_PROFILE.id,
      theatreId: SEED_PUN_PROFILE.theatreId,
      versionNumber: 1,
      changeType: "INITIAL_PROVISIONING",
      changeSummary: "Seed provisioning of corporate legal profile, tax configuration, and compliance credentials.",
      snapshot: {
        profile: { ...SEED_PUN_PROFILE },
        registration: { ...SEED_PUN_REGISTRATION },
        owner: { ...SEED_PUN_OWNER },
        taxConfiguration: { ...SEED_PUN_TAX_CONFIG },
        invoiceConfiguration: { ...SEED_PUN_INVOICE_CONFIG },
        compliance: { ...SEED_PUN_COMPLIANCE },
      },
      changedBy: "usr-super-1",
      changedRole: "SUPER_ADMIN",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    // Seed Mumbai Palladium
    this.profilesStore.set(SEED_MUM_PROFILE.id, { ...SEED_MUM_PROFILE });
    this.registrationsStore.set(SEED_MUM_REGISTRATION.businessProfileId, { ...SEED_MUM_REGISTRATION });
    this.ownersStore.set(SEED_MUM_OWNER.businessProfileId, { ...SEED_MUM_OWNER });
    this.taxConfigsStore.set(SEED_MUM_TAX_CONFIG.businessProfileId, { ...SEED_MUM_TAX_CONFIG });
    this.invoiceConfigsStore.set(SEED_MUM_INVOICE_CONFIG.businessProfileId, { ...SEED_MUM_INVOICE_CONFIG });
    this.compliancesStore.set(SEED_MUM_COMPLIANCE.businessProfileId, { ...SEED_MUM_COMPLIANCE });
  }

  // ----------------------------------------------------------------------------
  // Base Repository Contract Implementations
  // ----------------------------------------------------------------------------

  public async findById(id: string): Promise<TheatreBusinessProfileRecord | null> {
    const p = this.profilesStore.get(id);
    return p ? { ...p } : null;
  }

  public async findAll(): Promise<TheatreBusinessProfileRecord[]> {
    return Array.from(this.profilesStore.values()).map((p) => ({ ...p }));
  }

  public async create(data: TheatreBusinessProfileRecord): Promise<TheatreBusinessProfileRecord> {
    const record = { ...data };
    this.profilesStore.set(record.id, record);
    return { ...record };
  }

  public async update(id: string, updates: Partial<TheatreBusinessProfileRecord>): Promise<TheatreBusinessProfileRecord> {
    const existing = this.profilesStore.get(id);
    if (!existing) {
      throw new Error(`TheatreBusinessProfile with id '${id}' not found`);
    }
    const updated: TheatreBusinessProfileRecord = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date(),
    };
    this.profilesStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.profilesStore.get(id);
    if (!existing) return false;

    this.profilesStore.delete(id);
    this.registrationsStore.delete(id);
    this.ownersStore.delete(id);
    this.taxConfigsStore.delete(id);
    this.invoiceConfigsStore.delete(id);
    this.compliancesStore.delete(id);

    // Delete associated documents
    for (const [docId, doc] of this.documentsStore.entries()) {
      if (doc.businessProfileId === id) {
        this.documentsStore.delete(docId);
      }
    }
    return true;
  }

  // ----------------------------------------------------------------------------
  // Domain Query Methods
  // ----------------------------------------------------------------------------

  public async findByTheatreId(theatreId: string): Promise<TheatreBusinessProfileRecord | null> {
    for (const profile of this.profilesStore.values()) {
      if (profile.theatreId === theatreId) {
        return { ...profile };
      }
    }
    return null;
  }

  public async findBundle(theatreId: string): Promise<TheatreBusinessBundle> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      return {
        profile: null,
        registration: null,
        owner: null,
        taxConfiguration: null,
        invoiceConfiguration: null,
        compliance: null,
        documents: [],
        versions: [],
      };
    }

    const registration = this.registrationsStore.get(profile.id) || null;
    const owner = this.ownersStore.get(profile.id) || null;
    const taxConfiguration = this.taxConfigsStore.get(profile.id) || null;
    const invoiceConfiguration = this.invoiceConfigsStore.get(profile.id) || null;
    const compliance = this.compliancesStore.get(profile.id) || null;

    const documents = Array.from(this.documentsStore.values())
      .filter((d) => d.businessProfileId === profile.id || d.theatreId === theatreId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((d) => ({ ...d }));

    const versions = this.versionsStore
      .filter((v) => v.theatreId === theatreId || v.businessProfileId === profile.id)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));

    return {
      profile: { ...profile },
      registration: registration ? { ...registration } : null,
      owner: owner ? { ...owner } : null,
      taxConfiguration: taxConfiguration ? { ...taxConfiguration } : null,
      invoiceConfiguration: invoiceConfiguration ? { ...invoiceConfiguration } : null,
      compliance: compliance ? { ...compliance } : null,
      documents,
      versions,
    };
  }

  public async findWithDetails(theatreId: string): Promise<TheatreBusinessProfileWithDetails | null> {
    const bundle = await this.findBundle(theatreId);
    if (!bundle.profile) return null;

    return {
      ...bundle.profile,
      registration: bundle.registration,
      owner: bundle.owner,
      taxConfiguration: bundle.taxConfiguration,
      invoiceConfiguration: bundle.invoiceConfiguration,
      compliance: bundle.compliance,
      documents: bundle.documents,
      recentVersions: bundle.versions?.slice(0, 5),
    };
  }

  public async getDocuments(theatreId: string): Promise<TheatreBusinessDocumentRecord[]> {
    return Array.from(this.documentsStore.values())
      .filter((d) => d.theatreId === theatreId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((d) => ({ ...d }));
  }

  public async getVersions(theatreId: string): Promise<TheatreBusinessVersionRecord[]> {
    return this.versionsStore
      .filter((v) => v.theatreId === theatreId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));
  }

  public async findVersions(theatreId: string): Promise<TheatreBusinessVersionRecord[]> {
    return this.getVersions(theatreId);
  }

  // ----------------------------------------------------------------------------
  // Domain Mutation Methods
  // ----------------------------------------------------------------------------

  public async createBusinessProfile(
    theatreId: string,
    input: CreateTheatreBusinessProfileInput,
    createdBy: string = "system"
  ): Promise<TheatreBusinessProfileWithDetails> {
    const existing = await this.findByTheatreId(theatreId);
    if (existing) {
      throw new Error(`A business profile already exists for theatreId '${theatreId}'`);
    }

    const profileId = `biz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const profileRecord: TheatreBusinessProfileRecord = {
      id: profileId,
      theatreId,
      legalBusinessName: input.legalBusinessName,
      registeredEntityName: input.registeredEntityName || null,
      businessCategory: input.businessCategory || "PRIVATE_LIMITED",
      customCategory: input.customCategory || null,
      businessType: input.businessType || "CINEMA_EXHIBITION",
      businessDescription: input.businessDescription || null,
      industry: input.industry || "Media & Entertainment / Cinema Exhibition",
      status: "DRAFT",
      version: 1,
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.profilesStore.set(profileId, profileRecord);

    // Initial Registration
    const registrationRecord: TheatreBusinessRegistrationRecord = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId: profileId,
      theatreId,
      gstNumber: input.registration?.gstNumber || null,
      panNumber: input.registration?.panNumber || null,
      cinNumber: input.registration?.cinNumber || null,
      businessRegistrationNumber: input.registration?.businessRegistrationNumber || null,
      registrationDate: input.registration?.registrationDate || null,
      registrationAuthority: input.registration?.registrationAuthority || null,
      certificateUrl: input.registration?.certificateUrl || null,
      isGstVerified: false,
      isPanVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    this.registrationsStore.set(profileId, registrationRecord);

    // Initial Owner
    const ownerRecord: TheatreBusinessOwnerRecord = {
      id: `own-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId: profileId,
      theatreId,
      ownerName: input.owner?.ownerName || input.legalBusinessName,
      ownershipType: input.owner?.ownershipType || "DIRECT_OWNERSHIP",
      businessContactPhone: input.owner?.businessContactPhone || null,
      businessEmail: input.owner?.businessEmail || null,
      managingDirector: input.owner?.managingDirector || null,
      authorizedSignatory: input.owner?.authorizedSignatory || null,
      createdAt: now,
      updatedAt: now,
    };
    this.ownersStore.set(profileId, ownerRecord);

    // Initial Tax Configuration
    const taxRecord: TheatreTaxConfigurationRecord = {
      id: `tax-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId: profileId,
      theatreId,
      taxSystemType: input.taxConfiguration?.taxSystemType || "GST",
      taxJurisdictionCountry: input.taxConfiguration?.taxJurisdictionCountry || "IND",
      taxPercentage: input.taxConfiguration?.taxPercentage || "18.00",
      pricingTaxModel: input.taxConfiguration?.pricingTaxModel || "TAX_INCLUSIVE",
      isTaxExempt: input.taxConfiguration?.isTaxExempt || false,
      exemptionReason: input.taxConfiguration?.exemptionReason || null,
      regionalTaxCode: input.taxConfiguration?.regionalTaxCode || "MH-27",
      internationalTaxNumber: input.taxConfiguration?.internationalTaxNumber || null,
      taxStatus: input.taxConfiguration?.taxStatus || "ACTIVE",
      notes: input.taxConfiguration?.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.taxConfigsStore.set(profileId, taxRecord);

    // Initial Invoice Configuration
    const invoiceRecord: TheatreInvoiceConfigurationRecord = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId: profileId,
      theatreId,
      invoicePrefix: input.invoiceConfiguration?.invoicePrefix || "CSP-",
      invoiceSequenceNext: input.invoiceConfiguration?.invoiceSequenceNext || 10001,
      invoiceHeader: input.invoiceConfiguration?.invoiceHeader || "Tax Invoice / Entertainment Receipt",
      invoiceFooter:
        input.invoiceConfiguration?.invoiceFooter ||
        "Thank you for choosing CineSphere. Subject to municipal and entertainment tax jurisdiction.",
      invoiceNotes: input.invoiceConfiguration?.invoiceNotes || null,
      invoiceLogoUrl: input.invoiceConfiguration?.invoiceLogoUrl || null,
      enableEInvoice: input.invoiceConfiguration?.enableEInvoice || false,
      enablePdfInvoice: input.invoiceConfiguration?.enablePdfInvoice !== false,
      enableCreditNotes: input.invoiceConfiguration?.enableCreditNotes || false,
      createdAt: now,
      updatedAt: now,
    };
    this.invoiceConfigsStore.set(profileId, invoiceRecord);

    // Initial Compliance Record
    const complianceRecord: TheatreBusinessComplianceRecord = {
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId: profileId,
      theatreId,
      verificationStatus: "DRAFT",
      verifiedBy: null,
      verifiedAt: null,
      verificationRemarks: null,
      riskScore: "LOW",
      createdAt: now,
      updatedAt: now,
    };
    this.compliancesStore.set(profileId, complianceRecord);

    // Record Initial Snapshot in Version Ledger
    await this.recordVersion(
      theatreId,
      profileId,
      "CREATED",
      "Created initial business identity, tax structure, and registration profile.",
      {
        profile: profileRecord,
        registration: registrationRecord,
        owner: ownerRecord,
        taxConfiguration: taxRecord,
        invoiceConfiguration: invoiceRecord,
        compliance: complianceRecord,
      },
      createdBy,
      "THEATRE_ADMIN"
    );

    const details = await this.findWithDetails(theatreId);
    return details!;
  }

  public async updateBusinessProfile(
    theatreId: string,
    input: UpdateTheatreBusinessProfileInput,
    updatedBy: string = "system"
  ): Promise<TheatreBusinessProfileWithDetails> {
    const current = await this.findByTheatreId(theatreId);
    if (!current) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    // Optimistic Concurrency Control check
    if (input.expectedVersion !== undefined && current.version !== input.expectedVersion) {
      throw new Error(
        `Optimistic lock failure: Record has been modified by another transaction. Expected version ${input.expectedVersion}, found ${current.version}`
      );
    }

    const now = new Date();
    const nextVersion = current.version + 1;

    // Update Profile
    const updatedProfile: TheatreBusinessProfileRecord = {
      ...current,
      legalBusinessName: input.legalBusinessName ?? current.legalBusinessName,
      registeredEntityName:
        input.registeredEntityName !== undefined ? input.registeredEntityName : current.registeredEntityName,
      businessCategory: input.businessCategory ?? current.businessCategory,
      customCategory: input.customCategory !== undefined ? input.customCategory : current.customCategory,
      businessType: input.businessType ?? current.businessType,
      businessDescription:
        input.businessDescription !== undefined ? input.businessDescription : current.businessDescription,
      industry: input.industry ?? current.industry,
      version: nextVersion,
      updatedBy,
      updatedAt: now,
    };
    this.profilesStore.set(current.id, updatedProfile);

    // Update Registration if provided
    if (input.registration) {
      const regCurrent = this.registrationsStore.get(current.id);
      if (regCurrent) {
        const updatedReg: TheatreBusinessRegistrationRecord = {
          ...regCurrent,
          gstNumber: input.registration.gstNumber !== undefined ? input.registration.gstNumber : regCurrent.gstNumber,
          panNumber: input.registration.panNumber !== undefined ? input.registration.panNumber : regCurrent.panNumber,
          cinNumber: input.registration.cinNumber !== undefined ? input.registration.cinNumber : regCurrent.cinNumber,
          businessRegistrationNumber:
            input.registration.businessRegistrationNumber !== undefined
              ? input.registration.businessRegistrationNumber
              : regCurrent.businessRegistrationNumber,
          registrationDate:
            input.registration.registrationDate !== undefined
              ? input.registration.registrationDate
              : regCurrent.registrationDate,
          registrationAuthority:
            input.registration.registrationAuthority !== undefined
              ? input.registration.registrationAuthority
              : regCurrent.registrationAuthority,
          certificateUrl:
            input.registration.certificateUrl !== undefined
              ? input.registration.certificateUrl
              : regCurrent.certificateUrl,
          isGstVerified:
            input.registration.isGstVerified !== undefined
              ? input.registration.isGstVerified
              : regCurrent.isGstVerified,
          isPanVerified:
            input.registration.isPanVerified !== undefined
              ? input.registration.isPanVerified
              : regCurrent.isPanVerified,
          updatedAt: now,
        };
        this.registrationsStore.set(current.id, updatedReg);
      }
    }

    // Update Owner if provided
    if (input.owner) {
      const ownCurrent = this.ownersStore.get(current.id);
      if (ownCurrent) {
        const updatedOwn: TheatreBusinessOwnerRecord = {
          ...ownCurrent,
          ownerName: input.owner.ownerName ?? ownCurrent.ownerName,
          ownershipType: input.owner.ownershipType ?? ownCurrent.ownershipType,
          businessContactPhone:
            input.owner.businessContactPhone !== undefined
              ? input.owner.businessContactPhone
              : ownCurrent.businessContactPhone,
          businessEmail:
            input.owner.businessEmail !== undefined ? input.owner.businessEmail : ownCurrent.businessEmail,
          managingDirector:
            input.owner.managingDirector !== undefined ? input.owner.managingDirector : ownCurrent.managingDirector,
          authorizedSignatory:
            input.owner.authorizedSignatory !== undefined
              ? input.owner.authorizedSignatory
              : ownCurrent.authorizedSignatory,
          updatedAt: now,
        };
        this.ownersStore.set(current.id, updatedOwn);
      }
    }

    // Snapshot version update
    const bundle = await this.findBundle(theatreId);
    await this.recordVersion(
      theatreId,
      current.id,
      "PROFILE_UPDATED",
      `Updated legal identity and corporate registration details (v${nextVersion}).`,
      {
        profile: updatedProfile,
        registration: bundle.registration,
        owner: bundle.owner,
        taxConfiguration: bundle.taxConfiguration,
        invoiceConfiguration: bundle.invoiceConfiguration,
        compliance: bundle.compliance,
      },
      updatedBy,
      "THEATRE_ADMIN"
    );

    const details = await this.findWithDetails(theatreId);
    return details!;
  }

  public async updateTaxConfiguration(
    theatreId: string,
    input: UpdateTheatreTaxConfigurationInput,
    updatedBy: string = "system"
  ): Promise<TheatreTaxConfigurationRecord> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    const currentTax = this.taxConfigsStore.get(profile.id);
    if (!currentTax) {
      throw new Error(`Tax configuration not found for theatreId '${theatreId}'`);
    }

    const now = new Date();
    const updatedTax: TheatreTaxConfigurationRecord = {
      ...currentTax,
      taxSystemType: input.taxSystemType ?? currentTax.taxSystemType,
      taxJurisdictionCountry: input.taxJurisdictionCountry ?? currentTax.taxJurisdictionCountry,
      taxPercentage: input.taxPercentage !== undefined ? input.taxPercentage : currentTax.taxPercentage,
      pricingTaxModel: input.pricingTaxModel ?? currentTax.pricingTaxModel,
      isTaxExempt: input.isTaxExempt !== undefined ? input.isTaxExempt : currentTax.isTaxExempt,
      exemptionReason: input.exemptionReason !== undefined ? input.exemptionReason : currentTax.exemptionReason,
      regionalTaxCode: input.regionalTaxCode !== undefined ? input.regionalTaxCode : currentTax.regionalTaxCode,
      internationalTaxNumber:
        input.internationalTaxNumber !== undefined
          ? input.internationalTaxNumber
          : currentTax.internationalTaxNumber,
      taxStatus: input.taxStatus ?? currentTax.taxStatus,
      notes: input.notes !== undefined ? input.notes : currentTax.notes,
      updatedAt: now,
    };
    this.taxConfigsStore.set(profile.id, updatedTax);

    await this.recordVersion(
      theatreId,
      profile.id,
      "TAX_CONFIG_UPDATED",
      `Tax configuration updated to ${updatedTax.taxSystemType} (${updatedTax.taxPercentage}% - ${updatedTax.pricingTaxModel}).`,
      { taxConfiguration: updatedTax },
      updatedBy,
      "THEATRE_ADMIN"
    );

    return { ...updatedTax };
  }

  public async updateInvoiceConfiguration(
    theatreId: string,
    input: UpdateTheatreInvoiceConfigurationInput,
    updatedBy: string = "system"
  ): Promise<TheatreInvoiceConfigurationRecord> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    const currentInv = this.invoiceConfigsStore.get(profile.id);
    if (!currentInv) {
      throw new Error(`Invoice configuration not found for theatreId '${theatreId}'`);
    }

    const now = new Date();
    const updatedInv: TheatreInvoiceConfigurationRecord = {
      ...currentInv,
      invoicePrefix: input.invoicePrefix ?? currentInv.invoicePrefix,
      invoiceSequenceNext:
        input.invoiceSequenceNext !== undefined ? input.invoiceSequenceNext : currentInv.invoiceSequenceNext,
      invoiceHeader: input.invoiceHeader ?? currentInv.invoiceHeader,
      invoiceFooter: input.invoiceFooter !== undefined ? input.invoiceFooter : currentInv.invoiceFooter,
      invoiceNotes: input.invoiceNotes !== undefined ? input.invoiceNotes : currentInv.invoiceNotes,
      invoiceLogoUrl: input.invoiceLogoUrl !== undefined ? input.invoiceLogoUrl : currentInv.invoiceLogoUrl,
      enableEInvoice: input.enableEInvoice !== undefined ? input.enableEInvoice : currentInv.enableEInvoice,
      enablePdfInvoice: input.enablePdfInvoice !== undefined ? input.enablePdfInvoice : currentInv.enablePdfInvoice,
      enableCreditNotes:
        input.enableCreditNotes !== undefined ? input.enableCreditNotes : currentInv.enableCreditNotes,
      updatedAt: now,
    };
    this.invoiceConfigsStore.set(profile.id, updatedInv);

    await this.recordVersion(
      theatreId,
      profile.id,
      "INVOICE_CONFIG_UPDATED",
      `Invoice configuration updated: prefix='${updatedInv.invoicePrefix}', sequence='${updatedInv.invoiceSequenceNext}'.`,
      { invoiceConfiguration: updatedInv },
      updatedBy,
      "THEATRE_ADMIN"
    );

    return { ...updatedInv };
  }

  public async verifyBusinessProfile(
    theatreId: string,
    verificationStatus: BusinessComplianceStatus,
    verificationRemarks?: string | null,
    riskScore: string = "LOW",
    verifiedBy: string = "system"
  ): Promise<TheatreBusinessComplianceRecord> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    const currentComp = this.compliancesStore.get(profile.id);
    if (!currentComp) {
      throw new Error(`Compliance record not found for theatreId '${theatreId}'`);
    }

    const now = new Date();
    const updatedComp: TheatreBusinessComplianceRecord = {
      ...currentComp,
      verificationStatus,
      verifiedBy,
      verifiedAt: now,
      verificationRemarks: verificationRemarks !== undefined ? verificationRemarks : currentComp.verificationRemarks,
      riskScore: riskScore ?? currentComp.riskScore,
      updatedAt: now,
    };
    this.compliancesStore.set(profile.id, updatedComp);

    // Update parent profile status
    const updatedProfile: TheatreBusinessProfileRecord = {
      ...profile,
      status: verificationStatus,
      updatedBy: verifiedBy,
      updatedAt: now,
      version: profile.version + 1,
    };
    this.profilesStore.set(profile.id, updatedProfile);

    // If verified, verify GST & PAN in registration
    if (verificationStatus === "VERIFIED") {
      const reg = this.registrationsStore.get(profile.id);
      if (reg) {
        this.registrationsStore.set(profile.id, {
          ...reg,
          isGstVerified: true,
          isPanVerified: true,
          updatedAt: now,
        });
      }
    }

    await this.recordVersion(
      theatreId,
      profile.id,
      "COMPLIANCE_STATUS_CHANGED",
      `Super Admin transitioned compliance status to '${verificationStatus}'. Remarks: ${verificationRemarks || "None"}.`,
      { compliance: updatedComp, profileStatus: verificationStatus },
      verifiedBy,
      "SUPER_ADMIN"
    );

    return { ...updatedComp };
  }

  public async archiveBusinessProfile(
    theatreId: string,
    reason?: string,
    archivedBy: string = "system"
  ): Promise<TheatreBusinessProfileRecord> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    const now = new Date();
    const updatedProfile: TheatreBusinessProfileRecord = {
      ...profile,
      status: "ARCHIVED",
      updatedBy: archivedBy,
      updatedAt: now,
      version: profile.version + 1,
    };
    this.profilesStore.set(profile.id, updatedProfile);

    await this.recordVersion(
      theatreId,
      profile.id,
      "ARCHIVED",
      `Business profile archived. Reason: ${reason || "Decommissioned by administrator"}`,
      { status: "ARCHIVED", reason },
      archivedBy,
      "SUPER_ADMIN"
    );

    return { ...updatedProfile };
  }

  // ----------------------------------------------------------------------------
  // Document Management Methods (Vault)
  // ----------------------------------------------------------------------------

  public async addDocument(
    theatreId: string,
    docData: Omit<TheatreBusinessDocumentRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<TheatreBusinessDocumentRecord> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      throw new Error(`Business profile not found for theatreId '${theatreId}'`);
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const record: TheatreBusinessDocumentRecord = {
      id: docId,
      businessProfileId: profile.id,
      theatreId,
      documentType: docData.documentType,
      documentTitle: docData.documentTitle,
      documentNumber: docData.documentNumber || null,
      fileUrl: docData.fileUrl,
      fileSize: docData.fileSize || null,
      mimeType: docData.mimeType || "application/pdf",
      verificationStatus: docData.verificationStatus || "PENDING",
      expiryDate: docData.expiryDate || null,
      displayOrder: docData.displayOrder || this.documentsStore.size + 1,
      createdAt: now,
      updatedAt: now,
    };

    this.documentsStore.set(docId, record);

    await this.recordVersion(
      theatreId,
      profile.id,
      "DOCUMENT_ATTACHED",
      `Attached document '${record.documentTitle}' (${record.documentType}).`,
      { document: record },
      "theatre-admin",
      "THEATRE_ADMIN"
    );

    return { ...record };
  }

  public async deleteDocument(theatreId: string, documentId: string): Promise<boolean> {
    const doc = this.documentsStore.get(documentId);
    if (!doc || doc.theatreId !== theatreId) {
      return false;
    }

    this.documentsStore.delete(documentId);

    const profile = await this.findByTheatreId(theatreId);
    if (profile) {
      await this.recordVersion(
        theatreId,
        profile.id,
        "DOCUMENT_REMOVED",
        `Removed document '${doc.documentTitle}' (${doc.documentType}).`,
        { documentId, title: doc.documentTitle },
        "theatre-admin",
        "THEATRE_ADMIN"
      );
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // Audit Version Ledger
  // ----------------------------------------------------------------------------

  public async recordVersion(
    theatreId: string,
    businessProfileId: string,
    changeType: string,
    changeSummary: string,
    snapshot: Record<string, unknown>,
    changedBy: string = "system",
    changedRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreBusinessVersionRecord> {
    const existingVersions = this.versionsStore.filter(
      (v) => v.theatreId === theatreId || v.businessProfileId === businessProfileId
    );
    const nextVersionNumber = existingVersions.length + 1;

    const versionRecord: TheatreBusinessVersionRecord = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessProfileId,
      theatreId,
      versionNumber: nextVersionNumber,
      changeType,
      changeSummary,
      snapshot,
      changedBy,
      changedRole,
      createdAt: new Date(),
    };

    this.versionsStore.push(versionRecord);
    return { ...versionRecord };
  }

  // ----------------------------------------------------------------------------
  // Multi-Faceted Search & Query Aggregation
  // ----------------------------------------------------------------------------

  public async searchProfiles(
    filters: SearchTheatreBusinessFilters
  ): Promise<PaginatedResult<TheatreBusinessProfileRecord>> {
    let results = Array.from(this.profilesStore.values());

    if (filters.theatreId) {
      results = results.filter((p) => p.theatreId === filters.theatreId);
    }

    if (filters.category) {
      results = results.filter((p) => p.businessCategory === filters.category);
    }

    if (filters.complianceStatus) {
      results = results.filter((p) => p.status === filters.complianceStatus);
    }

    if (filters.taxSystemType) {
      results = results.filter((p) => {
        const tax = this.taxConfigsStore.get(p.id);
        return tax?.taxSystemType === filters.taxSystemType;
      });
    }

    if (filters.isTaxExempt !== undefined) {
      results = results.filter((p) => {
        const tax = this.taxConfigsStore.get(p.id);
        return tax?.isTaxExempt === filters.isTaxExempt;
      });
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((p) => {
        const reg = this.registrationsStore.get(p.id);
        const owner = this.ownersStore.get(p.id);
        return (
          p.legalBusinessName.toLowerCase().includes(q) ||
          (p.registeredEntityName && p.registeredEntityName.toLowerCase().includes(q)) ||
          (reg?.gstNumber && reg.gstNumber.toLowerCase().includes(q)) ||
          (reg?.panNumber && reg.panNumber.toLowerCase().includes(q)) ||
          (reg?.cinNumber && reg.cinNumber.toLowerCase().includes(q)) ||
          (owner?.ownerName && owner.ownerName.toLowerCase().includes(q))
        );
      });
    }

    const page = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
    const pageSize = filters.limit || 20;

    return paginateArray(results, { page, pageSize });
  }
}

// Singleton Export
export const theatreBusinessRepository = new TheatreBusinessRepository();
