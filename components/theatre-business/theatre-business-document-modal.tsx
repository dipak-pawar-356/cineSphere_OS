"use client";

import React, { useState } from "react";
import { X, FileText, AlertCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AddTheatreBusinessDocumentInput,
  BusinessDocumentType,
} from "@/types/theatre-business.types";

interface TheatreBusinessDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddTheatreBusinessDocumentInput) => Promise<void>;
  theatreId: string;
}

export function TheatreBusinessDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
}: TheatreBusinessDocumentModalProps) {
  const [documentType, setDocumentType] = useState<BusinessDocumentType>("CIN_INCORPORATION");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!documentTitle.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!fileUrl.trim()) {
      setError("File URL or relative path is required.");
      return;
    }

    try {
      setLoading(true);
      const payload: AddTheatreBusinessDocumentInput = {
        theatreId,
        documentType,
        documentTitle: documentTitle.trim(),
        documentNumber: documentNumber.trim() || null,
        fileUrl: fileUrl.trim(),
        expiryDate: expiryDate.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        mimeType: "application/pdf",
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to attach document";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Attach Compliance Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as BusinessDocumentType)}
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CIN_INCORPORATION">Certificate of Incorporation (CIN)</option>
              <option value="GST_CERTIFICATE">GST Registration Certificate (Form REG-06)</option>
              <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
              <option value="FIRE_SAFETY_NOC">Fire Safety & Rescue NOC</option>
              <option value="MUNICIPAL_TRADE_LICENSE">Municipal Trade License</option>
              <option value="ENTERTAINMENT_TAX_PERMIT">Entertainment Tax Permit</option>
              <option value="AUTHORIZATION_LETTER">Authorized Signatory Letter</option>
              <option value="BOARD_RESOLUTION">Board Resolution</option>
              <option value="REGISTRATION_CERTIFICATE">General Registration Certificate</option>
              <option value="OTHER">Other Compliance Document</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Document Title <span className="text-rose-400">*</span>
            </label>
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="e.g. MCA Certificate of Incorporation"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Document / License Reference Number</label>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. U92100MH2021PTC358912 or 27AABCU9603R1ZM"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Document Storage File URL or Root Path <span className="text-rose-400">*</span>
            </label>
            <Input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="e.g. /docs/registrations/cinesphere-mca-incorporation.pdf"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Expiry Date (if applicable)</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Display Priority Order</label>
              <Input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {loading ? "Attaching..." : "Attach Document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
