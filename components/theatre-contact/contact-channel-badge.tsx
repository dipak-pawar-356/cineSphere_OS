"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  Globe,
  Share2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import type {
  ContactChannelType,
  ContactRole,
  ContactAvailabilityMode,
  ContactVerificationStatus,
  ContactVisibility,
  ContactStatus,
} from "@/types/theatre-contact.types";

interface ContactChannelBadgeProps {
  channelType: ContactChannelType;
  className?: string;
}

export function ContactChannelBadge({ channelType, className }: ContactChannelBadgeProps) {
  switch (channelType) {
    case "PHONE":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 ${className || ""}`}>
          <Phone className="h-3 w-3" />
          <span>Phone</span>
        </span>
      );
    case "EMAIL":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className || ""}`}>
          <Mail className="h-3 w-3" />
          <span>Email</span>
        </span>
      );
    case "WEBSITE":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 ${className || ""}`}>
          <Globe className="h-3 w-3" />
          <span>Website</span>
        </span>
      );
    case "SOCIAL_LINK":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30 ${className || ""}`}>
          <Share2 className="h-3 w-3" />
          <span>Social</span>
        </span>
      );
    case "EMERGENCY":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse ${className || ""}`}>
          <AlertTriangle className="h-3 w-3" />
          <span>Emergency Desk</span>
        </span>
      );
    case "MANAGER":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className || ""}`}>
          <UserCheck className="h-3 w-3" />
          <span>Duty Manager</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 ${className || ""}`}>
          <span>{channelType}</span>
        </span>
      );
  }
}

interface ContactRoleBadgeProps {
  role: ContactRole;
  className?: string;
}

export function ContactRoleBadge({ role, className }: ContactRoleBadgeProps) {
  const roleLabels: Record<ContactRole, string> = {
    CUSTOMER_SUPPORT: "Customer Support",
    GENERAL_ENQUIRY: "General Enquiry",
    EMERGENCY_DESK: "Emergency Desk",
    DUTY_MANAGER: "Duty Manager",
    BUSINESS_DEVELOPMENT: "Corporate & B2B",
    CORPORATE_OFFICE: "Corporate Office",
    BOOKING_BOX_OFFICE: "Box Office",
    TECHNICAL_OPERATIONS: "Projection & Tech",
    LOST_AND_FOUND: "Lost & Found",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium bg-[#1E293B] text-zinc-300 border border-[#334155] ${className || ""}`}>
      {roleLabels[role] || role}
    </span>
  );
}

interface ContactAvailabilityBadgeProps {
  mode: ContactAvailabilityMode;
  className?: string;
}

export function ContactAvailabilityBadge({ mode, className }: ContactAvailabilityBadgeProps) {
  switch (mode) {
    case "TWENTY_FOUR_SEVEN":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className || ""}`}>
          <Clock className="h-3 w-3" />
          <span>24/7 Live</span>
        </span>
      );
    case "STANDARD_BUSINESS_HOURS":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 ${className || ""}`}>
          <Clock className="h-3 w-3" />
          <span>Business Hours</span>
        </span>
      );
    case "EMERGENCY_ONLY":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 ${className || ""}`}>
          <AlertTriangle className="h-3 w-3" />
          <span>Emergency Only</span>
        </span>
      );
    case "SHOWTIME_ONLY":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className || ""}`}>
          <Clock className="h-3 w-3" />
          <span>Showtimes Only</span>
        </span>
      );
    case "TEMPORARILY_INACTIVE":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 ${className || ""}`}>
          <span>Inactive</span>
        </span>
      );
    default:
      return null;
  }
}

interface ContactVerificationBadgeProps {
  status: ContactVerificationStatus;
  className?: string;
}

export function ContactVerificationBadge({ status, className }: ContactVerificationBadgeProps) {
  switch (status) {
    case "VERIFIED":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${className || ""}`}>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Verified Official</span>
        </span>
      );
    case "PENDING_VERIFICATION":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className || ""}`}>
          <span>Pending Review</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400 border border-red-500/30 ${className || ""}`}>
          <span>Rejected</span>
        </span>
      );
    case "UNVERIFIED":
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 ${className || ""}`}>
          <span>Unverified</span>
        </span>
      );
  }
}

interface ContactVisibilityBadgeProps {
  visibility: ContactVisibility;
  className?: string;
}

export function ContactVisibilityBadge({ visibility, className }: ContactVisibilityBadgeProps) {
  switch (visibility) {
    case "PUBLIC":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className || ""}`}>
          <Eye className="h-3 w-3" />
          <span>Public</span>
        </span>
      );
    case "HIDDEN":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 ${className || ""}`}>
          <EyeOff className="h-3 w-3" />
          <span>Hidden</span>
        </span>
      );
    case "INTERNAL_ONLY":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30 ${className || ""}`}>
          <Lock className="h-3 w-3" />
          <span>Internal Staff</span>
        </span>
      );
    default:
      return null;
  }
}
