"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/utils";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Enterprise Toast Notification Component
 * Self-dismissing floating alert notification with dark theme styling.
 */
export function Toast({
  type = "info",
  title,
  message,
  duration = 5000,
  onDismiss,
  className,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      border: "border-emerald-500/40",
      bg: "bg-[#111827]",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    },
    warning: {
      border: "border-amber-500/40",
      bg: "bg-[#111827]",
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    },
    error: {
      border: "border-rose-500/40",
      bg: "bg-[#111827]",
      icon: <AlertCircle className="h-4 w-4 text-rose-400" />,
    },
    info: {
      border: "border-sky-500/40",
      bg: "bg-[#111827]",
      icon: <Info className="h-4 w-4 text-sky-400" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border shadow-2xl max-w-sm w-full transition-all duration-200 animate-in fade-in slide-in-from-top-2",
        typeConfig.border,
        typeConfig.bg,
        className
      )}
    >
      <div className="shrink-0 mt-0.5">{typeConfig.icon}</div>
      <div className="flex-1 space-y-0.5 text-xs">
        <h4 className="font-bold text-white">{title}</h4>
        {message && <p className="text-[#94A3B8] leading-relaxed">{message}</p>}
      </div>
      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
        className="text-[#94A3B8] hover:text-white p-0.5 rounded-lg"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

