import { NextRequest, NextResponse } from "next/server";
import { getUnifiedCustomerShowDetails, getAllPublishedShows } from "@/lib/engine/customer-discovery-engine";

/**
 * ==============================================================================
 * GET /shows/[showId]
 * ==============================================================================
 * Canonical Show Resolution Endpoint for CineSphere OS.
 * Resolves all required information from a single Show ID rather than making
 * independent multi-hop client requests.
 *
 * Expected Response Structure:
 * ├── movie: CustomerMovieDTO
 * ├── theatre: CustomerTheatreDTO
 * ├── hall: CustomerHallDTO
 * ├── hallLayout: CustomerHallLayoutDTO
 * ├── seatInventory: CustomerSeatDTO[]
 * ├── pricingProfile: CustomerShowPricingProfileDTO
 * ├── availableSeats: number
 * ├── legends: CustomerSectionLegendDTO[]
 * └── showDetails: CustomerShowDTO
 * ==============================================================================
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await context.params;

    if (!showId || typeof showId !== "string" || !showId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing showId parameter",
        },
        { status: 400 }
      );
    }

    const cleanShowId = showId.trim();
    const allPublished = getAllPublishedShows();
    const matchedShow = allPublished.find((s) => s.id === cleanShowId);

    // Strict Tenant Isolation: only return published shows
    if (!matchedShow) {
      return NextResponse.json(
        {
          success: false,
          error: `Show with ID '${cleanShowId}' not found or not published.`,
        },
        { status: 404 }
      );
    }

    const unified = getUnifiedCustomerShowDetails(cleanShowId);

    return NextResponse.json(
      {
        movie: unified.movie,
        Movie: unified.movie,
        theatre: unified.theatre,
        Theatre: unified.theatre,
        hall: unified.hall,
        Hall: unified.hall,
        hallLayout: unified.layout,
        "Hall Layout": unified.layout,
        layout: unified.layout,
        seatInventory: unified.seatInventory,
        "Seat Inventory": unified.seatInventory,
        pricingProfile: unified.pricingProfile,
        "Pricing Profile": unified.pricingProfile,
        availableSeats: unified.capacityMetrics.availableSeats,
        "Available Seats": unified.capacityMetrics.availableSeats,
        legends: unified.sectionLegends,
        Legends: unified.sectionLegends,
        showDetails: unified.show,
        "Show Details": unified.show,
        show: unified.show,
        capacityMetrics: unified.capacityMetrics,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}

