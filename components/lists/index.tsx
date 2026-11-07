import React from "react";
import { Film, Building2, Ticket, User, Bell, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface ActivityTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: "info" | "success" | "warning";
}

export function ActivityTimeline({
  items,
  className,
}: {
  items: ActivityTimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 relative pl-4 border-l border-[#2A3445]", className)}>
      {items.map((item) => (
        <div key={item.id} className="relative group text-xs">
          {/* Dot */}
          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#FBBF24] ring-4 ring-[#070B12]" />

          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{item.title}</span>
              <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.timestamp}
              </span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isUnread?: boolean;
}

export function NotificationList({
  items,
  className,
}: {
  items: NotificationItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-[#2A3445]", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "p-3.5 flex items-start gap-3 hover:bg-[#111827]/60 transition-colors text-xs",
            item.isUnread && "bg-[#111827]/40"
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0 mt-0.5">
            <Bell className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{item.title}</span>
              <span className="text-[10px] text-[#94A3B8]">{item.timestamp}</span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed text-[11px]">{item.message}</p>
          </div>

          {item.isUnread && (
            <span className="h-2 w-2 rounded-full bg-[#FBBF24] shrink-0 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
}

export function UserList({
  items,
  className,
}: {
  items: UserListItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-[#2A3445]", className)}>
      {items.map((user) => (
        <div
          key={user.id}
          className="p-3.5 flex items-center justify-between hover:bg-[#111827]/60 transition-colors text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white">{user.name}</div>
              <div className="text-[11px] text-[#94A3B8]">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#CBD5E1] font-mono">{user.role}</span>
            <Badge
              variant={user.status === "ACTIVE" ? "success" : "warning"}
              size="sm"
            >
              {user.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

