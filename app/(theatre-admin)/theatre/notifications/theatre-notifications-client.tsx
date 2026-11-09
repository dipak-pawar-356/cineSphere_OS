"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  NotificationItem,
  NotificationPriority,
  NotificationStatus,
  SourceModule,
} from "@/types/notification.types";
import {
  archiveNotificationAction,
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
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
  Film,
  HardDrive,
  Info,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

interface TheatreNotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  theatreId: string;
}

export function TheatreNotificationsClient({
  initialNotifications,
  initialUnreadCount,
  theatreId,
}: TheatreNotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id, {
        userId: theatreId,
        role: "THEATRE_ADMIN",
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, status: "READ" as NotificationStatus, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        showToast("Operational alert acknowledged.");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction(theatreId, "THEATRE_ADMIN", theatreId);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.status === "UNREAD"
              ? { ...n, status: "READ" as NotificationStatus, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(0);
        showToast("All operational alerts acknowledged.");
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveNotificationAction(id, {
        userId: theatreId,
        role: "THEATRE_ADMIN",
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, status: "ARCHIVED" as NotificationStatus, archivedAt: new Date().toISOString() }
              : n
          )
        );
        if (notifications.find((n) => n.id === id)?.status === "UNREAD") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showToast("Alert archived to audit log.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNotificationAction(id, {
        userId: theatreId,
        role: "THEATRE_ADMIN",
      });
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notifications.find((n) => n.id === id)?.status === "UNREAD") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showToast("Alert removed from operational queue.");
      }
    });
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (notif.status === "DELETED") return false;

    if (activeTab === "UNREAD" && notif.status !== "UNREAD") return false;
    if (activeTab === "ARCHIVED" && notif.status !== "ARCHIVED") return false;
    if (activeTab !== "ARCHIVED" && notif.status === "ARCHIVED") return false;

    if (activeTab === "BOX_OFFICE") {
      const isBoxOffice =
        notif.category === "BOOKING" ||
        notif.category === "PAYMENT" ||
        notif.sourceModule === "BOOKING" ||
        notif.sourceModule === "PAYMENT";
      if (!isBoxOffice) return false;
    }

    if (activeTab === "HARDWARE") {
      const isTelemetry =
        notif.sourceModule === "THEATRE" ||
        notif.sourceModule === "SHOW" ||
        notif.sourceModule === "SYSTEM" ||
        notif.category === "SHOW" ||
        notif.category === "SECURITY";
      if (!isTelemetry) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notif.title.toLowerCase().includes(q);
      const matchMessage = notif.message.toLowerCase().includes(q);
      const matchSource = notif.sourceModule?.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage && !matchSource) return false;
    }

    return true;
  });

  const getPriorityIcon = (priority: NotificationPriority, sourceModule?: SourceModule) => {
    if (sourceModule === "THEATRE") {
      return <HardDrive className="h-5 w-5 text-indigo-400" />;
    }
    switch (priority) {
      case "CRITICAL":
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "NORMAL":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "LOW":
      default:
        return <Info className="h-5 w-5 text-[#38BDF8]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Action Header Banner */}
      <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-[#FBBF24]" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Theatre Operational Queue</h4>
            <p className="text-xs text-[#94A3B8]">
              Automated telemetry from Turnstiles, Laser Projectors, Box Office & Payment Handshakes.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isPending}
          className="gap-2 border-[#2A3445] text-xs hover:border-[#FBBF24]/50 shrink-0"
        >
          <CheckCheck className="h-4 w-4 text-[#FBBF24]" /> Mark All as Read ({unreadCount})
        </Button>
      </div>

      {/* Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: `All Alerts (${notifications.filter((n) => n.status !== "ARCHIVED" && n.status !== "DELETED").length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "BOX_OFFICE", label: "Box Office & Bookings" },
            { id: "HARDWARE", label: "Auditorium Telemetry" },
            { id: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FBBF24] text-[#070B12]"
                  : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card variant="subtle-glass" className="p-12 text-center border-dashed border-[#2A3445]">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-white text-sm">All Operational Systems Normal</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
              No pending alerts in this category. Live SNMP traps and box office webhooks will populate automatically.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = notif.status === "UNREAD";
            return (
              <Card
                key={notif.id}
                variant="elevated"
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors border ${
                  isUnread
                    ? "bg-[#161F2E] border-amber-500/40 hover:border-amber-500/60"
                    : "bg-[#111827]/70 border-[#2A3445] hover:border-[#38455A]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center shrink-0">
                    {getPriorityIcon(notif.priority, notif.sourceModule)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
                      )}
                      <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                      <Badge
                        variant={
                          isUnread
                            ? "danger"
                            : notif.priority === "HIGH" || notif.priority === "CRITICAL"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {notif.status.toLowerCase()}
                      </Badge>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {notif.sourceModule || "SYSTEM"}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>

                    {/* Channel Manifest telemetry */}
                    <div className="flex items-center gap-2 text-[10px] text-[#64748B] pt-1">
                      <span>Dispatch:</span>
                      <span className="text-emerald-400 font-mono">In-App (Live)</span>
                      {notif.channelDispatches?.SMS && (
                        <span className="font-mono">• SMS ({notif.channelDispatches.SMS.toLowerCase()})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2A3445]">
                  <span className="text-[10px] text-[#64748B] font-mono block">
                    {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="flex items-center gap-1 mt-1">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleMarkAsRead(notif.id)}
                        disabled={isPending}
                        className="text-xs text-[#FBBF24] hover:bg-amber-500/10 px-2 h-7"
                      >
                        Acknowledge
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
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
