import { BaseRepository } from "./base.repository";
import { paginateArray, type PaginatedResult } from "@/lib/performance/cache-strategy";
import type {
  TheatreContactRecord,
  TheatrePhoneRecord,
  TheatreEmailRecord,
  TheatreWebsiteRecord,
  TheatreContactSocialLinkRecord,
  TheatreEmergencyContactRecord,
  TheatreManagerContactRecord,
  TheatreContactVersionRecord,
  TheatreContactWithDetails,
  TheatreContactFilterParams,
  PublicTheatreContactDTO,
  PublicTheatreContactDirectoryBundle,
  TheatreContactDirectoryBundle,
  ContactChannelType,
} from "@/types/theatre-contact.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Contact Repository (Phase 3 – Part 6)
 * ==============================================================================
 * Multi-channel directory, typed phone/email/website/social/emergency/manager
 * records, single-primary enforcement, optimistic concurrency, and audit versions.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Initial Seed Data: Contacts for Pune Flagship (th-pun-001)
// ------------------------------------------------------------------------------
const SEED_CONTACTS: TheatreContactRecord[] = [
  {
    id: "cnt-pun-001",
    theatreId: "th-pun-001",
    channelType: "PHONE",
    contactRole: "CUSTOMER_SUPPORT",
    title: "Main Box Office & Helpdesk",
    description: "Primary patron assistance, ticketing queries, and wheelchair reservations.",
    isPrimary: true,
    visibility: "PUBLIC",
    availabilityMode: "STANDARD_BUSINESS_HOURS",
    businessHours: "09:00 AM - 11:30 PM IST (Mon-Sun)",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 1,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-002",
    theatreId: "th-pun-001",
    channelType: "EMAIL",
    contactRole: "CUSTOMER_SUPPORT",
    title: "Guest Experience Support",
    description: "Ticketing issues, refund status, and patron feedback.",
    isPrimary: true,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "24/7 Ticketing Support",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 2,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-003",
    theatreId: "th-pun-001",
    channelType: "WEBSITE",
    contactRole: "GENERAL_ENQUIRY",
    title: "Official Multiplex Showcase",
    description: "Cinema showtimes, concession ordering, and IMAX screen schedule.",
    isPrimary: true,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "24/7 Web Portal",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 3,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-004",
    theatreId: "th-pun-001",
    channelType: "EMERGENCY",
    contactRole: "EMERGENCY_DESK",
    title: "24/7 Fire & Medical Emergency Control Desk",
    description: "Direct emergency dispatch, evacuation coordinator, and first-aid response.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "EMERGENCY_ONLY",
    businessHours: "24/7 On-Call Rapid Response",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 4,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-005",
    theatreId: "th-pun-001",
    channelType: "MANAGER",
    contactRole: "DUTY_MANAGER",
    title: "General Manager Operations Desk",
    description: "Senior management escalations, auditorium engineering, and VIP hosting.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "SHOWTIME_ONLY",
    businessHours: "10:00 AM - 11:30 PM (Operating Hours)",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 5,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-006",
    theatreId: "th-pun-001",
    channelType: "PHONE",
    contactRole: "GENERAL_ENQUIRY",
    title: "VIP Concierge & Recliner Booking",
    description: "Gold class lounge reservations and private auditorium hire.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "STANDARD_BUSINESS_HOURS",
    businessHours: "10:00 AM - 10:00 PM IST",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 6,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-007",
    theatreId: "th-pun-001",
    channelType: "EMAIL",
    contactRole: "BUSINESS_DEVELOPMENT",
    title: "Corporate Screen Bookings & B2B Enquiries",
    description: "Bulk corporate screenings, brand activations, and auditorium leasing.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "STANDARD_BUSINESS_HOURS",
    businessHours: "10:00 AM - 06:00 PM IST (Mon-Fri)",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 7,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-008",
    theatreId: "th-pun-001",
    channelType: "SOCIAL_LINK",
    contactRole: "GENERAL_ENQUIRY",
    title: "Official Instagram Channel",
    description: "Follow for upcoming movie trailers, fan premieres, and festive offers.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "Social Media Channel",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 8,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-009",
    theatreId: "th-pun-001",
    channelType: "SOCIAL_LINK",
    contactRole: "GENERAL_ENQUIRY",
    title: "Official Facebook Page",
    description: "Community updates and patron reviews.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "Social Media Channel",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 9,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-pun-010",
    theatreId: "th-pun-001",
    channelType: "SOCIAL_LINK",
    contactRole: "GENERAL_ENQUIRY",
    title: "Official X (Twitter) Handle",
    description: "Real-time show updates and service alerts.",
    isPrimary: false,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "Social Media Channel",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 10,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Phone Records
const SEED_PHONES: TheatrePhoneRecord[] = [
  {
    id: "phn-pun-001",
    contactId: "cnt-pun-001",
    theatreId: "th-pun-001",
    countryCode: "+91",
    phoneNumber: "020-66451234",
    extension: "401",
    phoneType: "LANDLINE",
    isPrimary: true,
    isSmsEnabled: false,
    isWhatsappEnabled: false,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "phn-pun-002",
    contactId: "cnt-pun-006",
    theatreId: "th-pun-001",
    countryCode: "+91",
    phoneNumber: "020-66451235",
    extension: "402",
    phoneType: "DIRECT_DESK",
    isPrimary: false,
    isSmsEnabled: false,
    isWhatsappEnabled: true,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Email Records
const SEED_EMAILS: TheatreEmailRecord[] = [
  {
    id: "eml-pun-001",
    contactId: "cnt-pun-002",
    theatreId: "th-pun-001",
    email: "support.pune@cinesphere.com",
    emailType: "SUPPORT",
    department: "Guest Relations",
    isPrimary: true,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "eml-pun-002",
    contactId: "cnt-pun-007",
    theatreId: "th-pun-001",
    email: "corporate.pune@cinesphere.com",
    emailType: "BUSINESS",
    department: "Business Development",
    isPrimary: false,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Website Records
const SEED_WEBSITES: TheatreWebsiteRecord[] = [
  {
    id: "web-pun-001",
    contactId: "cnt-pun-003",
    theatreId: "th-pun-001",
    url: "https://phoenixmarketcitypune.cinesphere.com",
    websiteType: "OFFICIAL",
    title: "CineSphere Phoenix Marketcity Flagship",
    isPrimary: true,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Social Links
const SEED_SOCIAL_LINKS: TheatreContactSocialLinkRecord[] = [
  {
    id: "soc-pun-001",
    contactId: "cnt-pun-008",
    theatreId: "th-pun-001",
    platform: "INSTAGRAM",
    customPlatform: null,
    url: "https://instagram.com/cinesphere_pune",
    handle: "@cinesphere_pune",
    displayOrder: 1,
    status: "ACTIVE",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "soc-pun-002",
    contactId: "cnt-pun-009",
    theatreId: "th-pun-001",
    platform: "FACEBOOK",
    customPlatform: null,
    url: "https://facebook.com/cinespherepune",
    handle: "cinespherepune",
    displayOrder: 2,
    status: "ACTIVE",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "soc-pun-003",
    contactId: "cnt-pun-010",
    theatreId: "th-pun-001",
    platform: "X_TWITTER",
    customPlatform: null,
    url: "https://x.com/cinesphere_pune",
    handle: "@cinesphere_pune",
    displayOrder: 3,
    status: "ACTIVE",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Emergency Contact
const SEED_EMERGENCY: TheatreEmergencyContactRecord[] = [
  {
    id: "emg-pun-001",
    contactId: "cnt-pun-004",
    theatreId: "th-pun-001",
    contactPersonName: "Rajesh Kulkarni",
    roleOrDesignation: "Chief Safety & Fire Evacuation Officer",
    primaryPhone: "+91 98200 99999",
    alternatePhone: "+91 20 6645 1101",
    availabilityHours: "24/7 Priority Emergency Line",
    emergencyType: "MEDICAL_FIRE_SAFETY",
    operatingProcedures: "Emergency evacuation muster point: West Plaza Car Park. First aid defibrillator: Screen 01 corridor.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Initial Seed: Child Manager Contact
const SEED_MANAGERS: TheatreManagerContactRecord[] = [
  {
    id: "mgr-pun-001",
    contactId: "cnt-pun-005",
    theatreId: "th-pun-001",
    managerName: "Amit Deshmukh",
    designation: "General Manager — Pune Complex",
    phone: "+91 98221 44556",
    email: "amit.deshmukh@cinesphere.com",
    department: "Operations",
    shiftHours: "10:00 AM - 11:30 PM",
    escalationTier: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// Seed for Mumbai Palladium (th-mum-001) for cross-tenant tests
const SEED_MUMBAI_CONTACTS: TheatreContactRecord[] = [
  {
    id: "cnt-mum-001",
    theatreId: "th-mum-001",
    channelType: "PHONE",
    contactRole: "CUSTOMER_SUPPORT",
    title: "Mumbai Box Office Helpdesk",
    description: "Customer service for Palladium venue.",
    isPrimary: true,
    visibility: "PUBLIC",
    availabilityMode: "STANDARD_BUSINESS_HOURS",
    businessHours: "09:30 AM - 11:45 PM IST",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 1,
    entityType: "THEATRE",
    entityId: "th-mum-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-mum",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cnt-mum-002",
    theatreId: "th-mum-001",
    channelType: "EMAIL",
    contactRole: "CUSTOMER_SUPPORT",
    title: "Mumbai Guest Relations",
    description: "Guest care and corporate assistance.",
    isPrimary: true,
    visibility: "PUBLIC",
    availabilityMode: "TWENTY_FOUR_SEVEN",
    businessHours: "24/7",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    displayOrder: 2,
    entityType: "THEATRE",
    entityId: "th-mum-001",
    version: 1,
    createdBy: "usr-super-1",
    updatedBy: "usr-th-mum",
    verifiedBy: "usr-super-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const SEED_MUMBAI_PHONES: TheatrePhoneRecord[] = [
  {
    id: "phn-mum-001",
    contactId: "cnt-mum-001",
    theatreId: "th-mum-001",
    countryCode: "+91",
    phoneNumber: "022-49885600",
    extension: "101",
    phoneType: "LANDLINE",
    isPrimary: true,
    isSmsEnabled: false,
    isWhatsappEnabled: false,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const SEED_MUMBAI_EMAILS: TheatreEmailRecord[] = [
  {
    id: "eml-mum-001",
    contactId: "cnt-mum-002",
    theatreId: "th-mum-001",
    email: "support.mumbai@cinesphere.com",
    emailType: "SUPPORT",
    department: "Guest Relations",
    isPrimary: true,
    isVerified: true,
    verifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// ------------------------------------------------------------------------------
// Theatre Contact Repository Implementation
// ------------------------------------------------------------------------------
export class TheatreContactRepository extends BaseRepository<TheatreContactRecord> {
  protected entityName = "TheatreContact";
  protected tableName = "theatre_contacts";

  private contactsStore: Map<string, TheatreContactRecord> = new Map();
  private phonesStore: Map<string, TheatrePhoneRecord> = new Map();
  private emailsStore: Map<string, TheatreEmailRecord> = new Map();
  private websitesStore: Map<string, TheatreWebsiteRecord> = new Map();
  private socialLinksStore: Map<string, TheatreContactSocialLinkRecord> = new Map();
  private emergencyStore: Map<string, TheatreEmergencyContactRecord> = new Map();
  private managersStore: Map<string, TheatreManagerContactRecord> = new Map();
  private versionsStore: TheatreContactVersionRecord[] = [];

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    SEED_CONTACTS.forEach((c) => this.contactsStore.set(c.id, { ...c }));
    SEED_PHONES.forEach((p) => this.phonesStore.set(p.contactId, { ...p }));
    SEED_EMAILS.forEach((e) => this.emailsStore.set(e.contactId, { ...e }));
    SEED_WEBSITES.forEach((w) => this.websitesStore.set(w.contactId, { ...w }));
    SEED_SOCIAL_LINKS.forEach((s) => this.socialLinksStore.set(s.contactId, { ...s }));
    SEED_EMERGENCY.forEach((emg) => this.emergencyStore.set(emg.contactId, { ...emg }));
    SEED_MANAGERS.forEach((m) => this.managersStore.set(m.contactId, { ...m }));

    SEED_MUMBAI_CONTACTS.forEach((c) => this.contactsStore.set(c.id, { ...c }));
    SEED_MUMBAI_PHONES.forEach((p) => this.phonesStore.set(p.contactId, { ...p }));
    SEED_MUMBAI_EMAILS.forEach((e) => this.emailsStore.set(e.contactId, { ...e }));
  }

  // ----------------------------------------------------------------------------
  // Base Repository Overrides
  // ----------------------------------------------------------------------------
  public async findById(id: string): Promise<TheatreContactRecord | null> {
    const item = this.contactsStore.get(id);
    return item ? { ...item } : null;
  }

  public async findAll(): Promise<TheatreContactRecord[]> {
    return Array.from(this.contactsStore.values()).map((c) => ({ ...c }));
  }

  public async create(data: TheatreContactRecord): Promise<TheatreContactRecord> {
    const record: TheatreContactRecord = { ...data };
    this.contactsStore.set(record.id, record);
    return { ...record };
  }

  public async update(id: string, updates: Partial<TheatreContactRecord>): Promise<TheatreContactRecord> {
    const current = this.contactsStore.get(id);
    if (!current) {
      throw new Error(`Contact record with ID '${id}' not found`);
    }
    const updated: TheatreContactRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.contactsStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    const existed = this.contactsStore.delete(id);
    this.phonesStore.delete(id);
    this.emailsStore.delete(id);
    this.websitesStore.delete(id);
    this.socialLinksStore.delete(id);
    this.emergencyStore.delete(id);
    this.managersStore.delete(id);
    return existed;
  }

  // ----------------------------------------------------------------------------
  // Contact With Enriched Details
  // ----------------------------------------------------------------------------
  public async findWithDetails(contactId: string): Promise<TheatreContactWithDetails | null> {
    const contact = await this.findById(contactId);
    if (!contact) return null;

    return {
      ...contact,
      phone: this.phonesStore.get(contactId) ? { ...this.phonesStore.get(contactId)! } : null,
      email: this.emailsStore.get(contactId) ? { ...this.emailsStore.get(contactId)! } : null,
      website: this.websitesStore.get(contactId) ? { ...this.websitesStore.get(contactId)! } : null,
      socialLink: this.socialLinksStore.get(contactId) ? { ...this.socialLinksStore.get(contactId)! } : null,
      emergencyContact: this.emergencyStore.get(contactId) ? { ...this.emergencyStore.get(contactId)! } : null,
      managerContact: this.managersStore.get(contactId) ? { ...this.managersStore.get(contactId)! } : null,
    };
  }

  // ----------------------------------------------------------------------------
  // Tenant-Scoped Queries & Filtering
  // ----------------------------------------------------------------------------
  public async findByTheatre(
    theatreId: string,
    filters?: TheatreContactFilterParams
  ): Promise<TheatreContactWithDetails[]> {
    let list = Array.from(this.contactsStore.values())
      .filter((c) => c.theatreId === theatreId);

    if (filters?.channelType) {
      list = list.filter((c) => c.channelType === filters.channelType);
    }
    if (filters?.contactRole) {
      list = list.filter((c) => c.contactRole === filters.contactRole);
    }
    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.visibility) {
      list = list.filter((c) => c.visibility === filters.visibility);
    }
    if (filters?.isPrimary !== undefined) {
      list = list.filter((c) => c.isPrimary === filters.isPrimary);
    }
    if (filters?.isVerified !== undefined) {
      const targetVerified = filters.isVerified ? "VERIFIED" : "UNVERIFIED";
      list = list.filter((c) =>
        filters.isVerified ? c.verificationStatus === "VERIFIED" : c.verificationStatus !== "VERIFIED"
      );
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((c) => {
        if (c.title.toLowerCase().includes(q)) return true;
        if (c.description?.toLowerCase().includes(q)) return true;
        const ph = this.phonesStore.get(c.id);
        if (ph && (ph.phoneNumber.includes(q) || ph.countryCode.includes(q))) return true;
        const em = this.emailsStore.get(c.id);
        if (em && em.email.toLowerCase().includes(q)) return true;
        const wb = this.websitesStore.get(c.id);
        if (wb && wb.url.toLowerCase().includes(q)) return true;
        const mg = this.managersStore.get(c.id);
        if (mg && mg.managerName.toLowerCase().includes(q)) return true;
        const eg = this.emergencyStore.get(c.id);
        if (eg && eg.contactPersonName.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    list.sort((a, b) => a.displayOrder - b.displayOrder);

    const enriched: TheatreContactWithDetails[] = list.map((c) => ({
      ...c,
      phone: this.phonesStore.get(c.id) ? { ...this.phonesStore.get(c.id)! } : null,
      email: this.emailsStore.get(c.id) ? { ...this.emailsStore.get(c.id)! } : null,
      website: this.websitesStore.get(c.id) ? { ...this.websitesStore.get(c.id)! } : null,
      socialLink: this.socialLinksStore.get(c.id) ? { ...this.socialLinksStore.get(c.id)! } : null,
      emergencyContact: this.emergencyStore.get(c.id) ? { ...this.emergencyStore.get(c.id)! } : null,
      managerContact: this.managersStore.get(c.id) ? { ...this.managersStore.get(c.id)! } : null,
    }));

    return enriched;
  }

  // ----------------------------------------------------------------------------
  // Single-Primary Enforcement Support
  // ----------------------------------------------------------------------------
  public async findPrimary(
    theatreId: string,
    channelType: ContactChannelType
  ): Promise<TheatreContactRecord | null> {
    const list = Array.from(this.contactsStore.values()).filter(
      (c) => c.theatreId === theatreId && c.channelType === channelType && c.isPrimary
    );
    return list[0] ? { ...list[0] } : null;
  }

  public async clearPrimaryFlag(
    theatreId: string,
    channelType: ContactChannelType,
    exceptContactId?: string
  ): Promise<void> {
    for (const [id, c] of this.contactsStore.entries()) {
      if (c.theatreId === theatreId && c.channelType === channelType && c.isPrimary) {
        if (!exceptContactId || id !== exceptContactId) {
          this.contactsStore.set(id, {
            ...c,
            isPrimary: false,
            updatedAt: new Date().toISOString(),
          });
          const ph = this.phonesStore.get(id);
          if (ph) this.phonesStore.set(id, { ...ph, isPrimary: false, updatedAt: new Date().toISOString() });
          const em = this.emailsStore.get(id);
          if (em) this.emailsStore.set(id, { ...em, isPrimary: false, updatedAt: new Date().toISOString() });
          const wb = this.websitesStore.get(id);
          if (wb) this.websitesStore.set(id, { ...wb, isPrimary: false, updatedAt: new Date().toISOString() });
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  // Sub-Entity Setters & Getters
  // ----------------------------------------------------------------------------
  public async savePhone(phone: TheatrePhoneRecord): Promise<TheatrePhoneRecord> {
    this.phonesStore.set(phone.contactId, { ...phone });
    return { ...phone };
  }

  public async saveEmail(email: TheatreEmailRecord): Promise<TheatreEmailRecord> {
    this.emailsStore.set(email.contactId, { ...email });
    return { ...email };
  }

  public async saveWebsite(website: TheatreWebsiteRecord): Promise<TheatreWebsiteRecord> {
    this.websitesStore.set(website.contactId, { ...website });
    return { ...website };
  }

  public async saveSocialLink(social: TheatreContactSocialLinkRecord): Promise<TheatreContactSocialLinkRecord> {
    this.socialLinksStore.set(social.contactId, { ...social });
    return { ...social };
  }

  public async saveEmergencyContact(emergency: TheatreEmergencyContactRecord): Promise<TheatreEmergencyContactRecord> {
    this.emergencyStore.set(emergency.contactId, { ...emergency });
    return { ...emergency };
  }

  public async saveManagerContact(manager: TheatreManagerContactRecord): Promise<TheatreManagerContactRecord> {
    this.managersStore.set(manager.contactId, { ...manager });
    return { ...manager };
  }

  public getPhone(contactId: string): TheatrePhoneRecord | null {
    const p = this.phonesStore.get(contactId);
    return p ? { ...p } : null;
  }

  public getEmail(contactId: string): TheatreEmailRecord | null {
    const e = this.emailsStore.get(contactId);
    return e ? { ...e } : null;
  }

  public getWebsite(contactId: string): TheatreWebsiteRecord | null {
    const w = this.websitesStore.get(contactId);
    return w ? { ...w } : null;
  }

  public getSocialLink(contactId: string): TheatreContactSocialLinkRecord | null {
    const s = this.socialLinksStore.get(contactId);
    return s ? { ...s } : null;
  }

  // ----------------------------------------------------------------------------
  // Optimistic Concurrency Control (OCC)
  // ----------------------------------------------------------------------------
  public async updateWithOptimisticLock(params: {
    contactId: string;
    theatreId: string;
    expectedVersion?: number;
    updates: Partial<TheatreContactRecord>;
  }): Promise<TheatreContactRecord> {
    const current = this.contactsStore.get(params.contactId);
    if (!current) {
      throw new Error(`Contact '${params.contactId}' not found`);
    }

    if (current.theatreId !== params.theatreId) {
      throw new Error("Cross-tenant violation: Contact does not belong to specified theatre");
    }

    if (params.expectedVersion !== undefined && current.version !== params.expectedVersion) {
      throw new Error(
        `Optimistic lock collision on Contact '${params.contactId}'. Current version=${current.version}, Expected=${params.expectedVersion}`
      );
    }

    const updated: TheatreContactRecord = {
      ...current,
      ...params.updates,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.contactsStore.set(params.contactId, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // Reorder Sequential Display Orders
  // ----------------------------------------------------------------------------
  public async reorderContacts(theatreId: string, orderedContactIds: string[]): Promise<TheatreContactRecord[]> {
    const results: TheatreContactRecord[] = [];
    let order = 1;

    for (const cid of orderedContactIds) {
      const c = this.contactsStore.get(cid);
      if (c && c.theatreId === theatreId) {
        const updated: TheatreContactRecord = {
          ...c,
          displayOrder: order++,
          version: c.version + 1,
          updatedAt: new Date().toISOString(),
        };
        this.contactsStore.set(cid, updated);
        results.push({ ...updated });
      }
    }

    return results;
  }

  // ----------------------------------------------------------------------------
  // Versioning & Audit Ledger
  // ----------------------------------------------------------------------------
  public async recordVersion(data: Omit<TheatreContactVersionRecord, "id" | "createdAt">): Promise<TheatreContactVersionRecord> {
    const record: TheatreContactVersionRecord = {
      id: `cnt-ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.versionsStore.push(record);
    return { ...record };
  }

  public async findVersions(theatreId: string, contactId?: string): Promise<TheatreContactVersionRecord[]> {
    return this.versionsStore.filter((v) => {
      if (v.theatreId !== theatreId) return false;
      if (contactId && v.contactId !== contactId) return false;
      return true;
    });
  }

  public async getVersionHistory(filter: { theatreId?: string; contactId?: string }): Promise<TheatreContactVersionRecord[]> {
    return this.versionsStore.filter((v) => {
      if (filter.theatreId && v.theatreId !== filter.theatreId) return false;
      if (filter.contactId && v.contactId !== filter.contactId) return false;
      return true;
    });
  }

  // ----------------------------------------------------------------------------
  // Public Patron Projection
  // ----------------------------------------------------------------------------
  public async findPublicContacts(theatreId: string): Promise<PublicTheatreContactDTO[]> {
    const contacts = await this.findByTheatre(theatreId, {
      status: "ACTIVE",
      visibility: "PUBLIC",
    });

    const dtos: PublicTheatreContactDTO[] = contacts.map((c) => {
      const phone = c.phone
        ? {
            countryCode: c.phone.countryCode,
            phoneNumber: c.phone.phoneNumber,
            extension: c.phone.extension,
            formattedPhone: `${c.phone.countryCode} ${c.phone.phoneNumber}${c.phone.extension ? ` (${c.phone.extension})` : ""}`,
            phoneType: c.phone.phoneType,
          }
        : null;

      const email = c.email
        ? {
            email: c.email.email,
            emailType: c.email.emailType,
            department: c.email.department,
          }
        : null;

      const website = c.website
        ? {
            url: c.website.url,
            websiteType: c.website.websiteType,
            title: c.website.title,
          }
        : null;

      const socialLink = c.socialLink
        ? {
            platform: c.socialLink.platform,
            customPlatform: c.socialLink.customPlatform,
            url: c.socialLink.url,
            handle: c.socialLink.handle,
          }
        : null;

      const emergencyContact = c.emergencyContact
        ? {
            contactPersonName: c.emergencyContact.contactPersonName,
            roleOrDesignation: c.emergencyContact.roleOrDesignation,
            primaryPhone: c.emergencyContact.primaryPhone,
            alternatePhone: c.emergencyContact.alternatePhone,
            availabilityHours: c.emergencyContact.availabilityHours,
          }
        : null;

      const managerContact = c.managerContact
        ? {
            managerName: c.managerContact.managerName,
            designation: c.managerContact.designation,
            phone: c.managerContact.phone,
            email: c.managerContact.email,
            department: c.managerContact.department,
          }
        : null;

      return {
        id: c.id,
        theatreId: c.theatreId,
        title: c.title,
        channelType: c.channelType,
        contactRole: c.contactRole,
        isPrimary: c.isPrimary,
        availabilityMode: c.availabilityMode,
        businessHours: c.businessHours,
        isVerified: c.verificationStatus === "VERIFIED",
        phone,
        email,
        website,
        socialLink,
        emergencyContact,
        managerContact,
      };
    });

    return dtos;
  }
}

export const theatreContactRepository = new TheatreContactRepository();
