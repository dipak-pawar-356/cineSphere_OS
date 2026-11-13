"use client";

import React, { useState, useEffect } from "react";
import { X, Phone, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreContactWithDetails,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  ContactChannelType,
  ContactRole,
  ContactAvailabilityMode,
  ContactVisibility,
  ContactStatus,
} from "@/types/theatre-contact.types";

interface TheatreContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTheatreContactInput | UpdateTheatreContactInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreContactWithDetails | null;
  defaultChannelType?: "PHONE" | "EMAIL";
}

export function TheatreContactFormModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
  defaultChannelType = "PHONE",
}: TheatreContactFormModalProps) {
  const isEditing = Boolean(initialData);

  const [channelType, setChannelType] = useState<"PHONE" | "EMAIL">(defaultChannelType);
  const [contactRole, setContactRole] = useState<ContactRole>("CUSTOMER_SUPPORT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [visibility, setVisibility] = useState<ContactVisibility>("PUBLIC");
  const [availabilityMode, setAvailabilityMode] = useState<ContactAvailabilityMode>("STANDARD_BUSINESS_HOURS");
  const [businessHours, setBusinessHours] = useState("");
  const [status, setStatus] = useState<ContactStatus>("ACTIVE");

  // Phone Fields
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [extension, setExtension] = useState("");
  const [phoneType, setPhoneType] = useState("MOBILE");
  const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);

  // Email Fields
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState("SUPPORT");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setChannelType((initialData.channelType === "EMAIL" ? "EMAIL" : "PHONE"));
      setContactRole(initialData.contactRole);
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setIsPrimary(initialData.isPrimary);
      setVisibility(initialData.visibility);
      setAvailabilityMode(initialData.availabilityMode);
      setBusinessHours(initialData.businessHours || "");
      setStatus(initialData.status);

      if (initialData.phone) {
        setCountryCode(initialData.phone.countryCode || "+91");
        setPhoneNumber(initialData.phone.phoneNumber);
        setExtension(initialData.phone.extension || "");
        setPhoneType(initialData.phone.phoneType || "MOBILE");
        setIsWhatsappEnabled(initialData.phone.isWhatsappEnabled);
      }
      if (initialData.email) {
        setEmail(initialData.email.email);
        setEmailType(initialData.email.emailType || "SUPPORT");
        setDepartment(initialData.email.department || "");
      }
    } else {
      setChannelType(defaultChannelType);
      setContactRole("CUSTOMER_SUPPORT");
      setTitle("");
      setDescription("");
      setIsPrimary(false);
      setVisibility("PUBLIC");
      setAvailabilityMode("STANDARD_BUSINESS_HOURS");
      setBusinessHours("09:00 AM - 11:30 PM IST (Mon-Sun)");
      setStatus("ACTIVE");
      setCountryCode("+91");
      setPhoneNumber("");
      setExtension("");
      setPhoneType("MOBILE");
      setIsWhatsappEnabled(false);
      setEmail("");
      setEmailType("SUPPORT");
      setDepartment("");
    }
    setError(null);
  }, [initialData, isOpen, defaultChannelType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Contact title is required.");
      return;
    }

    if (channelType === "PHONE" && !phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (channelType === "EMAIL" && !email.trim()) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData) {
        const updatePayload: UpdateTheatreContactInput = {
          contactId: initialData.id,
          theatreId,
          expectedVersion: initialData.version,
          title: title.trim(),
          description: description.trim() || null,
          contactRole,
          isPrimary,
          visibility,
          availabilityMode,
          businessHours: businessHours.trim() || null,
          status,
        };

        if (channelType === "PHONE") {
          updatePayload.phone = {
            countryCode: countryCode.trim(),
            phoneNumber: phoneNumber.trim(),
            extension: extension.trim() || null,
            phoneType,
            isWhatsappEnabled,
          };
        } else {
          updatePayload.email = {
            email: email.trim().toLowerCase(),
            emailType,
            department: department.trim() || null,
          };
        }

        await onSubmit(updatePayload);
      } else {
        const createPayload: CreateTheatreContactInput = {
          theatreId,
          channelType,
          contactRole,
          title: title.trim(),
          description: description.trim() || null,
          isPrimary,
          visibility,
          availabilityMode,
          businessHours: businessHours.trim() || null,
          status,
        };

        if (channelType === "PHONE") {
          createPayload.phone = {
            countryCode: countryCode.trim(),
            phoneNumber: phoneNumber.trim(),
            extension: extension.trim() || null,
            phoneType,
            isWhatsappEnabled,
          };
        } else {
          createPayload.email = {
            email: email.trim().toLowerCase(),
            emailType,
            department: department.trim() || null,
          };
        }

        await onSubmit(createPayload);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save contact record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {channelType === "PHONE" ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="contact-modal-title" className="text-lg font-bold text-white">
                {isEditing ? `Edit Contact: ${initialData?.title}` : `Add New ${channelType === "PHONE" ? "Phone Contact" : "Email Contact"}`}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {channelType === "PHONE"
                  ? "Configure ticketing helpline, guest box office line, or VIP desk."
                  : "Configure support inbox, ticketing helpdesk, or corporate contact."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[#1E293B] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800 text-red-300">
              {error}
            </div>
          )}

          {/* Channel Type Selector (if creating) */}
          {!isEditing && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setChannelType("PHONE")}
                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  channelType === "PHONE"
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "bg-[#0F1523] border-[#26334D] text-zinc-400 hover:text-white"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Voice / Phone Number</span>
              </button>
              <button
                type="button"
                onClick={() => setChannelType("EMAIL")}
                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  channelType === "EMAIL"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                    : "bg-[#0F1523] border-[#26334D] text-zinc-400 hover:text-white"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </button>
            </div>
          )}

          {/* Title & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contact Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Main Box Office Helpline"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Operational Role <span className="text-red-500">*</span>
              </label>
              <select
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value as ContactRole)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="CUSTOMER_SUPPORT">Customer Support</option>
                <option value="GENERAL_ENQUIRY">General Enquiry</option>
                <option value="BOOKING_BOX_OFFICE">Booking & Box Office</option>
                <option value="BUSINESS_DEVELOPMENT">Corporate & B2B Enquiries</option>
                <option value="DUTY_MANAGER">Duty Manager</option>
                <option value="TECHNICAL_OPERATIONS">Technical Operations</option>
                <option value="LOST_AND_FOUND">Lost & Found</option>
              </select>
            </div>
          </div>

          {/* Channel Specific Inputs */}
          {channelType === "PHONE" ? (
            <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#1E293B] space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Telephone & Direct Dial Specifications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Country Code</label>
                  <Input
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+91"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Phone / Landline Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 020-66451234 or 9820012345"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Extension (Optional)</label>
                  <Input
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. Ext 402"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Line Type</label>
                  <select
                    value={phoneType}
                    onChange={(e) => setPhoneType(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="LANDLINE">Standard Landline</option>
                    <option value="DIRECT_DESK">Direct Concierge Desk</option>
                    <option value="TOLL_FREE">Toll-Free (1800)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="phone-whatsapp"
                  checked={isWhatsappEnabled}
                  onChange={(e) => setIsWhatsappEnabled(e.target.checked)}
                  className="rounded border-[#26334D] bg-[#0F1523] text-emerald-500"
                />
                <label htmlFor="phone-whatsapp" className="text-xs text-zinc-300 cursor-pointer">
                  Supports WhatsApp Business Messaging (Future Ready)
                </label>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#1E293B] space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Email Address & Inbound Routing
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. support.pune@cinesphere.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Department / Queue</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Guest Relations, Corporate Bookings"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Email Category</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="SUPPORT">Customer Care & Support</option>
                  <option value="GENERAL">General Inquiries</option>
                  <option value="BUSINESS">Corporate & B2B Events</option>
                  <option value="BOOKING">Ticketing & Bulk Booking</option>
                  <option value="MANAGER">Executive Management</option>
                </select>
              </div>
            </div>
          )}

          {/* Operating Hours (Capability #1: Availability) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Operating Availability
              </label>
              <select
                value={availabilityMode}
                onChange={(e) => setAvailabilityMode(e.target.value as ContactAvailabilityMode)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="STANDARD_BUSINESS_HOURS">Standard Operating Hours</option>
                <option value="TWENTY_FOUR_SEVEN">24/7 Round the Clock</option>
                <option value="SHOWTIME_ONLY">Active During Showtimes</option>
                <option value="EMERGENCY_ONLY">Emergency Only</option>
                <option value="TEMPORARILY_INACTIVE">Temporarily Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Business Hours Schedule
              </label>
              <Input
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="e.g. 09:00 AM - 11:30 PM IST (Mon-Sun)"
              />
            </div>
          </div>

          {/* Visibility & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Public Directory Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ContactVisibility)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="PUBLIC">Publicly Visible on Theatre Page</option>
                <option value="HIDDEN">Hidden from Public View</option>
                <option value="INTERNAL_ONLY">Internal Operations Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Patron Guidance / Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. For booking cancellation requests and wheelchair assistance..."
            />
          </div>

          {/* Primary Flag Checkbox */}
          <div className="p-3.5 rounded-xl bg-[#161F2E]/80 border border-[#2A3445] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className={`h-4 w-4 ${isPrimary ? "text-amber-400 fill-amber-400" : "text-zinc-500"}`} />
              <div>
                <span className="text-xs font-bold text-white">Set as Primary {channelType === "PHONE" ? "Phone Number" : "Email Address"}</span>
                <p className="text-[11px] text-zinc-400">Featured as the main contact point on tickets and public cinema headers.</p>
              </div>
            </div>
            <input
              type="checkbox"
              id="is-primary-checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-[#26334D] bg-[#0F1523] text-amber-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Contact Record" : "Create Contact Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
