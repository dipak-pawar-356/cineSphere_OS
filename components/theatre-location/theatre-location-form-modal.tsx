"use client";

import React, { useState, useEffect } from "react";
import {
  CreateTheatreLocationInput,
  TheatreLocationBundle,
  TheatreLocationRecord,
  UpdateTheatreLocationInput,
} from "@/types/theatre-location.types";
import {
  createTheatreLocationAction,
  updateTheatreCoordinatesAction,
  updateTheatreLocationAction,
  validateTheatreAddressAction,
} from "@/actions/theatre-location-actions";
import { Button } from "@/components/ui/button";
import {
  X,
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  Save,
  Search,
} from "lucide-react";

export interface TheatreLocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialBundle?: TheatreLocationBundle | null;
  onSaved: (location: TheatreLocationRecord) => void;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  actorUserId: string;
}

export function TheatreLocationFormModal({
  isOpen,
  onClose,
  theatreId,
  initialBundle,
  onSaved,
  actorRole,
  actorUserId,
}: TheatreLocationFormModalProps) {
  const isEdit = Boolean(initialBundle?.location);

  const [locationName, setLocationName] = useState(
    initialBundle?.location.locationName || "Main Complex"
  );
  const [isPrimary, setIsPrimary] = useState(
    initialBundle?.location.isPrimary ?? true
  );

  // Address
  const [addressLine1, setAddressLine1] = useState(
    initialBundle?.location.addressLine1 || ""
  );
  const [addressLine2, setAddressLine2] = useState(
    initialBundle?.location.addressLine2 || ""
  );
  const [area, setArea] = useState(initialBundle?.location.area || "");
  const [landmark, setLandmark] = useState(initialBundle?.location.landmark || "");
  const [city, setCity] = useState(initialBundle?.location.city || "Pune");
  const [district, setDistrict] = useState(initialBundle?.location.district || "");
  const [state, setState] = useState(initialBundle?.location.state || "Maharashtra");
  const [country, setCountry] = useState(initialBundle?.location.country || "India");
  const [postalCode, setPostalCode] = useState(
    initialBundle?.location.postalCode || ""
  );

  // Navigation Links
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialBundle?.location.googleMapsUrl || ""
  );
  const [navigationLink, setNavigationLink] = useState(
    initialBundle?.location.navigationLink || ""
  );
  const [placeId, setPlaceId] = useState(initialBundle?.location.placeId || "");

  // Coordinates
  const [latitude, setLatitude] = useState(
    initialBundle?.coordinates?.latitude?.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    initialBundle?.coordinates?.longitude?.toString() || ""
  );

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [validationPreview, setValidationPreview] = useState<{
    normalized: string;
    warnings?: string[];
  } | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (initialBundle?.location) {
      setLocationName(initialBundle.location.locationName);
      setIsPrimary(initialBundle.location.isPrimary);
      setAddressLine1(initialBundle.location.addressLine1);
      setAddressLine2(initialBundle.location.addressLine2 || "");
      setArea(initialBundle.location.area || "");
      setLandmark(initialBundle.location.landmark || "");
      setCity(initialBundle.location.city);
      setDistrict(initialBundle.location.district || "");
      setState(initialBundle.location.state);
      setCountry(initialBundle.location.country || "India");
      setPostalCode(initialBundle.location.postalCode);
      setGoogleMapsUrl(initialBundle.location.googleMapsUrl || "");
      setNavigationLink(initialBundle.location.navigationLink || "");
      setPlaceId(initialBundle.location.placeId || "");
      setLatitude(initialBundle.coordinates?.latitude?.toString() || "");
      setLongitude(initialBundle.coordinates?.longitude?.toString() || "");
    } else {
      setLocationName("Main Complex");
      setIsPrimary(true);
      setAddressLine1("");
      setAddressLine2("");
      setArea("");
      setLandmark("");
      setCity("Pune");
      setDistrict("Pune");
      setState("Maharashtra");
      setCountry("India");
      setPostalCode("");
      setGoogleMapsUrl("");
      setNavigationLink("");
      setPlaceId("");
      setLatitude("");
      setLongitude("");
    }
    setFieldErrors({});
    setErrorBanner(null);
    setValidationPreview(null);
  }, [initialBundle, isOpen]);

  if (!isOpen) return null;

  const handleValidateAddress = async () => {
    if (!addressLine1 || !city || !state || !postalCode) {
      setErrorBanner("Please fill in Address Line 1, City, State, and Postal Code to validate.");
      return;
    }
    const res = await validateTheatreAddressAction({
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      country,
      postalCode,
    });
    if (res.success && res.data) {
      if (res.data.isValid) {
        setValidationPreview({
          normalized: res.data.normalizedAddress,
          warnings: res.data.warnings,
        });
        setErrorBanner(null);
      } else if (res.data.fieldErrors) {
        setFieldErrors(res.data.fieldErrors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setErrorBanner(null);

    try {
      const latNum = latitude ? parseFloat(latitude) : undefined;
      const lngNum = longitude ? parseFloat(longitude) : undefined;

      if (isEdit && initialBundle?.location) {
        const payload: UpdateTheatreLocationInput = {
          locationId: initialBundle.location.id,
          theatreId,
          expectedVersion: initialBundle.location.version,
          locationName,
          isPrimary,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          area: area || undefined,
          city,
          district: district || undefined,
          state,
          country,
          postalCode,
          landmark: landmark || undefined,
          googleMapsUrl: googleMapsUrl || undefined,
          navigationLink: navigationLink || undefined,
          placeId: placeId || undefined,
        };

        const res = await updateTheatreLocationAction(payload, {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
        });

        if (!res.success) {
          if (res.error?.fieldErrors) {
            setFieldErrors(res.error.fieldErrors);
          }
          setErrorBanner(res.error?.message || "Failed to update location.");
          setIsSubmitting(false);
          return;
        }

        // If coordinates changed, update them
        if (latNum !== undefined && lngNum !== undefined) {
          await updateTheatreCoordinatesAction(
            {
              locationId: initialBundle.location.id,
              theatreId,
              latitude: latNum,
              longitude: lngNum,
            },
            {
              role: actorRole,
              userId: actorUserId,
              theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
            }
          );
        }

        if (res.data) {
          onSaved(res.data);
        }
        onClose();
      } else {
        const payload: CreateTheatreLocationInput = {
          theatreId,
          locationName,
          isPrimary,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          area: area || undefined,
          city,
          district: district || undefined,
          state,
          country,
          postalCode,
          landmark: landmark || undefined,
          googleMapsUrl: googleMapsUrl || undefined,
          navigationLink: navigationLink || undefined,
          placeId: placeId || undefined,
          latitude: latNum,
          longitude: lngNum,
        };

        const res = await createTheatreLocationAction(payload, {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
        });

        if (!res.success) {
          if (res.error?.fieldErrors) {
            setFieldErrors(res.error.fieldErrors);
          }
          setErrorBanner(res.error?.message || "Failed to create location.");
          setIsSubmitting(false);
          return;
        }

        if (res.data) {
          onSaved(res.data);
        }
        onClose();
      }
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : "Unexpected error saving location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FBBF24]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-lg font-bold text-white">
                {isEdit ? "Edit Theatre Location Profile" : "Register Theatre Location Profile"}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {isEdit
                  ? `Update address, geographic coordinates, and navigation for ${initialBundle?.theatreName || "multiplex"}.`
                  : "Add physical address, landmark, and GPS coordinates."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[#1E293B] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorBanner && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Location Name & Primary Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#E2E8F0]">
                Location Name / Branch <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Main Complex, North Wing Mall"
                required
                className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
              />
              {fieldErrors.locationName && (
                <p className="text-[11px] text-rose-400">{fieldErrors.locationName[0]}</p>
              )}
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-10 px-3 rounded-xl bg-[#1E293B] border border-[#334155]">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-[#334155] text-[#FBBF24] focus:ring-0"
                />
                <span className="text-xs font-semibold text-white">Primary Branch</span>
              </label>
            </div>
          </div>

          {/* Address Lines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
              Physical Address & Geographic Hierarchy
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E2E8F0]">
                Address Line 1 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Building, Floor, Street, Plot No."
                required
                className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
              />
              {fieldErrors.addressLine1 && (
                <p className="text-[11px] text-rose-400">{fieldErrors.addressLine1[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Address Line 2</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Mall Name, Sector, Wing"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Area / Locality</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Viman Nagar, Lower Parel"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
                {fieldErrors.city && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.city[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">
                  State <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
                {fieldErrors.state && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.state[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">
                  Postal PIN Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 411014"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-mono font-medium focus:outline-none focus:border-[#FBBF24]"
                />
                {fieldErrors.postalCode && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.postalCode[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Metro Station"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>

            {/* Address Validation Button */}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleValidateAddress}
                className="gap-1.5 border-[#334155] text-xs font-semibold text-[#CBD5E1]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Verify Standard Format
              </Button>

              {validationPreview && (
                <span className="text-[11px] text-emerald-300 font-medium truncate max-w-sm">
                  Format OK: {validationPreview.normalized}
                </span>
              )}
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-3 pt-2 border-t border-[#1E293B]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
              GPS Coordinates & Spatial Point
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Latitude (° N)</label>
                <input
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 18.562145"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-mono font-medium focus:outline-none focus:border-[#FBBF24]"
                />
                {fieldErrors.latitude && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.latitude[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Longitude (° E)</label>
                <input
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 73.916723"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-mono font-medium focus:outline-none focus:border-[#FBBF24]"
                />
                {fieldErrors.longitude && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.longitude[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps & Navigation Links */}
          <div className="space-y-3 pt-2 border-t border-[#1E293B]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
              Maps & Navigation Routing
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E2E8F0]">Google Maps Web Link</label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
              />
              {fieldErrors.googleMapsUrl && (
                <p className="text-[11px] text-rose-400">{fieldErrors.googleMapsUrl[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Navigation Deep Link</label>
                <input
                  type="url"
                  value={navigationLink}
                  onChange={(e) => setNavigationLink(e.target.value)}
                  placeholder="https://www.google.com/maps/dir/?api=1&..."
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0]">Google Place ID</label>
                <input
                  type="text"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  placeholder="ChIJ_..."
                  className="w-full h-10 px-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-xs font-mono font-medium focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[#1E293B] flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[#334155] text-xs font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 font-bold text-xs"
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Save Location Profile"
              : "Register Location"}
          </Button>
        </div>
      </div>
    </div>
  );
}
