/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extensions Repository (Phase 3 – Part 16)
 * ==============================================================================
 * Dedicated persistence and domain data abstraction layer for multi-branch
 * organizations, franchise agreements, corporate accounts, customer experience
 * memberships, dynamic pricing rules, IoT device registry, and API integrations.
 * ==============================================================================
 */

import {
  Organization,
  Branch,
  RegionalOffice,
  BranchGroup,
  FranchiseAgreement,
  CorporateAccount,
  MembershipPlan,
  GiftCard,
  LoyaltyProgram,
  DynamicPricingRule,
  DeviceRegistry,
  DeviceTelemetry,
  APIClient,
  WebhookSubscription,
  IPricingRuleEngine,
} from "@/types/enterprise-extension-framework.types";

export class EnterpriseExtensionsRepository implements IPricingRuleEngine {
  private static instance: EnterpriseExtensionsRepository | null = null;

  // In-memory multi-entity stores
  private organizations: Map<string, Organization> = new Map();
  private regionalOffices: Map<string, RegionalOffice> = new Map();
  private branchGroups: Map<string, BranchGroup> = new Map();
  private branches: Map<string, Branch> = new Map();
  private franchiseAgreements: Map<string, FranchiseAgreement> = new Map();
  private corporateAccounts: Map<string, CorporateAccount> = new Map();
  private membershipPlans: Map<string, MembershipPlan> = new Map();
  private giftCards: Map<string, GiftCard> = new Map();
  private loyaltyPrograms: Map<string, LoyaltyProgram> = new Map();
  private pricingRules: Map<string, DynamicPricingRule> = new Map();
  private devices: Map<string, DeviceRegistry> = new Map();
  private telemetryLogs: Map<string, DeviceTelemetry[]> = new Map();
  private apiClients: Map<string, APIClient> = new Map();
  private webhooks: Map<string, WebhookSubscription> = new Map();

  private constructor() {
    this.seedEnterpriseData();
  }

  public static getInstance(): EnterpriseExtensionsRepository {
    if (!EnterpriseExtensionsRepository.instance) {
      EnterpriseExtensionsRepository.instance = new EnterpriseExtensionsRepository();
    }
    return EnterpriseExtensionsRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // Organization Platform Methods
  // ----------------------------------------------------------------------------

  public listOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  public listRegionalOffices(organizationId?: string): RegionalOffice[] {
    const all = Array.from(this.regionalOffices.values());
    if (!organizationId) return all;
    return all.filter((r) => r.organizationId === organizationId);
  }

  public listBranchGroups(organizationId?: string): BranchGroup[] {
    const all = Array.from(this.branchGroups.values());
    if (!organizationId) return all;
    return all.filter((b) => b.organizationId === organizationId);
  }

  public listBranches(organizationId?: string): Branch[] {
    const all = Array.from(this.branches.values());
    if (!organizationId) return all;
    return all.filter((b) => b.organizationId === organizationId);
  }

  public getBranchByTheatreId(theatreId: string): Branch | undefined {
    return Array.from(this.branches.values()).find((b) => b.theatreId === theatreId);
  }

  public listFranchiseAgreements(organizationId?: string): FranchiseAgreement[] {
    const all = Array.from(this.franchiseAgreements.values());
    if (!organizationId) return all;
    return all.filter((f) => f.organizationId === organizationId);
  }

  public listCorporateAccounts(organizationId?: string): CorporateAccount[] {
    const all = Array.from(this.corporateAccounts.values());
    if (!organizationId) return all;
    return all.filter((c) => c.organizationId === organizationId);
  }

  // ----------------------------------------------------------------------------
  // Customer Experience Platform Methods
  // ----------------------------------------------------------------------------

  public listMembershipPlans(filter?: { theatreId?: string; organizationId?: string }): MembershipPlan[] {
    let plans = Array.from(this.membershipPlans.values());
    if (filter?.theatreId) {
      plans = plans.filter((p) => !p.theatreId || p.theatreId === filter.theatreId);
    }
    if (filter?.organizationId) {
      plans = plans.filter((p) => !p.organizationId || p.organizationId === filter.organizationId);
    }
    return plans;
  }

  public listGiftCards(theatreId?: string): GiftCard[] {
    const all = Array.from(this.giftCards.values());
    if (!theatreId) return all;
    return all.filter((g) => !g.theatreId || g.theatreId === theatreId);
  }

  public listLoyaltyPrograms(organizationId?: string): LoyaltyProgram[] {
    const all = Array.from(this.loyaltyPrograms.values());
    if (!organizationId) return all;
    return all.filter((l) => !l.organizationId || l.organizationId === organizationId);
  }

  // ----------------------------------------------------------------------------
  // Pricing Platform Methods & IPricingRuleEngine Implementation
  // ----------------------------------------------------------------------------

  public listPricingRules(theatreId?: string): DynamicPricingRule[] {
    const all = Array.from(this.pricingRules.values());
    if (!theatreId) return all;
    return all.filter((r) => !r.theatreId || r.theatreId === theatreId);
  }

  public evaluatePricing(context: {
    basePrice: number;
    theatreId: string;
    showTime: string; // e.g. "2026-11-20T20:00:00Z"
    currentOccupancyPercent: number;
    format: string;
  }): {
    effectivePrice: number;
    appliedRuleIds: string[];
    priceMultiplier: number;
  } {
    const applicableRules = Array.from(this.pricingRules.values())
      .filter((r) => r.isActive)
      .filter((r) => !r.theatreId || r.theatreId === context.theatreId)
      .sort((a, b) => b.priority - a.priority);

    let cumulativeMultiplier = 1.0;
    const appliedRuleIds: string[] = [];

    const timeMatch = context.showTime.match(/T(\d{2}):(\d{2})/);
    const timeSlotStr = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "20:00";

    const datePart = context.showTime.includes("T")
      ? context.showTime.split("T")[0]
      : context.showTime;
    const dateObj = new Date(`${datePart}T00:00:00Z`);
    const dayOfWeek = isNaN(dateObj.getUTCDay()) ? 5 : dateObj.getUTCDay();

    for (const rule of applicableRules) {
      let matches = true;

      // Occupancy condition
      if (
        rule.conditions.minOccupancyPercent !== undefined &&
        context.currentOccupancyPercent < rule.conditions.minOccupancyPercent
      ) {
        matches = false;
      }
      if (
        rule.conditions.maxOccupancyPercent !== undefined &&
        context.currentOccupancyPercent > rule.conditions.maxOccupancyPercent
      ) {
        matches = false;
      }

      // Day of week condition
      if (
        rule.conditions.daysOfWeek &&
        rule.conditions.daysOfWeek.length > 0 &&
        !rule.conditions.daysOfWeek.includes(dayOfWeek)
      ) {
        matches = false;
      }

      // Format condition
      if (
        rule.conditions.applicableFormat &&
        rule.conditions.applicableFormat !== context.format
      ) {
        matches = false;
      }

      // Time slot condition
      if (rule.conditions.timeSlotFrom && rule.conditions.timeSlotTo) {
        if (
          timeSlotStr < rule.conditions.timeSlotFrom ||
          timeSlotStr > rule.conditions.timeSlotTo
        ) {
          matches = false;
        }
      }

      if (matches) {
        cumulativeMultiplier *= rule.priceMultiplier;
        appliedRuleIds.push(rule.id);
      }
    }

    const calculatedPrice = Math.round(context.basePrice * cumulativeMultiplier);

    return {
      effectivePrice: calculatedPrice,
      appliedRuleIds,
      priceMultiplier: Number(cumulativeMultiplier.toFixed(2)),
    };
  }

  // ----------------------------------------------------------------------------
  // Device & IoT Platform Methods
  // ----------------------------------------------------------------------------

  public listDevices(theatreId?: string): DeviceRegistry[] {
    const all = Array.from(this.devices.values());
    if (!theatreId) return all;
    return all.filter((d) => d.theatreId === theatreId);
  }

  public getDeviceById(deviceId: string): DeviceRegistry | undefined {
    return this.devices.get(deviceId);
  }

  public registerDevice(device: DeviceRegistry): DeviceRegistry {
    this.devices.set(device.deviceId, device);
    return device;
  }

  public recordTelemetry(telemetry: DeviceTelemetry): void {
    const existing = this.telemetryLogs.get(telemetry.deviceId) || [];
    existing.unshift(telemetry);
    if (existing.length > 100) existing.pop();
    this.telemetryLogs.set(telemetry.deviceId, existing);

    // Update heartbeat
    const dev = this.devices.get(telemetry.deviceId);
    if (dev) {
      dev.lastHeartbeat = telemetry.timestamp;
      dev.status = "ONLINE";
    }
  }

  public getTelemetry(deviceId: string): DeviceTelemetry[] {
    return this.telemetryLogs.get(deviceId) || [];
  }

  // ----------------------------------------------------------------------------
  // Integration Platform Methods
  // ----------------------------------------------------------------------------

  public listApiClients(organizationId?: string): APIClient[] {
    const all = Array.from(this.apiClients.values());
    if (!organizationId) return all;
    return all.filter((c) => !c.organizationId || c.organizationId === organizationId);
  }

  public listWebhooks(theatreId?: string): WebhookSubscription[] {
    const all = Array.from(this.webhooks.values());
    if (!theatreId) return all;
    return all.filter((w) => !w.theatreId || w.theatreId === theatreId);
  }

  // ----------------------------------------------------------------------------
  // Seed Mock Enterprise Data
  // ----------------------------------------------------------------------------

  private seedEnterpriseData(): void {
    // 1. Organizations
    const orgGlobal: Organization = {
      id: "org-cinesphere-global",
      legalName: "CineSphere Entertainment Global Inc.",
      brandName: "CineSphere Global Cinemas",
      code: "CSG",
      tier: "GLOBAL_NETWORK",
      corporateHqAddress: {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400051",
        street: "Bandra Kurla Complex, Tower 4",
      },
      primaryContact: {
        name: "Arjun Singhania",
        email: "arjun.singhania@cinesphere.io",
        phone: "+91 22 6677 8899",
      },
      status: "ACTIVE",
      createdAt: "2025-01-10T00:00:00Z",
      updatedAt: "2026-11-01T00:00:00Z",
    };

    const orgCircuit: Organization = {
      id: "org-apex-circuit",
      legalName: "Apex Cinemas Private Limited",
      brandName: "Apex Multiplex Circuit",
      code: "APX",
      tier: "ENTERPRISE_CIRCUIT",
      corporateHqAddress: {
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        postalCode: "411006",
        street: "Koregaon Park Main Road",
      },
      primaryContact: {
        name: "Meera Deshmukh",
        email: "meera.deshmukh@apexcinemas.com",
        phone: "+91 20 2612 4400",
      },
      status: "ACTIVE",
      createdAt: "2025-03-15T00:00:00Z",
      updatedAt: "2026-11-01T00:00:00Z",
    };

    this.organizations.set(orgGlobal.id, orgGlobal);
    this.organizations.set(orgCircuit.id, orgCircuit);

    // 2. Regional Offices
    const regWest: RegionalOffice = {
      id: "reg-west-india",
      organizationId: "org-cinesphere-global",
      name: "West India Regional Directorate",
      regionCode: "IN-WEST",
      territoryCovered: ["Maharashtra", "Goa", "Gujarat"],
    };
    const regGcc: RegionalOffice = {
      id: "reg-gcc-dubai",
      organizationId: "org-cinesphere-global",
      name: "Middle East & GCC Office",
      regionCode: "ME-GCC",
      territoryCovered: ["UAE", "Saudi Arabia", "Qatar"],
    };
    this.regionalOffices.set(regWest.id, regWest);
    this.regionalOffices.set(regGcc.id, regGcc);

    // 3. Branches
    const branchPune: Branch = {
      id: "br-pun-001",
      organizationId: "org-cinesphere-global",
      theatreId: "th-pun-001",
      branchCode: "PUN-MAGARPATTA",
      branchName: "CineSphere Grand Cinemas (Pune)",
      regionalOfficeId: "reg-west-india",
      sharedBrandingEnabled: true,
      sharedConfigurationEnabled: true,
      status: "ACTIVE",
    };
    const branchMumbai: Branch = {
      id: "br-mum-002",
      organizationId: "org-cinesphere-global",
      theatreId: "th-mum-002",
      branchCode: "MUM-PHOENIX",
      branchName: "CineSphere IMAX Multiplex (Mumbai)",
      regionalOfficeId: "reg-west-india",
      sharedBrandingEnabled: true,
      sharedConfigurationEnabled: true,
      status: "ACTIVE",
    };
    const branchDubai: Branch = {
      id: "br-dxb-003",
      organizationId: "org-cinesphere-global",
      theatreId: "th-dxb-003",
      branchCode: "DXB-DOWNTOWN",
      branchName: "CineSphere Horizon Cinema (Dubai)",
      regionalOfficeId: "reg-gcc-dubai",
      sharedBrandingEnabled: true,
      sharedConfigurationEnabled: false,
      status: "ACTIVE",
    };

    this.branches.set(branchPune.id, branchPune);
    this.branches.set(branchMumbai.id, branchMumbai);
    this.branches.set(branchDubai.id, branchDubai);

    // 4. Franchise Agreements
    const franchise1: FranchiseAgreement = {
      id: "agr-franchise-pun-001",
      organizationId: "org-cinesphere-global",
      franchiseOwnerId: "fown-maharashtra-exhibitors",
      theatreId: "th-pun-001",
      agreementNumber: "FRAN-2025-089",
      revenueSharingPercent: 12.5,
      startDate: "2025-04-01T00:00:00Z",
      endDate: "2030-03-31T00:00:00Z",
      complianceStatus: "COMPLIANT",
    };
    this.franchiseAgreements.set(franchise1.id, franchise1);

    // 5. Corporate Accounts
    const corpAccount1: CorporateAccount = {
      id: "corp-tcs-001",
      organizationId: "org-cinesphere-global",
      theatreId: "th-pun-001",
      corporateName: "Tata Consultancy Services (TCS)",
      contractNumber: "B2B-TCS-2026-A",
      creditLimit: 500000,
      currentBalance: 125000,
      billingCycle: "MONTHLY",
      discountPercent: 15,
      status: "ACTIVE",
    };
    this.corporateAccounts.set(corpAccount1.id, corpAccount1);

    // 6. Membership Plans
    const planGold: MembershipPlan = {
      id: "plan-gold-vip",
      planCode: "VIP-GOLD-MONTHLY",
      name: "Gold Cinema Passport",
      tierLevel: "GOLD",
      organizationId: "org-cinesphere-global",
      priceAmount: 899,
      currency: "INR",
      billingPeriodMonths: 1,
      benefits: {
        complimentaryTicketsPerMonth: 4,
        discountPercentOnConcessions: 20,
        waiverBookingFee: true,
        priorityLoungeAccess: true,
      },
      expiryRules: {
        gracePeriodDays: 5,
        autoRenewEnabled: true,
      },
      status: "ACTIVE",
    };
    const planPlatinum: MembershipPlan = {
      id: "plan-platinum-black",
      planCode: "VIP-PLATINUM-ANNUAL",
      name: "Platinum Signature Passport",
      tierLevel: "VIP_BLACK",
      organizationId: "org-cinesphere-global",
      priceAmount: 8999,
      currency: "INR",
      billingPeriodMonths: 12,
      benefits: {
        complimentaryTicketsPerMonth: 8,
        discountPercentOnConcessions: 30,
        waiverBookingFee: true,
        priorityLoungeAccess: true,
      },
      expiryRules: {
        gracePeriodDays: 14,
        autoRenewEnabled: true,
      },
      status: "ACTIVE",
    };
    this.membershipPlans.set(planGold.id, planGold);
    this.membershipPlans.set(planPlatinum.id, planPlatinum);

    // 7. Loyalty Programs
    const loyaltyCinePoints: LoyaltyProgram = {
      id: "lp-cine-points",
      programName: "CineSphere Star Rewards",
      organizationId: "org-cinesphere-global",
      pointsEarnRatePerCurrencyUnit: 0.1, // 1 point per 10 INR
      pointsToCurrencyRedemptionRatio: 0.1, // 100 points = 10 INR
      tiers: [
        { tierName: "Silver", minPointsRequired: 0, pointsMultiplier: 1.0 },
        { tierName: "Gold", minPointsRequired: 1000, pointsMultiplier: 1.25 },
        { tierName: "Platinum", minPointsRequired: 5000, pointsMultiplier: 1.5 },
      ],
      pointExpiryMonths: 12,
      status: "ACTIVE",
    };
    this.loyaltyPrograms.set(loyaltyCinePoints.id, loyaltyCinePoints);

    // 8. Gift Cards
    const giftCard1: GiftCard = {
      id: "gc-card-1001",
      cardCodeMasked: "GC-••••-••••-7712",
      cardType: "DIGITAL",
      organizationId: "org-cinesphere-global",
      theatreId: "th-pun-001",
      initialAmount: 3000,
      currentBalance: 2450,
      currency: "INR",
      issuedAt: "2026-10-01T12:00:00Z",
      expiresAt: "2027-10-01T12:00:00Z",
      status: "ACTIVE",
    };
    this.giftCards.set(giftCard1.id, giftCard1);

    // 9. Dynamic Pricing Rules
    const surgeWeekend: DynamicPricingRule = {
      id: "rule-weekend-surge",
      ruleCode: "SURGE-WKND-PEAK",
      name: "Weekend Prime Time Peak Surge",
      ruleType: "DEMAND_SURGE",
      organizationId: "org-cinesphere-global",
      priority: 80,
      priceMultiplier: 1.25, // +25%
      conditions: {
        daysOfWeek: [5, 6, 0], // Fri, Sat, Sun
        timeSlotFrom: "18:00",
        timeSlotTo: "23:00",
        minOccupancyPercent: 70,
      },
      isActive: true,
    };
    const discountEarlyBird: DynamicPricingRule = {
      id: "rule-early-bird",
      ruleCode: "DISC-EARLY-BIRD",
      name: "Morning Early-Bird Special",
      ruleType: "EARLY_BIRD_DISCOUNT",
      organizationId: "org-cinesphere-global",
      priority: 50,
      priceMultiplier: 0.85, // -15%
      conditions: {
        timeSlotFrom: "08:00",
        timeSlotTo: "12:00",
      },
      isActive: true,
    };
    this.pricingRules.set(surgeWeekend.id, surgeWeekend);
    this.pricingRules.set(discountEarlyBird.id, discountEarlyBird);

    // 10. Devices & IoT
    const devSensor1: DeviceRegistry = {
      deviceId: "dev-sensor-hall1-01",
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      deviceType: "ENVIRONMENTAL_SENSOR",
      model: "EnviroSense-X200",
      ipAddress: "192.168.10.42",
      macAddress: "00:1A:2B:3C:4D:5E",
      status: "ONLINE",
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: "2.4.1",
      meta: { room: "Auditorium 1", targetTemp: 21.5 },
    };
    const devKiosk1: DeviceRegistry = {
      deviceId: "dev-kiosk-lobby-01",
      theatreId: "th-pun-001",
      deviceType: "KIOSK",
      model: "CineKiosk-TouchMax",
      ipAddress: "192.168.10.88",
      status: "ONLINE",
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: "4.0.2",
      meta: { location: "Main Concourse", screenSaver: "trailers" },
    };
    const devSignage1: DeviceRegistry = {
      deviceId: "dev-signage-ent-01",
      theatreId: "th-pun-001",
      deviceType: "LOBBY_DISPLAY",
      model: "Samsung-QLED-85",
      ipAddress: "192.168.10.99",
      status: "ONLINE",
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: "1.9.0",
      meta: { orientation: "PORTRAIT", assignedScreen: "Auditorium 1 Entrance" },
    };
    this.devices.set(devSensor1.deviceId, devSensor1);
    this.devices.set(devKiosk1.deviceId, devKiosk1);
    this.devices.set(devSignage1.deviceId, devSignage1);

    // Initial Telemetry
    this.telemetryLogs.set(devSensor1.deviceId, [
      {
        deviceId: devSensor1.deviceId,
        timestamp: new Date().toISOString(),
        metrics: {
          temperatureCelsius: 21.2,
          humidityPercent: 48,
          powerWatts: 15,
        },
      },
    ]);

    // 11. API Clients
    const b2bClient: APIClient = {
      clientId: "client-ticketing-aggregator",
      clientName: "Aggregator Ticketing Network",
      organizationId: "org-cinesphere-global",
      keyPrefix: "csp_live_agg",
      hashedSecret: "sha256_mock_hash_98741",
      allowedScopes: ["SHOWS_READ", "BOOKINGS_READ", "BOOKINGS_WRITE"],
      rateLimitTier: "HIGH_VOLUME",
      isActive: true,
      createdAt: "2026-02-01T00:00:00Z",
      lastUsedAt: new Date().toISOString(),
    };
    this.apiClients.set(b2bClient.clientId, b2bClient);

    // 12. Webhooks
    const webhookBooking: WebhookSubscription = {
      id: "wh-booking-sync-01",
      name: "Corporate ERP Booking Sync",
      organizationId: "org-cinesphere-global",
      targetUrl: "https://erp.cinesphere-corp.internal/webhooks/bookings",
      subscribedEvents: ["BOOKING_CONFIRMED", "BOOKING_CANCELLED", "PAYMENT_COMPLETED"],
      secretSignatureKey: "whsec_mock_signature_key_9901",
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplierSec: 5,
      },
      isActive: true,
    };
    this.webhooks.set(webhookBooking.id, webhookBooking);
  }

  /**
   * Reset repository to initial seed (for testing).
   */
  public reset(): void {
    this.organizations.clear();
    this.regionalOffices.clear();
    this.branchGroups.clear();
    this.branches.clear();
    this.franchiseAgreements.clear();
    this.corporateAccounts.clear();
    this.membershipPlans.clear();
    this.giftCards.clear();
    this.loyaltyPrograms.clear();
    this.pricingRules.clear();
    this.devices.clear();
    this.telemetryLogs.clear();
    this.apiClients.clear();
    this.webhooks.clear();
    this.seedEnterpriseData();
  }
}

export const enterpriseExtensionsRepository = EnterpriseExtensionsRepository.getInstance();
