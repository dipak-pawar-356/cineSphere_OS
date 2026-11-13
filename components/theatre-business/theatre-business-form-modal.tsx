"use client";

import React, { useState, useEffect } from "react";
import { X, Building, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreBusinessProfileWithDetails,
  UpdateTheatreBusinessProfileInput,
  BusinessCategory,
  BusinessOwnershipType,
} from "@/types/theatre-business.types";

interface TheatreBusinessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTheatreBusinessProfileInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreBusinessProfileWithDetails | null;
}

export function TheatreBusinessFormModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
}: TheatreBusinessFormModalProps) {
  // Legal profile state
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [registeredEntityName, setRegisteredEntityName] = useState("");
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>("PRIVATE_LIMITED");
  const [customCategory, setCustomCategory] = useState("");
  const [businessType, setBusinessType] = useState("CINEMA_EXHIBITION");
  const [businessDescription, setBusinessDescription] = useState("");
  const [industry, setIndustry] = useState("Media & Entertainment / Cinema Exhibition");

  // Registration state
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [registrationAuthority, setRegistrationAuthority] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");

  // Owner state
  const [ownerName, setOwnerName] = useState("");
  const [ownershipType, setOwnershipType] = useState<BusinessOwnershipType>("DIRECT_OWNERSHIP");
  const [businessContactPhone, setBusinessContactPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [managingDirector, setManagingDirector] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setLegalBusinessName(initialData.legalBusinessName || "");
      setRegisteredEntityName(initialData.registeredEntityName || "");
      setBusinessCategory(initialData.businessCategory || "PRIVATE_LIMITED");
      setCustomCategory(initialData.customCategory || "");
      setBusinessType(initialData.businessType || "CINEMA_EXHIBITION");
      setBusinessDescription(initialData.businessDescription || "");
      setIndustry(initialData.industry || "Media & Entertainment / Cinema Exhibition");

      if (initialData.registration) {
        setGstNumber(initialData.registration.gstNumber || "");
        setPanNumber(initialData.registration.panNumber || "");
        setCinNumber(initialData.registration.cinNumber || "");
        setBusinessRegistrationNumber(initialData.registration.businessRegistrationNumber || "");
        setRegistrationDate(initialData.registration.registrationDate || "");
        setRegistrationAuthority(initialData.registration.registrationAuthority || "");
        setCertificateUrl(initialData.registration.certificateUrl || "");
      }

      if (initialData.owner) {
        setOwnerName(initialData.owner.ownerName || "");
        setOwnershipType(initialData.owner.ownershipType || "DIRECT_OWNERSHIP");
        setBusinessContactPhone(initialData.owner.businessContactPhone || "");
        setBusinessEmail(initialData.owner.businessEmail || "");
        setManagingDirector(initialData.owner.managingDirector || "");
        setAuthorizedSignatory(initialData.owner.authorizedSignatory || "");
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!legalBusinessName.trim()) {
      setError("Legal business name is required.");
      return;
    }

    try {
      setLoading(true);
      const payload: UpdateTheatreBusinessProfileInput = {
        theatreId,
        expectedVersion: initialData?.version,
        legalBusinessName: legalBusinessName.trim(),
        registeredEntityName: registeredEntityName.trim() || null,
        businessCategory,
        customCategory: customCategory.trim() || null,
        businessType: businessType.trim(),
        businessDescription: businessDescription.trim() || null,
        industry: industry.trim(),
        registration: {
          gstNumber: gstNumber.trim().toUpperCase() || null,
          panNumber: panNumber.trim().toUpperCase() || null,
          cinNumber: cinNumber.trim().toUpperCase() || null,
          businessRegistrationNumber: businessRegistrationNumber.trim() || null,
          registrationDate: registrationDate.trim() || null,
          registrationAuthority: registrationAuthority.trim() || null,
          certificateUrl: certificateUrl.trim() || null,
        },
        owner: {
          ownerName: ownerName.trim() || legalBusinessName.trim(),
          ownershipType,
          businessContactPhone: businessContactPhone.trim() || null,
          businessEmail: businessEmail.trim() || null,
          managingDirector: managingDirector.trim() || null,
          authorizedSignatory: authorizedSignatory.trim() || null,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update business profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              {initialData ? "Edit Legal & Business Profile" : "Register Business Profile"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Section 1: Legal Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-400" /> Legal Entity Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Legal Business Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  value={legalBusinessName}
                  onChange={(e) => setLegalBusinessName(e.target.value)}
                  placeholder="e.g. CineSphere Entertainment Private Limited"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Registered Trade Name / Entity</label>
                <Input
                  value={registeredEntityName}
                  onChange={(e) => setRegisteredEntityName(e.target.value)}
                  placeholder="e.g. CineSphere Entertainment Pvt Ltd"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Business Category</label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value as BusinessCategory)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PRIVATE_LIMITED">Private Limited (Pvt Ltd)</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="MULTIPLEX">Multiplex Cinema</option>
                  <option value="SINGLE_SCREEN">Single Screen Cinema</option>
                  <option value="ENTERTAINMENT_COMPANY">Entertainment Company</option>
                  <option value="CINEMA_CHAIN">National Cinema Chain</option>
                  <option value="PARTNERSHIP">Partnership Firm</option>
                  <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                  <option value="TRUST">Trust / Non-Profit</option>
                  <option value="GOVERNMENT">Government / Municipal</option>
                  <option value="CUSTOM">Custom Enterprise</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Industry / Domain</label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Media & Entertainment / Cinema Exhibition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Corporate Business Description</label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of corporate entity, operation scope, and theatre exhibition authority..."
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Registration Information (GST, PAN, CIN) */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Government & Tax Registrations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  GSTIN (15 characters)
                </label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AABCU9603R1ZM"
                  maxLength={15}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  PAN (10 characters)
                </label>
                <Input
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AABCU9603R"
                  maxLength={10}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Corporate CIN / LLPIN
                </label>
                <Input
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. U92100MH2021PTC358912"
                  maxLength={25}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Registration Authority</label>
                <Input
                  value={registrationAuthority}
                  onChange={(e) => setRegistrationAuthority(e.target.value)}
                  placeholder="e.g. ROC Pune & MCA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Registration Date</label>
                <Input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Trade License Number</label>
                <Input
                  value={businessRegistrationNumber}
                  onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                  placeholder="e.g. MH-PUN-CIN-2021-9981"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ownership & Governance */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-400" /> Ownership & Governance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Principal Owner / Promoter</label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Ownership Structure</label>
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value as BusinessOwnershipType)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DIRECT_OWNERSHIP">Direct Ownership</option>
                  <option value="LEASE_OPERATED">Lease Operated</option>
                  <option value="FRANCHISE">Franchise</option>
                  <option value="JOINT_VENTURE">Joint Venture</option>
                  <option value="MANAGEMENT_CONTRACT">Management Contract</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Managing Director / CEO</label>
                <Input
                  value={managingDirector}
                  onChange={(e) => setManagingDirector(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Authorized Legal Signatory</label>
                <Input
                  value={authorizedSignatory}
                  onChange={(e) => setAuthorizedSignatory(e.target.value)}
                  placeholder="e.g. Rajesh Kulkarni (VP Legal)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Corporate Legal Phone</label>
                <Input
                  value={businessContactPhone}
                  onChange={(e) => setBusinessContactPhone(e.target.value)}
                  placeholder="e.g. +91 98220 12345"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Corporate Legal Email</label>
                <Input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="e.g. corporate.legal@cinesphere.com"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {loading ? "Saving Changes..." : "Save Legal Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
