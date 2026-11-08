"use client";

import React, { useState, useEffect } from "react";
import {
  GlobalMasterMovie,
  CreateMasterMovieInput,
  MasterMovieCertificate,
  MasterMovieFormat,
  MasterMovieGenre,
  MasterMovieLanguage,
  MasterMovieStatus,
  CrewRole,
  MovieCastItem,
  MovieCrewItem,
  MovieTrailerItem,
  MovieGalleryImage,
} from "@/types/movie-management.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Film,
  Sparkles,
  Image as ImageIcon,
  Video,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Globe,
  Calendar,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import {
  validateMasterMovieInput,
  generateSlugFromTitle,
} from "@/lib/validation/movie-validation";

const AVAILABLE_LANGUAGES: MasterMovieLanguage[] = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Bengali",
];

const AVAILABLE_FORMATS: MasterMovieFormat[] = [
  "2D",
  "3D",
  "IMAX",
  "4DX",
  "ScreenX",
  "Dolby Cinema",
  "IMAX 3D",
  "Laser 4K",
  "70mm Film",
];

const AVAILABLE_GENRES: MasterMovieGenre[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Biography",
  "Crime",
  "Documentary",
  "Family",
  "Mystery",
  "Sports",
  "War",
];

const CERTIFICATES: MasterMovieCertificate[] = [
  "U",
  "UA",
  "UA 13+",
  "UA 16+",
  "A",
  "S",
  "PG-13",
  "R",
];

const STATUSES: MasterMovieStatus[] = [
  "Now Showing",
  "Upcoming",
  "Draft",
  "Archived",
  "Inactive",
];

interface MasterMovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movieData: CreateMasterMovieInput) => void;
  initialMovie?: GlobalMasterMovie | null;
}

export function MasterMovieFormModal({
  isOpen,
  onClose,
  onSave,
  initialMovie,
}: MasterMovieFormModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "formats" | "media" | "trailers" | "cast">("general");

  // Form State
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [releaseDate, setReleaseDate] = useState("2025-01-01");
  const [certificate, setCertificate] = useState<MasterMovieCertificate>("UA 16+");
  const [status, setStatus] = useState<MasterMovieStatus>("Now Showing");
  const [primaryLanguage, setPrimaryLanguage] = useState<MasterMovieLanguage>("Hindi");
  const [availableLanguages, setAvailableLanguages] = useState<MasterMovieLanguage[]>(["Hindi", "English"]);
  const [formats, setFormats] = useState<MasterMovieFormat[]>(["2D", "3D", "IMAX"]);
  const [genres, setGenres] = useState<MasterMovieGenre[]>(["Action", "Drama"]);
  const [productionHouse, setProductionHouse] = useState("");
  const [distributor, setDistributor] = useState("");
  const [country, setCountry] = useState("India");
  const [imdbRating, setImdbRating] = useState("8.5");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Media
  const [posterUrl, setPosterUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [landscapeBannerUrl, setLandscapeBannerUrl] = useState("");
  const [portraitBannerUrl, setPortraitBannerUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<MovieGalleryImage[]>([]);

  // Trailers
  const [trailers, setTrailers] = useState<MovieTrailerItem[]>([]);

  // Cast & Crew
  const [cast, setCast] = useState<MovieCastItem[]>([]);
  const [crew, setCrew] = useState<MovieCrewItem[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate initial values on open
  useEffect(() => {
    if (initialMovie) {
      setTitle(initialMovie.title);
      setOriginalTitle(initialMovie.originalTitle || "");
      setSlug(initialMovie.slug);
      setSynopsis(initialMovie.synopsis);
      setShortDescription(initialMovie.shortDescription || "");
      setFullDescription(initialMovie.fullDescription || "");
      setDurationMinutes(initialMovie.durationMinutes);
      setReleaseDate(initialMovie.releaseDate);
      setCertificate(initialMovie.certificate);
      setStatus(initialMovie.status);
      setPrimaryLanguage(initialMovie.primaryLanguage);
      setAvailableLanguages(initialMovie.availableLanguages || [initialMovie.primaryLanguage]);
      setFormats(initialMovie.formats || ["2D"]);
      setGenres(initialMovie.genres || ["Action"]);
      setProductionHouse(initialMovie.productionHouse || "");
      setDistributor(initialMovie.distributor || "");
      setCountry(initialMovie.country || "India");
      setImdbRating(initialMovie.imdbRating || "8.5");
      setWebsiteUrl(initialMovie.websiteUrl || "");
      setPosterUrl(initialMovie.posterUrl || "");
      setBannerUrl(initialMovie.bannerUrl || "");
      setLandscapeBannerUrl(initialMovie.landscapeBannerUrl || "");
      setPortraitBannerUrl(initialMovie.portraitBannerUrl || "");
      setGalleryImages(initialMovie.galleryImages || []);
      setTrailers(initialMovie.trailers || []);
      setCast(initialMovie.cast || []);
      setCrew(initialMovie.crew || []);
    } else {
      // Defaults for new movie
      setTitle("");
      setOriginalTitle("");
      setSlug("");
      setSynopsis("");
      setShortDescription("");
      setFullDescription("");
      setDurationMinutes(150);
      setReleaseDate(new Date().toISOString().split("T")[0]);
      setCertificate("UA 16+");
      setStatus("Upcoming");
      setPrimaryLanguage("Hindi");
      setAvailableLanguages(["Hindi", "English"]);
      setFormats(["2D", "3D", "IMAX"]);
      setGenres(["Action", "Sci-Fi"]);
      setProductionHouse("");
      setDistributor("");
      setCountry("India");
      setImdbRating("8.0");
      setWebsiteUrl("");
      setPosterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80");
      setBannerUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80");
      setLandscapeBannerUrl("");
      setPortraitBannerUrl("");
      setGalleryImages([]);
      setTrailers([
        {
          id: `trl-${Date.now()}`,
          title: "Official Theatrical Trailer",
          videoUrl: "https://www.youtube.com/watch?v=placeholder",
          platform: "YouTube",
          thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
          duration: "2:45",
          isFeatured: true,
          order: 1,
        },
      ]);
      setCast([
        {
          id: `c-${Date.now()}-1`,
          actorName: "",
          characterName: "",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
          displayOrder: 1,
        },
      ]);
      setCrew([
        {
          id: `cr-${Date.now()}-1`,
          name: "",
          role: "Director",
          displayOrder: 1,
        },
      ]);
    }
    setErrors({});
  }, [initialMovie, isOpen]);

  // Handle title change & auto-generate slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialMovie) {
      setSlug(generateSlugFromTitle(val));
    }
  };

  // Toggle multi-select items
  const toggleLanguage = (lang: MasterMovieLanguage) => {
    if (availableLanguages.includes(lang)) {
      if (availableLanguages.length > 1) {
        setAvailableLanguages(availableLanguages.filter((l) => l !== lang));
      }
    } else {
      setAvailableLanguages([...availableLanguages, lang]);
    }
  };

  const toggleFormat = (fmt: MasterMovieFormat) => {
    if (formats.includes(fmt)) {
      if (formats.length > 1) {
        setFormats(formats.filter((f) => f !== fmt));
      }
    } else {
      setFormats([...formats, fmt]);
    }
  };

  const toggleGenre = (genre: MasterMovieGenre) => {
    if (genres.includes(genre)) {
      if (genres.length > 1) {
        setGenres(genres.filter((g) => g !== genre));
      }
    } else {
      setGenres([...genres, genre]);
    }
  };

  // Dynamic Cast Rows
  const addCastMember = () => {
    setCast([
      ...cast,
      {
        id: `c-${Date.now()}`,
        actorName: "",
        characterName: "",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        displayOrder: cast.length + 1,
      },
    ]);
  };

  const updateCastMember = (index: number, updates: Partial<MovieCastItem>) => {
    const updated = [...cast];
    updated[index] = { ...updated[index], ...updates };
    setCast(updated);
  };

  const removeCastMember = (index: number) => {
    if (cast.length > 1) {
      setCast(cast.filter((_, i) => i !== index));
    }
  };

  // Dynamic Crew Rows
  const addCrewMember = () => {
    setCrew([
      ...crew,
      {
        id: `cr-${Date.now()}`,
        name: "",
        role: "Producer",
        displayOrder: crew.length + 1,
      },
    ]);
  };

  const updateCrewMember = (index: number, updates: Partial<MovieCrewItem>) => {
    const updated = [...crew];
    updated[index] = { ...updated[index], ...updates };
    setCrew(updated);
  };

  const removeCrewMember = (index: number) => {
    if (crew.length > 1) {
      setCrew(crew.filter((_, i) => i !== index));
    }
  };

  // Dynamic Trailer Rows
  const addTrailer = () => {
    setTrailers([
      ...trailers,
      {
        id: `trl-${Date.now()}`,
        title: "Teaser Trailer",
        videoUrl: "https://www.youtube.com/watch?v=placeholder",
        platform: "YouTube",
        thumbnailUrl: posterUrl,
        duration: "1:30",
        isFeatured: false,
        order: trailers.length + 1,
      },
    ]);
  };

  const updateTrailer = (index: number, updates: Partial<MovieTrailerItem>) => {
    const updated = [...trailers];
    updated[index] = { ...updated[index], ...updates };
    setTrailers(updated);
  };

  const removeTrailer = (index: number) => {
    if (trailers.length > 1) {
      setTrailers(trailers.filter((_, i) => i !== index));
    }
  };

  // Gallery Images
  const addGalleryImage = () => {
    const newImgUrl = prompt("Enter Image URL for Gallery:");
    if (newImgUrl && newImgUrl.trim()) {
      setGalleryImages([
        ...galleryImages,
        {
          id: `gal-${Date.now()}`,
          url: newImgUrl.trim(),
          altText: `${title} Theatrical Still`,
          order: galleryImages.length + 1,
          type: "gallery",
        },
      ]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: CreateMasterMovieInput = {
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      slug: slug.trim() || generateSlugFromTitle(title),
      synopsis: synopsis.trim(),
      shortDescription: shortDescription.trim() || undefined,
      fullDescription: fullDescription.trim() || undefined,
      durationMinutes: Number(durationMinutes),
      releaseDate,
      certificate,
      status,
      primaryLanguage,
      availableLanguages,
      formats,
      genres,
      productionHouse: productionHouse.trim() || undefined,
      distributor: distributor.trim() || undefined,
      country: country.trim() || "India",
      imdbRating: imdbRating.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      posterUrl: posterUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      landscapeBannerUrl: landscapeBannerUrl.trim() || bannerUrl.trim(),
      portraitBannerUrl: portraitBannerUrl.trim() || posterUrl.trim(),
      galleryImages,
      trailers,
      cast: cast.filter((c) => c.actorName.trim()),
      crew: crew.filter((cr) => cr.name.trim()),
      isFeatured: initialMovie?.isFeatured ?? true,
      isTrending: initialMovie?.isTrending ?? true,
    };

    const validation = validateMasterMovieInput(payload, !!initialMovie);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      // Auto-switch to tab with error
      if (validation.errors.title || validation.errors.synopsis || validation.errors.durationMinutes) {
        setActiveTab("general");
      } else if (validation.errors.formats || validation.errors.availableLanguages || validation.errors.genres) {
        setActiveTab("formats");
      } else if (validation.errors.posterUrl || validation.errors.bannerUrl) {
        setActiveTab("media");
      }
      return;
    }

    onSave(payload);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0B1220] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {initialMovie ? `Edit Master Film: ${initialMovie.title}` : "Ingest New Master Theatrical Release"}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Canonical platform metadata. Theatres link to this master film record without duplicating details.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#080C14] border-b border-[#1E293B] overflow-x-auto text-xs">
          {[
            { id: "general", label: "Film Specs", icon: Film },
            { id: "formats", label: "Languages & Formats", icon: Layers },
            { id: "media", label: "Media Vault", icon: ImageIcon },
            { id: "trailers", label: "Trailers & Teasers", icon: Video },
            { id: "cast", label: "Cast & Crew Roster", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#1E293B] text-[#FBBF24] border border-[#FBBF24]/30"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: GENERAL SPECS */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Film Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Dune: Part Two"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                  {errors.title && <p className="text-rose-400 text-[10px]">{errors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Original / International Title
                  </label>
                  <Input
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder="e.g. Dune: Part Two"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Unique Slug *
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="dune-part-two"
                    className="bg-[#111827] border-[#2A3445] text-white font-mono"
                  />
                  {errors.slug && <p className="text-rose-400 text-[10px]">{errors.slug}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Duration (Minutes) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="bg-[#111827] border-[#2A3445] text-white font-mono"
                  />
                  {errors.durationMinutes && <p className="text-rose-400 text-[10px]">{errors.durationMinutes}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Release Date *
                  </label>
                  <Input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Certification *
                  </label>
                  <select
                    value={certificate}
                    onChange={(e) => setCertificate(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#111827] border border-[#2A3445] px-3 text-xs text-white"
                  >
                    {CERTIFICATES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Exhibition Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MasterMovieStatus)}
                    className="w-full h-9 rounded-xl bg-[#111827] border border-[#2A3445] px-3 text-xs text-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Country of Origin
                  </label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India / USA"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                  Theatrical Synopsis *
                </label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Compelling narrative synopsis for guest ticketing and marquee billings..."
                  className="w-full rounded-xl bg-[#111827] border border-[#2A3445] p-3 text-white focus:outline-none focus:border-amber-400"
                />
                {errors.synopsis && <p className="text-rose-400 text-[10px]">{errors.synopsis}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Production House
                  </label>
                  <Input
                    value={productionHouse}
                    onChange={(e) => setProductionHouse(e.target.value)}
                    placeholder="e.g. Legendary Pictures / Warner Bros."
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Theatrical Distributor
                  </label>
                  <Input
                    value={distributor}
                    onChange={(e) => setDistributor(e.target.value)}
                    placeholder="e.g. Warner Bros. Discovery India"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMATS, LANGUAGES & GENRES */}
          {activeTab === "formats" && (
            <div className="space-y-6">
              {/* Languages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-sky-400" />
                    Available Theatrical Audio Tracks
                  </label>
                  <span className="text-[11px] text-[#64748B]">
                    Primary: <span className="text-white font-bold">{primaryLanguage}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = availableLanguages.includes(lang);
                    const isPrimary = primaryLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl border font-medium text-xs transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                            : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-sky-400" />}
                        <span>{lang}</span>
                        {isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 font-bold">
                            Primary
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formats */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  Licensed Exhibition Formats
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const isSelected = formats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => toggleFormat(fmt)}
                        className={`px-3 py-1.5 rounded-xl border font-medium text-xs transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold"
                            : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                        <span>{fmt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  Film Classification Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map((g) => {
                    const isSelected = genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-xl border font-medium text-xs transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                            : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-purple-400" />}
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA VAULT */}
          {activeTab === "media" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Portrait Poster URL *
                  </label>
                  <Input
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://... poster.jpg"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                  {posterUrl && (
                    <div className="h-44 w-28 rounded-xl overflow-hidden border border-[#2A3445] bg-[#070B12]">
                      <img src={posterUrl} alt="Poster preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Landscape Marquee Banner URL *
                  </label>
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://... backdrop.jpg"
                    className="bg-[#111827] border-[#2A3445] text-white"
                  />
                  {bannerUrl && (
                    <div className="h-44 w-full rounded-xl overflow-hidden border border-[#2A3445] bg-[#070B12]">
                      <img src={bannerUrl} alt="Banner preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-3 pt-4 border-t border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">
                    Production Stills & Gallery ({galleryImages.length})
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={addGalleryImage}
                    className="gap-1 border-[#2A3445] text-xs text-amber-400"
                  >
                    <Plus className="h-3 w-3" /> Add Image
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={img.id || idx} className="relative rounded-xl overflow-hidden border border-[#2A3445] group">
                      <img src={img.url} alt={img.altText || "Gallery"} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-rose-400 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-full p-6 text-center rounded-xl border border-dashed border-[#2A3445] text-[#64748B]">
                      <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <span>No production stills uploaded yet. Click &quot;Add Image&quot; to attach stills.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRAILERS */}
          {activeTab === "trailers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Official Trailers & Video Assets</h4>
                  <p className="text-[11px] text-[#94A3B8]">Attach YouTube or Vimeo stream URLs for guest previews.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={addTrailer}
                  className="gap-1 border-[#2A3445] text-amber-400 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Trailer
                </Button>
              </div>

              <div className="space-y-3">
                {trailers.map((tr, idx) => (
                  <div key={tr.id || idx} className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Video className="h-4 w-4 text-amber-400" />
                        <Input
                          value={tr.title}
                          onChange={(e) => updateTrailer(idx, { title: e.target.value })}
                          placeholder="Trailer Title"
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tr.isFeatured}
                            onChange={(e) => updateTrailer(idx, { isFeatured: e.target.checked })}
                            className="rounded bg-[#070B12] border-[#2A3445] text-amber-400"
                          />
                          Featured
                        </label>
                        {trailers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTrailer(idx)}
                            className="p-1 text-[#64748B] hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <Input
                          value={tr.videoUrl}
                          onChange={(e) => updateTrailer(idx, { videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white font-mono"
                        />
                      </div>
                      <div>
                        <Input
                          value={tr.duration}
                          onChange={(e) => updateTrailer(idx, { duration: e.target.value })}
                          placeholder="Duration (e.g. 2:45)"
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CAST & CREW */}
          {activeTab === "cast" && (
            <div className="space-y-6">
              {/* Cast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Principal Cast Members</h4>
                    <p className="text-[11px] text-[#94A3B8]">Actors and character billing orders.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={addCastMember}
                    className="gap-1 border-[#2A3445] text-amber-400 text-xs"
                  >
                    <Plus className="h-3 w-3" /> Add Actor
                  </Button>
                </div>

                <div className="space-y-2">
                  {cast.map((c, idx) => (
                    <div key={c.id || idx} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={c.actorName}
                          onChange={(e) => updateCastMember(idx, { actorName: e.target.value })}
                          placeholder="Actor Name"
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white font-bold"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={c.characterName}
                          onChange={(e) => updateCastMember(idx, { characterName: e.target.value })}
                          placeholder="Character Name"
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        {cast.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCastMember(idx)}
                            className="p-1 text-[#64748B] hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crew */}
              <div className="space-y-3 pt-4 border-t border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Directorial & Technical Crew</h4>
                    <p className="text-[11px] text-[#94A3B8]">Directors, producers, writers, and technical leads.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={addCrewMember}
                    className="gap-1 border-[#2A3445] text-amber-400 text-xs"
                  >
                    <Plus className="h-3 w-3" /> Add Crew
                  </Button>
                </div>

                <div className="space-y-2">
                  {crew.map((cr, idx) => (
                    <div key={cr.id || idx} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <Input
                          value={cr.name}
                          onChange={(e) => updateCrewMember(idx, { name: e.target.value })}
                          placeholder="Crew Member Name"
                          className="h-8 text-xs bg-[#070B12] border-[#2A3445] text-white font-bold"
                        />
                      </div>
                      <div className="col-span-5">
                        <select
                          value={cr.role}
                          onChange={(e) => updateCrewMember(idx, { role: e.target.value })}
                          className="w-full h-8 rounded-lg bg-[#070B12] border border-[#2A3445] px-2 text-xs text-white"
                        >
                          <option value="Director">Director</option>
                          <option value="Producer">Producer</option>
                          <option value="Writer">Writer</option>
                          <option value="Music Director">Music Director</option>
                          <option value="Cinematographer">Cinematographer</option>
                          <option value="Editor">Editor</option>
                          <option value="Choreographer">Choreographer</option>
                          <option value="Action Director">Action Director</option>
                        </select>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {crew.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCrewMember(idx)}
                            className="p-1 text-[#64748B] hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-end gap-3 sticky bottom-0 bg-[#0B1220]/95 backdrop-blur-sm py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#2A3445] text-xs text-[#94A3B8]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{initialMovie ? "Save Changes" : "Ingest Master Film"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
