"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Archive,
  Building,
  Scale,
  Receipt,
  FileCheck2,
  FileText,
  AlertCircle,
  Percent,
} from "lucide-react";
import type {
  BusinessComplianceStatus,
  BusinessCategory,
  TaxSystemType,
  PricingTaxModel,
  BusinessDocumentType,
  BusinessDocumentVerificationStatus,
} from "@/types/theatre-business.types";

interface BusinessComplianceBadgeProps {
  status: BusinessComplianceStatus;
  className?: string;
}

export function BusinessComplianceBadge({ status, className }: BusinessComplianceBadgeProps) {
  switch (status) {
    case "VERIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${
            className || ""
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Verified & Compliant</span>
        </span>
      );
    case "PENDING_VERIFICATION":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${
            className || ""
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Pending Verification</span>
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${
            className || ""
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Compliance Rejected</span>
        </span>
      );
    case "ARCHIVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30 ${
            className || ""
          }`}
        >
          <Archive className="h-3.5 w-3.5 text-zinc-400" />
          <span>Archived</span>
        </span>
      );
    case "DRAFT":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30 ${
            className || ""
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Draft Profile</span>
        </span>
      );
  }
}

interface BusinessCategoryBadgeProps {
  category: BusinessCategory;
  className?: string;
}

export function BusinessCategoryBadge({ category, className }: BusinessCategoryBadgeProps) {
  const getLabel = () => {
    switch (category) {
      case "PRIVATE_LIMITED":
        return "Private Limited (Pvt Ltd)";
      case "LLP":
        return "Limited Liability Partnership (LLP)";
      case "MULTIPLEX":
        return "Multiplex Cinema";
      case "SINGLE_SCREEN":
        return "Single Screen Cinema";
      case "ENTERTAINMENT_COMPANY":
        return "Entertainment Company";
      case "CINEMA_CHAIN":
        return "National Cinema Chain";
      case "PARTNERSHIP":
        return "Partnership Firm";
      case "PROPRIETORSHIP":
        return "Sole Proprietorship";
      case "TRUST":
        return "Trust / Non-Profit";
      case "GOVERNMENT":
        return "Government / Municipal";
      case "CUSTOM":
        return "Custom Enterprise";
      default:
        return category;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/25 ${
        className || ""
      }`}
    >
      <Building className="h-3 w-3" />
      <span>{getLabel()}</span>
    </span>
  );
}

interface TaxSystemBadgeProps {
  system: TaxSystemType;
  rate?: string | null;
  className?: string;
}

export function TaxSystemBadge({ system, rate, className }: TaxSystemBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 ${
        className || ""
      }`}
    >
      <Scale className="h-3 w-3" />
      <span>
        {system} {rate ? `(${rate}%)` : ""}
      </span>
    </span>
  );
}

interface PricingTaxModelBadgeProps {
  model: PricingTaxModel;
  className?: string;
}

export function PricingTaxModelBadge({ model, className }: PricingTaxModelBadgeProps) {
  const isInclusive = model === "TAX_INCLUSIVE";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
        isInclusive
          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
          : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
      } ${className || ""}`}
    >
      <Percent className="h-3 w-3" />
      <span>{isInclusive ? "Tax Inclusive Pricing" : "Tax Exclusive Pricing"}</span>
    </span>
  );
}

interface DocumentTypeBadgeProps {
  type: BusinessDocumentType;
  className?: string;
}

export function DocumentTypeBadge({ type, className }: DocumentTypeBadgeProps) {
  const formatName = () => {
    switch (type) {
      case "CIN_INCORPORATION":
        return "Certificate of Incorporation";
      case "GST_CERTIFICATE":
        return "GST Certificate (REG-06)";
      case "PAN_CARD":
        return "PAN Card Document";
      case "FIRE_SAFETY_NOC":
        return "Fire Safety NOC";
      case "MUNICIPAL_TRADE_LICENSE":
        return "Municipal Trade License";
      case "ENTERTAINMENT_TAX_PERMIT":
        return "Entertainment Tax Permit";
      case "AUTHORIZATION_LETTER":
        return "Authorization Letter";
      case "BOARD_RESOLUTION":
        return "Board Resolution";
      case "REGISTRATION_CERTIFICATE":
        return "Registration Certificate";
      case "OTHER":
      default:
        return "Compliance Document";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 ${
        className || ""
      }`}
    >
      <FileText className="h-3 w-3 text-zinc-400" />
      <span>{formatName()}</span>
    </span>
  );
}

interface DocumentVerificationStatusBadgeProps {
  status: BusinessDocumentVerificationStatus;
  className?: string;
}

export function DocumentVerificationStatusBadge({
  status,
  className,
}: DocumentVerificationStatusBadgeProps) {
  switch (status) {
    case "VERIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${
            className || ""
          }`}
        >
          <FileCheck2 className="h-3 w-3 text-emerald-400" />
          <span>Verified</span>
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${
            className || ""
          }`}
        >
          <AlertCircle className="h-3 w-3 text-rose-400" />
          <span>Rejected</span>
        </span>
      );
    case "PENDING":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${
            className || ""
          }`}
        >
          <Clock className="h-3 w-3 text-amber-400" />
          <span>Pending Review</span>
        </span>
      );
  }
}
