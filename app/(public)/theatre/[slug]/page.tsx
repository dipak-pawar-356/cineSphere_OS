import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicTheatreService } from "@/lib/services/public-theatre.service";
import { PublicTheatreViewContainer } from "@/components/public-theatre";

export const revalidate = 3600; // 1-hour ISR cache

export interface PublicTheatrePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

/**
 * Next.js Dynamic Metadata Generator for Public Theatre SEO
 */
export async function generateMetadata({
  params,
  searchParams,
}: PublicTheatrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === "true";

  try {
    const theatre = await publicTheatreService.getPublicTheatreView(slug, {
      previewMode: isPreview,
    });

    const { seo } = theatre;

    return {
      title: seo.title,
      description: seo.metaDescription,
      alternates: {
        canonical: seo.canonicalUrl,
      },
      openGraph: {
        title: seo.ogTags.title,
        description: seo.ogTags.description,
        url: seo.ogTags.url,
        siteName: "CineSphere OS",
        images: seo.ogTags.image ? [{ url: seo.ogTags.image }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: seo.twitterCard.title,
        description: seo.twitterCard.description,
        images: seo.twitterCard.image ? [seo.twitterCard.image] : [],
      },
    };
  } catch {
    return {
      title: "Cinema Complex | CineSphere OS",
      description: "Explore movies, showtimes, and premium auditoriums on CineSphere OS.",
    };
  }
}

/**
 * Public Theatre Detail Page — Server Component
 * Aggregates only public-facing information into the master PublicTheatreView read model.
 * Injects Schema.org MovieTheater structured data.
 */
export default async function PublicTheatrePage({
  params,
  searchParams,
}: PublicTheatrePageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === "true";

  try {
    const theatre = await publicTheatreService.getPublicTheatreView(slug, {
      previewMode: isPreview,
    });

    return (
      <>
        {/* Schema.org MovieTheater JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(theatre.seo.jsonLdSchema),
          }}
        />

        <PublicTheatreViewContainer theatre={theatre} />
      </>
    );
  } catch (error: unknown) {
    notFound();
  }
}
