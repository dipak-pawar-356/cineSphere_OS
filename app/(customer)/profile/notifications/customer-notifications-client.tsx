"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  NotificationCategory,
  NotificationItem,
  NotificationPreferences,
  NotificationPriority,
  NotificationStatus,
} from "@/types/notification.types";
import {
  archiveNotificationAction,
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  updatePreferencesAction,
} from "@/actions/notification-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  Filter,
  Info,
  Mail,
  MessageSquare,
  QrCode,
  Search,
  Settings,
  ShieldAlert,
  Smartphone,
  Tag,
  Trash2,
  X,
} from "lucide-react";

interface CustomerNotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  initialPreferences: NotificationPreferences;
  customerId: string;
}

export function CustomerNotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialPreferences,
  customerId,
}: CustomerNotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Soft delete check
    if (notif.status === "DELETED") return false;

    // Status filter
    if (statusFilter === "UNREAD" && notif.status !== "UNREAD") return false;
    if (statusFilter === "READ" && notif.status !== "READ") return false;
    if (statusFilter === "ARCHIVED" && notif.status !== "ARCHIVED") return false;
    if (statusFilter === "ALL" && notif.status === "ARCHIVED") return false; // Hide archived from ALL by default

    // Category filter
    if (categoryFilter !== "ALL" && notif.category !== categoryFilter) return false;

    // Priority filter
    if (priorityFilter !== "ALL" && notif.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notif.title.toLowerCase().includes(q);
      const matchMessage = notif.message.toLowerCase().includes(q);
      const matchModule = notif.sourceModule?.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage && !matchModule) return false;
    }

    return true;
  });

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id, { userId: customerId, role: "CUSTOMER" });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "READ" as NotificationStatus, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        showFeedback("Notification marked as read.");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction(customerId, "CUSTOMER");
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.status === "UNREAD" ? { ...n, status: "READ" as NotificationStatus, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount(0);
        showFeedback("All notifications marked as read.");
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveNotificationAction(id, { userId: customerId, role: "CUSTOMER" });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "ARCHIVED" as NotificationStatus, archivedAt: new Date().toISOString() } : n))
        );
        if (notifications.find((n) => n.id === id)?.status === "UNREAD") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showFeedback("Notification archived.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNotificationAction(id, { userId: customerId, role: "CUSTOMER" });
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notifications.find((n) => n.id === id)?.status === "UNREAD") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showFeedback("Notification deleted.");
      }
    });
  };

  const handleTogglePreferenceChannel = (channel: keyof NotificationPreferences["channels"]) => {
    const updated = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    };
    setPreferences(updated);
    startTransition(async () => {
      const res = await updatePreferencesAction(customerId, { channels: updated.channels });
      if (res.success) {
        showFeedback(`Preference for ${channel.toUpperCase()} updated.`);
      }
    });
  };

  const handleTogglePreferenceCategory = (category: keyof NotificationPreferences["categories"]) => {
    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category],
      },
    };
    setPreferences(updated);
    startTransition(async () => {
      const res = await updatePreferencesAction(customerId, { categories: updated.categories });
      if (res.success) {
        showFeedback(`Notification category preference saved.`);
      }
    });
  };

  const getPriorityBadgeVariant = (priority: NotificationPriority) => {
    switch (priority) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "warning";
      case "NORMAL":
        return "primary";
      case "LOW":
      default:
        return "secondary";
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "BOOKING":
        return <Film className="h-5 w-5 text-amber-400" />;
      case "PAYMENT":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "TICKET":
        return <QrCode className="h-5 w-5 text-sky-400" />;
      case "SHOW":
        return <Clock className="h-5 w-5 text-indigo-400" />;
      case "SECURITY":
        return <ShieldAlert className="h-5 w-5 text-rose-400" />;
      case "MARKETING":
        return <Tag className="h-5 w-5 text-purple-400" />;
      case "SYSTEM":
      default:
        return <Info className="h-5 w-5 text-[#94A3B8]" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Control Bar: Unread summary, Action Buttons, Search */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-[#FBBF24]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Inbox & Event Stream</h3>
              <Badge variant={unreadCount > 0 ? "warning" : "secondary"} size="sm">
                {unreadCount} Unread
              </Badge>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Decoupled multi-channel alerts published by Booking, Payment, Show & Ticket engines.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isPending}
            className="gap-2 border-[#2A3445] text-xs hover:border-[#FBBF24]/50"
          >
            <CheckCheck className="h-3.5 w-3.5 text-[#FBBF24]" />
            Mark All Read
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            className="gap-2 text-xs border border-[#2A3445]"
          >
            <Settings className="h-3.5 w-3.5 text-[#94A3B8]" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications by title, movie name, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070B12] border border-[#2A3445]">
            {[
              { id: "ALL", label: "All Active" },
              { id: "UNREAD", label: `Unread (${unreadCount})` },
              { id: "READ", label: "Read" },
              { id: "ARCHIVED", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] text-[11px] font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#070B12] border border-[#2A3445] text-[#94A3B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="ALL">All Categories</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment</option>
              <option value="TICKET">Ticket</option>
              <option value="SHOW">Show</option>
              <option value="MARKETING">Marketing</option>
              <option value="SECURITY">Security</option>
              <option value="SYSTEM">System</option>
            </select>

            <span className="text-[#64748B] text-[11px] font-mono ml-2">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#070B12] border border-[#2A3445] text-[#94A3B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card variant="subtle-glass" className="p-12 text-center border-dashed border-[#2A3445]">
            <div className="h-12 w-12 rounded-2xl bg-[#111827] border border-[#2A3445] mx-auto flex items-center justify-center text-[#64748B] mb-3">
              <Bell className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-white text-sm">No notifications found</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "No alerts match your current filter settings. Try clearing your filters."
                : "You're completely caught up! We will alert you when tickets are issued or showtimes change."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = notif.status === "UNREAD";
            return (
              <Card
                key={notif.id}
                variant="elevated"
                className={`p-5 transition-all border ${
                  isUnread
                    ? "bg-[#111827]/90 border-amber-500/30 hover:border-amber-500/50"
                    : "bg-[#070B12]/60 border-[#2A3445] hover:border-[#38455A]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Icon & Main Content */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnread
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-[#111827] border-[#2A3445]"
                      }`}
                    >
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
                        )}
                        <h4 className="font-bold text-white text-sm tracking-tight">{notif.title}</h4>
                        <Badge variant={getPriorityBadgeVariant(notif.priority)} size="sm">
                          {notif.priority}
                        </Badge>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                          {notif.sourceModule}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>

                      {/* Reference Link if present */}
                      {notif.referenceEntity && (
                        <div className="pt-1">
                          <Link
                            href={notif.referenceEntity.link || "/profile/tickets"}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24] hover:underline"
                          >
                            <span>View {notif.referenceEntity.type.toLowerCase()} details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}

                      {/* Multi-Channel Dispatch Badges Preview */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-[#64748B]">
                        <span className="font-mono">Channels:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
                          In-App (Delivered)
                        </span>
                        {notif.channelDispatches?.EMAIL && (
                          <span className="px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#2A3445] font-mono">
                            Email ({notif.channelDispatches.EMAIL === "OPTED_OUT" ? "Opted-out" : "Queued"})
                          </span>
                        )}
                        {notif.channelDispatches?.SMS && (
                          <span className="px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#2A3445] font-mono">
                            SMS ({notif.channelDispatches.SMS === "OPTED_OUT" ? "Opted-out" : "Queued"})
                          </span>
                        )}
                        {notif.channelDispatches?.PUSH && (
                          <span className="px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#2A3445] font-mono">
                            Push ({notif.channelDispatches.PUSH === "OPTED_OUT" ? "Opted-out" : "Queued"})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2A3445]">
                    <span className="text-[11px] text-[#64748B] font-mono block">
                      {formatTimestamp(notif.createdAt)}
                    </span>

                    <div className="flex items-center gap-1">
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkAsRead(notif.id)}
                          disabled={isPending}
                          className="h-7 px-2 text-xs text-[#FBBF24] hover:bg-amber-500/10 gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Mark Read
                        </Button>
                      )}

                      {notif.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleArchive(notif.id)}
                          disabled={isPending}
                          title="Archive"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-white hover:bg-[#111827] transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notif.id)}
                        disabled={isPending}
                        title="Delete"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Preferences Modal */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#0F172A] border border-[#2A3445] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#2A3445]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#FBBF24]" />
                  Notification Preferences
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Customize which communication sinks receive alerts and which event categories notify you.
                </p>
              </div>
              <button
                onClick={() => setIsPreferencesOpen(false)}
                className="text-[#64748B] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section 1: Channel Delivery Sinks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                1. Delivery Channels
              </h4>
              <div className="space-y-2">
                {[
                  {
                    key: "inApp" as const,
                    label: "In-App Notification Feed",
                    desc: "Live stream on your patron dashboard and mobile web portal",
                    icon: <Bell className="h-4 w-4 text-[#FBBF24]" />,
                    active: preferences.channels.inApp,
                  },
                  {
                    key: "email" as const,
                    label: "Email Receipts & Passes",
                    desc: "Automated booking summaries and tax invoice attachments",
                    icon: <Mail className="h-4 w-4 text-sky-400" />,
                    active: preferences.channels.email,
                  },
                  {
                    key: "sms" as const,
                    label: "SMS Instant Gate Passes",
                    desc: "Fast text messages with turnstile QR pass access links",
                    icon: <Smartphone className="h-4 w-4 text-emerald-400" />,
                    active: preferences.channels.sms,
                  },
                  {
                    key: "push" as const,
                    label: "Mobile Push Notifications",
                    desc: "Auditorium door-opening warnings 15 mins before showtime",
                    icon: <Bell className="h-4 w-4 text-indigo-400" />,
                    active: preferences.channels.push,
                  },
                  {
                    key: "whatsapp" as const,
                    label: "WhatsApp Express Passes",
                    desc: "Direct WhatsApp concierge with QR passes and directions",
                    icon: <MessageSquare className="h-4 w-4 text-teal-400" />,
                    active: preferences.channels.whatsapp,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePreferenceChannel(item.key)}
                    className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-between cursor-pointer hover:border-[#38455A] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#111827] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[11px] text-[#94A3B8]">{item.desc}</div>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full transition-colors p-0.5 ${
                        item.active ? "bg-[#FBBF24]" : "bg-[#1E293B]"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-[#070B12] transition-transform ${
                          item.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Event Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                2. Notification Categories
              </h4>
              <div className="space-y-2">
                {[
                  {
                    key: "bookingUpdates" as const,
                    label: "Booking Confirmations & Changes",
                    desc: "Seat reservations, lock renewals and cancellation receipts",
                    active: preferences.categories.bookingUpdates,
                  },
                  {
                    key: "paymentReceipts" as const,
                    label: "Payment Receipts & Invoices",
                    desc: "UPI, Card, and Netbanking verification confirmations",
                    active: preferences.categories.paymentReceipts,
                  },
                  {
                    key: "ticketPasses" as const,
                    label: "Digital Ticket Pass Issuance",
                    desc: "Dynamic HMAC QR codes issued upon payment confirmation",
                    active: preferences.categories.ticketPasses,
                  },
                  {
                    key: "showReminders" as const,
                    label: "Showtime & Gate Opening Alerts",
                    desc: "Audi door open notifications and parking advisories",
                    active: preferences.categories.showReminders,
                  },
                  {
                    key: "promotionalOffers" as const,
                    label: "Promotions & Early Bird Pre-Sales",
                    desc: "F&B combo discount vouchers and IMAX premiere invites",
                    active: preferences.categories.promotionalOffers,
                  },
                  {
                    key: "securityAlerts" as const,
                    label: "Security & Account Safeguards",
                    desc: "New device logins, password resets, and suspicious session flags",
                    active: preferences.categories.securityAlerts,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePreferenceCategory(item.key)}
                    className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-between cursor-pointer hover:border-[#38455A] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-[#94A3B8]">{item.desc}</div>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full transition-colors p-0.5 ${
                        item.active ? "bg-[#FBBF24]" : "bg-[#1E293B]"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-[#070B12] transition-transform ${
                          item.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3445]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreferencesOpen(false)}
                className="border-[#2A3445] text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
