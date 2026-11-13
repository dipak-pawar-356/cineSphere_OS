"use client";

import React, { useState, useEffect } from "react";
import { X, Receipt, AlertCircle, FileCheck, FileCode, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreInvoiceConfigurationRecord,
  UpdateTheatreInvoiceConfigurationInput,
} from "@/types/theatre-business.types";

interface TheatreInvoiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTheatreInvoiceConfigurationInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreInvoiceConfigurationRecord | null;
}

export function TheatreInvoiceConfigModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
}: TheatreInvoiceConfigModalProps) {
  const [invoicePrefix, setInvoicePrefix] = useState("CSP-");
  const [invoiceSequenceNext, setInvoiceSequenceNext] = useState(10001);
  const [invoiceHeader, setInvoiceHeader] = useState("Tax Invoice / Entertainment Receipt");
  const [invoiceFooter, setInvoiceFooter] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceLogoUrl, setInvoiceLogoUrl] = useState("");
  const [enableEInvoice, setEnableEInvoice] = useState(false);
  const [enablePdfInvoice, setEnablePdfInvoice] = useState(true);
  const [enableCreditNotes, setEnableCreditNotes] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setInvoicePrefix(initialData.invoicePrefix || "CSP-");
      setInvoiceSequenceNext(initialData.invoiceSequenceNext || 10001);
      setInvoiceHeader(initialData.invoiceHeader || "Tax Invoice / Entertainment Receipt");
      setInvoiceFooter(initialData.invoiceFooter || "");
      setInvoiceNotes(initialData.invoiceNotes || "");
      setInvoiceLogoUrl(initialData.invoiceLogoUrl || "");
      setEnableEInvoice(initialData.enableEInvoice);
      setEnablePdfInvoice(initialData.enablePdfInvoice);
      setEnableCreditNotes(initialData.enableCreditNotes);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!invoicePrefix.trim()) {
      setError("Invoice prefix is required.");
      return;
    }

    try {
      setLoading(true);
      const payload: UpdateTheatreInvoiceConfigurationInput = {
        theatreId,
        invoicePrefix: invoicePrefix.trim().toUpperCase(),
        invoiceSequenceNext: Number(invoiceSequenceNext),
        invoiceHeader: invoiceHeader.trim(),
        invoiceFooter: invoiceFooter.trim() || null,
        invoiceNotes: invoiceNotes.trim() || null,
        invoiceLogoUrl: invoiceLogoUrl.trim() || null,
        enableEInvoice,
        enablePdfInvoice,
        enableCreditNotes,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update invoice configuration";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-100">Invoice & Billing Governance</h2>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Invoice Number Prefix <span className="text-rose-400">*</span>
              </label>
              <Input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                placeholder="e.g. CSP-PUN-"
                maxLength={10}
                className="font-mono uppercase"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Sample preview: <span className="text-indigo-400 font-mono">{invoicePrefix}{invoiceSequenceNext}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Next Sequence Number <span className="text-rose-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={invoiceSequenceNext}
                onChange={(e) => setInvoiceSequenceNext(Number(e.target.value))}
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Invoice Header Title</label>
              <Input
                value={invoiceHeader}
                onChange={(e) => setInvoiceHeader(e.target.value)}
                placeholder="e.g. Tax Invoice / Entertainment Receipt"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Invoice Legal Footer</label>
              <textarea
                value={invoiceFooter}
                onChange={(e) => setInvoiceFooter(e.target.value)}
                rows={2}
                placeholder="Thank you for choosing CineSphere. Computer-generated invoice under Rule 54 of CGST Rules..."
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Additional Invoice Notes / Jurisdiction</label>
              <Input
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="e.g. Subject to Pune municipal jurisdiction. GSTIN: 27AABCU9603R1ZM."
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Invoice Brand Logo URL</label>
              <Input
                value={invoiceLogoUrl}
                onChange={(e) => setInvoiceLogoUrl(e.target.value)}
                placeholder="e.g. /brand/cinesphere-invoice-logo.svg or https://cdn.example.com/logo.png"
              />
            </div>
          </div>

          {/* Billing Feature Flags */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Document Delivery & Invoicing Features
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={enablePdfInvoice}
                  onChange={(e) => setEnablePdfInvoice(e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-zinc-200">Generate PDF Invoices</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={enableEInvoice}
                  onChange={(e) => setEnableEInvoice(e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-zinc-200">E-Invoice Schema (IRN)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={enableCreditNotes}
                  onChange={(e) => setEnableCreditNotes(e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-zinc-200">Issue Credit Notes</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {loading ? "Updating Invoicing..." : "Save Invoice Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
