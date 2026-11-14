/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 13 Public Theatre Page Verification Suite
 * ==============================================================================
 * Comprehensive automated verification matrix:
 * 1.  Public Read Model Aggregation & Entity Decoupling
 * 2.  Strict Security & Information Disclosure Prevention (Zero Internal Data)
 * 3.  Content Visibility & Approval Gates (Draft/Pending/Archived blocked)
 * 4.  Dynamic Branding & Sequential Gallery Delivery
 * 5.  Running Movies vs Upcoming Movies Separation
 * 6.  Available Shows with Seat Quotas & Formatted Prices
 * 7.  Auditorium Fleet Specifications (Laser & Spatial Audio)
 * 8.  Public Amenities & Verified Facility Categories
 * 9.  Geographic Location, Direction URLs & Public Contact Desks
 * 10. Operating Hours, Today's Status & Weekly Rotations
 * 11. SEO Metadata & Schema.org MovieTheater JSON-LD
 * 12. Multi-Tenant Autonomous Localization (Pune INR vs Mumbai USD vs Dubai AED)
 * ==============================================================================
 */

import { publicTheatreService } from "../lib/services/public-theatre.service";
import {
  loadPublicTheatreAction,
  loadPublicTheatreShowsAction,
  loadPublicTheatreMoviesAction,
  loadPublicTheatreAmenitiesAction,
  loadPublicTheatreGalleryAction,
  loadPublicTheatreContactAction,
} from "../actions/public-theatre-actions";

let suitePassed = 0;
let suiteFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    suitePassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    suiteFailed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runPublicTheatrePageVerificationSuite() {
  console.log("\n==============================================================================");
  console.log("🌐  CineSphere OS — Phase 3 Part 13 Public Theatre Page Verification Suite");
  console.log("==============================================================================\n");

  // ----------------------------------------------------------------------------
  // Test 1: Public Read Model Aggregation & Entity Decoupling
  // ----------------------------------------------------------------------------
  console.log("👉 Test 1: Public Read Model Aggregation & Entity Decoupling");
  const puneView = await publicTheatreService.getPublicTheatreView("cinesphere-grand-pune");
  assert(puneView !== null, "Public read model successfully retrieved for Pune");
  assert(puneView.theatreId === "th-pun-001", "Model maps to correct theatre ID");
  assert(puneView.slug === "cinesphere-grand-pune", "Model maps to friendly slug");
  assert(Boolean(puneView.branding), "Branding view model present");
  assert(Boolean(puneView.profile), "Profile view model present");
  assert(Boolean(puneView.location), "Location view model present");
  assert(Boolean(puneView.contact), "Contact view model present");
  assert(Array.isArray(puneView.amenities), "Amenities array present");
  assert(Array.isArray(puneView.runningMovies), "Running movies array present");
  assert(Array.isArray(puneView.upcomingMovies), "Upcoming movies array present");
  assert(Array.isArray(puneView.shows), "Shows array present");
  assert(Array.isArray(puneView.halls), "Halls summary array present");
  assert(Boolean(puneView.operatingHours), "Operating hours view model present");
  assert(Boolean(puneView.reviewsSummary), "Reviews architecture placeholder present");
  assert(Boolean(puneView.configuration), "Configuration localization present");
  assert(Boolean(puneView.seo), "SEO metadata present");

  // ----------------------------------------------------------------------------
  // Test 2: Strict Security & Information Disclosure Prevention
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 2: Strict Security & Information Disclosure Prevention");
  const rawJson = JSON.stringify(puneView);
  assert(!rawJson.includes("gstNumber"), "Zero internal GSTIN statutory credential leakage");
  assert(!rawJson.includes("panNumber"), "Zero internal PAN number leakage");
  assert(!rawJson.includes("cinNumber"), "Zero corporate CIN leakage");
  assert(!rawJson.includes("employeeCode"), "Zero staff employee code leakage");
  assert(!rawJson.includes("merchantVpa"), "Zero internal payment merchant VPA leakage");
  assert(!rawJson.includes("secretKey"), "Zero payment gateway secret leakage");
  assert(!rawJson.includes("seatHoldLockSeconds"), "Zero internal seat hold timer leakage");
  assert(!rawJson.includes("refundPercentage"), "Zero internal refund policy formula leakage");
  assert(!rawJson.includes("auditLog"), "Zero administrative audit log leakage");

  // ----------------------------------------------------------------------------
  // Test 3: Content Visibility & Approval State Machine
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 3: Content Visibility & Approval State Machine");
  // Active venue succeeds
  assert(puneView.profile.displayName.length > 0, "ACTIVE approved cinema is accessible to public");

  // Inactive / Draft / Pending / Suspended / Archived theatres must throw NotFoundError for public guests
  let draftBlocked = false;
  try {
    await publicTheatreService.getPublicTheatreView("cinesphere-parkstreet-kolkata");
  } catch (err: unknown) {
    draftBlocked = true;
  }
  assert(draftBlocked, "DRAFT theatre strictly blocked from public discovery");

  let pendingBlocked = false;
  try {
    await publicTheatreService.getPublicTheatreView("cinesphere-imperial-delhi");
  } catch (err: unknown) {
    pendingBlocked = true;
  }
  assert(pendingBlocked, "PENDING_APPROVAL theatre strictly blocked from public discovery");

  let suspendedBlocked = false;
  try {
    await publicTheatreService.getPublicTheatreView("cinesphere-nexus-bengaluru");
  } catch (err: unknown) {
    suspendedBlocked = true;
  }
  assert(suspendedBlocked, "SUSPENDED theatre strictly blocked from public discovery");

  let archivedBlocked = false;
  try {
    await publicTheatreService.getPublicTheatreView("cinesphere-miramar-goa");
  } catch (err: unknown) {
    archivedBlocked = true;
  }
  assert(archivedBlocked, "ARCHIVED theatre strictly blocked from public discovery");

  // Super Admin preview mode allows viewing pending/inactive multiplexes
  const previewView = await publicTheatreService.getPublicTheatreView("cinesphere-imperial-delhi", {
    previewMode: true,
    userRole: "SUPER_ADMIN",
  });
  assert(previewView !== null, "Super Admin can preview unapproved theatre in preview mode");
  assert(previewView.theatreId === "th-del-001", "Preview mode correctly resolved Delhi multiplex");

  // ----------------------------------------------------------------------------
  // Test 4: Dynamic Branding & Sequential Gallery Delivery
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 4: Dynamic Branding & Sequential Gallery Delivery");
  assert(typeof puneView.branding.logoUrl === "string", "Logo URL is populated");
  assert(typeof puneView.branding.bannerUrl === "string", "Banner URL is populated");
  assert(typeof puneView.branding.heroImageUrl === "string", "Hero image URL is populated");
  assert(puneView.branding.gallery.length >= 4, "Gallery contains multiple active images");
  assert(
    puneView.branding.gallery[0].displayOrder <= puneView.branding.gallery[1].displayOrder,
    "Gallery images are sorted sequentially by displayOrder"
  );

  // ----------------------------------------------------------------------------
  // Test 5: Running Movies vs Upcoming Movies Separation
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 5: Running Movies vs Upcoming Movies Separation");
  assert(puneView.runningMovies.length > 0, "Running movies catalog populated");
  assert(puneView.upcomingMovies.length > 0, "Upcoming movies catalog populated");
  assert(
    puneView.runningMovies.every((m) => m.status === "NOW_SHOWING"),
    "All running movies hold NOW_SHOWING status"
  );
  assert(
    puneView.upcomingMovies.every((m) => m.status === "COMING_SOON"),
    "All upcoming movies hold COMING_SOON status"
  );
  assert(
    puneView.runningMovies.every((m) => m.posterUrl && m.certification && m.durationMinutes > 0),
    "Running movies have full poster, cert and duration metadata"
  );

  // ----------------------------------------------------------------------------
  // Test 6: Available Shows with Seat Quotas & Formatted Prices
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 6: Available Shows with Seat Quotas & Formatted Prices");
  assert(puneView.shows.length > 0, "Available shows scheduled at theatre");
  const firstShow = puneView.shows[0];
  assert(firstShow.startTime.length > 0, "Show contains start time");
  assert(firstShow.hallName.length > 0, "Show is linked to specific hall");
  assert(firstShow.format.length > 0, "Show has format specified (e.g. IMAX, Dolby)");
  assert(firstShow.ticketPrice > 0, "Show has positive ticket price");
  assert(firstShow.formattedPrice.startsWith("₹"), "Pune show price formatted with INR symbol (₹)");
  assert(firstShow.totalSeats > 0, "Total seating capacity tracked");
  assert(firstShow.availableSeats <= firstShow.totalSeats, "Available seats bounded by total seats");
  assert(
    ["AVAILABLE", "FILLING_FAST", "SOLD_OUT"].includes(firstShow.bookingStatusPlaceholder),
    "Booking status placeholder is properly calculated"
  );

  // ----------------------------------------------------------------------------
  // Test 7: Auditorium Fleet Specifications (Laser & Spatial Audio)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 7: Auditorium Fleet Specifications (Laser & Spatial Audio)");
  assert(puneView.halls.length >= 4, "Auditorium summary reports 4+ active screens");
  const imaxHall = puneView.halls.find((h) => h.name.includes("IMAX"));
  assert(Boolean(imaxHall), "Auditorium fleet contains flagship IMAX screen");
  assert(imaxHall?.capacity !== undefined && imaxHall.capacity > 0, "Hall capacity tracked");
  assert(Boolean(imaxHall?.soundSystem?.includes("12-Channel")), "IMAX 12-channel sound system tracked");
  assert(Boolean(imaxHall?.projectionType?.includes("4K Laser")), "IMAX 4K Laser projection tracked");
  assert(imaxHall?.status === "Operational", "Screen operational status verified");

  // ----------------------------------------------------------------------------
  // Test 8: Public Amenities & Verified Facility Categories
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 8: Public Amenities & Verified Facility Categories");
  assert(puneView.amenities.length >= 4, "Public amenities catalog populated");
  const techAmenity = puneView.amenities.find((a) => a.category === "TECHNOLOGY");
  assert(Boolean(techAmenity), "Technology category amenity present");
  const comfortAmenity = puneView.amenities.find((a) => a.category === "COMFORT");
  assert(Boolean(comfortAmenity), "Comfort category amenity present (Recliners)");
  const parkingAmenity = puneView.amenities.find((a) => a.metadata?.parkingCapacity);
  assert(Boolean(parkingAmenity), "Amenity metadata tracks parking capacity");

  // ----------------------------------------------------------------------------
  // Test 9: Geographic Location, Direction URLs & Public Contact Desks
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 9: Geographic Location, Direction URLs & Public Contact Desks");
  assert(puneView.location.city === "Pune", "Location city is Pune");
  assert(puneView.location.state === "Maharashtra", "Location state is Maharashtra");
  assert(puneView.location.completeAddress.length > 0, "Complete formatted address populated");
  assert(Boolean(puneView.location.googleMapsUrl), "Google Maps navigation link generated");
  assert(Boolean(puneView.location.navigationUrl), "Turn-by-turn routing link generated");
  assert(Boolean(puneView.contact.primaryPhone), "Primary phone voice desk available");
  assert(Boolean(puneView.contact.supportEmail), "Support email desk available");
  assert(Boolean(puneView.contact.emergencyDesk), "24/7 priority emergency line available");
  assert(puneView.contact.socialLinks.length >= 2, "Social presence links available");

  // ----------------------------------------------------------------------------
  // Test 10: Operating Hours, Today's Status & Weekly Rotations
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 10: Operating Hours, Today's Status & Weekly Rotations");
  assert(typeof puneView.operatingHours.isOpenNow === "boolean", "Live open/closed status evaluated");
  assert(puneView.operatingHours.todayHours.length > 0, "Today's operating hours formatted");
  assert(puneView.operatingHours.weeklySchedule.length === 7, "Weekly schedule covers all 7 days");
  const monday = puneView.operatingHours.weeklySchedule.find((d) => d.dayOfWeek === "MONDAY");
  assert(Boolean(monday && monday.openTime && monday.closeTime), "Daily opening and closing hours defined");

  // ----------------------------------------------------------------------------
  // Test 11: SEO Metadata & Schema.org MovieTheater JSON-LD
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 11: SEO Metadata & Schema.org MovieTheater JSON-LD");
  assert(puneView.seo.title.includes(puneView.profile.displayName), "SEO title contains cinema name");
  assert(puneView.seo.metaDescription.includes("Pune"), "Meta description contains geographic city");
  assert(puneView.seo.canonicalUrl.includes("/theatre/cinesphere-grand-pune"), "Canonical URL reflects friendly slug");
  assert(puneView.seo.ogTags.type === "website", "OpenGraph tag type is website");
  assert(puneView.seo.twitterCard.card === "summary_large_image", "Twitter card set to summary_large_image");

  const jsonLd = puneView.seo.jsonLdSchema as Record<string, unknown>;
  assert(jsonLd["@context"] === "https://schema.org", "Schema.org @context verified");
  assert(jsonLd["@type"] === "MovieTheater", "Schema.org @type is MovieTheater");
  assert(jsonLd["name"] === puneView.profile.displayName, "Schema name matches multiplex");
  assert(Boolean(jsonLd["address"]), "Schema contains PostalAddress specification");
  assert(Boolean(jsonLd["geo"]), "Schema contains GeoCoordinates specification");

  // ----------------------------------------------------------------------------
  // Test 12: Multi-Tenant Autonomous Localization (Pune vs Mumbai vs Dubai)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 12: Multi-Tenant Autonomous Localization (Pune vs Mumbai vs Dubai)");
  const mumbaiView = await publicTheatreService.getPublicTheatreView("cinesphere-royale-mumbai");
  const dubaiView = await publicTheatreService.getPublicTheatreView("cinesphere-dubai-palms");

  // Pune
  assert(puneView.configuration.currency === "INR", "Theatre A currency is INR");
  assert(puneView.configuration.currencySymbol === "₹", "Theatre A currency symbol is ₹");
  assert(puneView.configuration.timezone === "Asia/Kolkata", "Theatre A timezone is Asia/Kolkata");
  assert(puneView.configuration.numberFormat === "INDIAN", "Theatre A number format is INDIAN");
  assert(puneView.shows[0].formattedPrice.startsWith("₹"), "Theatre A show price formatted in INR (₹)");

  // Mumbai
  assert(mumbaiView.configuration.currency === "USD", "Theatre B currency is USD");
  assert(mumbaiView.configuration.currencySymbol === "$", "Theatre B currency symbol is $");
  assert(mumbaiView.configuration.timezone === "America/New_York", "Theatre B timezone is America/New_York");
  assert(mumbaiView.configuration.numberFormat === "INTERNATIONAL", "Theatre B number format is INTERNATIONAL");
  assert(mumbaiView.shows[0].formattedPrice.startsWith("$"), "Theatre B show price formatted in USD ($)");

  // Dubai
  assert(dubaiView.configuration.currency === "AED", "Theatre C currency is AED");
  assert(dubaiView.configuration.currencySymbol === "AED ", "Theatre C currency symbol is AED ");
  assert(dubaiView.configuration.timezone === "Asia/Dubai", "Theatre C timezone is Asia/Dubai");
  assert(dubaiView.configuration.primaryLanguage === "ar", "Theatre C language is Arabic (ar)");
  assert(dubaiView.shows[0].formattedPrice.startsWith("AED"), "Theatre C show price formatted in AED");

  console.log("\n==============================================================================");
  console.log(`🎉  ALL 12 PUBLIC THEATRE PAGE TEST SUITES PASSED! (${suitePassed} assertions)`);
  console.log("==============================================================================\n");
}

runPublicTheatrePageVerificationSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
