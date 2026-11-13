"use client";

import React, { useState } from "react";
import {
  Building,
  ShieldCheck,
  Scale,
  Receipt,
  FileText,
  FileCheck2,
  Trash2,
  ExternalLink,
  Edit,
  Plus,
  History,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BusinessComplianceBadge,
  BusinessCategoryBadge,
  TaxSystemBadge,
  PricingTaxModelBadge,
  DocumentTypeBadge,
  DocumentVerificationStatusBadge,
} from "./business-compliance-badge";
import { TheatreBusinessFormModal } from "./theatre-business-form-modal";
import { TheatreTaxConfigModal } from "./theatre-tax-config-modal";
import { TheatreInvoiceConfigModal } from "./theatre-invoice-config-modal";
import { TheatreBusinessDocumentModal } from "./theatre-business-document-modal";
import { TheatreBusinessVerificationModal } from "./theatre-business-verification-modal";
import type {
  TheatreBusinessBundle,
  TheatreBusinessProfileWithDetails,
  UpdateTheatreBusinessProfileInput,
  UpdateTheatreTaxConfigurationInput,
  UpdateTheatreInvoiceConfigurationInput,
  VerifyTheatreBusinessProfileInput,
  AddTheatreBusinessDocumentInput,
} from "@/types/theatre-business.types";

interface TheatreBusinessWorkspaceProps {
  theatreId: string;
  initialBundle: TheatreBusinessBundle;
  isSuperAdmin?: boolean;
  onUpdateProfile?: (input: UpdateTheatreBusinessProfileInput) => Promise<void>;
  onUpdateTaxConfig?: (input: UpdateTheatreTaxConfigurationInput) => Promise<void>;
  onUpdateInvoiceConfig?: (input: UpdateTheatreInvoiceConfigurationInput) => Promise<void>;
  onVerifyProfile?: (input: VerifyTheatreBusinessProfileInput) => Promise<void>;
  onAddDocument?: (input: AddTheatreBusinessDocumentInput) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
}

export function TheatreBusinessWorkspace({
  theatreId,
  initialBundle,
  isSuperAdmin = true,
  onUpdateProfile,
  onUpdateTaxConfig,
  onUpdateInvoiceConfig,
  onVerifyProfile,
  onAddDocument,
  onDeleteDocument,
}: TheatreBusinessWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "tax" | "invoicing" | "documents" | "versions"
  >("overview");

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const { profile, registration, owner, taxConfiguration, invoiceConfiguration, compliance, documents, versions } =
    initialBundle;

  // Format date helper
  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (d: Date | string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const profileWithDetails: TheatreBusinessProfileWithDetails | null = profile
    ? {
        ...profile,
        registration,
        owner,
        taxConfiguration,
        invoiceConfiguration,
        compliance,
        documents,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Phase 3 – Part 7
              </span>
              {profile && <BusinessCategoryBadge category={profile.businessCategory} />}
              {compliance && <BusinessComplianceBadge status={compliance.verificationStatus} />}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {profile?.legalBusinessName || "Theatre Business & Legal Profile"}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {profile?.registeredEntityName || profile?.businessDescription || "Enterprise Legal Identity & Tax Administration"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <span>
                Industry: <strong className="text-zinc-300 font-medium">{profile?.industry || "Media & Entertainment"}</strong>
              </span>
              <span>•</span>
              <span>
                Version: <strong className="text-zinc-300 font-mono font-medium">v{profile?.version || 1}</strong>
              </span>
              <span>•</span>
              <span>
                Updated: <strong className="text-zinc-300 font-medium">{formatDate(profile?.updatedAt)}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isSuperAdmin && compliance && (
              <Button
                variant="outline"
                onClick={() => setIsVerifyModalOpen(true)}
                className="border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs gap-1.5"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Super Admin Audit</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsProfileModalOpen(true)}
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs gap-1.5"
            >
              <Edit className="h-4 w-4 text-indigo-400" />
              <span>Edit Legal Profile</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsTaxModalOpen(true)}
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs gap-1.5"
            >
              <Scale className="h-4 w-4 text-sky-400" />
              <span>Configure Tax</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs gap-1.5"
            >
              <Receipt className="h-4 w-4 text-purple-400" />
              <span>Invoice Layout</span>
            </Button>

            <Button
              onClick={() => setIsDocModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Attach Document</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Compliance Standing */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Compliance Standing</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-zinc-100">
              {compliance?.verificationStatus || "DRAFT"}
            </span>
            <div className="text-xs text-zinc-400 mt-0.5">
              Risk: <strong className="text-emerald-400">{compliance?.riskScore || "LOW"}</strong>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">
            Verified by: {compliance?.verifiedBy || "Super Admin"}
          </span>
        </div>

        {/* KPI 2: Tax Framework */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tax Framework</span>
            <Scale className="h-4 w-4 text-sky-400" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-zinc-100">
              {taxConfiguration?.taxSystemType || "GST"} {taxConfiguration?.taxPercentage ? `(${taxConfiguration.taxPercentage}%)` : ""}
            </span>
            <div className="text-xs text-zinc-400 mt-0.5">
              Model: <strong className="text-indigo-400">{taxConfiguration?.pricingTaxModel || "TAX_INCLUSIVE"}</strong>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">
            Code: {taxConfiguration?.regionalTaxCode || "MH-27"} ({taxConfiguration?.taxJurisdictionCountry || "IND"})
          </span>
        </div>

        {/* KPI 3: Invoicing Governance */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Invoicing Governance</span>
            <Receipt className="h-4 w-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-lg font-mono font-bold text-zinc-100">
              {invoiceConfiguration?.invoicePrefix || "CSP-"}{invoiceConfiguration?.invoiceSequenceNext || "10001"}
            </span>
            <div className="text-xs text-zinc-400 mt-0.5">
              E-Invoice: <strong className={invoiceConfiguration?.enableEInvoice ? "text-emerald-400" : "text-zinc-500"}>
                {invoiceConfiguration?.enableEInvoice ? "Enabled (IRN)" : "Disabled"}
              </strong>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">
            PDF Generator: {invoiceConfiguration?.enablePdfInvoice ? "Active" : "Inactive"}
          </span>
        </div>

        {/* KPI 4: Document Vault */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Document Vault</span>
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-zinc-100">
              {documents.length} Files Attached
            </span>
            <div className="text-xs text-zinc-400 mt-0.5">
              Verified: <strong className="text-emerald-400">{documents.filter((d) => d.verificationStatus === "VERIFIED").length}</strong>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">
            Storage: Decoupled metadata reference
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "overview"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Legal & Registrations
        </button>

        <button
          onClick={() => setActiveTab("tax")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "tax"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Country-Aware Tax Config
        </button>

        <button
          onClick={() => setActiveTab("invoicing")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "invoicing"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Invoice & Billing
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "documents"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Document Vault ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab("versions")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "versions"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Audit History ({versions?.length || 0})
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW & REGISTRATIONS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Government Credentials */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Corporate & Tax Identification
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
                className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
              >
                <Edit className="h-3 w-3 mr-1 text-indigo-400" /> Edit
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Goods and Services Tax (GSTIN)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-100">
                    {registration?.gstNumber || "Not Provided"}
                  </span>
                  {registration?.isGstVerified && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Permanent Account Number (PAN)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-100">
                    {registration?.panNumber || "Not Provided"}
                  </span>
                  {registration?.isPanVerified && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Corporate Identity Number (CIN)</span>
                <span className="font-mono font-bold text-zinc-100">
                  {registration?.cinNumber || "Not Provided"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Registration Authority</span>
                <span className="text-zinc-200">
                  {registration?.registrationAuthority || "Registrar of Companies (MCA)"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Incorporation / Registration Date</span>
                <span className="text-zinc-200">
                  {registration?.registrationDate || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Trade License Number</span>
                <span className="font-mono text-zinc-200">
                  {registration?.businessRegistrationNumber || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Ownership & Corporate Governance */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                Ownership & Governance
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
                className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
              >
                <Edit className="h-3 w-3 mr-1 text-indigo-400" /> Edit
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Principal Owner / Promoter</span>
                <span className="font-semibold text-zinc-100">{owner?.ownerName || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Ownership Structure</span>
                <span className="font-medium text-zinc-200">{owner?.ownershipType || "DIRECT_OWNERSHIP"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Managing Director / CEO</span>
                <span className="text-zinc-200">{owner?.managingDirector || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Authorized Legal Signatory</span>
                <span className="text-zinc-200">{owner?.authorizedSignatory || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Corporate Legal Phone</span>
                <span className="font-mono text-zinc-200">{owner?.businessContactPhone || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-400">Corporate Legal Email</span>
                <span className="font-mono text-zinc-200">{owner?.businessEmail || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COUNTRY-AWARE TAX CONFIGURATION */}
      {activeTab === "tax" && (
        <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Scale className="h-5 w-5 text-sky-400" />
                Multi-Country Tax Framework & Compliance
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configured to calculate, apply and report admissions tax according to local territory legislation.
              </p>
            </div>
            <Button
              onClick={() => setIsTaxModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Modify Tax Rules</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Tax System Framework</span>
              <div className="pt-1">
                <TaxSystemBadge
                  system={taxConfiguration?.taxSystemType || "GST"}
                  rate={taxConfiguration?.taxPercentage}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Jurisdiction Country</span>
              <p className="text-base font-bold font-mono text-zinc-200 pt-1">
                {taxConfiguration?.taxJurisdictionCountry || "IND"} (Regional: {taxConfiguration?.regionalTaxCode || "MH-27"})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Ticketing Pricing Strategy</span>
              <div className="pt-1">
                <PricingTaxModelBadge
                  model={taxConfiguration?.pricingTaxModel || "TAX_INCLUSIVE"}
                />
              </div>
            </div>
          </div>

          {taxConfiguration?.isTaxExempt && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block">Entity Is Currently Tax-Exempt</strong>
                <p className="text-zinc-300 mt-0.5">
                  Reason on file: {taxConfiguration.exemptionReason || "Statutory cultural exhibition exemption."}
                </p>
              </div>
            </div>
          )}

          {taxConfiguration?.notes && (
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-300 space-y-1">
              <strong className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                Tax Audit & Jurisdiction Notes
              </strong>
              <p>{taxConfiguration.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVOICE & BILLING */}
      {activeTab === "invoicing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-purple-400" />
                  Invoice Layout & Sequencing Setup
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Governance rules governing consumer billing sequences, legal footer notes, and PDF delivery.
                </p>
              </div>
              <Button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Configure Invoicing</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Invoice Number Prefix</span>
                <p className="text-base font-bold font-mono text-indigo-400 pt-1">
                  {invoiceConfiguration?.invoicePrefix || "CSP-"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Next Available Sequence</span>
                <p className="text-base font-bold font-mono text-zinc-200 pt-1">
                  #{invoiceConfiguration?.invoiceSequenceNext || 10001}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 font-medium">Header Title</span>
                <p className="text-zinc-200 font-semibold">
                  {invoiceConfiguration?.invoiceHeader || "Tax Invoice / Entertainment Receipt"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 font-medium">Statutory Footer</span>
                <p className="text-zinc-300">
                  {invoiceConfiguration?.invoiceFooter || "Subject to municipal jurisdiction."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                <span className="text-zinc-400 font-medium">Audit Remarks</span>
                <p className="text-zinc-300 font-mono">
                  {invoiceConfiguration?.invoiceNotes || "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Mockup Preview Card */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Invoice Preview Mockup
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                  Sample
                </span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs text-zinc-300">
                <div className="text-center pb-2 border-b border-dashed border-zinc-800">
                  <h4 className="font-bold text-zinc-100">
                    {invoiceConfiguration?.invoiceHeader || "TAX INVOICE"}
                  </h4>
                  <p className="text-[11px] text-zinc-400">{profile?.legalBusinessName}</p>
                  <p className="text-[10px] text-zinc-500">GSTIN: {registration?.gstNumber || "27AABCU9603R1ZM"}</p>
                </div>

                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-zinc-500">Invoice No:</span>
                  <span className="font-bold text-indigo-400">
                    {invoiceConfiguration?.invoicePrefix || "CSP-"}{invoiceConfiguration?.invoiceSequenceNext || 10001}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-zinc-500">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>

                <div className="py-2 border-t border-b border-dashed border-zinc-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Movie Ticket (x2)</span>
                    <span>₹800.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GST (18% inclusive)</span>
                    <span>₹122.03</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm text-zinc-100 pt-1">
                  <span>Total Paid:</span>
                  <span>₹800.00</span>
                </div>

                <p className="text-[10px] text-zinc-500 text-center pt-3 border-t border-dashed border-zinc-800">
                  {invoiceConfiguration?.invoiceFooter || "Thank you for choosing CineSphere."}
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-zinc-500 text-center">
              Generated in compliance with Indian GST Rule 54
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT VAULT */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">
                Attached Compliance Documents & Licences ({documents.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Decoupled document references for incorporation, GST certificates, PAN cards, and safety permits.
              </p>
            </div>
            <Button
              onClick={() => setIsDocModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Attach New Document</span>
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 space-y-2">
              <FileText className="h-8 w-8 mx-auto text-zinc-500" />
              <p className="text-sm font-medium">No documents attached yet.</p>
              <p className="text-xs text-zinc-500">
                Attach Certificates of Incorporation, GST certificates, or Municipal NOCs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DocumentTypeBadge type={doc.documentType} />
                        <DocumentVerificationStatusBadge status={doc.verificationStatus} />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-100">{doc.documentTitle}</h4>
                      {doc.documentNumber && (
                        <p className="text-xs font-mono text-zinc-400">
                          Ref: <strong>{doc.documentNumber}</strong>
                        </p>
                      )}
                    </div>

                    {onDeleteDocument && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/80">
                    <span>
                      {doc.expiryDate ? `Expires: ${doc.expiryDate}` : "No Expiry"}
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <span>View File</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT & VERSION HISTORY */}
      {activeTab === "versions" && (
        <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-400" />
                Immutable Business Audit Ledger
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cryptographic transaction snapshots tracking all changes to legal identity, tax configs, and compliance reviews.
              </p>
            </div>
          </div>

          {!versions || versions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No version history records found.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {versions.map((v) => (
                <div key={v.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        v{v.versionNumber}
                      </span>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                        {v.changeType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">{v.changeSummary || "Profile updated"}</p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>By: <strong className="text-zinc-400">{v.changedBy || "System"}</strong></span>
                      <span>•</span>
                      <span>Role: <strong className="text-zinc-400">{v.changedRole || "ADMIN"}</strong></span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                    {formatDateTime(v.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isProfileModalOpen && (
        <TheatreBusinessFormModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          theatreId={theatreId}
          initialData={profileWithDetails}
          onSubmit={async (data) => {
            if (onUpdateProfile) {
              await onUpdateProfile(data);
            }
          }}
        />
      )}

      {isTaxModalOpen && (
        <TheatreTaxConfigModal
          isOpen={isTaxModalOpen}
          onClose={() => setIsTaxModalOpen(false)}
          theatreId={theatreId}
          initialData={taxConfiguration}
          onSubmit={async (data) => {
            if (onUpdateTaxConfig) {
              await onUpdateTaxConfig(data);
            }
          }}
        />
      )}

      {isInvoiceModalOpen && (
        <TheatreInvoiceConfigModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          theatreId={theatreId}
          initialData={invoiceConfiguration}
          onSubmit={async (data) => {
            if (onUpdateInvoiceConfig) {
              await onUpdateInvoiceConfig(data);
            }
          }}
        />
      )}

      {isDocModalOpen && (
        <TheatreBusinessDocumentModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          theatreId={theatreId}
          onSubmit={async (data) => {
            if (onAddDocument) {
              await onAddDocument(data);
            }
          }}
        />
      )}

      {isVerifyModalOpen && compliance && (
        <TheatreBusinessVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          theatreId={theatreId}
          currentStatus={compliance.verificationStatus}
          onSubmit={async (data) => {
            if (onVerifyProfile) {
              await onVerifyProfile(data);
            }
          }}
        />
      )}
    </div>
  );
}
