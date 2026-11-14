/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 12: Theatre Search & Filters Verification Suite
 * ==============================================================================
 * Comprehensive automated verification of:
 * 1. Theatre Search Index Aggregation & Data Integrity
 * 2. Full-Text Multi-Field Search (Name, Slug, Code, Legal, City, Area, GST, Admin, Amenities)
 * 3. Multi-Select Geographical Filtering (Cities, States, Countries)
 * 4. Lifecycle Status & Verification Filtering (Active, Pending, Suspended, Archived, Draft)
 * 5. Classification, Circuit Affiliation & Business Category Filtering
 * 6. Amenities & Screen Formats Intersectional Filtering
 * 7. Numeric Capacity & Screen Count Range Filtering
 * 8. Multi-Attribute Sorting Strategies (Name, Screens, Capacity, Dates)
 * 9. Server-Side Pagination & Facet Distribution Aggregation
 * 10. Autocomplete Search Suggestions
 * 11. Enterprise Saved Search Presets Management (Create, List, Delete)
 * 12. Role-Based Authorization & Tenant Boundary Isolation
 * ==============================================================================
 */

import { theatreSearchService } from "@/lib/services/theatre-search.service";
import { theatreSearchRepository } from "@/lib/repositories/theatre-search.repository";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import { ValidationError } from "@/lib/errors";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  email: "superadmin@cinesphere.io",
  name: "Global Platform Director",
  role: "SUPER_ADMIN",
  permissions: ["*"],
  correlationId: "corr-search-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  email: "pune.admin@cinesphere.in",
  name: "Rajesh Sharma",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["theatres:read", "theatres:update"],
  correlationId: "corr-search-pune",
};

const PUBLIC_GUEST: SecurityActorContext = {
  userId: "usr-guest-anon",
  role: "CUSTOMER",
  permissions: [],
  correlationId: "corr-search-public",
};

async function runSearchVerification() {
  console.log("\n==============================================================================");
  console.log("🔍  CineSphere OS — Phase 3 Part 12 Theatre Search & Filters Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Theatre Search Index Aggregation & Data Integrity
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Theatre Search Index Aggregation & Data Integrity");
  const allDocs = theatreSearchRepository.getAllDocuments();
  assert(allDocs.length >= 7, `Search index contains ${allDocs.length} aggregated theatre documents`);

  const puneDoc = theatreSearchRepository.getDocument("th-pun-001");
  assert(puneDoc !== undefined, "Pune flagship document indexed");
  assert(puneDoc?.name === "CineSphere Grand Cinemas", "Indexed name matches Pune flagship");
  assert(puneDoc?.legalName === "CineSphere Entertainment Private Limited", "Indexed corporate legal name");
  assert(puneDoc?.gstNumber === "27AAACC1206M1ZT", "Indexed statutory GSTIN credential");
  assert(puneDoc?.location.city === "Pune", "Indexed geographical city");
  assert(puneDoc?.screensCount === 8, "Indexed screens count (8 screens)");
  assert(puneDoc?.totalCapacity === 1450, "Indexed total capacity (1450 seats)");
  assert(puneDoc?.primaryAdmin.name === "Rajesh Sharma", "Indexed primary staff admin");
  assert(puneDoc?.configuration.currency === "INR", "Indexed configuration currency INR");
  assert(puneDoc?.configuration.timezone === "Asia/Kolkata", "Indexed timezone Asia/Kolkata");
  assert(puneDoc?.searchableText.includes("pune"), "Pre-normalized searchable text contains tokens");

  // --------------------------------------------------------------------------
  // TEST 2: Full-Text Multi-Field Keyword Search
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Full-Text Multi-Field Keyword Search");

  // Query by Cinema Name token
  const nameSearchResult = await theatreSearchService.searchTheatres({ query: "Grand" }, SUPER_ADMIN);
  assert(nameSearchResult.items.length >= 1, "Found matching cinema by name token 'Grand'");
  assert(nameSearchResult.items[0].theatreId === "th-pun-001", "Top relevance matched Pune Grand Cinemas");

  // Query by City token
  const citySearchResult = await theatreSearchService.searchTheatres({ query: "Mumbai" }, SUPER_ADMIN);
  assert(citySearchResult.items.some((i) => i.theatreId === "th-mum-001"), "Found cinema by city token 'Mumbai'");

  // Query by GST Number
  const gstSearchResult = await theatreSearchService.searchTheatres({ query: "27AAACR8820M1ZX" }, SUPER_ADMIN);
  assert(gstSearchResult.items.length === 1, "Found exact match by 15-char GST number");
  assert(gstSearchResult.items[0].theatreId === "th-mum-001", "Matched Mumbai Royale Palladium via GSTIN");

  // Query by Primary Admin Name
  const adminSearchResult = await theatreSearchService.searchTheatres({ query: "Carlos Mendez" }, SUPER_ADMIN);
  assert(adminSearchResult.items.some((i) => i.theatreId === "th-mum-001"), "Found cinema by primary administrator name");

  // Query by Admin Email
  const emailSearchResult = await theatreSearchService.searchTheatres(
    { query: "tariq.almansoor@cinesphere.ae" },
    SUPER_ADMIN
  );
  assert(emailSearchResult.items.some((i) => i.theatreId === "th-dxb-001"), "Found Dubai cinema by admin email address");

  // Query by Amenity token
  const butlerSearchResult = await theatreSearchService.searchTheatres({ query: "Butler" }, SUPER_ADMIN);
  assert(butlerSearchResult.items.some((i) => i.theatreId === "th-pun-001"), "Found cinema offering 'Butler' dining");

  // --------------------------------------------------------------------------
  // TEST 3: Multi-Select Geographical Filtering (Cities, States, Countries)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Multi-Select Geographical Filtering (Cities, States, Countries)");

  // Multiple Cities
  const multiCityResult = await theatreSearchService.searchTheatres(
    { filters: { cities: ["Pune", "Mumbai"] } },
    SUPER_ADMIN
  );
  assert(multiCityResult.items.length === 2, "Filtered exactly 2 theatres across Pune and Mumbai");
  assert(
    multiCityResult.items.every((i) => i.city === "Pune" || i.city === "Mumbai"),
    "All results strictly belong to requested cities"
  );

  // Single State
  const stateResult = await theatreSearchService.searchTheatres(
    { filters: { states: ["Karnataka"] } },
    SUPER_ADMIN
  );
  assert(stateResult.items.length === 1, "Filtered 1 theatre in Karnataka state");
  assert(stateResult.items[0].theatreId === "th-blr-001", "Matched Bengaluru Nexus complex");

  // Country
  const countryResult = await theatreSearchService.searchTheatres(
    { filters: { countries: ["United Arab Emirates"] } },
    SUPER_ADMIN
  );
  assert(countryResult.items.length === 1, "Filtered 1 theatre in United Arab Emirates");
  assert(countryResult.items[0].city === "Dubai", "Matched Dubai Palms complex");

  // --------------------------------------------------------------------------
  // TEST 4: Lifecycle Status & Verification Filtering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Lifecycle Status & Verification Filtering");

  // Filter Active
  const activeResult = await theatreSearchService.searchTheatres(
    { filters: { statuses: ["ACTIVE"] } },
    SUPER_ADMIN
  );
  assert(activeResult.items.length === 3, "Found 3 ACTIVE theatres (Pune, Mumbai, Dubai)");
  assert(activeResult.items.every((i) => i.status === "ACTIVE"), "All results have ACTIVE status");

  // Filter Pending Approval
  const pendingResult = await theatreSearchService.searchTheatres(
    { filters: { statuses: ["PENDING_APPROVAL"] } },
    SUPER_ADMIN
  );
  assert(pendingResult.items.length === 1, "Found 1 PENDING_APPROVAL theatre");
  assert(pendingResult.items[0].theatreId === "th-del-001", "Matched Delhi complex");

  // Filter Suspended
  const suspendedResult = await theatreSearchService.searchTheatres(
    { filters: { statuses: ["SUSPENDED"] } },
    SUPER_ADMIN
  );
  assert(suspendedResult.items.length === 1, "Found 1 SUSPENDED theatre");
  assert(suspendedResult.items[0].theatreId === "th-blr-001", "Matched Bengaluru complex");

  // Filter Archived
  const archivedResult = await theatreSearchService.searchTheatres(
    { filters: { statuses: ["ARCHIVED"] } },
    SUPER_ADMIN
  );
  assert(archivedResult.items.length === 1, "Found 1 ARCHIVED theatre");
  assert(archivedResult.items[0].theatreId === "th-goa-001", "Matched Goa complex");

  // Filter Verified Only
  const verifiedResult = await theatreSearchService.searchTheatres(
    { filters: { isVerified: true } },
    SUPER_ADMIN
  );
  assert(verifiedResult.items.every((i) => i.isVerified === true), "All results are strictly verified complexes");

  // --------------------------------------------------------------------------
  // TEST 5: Classification, Circuit Affiliation & Business Category Filtering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Classification, Circuit Affiliation & Business Category Filtering");

  // Premium Theatre Type
  const premiumResult = await theatreSearchService.searchTheatres(
    { filters: { theatreType: "PREMIUM" } },
    SUPER_ADMIN
  );
  assert(premiumResult.items.length === 3, "Found 3 PREMIUM flagship theatres");
  assert(premiumResult.items.every((i) => i.theatreType === "PREMIUM"), "All results are PREMIUM format");

  // Standard Theatre Type
  const standardResult = await theatreSearchService.searchTheatres(
    { filters: { theatreType: "STANDARD" } },
    SUPER_ADMIN
  );
  assert(standardResult.items.length === 4, "Found 4 STANDARD theatres");

  // Chain Type
  const chainResult = await theatreSearchService.searchTheatres(
    { filters: { chainType: "CHAIN" } },
    SUPER_ADMIN
  );
  assert(chainResult.items.every((i) => i.chainType === "CHAIN"), "Filtered chain multiplex circuits");

  // Business Category (LLP)
  const llpResult = await theatreSearchService.searchTheatres(
    { filters: { businessCategories: ["LLP"] } },
    SUPER_ADMIN
  );
  assert(llpResult.items.length === 1, "Found 1 LLP registered theatre entity");
  assert(llpResult.items[0].theatreId === "th-mum-001", "Matched Mumbai Royale Palladium");

  // Business Category (FREE_ZONE_LLC)
  const fzResult = await theatreSearchService.searchTheatres(
    { filters: { businessCategories: ["FREE_ZONE_LLC"] } },
    SUPER_ADMIN
  );
  assert(fzResult.items.length === 1, "Found 1 FREE_ZONE_LLC registered entity in Dubai");

  // --------------------------------------------------------------------------
  // TEST 6: Amenities & Screen Formats Intersectional Filtering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Amenities & Screen Formats Intersectional Filtering");

  // IMAX with Laser
  const imaxResult = await theatreSearchService.searchTheatres(
    { filters: { amenities: ["IMAX with Laser"] } },
    SUPER_ADMIN
  );
  assert(imaxResult.items.length === 2, "Found 2 theatres offering IMAX with Laser (Pune & Mumbai)");

  // Multiple amenities (IMAX AND Butler Dining)
  const imaxButlerResult = await theatreSearchService.searchTheatres(
    { filters: { amenities: ["IMAX", "Butler"] } },
    SUPER_ADMIN
  );
  assert(imaxButlerResult.items.length === 1, "Only Pune flagship offers BOTH IMAX and Butler Dining");
  assert(imaxButlerResult.items[0].theatreId === "th-pun-001", "Matched Pune flagship");

  // --------------------------------------------------------------------------
  // TEST 7: Numeric Capacity & Screen Count Range Filtering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Numeric Capacity & Screen Count Range Filtering");

  // Minimum 8 Screens
  const eightScreensResult = await theatreSearchService.searchTheatres(
    { filters: { screensMin: 8 } },
    SUPER_ADMIN
  );
  assert(eightScreensResult.items.length === 2, "Found 2 megacomplexes with 8+ screens");
  assert(eightScreensResult.items.every((i) => i.screensCount >= 8), "Every result has >= 8 screens");

  // Minimum 1500 Seating Capacity
  const capResult = await theatreSearchService.searchTheatres(
    { filters: { capacityMin: 1500 } },
    SUPER_ADMIN
  );
  assert(capResult.items.length === 1, "Found 1 stadium venue with 1500+ seats");
  assert(capResult.items[0].theatreId === "th-mum-001", "Mumbai Palladium has 1940 seats");

  // Maximum 3 Screens
  const smallVenueResult = await theatreSearchService.searchTheatres(
    { filters: { screensMax: 3 } },
    SUPER_ADMIN
  );
  assert(smallVenueResult.items.length === 3, "Found 3 boutique venues with <= 3 screens (Delhi, Goa, Kolkata)");

  // --------------------------------------------------------------------------
  // TEST 8: Multi-Attribute Sorting Strategies
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Multi-Attribute Sorting Strategies");

  // Sort by Name Ascending (A to Z)
  const nameAscResult = await theatreSearchService.searchTheatres(
    { sortBy: "NAME_ASC", sortDirection: "asc" },
    SUPER_ADMIN
  );
  const names = nameAscResult.items.map((i) => i.theatreName);
  const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
  assert(JSON.stringify(names) === JSON.stringify(sortedNames), "Theatres sorted alphabetically A-Z");

  // Sort by Screens Count Descending
  const screenSortResult = await theatreSearchService.searchTheatres(
    { sortBy: "MOST_SCREENS", sortDirection: "desc" },
    SUPER_ADMIN
  );
  const screenCounts = screenSortResult.items.map((i) => i.screensCount);
  assert(screenCounts[0] === 10, "First venue has highest screens count (10 screens)");
  assert(screenCounts[1] === 8, "Second venue has 8 screens");

  // Sort by Total Capacity Descending
  const capSortResult = await theatreSearchService.searchTheatres(
    { sortBy: "LARGEST_CAPACITY", sortDirection: "desc" },
    SUPER_ADMIN
  );
  const capacities = capSortResult.items.map((i) => i.totalCapacity);
  assert(capacities[0] === 1940, "Largest capacity is Mumbai at 1940 seats");
  assert(capacities[1] === 1450, "Second largest capacity is Pune at 1450 seats");

  // --------------------------------------------------------------------------
  // TEST 9: Server-Side Pagination & Facet Distribution Aggregation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Server-Side Pagination & Facet Distribution Aggregation");

  // Page 1 with pageSize: 3
  const page1 = await theatreSearchService.searchTheatres(
    { page: 1, pageSize: 3, sortBy: "NAME_ASC", sortDirection: "asc" },
    SUPER_ADMIN
  );
  assert(page1.items.length === 3, "Page 1 returned exactly 3 items");
  assert(page1.pagination.page === 1, "Pagination reports current page 1");
  assert(page1.pagination.pageSize === 3, "Pagination reports pageSize 3");
  assert(page1.pagination.totalPages >= 3, "Pagination computed total pages >= 3");
  assert(page1.pagination.hasNextPage === true, "Page 1 has next page");
  assert(page1.pagination.hasPrevPage === false, "Page 1 does not have prev page");

  // Page 2 with pageSize: 3
  const page2 = await theatreSearchService.searchTheatres(
    { page: 2, pageSize: 3, sortBy: "NAME_ASC", sortDirection: "asc" },
    SUPER_ADMIN
  );
  assert(page2.items.length === 3, "Page 2 returned next 3 items");
  assert(page2.pagination.page === 2, "Pagination reports page 2");
  assert(page2.pagination.hasPrevPage === true, "Page 2 has previous page");
  assert(page1.items[0].theatreId !== page2.items[0].theatreId, "Page 1 and Page 2 contain non-overlapping items");

  // Facet distributions
  assert(page1.facets.cities.length >= 6, "Facet breakdown contains 6+ cities");
  assert(page1.facets.statuses.length >= 4, "Facet breakdown contains 4+ lifecycle statuses");
  assert(page1.facets.theatreTypes.some((f) => f.value === "PREMIUM"), "Facet contains 'PREMIUM' type bucket");

  // --------------------------------------------------------------------------
  // TEST 10: Autocomplete Search Suggestions
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Autocomplete Search Suggestions");
  const suggestions = await theatreSearchService.getSearchSuggestions("Cine", 5, SUPER_ADMIN);
  assert(suggestions.length >= 1, "Autocomplete returned suggestions for query 'Cine'");
  assert(suggestions.some((s) => s.theatreId === "th-pun-001"), "Autocomplete suggestion includes Pune Grand Cinemas");

  const dubaiSug = await theatreSearchService.getSearchSuggestions("Dubai", 3, SUPER_ADMIN);
  assert(dubaiSug.some((s) => s.theatreId === "th-dxb-001"), "Autocomplete suggestion includes Dubai Palms");

  // --------------------------------------------------------------------------
  // TEST 11: Enterprise Saved Search Presets Management
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 11: Enterprise Saved Search Presets Management");
  const presets = await theatreSearchService.getUserSavedPresets(SUPER_ADMIN);
  assert(presets.length >= 2, "Super Admin retrieved seeded saved search presets");
  assert(presets.some((p) => p.name === "Pending Approval Theatres"), "Preset 'Pending Approval Theatres' exists");
  assert(presets.some((p) => p.name === "Premium Circuits in Maharashtra"), "Preset 'Premium Circuits in Maharashtra' exists");

  // Create a new saved search preset
  const createdPreset = await theatreSearchService.saveSearchPreset(
    {
      name: "Luxury Circuits in Dubai",
      description: "Dubai UAE venues with VIP lounge",
      filters: { cities: ["Dubai"], theatreType: "PREMIUM" },
      sortBy: "NEWEST",
    },
    SUPER_ADMIN
  );
  assert(createdPreset.name === "Luxury Circuits in Dubai", "New search preset successfully persisted");

  const updatedPresets = await theatreSearchService.getUserSavedPresets(SUPER_ADMIN);
  assert(updatedPresets.some((p) => p.id === createdPreset.id), "Saved preset appears in user preset list");

  // Delete saved preset
  const deleteSuccess = await theatreSearchService.deleteSearchPreset(createdPreset.id, SUPER_ADMIN);
  assert(deleteSuccess === true, "Saved search preset successfully deleted");

  // --------------------------------------------------------------------------
  // TEST 12: Role-Based Authorization & Tenant Boundary Isolation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 12: Role-Based Authorization & Tenant Boundary Isolation");

  // Public Guest Search: MUST ONLY SEE ACTIVE & VERIFIED THEATRES
  const publicResults = await theatreSearchService.searchTheatres({}, PUBLIC_GUEST);
  assert(
    publicResults.items.every((i) => i.status === "ACTIVE"),
    "Public search results strictly contain ONLY ACTIVE theatres"
  );
  assert(
    !publicResults.items.some((i) => i.status === "DRAFT"),
    "Public search NEVER exposes DRAFT theatres"
  );
  assert(
    !publicResults.items.some((i) => i.status === "PENDING_APPROVAL"),
    "Public search NEVER exposes PENDING_APPROVAL theatres"
  );
  assert(
    !publicResults.items.some((i) => i.status === "SUSPENDED"),
    "Public search NEVER exposes SUSPENDED theatres"
  );
  assert(
    !publicResults.items.some((i) => i.status === "ARCHIVED"),
    "Public search NEVER exposes ARCHIVED theatres"
  );
  assert(
    publicResults.items.every((i) => i.isVerified === true),
    "Public search strictly enforces isVerified: true"
  );

  // Super Admin Search: CAN SEE ALL STATUSES
  const superResults = await theatreSearchService.searchTheatres({}, SUPER_ADMIN);
  assert(
    superResults.items.some((i) => i.status === "PENDING_APPROVAL"),
    "Super Admin can view PENDING_APPROVAL theatres"
  );
  assert(
    superResults.items.some((i) => i.status === "SUSPENDED"),
    "Super Admin can view SUSPENDED theatres"
  );
  assert(
    superResults.items.some((i) => i.status === "ARCHIVED"),
    "Super Admin can view ARCHIVED theatres"
  );

  // Autocomplete public gating: Guest never gets unapproved suggestions
  const publicSuggestions = await theatreSearchService.getSearchSuggestions("Imperial", 5, PUBLIC_GUEST);
  assert(publicSuggestions.length === 0, "Public guest autocomplete strictly hides pending approval venues");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 12 THEATRE SEARCH & FILTERS TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==============================================================================\n");
}

runSearchVerification().catch((err) => {
  console.error("FATAL ERROR in Theatre Search verification:", err);
  process.exit(1);
});
