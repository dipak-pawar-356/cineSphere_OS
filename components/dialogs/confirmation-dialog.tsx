"use client";

import React from "react";
import { Modal, ModalProps } from "./modal";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export interface ConfirmationDialogProps extends Omit<ModalProps, "children"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  content?: React.ReactNode;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  title = "Confirm Operation",
  description = "Are you sure you want to proceed with this platform action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  content,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="space-y-6 pt-2">
        {content && <div className="text-xs text-[#CBD5E1]">{content}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3445]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm} isLoading={isLoading} className="font-bold">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

