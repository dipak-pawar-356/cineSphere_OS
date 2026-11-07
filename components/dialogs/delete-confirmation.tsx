"use client";

import React from "react";
import { Modal, ModalProps } from "./modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export interface DeleteConfirmationProps extends Omit<ModalProps, "children"> {
  itemName?: string;
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  title = "Permanently Delete Record",
  description = "This action is irreversible and will remove this item from the active manifest.",
  itemName,
  onDelete,
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="space-y-6 pt-2">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>
            {itemName ? (
              <>
                You are about to delete <strong className="text-white font-mono">{itemName}</strong>.
              </>
            ) : (
              "Are you sure you want to proceed with permanent deletion?"
            )}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3445]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete} isLoading={isLoading} className="font-bold">
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}

