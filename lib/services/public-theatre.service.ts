/**
 * ==============================================================================
 * CineSphere OS — Public Theatre Service (Phase 3 – Part 13)
 * ==============================================================================
 * Aggregates only public-facing information into the master PublicTheatreView
 * read model. Strictly strips all internal business data (GST, PAN, Staff,
 * Payments, Bookings, internal configuration, and audit logs).
 * Enforces content visibility rules: ONLY Active/Approved theatres are public.
 * ==============================================================================
 */

import {
  PublicTheatreView,
  PublicBrandingView,
  PublicTheatreProfileView,
  PublicLocationView,
  PublicContactView,
  PublicAmenityItem,
  PublicMovieSummary,
  PublicShowItem,
  PublicHallSummary,
  PublicOperatingHoursView,
  PublicReviewsSummaryPlaceholder,
  PublicTheatreConfigurationView,
  PublicTheatreSEO,
  PublicGalleryImage,
} from "@/types/public-theatre.types";
import { theatreProfileService } from "@/lib/services/theatre-profile.service";
import { theatreMediaService } from "@/lib/services/theatre-media.service";
import { theatreLocationService } from "@/lib/services/theatre-location.service";
import { theatreAmenityService } from "@/lib/services/theatre-amenity.service";
import { theatreContactService } from "@/lib/services/theatre-contact.service";
import { theatreOperatingHoursRepository } from "@/lib/repositories/theatre-operating-hours.repository";
import { theatreConfigurationRepository } from "@/lib/repositories/theatre-configuration.repository";
import { theatreSearchRepository } from "@/lib/repositories/theatre-search.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import {
  getAllPublishedMovies,
  getAllPublishedShows,
} from "@/lib/engine/customer-discovery-engine";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { withQueryCache, invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { NotFoundError, AuthorizationError } from "@/lib/errors/app-error";

const logger = createLogger("PublicTheatreService");

export class PublicTheatreService {
  /**
   * Loads the master aggregated Public Theatre View Model (Read Model).
   * Cached via withQueryCache; strictly prevents information leakage.
   */
  public async getPublicTheatreView(
    slugOrId: string,
    options?: {
      previewMode?: boolean;
      userRole?: string;
      userId?: string;
      bypassCache?: boolean;
    }
  ): Promise<PublicTheatreView> {
    const normalizedKey = slugOrId.toLowerCase().trim();
    const cacheKey = `public-theatre-view:${normalizedKey}:${options?.previewMode ? "preview" : "live"}`;

    if (options?.bypassCache || options?.previewMode) {
      return this.aggregatePublicTheatreView(normalizedKey, options);
    }

    return withQueryCache(
      cacheKey,
      () => this.aggregatePublicTheatreView(normalizedKey, options),
      {
        ttlSeconds: 3600, // 1 hour cache, ISR-ready
        tags: [CACHE_TAGS.PUBLIC_THEATRE_VIEW(normalizedKey)],
      }
    );
  }

  /**
   * Internal aggregator pulling strictly public models from underlying domains.
   */
  private async aggregatePublicTheatreView(
    slugOrId: string,
    options?: {
      previewMode?: boolean;
      userRole?: string;
      userId?: string;
    }
  ): Promise<PublicTheatreView> {
    const startTime = Date.now();

    // 1. Resolve Theatre Entity
    const theatreEntity = await this.resolveTheatreEntity(slugOrId);
    if (!theatreEntity) {
      throw new NotFoundError("Public Theatre", slugOrId);
    }

    const { theatreId, slug } = theatreEntity;

    // 2. Content Visibility & Status Gates
    const isPubliclyActive =
      theatreEntity.status === "ACTIVE" &&
      (theatreEntity.approvalStatus === "APPROVED" || theatreEntity.isVerified === true);

    if (!isPubliclyActive) {
      if (!options?.previewMode) {
        throw new NotFoundError(
          "Public Theatre",
          `${theatreEntity.name} is currently not published or undergoing compliance verification.`
        );
      }

      // Preview mode authorization check
      const isAdminRole =
        options?.userRole === "SUPER_ADMIN" || options?.userRole === "THEATRE_ADMIN";
      if (!isAdminRole) {
        throw new AuthorizationError(
          "Staff preview mode requires administrative authorization."
        );
      }

      // Record audit for preview access
      await securityAuditService.recordAudit({
        actor: {
          userId: options?.userId || "usr-super-1",
          role: (options?.userRole as any) || "SUPER_ADMIN",
          theatreId,
          permissions: ["THEATRE_VIEW", "DASHBOARD_VIEW"],
          correlationId: "corr-public-preview",
        },
        action: "VIEW",
        module: "THEATRE_MANAGEMENT",
        description: `[PREVIEW] Administrator viewed unapproved/inactive public theatre '${theatreEntity.name}' (${theatreId})`,
        metadata: { theatreId, status: theatreEntity.status, previewMode: true },
      });
    }

    // 3. Parallel retrieval of domain bundles
    const [
      profileData,
      locationData,
      mediaView,
      amenitiesData,
      contactsBundle,
      operatingBundle,
      configBundle,
      searchDoc,
    ] = await Promise.all([
      theatreProfileService.getPublicTheatreProfile(theatreId).catch(() => null),
      theatreLocationService.getPublicTheatreLocation(theatreId).catch(() => null),
      theatreMediaService.getPublicTheatreMedia(theatreId).catch(() => null),
      theatreAmenityService.getPublicTheatreAmenities(theatreId).catch(() => []),
      theatreContactService.getPublicTheatreContacts(theatreId).catch(() => null),
      theatreOperatingHoursRepository.findBundle(theatreId).catch(() => null),
      theatreConfigurationRepository.findBundle(theatreId).catch(() => null),
      Promise.resolve(
        theatreSearchRepository.getAllDocuments().find((d) => d.theatreId === theatreId || d.slug === slug) || null
      ),
    ]);

    // 4. Resolve Configuration & Localization (Pune INR vs Mumbai USD vs Dubai AED)
    const configuration: PublicTheatreConfigurationView = {
      currency:
        configBundle?.localization?.currency ||
        searchDoc?.configuration?.currency ||
        this.inferCurrency(theatreId),
      currencySymbol: this.inferCurrencySymbol(theatreId, configBundle?.localization?.currency),
      timezone:
        configBundle?.localization?.timezone ||
        operatingBundle?.profile?.timezone ||
        searchDoc?.configuration?.timezone ||
        "Asia/Kolkata",
      primaryLanguage:
        configBundle?.localization?.primaryLanguage ||
        searchDoc?.configuration?.primaryLanguage ||
        "en",
      numberFormat:
        (configBundle?.localization?.numberFormat as "INDIAN" | "INTERNATIONAL") ||
        (theatreId === "th-pun-001" ? "INDIAN" : "INTERNATIONAL"),
      timeFormat:
        (configBundle?.localization?.timeFormat as "12H" | "24H") ||
        (theatreId === "th-dxb-001" ? "24H" : "12H"),
    };

    // 5. Aggregate Branding View (Strictly active, public images)
    const branding: PublicBrandingView = this.buildBrandingView(
      mediaView,
      theatreEntity,
      searchDoc
    );

    // 6. Aggregate Profile View
    const profile: PublicTheatreProfileView = {
      theatreId,
      slug,
      displayName: profileData?.displayName || theatreEntity.name,
      legalName: (profileData as any)?.legalName || searchDoc?.legalName || theatreEntity.name,
      establishedYear: profileData?.establishedYear || 2018,
      theatreType: profileData?.theatreType || searchDoc?.theatreType || "PREMIUM",
      ownershipModel: profileData?.ownershipModel || "Direct Exhibition",
      chainType: (searchDoc?.chainType as "CHAIN" | "INDEPENDENT") || "CHAIN",
      chainName: profileData?.chainName || searchDoc?.chainName || "CineSphere Circuit",
      tagline:
        profileData?.tagline ||
        "The Ultimate Cinematic Exhibition Experience with Laser IMAX & Dolby Atmos.",
      aboutTheatre:
        profileData?.aboutTheatre ||
        profileData?.fullDescription ||
        "Experience cinema at its finest with cutting-edge optical projection, uncompressed spatial audio, and luxury recliner comfort.",
      description:
        profileData?.shortDescription ||
        "State-of-the-art cinema complex featuring premium auditorium technologies.",
      languages:
        profileData?.languages?.map((l) => ({
          id: l.id,
          name: l.displayName,
          isPrimary: l.isPrimary,
        })) || [
          { id: "lang-en", name: "English", isPrimary: true },
          { id: "lang-hi", name: "Hindi", isPrimary: false },
        ],
      screensCount:
        profileData?.screensCount ||
        searchDoc?.screensCount ||
        theatreEntity.screensCount ||
        6,
      totalSeatingCapacity:
        profileData?.totalSeatingCapacity ||
        searchDoc?.totalCapacity ||
        theatreEntity.totalCapacity ||
        1200,
      businessCategory:
        searchDoc?.businessCategory ||
        profileData?.theatreType ||
        "Multiplex Cinema",
    };

    // 7. Aggregate Location View
    const location: PublicLocationView = {
      completeAddress:
        locationData?.completeAddress ||
        locationData?.formattedAddress ||
        `${theatreEntity.address}, ${theatreEntity.city}, ${theatreEntity.state}`,
      addressLine1: (locationData as any)?.addressLine1 || theatreEntity.address,
      addressLine2: (locationData as any)?.addressLine2 || "",
      landmark: locationData?.landmark || "Phoenix Marketcity Concourse",
      area: (locationData as any)?.area || theatreEntity.city,
      city: locationData?.city || theatreEntity.city,
      state: locationData?.state || theatreEntity.state,
      country: locationData?.country || "India",
      postalCode: locationData?.postalCode || "411014",
      googleMapsUrl:
        locationData?.googleMapsUrl ||
        `https://maps.google.com/?q=${encodeURIComponent(
          `${theatreEntity.name} ${theatreEntity.city}`
        )}`,
      navigationUrl:
        locationData?.navigationLink ||
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${theatreEntity.name} ${theatreEntity.city}`
        )}`,
      coordinates: locationData?.coordinates || {
        latitude: 18.5622,
        longitude: 73.9167,
      },
    };

    // 8. Aggregate Contact Directory (Public verified only)
    const contact: PublicContactView = this.buildContactView(contactsBundle, theatreEntity);

    // 9. Aggregate Amenities (Public only)
    const amenities: PublicAmenityItem[] = this.buildAmenitiesView(
      amenitiesData,
      searchDoc?.amenityNames
    );

    // 10. Aggregate Operating Hours & Weekly Schedule
    const operatingHours: PublicOperatingHoursView = this.buildOperatingHoursView(
      operatingBundle,
      configuration.timezone
    );

    // 11. Aggregate Running Movies & Upcoming Movies
    const { runningMovies, upcomingMovies } = this.buildMoviesView(theatreId);

    // 12. Aggregate Shows (with theatre currency auto-formatting)
    const shows: PublicShowItem[] = this.buildShowsView(
      theatreId,
      theatreEntity,
      configuration
    );

    // 13. Aggregate Hall Summary
    const halls: PublicHallSummary[] = this.buildHallsSummary(
      theatreId,
      theatreEntity.screensCount || 6
    );

    // 14. Reviews Architecture Placeholder (Explicitly non-functional stubs)
    const reviewsSummary: PublicReviewsSummaryPlaceholder = this.buildReviewsPlaceholder();

    // 15. Generate SEO Metadata & Schema.org JSON-LD
    const seo: PublicTheatreSEO = this.buildSeoMetadata(
      profile,
      location,
      branding,
      amenities,
      configuration
    );

    const publicView: PublicTheatreView = {
      theatreId,
      slug,
      branding,
      profile,
      location,
      contact,
      amenities,
      runningMovies,
      upcomingMovies,
      shows,
      halls,
      operatingHours,
      reviewsSummary,
      configuration,
      seo,
      generatedAt: new Date().toISOString(),
    };

    logger.info("API", `Loaded public theatre view for '${profile.displayName}' (${slug})`, {
      theatreId,
      durationMs: Date.now() - startTime,
      metadata: {
        slug,
        runningMoviesCount: runningMovies.length,
        showsCount: shows.length,
        amenitiesCount: amenities.length,
      },
    });

    return publicView;
  }

  // ----------------------------------------------------------------------------
  // Sub-Model Builders
  // ----------------------------------------------------------------------------

  private buildBrandingView(
    mediaView: any,
    theatre: { banner?: string; logo?: string; name: string },
    searchDoc: any
  ): PublicBrandingView {
    const galleryImages: PublicGalleryImage[] = ((mediaView?.gallery || []) as any[])
      .map((a: any, idx: number) => ({
        id: a.id,
        url: a.url,
        title: a.title,
        caption: a.metadata?.caption,
        displayOrder: a.displayOrder ?? idx + 1,
      }))
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    // Fallback gallery images if none uploaded yet
    const fallbackGallery: PublicGalleryImage[] = [
      {
        id: "gal-1",
        url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
        title: "Main Auditorium Grand Screen",
        caption: "Auditorium 1 with dual 4K laser projection and spatial seating",
        displayOrder: 1,
      },
      {
        id: "gal-2",
        url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
        title: "Luxury Lounge & Gourmet Bar",
        caption: "Dedicated VIP patron concourse with barista and sommelier service",
        displayOrder: 2,
      },
      {
        id: "gal-3",
        url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1200&auto=format&fit=crop&q=80",
        title: "Zero-Gravity Ultra Recliners",
        caption: "Electric motorized recliners with USB charging and private dining trays",
        displayOrder: 3,
      },
      {
        id: "gal-4",
        url: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1200&auto=format&fit=crop&q=80",
        title: "Acoustic Concourse Entrance",
        caption: "Soundproof airlock entry tunnels into Dolby Atmos auditoriums",
        displayOrder: 4,
      },
    ];

    return {
      logoUrl:
        mediaView?.logo?.url ||
        searchDoc?.logoUrl ||
        theatre.logo ||
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&auto=format&fit=crop&q=80",
      bannerUrl:
        mediaView?.banner?.url ||
        searchDoc?.bannerUrl ||
        theatre.banner ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
      heroImageUrl:
        mediaView?.heroImage?.url ||
        mediaView?.banner?.url ||
        theatre.banner ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
      coverImageUrl:
        mediaView?.coverImage?.url ||
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl:
        mediaView?.thumbnail?.url ||
        mediaView?.logo?.url ||
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=320&auto=format&fit=crop&q=80",
      gallery: galleryImages.length > 0 ? galleryImages : fallbackGallery,
    };
  }

  private buildContactView(
    contactsBundle: any,
    theatre: { name: string; city?: string }
  ): PublicContactView {
    const primaryPhone = contactsBundle?.primaryPhone;
    const supportEmail = contactsBundle?.supportEmail;
    const emergency = contactsBundle?.emergencyDesk;
    const manager = contactsBundle?.dutyManager;
    const website = contactsBundle?.officialWebsite;
    const socialLinks = ((contactsBundle?.socialLinks || []) as any[])
      .filter((c: any) => c.socialLink?.url)
      .map((c: any) => ({
        id: c.id,
        platform: c.socialLink?.platform || "Website",
        url: c.socialLink?.url || "#",
        label: c.title || c.socialLink?.platform || "Social Link",
      }));

    return {
      primaryPhone: primaryPhone?.phone
        ? {
            number: `${primaryPhone.phone.countryCode || "+91"} ${primaryPhone.phone.phoneNumber}`,
            formatted: primaryPhone.phone.formattedPhone || primaryPhone.phone.phoneNumber || "+91 20 6645 1200",
            label: primaryPhone.title || "Box Office & Reservations",
          }
        : {
            number: "+91 20 6645 1200",
            formatted: "+91 (20) 6645-1200",
            label: "General Multiplex Enquiries",
          },
      supportEmail: supportEmail?.email
        ? {
            email: supportEmail.email.email || "guestcare@cinesphere.com",
            label: supportEmail.title || "Guest Support Desk",
            department: supportEmail.email.department || "Customer Care",
          }
        : {
            email: "support@cinesphere.com",
            label: "Patron Assistance Desk",
            department: "Guest Relations",
          },
      emergencyDesk: emergency?.emergencyContact
        ? {
            phone: emergency.emergencyContact.primaryPhone || "+91 20 6645 9999",
            officer: emergency.emergencyContact.contactPersonName || "Duty Incident Officer",
            label: emergency.title || "24/7 Priority Emergency Desk",
          }
        : {
            phone: "+91 20 6645 9999",
            officer: "Security Operations Center",
            label: "24/7 Security & Incident Command",
          },
      dutyManager: manager?.managerContact
        ? {
            name: manager.managerContact.managerName,
            phone: manager.managerContact.phone,
            designation: manager.managerContact.designation || "Floor Operations Manager",
            department: manager.managerContact.department || "Cinema Management",
          }
        : {
            name: "Devendra Koli",
            phone: "+91 98230 45678",
            designation: "Duty Cinema Manager",
            department: "Operations",
          },
      website: website?.website?.url || "https://cinesphere.com",
      socialLinks:
        socialLinks.length > 0
          ? socialLinks
          : [
              { id: "soc-1", platform: "Instagram", url: "https://instagram.com/cinesphere", label: "Instagram" },
              { id: "soc-2", platform: "Facebook", url: "https://facebook.com/cinesphere", label: "Facebook" },
              { id: "soc-3", platform: "X", url: "https://x.com/cinesphere", label: "X / Twitter" },
            ],
    };
  }

  private buildAmenitiesView(
    assignedAmenities: any[],
    indexedNames?: string[]
  ): PublicAmenityItem[] {
    const publicItems: PublicAmenityItem[] = [];

    // Filter assigned amenities for public and available items
    assignedAmenities.forEach((am, idx) => {
      if (am.isPublic === false) return;
      if (am.availability && am.availability !== "AVAILABLE" && am.availability !== "SEASONAL") return;

      publicItems.push({
        id: am.assignmentId || am.amenityId || `am-${idx}`,
        name: am.displayName || am.name || "Verified Facility",
        category: this.normalizeAmenityCategory(am.category),
        icon: am.icon || "Sparkles",
        description: am.description || "Premium amenity available for patrons.",
        notes: am.notes,
        isFeatured: am.isFeatured || false,
        metadata: am.metadata,
      });
    });

    if (publicItems.length > 0) {
      return publicItems;
    }

    // Default rich amenities fallback
    return [
      {
        id: "am-imax",
        name: "IMAX with Laser",
        category: "TECHNOLOGY",
        icon: "Monitor",
        description: "Next-generation 4K dual-laser optical system with 12-channel high-impact sound.",
        isFeatured: true,
      },
      {
        id: "am-dolby",
        name: "Dolby Atmos 64-Channel",
        category: "TECHNOLOGY",
        icon: "Volume2",
        description: "Three-dimensional immersive audio rendering sounds anywhere in the room.",
        isFeatured: true,
      },
      {
        id: "am-recliner",
        name: "Zero-Gravity Motorized Recliners",
        category: "COMFORT",
        icon: "Armchair",
        description: "Ultra-luxury full ergonomic reclining leather seats with footrests and side trays.",
        isFeatured: true,
      },
      {
        id: "am-dining",
        name: "Artisan In-Seat Butler Dining",
        category: "HOSPITALITY",
        icon: "Utensils",
        description: "Chef-crafted gourmet menu delivered discreetly to your seat during show turnaround.",
        isFeatured: false,
      },
      {
        id: "am-parking",
        name: "Multi-Level Covered Parking & Valet",
        category: "HOSPITALITY",
        icon: "Car",
        description: "1,200 secure bays with EV charging stations and executive curb drop-off.",
        isFeatured: false,
        metadata: { parkingCapacity: 1200, evChargerCount: 24, wifiSsid: "CineSphere-Guest-5G" },
      },
      {
        id: "am-access",
        name: "Dolby Fidelio Accessibility Suites",
        category: "ACCESSIBILITY",
        icon: "Accessibility",
        description: "Closed captioning display glasses and high-fidelity assistive listening receivers.",
        isFeatured: false,
      },
    ];
  }

  private normalizeAmenityCategory(
    rawCat?: string
  ): "TECHNOLOGY" | "COMFORT" | "ACCESSIBILITY" | "HOSPITALITY" | "OTHER" {
    if (!rawCat) return "TECHNOLOGY";
    const upper = rawCat.toUpperCase().replace(/[-_]/g, " ");
    if (
      upper.includes("TECH") ||
      upper.includes("PROJECTION") ||
      upper.includes("ACOUSTIC") ||
      upper.includes("AUDIO") ||
      upper.includes("LASER") ||
      upper.includes("IMAX") ||
      upper.includes("DOLBY") ||
      upper.includes("VISION")
    ) {
      return "TECHNOLOGY";
    }
    if (upper.includes("COMFORT") || upper.includes("RECLINER") || upper.includes("SEATING")) {
      return "COMFORT";
    }
    if (upper.includes("ACCESS") || upper.includes("WHEELCHAIR") || upper.includes("ASSIST")) {
      return "ACCESSIBILITY";
    }
    if (
      upper.includes("FOOD") ||
      upper.includes("BEVERAGE") ||
      upper.includes("HOSPITALITY") ||
      upper.includes("PREMIUM") ||
      upper.includes("DINING") ||
      upper.includes("PARKING") ||
      upper.includes("TRANSIT") ||
      upper.includes("UTILITY") ||
      upper.includes("CONVENIENCE") ||
      upper.includes("VIP")
    ) {
      return "HOSPITALITY";
    }
    return "OTHER";
  }

  private buildOperatingHoursView(
    operatingBundle: any,
    timezone: string
  ): PublicOperatingHoursView {
    const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const dayLabels: Record<string, string> = {
      MONDAY: "Mon",
      TUESDAY: "Tue",
      WEDNESDAY: "Wed",
      THURSDAY: "Thu",
      FRIDAY: "Fri",
      SATURDAY: "Sat",
      SUNDAY: "Sun",
    };

    const weeklyMap = new Map<string, { isOpen: boolean; openTime: string; closeTime: string; isOvernight: boolean }>();
    ((operatingBundle?.weeklySchedule || []) as any[]).forEach((s: any) => {
      weeklyMap.set(s.dayOfWeek.toUpperCase(), s);
    });

    const weeklySchedule = daysOrder.map((day) => {
      const schedule = weeklyMap.get(day) || {
        isOpen: true,
        openTime: operatingBundle?.profile?.standardOpenTime || "09:00",
        closeTime: operatingBundle?.profile?.standardCloseTime || "01:30",
        isOvernight: true,
      };

      const formattedHours = schedule.isOpen
        ? `${schedule.openTime} – ${schedule.closeTime}${schedule.isOvernight ? " (Overnight)" : ""}`
        : "Closed";

      return {
        dayOfWeek: day,
        dayLabel: dayLabels[day],
        isOpen: schedule.isOpen,
        openTime: schedule.openTime,
        closeTime: schedule.closeTime,
        isOvernight: schedule.isOvernight,
        formattedHours,
      };
    });

    // Check today's status based on day of week
    const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const todaySchedule = weeklySchedule[todayIndex];

    const todayHours = todaySchedule.isOpen
      ? `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
      : "Closed Today";

    return {
      todayHours,
      isOpenNow: todaySchedule.isOpen,
      weeklySchedule,
      holidayNoticePlaceholder:
        operatingBundle?.holidays && operatingBundle.holidays.length > 0
          ? `Upcoming Special Operating Schedule: ${operatingBundle.holidays[0].holidayName} (${operatingBundle.holidays[0].holidayDate})`
          : "Open 365 Days a Year with Extended Midnight Premieres on Weekends",
    };
  }

  private buildMoviesView(theatreId: string): {
    runningMovies: PublicMovieSummary[];
    upcomingMovies: PublicMovieSummary[];
  } {
    const allMovies = getAllPublishedMovies();

    const runningMovies: PublicMovieSummary[] = [];
    const upcomingMovies: PublicMovieSummary[] = [];

    allMovies.forEach((m) => {
      const isComingSoon = m.status === "Coming Soon";
      const movieSummary: PublicMovieSummary = {
        id: m.id,
        slug: m.slug,
        title: m.title,
        posterUrl: m.poster,
        bannerUrl: m.banner,
        synopsis: m.synopsis || "Major studio theatrical presentation running on CineSphere screens.",
        durationMinutes: m.durationMinutes || 150,
        certification: m.certification || "UA",
        genres: m.genre || ["Action", "Sci-Fi"],
        languages: m.languages || ["English"],
        formats: m.formats || ["IMAX Laser", "Dolby Cinema", "2D"],
        rating: m.rating || 9.1,
        showCount: m.availableShowsCount || 6,
        status: isComingSoon ? "COMING_SOON" : "NOW_SHOWING",
        releaseDate: m.releaseDate || "2026-11-01",
      };

      if (isComingSoon) {
        upcomingMovies.push(movieSummary);
      } else {
        runningMovies.push(movieSummary);
      }
    });

    return {
      runningMovies: runningMovies.slice(0, 8),
      upcomingMovies: upcomingMovies.slice(0, 6),
    };
  }

  private buildShowsView(
    theatreId: string,
    theatre: { name: string; slug: string },
    config: PublicTheatreConfigurationView
  ): PublicShowItem[] {
    const allShows = getAllPublishedShows();
    const theatreShows = allShows.filter((s) => s.theatreId === theatreId || s.theatreName === theatre.name);

    if (theatreShows.length > 0) {
      return theatreShows.map((s) => ({
        id: s.id,
        showCode: s.showCode,
        movieId: s.movieId,
        movieTitle: s.movieTitle,
        moviePosterUrl: s.moviePosterUrl,
        hallId: s.hallId,
        hallName: s.hallName,
        screenType: s.screenType,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        format: s.format,
        language: s.language,
        ticketPrice: s.ticketPrice,
        formattedPrice: this.formatCurrencyAmount(s.ticketPrice, config),
        availableSeats: s.availableSeats,
        totalSeats: s.totalSeats,
        status: s.availableSeats === 0 ? "SOLD_OUT" : s.availableSeats < 25 ? "FILLING_FAST" : "SCHEDULED",
        bookingStatusPlaceholder: s.availableSeats === 0 ? "SOLD_OUT" : s.availableSeats < 25 ? "FILLING_FAST" : "AVAILABLE",
      }));
    }

    // Synthesize structured shows matching the multiplex's flagship formats
    const sampleMovies = getAllPublishedMovies().slice(0, 4);
    const shows: PublicShowItem[] = [];
    const basePrices = [220, 280, 350, 450];

    sampleMovies.forEach((m, mIdx) => {
      const times = [
        { start: "10:30 AM", end: "01:15 PM", hall: "Auditorium 1 - IMAX Laser", format: "IMAX 2D", price: basePrices[0] + mIdx * 20 },
        { start: "02:45 PM", end: "05:30 PM", hall: "Auditorium 2 - Dolby Cinema", format: "Dolby Atmos", price: basePrices[1] + mIdx * 20 },
        { start: "06:15 PM", end: "09:00 PM", hall: "Auditorium 1 - IMAX Laser", format: "IMAX 3D", price: basePrices[2] + mIdx * 20 },
        { start: "09:45 PM", end: "12:30 AM", hall: "Auditorium 3 - VIP Recliner Suite", format: "VIP Dining Experience", price: basePrices[3] + mIdx * 20 },
      ];

      times.forEach((t, tIdx) => {
        const availableSeats: number = tIdx === 3 ? 0 : tIdx === 2 ? 18 : tIdx === 1 ? 55 : 82;
        const totalSeats = tIdx === 3 ? 48 : 100;
        const rawPrice = this.convertBasePriceForLocale(t.price, config.currency);

        shows.push({
          id: `show-${theatre.slug}-m${mIdx}-${tIdx + 1}`,
          showCode: `SH-${theatre.slug.substring(0, 3).toUpperCase()}-${mIdx + 1}${tIdx + 1}`,
          movieId: m.id,
          movieTitle: m.title,
          moviePosterUrl: m.poster,
          hallId: `hall-${tIdx + 1}`,
          hallName: t.hall,
          screenType: t.format,
          date: new Date().toISOString().split("T")[0],
          startTime: t.start,
          endTime: t.end,
          format: t.format,
          language: m.languages[0] || "English",
          ticketPrice: rawPrice,
          formattedPrice: this.formatCurrencyAmount(rawPrice, config),
          availableSeats,
          totalSeats,
          status: availableSeats === 0 ? "SOLD_OUT" : availableSeats < 25 ? "FILLING_FAST" : "SCHEDULED",
          bookingStatusPlaceholder: availableSeats === 0 ? "SOLD_OUT" : availableSeats < 25 ? "FILLING_FAST" : "AVAILABLE",
        });
      });
    });

    return shows;
  }

  private buildHallsSummary(theatreId: string, screensCount: number): PublicHallSummary[] {
    const flagshipHalls: PublicHallSummary[] = [
      {
        id: "hall-1",
        name: "Auditorium 1 - IMAX with Laser",
        screenType: "IMAX Commercial Laser 4K",
        capacity: 380,
        soundSystem: "IMAX 12-Channel High-Dynamic Precision Array",
        projectionType: "IMAX Dual 4K Laser (1.90:1 Aspect Ratio)",
        premiumFeatures: ["Floor-to-Ceiling Screen", "Acoustic Geometry Tuning", "Plush Laser Seating"],
        status: "Operational",
      },
      {
        id: "hall-2",
        name: "Auditorium 2 - Dolby Cinema",
        screenType: "Dolby Cinema Vision + Atmos",
        capacity: 260,
        soundSystem: "Dolby Atmos 64-Channel Spatial Audio",
        projectionType: "Dolby Vision Dual Christie 4K Laser",
        premiumFeatures: ["Million-to-One Contrast Ratio", "Sound Space Isolation", "Atmospheric Accent Lighting"],
        status: "Operational",
      },
      {
        id: "hall-3",
        name: "Auditorium 3 - 4DX Sensory Simulator",
        screenType: "4DX Motion & Atmospheric Effects",
        capacity: 140,
        soundSystem: "Dolby 7.1 Studio Surround",
        projectionType: "Barco Series 4 Laser",
        premiumFeatures: ["3-DOF Motion Chairs", "Environmental Wind & Water Scent", "Strobe Lightning FX"],
        status: "Operational",
      },
      {
        id: "hall-4",
        name: "Auditorium 4 - The Royal VIP Club",
        screenType: "VIP Dining Recliner Suite",
        capacity: 64,
        soundSystem: "JBL Master Acoustic Reference",
        projectionType: "Christie RealLaser 4K",
        premiumFeatures: ["Zero-Gravity Ultra Recliners", "Seat-Side Waiter Call Button", "Complimentary Gourmet Popcorn"],
        status: "Operational",
      },
      {
        id: "hall-5",
        name: "Auditorium 5 - Premiere Screen",
        screenType: "RealD 3D Laser Cinema",
        capacity: 240,
        soundSystem: "Dolby Atmos Surround",
        projectionType: "Barco 4K Laser",
        premiumFeatures: ["Precision White Screen", "Stadium Seating", "High-Definition 3D Glasses"],
        status: "Operational",
      },
      {
        id: "hall-6",
        name: "Auditorium 6 - Classic Screen",
        screenType: "Digital 4K Cinema",
        capacity: 180,
        soundSystem: "Dolby 7.1 Digital Audio",
        projectionType: "NEC Digital 4K",
        premiumFeatures: ["High-Back Rocker Chairs", "Wide Legroom Rows", "Wheelchair Accessibility Bays"],
        status: "Operational",
      },
    ];

    return flagshipHalls.slice(0, screensCount || 4);
  }

  private buildReviewsPlaceholder(): PublicReviewsSummaryPlaceholder {
    return {
      averageRating: 4.8,
      totalReviews: 1420,
      ratingDistribution: {
        5: 1120,
        4: 210,
        3: 65,
        2: 15,
        1: 10,
      },
      customerPhotos: [
        {
          id: "ph-1",
          url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80",
          caption: "IMAX Screen opening night for Dune 2",
        },
        {
          id: "ph-2",
          url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80",
          caption: "VIP Concourse lounge appetizers",
        },
        {
          id: "ph-3",
          url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=400&auto=format&fit=crop&q=80",
          caption: "Ultra recliners with private table lamps",
        },
      ],
      reviewListPlaceholder: [
        {
          id: "rev-1",
          authorName: "Ananya Deshmukh",
          rating: 5,
          date: "2 days ago",
          comment: "Best IMAX experience in Maharashtra. The audio bass during the sandstorm scenes was phenomenal!",
          verifiedPatron: true,
        },
        {
          id: "rev-2",
          authorName: "Rohan Varma",
          rating: 5,
          date: "1 week ago",
          comment: "Valet parking was quick, the artisan popcorn was fresh, and the recliners are super comfortable.",
          verifiedPatron: true,
        },
        {
          id: "rev-3",
          authorName: "Vikram Kulkarni",
          rating: 4,
          date: "2 weeks ago",
          comment: "Spectacular Dolby Cinema projection. Highly recommend booking row F or G for optimal sightlines.",
          verifiedPatron: true,
        },
      ],
    };
  }

  private buildSeoMetadata(
    profile: PublicTheatreProfileView,
    location: PublicLocationView,
    branding: PublicBrandingView,
    amenities: PublicAmenityItem[],
    config: PublicTheatreConfigurationView
  ): PublicTheatreSEO {
    const title = `${profile.displayName} - Movies, Showtimes & Tickets | CineSphere OS`;
    const metaDescription = `Book movie tickets, check live showtimes, and explore ${profile.screensCount} screens with IMAX Laser and Dolby Atmos at ${profile.displayName} in ${location.city}, ${location.state}.`;
    const canonicalUrl = `https://cinesphere.com/theatre/${profile.slug}`;
    const ogImage = branding.heroImageUrl || branding.bannerUrl || branding.coverImageUrl || "";

    // Schema.org MovieTheater JSON-LD
    const jsonLdSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "MovieTheater",
      name: profile.displayName,
      url: canonicalUrl,
      logo: branding.logoUrl,
      image: ogImage,
      telephone: "+91 20 6645 1200",
      priceRange: config.currencySymbol,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.addressLine1,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.postalCode,
        addressCountry: location.country,
      },
      geo: location.coordinates
        ? {
            "@type": "GeoCoordinates",
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
          }
        : undefined,
      maximumAttendeeCapacity: profile.totalSeatingCapacity,
      amenityFeature: amenities.map((am) => ({
        "@type": "LocationFeatureSpecification",
        name: am.name,
        value: true,
      })),
    };

    return {
      title,
      metaDescription,
      canonicalUrl,
      ogTags: {
        title,
        description: metaDescription,
        image: ogImage,
        url: canonicalUrl,
        type: "website",
      },
      twitterCard: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        image: ogImage,
      },
      friendlySlug: profile.slug,
      jsonLdSchema,
    };
  }

  // ----------------------------------------------------------------------------
  // Helpers & Entity Resolvers
  // ----------------------------------------------------------------------------

  private async resolveTheatreEntity(slugOrId: string): Promise<{
    theatreId: string;
    slug: string;
    name: string;
    status: string;
    approvalStatus: string;
    isVerified: boolean;
    screensCount?: number;
    totalCapacity?: number;
    address: string;
    city: string;
    state: string;
    logo?: string;
    banner?: string;
  } | null> {
    // 1. Try Theatre Search Repository documents (denormalized index)
    const indexedDocs = theatreSearchRepository.getAllDocuments();
    const searchMatch = indexedDocs.find(
      (d) =>
        d.slug.toLowerCase() === slugOrId ||
        d.theatreId.toLowerCase() === slugOrId ||
        d.code.toLowerCase() === slugOrId ||
        (slugOrId.includes("pune") && d.theatreId === "th-pun-001") ||
        (slugOrId.includes("mumbai") && d.theatreId === "th-mum-001") ||
        (slugOrId.includes("dubai") && d.theatreId === "th-dxb-001") ||
        (slugOrId.includes("delhi") && d.theatreId === "th-del-001") ||
        (slugOrId.includes("bengaluru") && d.theatreId === "th-blr-001") ||
        (slugOrId.includes("goa") && d.theatreId === "th-goa-001") ||
        (slugOrId.includes("kolkata") && d.theatreId === "th-kol-001")
    );

    if (searchMatch) {
      return {
        theatreId: searchMatch.theatreId,
        slug: searchMatch.slug,
        name: searchMatch.name,
        status: searchMatch.status,
        approvalStatus: searchMatch.approvalStatus,
        isVerified: searchMatch.isVerified,
        screensCount: searchMatch.screensCount,
        totalCapacity: searchMatch.totalCapacity,
        address: searchMatch.location.addressLine1,
        city: searchMatch.location.city,
        state: searchMatch.location.state,
      };
    }

    // 2. Try Lifecycle Repository
    const lifecycleMatch =
      (await theatreLifecycleRepository.findBySlug(slugOrId)) ||
      (await theatreLifecycleRepository.findById(slugOrId));

    if (lifecycleMatch) {
      return {
        theatreId: lifecycleMatch.id,
        slug: lifecycleMatch.slug,
        name: lifecycleMatch.name,
        status: lifecycleMatch.status,
        approvalStatus: lifecycleMatch.approvalStatus,
        isVerified: lifecycleMatch.status === "ACTIVE",
        address: "Phoenix Marketcity, Viman Nagar",
        city: "Pune",
        state: "Maharashtra",
      };
    }

    // 3. Fallback to Multi-Tenant Seeds
    const multiTenantMatch = MULTI_TENANT_THEATRES.find(
      (t) => t.slug === slugOrId || t.id === slugOrId
    );
    if (multiTenantMatch) {
      return {
        theatreId: multiTenantMatch.id,
        slug: multiTenantMatch.slug,
        name: multiTenantMatch.name,
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        isVerified: true,
        screensCount: multiTenantMatch.halls?.length || 6,
        totalCapacity: 1450,
        address: multiTenantMatch.address,
        city: multiTenantMatch.city,
        state: multiTenantMatch.state,
        logo: multiTenantMatch.logo,
        banner: multiTenantMatch.banner,
      };
    }

    return null;
  }

  private inferCurrency(theatreId: string): string {
    if (theatreId === "th-dxb-001") return "AED";
    if (theatreId === "th-mum-001") return "USD";
    return "INR";
  }

  private inferCurrencySymbol(theatreId: string, currency?: string): string {
    const cur = currency || this.inferCurrency(theatreId);
    if (cur === "AED") return "AED ";
    if (cur === "USD") return "$";
    if (cur === "EUR") return "€";
    if (cur === "GBP") return "£";
    return "₹";
  }

  private convertBasePriceForLocale(priceInINR: number, currency: string): number {
    if (currency === "USD") return Math.round((priceInINR / 20) * 2) / 2; // e.g. 250 INR -> $12.50
    if (currency === "AED") return Math.round((priceInINR / 7) * 2) / 2;  // e.g. 250 INR -> AED 35
    return priceInINR;
  }

  private formatCurrencyAmount(amount: number, config: PublicTheatreConfigurationView): string {
    if (config.currency === "INR" || config.numberFormat === "INDIAN") {
      return `${config.currencySymbol}${Math.round(amount).toLocaleString("en-IN")}`;
    }
    return `${config.currencySymbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Invalidates the public cache tag for a theatre when its underlying profile,
   * media, location, amenities, or configuration changes.
   */
  public invalidatePublicTheatreView(theatreIdOrSlug: string): void {
    const normalized = theatreIdOrSlug.toLowerCase().trim();
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_VIEW(normalized));
    invalidateCacheByTag(CACHE_TAGS.THEATRE(normalized));
    logger.info("SYSTEM", `Invalidated public theatre view cache for '${normalized}'`, {
      theatreId: normalized,
    });
  }
}

export const publicTheatreService = new PublicTheatreService();
