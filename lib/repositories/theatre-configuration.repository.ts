import { BaseRepository } from "./base.repository";
import type {
  TheatreConfigurationRecord,
  LocalizationConfigurationRecord,
  BookingConfigurationRecord,
  CancellationConfigurationRecord,
  RefundConfigurationRecord,
  AgeRestrictionConfigurationRecord,
  FeatureFlagConfigurationRecord,
  ConfigurationTermsRecord,
  ConfigurationVersionRecord,
  TheatreConfigurationBundle,
  CreateTheatreConfigurationInput,
  UpdateLocalizationConfigInput,
  UpdateBookingConfigInput,
  UpdateCancellationConfigInput,
  UpdateRefundConfigInput,
  UpdateAgeRestrictionConfigInput,
  UpdateFeatureFlagsInput,
  UpdateConfigurationTermsInput,
  PublishTheatreConfigurationInput,
  RestoreConfigurationVersionInput,
} from "@/types/theatre-configuration.types";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Theatre Configuration Repository (Phase 3 – Part 9)
 * ==============================================================================
 * Normalized, strongly typed independent entities for Localization, Booking Rules,
 * Cancellation, Refund Policies, Age Restrictions, Feature Flags, and Terms.
 * Pre-seeded with Theatre A (Pune INR), Theatre B (USD/Spanish), and Theatre C (AED/Arabic).
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Seed Theatre A: Pune Flagship (th-pun-001) - INR, 30 Days, Max 8, Cancellation Allowed
// ------------------------------------------------------------------------------
const SEED_PUN_CONFIG: TheatreConfigurationRecord = {
  id: "cfg-pun-001",
  theatreId: "th-pun-001",
  status: "PUBLISHED",
  version: 1,
  publishedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdBy: "usr-super-1",
  updatedBy: "usr-th-pun",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_LOC: LocalizationConfigurationRecord = {
  id: "loc-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  currency: "INR",
  timezone: "Asia/Kolkata",
  primaryLanguage: "en",
  supportedLanguages: ["en", "hi", "mr"],
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12H",
  numberFormat: "INDIAN",
  measurementUnits: "METRIC",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_BOOKING: BookingConfigurationRecord = {
  id: "bk-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  maxSeatsPerBooking: 8,
  minSeatsPerBooking: 1,
  advanceBookingDays: 30,
  bookingCutoffMinutes: 15,
  maxConcurrentBookingsPerUser: 3,
  seatHoldDurationSeconds: 600,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_CANCEL: CancellationConfigurationRecord = {
  id: "cnc-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  cancellationAllowed: true,
  cancellationDeadlineMinutes: 120,
  cancellationFeePercent: "10.00",
  autoCancellationEnabled: false,
  autoCancellationTimeoutMinutes: null,
  notes: "Tickets can be cancelled up to 2 hours prior to showtime subject to 10% nominal cancellation fee.",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_REFUND: RefundConfigurationRecord = {
  id: "ref-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  refundWindowHours: 24,
  refundPercentage: "90.00",
  refundMethod: "ORIGINAL_PAYMENT",
  processingTimeDays: 5,
  gatewayAutoRefund: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_AGE: AgeRestrictionConfigurationRecord = {
  id: "age-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  minAgeU: 0,
  minAgeUA: 12,
  minAgeA: 18,
  minAgeS: 18,
  customAgeRules: "Valid government photo ID proof required for 'A' rated screenings.",
  guardianRequiredUnderAge: 12,
  requireAgeVerificationAtGate: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_FLAGS: FeatureFlagConfigurationRecord = {
  id: "ff-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  enableLoyalty: true,
  enableCoupons: true,
  enableGiftCards: true,
  enableMemberships: true,
  enableDynamicPricing: true,
  enableAiRecommendations: true,
  enableWaitlist: false,
  customFlags: {},
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_TERMS: ConfigurationTermsRecord = {
  id: "trm-pun-001",
  configurationId: "cfg-pun-001",
  theatreId: "th-pun-001",
  bookingTerms: "Standard CineSphere Exhibition Booking Terms: All admissions subject to auditorium capacity.",
  refundTerms: "Refunds processed to original banking rails within 5-7 business days.",
  privacyNotice: "Guest data processed under Indian Digital Personal Data Protection Act standards.",
  customerAgreement: "By proceeding with seat reservation, the patron accepts auditorium house rules.",
  version: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// ------------------------------------------------------------------------------
// Seed Theatre B: International Circuit (th-mum-001 configured as USD/Spanish)
// ------------------------------------------------------------------------------
const SEED_MUM_CONFIG: TheatreConfigurationRecord = {
  id: "cfg-mum-001",
  theatreId: "th-mum-001",
  status: "PUBLISHED",
  version: 1,
  publishedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdBy: "usr-super-1",
  updatedBy: "usr-th-mum",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_LOC: LocalizationConfigurationRecord = {
  id: "loc-mum-001",
  configurationId: "cfg-mum-001",
  theatreId: "th-mum-001",
  currency: "USD",
  timezone: "America/New_York",
  primaryLanguage: "es",
  supportedLanguages: ["es", "en"],
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12H",
  numberFormat: "INTERNATIONAL",
  measurementUnits: "IMPERIAL",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_BOOKING: BookingConfigurationRecord = {
  id: "bk-mum-001",
  configurationId: "cfg-mum-001",
  theatreId: "th-mum-001",
  maxSeatsPerBooking: 12,
  minSeatsPerBooking: 1,
  advanceBookingDays: 60,
  bookingCutoffMinutes: 30,
  maxConcurrentBookingsPerUser: 5,
  seatHoldDurationSeconds: 900,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_CANCEL: CancellationConfigurationRecord = {
  id: "cnc-mum-001",
  configurationId: "cfg-mum-001",
  theatreId: "th-mum-001",
  cancellationAllowed: false, // Strict no cancellation as specified
  cancellationDeadlineMinutes: 0,
  cancellationFeePercent: "100.00",
  autoCancellationEnabled: false,
  autoCancellationTimeoutMinutes: null,
  notes: "All sales final. No cancellations permitted.",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export class TheatreConfigurationRepository extends BaseRepository<TheatreConfigurationRecord> {
  protected entityName = "TheatreConfiguration";
  protected tableName = "theatre_configurations";

  private configsStore: Map<string, TheatreConfigurationRecord> = new Map();
  private localizationsStore: Map<string, LocalizationConfigurationRecord> = new Map(); // configId -> record
  private bookingsStore: Map<string, BookingConfigurationRecord> = new Map(); // configId -> record
  private cancellationsStore: Map<string, CancellationConfigurationRecord> = new Map(); // configId -> record
  private refundsStore: Map<string, RefundConfigurationRecord> = new Map(); // configId -> record
  private ageRestrictionsStore: Map<string, AgeRestrictionConfigurationRecord> = new Map(); // configId -> record
  private featureFlagsStore: Map<string, FeatureFlagConfigurationRecord> = new Map(); // configId -> record
  private termsStore: Map<string, ConfigurationTermsRecord> = new Map(); // configId -> record
  private versionsStore: ConfigurationVersionRecord[] = [];

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    // Seed Pune
    this.configsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_CONFIG });
    this.localizationsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_LOC });
    this.bookingsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_BOOKING });
    this.cancellationsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_CANCEL });
    this.refundsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_REFUND });
    this.ageRestrictionsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_AGE });
    this.featureFlagsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_FLAGS });
    this.termsStore.set(SEED_PUN_CONFIG.id, { ...SEED_PUN_TERMS });

    this.versionsStore.push({
      id: "ver-cfg-pun-001",
      configurationId: SEED_PUN_CONFIG.id,
      theatreId: SEED_PUN_CONFIG.theatreId,
      versionNumber: 1,
      snapshot: {
        config: { ...SEED_PUN_CONFIG },
        localization: { ...SEED_PUN_LOC },
        booking: { ...SEED_PUN_BOOKING },
        cancellation: { ...SEED_PUN_CANCEL },
        refund: { ...SEED_PUN_REFUND },
        ageRestriction: { ...SEED_PUN_AGE },
        featureFlags: { ...SEED_PUN_FLAGS },
        terms: { ...SEED_PUN_TERMS },
      },
      changeSummary: "Initial publication of Pune Flagship operational configuration.",
      changedBy: "usr-super-1",
      changedRole: "SUPER_ADMIN",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    // Seed Mumbai (USD, Spanish, No cancellation)
    this.configsStore.set(SEED_MUM_CONFIG.id, { ...SEED_MUM_CONFIG });
    this.localizationsStore.set(SEED_MUM_CONFIG.id, { ...SEED_MUM_LOC });
    this.bookingsStore.set(SEED_MUM_CONFIG.id, { ...SEED_MUM_BOOKING });
    this.cancellationsStore.set(SEED_MUM_CONFIG.id, { ...SEED_MUM_CANCEL });
  }

  // ----------------------------------------------------------------------------
  // Base Repository Implementation
  // ----------------------------------------------------------------------------
  public async findById(id: string): Promise<TheatreConfigurationRecord | null> {
    const c = this.configsStore.get(id);
    return c ? { ...c } : null;
  }

  public async findAll(): Promise<TheatreConfigurationRecord[]> {
    return Array.from(this.configsStore.values()).map((c) => ({ ...c }));
  }

  public async create(data: TheatreConfigurationRecord): Promise<TheatreConfigurationRecord> {
    this.configsStore.set(data.id, { ...data });
    return { ...data };
  }

  public async update(id: string, data: Partial<TheatreConfigurationRecord>): Promise<TheatreConfigurationRecord | null> {
    const existing = this.configsStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.configsStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.configsStore.get(id);
    if (!existing) return false;
    this.configsStore.delete(id);
    this.localizationsStore.delete(id);
    this.bookingsStore.delete(id);
    this.cancellationsStore.delete(id);
    this.refundsStore.delete(id);
    this.ageRestrictionsStore.delete(id);
    this.featureFlagsStore.delete(id);
    this.termsStore.delete(id);
    return true;
  }

  // ----------------------------------------------------------------------------
  // Domain Query Methods
  // ----------------------------------------------------------------------------
  public async findByTheatreId(theatreId: string): Promise<TheatreConfigurationRecord | null> {
    for (const c of this.configsStore.values()) {
      if (c.theatreId === theatreId) return { ...c };
    }
    return null;
  }

  public async findBundle(theatreId: string): Promise<TheatreConfigurationBundle> {
    const config = await this.findByTheatreId(theatreId);
    if (!config) {
      return {
        configuration: null,
        localization: null,
        booking: null,
        cancellation: null,
        refund: null,
        ageRestriction: null,
        featureFlags: null,
        terms: null,
        versions: [],
      };
    }

    const localization = this.localizationsStore.get(config.id) || null;
    const booking = this.bookingsStore.get(config.id) || null;
    const cancellation = this.cancellationsStore.get(config.id) || null;
    const refund = this.refundsStore.get(config.id) || null;
    const ageRestriction = this.ageRestrictionsStore.get(config.id) || null;
    const featureFlags = this.featureFlagsStore.get(config.id) || null;
    const terms = this.termsStore.get(config.id) || null;

    const versions = this.versionsStore
      .filter((v) => v.theatreId === theatreId || v.configurationId === config.id)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));

    return {
      configuration: { ...config },
      localization: localization ? { ...localization } : null,
      booking: booking ? { ...booking } : null,
      cancellation: cancellation ? { ...cancellation } : null,
      refund: refund ? { ...refund } : null,
      ageRestriction: ageRestriction ? { ...ageRestriction } : null,
      featureFlags: featureFlags ? { ...featureFlags } : null,
      terms: terms ? { ...terms } : null,
      versions,
    };
  }

  // ----------------------------------------------------------------------------
  // Domain Mutation Methods
  // ----------------------------------------------------------------------------
  public async upsertConfiguration(
    input: CreateTheatreConfigurationInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreConfigurationBundle> {
    let config = await this.findByTheatreId(input.theatreId);
    const now = new Date();

    if (!config) {
      const configId = `cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      config = {
        id: configId,
        theatreId: input.theatreId,
        status: input.status || "DRAFT",
        version: 1,
        publishedAt: input.status === "PUBLISHED" ? now : null,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: now,
        updatedAt: now,
      };
      this.configsStore.set(configId, config);

      // Initialize child records
      const locId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.localizationsStore.set(configId, {
        id: locId,
        configurationId: configId,
        theatreId: input.theatreId,
        currency: input.localization?.currency || "INR",
        timezone: input.localization?.timezone || "Asia/Kolkata",
        primaryLanguage: input.localization?.primaryLanguage || "en",
        supportedLanguages: input.localization?.supportedLanguages || ["en"],
        dateFormat: input.localization?.dateFormat || "DD/MM/YYYY",
        timeFormat: input.localization?.timeFormat || "12H",
        numberFormat: input.localization?.numberFormat || "INDIAN",
        measurementUnits: input.localization?.measurementUnits || "METRIC",
        createdAt: now,
        updatedAt: now,
      });

      const bkId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.bookingsStore.set(configId, {
        id: bkId,
        configurationId: configId,
        theatreId: input.theatreId,
        maxSeatsPerBooking: input.booking?.maxSeatsPerBooking || 10,
        minSeatsPerBooking: input.booking?.minSeatsPerBooking || 1,
        advanceBookingDays: input.booking?.advanceBookingDays || 30,
        bookingCutoffMinutes: input.booking?.bookingCutoffMinutes || 15,
        maxConcurrentBookingsPerUser: input.booking?.maxConcurrentBookingsPerUser || 3,
        seatHoldDurationSeconds: input.booking?.seatHoldDurationSeconds || 600,
        createdAt: now,
        updatedAt: now,
      });

      const cncId = `cnc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.cancellationsStore.set(configId, {
        id: cncId,
        configurationId: configId,
        theatreId: input.theatreId,
        cancellationAllowed: input.cancellation?.cancellationAllowed ?? true,
        cancellationDeadlineMinutes: input.cancellation?.cancellationDeadlineMinutes || 120,
        cancellationFeePercent: input.cancellation?.cancellationFeePercent || "10.00",
        autoCancellationEnabled: input.cancellation?.autoCancellationEnabled || false,
        autoCancellationTimeoutMinutes: input.cancellation?.autoCancellationTimeoutMinutes || null,
        notes: input.cancellation?.notes || null,
        createdAt: now,
        updatedAt: now,
      });

      const refId = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.refundsStore.set(configId, {
        id: refId,
        configurationId: configId,
        theatreId: input.theatreId,
        refundWindowHours: input.refund?.refundWindowHours || 24,
        refundPercentage: input.refund?.refundPercentage || "90.00",
        refundMethod: input.refund?.refundMethod || "ORIGINAL_PAYMENT",
        processingTimeDays: input.refund?.processingTimeDays || 5,
        gatewayAutoRefund: input.refund?.gatewayAutoRefund ?? true,
        createdAt: now,
        updatedAt: now,
      });

      const ageId = `age-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.ageRestrictionsStore.set(configId, {
        id: ageId,
        configurationId: configId,
        theatreId: input.theatreId,
        minAgeU: input.ageRestriction?.minAgeU ?? 0,
        minAgeUA: input.ageRestriction?.minAgeUA ?? 12,
        minAgeA: input.ageRestriction?.minAgeA ?? 18,
        minAgeS: input.ageRestriction?.minAgeS ?? 18,
        customAgeRules: input.ageRestriction?.customAgeRules || null,
        guardianRequiredUnderAge: input.ageRestriction?.guardianRequiredUnderAge || 12,
        requireAgeVerificationAtGate: input.ageRestriction?.requireAgeVerificationAtGate ?? true,
        createdAt: now,
        updatedAt: now,
      });

      const ffId = `ff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.featureFlagsStore.set(configId, {
        id: ffId,
        configurationId: configId,
        theatreId: input.theatreId,
        enableLoyalty: input.featureFlags?.enableLoyalty ?? true,
        enableCoupons: input.featureFlags?.enableCoupons ?? true,
        enableGiftCards: input.featureFlags?.enableGiftCards ?? true,
        enableMemberships: input.featureFlags?.enableMemberships ?? true,
        enableDynamicPricing: input.featureFlags?.enableDynamicPricing ?? true,
        enableAiRecommendations: input.featureFlags?.enableAiRecommendations ?? false,
        enableWaitlist: input.featureFlags?.enableWaitlist ?? false,
        customFlags: input.featureFlags?.customFlags || {},
        createdAt: now,
        updatedAt: now,
      });

      const trmId = `trm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.termsStore.set(configId, {
        id: trmId,
        configurationId: configId,
        theatreId: input.theatreId,
        bookingTerms: input.terms?.bookingTerms || "Standard CineSphere Exhibition Booking Terms.",
        refundTerms: input.terms?.refundTerms || "Refunds processed within 5 business days.",
        privacyNotice: input.terms?.privacyNotice || null,
        customerAgreement: input.terms?.customerAgreement || "Agreement with CineSphere house rules.",
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      const bundle = await this.findBundle(input.theatreId);
      await this.recordVersion(
        input.theatreId,
        configId,
        "CONFIG_PROVISIONED",
        "Initial creation of theatre configuration profile.",
        bundle as unknown as Record<string, unknown>,
        actorId,
        actorRole
      );

      return bundle;
    }

    return await this.findBundle(input.theatreId);
  }

  public async updateLocalization(
    input: UpdateLocalizationConfigInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<LocalizationConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.localizationsStore.get(config.id);
    const now = new Date();

    const updated: LocalizationConfigurationRecord = {
      id: current?.id || `loc-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      currency: input.currency ?? current?.currency ?? "INR",
      timezone: input.timezone ?? current?.timezone ?? "Asia/Kolkata",
      primaryLanguage: input.primaryLanguage ?? current?.primaryLanguage ?? "en",
      supportedLanguages: input.supportedLanguages ?? current?.supportedLanguages ?? ["en"],
      dateFormat: input.dateFormat ?? current?.dateFormat ?? "DD/MM/YYYY",
      timeFormat: input.timeFormat ?? current?.timeFormat ?? "12H",
      numberFormat: input.numberFormat ?? current?.numberFormat ?? "INDIAN",
      measurementUnits: input.measurementUnits ?? current?.measurementUnits ?? "METRIC",
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.localizationsStore.set(config.id, updated);

    // Bump config version
    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "LOCALIZATION_UPDATED",
      `Updated currency to ${updated.currency}, timezone to ${updated.timezone}.`,
      { localization: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateBooking(
    input: UpdateBookingConfigInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<BookingConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.bookingsStore.get(config.id);
    const now = new Date();

    const updated: BookingConfigurationRecord = {
      id: current?.id || `bk-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      maxSeatsPerBooking: input.maxSeatsPerBooking ?? current?.maxSeatsPerBooking ?? 10,
      minSeatsPerBooking: input.minSeatsPerBooking ?? current?.minSeatsPerBooking ?? 1,
      advanceBookingDays: input.advanceBookingDays ?? current?.advanceBookingDays ?? 30,
      bookingCutoffMinutes: input.bookingCutoffMinutes ?? current?.bookingCutoffMinutes ?? 15,
      maxConcurrentBookingsPerUser: input.maxConcurrentBookingsPerUser ?? current?.maxConcurrentBookingsPerUser ?? 3,
      seatHoldDurationSeconds: input.seatHoldDurationSeconds ?? current?.seatHoldDurationSeconds ?? 600,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.bookingsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "BOOKING_RULES_CHANGED",
      `Updated advance booking window to ${updated.advanceBookingDays} days, max seats to ${updated.maxSeatsPerBooking}.`,
      { booking: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateCancellation(
    input: UpdateCancellationConfigInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<CancellationConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.cancellationsStore.get(config.id);
    const now = new Date();

    const updated: CancellationConfigurationRecord = {
      id: current?.id || `cnc-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      cancellationAllowed: input.cancellationAllowed ?? current?.cancellationAllowed ?? true,
      cancellationDeadlineMinutes: input.cancellationDeadlineMinutes ?? current?.cancellationDeadlineMinutes ?? 120,
      cancellationFeePercent: input.cancellationFeePercent ?? current?.cancellationFeePercent ?? "10.00",
      autoCancellationEnabled: input.autoCancellationEnabled ?? current?.autoCancellationEnabled ?? false,
      autoCancellationTimeoutMinutes: input.autoCancellationTimeoutMinutes !== undefined ? input.autoCancellationTimeoutMinutes : (current?.autoCancellationTimeoutMinutes || null),
      notes: input.notes !== undefined ? input.notes : (current?.notes || null),
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.cancellationsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "CANCELLATION_RULES_CHANGED",
      `Updated cancellation allowed to ${updated.cancellationAllowed}, fee ${updated.cancellationFeePercent}%.`,
      { cancellation: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateRefund(
    input: UpdateRefundConfigInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<RefundConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.refundsStore.get(config.id);
    const now = new Date();

    const updated: RefundConfigurationRecord = {
      id: current?.id || `ref-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      refundWindowHours: input.refundWindowHours ?? current?.refundWindowHours ?? 24,
      refundPercentage: input.refundPercentage ?? current?.refundPercentage ?? "90.00",
      refundMethod: input.refundMethod ?? current?.refundMethod ?? "ORIGINAL_PAYMENT",
      processingTimeDays: input.processingTimeDays ?? current?.processingTimeDays ?? 5,
      gatewayAutoRefund: input.gatewayAutoRefund ?? current?.gatewayAutoRefund ?? true,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.refundsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "REFUND_RULES_CHANGED",
      `Updated refund window to ${updated.refundWindowHours}h, refund percentage to ${updated.refundPercentage}%.`,
      { refund: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateAgeRestriction(
    input: UpdateAgeRestrictionConfigInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<AgeRestrictionConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.ageRestrictionsStore.get(config.id);
    const now = new Date();

    const updated: AgeRestrictionConfigurationRecord = {
      id: current?.id || `age-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      minAgeU: input.minAgeU ?? current?.minAgeU ?? 0,
      minAgeUA: input.minAgeUA ?? current?.minAgeUA ?? 12,
      minAgeA: input.minAgeA ?? current?.minAgeA ?? 18,
      minAgeS: input.minAgeS ?? current?.minAgeS ?? 18,
      customAgeRules: input.customAgeRules !== undefined ? input.customAgeRules : (current?.customAgeRules || null),
      guardianRequiredUnderAge: input.guardianRequiredUnderAge !== undefined ? input.guardianRequiredUnderAge : (current?.guardianRequiredUnderAge || 12),
      requireAgeVerificationAtGate: input.requireAgeVerificationAtGate ?? current?.requireAgeVerificationAtGate ?? true,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.ageRestrictionsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "AGE_RESTRICTIONS_CHANGED",
      `Updated age restrictions (U:${updated.minAgeU}, UA:${updated.minAgeUA}, A:${updated.minAgeA}).`,
      { ageRestriction: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateFeatureFlags(
    input: UpdateFeatureFlagsInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<FeatureFlagConfigurationRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.featureFlagsStore.get(config.id);
    const now = new Date();

    const updated: FeatureFlagConfigurationRecord = {
      id: current?.id || `ff-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      enableLoyalty: input.enableLoyalty ?? current?.enableLoyalty ?? true,
      enableCoupons: input.enableCoupons ?? current?.enableCoupons ?? true,
      enableGiftCards: input.enableGiftCards ?? current?.enableGiftCards ?? true,
      enableMemberships: input.enableMemberships ?? current?.enableMemberships ?? true,
      enableDynamicPricing: input.enableDynamicPricing ?? current?.enableDynamicPricing ?? true,
      enableAiRecommendations: input.enableAiRecommendations ?? current?.enableAiRecommendations ?? false,
      enableWaitlist: input.enableWaitlist ?? current?.enableWaitlist ?? false,
      customFlags: input.customFlags || current?.customFlags || {},
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.featureFlagsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "FEATURE_FLAG_UPDATED",
      "Updated theatre feature flags and module toggles.",
      { featureFlags: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async updateTerms(
    input: UpdateConfigurationTermsInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<ConfigurationTermsRecord> {
    let config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      await this.upsertConfiguration({ theatreId: input.theatreId }, actorId, actorRole);
      config = (await this.findByTheatreId(input.theatreId))!;
    }

    const current = this.termsStore.get(config.id);
    const now = new Date();

    const updated: ConfigurationTermsRecord = {
      id: current?.id || `trm-${Date.now()}`,
      configurationId: config.id,
      theatreId: input.theatreId,
      bookingTerms: input.bookingTerms ?? current?.bookingTerms ?? "Standard booking terms.",
      refundTerms: input.refundTerms ?? current?.refundTerms ?? "Standard refund terms.",
      privacyNotice: input.privacyNotice !== undefined ? input.privacyNotice : (current?.privacyNotice || null),
      customerAgreement: input.customerAgreement ?? current?.customerAgreement ?? "Standard customer agreement.",
      version: (current?.version || 1) + 1,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };
    this.termsStore.set(config.id, updated);

    const nextVer = config.version + 1;
    this.configsStore.set(config.id, { ...config, version: nextVer, updatedAt: now });

    await this.recordVersion(
      input.theatreId,
      config.id,
      "TERMS_UPDATED",
      `Updated terms & conditions (version v${updated.version}).`,
      { terms: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async publishConfiguration(
    input: PublishTheatreConfigurationInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreConfigurationRecord> {
    const config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      throw new Error(`Configuration not found for theatre '${input.theatreId}'.`);
    }

    if (input.expectedVersion !== undefined && config.version !== input.expectedVersion) {
      throw new Error(
        `Optimistic lock failure: Configuration was modified. Expected v${input.expectedVersion}, found v${config.version}.`
      );
    }

    const now = new Date();
    const updated: TheatreConfigurationRecord = {
      ...config,
      status: "PUBLISHED",
      publishedAt: now,
      version: config.version + 1,
      updatedBy: actorId,
      updatedAt: now,
    };
    this.configsStore.set(config.id, updated);

    const bundle = await this.findBundle(input.theatreId);
    await this.recordVersion(
      input.theatreId,
      config.id,
      "CONFIG_PUBLISHED",
      input.summary || `Published configuration version v${updated.version}.`,
      bundle as unknown as Record<string, unknown>,
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async restoreVersion(
    input: RestoreConfigurationVersionInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreConfigurationBundle> {
    const config = await this.findByTheatreId(input.theatreId);
    if (!config) {
      throw new Error(`Configuration not found for theatre '${input.theatreId}'.`);
    }

    const versionRecord = this.versionsStore.find(
      (v) => (v.theatreId === input.theatreId || v.configurationId === config.id) && v.versionNumber === input.versionNumber
    );

    if (!versionRecord || !versionRecord.snapshot) {
      throw new Error(`Version v${input.versionNumber} snapshot not found for theatre '${input.theatreId}'.`);
    }

    const snap = versionRecord.snapshot as Record<string, unknown>;
    const now = new Date();
    const nextVer = config.version + 1;

    // Restore components from snapshot if present
    if (snap.localization) {
      this.localizationsStore.set(config.id, {
        ...(snap.localization as LocalizationConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.booking) {
      this.bookingsStore.set(config.id, {
        ...(snap.booking as BookingConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.cancellation) {
      this.cancellationsStore.set(config.id, {
        ...(snap.cancellation as CancellationConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.refund) {
      this.refundsStore.set(config.id, {
        ...(snap.refund as RefundConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.ageRestriction) {
      this.ageRestrictionsStore.set(config.id, {
        ...(snap.ageRestriction as AgeRestrictionConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.featureFlags) {
      this.featureFlagsStore.set(config.id, {
        ...(snap.featureFlags as FeatureFlagConfigurationRecord),
        updatedAt: now,
      });
    }
    if (snap.terms) {
      this.termsStore.set(config.id, {
        ...(snap.terms as ConfigurationTermsRecord),
        updatedAt: now,
      });
    }

    const updatedConfig: TheatreConfigurationRecord = {
      ...config,
      status: "DRAFT",
      version: nextVer,
      updatedBy: actorId,
      updatedAt: now,
    };
    this.configsStore.set(config.id, updatedConfig);

    const bundle = await this.findBundle(input.theatreId);
    await this.recordVersion(
      input.theatreId,
      config.id,
      "CONFIG_VERSION_RESTORED",
      `Restored configuration snapshot from version v${input.versionNumber}.`,
      bundle as unknown as Record<string, unknown>,
      actorId,
      actorRole
    );

    return bundle;
  }

  public async recordVersion(
    theatreId: string,
    configurationId: string,
    changeType: string,
    changeSummary: string,
    snapshot: Record<string, unknown>,
    changedBy: string = "system",
    changedRole: string = "THEATRE_ADMIN"
  ): Promise<ConfigurationVersionRecord> {
    const existing = this.versionsStore.filter(
      (v) => v.theatreId === theatreId || v.configurationId === configurationId
    );
    const nextVer = existing.length + 1;

    const record: ConfigurationVersionRecord = {
      id: `ver-cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      configurationId,
      theatreId,
      versionNumber: nextVer,
      snapshot,
      changeSummary,
      changedBy,
      changedRole,
      createdAt: new Date(),
    };
    this.versionsStore.push(record);
    return { ...record };
  }

  public async getVersions(theatreId: string): Promise<ConfigurationVersionRecord[]> {
    return this.versionsStore
      .filter((v) => v.theatreId === theatreId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));
  }
}

export const theatreConfigurationRepository = new TheatreConfigurationRepository();
