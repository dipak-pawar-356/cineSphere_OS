/**
 * ==============================================================================
 * CineSphere OS — Theatre Search Index Repository (Phase 3 – Part 12)
 * ==============================================================================
 * Denormalized, high-speed in-memory search index layer aggregating:
 * - Theatre Lifecycle & Core Identity
 * - Profile & Branding
 * - Location & Coordinates
 * - Business & Corporate Registration (GST, PAN, CIN)
 * - Amenities & Facilities
 * - Localization Configuration (Currency, Timezone, Languages)
 * - Primary Staff Admin Information
 * ==============================================================================
 */

import {
  TheatreSearchDocument,
  TheatreSearchFilters,
  TheatreSearchSortOption,
  TheatreSearchResultItem,
  TheatreSearchResultsPayload,
  SavedSearchPreset,
  TheatreSearchSuggestion,
} from "@/types/theatre-search.types";
import {
  tokenizeSearchQuery,
  calculateMatchScore,
  buildFacetDistribution,
  applyPagination,
} from "@/lib/search/search-query-builder";

export class TheatreSearchRepository {
  private indexStore: Map<string, TheatreSearchDocument> = new Map();
  private savedPresetsStore: Map<string, SavedSearchPreset[]> = new Map();

  constructor() {
    this.seedSearchIndex();
    this.seedDefaultPresets();
  }

  // ----------------------------------------------------------------------------
  // 1. Data Seeding & Document Normalization
  // ----------------------------------------------------------------------------
  private seedSearchIndex(): void {
    const rawTheatres: Omit<TheatreSearchDocument, "searchableText">[] = [
      // 1. Pune Flagship
      {
        theatreId: "th-pun-001",
        slug: "cinesphere-grand-pune",
        code: "CSP-PUN-01",
        name: "CineSphere Grand Cinemas",
        legalName: "CineSphere Entertainment Private Limited",
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        isVerified: true,
        theatreType: "PREMIUM",
        chainType: "CHAIN",
        chainName: "CineSphere Premiere",
        businessCategory: "PRIVATE_LIMITED",
        gstNumber: "27AAACC1206M1ZT",
        cinNumber: "U92490PN2021PTC199841",
        panNumber: "AAACC1206M",
        location: {
          city: "Pune",
          state: "Maharashtra",
          country: "India",
          area: "Viman Nagar",
          postalCode: "411014",
          addressLine1: "Level 4, Phoenix Marketcity, Nagar Road",
          latitude: 18.562,
          longitude: 73.9168,
          geohash: "tek3z1b8",
        },
        screensCount: 8,
        totalCapacity: 1450,
        screenTypes: ["IMAX 3D", "Dolby Cinema", "4DX", "Laser 4K"],
        amenityCodes: ["AMN-IMAX", "AMN-DOLBY-ATMOS", "AMN-VIP-RECLINE", "AMN-BUTLER", "AMN-VALET"],
        amenityNames: [
          "IMAX with Laser",
          "Dolby Atmos 64-Channel Spatial Audio",
          "Zero-Gravity Ultra Recliners",
          "Gourmet In-Seat Butler Dining",
          "Dedicated Valet Drop-off & Retrieval",
        ],
        primaryAdmin: {
          id: "usr-th-pun",
          name: "Rajesh Sharma",
          email: "rajesh.sharma@cinesphere.in",
          phone: "+91 98201 12345",
          designation: "General Manager",
        },
        configuration: {
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
          primaryLanguage: "en",
          supportedLanguages: ["en", "hi", "mr"],
          numberFormat: "INDIAN",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&auto=format&fit=crop&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
          primaryColor: "#E50914",
        },
        metricsSnapshot: {
          rating: 4.9,
          reviewsCount: 3840,
          liveOccupancyPercent: 82.0,
          todayRevenue: 125000,
        },
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-11-10T14:30:00.000Z",
      },

      // 2. Mumbai Luxury Circuit
      {
        theatreId: "th-mum-001",
        slug: "cinesphere-royale-mumbai",
        code: "CSP-MUM-01",
        name: "CineSphere Royale Palladium",
        legalName: "Royale Cinematic Exhibitions LLP",
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        isVerified: true,
        theatreType: "PREMIUM",
        chainType: "CHAIN",
        chainName: "CineSphere Premiere",
        businessCategory: "LLP",
        gstNumber: "27AAACR8820M1ZX",
        cinNumber: "AAA-8820",
        panNumber: "AAACR8820M",
        location: {
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          area: "Lower Parel",
          postalCode: "400013",
          addressLine1: "5th Floor, Palladium Mall, Senapati Bapat Marg",
          latitude: 18.995,
          longitude: 72.825,
          geohash: "te7ucygh",
        },
        screensCount: 10,
        totalCapacity: 1940,
        screenTypes: ["IMAX 3D", "Dolby Cinema", "ScreenX", "Laser 4K"],
        amenityCodes: ["AMN-IMAX", "AMN-DOLBY-ATMOS", "AMN-VIP-RECLINE", "AMN-LOUNGE", "AMN-VALET"],
        amenityNames: [
          "IMAX with Laser",
          "Dolby Atmos 64-Channel Spatial Audio",
          "Zero-Gravity Ultra Recliners",
          "VIP Lounge",
          "Dedicated Valet Drop-off & Retrieval",
        ],
        primaryAdmin: {
          id: "usr-th-mum",
          name: "Carlos Mendez",
          email: "carlos.mendez@cinesphere.com",
          phone: "+91 98201 54321",
          designation: "Managing Director",
        },
        configuration: {
          currency: "USD",
          currencySymbol: "$",
          timezone: "America/New_York",
          primaryLanguage: "en",
          supportedLanguages: ["en", "es"],
          numberFormat: "INTERNATIONAL",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&auto=format&fit=crop&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1600&auto=format&fit=crop&q=80",
          primaryColor: "#E50914",
        },
        metricsSnapshot: {
          rating: 4.95,
          reviewsCount: 5210,
          liveOccupancyPercent: 61.0,
          todayRevenue: 8420,
        },
        createdAt: "2026-02-01T10:00:00.000Z",
        updatedAt: "2026-11-12T16:00:00.000Z",
      },

      // 3. Dubai Palms
      {
        theatreId: "th-dxb-001",
        slug: "cinesphere-dubai-palms",
        code: "CSP-DXB-01",
        name: "CineSphere Dubai Palms",
        legalName: "CineSphere Middle East FZ-LLC",
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        isVerified: true,
        theatreType: "PREMIUM",
        chainType: "CHAIN",
        chainName: "CineSphere Gulf",
        businessCategory: "FREE_ZONE_LLC",
        gstNumber: "AE-TRN-10029482019",
        location: {
          city: "Dubai",
          state: "Dubai",
          country: "United Arab Emirates",
          area: "Palm Jumeirah",
          postalCode: "00000",
          addressLine1: "Nakheel Mall, Crescent Road",
          latitude: 25.1124,
          longitude: 55.139,
          geohash: "thrrx49j",
        },
        screensCount: 5,
        totalCapacity: 1010,
        screenTypes: ["Laser Ultra 4K", "VIP Lounge", "Dolby Atmos"],
        amenityCodes: ["AMN-LASER-ULTRA", "AMN-VIP-LOUNGE", "AMN-DOLBY-ATMOS", "AMN-VALET"],
        amenityNames: ["Laser Ultra 4K", "VIP Lounge", "Dolby Atmos", "Dedicated Valet Drop-off & Retrieval"],
        primaryAdmin: {
          id: "usr-th-dxb",
          name: "Tariq Al-Mansoor",
          email: "tariq.almansoor@cinesphere.ae",
          phone: "+971 50 123 4567",
          designation: "Operations Head",
        },
        configuration: {
          currency: "AED",
          currencySymbol: "AED ",
          timezone: "Asia/Dubai",
          primaryLanguage: "ar",
          supportedLanguages: ["ar", "en"],
          numberFormat: "INTERNATIONAL",
          timeFormat: "24H",
        },
        branding: {
          logoUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&auto=format&fit=crop&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
          primaryColor: "#D97706",
        },
        metricsSnapshot: {
          rating: 4.88,
          reviewsCount: 2190,
          liveOccupancyPercent: 74.0,
          todayRevenue: 32400,
        },
        createdAt: "2026-03-10T08:00:00.000Z",
        updatedAt: "2026-11-14T11:00:00.000Z",
      },

      // 4. Delhi Connaught (Pending Approval)
      {
        theatreId: "th-del-001",
        slug: "cinesphere-imperial-delhi",
        code: "CSP-DEL-01",
        name: "CineSphere Imperial Connaught",
        legalName: "Delhi Cinema Exhibition Private Limited",
        status: "PENDING_APPROVAL",
        approvalStatus: "PENDING",
        isVerified: false,
        theatreType: "STANDARD",
        chainType: "INDEPENDENT",
        chainName: null,
        businessCategory: "PRIVATE_LIMITED",
        gstNumber: "07AABCC1234F1Z5",
        location: {
          city: "New Delhi",
          state: "Delhi",
          country: "India",
          area: "Connaught Place",
          postalCode: "110001",
          addressLine1: "Radial Road 4, Inner Circle",
          latitude: 28.6328,
          longitude: 77.2197,
        },
        screensCount: 3,
        totalCapacity: 650,
        screenTypes: ["Dolby 7.1", "Standard Digital 4K"],
        amenityCodes: ["AMN-DOLBY-71", "AMN-CAFETERIA"],
        amenityNames: ["Dolby 7.1 Sound", "Gourmet Cafeteria"],
        primaryAdmin: {
          id: "usr-th-del",
          name: "Neha Verma",
          email: "neha.verma@cinesphere.in",
          phone: "+91 98111 22334",
          designation: "Theatre Manager",
        },
        configuration: {
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
          primaryLanguage: "en",
          supportedLanguages: ["en", "hi"],
          numberFormat: "INDIAN",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: null,
          bannerUrl: null,
          primaryColor: "#3B82F6",
        },
        metricsSnapshot: {
          rating: 4.5,
          reviewsCount: 320,
        },
        createdAt: "2026-04-05T12:00:00.000Z",
        updatedAt: "2026-10-20T09:30:00.000Z",
      },

      // 5. Bengaluru Nexus (Suspended)
      {
        theatreId: "th-blr-001",
        slug: "cinesphere-nexus-bengaluru",
        code: "CSP-BLR-01",
        name: "CineSphere Koramangala Nexus",
        legalName: "Nexus Screen Ventures India",
        status: "SUSPENDED",
        approvalStatus: "APPROVED",
        isVerified: true,
        theatreType: "STANDARD",
        chainType: "INDEPENDENT",
        chainName: null,
        businessCategory: "PARTNERSHIP",
        gstNumber: "29AABCN8890K1Z9",
        location: {
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
          area: "Koramangala",
          postalCode: "560095",
          addressLine1: "Nexus Mall, 80 Feet Road",
          latitude: 12.9352,
          longitude: 77.6245,
        },
        screensCount: 4,
        totalCapacity: 780,
        screenTypes: ["Laser 4K", "Dolby Atmos"],
        amenityCodes: ["AMN-DOLBY-ATMOS", "AMN-FOOD-COURT"],
        amenityNames: ["Dolby Atmos 64-Channel Spatial Audio", "Multiplex Food Court"],
        primaryAdmin: {
          id: "usr-th-blr",
          name: "Vikram Hegde",
          email: "vikram.hegde@cinesphere.in",
          phone: "+91 98450 99887",
        },
        configuration: {
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
          primaryLanguage: "en",
          supportedLanguages: ["en", "kn", "hi"],
          numberFormat: "INDIAN",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: null,
          bannerUrl: null,
          primaryColor: "#10B981",
        },
        metricsSnapshot: {
          rating: 4.6,
          reviewsCount: 1420,
        },
        createdAt: "2026-02-18T14:00:00.000Z",
        updatedAt: "2026-09-01T15:20:00.000Z",
      },

      // 6. Goa Miramar (Archived)
      {
        theatreId: "th-goa-001",
        slug: "cinesphere-miramar-goa",
        code: "CSP-GOA-01",
        name: "CineSphere Miramar Beachfront",
        legalName: "Goa Coastal Entertainment Limited",
        status: "ARCHIVED",
        approvalStatus: "APPROVED",
        isVerified: false,
        theatreType: "STANDARD",
        chainType: "INDEPENDENT",
        chainName: null,
        businessCategory: "SINGLE_SCREEN",
        gstNumber: "30AABCG4567M1Z2",
        location: {
          city: "Panaji",
          state: "Goa",
          country: "India",
          area: "Miramar Beach",
          postalCode: "403001",
          addressLine1: "Dayanand Bandodkar Marg",
          latitude: 15.485,
          longitude: 73.812,
        },
        screensCount: 2,
        totalCapacity: 420,
        screenTypes: ["Dolby 7.1"],
        amenityCodes: ["AMN-DOLBY-71"],
        amenityNames: ["Dolby 7.1 Sound"],
        primaryAdmin: {
          id: "usr-th-goa",
          name: "Antonio D'Souza",
          email: "antonio@cinesphere.in",
        },
        configuration: {
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
          primaryLanguage: "en",
          supportedLanguages: ["en"],
          numberFormat: "INDIAN",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: null,
          bannerUrl: null,
          primaryColor: "#6B7280",
        },
        metricsSnapshot: {
          rating: 4.2,
          reviewsCount: 450,
        },
        createdAt: "2025-11-10T10:00:00.000Z",
        updatedAt: "2026-08-15T18:00:00.000Z",
      },

      // 7. Kolkata Park Street (Draft)
      {
        theatreId: "th-kol-001",
        slug: "cinesphere-parkstreet-kolkata",
        code: "CSP-KOL-01",
        name: "CineSphere Park Street Victoria",
        legalName: "Victoria Cinema Works Private Limited",
        status: "DRAFT",
        approvalStatus: "PENDING",
        isVerified: false,
        theatreType: "STANDARD",
        chainType: "INDEPENDENT",
        chainName: null,
        businessCategory: "PRIVATE_LIMITED",
        gstNumber: "19AABCV9901P1Z4",
        location: {
          city: "Kolkata",
          state: "West Bengal",
          country: "India",
          area: "Park Street",
          postalCode: "700016",
          addressLine1: "Park Street Crossing",
          latitude: 22.551,
          longitude: 88.352,
        },
        screensCount: 3,
        totalCapacity: 590,
        screenTypes: ["Dolby 7.1"],
        amenityCodes: ["AMN-DOLBY-71"],
        amenityNames: ["Dolby 7.1 Sound"],
        primaryAdmin: {
          id: "usr-th-kol",
          name: "Debashis Roy",
          email: "debashis@cinesphere.in",
        },
        configuration: {
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
          primaryLanguage: "en",
          supportedLanguages: ["en", "bn"],
          numberFormat: "INDIAN",
          timeFormat: "12H",
        },
        branding: {
          logoUrl: null,
          bannerUrl: null,
          primaryColor: "#EC4899",
        },
        metricsSnapshot: {
          rating: 4.3,
          reviewsCount: 110,
        },
        createdAt: "2026-10-01T11:00:00.000Z",
        updatedAt: "2026-11-05T12:00:00.000Z",
      },
    ];

    for (const raw of rawTheatres) {
      const doc: TheatreSearchDocument = {
        ...raw,
        searchableText: this.buildSearchableText(raw),
      };
      this.indexStore.set(doc.theatreId, doc);
    }
  }

  private seedDefaultPresets(): void {
    const adminPresets: SavedSearchPreset[] = [
      {
        id: "preset-pending-approval",
        userId: "usr-super-1",
        name: "Pending Approval Theatres",
        description: "Exhibitors awaiting review and verification approval",
        filters: { statuses: ["PENDING_APPROVAL"] },
        sortBy: "NEWEST",
        sortDirection: "desc",
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "preset-maharashtra-premium",
        userId: "usr-super-1",
        name: "Premium Circuits in Maharashtra",
        description: "Active flagship multi-screen luxury complexes in Maharashtra",
        filters: { states: ["Maharashtra"], theatreType: "PREMIUM", statuses: ["ACTIVE"] },
        sortBy: "MOST_SCREENS",
        sortDirection: "desc",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.savedPresetsStore.set("usr-super-1", adminPresets);
  }

  /**
   * Pre-generates unified searchable text string for ultra-fast token matching.
   */
  private buildSearchableText(doc: Omit<TheatreSearchDocument, "searchableText">): string {
    return [
      doc.name,
      doc.legalName,
      doc.slug,
      doc.code,
      doc.chainName || "",
      doc.businessCategory,
      doc.gstNumber,
      doc.cinNumber || "",
      doc.panNumber || "",
      doc.location.city,
      doc.location.state,
      doc.location.country,
      doc.location.area,
      doc.location.postalCode,
      doc.location.addressLine1,
      doc.primaryAdmin.name,
      doc.primaryAdmin.email,
      ...doc.screenTypes,
      ...doc.amenityNames,
      ...doc.amenityCodes,
      ...doc.configuration.supportedLanguages,
      doc.configuration.currency,
      doc.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  // ----------------------------------------------------------------------------
  // 2. Query Search Index
  // ----------------------------------------------------------------------------
  public query(
    filters: TheatreSearchFilters = {},
    sortBy: TheatreSearchSortOption = "NEWEST",
    sortDirection: "asc" | "desc" = "desc",
    page: number = 1,
    pageSize: number = 12
  ): TheatreSearchResultsPayload {
    const startTime = Date.now();
    let documents = Array.from(this.indexStore.values());

    // 1. Text Query Filter
    const tokens = tokenizeSearchQuery(filters.query || "");
    const scoredDocs: { doc: TheatreSearchDocument; score: number; highlights: string[] }[] = [];

    for (const doc of documents) {
      if (tokens.length > 0) {
        const fields = [
          { text: doc.name, weight: 10 },
          { text: doc.slug, weight: 8 },
          { text: doc.code, weight: 7 },
          { text: doc.location.city, weight: 6 },
          { text: doc.location.area, weight: 5 },
          { text: doc.legalName, weight: 5 },
          { text: doc.gstNumber, weight: 4 },
          { text: doc.primaryAdmin.name, weight: 4 },
          { text: doc.primaryAdmin.email, weight: 4 },
          { text: doc.amenityNames.join(" "), weight: 3 },
          { text: doc.searchableText, weight: 1 },
        ];

        const match = calculateMatchScore(tokens, fields);
        if (match.score > 0) {
          scoredDocs.push({
            doc,
            score: match.score,
            highlights: match.matchedTokens,
          });
        }
      } else {
        scoredDocs.push({ doc, score: 1, highlights: [] });
      }
    }

    // 2. Apply Dimensional & Attribute Filters
    const filtered = scoredDocs.filter(({ doc }) => {
      // Status filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(doc.status)) return false;
      }

      // Verification filter
      if (typeof filters.isVerified === "boolean") {
        if (doc.isVerified !== filters.isVerified) return false;
      }

      // Theatre Type filter (PREMIUM / STANDARD)
      if (filters.theatreType && filters.theatreType !== "ALL") {
        if (doc.theatreType !== filters.theatreType) return false;
      }

      // Chain Type filter (CHAIN / INDEPENDENT)
      if (filters.chainType && filters.chainType !== "ALL") {
        if (doc.chainType !== filters.chainType) return false;
      }

      // Chain Name filter
      if (filters.chainName && filters.chainName.trim()) {
        const searchChain = filters.chainName.trim().toLowerCase();
        if (!doc.chainName || !doc.chainName.toLowerCase().includes(searchChain)) return false;
      }

      // Business Category filter (Multiple)
      if (filters.businessCategories && filters.businessCategories.length > 0) {
        if (!filters.businessCategories.includes(doc.businessCategory)) return false;
      }

      // Country filter (Multiple)
      if (filters.countries && filters.countries.length > 0) {
        if (!filters.countries.includes(doc.location.country)) return false;
      }

      // State filter (Multiple)
      if (filters.states && filters.states.length > 0) {
        if (!filters.states.includes(doc.location.state)) return false;
      }

      // City filter (Multiple)
      if (filters.cities && filters.cities.length > 0) {
        if (!filters.cities.includes(doc.location.city)) return false;
      }

      // Timezone filter (Multiple)
      if (filters.timezones && filters.timezones.length > 0) {
        if (!filters.timezones.includes(doc.configuration.timezone)) return false;
      }

      // Currency filter (Multiple)
      if (filters.currencies && filters.currencies.length > 0) {
        if (!filters.currencies.includes(doc.configuration.currency)) return false;
      }

      // Languages filter (Multiple)
      if (filters.languages && filters.languages.length > 0) {
        const docLangs = new Set([doc.configuration.primaryLanguage, ...doc.configuration.supportedLanguages]);
        const hasMatch = filters.languages.some((l) => docLangs.has(l));
        if (!hasMatch) return false;
      }

      // Amenities filter (Multiple - matches code or partial name)
      if (filters.amenities && filters.amenities.length > 0) {
        const allDocAmenities = [...doc.amenityCodes, ...doc.amenityNames].map((a) => a.toLowerCase());
        const hasAllRequestedAmenities = filters.amenities.every((req) => {
          const reqLower = req.toLowerCase();
          return allDocAmenities.some((docA) => docA.includes(reqLower));
        });
        if (!hasAllRequestedAmenities) return false;
      }

      // Screens Count range
      if (typeof filters.screensMin === "number" && doc.screensCount < filters.screensMin) {
        return false;
      }
      if (typeof filters.screensMax === "number" && doc.screensCount > filters.screensMax) {
        return false;
      }

      // Total Capacity range
      if (typeof filters.capacityMin === "number" && doc.totalCapacity < filters.capacityMin) {
        return false;
      }
      if (typeof filters.capacityMax === "number" && doc.totalCapacity > filters.capacityMax) {
        return false;
      }

      // Date Created range
      if (filters.createdAfter && new Date(doc.createdAt) < new Date(filters.createdAfter)) {
        return false;
      }
      if (filters.createdBefore && new Date(doc.createdAt) > new Date(filters.createdBefore)) {
        return false;
      }

      // Date Updated range
      if (filters.updatedAfter && new Date(doc.updatedAt) < new Date(filters.updatedAfter)) {
        return false;
      }
      if (filters.updatedBefore && new Date(doc.updatedAt) > new Date(filters.updatedBefore)) {
        return false;
      }

      return true;
    });

    // 3. Facet Distributions (calculated over all matched items before pagination)
    const matchedDocs = filtered.map((f) => f.doc);
    const facets = {
      cities: buildFacetDistribution(matchedDocs, (d) => d.location.city),
      states: buildFacetDistribution(matchedDocs, (d) => d.location.state),
      countries: buildFacetDistribution(matchedDocs, (d) => d.location.country),
      statuses: buildFacetDistribution(matchedDocs, (d) => d.status),
      businessCategories: buildFacetDistribution(matchedDocs, (d) => d.businessCategory),
      theatreTypes: buildFacetDistribution(matchedDocs, (d) => d.theatreType),
      amenities: buildFacetDistribution(matchedDocs, (d) => d.amenityNames),
      currencies: buildFacetDistribution(matchedDocs, (d) => d.configuration.currency),
    };

    // 4. Sorting
    const sorted = [...filtered].sort((a, b) => {
      // When a text query is present and no custom sort requested, prioritize relevance score
      if (tokens.length > 0 && sortBy === "NEWEST" && a.score !== b.score) {
        return b.score - a.score;
      }

      switch (sortBy) {
        case "NEWEST":
          return sortDirection === "asc"
            ? new Date(a.doc.createdAt).getTime() - new Date(b.doc.createdAt).getTime()
            : new Date(b.doc.createdAt).getTime() - new Date(a.doc.createdAt).getTime();
        case "OLDEST":
          return sortDirection === "desc"
            ? new Date(b.doc.createdAt).getTime() - new Date(a.doc.createdAt).getTime()
            : new Date(a.doc.createdAt).getTime() - new Date(b.doc.createdAt).getTime();
        case "NAME_ASC":
          return a.doc.name.localeCompare(b.doc.name);
        case "NAME_DESC":
          return b.doc.name.localeCompare(a.doc.name);
        case "RECENTLY_UPDATED":
          return new Date(b.doc.updatedAt).getTime() - new Date(a.doc.updatedAt).getTime();
        case "MOST_SCREENS":
          return b.doc.screensCount - a.doc.screensCount;
        case "LARGEST_CAPACITY":
          return b.doc.totalCapacity - a.doc.totalCapacity;
        case "DISTANCE_ASC":
          // Placeholder: keep order
          return 0;
        default:
          return new Date(b.doc.createdAt).getTime() - new Date(a.doc.createdAt).getTime();
      }
    });

    // 5. Pagination
    const { paginatedItems, pagination } = applyPagination(sorted, page, pageSize);

    // 6. Map to UI DTOs
    const items: TheatreSearchResultItem[] = paginatedItems.map(({ doc, highlights }) => ({
      theatreId: doc.theatreId,
      theatreName: doc.name,
      theatreSlug: doc.slug,
      theatreCode: doc.code,
      legalName: doc.legalName,
      status: doc.status,
      approvalStatus: doc.approvalStatus,
      isVerified: doc.isVerified,
      theatreType: doc.theatreType,
      chainType: doc.chainType,
      chainName: doc.chainName,
      businessCategory: doc.businessCategory,
      city: doc.location.city,
      state: doc.location.state,
      country: doc.location.country,
      area: doc.location.area,
      postalCode: doc.location.postalCode,
      screensCount: doc.screensCount,
      totalCapacity: doc.totalCapacity,
      screenTypes: doc.screenTypes,
      amenitiesSummary: doc.amenityNames.slice(0, 4),
      primaryAdmin: {
        id: doc.primaryAdmin.id,
        name: doc.primaryAdmin.name,
        email: doc.primaryAdmin.email,
        phone: doc.primaryAdmin.phone,
      },
      configuration: doc.configuration,
      logoUrl: doc.branding.logoUrl,
      bannerUrl: doc.branding.bannerUrl,
      rating: doc.metricsSnapshot.rating,
      reviewsCount: doc.metricsSnapshot.reviewsCount,
      todayRevenue: doc.metricsSnapshot.todayRevenue,
      occupancyPercent: doc.metricsSnapshot.liveOccupancyPercent,
      createdDate: doc.createdAt,
      updatedDate: doc.updatedAt,
      matchHighlights: highlights,
    }));

    const tookMs = Date.now() - startTime;

    return {
      items,
      pagination,
      facets,
      tookMs,
      appliedFilters: filters,
      sortBy,
    };
  }

  // ----------------------------------------------------------------------------
  // 3. Search Autocomplete Suggestions
  // ----------------------------------------------------------------------------
  public getSuggestions(query: string, limit: number = 5): TheatreSearchSuggestion[] {
    const rawTokens = tokenizeSearchQuery(query);
    if (rawTokens.length === 0) return [];

    const suggestions: TheatreSearchSuggestion[] = [];
    const seenTitles = new Set<string>();

    for (const doc of this.indexStore.values()) {
      const match = calculateMatchScore(rawTokens, [
        { text: doc.name, weight: 10 },
        { text: doc.location.city, weight: 8 },
        { text: doc.chainName || "", weight: 6 },
        { text: doc.amenityNames.join(" "), weight: 4 },
      ]);

      if (match.score > 0 && !seenTitles.has(doc.name)) {
        seenTitles.add(doc.name);
        suggestions.push({
          id: `sug-${doc.theatreId}`,
          theatreId: doc.theatreId,
          slug: doc.slug,
          title: doc.name,
          subtitle: `${doc.location.city}, ${doc.location.state} • ${doc.screensCount} Screens`,
          type: "THEATRE",
          highlightText: match.matchedTokens.join(", "),
        });
        if (suggestions.length >= limit) break;
      }
    }

    return suggestions;
  }

  // ----------------------------------------------------------------------------
  // 4. Saved Search Presets Management
  // ----------------------------------------------------------------------------
  public getSavedPresets(userId: string): SavedSearchPreset[] {
    return [...(this.savedPresetsStore.get(userId) || [])];
  }

  public savePreset(userId: string, preset: SavedSearchPreset): SavedSearchPreset {
    const userPresets = this.savedPresetsStore.get(userId) || [];
    const existingIndex = userPresets.findIndex((p) => p.id === preset.id);

    if (existingIndex >= 0) {
      userPresets[existingIndex] = preset;
    } else {
      userPresets.unshift(preset);
    }

    this.savedPresetsStore.set(userId, userPresets);
    return preset;
  }

  public deletePreset(userId: string, presetId: string): boolean {
    const userPresets = this.savedPresetsStore.get(userId) || [];
    const filtered = userPresets.filter((p) => p.id !== presetId);
    this.savedPresetsStore.set(userId, filtered);
    return filtered.length < userPresets.length;
  }

  // ----------------------------------------------------------------------------
  // 5. Index Synchronization
  // ----------------------------------------------------------------------------
  public getDocument(theatreId: string): TheatreSearchDocument | undefined {
    return this.indexStore.get(theatreId);
  }

  public upsertDocument(doc: TheatreSearchDocument): void {
    const normalized: TheatreSearchDocument = {
      ...doc,
      searchableText: this.buildSearchableText(doc),
      updatedAt: new Date().toISOString(),
    };
    this.indexStore.set(doc.theatreId, normalized);
  }

  public removeDocument(theatreId: string): boolean {
    return this.indexStore.delete(theatreId);
  }

  public getAllDocuments(): TheatreSearchDocument[] {
    return Array.from(this.indexStore.values());
  }
}

export const theatreSearchRepository = new TheatreSearchRepository();
