"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] shadow-[0_24px_60px_rgb(0,0,0,0.7)] p-6 sm:p-7 z-10 overflow-hidden space-y-4 animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161F2E] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children && <div className="text-xs text-[#CBD5E1] pt-1">{children}</div>}

        {footer && <div className="pt-4 border-t border-[#2A3445] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Operational Action",
  description = "Are you sure you wish to proceed? This change will be broadcast across all connected tenant registers.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isDestructive && <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />}
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
