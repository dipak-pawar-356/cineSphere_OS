"use client";

import React, { useState, useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-52 rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <div className="h-px bg-[#2A3445] my-1" />}
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                  item.danger
                    ? "text-[#EF4444] hover:bg-[#EF4444]/15"
                    : "text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#161F2E]",
                  item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export interface ProfileMenuProps {
  user?: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

export function ProfileMenu({
  user = {
    name: "Alex Vance",
    email: "alex.vance@cinesphere.io",
    role: "Tenant Admin",
  },
  onSignOut,
  className,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#161F2E] transition-colors focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-bold text-xs">
          {user.name.charAt(0)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-[#2A3445] space-y-0.5">
            <div className="font-bold text-white text-xs">{user.name}</div>
            <div className="text-[11px] text-[#94A3B8] truncate">{user.email}</div>
            {user.role && (
              <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161F2E] text-[#FBBF24] border border-[#2A3445]">
                {user.role}
              </span>
            )}
          </div>

          <div className="py-1 space-y-0.5 text-xs text-[#CBD5E1]">
            <a
              href="/dashboard"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-[#161F2E] hover:text-white transition-colors"
            >
              Control Panel
            </a>
            <a
              href="/customer/bookings"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-[#161F2E] hover:text-white transition-colors"
            >
              My Bookings
            </a>
            <a
              href="/design-system"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-[#161F2E] hover:text-white transition-colors"
            >
              Design System Showcase
            </a>
          </div>

          <div className="pt-1 border-t border-[#2A3445]">
            <button
              type="button"
              onClick={() => {
                onSignOut?.();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export interface NotificationMenuProps {
  notifications?: { id: string; title: string; time: string; unread?: boolean }[];
  className?: string;
}

export function NotificationMenu({
  notifications = [
    { id: "1", title: "IMAX Screen 2 calibrated", time: "10m ago", unread: true },
    { id: "2", title: "New tenant onboarded: PVR Luxe", time: "1h ago", unread: false },
    { id: "3", title: "System firmware v2.4 live", time: "3h ago", unread: false },
  ],
  className,
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#FBBF24]/50 transition-colors"
      >
        <span className="text-sm">🔔</span>
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FBBF24] ring-2 ring-[#070B12]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-[#2A3445] flex items-center justify-between text-xs">
            <span className="font-bold text-white">Notifications</span>
            <span className="text-[10px] text-[#FBBF24]">Mark all read</span>
          </div>

          <div className="py-1 divide-y divide-[#2A3445]/40 max-h-64 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-2.5 text-xs hover:bg-[#161F2E] transition-colors rounded-lg",
                  item.unread && "bg-[#161F2E]/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{item.title}</span>
                  {item.unread && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                  )}
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
