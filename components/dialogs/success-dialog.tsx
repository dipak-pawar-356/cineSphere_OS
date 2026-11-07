"use client";

import React from "react";
import { Modal, ModalProps } from "./modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export interface SuccessDialogProps extends Omit<ModalProps, "children"> {
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  message?: string;
}

export function SuccessDialog({
  isOpen,
  onClose,
  title = "Success Completed",
  description = "The requested transaction or configuration was successfully processed.",
  message,
  primaryActionLabel = "Acknowledge",
  onPrimaryAction,
}: SuccessDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center space-y-4 pt-2">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">{description}</p>
          {message && <p className="text-xs font-mono text-[#FBBF24] pt-1">{message}</p>}
        </div>

        <div className="pt-4 border-t border-[#2A3445]">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onPrimaryAction || onClose}
            className="font-bold"
          >
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

