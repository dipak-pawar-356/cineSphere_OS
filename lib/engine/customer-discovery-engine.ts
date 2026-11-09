import {
  CustomerCity,
  CustomerDiscoveryFilters,
  CustomerMovieDTO,
  CustomerPriceSummaryDTO,
  CustomerSeatDTO,
  CustomerSectionLegendDTO,
  CustomerSelectedSeatLineItem,
  CustomerShowDetailsResponse,
  CustomerShowDTO,
  CustomerTheatreDTO,
} from "@/types/customer-discovery.types";
import { MOCK_CITIES } from "@/data/common/locations";
import { INITIAL_MASTER_MOVIES } from "@/lib/constants/initial-master-movies";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { DYNAMIC_SHOWS } from "@/data/shows/dynamic-shows";
import {
  LAYOUT_100_SEATS,
  LAYOUT_240_SEATS,
  LAYOUT_68_SEATS,
} from "@/data/halls/reusable-layouts";
import { INITIAL_DYNAMIC_PRICING_PROFILES } from "./pricing-engine";
import { SECTION_CATEGORY_PALETTE } from "@/lib/constants/seating-design-system";

/**
 * ==============================================================================
 * CineSphere OS — Customer Discovery & Booking Engine (Phase 2 – Part 10)
 * ==============================================================================
 * Core Principles:
 * 1. Multiple Customer Entry Journeys (City-first, Movie-first, Theatre-first, Direct-show)
 * 2. Unified Convergence: Every path leads to a single Show ID.
 * 3. Unified Show Loader: Resolves Movie, Theatre, Hall, Layout, Seat Inventory,
 *    Pricing Profile, and Legends internally from that single Show ID.
 * 4. Strict Tenant Isolation: Only published, active records are exposed to patrons.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Unified Master Entity Indexers
// ------------------------------------------------------------------------------

export const ALL_CUSTOMER_CITIES: CustomerCity[] = MOCK_CITIES.map((c) => ({
  id: c.id,
  name: c.name,
  state: c.state,
  theatreCount: c.theatreCount,
  screenCount: c.screenCount,
  isPopular: c.isPopular,
  slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
}));

/**
 * Consolidates Master Movies into Customer-safe DTOs.
 * Strips internal cost, KDM keys, and unreleased platform administration data.
 */
export function getAllPublishedMovies(): CustomerMovieDTO[] {
  const list: CustomerMovieDTO[] = [];
  const seenSlugs = new Set<string>();

  // 1. Initial Master Movies from Phase 2 Part 7
  for (const m of INITIAL_MASTER_MOVIES) {
    if (m.isDeleted) continue;
    seenSlugs.add(m.slug);
    list.push({
      id: m.id,
      slug: m.slug,
      title: m.title,
      originalTitle: m.originalTitle,
      poster: m.posterUrl,
      banner: m.bannerUrl || m.landscapeBannerUrl || m.posterUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
      synopsis: m.synopsis,
      shortDescription: m.shortDescription,
      genre: m.genres,
      languages: m.availableLanguages,
      durationMinutes: m.durationMinutes,
      rating: m.rating || 8.5,
      certification: m.certificate,
      formats: m.formats,
      releaseDate: m.releaseDate,
      status: m.status === "Now Showing" ? "Now Showing" : "Coming Soon",
      director: m.crew.find((c) => c.role === "Director")?.name || "Acclaimed Director",
      cast: m.cast.map((c) => c.actorName),
      isFeatured: m.isFeatured,
      isTrending: m.isTrending,
      startingPrice: 200,
      availableTheatresCount: 3,
      availableShowsCount: 8,
    });
  }

  // 2. Fallback / Additional DUMMY_MOVIES
  for (const dm of DUMMY_MOVIES) {
    if (seenSlugs.has(dm.slug)) continue;
    seenSlugs.add(dm.slug);
    list.push({
      id: dm.id,
      slug: dm.slug,
      title: dm.title,
      poster: dm.poster,
      banner: dm.banner,
      synopsis: dm.description || dm.tagline || "Epic theatrical presentation.",
      shortDescription: dm.tagline,
      genre: dm.genre,
      languages: dm.languages,
      durationMinutes: dm.durationMinutes,
      rating: dm.rating,
      certification: dm.certification,
      formats: dm.formats,
      releaseDate: dm.releaseDate,
      status: dm.isComingSoon ? "Coming Soon" : "Now Showing",
      director: dm.director,
      cast: dm.cast,
      isFeatured: dm.isFeatured,
      isTrending: false,
      startingPrice: 180,
      availableTheatresCount: 2,
      availableShowsCount: 6,
    });
  }

  return list;
}

/**
 * Consolidates Theatres into Customer-safe DTOs with Distance and Pricing.
 */
export function getAllPublishedTheatres(): CustomerTheatreDTO[] {
  const list: CustomerTheatreDTO[] = [];

  // Multi-Tenant Theatres (Phase 2 Part 4)
  for (const t of MULTI_TENANT_THEATRES) {
    list.push({
      id: t.id,
      slug: t.slug,
      name: t.name,
      chain: t.chain,
      city: t.city,
      state: t.state,
      address: t.address,
      distanceKm: t.distanceKm || 3.2,
      distancePlaceholder: `${t.distanceKm || 3.2} km away`,
      rating: t.rating || 4.8,
      reviewsCount: t.reviewsCount || 1200,
      screenTypes: t.screenTypes || ["IMAX", "Dolby Cinema", "Laser 4K"],
      amenities: t.amenities || [
        "Barco 4K Laser Projection",
        "Dolby Atmos 64-Channel Spatial Audio",
        "Zero-Gravity Ultra Recliners",
      ],
      facilities: t.facilities,
      hallCount: t.halls?.length || t.hallCount || 4,
      banner: t.banner || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
      logo: t.logo || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&auto=format&fit=crop&q=80",
      startingPrice: 200,
      availableShowsCount: 6,
    });
  }

  // Global Venue Fallbacks
  for (const dt of DUMMY_THEATRES) {
    if (list.some((item) => item.slug === dt.slug || item.id === dt.id)) continue;
    list.push({
      id: dt.id,
      slug: dt.slug,
      name: dt.name,
      chain: dt.chain,
      city: dt.city,
      state: dt.state,
      address: dt.address,
      distanceKm: dt.distanceKm || 4.5,
      distancePlaceholder: `${dt.distanceKm || 4.5} km away`,
      rating: dt.rating || 4.7,
      reviewsCount: dt.reviewsCount || 850,
      screenTypes: dt.screenTypes || ["Dolby Atmos", "3D"],
      amenities: dt.facilities || ["Laser Dual 4K", "VIP Recliner Lounges"],
      hallCount: dt.hallCount || 6,
      banner: dt.banner,
      logo: dt.logo,
      startingPrice: 180,
      availableShowsCount: 4,
    });
  }

  return list;
}

/**
 * Consolidates Published Shows across all Theatres.
 */
export function getAllPublishedShows(): CustomerShowDTO[] {
  const shows: CustomerShowDTO[] = [];

  for (const s of DYNAMIC_SHOWS) {
    // Only published shows (never cancelled or draft)
    if (s.status === "Cancelled" || s.status === "Draft") continue;

    const theatre =
      MULTI_TENANT_THEATRES.find((t) => t.id === s.theatreId) ||
      DUMMY_THEATRES.find((t) => t.id === s.theatreId) ||
      MULTI_TENANT_THEATRES[0];

    const pricingMap = s.pricing?.sectionPricing || {
      Silver: 200,
      Gold: 280,
      Platinum: 380,
      VIP: 550,
      Recliner: 700,
    };

    const minPrice = Math.min(
      ...Object.values(pricingMap).filter((v) => typeof v === "number" && v > 0),
      s.ticketPrice || 200
    );

    shows.push({
      id: s.id,
      showCode: `SH-${s.id.toUpperCase()}`,
      movieId: s.movieId,
      movieTitle: s.movieTitle,
      moviePosterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
      movieBannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
      movieDurationMinutes: 165,
      movieCertificate: "UA 16+",
      theatreId: theatre.id,
      theatreName: theatre.name,
      theatreCity: theatre.city,
      theatreAddress: theatre.address,
      hallId: s.hallId,
      hallName: s.hallName,
      screenType: s.format,
      date: s.showDate === "Today" ? "2026-11-14" : s.showDate,
      startTime: s.startTime,
      endTime: s.endTime,
      language: s.language,
      format: s.format,
      ticketPrice: minPrice,
      totalSeats: s.totalSeats || 100,
      availableSeats: Math.max(0, (s.totalSeats || 100) - (s.seatsBooked || 12)),
      seatsBooked: s.seatsBooked || 12,
      status: s.status,
      pricingProfileId: "pp-weekday-matinee",
      pricingProfileName: "Weekday Matinee Regular",
      sectionPricing: pricingMap,
    });
  }

  return shows;
}

// ------------------------------------------------------------------------------
// 2. Filter & Discovery Queries
// ------------------------------------------------------------------------------

export function getFilteredMovies(filters: CustomerDiscoveryFilters = {}): CustomerMovieDTO[] {
  let movies = getAllPublishedMovies();

  if (filters.status && filters.status !== "All") {
    movies = movies.filter((m) => m.status === filters.status);
  }

  if (filters.genre && filters.genre !== "All") {
    movies = movies.filter((m) =>
      m.genre.some((g) => g.toLowerCase() === filters.genre?.toLowerCase())
    );
  }

  if (filters.language && filters.language !== "All") {
    movies = movies.filter((m) =>
      m.languages.some((l) => l.toLowerCase() === filters.language?.toLowerCase())
    );
  }

  if (filters.format && filters.format !== "All") {
    movies = movies.filter((m) =>
      m.formats.some((f) => f.toLowerCase() === filters.format?.toLowerCase())
    );
  }

  if (filters.certificate && filters.certificate !== "All") {
    movies = movies.filter((m) => m.certification === filters.certificate);
  }

  if (filters.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    movies = movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.some((g) => g.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (m.cast && m.cast.some((c) => c.toLowerCase().includes(q)))
    );
  }

  return movies;
}

export function getFilteredTheatres(filters: CustomerDiscoveryFilters = {}): CustomerTheatreDTO[] {
  let theatres = getAllPublishedTheatres();

  if (filters.city && filters.city !== "All") {
    theatres = theatres.filter(
      (t) => t.city.toLowerCase() === filters.city?.toLowerCase()
    );
  }

  if (filters.format && filters.format !== "All") {
    theatres = theatres.filter((t) =>
      t.screenTypes.some((f) => f.toLowerCase().includes(filters.format!.toLowerCase()))
    );
  }

  if (filters.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    theatres = theatres.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.chain.toLowerCase().includes(q)
    );
  }

  return theatres;
}

export function getFilteredShows(filters: CustomerDiscoveryFilters = {}): CustomerShowDTO[] {
  let shows = getAllPublishedShows();

  if (filters.city && filters.city !== "All") {
    shows = shows.filter(
      (s) => s.theatreCity.toLowerCase() === filters.city?.toLowerCase()
    );
  }

  if (filters.movieId) {
    const targetMovie = filters.movieId.toLowerCase();
    shows = shows.filter(
      (s) => s.movieId === filters.movieId || s.movieTitle.toLowerCase().includes(targetMovie)
    );
  }

  if (filters.theatreId) {
    shows = shows.filter((s) => s.theatreId === filters.theatreId);
  }

  if (filters.format && filters.format !== "All") {
    shows = shows.filter((s) => s.format.toLowerCase().includes(filters.format!.toLowerCase()));
  }

  if (filters.language && filters.language !== "All") {
    shows = shows.filter((s) => s.language.toLowerCase() === filters.language!.toLowerCase());
  }

  if (filters.date) {
    shows = shows.filter((s) => s.date === filters.date || s.date === "Today");
  }

  return shows;
}

// ------------------------------------------------------------------------------
// 3. Central Unified Show Resolution API (Single Show ID Resolver)
// ------------------------------------------------------------------------------

/**
 * Resolves the complete unified snapshot from a single Show ID.
 * Loads Movie, Theatre, Hall, Layout, Seat Inventory, Pricing, and Legends.
 */
export function getUnifiedCustomerShowDetails(showId: string): CustomerShowDetailsResponse {
  const allShows = getAllPublishedShows();
  const show = allShows.find((s) => s.id === showId) || allShows[0];

  // 1. Resolve Movie
  const allMovies = getAllPublishedMovies();
  const movie =
    allMovies.find(
      (m) =>
        m.id === show.movieId ||
        m.title.toLowerCase().includes(show.movieTitle.toLowerCase()) ||
        show.movieTitle.toLowerCase().includes(m.title.toLowerCase())
    ) || allMovies[0];

  // 2. Resolve Theatre
  const allTheatres = getAllPublishedTheatres();
  const theatre =
    allTheatres.find((t) => t.id === show.theatreId) ||
    allTheatres.find((t) => t.name.toLowerCase().includes(show.theatreName.toLowerCase())) ||
    allTheatres[0];

  // 3. Resolve Hall and Physical Layout
  let rawLayout = LAYOUT_100_SEATS;
  if (theatre.id === "th-mum-001" || show.hallId.includes("mum")) {
    rawLayout = LAYOUT_240_SEATS;
  } else if (theatre.id === "th-ahd-001" || show.hallId.includes("ahd")) {
    rawLayout = LAYOUT_68_SEATS;
  }

  // 4. Resolve Pricing Profile
  const profile =
    INITIAL_DYNAMIC_PRICING_PROFILES.find((p) => p.id === show.pricingProfileId) ||
    INITIAL_DYNAMIC_PRICING_PROFILES[1]; // Weekday Matinee Regular

  const sectionPricingMap: Record<string, number> = {
    ...profile.tierPricing,
    ...show.sectionPricing,
  };

  // 5. Build Customer Layout DTO
  const layoutSections = rawLayout.sections.map((sec) => {
    const tierName = sec.name.replace(/Section\s+/i, "").trim() || "Silver";
    const mappedTier =
      tierName.includes("Royal")
        ? "Royal Suite"
        : tierName.includes("VIP")
        ? "VIP"
        : tierName.includes("Platinum")
        ? "Platinum"
        : tierName.includes("Gold") || tierName === "B"
        ? "Gold"
        : "Silver";

    const designToken = SECTION_CATEGORY_PALETTE[mappedTier] || SECTION_CATEGORY_PALETTE["Silver"];
    const price =
      sectionPricingMap[sec.name] ||
      sectionPricingMap[mappedTier] ||
      profile.tierPricing[mappedTier] ||
      250;

    return {
      id: sec.id,
      name: sec.name,
      tier: mappedTier,
      rows: sec.rows || ["A", "B", "C"],
      seatsPerRow: sec.seatsPerRow || 10,
      color: designToken.color,
      price,
    };
  });

  const customerLayout = {
    id: rawLayout.id,
    hallId: show.hallId,
    name: rawLayout.name,
    capacity: rawLayout.capacity,
    screenDirection: "TOP" as const,
    screenCurvature: 0.15,
    sections: layoutSections,
  };

  // 6. Generate Show Seat Inventory
  // Deterministically synthesizes seats from the layout and assigns section prices
  const customerSeats: CustomerSeatDTO[] = [];
  const bookedSampleSet = new Set(["A2", "A3", "B5", "B6", "C8", "C9", "D1", "D2"]);
  const reservedSampleSet = new Set(["B1", "B2"]);

  for (const sec of customerLayout.sections) {
    const rows = sec.rows.length > 0 ? sec.rows : ["A"];
    const seatsPerRow = sec.seatsPerRow;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const rowLabel = rows[rIdx];
      for (let col = 1; col <= seatsPerRow; col++) {
        const seatNumber = `${rowLabel}${col}`;
        const isBooked = bookedSampleSet.has(seatNumber);
        const isReserved = reservedSampleSet.has(seatNumber);
        const isWheelchair = col === 1 && rowLabel === rows[0] && sec.tier === "Silver";
        const isRecliner = sec.tier === "VIP" || sec.tier === "Recliner" || sec.tier === "Royal Suite";

        const status = isBooked
          ? "Booked"
          : isReserved
          ? "Reserved"
          : "Available";

        customerSeats.push({
          id: `${show.id}-${sec.id}-${seatNumber}`,
          showId: show.id,
          seatNumber,
          row: rowLabel,
          column: col,
          sectionId: sec.id,
          sectionName: sec.name,
          categoryTier: sec.tier,
          seatType: isWheelchair ? "Wheelchair" : isRecliner ? "Recliner" : "Standard",
          status,
          price: sec.price,
          isWheelchair,
          isRecliner,
          coordinates: {
            x: col * 36,
            y: (rIdx + 1) * 38,
          },
        });
      }
    }
  }

  // 7. Calculate Section Legends with Colors & Seat Counts
  const sectionLegends: CustomerSectionLegendDTO[] = customerLayout.sections.map((sec) => {
    const secSeats = customerSeats.filter((s) => s.sectionId === sec.id);
    const availableSeats = secSeats.filter((s) => s.status === "Available").length;
    const occupiedSeats = secSeats.length - availableSeats;
    const token = SECTION_CATEGORY_PALETTE[sec.tier] || SECTION_CATEGORY_PALETTE["Silver"];

    return {
      sectionId: sec.id,
      sectionName: sec.name,
      categoryTier: sec.tier,
      color: token.color,
      bgClass: token.bgClass,
      borderClass: token.borderClass,
      textClass: token.textClass,
      price: sec.price,
      totalSeats: secSeats.length,
      availableSeats,
      occupiedSeats,
    };
  });

  // 8. Calculate Capacity Metrics
  const totalSeats = customerSeats.length;
  const bookedSeats = customerSeats.filter((s) => s.status === "Booked").length;
  const blockedSeats = customerSeats.filter(
    (s) => s.status === "Reserved" || s.status === "Blocked" || s.status === "Maintenance"
  ).length;
  const availableSeats = Math.max(0, totalSeats - bookedSeats - blockedSeats);
  const occupancyPercent = totalSeats > 0 ? Math.round(((bookedSeats + blockedSeats) / totalSeats) * 100) : 0;

  return {
    show: {
      ...show,
      movieTitle: movie.title,
      moviePosterUrl: movie.poster,
      movieBannerUrl: movie.banner,
      movieDurationMinutes: movie.durationMinutes,
      movieCertificate: movie.certification,
      theatreName: theatre.name,
      theatreCity: theatre.city,
      theatreAddress: theatre.address,
      totalSeats,
      availableSeats,
      seatsBooked: bookedSeats,
      sectionPricing: sectionPricingMap,
    },
    movie,
    theatre,
    hall: {
      id: show.hallId,
      theatreId: theatre.id,
      name: show.hallName,
      hallNumber: 1,
      screenType: show.format,
      capacity: totalSeats,
      soundSystem: "Dolby Atmos 64-Channel Commercial Spatial Array",
      projectionType: "Barco Dual 4K Pure RGB Laser",
    },
    layout: customerLayout,
    seatInventory: customerSeats,
    pricingProfile: {
      id: profile.id,
      name: profile.name,
      code: profile.code,
      convenienceFee: profile.convenienceFee || 35,
      gstPercent: profile.gstPercent || 18,
      currency: "INR",
    },
    sectionLegends,
    capacityMetrics: {
      totalSeats,
      availableSeats,
      bookedSeats,
      blockedSeats,
      occupancyPercent,
    },
  };
}

// ------------------------------------------------------------------------------
// 4. Price Summary Calculator (UI Selection only)
// ------------------------------------------------------------------------------

export function calculateCustomerPriceSummary(
  selectedSeatNumbers: string[],
  showDetails: CustomerShowDetailsResponse
): CustomerPriceSummaryDTO {
  const lineItems: CustomerSelectedSeatLineItem[] = [];
  let seatSubtotal = 0;

  for (const num of selectedSeatNumbers) {
    const seat = showDetails.seatInventory.find((s) => s.seatNumber === num);
    if (!seat) continue;

    lineItems.push({
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      sectionName: seat.sectionName,
      categoryTier: String(seat.categoryTier),
      unitPrice: seat.price,
    });

    seatSubtotal += seat.price;
  }

  const convenienceFeePerSeat = showDetails.pricingProfile.convenienceFee || 35;
  const convenienceFeeTotal = lineItems.length * convenienceFeePerSeat;
  const gstPercent = showDetails.pricingProfile.gstPercent || 18;
  const gstTaxTotal = Math.round((convenienceFeeTotal * gstPercent) / 100);
  const discountTotal = 0; // Architecture placeholder for Phase 2 Part 11
  const grandTotal = Math.max(0, seatSubtotal + convenienceFeeTotal + gstTaxTotal - discountTotal);

  return {
    currency: showDetails.pricingProfile.currency || "INR",
    selectedSeats: lineItems,
    seatCount: lineItems.length,
    seatSubtotal,
    convenienceFeePerSeat,
    convenienceFeeTotal,
    gstPercent,
    gstTaxTotal,
    discountTotal,
    grandTotal,
  };
}
