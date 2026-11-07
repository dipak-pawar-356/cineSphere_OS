import React from "react";
import { FolderX, Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FolderX,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#2A3445] bg-[#111827]/40 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 space-y-5 animate-in fade-in-50 duration-200",
        className
      )}
    >
      {/* Illustration Placeholder */}
      <div className="relative">
        <div className="h-20 w-20 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shadow-[0_0_30px_rgba(251,191,36,0.1)]">
          <Icon className="h-10 w-10 stroke-[1.5]" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#94A3B8]">
          <span className="h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
        </div>
      </div>

      {/* Text Copy */}
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-[#F9FAFB] tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
          {actionLabel && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              className="gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

