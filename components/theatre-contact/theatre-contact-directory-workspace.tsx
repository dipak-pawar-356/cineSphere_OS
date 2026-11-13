"use client";

import React, { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  Globe,
  Share2,
  ShieldAlert,
  UserCheck,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Trash2,
  Archive,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContactChannelBadge,
  ContactRoleBadge,
  ContactAvailabilityBadge,
  ContactVerificationBadge,
  ContactVisibilityBadge,
} from "./contact-channel-badge";
import { TheatreContactFormModal } from "./theatre-contact-form-modal";
import { TheatreEmergencyContactModal } from "./theatre-emergency-contact-modal";
import { TheatreManagerContactModal } from "./theatre-manager-contact-modal";
import { TheatreWebsiteSocialModal } from "./theatre-website-social-modal";
import type {
  TheatreContactWithDetails,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  UpdateTheatreWebsiteInput,
  UpdateTheatreContactSocialLinksInput,
  ContactChannelType,
  ContactRole,
  ContactAvailabilityMode,
} from "@/types/theatre-contact.types";

interface TheatreContactDirectoryWorkspaceProps {
  theatreId: string;
  theatreName: string;
  isSuperAdmin?: boolean;
  contacts: TheatreContactWithDetails[];
  onCreateContact: (data: CreateTheatreContactInput) => Promise<TheatreContactWithDetails>;
  onUpdateContact: (data: UpdateTheatreContactInput) => Promise<TheatreContactWithDetails>;
  onDeleteContact: (contactId: string, theatreId: string) => Promise<boolean>;
  onArchiveContact: (contactId: string, theatreId: string) => Promise<boolean>;
  onUpdateWebsite: (data: UpdateTheatreWebsiteInput) => Promise<void>;
  onUpdateSocialLinks: (data: UpdateTheatreContactSocialLinksInput) => Promise<void>;
  onReorderContacts: (theatreId: string, orderedContactIds: string[]) => Promise<void>;
}

export function TheatreContactDirectoryWorkspace({
  theatreId,
  theatreName,
  isSuperAdmin = false,
  contacts: initialContacts,
  onCreateContact,
  onUpdateContact,
  onDeleteContact,
  onArchiveContact,
  onUpdateWebsite,
  onUpdateSocialLinks,
  onReorderContacts,
}: TheatreContactDirectoryWorkspaceProps) {
  const [contacts, setContacts] = useState<TheatreContactWithDetails[]>(initialContacts);

  // Sync state if initialContacts changes
  React.useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  // Filters & Search
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [phoneEmailModalOpen, setPhoneEmailModalOpen] = useState(false);
  const [defaultChannelType, setDefaultChannelType] = useState<"PHONE" | "EMAIL">("PHONE");
  const [editingContact, setEditingContact] = useState<TheatreContactWithDetails | null>(null);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [editingEmergencyContact, setEditingEmergencyContact] = useState<TheatreContactWithDetails | null>(null);

  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [editingManagerContact, setEditingManagerContact] = useState<TheatreContactWithDetails | null>(null);

  const [webSocialModalOpen, setWebSocialModalOpen] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = contacts.length;
    const active = contacts.filter((c) => c.status === "ACTIVE").length;
    const verified = contacts.filter((c) => c.verificationStatus === "VERIFIED").length;
    const emergency24x7 = contacts.filter(
      (c) =>
        (c.channelType === "EMERGENCY" || c.channelType === "MANAGER") &&
        (c.availabilityMode === "TWENTY_FOUR_SEVEN" || c.availabilityMode === "EMERGENCY_ONLY")
    ).length;

    return { total, active, verified, emergency24x7 };
  }, [contacts]);

  // Website and Social records for web modal
  const websiteContact = useMemo(
    () => contacts.find((c) => c.channelType === "WEBSITE"),
    [contacts]
  );
  const socialContacts = useMemo(
    () => contacts.filter((c) => c.channelType === "SOCIAL_LINK"),
    [contacts]
  );

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Channel type filter
      if (channelFilter !== "ALL" && c.channelType !== channelFilter) {
        return false;
      }
      // Role filter
      if (roleFilter !== "ALL" && c.contactRole !== roleFilter) {
        return false;
      }
      // Availability filter
      if (availabilityFilter !== "ALL" && c.availabilityMode !== availabilityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q) ?? false;
        const matchPhone = c.phone?.phoneNumber.includes(q) ?? false;
        const matchEmail = c.email?.email.toLowerCase().includes(q) ?? false;
        const matchPerson =
          c.emergencyContact?.contactPersonName.toLowerCase().includes(q) ||
          c.managerContact?.managerName.toLowerCase().includes(q);
        const matchHandle = c.socialLink?.handle?.toLowerCase().includes(q) ?? false;

        if (!matchTitle && !matchDesc && !matchPhone && !matchEmail && !matchPerson && !matchHandle) {
          return false;
        }
      }
      return true;
    });
  }, [contacts, channelFilter, roleFilter, availabilityFilter, searchQuery]);

  // Reorder Handler
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredContacts.length) return;

    const newOrdered = [...contacts];
    const sourceContact = filteredContacts[index];
    const targetContact = filteredContacts[targetIndex];

    const sourceIdxInMain = newOrdered.findIndex((c) => c.id === sourceContact.id);
    const targetIdxInMain = newOrdered.findIndex((c) => c.id === targetContact.id);

    if (sourceIdxInMain === -1 || targetIdxInMain === -1) return;

    // Swap
    const temp = newOrdered[sourceIdxInMain];
    newOrdered[sourceIdxInMain] = newOrdered[targetIdxInMain];
    newOrdered[targetIdxInMain] = temp;

    setContacts(newOrdered);

    try {
      await onReorderContacts(theatreId, newOrdered.map((c) => c.id));
      showFeedback("Contact directory order updated successfully.");
    } catch (err: unknown) {
      setContacts(contacts); // rollback
      showFeedback(err instanceof Error ? err.message : "Failed to reorder contacts", "error");
    }
  };

  // Delete Handler
  const handleDelete = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact channel? This cannot be undone.")) {
      return;
    }
    try {
      await onDeleteContact(contactId, theatreId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      showFeedback("Contact channel deleted successfully.");
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : "Failed to delete contact", "error");
    }
  };

  // Archive Handler
  const handleArchive = async (contactId: string) => {
    try {
      await onArchiveContact(contactId, theatreId);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: "ARCHIVED" as const } : c))
      );
      showFeedback("Contact channel archived.");
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : "Failed to archive contact", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Theatre Contact Directory
            </h1>
            <Badge variant="outline" className="text-xs bg-zinc-900/60 border-zinc-800 text-zinc-300">
              {theatreName}
            </Badge>
            {isSuperAdmin && (
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                Platform Admin Mode
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage official customer support, box office lines, duty managers, 24/7 emergency response desks, and public social presence.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              setDefaultChannelType("PHONE");
              setEditingContact(null);
              setPhoneEmailModalOpen(true);
            }}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" /> Add Phone
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setDefaultChannelType("EMAIL");
              setEditingContact(null);
              setPhoneEmailModalOpen(true);
            }}
            className="h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" /> Add Email
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingEmergencyContact(null);
              setEmergencyModalOpen(true);
            }}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Emergency Desk
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingManagerContact(null);
              setManagerModalOpen(true);
            }}
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Duty Manager
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setWebSocialModalOpen(true)}
            className="h-8 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Web & Socials
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-zinc-200 text-xs ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-950/70 border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Channels</span>
            <Sparkles className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
          <span className="text-[11px] text-zinc-500">In directory</span>
        </Card>

        <Card className="p-4 bg-zinc-950/70 border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Channels</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
          <span className="text-[11px] text-zinc-500">Operational lines</span>
        </Card>

        <Card className="p-4 bg-zinc-950/70 border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Verified Badges</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">{stats.verified}</div>
          <span className="text-[11px] text-zinc-500">Authenticated lines</span>
        </Card>

        <Card className="p-4 bg-zinc-950/70 border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">24/7 Response Desks</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.emergency24x7}</div>
          <span className="text-[11px] text-zinc-500">Emergency & Duty lines</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Channel Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: "All Channels", value: "ALL" },
            { label: "Phone Numbers", value: "PHONE" },
            { label: "Email Inboxes", value: "EMAIL" },
            { label: "Web Portal", value: "WEBSITE" },
            { label: "Social Links", value: "SOCIAL_LINK" },
            { label: "Emergency Desks", value: "EMERGENCY" },
            { label: "Duty Managers", value: "MANAGER" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setChannelFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                channelFilter === tab.value
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                  : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Detailed Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, phone, email, manager name, handle..."
              className="pl-9 h-9 bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-9 px-2.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200"
            >
              <option value="ALL">All Roles & Departments</option>
              <option value="CUSTOMER_SUPPORT">Customer Support</option>
              <option value="GENERAL_ENQUIRY">General Enquiry</option>
              <option value="EMERGENCY_DESK">Emergency Desk</option>
              <option value="DUTY_MANAGER">Duty Manager</option>
              <option value="BOOKING_BOX_OFFICE">Box Office</option>
              <option value="BUSINESS_DEVELOPMENT">Corporate & B2B</option>
              <option value="TECHNICAL_OPERATIONS">Technical Operations</option>
              <option value="LOST_AND_FOUND">Lost & Found</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-4">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full h-9 px-2.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200"
            >
              <option value="ALL">All Availability Modes</option>
              <option value="STANDARD_BUSINESS_HOURS">Standard Business Hours</option>
              <option value="TWENTY_FOUR_SEVEN">24/7 Operations</option>
              <option value="SHOWTIME_ONLY">Showtime Operations Only</option>
              <option value="EMERGENCY_ONLY">Emergency Only</option>
              <option value="TEMPORARILY_INACTIVE">Temporarily Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory List */}
      <div className="space-y-3">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-zinc-950/40 border border-zinc-800">
            <Phone className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">No contact channels found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No contacts match the current query or filters. Create a new voice, email, or emergency contact channel above.
            </p>
          </div>
        ) : (
          filteredContacts.map((contact, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredContacts.length - 1;

            return (
              <Card
                key={contact.id}
                className={`p-4 bg-zinc-950/70 border transition-all ${
                  contact.isPrimary
                    ? "border-emerald-500/40 shadow-sm shadow-emerald-950/20"
                    : "border-zinc-800/80 hover:border-zinc-700"
                } ${contact.status === "ARCHIVED" ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Header line: Title, Badges */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-sm text-zinc-100 truncate">
                        {contact.title}
                      </span>

                      {contact.isPrimary && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          PRIMARY
                        </Badge>
                      )}

                      <ContactChannelBadge channelType={contact.channelType} />
                      <ContactRoleBadge role={contact.contactRole} />
                      <ContactAvailabilityBadge mode={contact.availabilityMode} />
                      <ContactVerificationBadge status={contact.verificationStatus} />
                      <ContactVisibilityBadge visibility={contact.visibility} />
                    </div>

                    {/* Secondary line: Specific Channel Details */}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
                      {/* Phone Channel */}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono text-zinc-200">
                            {contact.phone.countryCode} {contact.phone.phoneNumber}
                            {contact.phone.extension && ` ext. ${contact.phone.extension}`}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            ({contact.phone.phoneType})
                          </span>
                          {contact.phone.isWhatsappEnabled && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] py-0 px-1">
                              WhatsApp
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `${contact.phone!.countryCode}${contact.phone!.phoneNumber}`,
                                contact.id
                              )
                            }
                            className="text-zinc-500 hover:text-zinc-300 ml-1"
                            title="Copy Phone Number"
                          >
                            {copiedId === contact.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`tel:${contact.phone.countryCode}${contact.phone.phoneNumber}`}
                            className="text-emerald-400 hover:underline text-[11px] ml-1"
                          >
                            Call
                          </a>
                        </div>
                      )}

                      {/* Email Channel */}
                      {contact.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-mono text-zinc-200">{contact.email.email}</span>
                          {contact.email.department && (
                            <span className="text-[10px] text-zinc-500">
                              • {contact.email.department}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(contact.email!.email, contact.id)}
                            className="text-zinc-500 hover:text-zinc-300 ml-1"
                            title="Copy Email Address"
                          >
                            {copiedId === contact.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`mailto:${contact.email.email}`}
                            className="text-sky-400 hover:underline text-[11px] ml-1"
                          >
                            Mail
                          </a>
                        </div>
                      )}

                      {/* Website Channel */}
                      {contact.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <a
                            href={contact.website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            {contact.website.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Social Link */}
                      {contact.socialLink && (
                        <div className="flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-zinc-400">{contact.socialLink.platform}:</span>
                          <a
                            href={contact.socialLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            {contact.socialLink.handle || contact.socialLink.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {contact.emergencyContact && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-rose-300">
                            {contact.emergencyContact.contactPersonName}
                          </span>
                          <span className="text-zinc-500">
                            ({contact.emergencyContact.roleOrDesignation})
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {contact.emergencyContact.primaryPhone}
                          </span>
                          {contact.emergencyContact.alternatePhone && (
                            <span className="text-zinc-500 font-mono text-[11px]">
                              / {contact.emergencyContact.alternatePhone}
                            </span>
                          )}
                          <span className="text-zinc-500 text-[10px]">
                            • {contact.emergencyContact.availabilityHours}
                          </span>
                        </div>
                      )}

                      {/* Duty Manager Contact */}
                      {contact.managerContact && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-indigo-300">
                            {contact.managerContact.managerName}
                          </span>
                          <span className="text-zinc-500">
                            ({contact.managerContact.designation})
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {contact.managerContact.phone}
                          </span>
                          <span className="text-zinc-400">
                            {contact.managerContact.email}
                          </span>
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] py-0 px-1">
                            Tier {contact.managerContact.escalationTier} Escalation
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Description / Procedures */}
                    {(contact.description ||
                      contact.emergencyContact?.operatingProcedures ||
                      contact.businessHours) && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {contact.emergencyContact?.operatingProcedures ||
                          contact.description ||
                          `Hours: ${contact.businessHours}`}
                      </p>
                    )}
                  </div>

                  {/* Right: Controls & Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Reorder Buttons */}
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={isFirst}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={isLast}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (contact.channelType === "EMERGENCY") {
                          setEditingEmergencyContact(contact);
                          setEmergencyModalOpen(true);
                        } else if (contact.channelType === "MANAGER") {
                          setEditingManagerContact(contact);
                          setManagerModalOpen(true);
                        } else if (
                          contact.channelType === "WEBSITE" ||
                          contact.channelType === "SOCIAL_LINK"
                        ) {
                          setWebSocialModalOpen(true);
                        } else {
                          setEditingContact(contact);
                          setDefaultChannelType(
                            contact.channelType === "EMAIL" ? "EMAIL" : "PHONE"
                          );
                          setPhoneEmailModalOpen(true);
                        }
                      }}
                      className="h-8 px-2.5 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>

                    {/* Archive / Delete */}
                    {contact.status !== "ARCHIVED" ? (
                      <button
                        type="button"
                        onClick={() => handleArchive(contact.id)}
                        className="p-2 rounded text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Archive Channel"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Channel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modals */}
      <TheatreContactFormModal
        isOpen={phoneEmailModalOpen}
        onClose={() => {
          setPhoneEmailModalOpen(false);
          setEditingContact(null);
        }}
        theatreId={theatreId}
        initialData={editingContact}
        defaultChannelType={defaultChannelType}
        onSubmit={async (data) => {
          if (editingContact) {
            const updated = await onUpdateContact(data as UpdateTheatreContactInput);
            setContacts((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
            showFeedback("Contact updated successfully.");
          } else {
            const created = await onCreateContact(data as CreateTheatreContactInput);
            setContacts((prev) => [...prev, created]);
            showFeedback("Contact channel created successfully.");
          }
          setPhoneEmailModalOpen(false);
          setEditingContact(null);
        }}
      />

      <TheatreEmergencyContactModal
        isOpen={emergencyModalOpen}
        onClose={() => {
          setEmergencyModalOpen(false);
          setEditingEmergencyContact(null);
        }}
        theatreId={theatreId}
        initialData={editingEmergencyContact}
        onSubmit={async (data) => {
          if (editingEmergencyContact) {
            const updated = await onUpdateContact(data as UpdateTheatreContactInput);
            setContacts((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
            showFeedback("Emergency contact updated successfully.");
          } else {
            const created = await onCreateContact(data as CreateTheatreContactInput);
            setContacts((prev) => [...prev, created]);
            showFeedback("Emergency desk created successfully.");
          }
          setEmergencyModalOpen(false);
          setEditingEmergencyContact(null);
        }}
      />

      <TheatreManagerContactModal
        isOpen={managerModalOpen}
        onClose={() => {
          setManagerModalOpen(false);
          setEditingManagerContact(null);
        }}
        theatreId={theatreId}
        initialData={editingManagerContact}
        onSubmit={async (data) => {
          if (editingManagerContact) {
            const updated = await onUpdateContact(data as UpdateTheatreContactInput);
            setContacts((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
            showFeedback("Duty manager updated successfully.");
          } else {
            const created = await onCreateContact(data as CreateTheatreContactInput);
            setContacts((prev) => [...prev, created]);
            showFeedback("Duty manager added successfully.");
          }
          setManagerModalOpen(false);
          setEditingManagerContact(null);
        }}
      />

      <TheatreWebsiteSocialModal
        isOpen={webSocialModalOpen}
        onClose={() => setWebSocialModalOpen(false)}
        theatreId={theatreId}
        initialWebsiteContact={websiteContact}
        initialSocialContacts={socialContacts}
        onUpdateWebsite={async (data) => {
          await onUpdateWebsite(data);
          showFeedback("Official website updated.");
        }}
        onUpdateSocialLinks={async (data) => {
          await onUpdateSocialLinks(data);
          showFeedback("Social channels updated.");
        }}
      />
    </div>
  );
}
