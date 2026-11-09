"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  NotificationAuditLog,
  NotificationItem,
  NotificationPriority,
  NotificationStatus,
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
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  History,
  Info,
  Search,
  ShieldAlert,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

interface SuperAdminNotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  initialAuditLogs: NotificationAuditLog[];
}

export function SuperAdminNotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialAuditLogs,
}: SuperAdminNotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [auditLogs, setAuditLogs] = useState<NotificationAuditLog[]>(initialAuditLogs);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id, {
        userId: "super-admin-root",
        role: "SUPER_ADMIN",
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
        showToast("System alert acknowledged.");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction("super-admin-root", "SUPER_ADMIN");
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.status === "UNREAD"
              ? { ...n, status: "READ" as NotificationStatus, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(0);
        showToast("All platform notifications marked as read.");
      }
    });
  };

  const handleClearResolved = () => {
    startTransition(async () => {
      const resolved = notifications.filter((n) => n.status === "READ");
      for (const item of resolved) {
        await archiveNotificationAction(item.id, {
          userId: "super-admin-root",
          role: "SUPER_ADMIN",
        });
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === "READ"
            ? { ...n, status: "ARCHIVED" as NotificationStatus, archivedAt: new Date().toISOString() }
            : n
        )
      );
      showToast(`Archived ${resolved.length} resolved alerts.`);
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveNotificationAction(id, {
        userId: "super-admin-root",
        role: "SUPER_ADMIN",
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
        showToast("Notification moved to archive.");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNotificationAction(id, {
        userId: "super-admin-root",
        role: "SUPER_ADMIN",
      });
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notifications.find((n) => n.id === id)?.status === "UNREAD") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showToast("Notification deleted.");
      }
    });
  };

  // Filter list
  const filteredNotifications = notifications.filter((notif) => {
    if (notif.status === "DELETED") return false;

    if (activeTab === "UNREAD" && notif.status !== "UNREAD") return false;
    if (activeTab === "READ" && notif.status !== "READ") return false;
    if (activeTab === "ARCHIVED" && notif.status !== "ARCHIVED") return false;
    if (activeTab !== "ARCHIVED" && notif.status === "ARCHIVED") return false;

    if (activeTab === "CRITICAL" && notif.priority !== "CRITICAL") return false;
    if (activeTab === "SECURITY" && notif.category !== "SECURITY") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notif.title.toLowerCase().includes(q);
      const matchMessage = notif.message.toLowerCase().includes(q);
      const matchModule = notif.sourceModule?.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage && !matchModule) return false;
    }

    return true;
  });

  const getPriorityIcon = (priority: NotificationPriority, category?: string) => {
    if (category === "SECURITY" || priority === "CRITICAL") {
      return (
        <div className="h-9 w-9 rounded-xl bg-rose-400/10 border border-rose-400/30 flex items-center justify-center text-rose-400">
          <ShieldAlert className="h-5 w-5" />
        </div>
      );
    }
    if (priority === "HIGH") {
      return (
        <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
      );
    }
    if (priority === "NORMAL") {
      return (
        <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="h-9 w-9 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
        <Info className="h-5 w-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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

      {/* Control Actions Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "ALL", label: `All (${notifications.filter((n) => n.status !== "ARCHIVED" && n.status !== "DELETED").length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "READ", label: "Read" },
            { id: "CRITICAL", label: "Critical" },
            { id: "SECURITY", label: "Security" },
            { id: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isPending}
            className="gap-2 border-[#2A3445] text-xs"
          >
            <Check className="h-3.5 w-3.5" /> Mark All Read
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearResolved}
            disabled={notifications.filter((n) => n.status === "READ").length === 0 || isPending}
            className="gap-2 border-[#2A3445] text-rose-400 hover:bg-rose-950/20 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Resolved
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAuditDrawer(!showAuditDrawer)}
            className="gap-2 border border-[#2A3445] text-xs"
          >
            <History className="h-3.5 w-3.5 text-[#FBBF24]" />
            Audit Trail ({auditLogs.length})
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter platform alerts by keyword, module, or title..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
        />
      </div>

      {/* Audit Drawer (Optional view for Super Admin) */}
      {showAuditDrawer && (
        <Card variant="elevated" className="p-4 bg-[#0F172A] border border-[#2A3445] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FBBF24]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Platform Notification Dispatch Audit Stream
              </h4>
            </div>
            <button
              onClick={() => setShowAuditDrawer(false)}
              className="text-[#64748B] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-[#070B12] border border-[#1E293B] text-[11px] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#FBBF24] font-semibold">{log.action}</span>
                  <span className="text-[#64748B]">by</span>
                  <span className="text-[#94A3B8] font-mono">{log.actor.role}</span>
                </div>
                <span className="text-[#64748B] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card variant="subtle-glass" className="p-12 text-center border-dashed border-[#2A3445]">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-white text-sm">Platform Health Optimal</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
              No active alerts matching your current criteria. All multiplex telemetry and microservice endpoints are functioning nominal.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = notif.status === "UNREAD";
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-colors flex items-start gap-4 ${
                  isUnread
                    ? "bg-[#161F2E] border-[#FBBF24]/40 shadow-lg shadow-black/20"
                    : "bg-[#111827] border-[#2A3445]"
                }`}
              >
                {/* Category Icon */}
                <div className="shrink-0 mt-0.5">
                  {getPriorityIcon(notif.priority, notif.category)}
                </div>

                {/* Notification Body */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                      {isUnread && (
                        <Badge variant="warning" size="sm">
                          New
                        </Badge>
                      )}
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {notif.sourceModule || "SYSTEM"}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-mono text-[#64748B] shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Reference Link if available */}
                  {notif.referenceEntity?.link && (
                    <div className="pt-1">
                      <Link
                        href={notif.referenceEntity.link}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#FBBF24] hover:underline"
                      >
                        <span>View reference entity</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#1E293B]/60 mt-2">
                    <div className="text-[10px] text-[#64748B] font-mono">
                      Priority: <span className="text-[#94A3B8]">{notif.priority}</span> • Category:{" "}
                      <span className="text-[#94A3B8]">{notif.category}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkAsRead(notif.id)}
                          disabled={isPending}
                          className="h-6 px-2 text-xs text-[#FBBF24] hover:bg-amber-500/10"
                        >
                          Acknowledge
                        </Button>
                      )}

                      {notif.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleArchive(notif.id)}
                          disabled={isPending}
                          title="Archive"
                          className="h-6 w-6 rounded flex items-center justify-center text-[#64748B] hover:text-white"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notif.id)}
                        disabled={isPending}
                        title="Delete"
                        className="h-6 w-6 rounded flex items-center justify-center text-[#64748B] hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
