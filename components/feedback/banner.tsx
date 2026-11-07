import React from "react";
import { Info, AlertTriangle, AlertCircle, CheckCircle, X } from "lucide-react";
import { cn } from "@/utils";

export interface BannerProps {
  type?: "info" | "warning" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function Banner({
  type = "info",
  title,
  children,
  onDismiss,
  action,
  className,
}: BannerProps) {
  const styles = {
    info: "bg-[#2563EB]/15 border-[#2563EB]/30 text-[#93C5FD]",
    warning: "bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#FCD34D]",
    danger: "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#FCA5A5]",
    success: "bg-[#22C55E]/15 border-[#22C55E]/30 text-[#86EFAC]",
  };

  const icons = {
    info: <Info className="h-4 w-4 shrink-0 text-[#38BDF8]" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-[#F59E0B]" />,
    danger: <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />,
    success: <CheckCircle className="h-4 w-4 shrink-0 text-[#22C55E]" />,
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
        styles[type],
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div>
          {title && <div className="font-bold text-white text-xs mb-0.5">{title}</div>}
          <div className="leading-relaxed opacity-90">{children}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
        {action}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

