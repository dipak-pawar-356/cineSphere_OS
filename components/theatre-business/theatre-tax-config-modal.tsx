"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, AlertCircle, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreTaxConfigurationRecord,
  UpdateTheatreTaxConfigurationInput,
  TaxSystemType,
  PricingTaxModel,
  TaxStatus,
} from "@/types/theatre-business.types";

interface TheatreTaxConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTheatreTaxConfigurationInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreTaxConfigurationRecord | null;
}

export function TheatreTaxConfigModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
}: TheatreTaxConfigModalProps) {
  const [taxSystemType, setTaxSystemType] = useState<TaxSystemType>("GST");
  const [taxJurisdictionCountry, setTaxJurisdictionCountry] = useState("IND");
  const [taxPercentage, setTaxPercentage] = useState("18.00");
  const [pricingTaxModel, setPricingTaxModel] = useState<PricingTaxModel>("TAX_INCLUSIVE");
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [exemptionReason, setExemptionReason] = useState("");
  const [regionalTaxCode, setRegionalTaxCode] = useState("MH-27");
  const [internationalTaxNumber, setInternationalTaxNumber] = useState("");
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("ACTIVE");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTaxSystemType(initialData.taxSystemType || "GST");
      setTaxJurisdictionCountry(initialData.taxJurisdictionCountry || "IND");
      setTaxPercentage(initialData.taxPercentage || "18.00");
      setPricingTaxModel(initialData.pricingTaxModel || "TAX_INCLUSIVE");
      setIsTaxExempt(initialData.isTaxExempt || false);
      setExemptionReason(initialData.exemptionReason || "");
      setRegionalTaxCode(initialData.regionalTaxCode || "MH-27");
      setInternationalTaxNumber(initialData.internationalTaxNumber || "");
      setTaxStatus(initialData.taxStatus || "ACTIVE");
      setNotes(initialData.notes || "");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedRate = parseFloat(taxPercentage);
    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      setError("Tax percentage must be a number between 0.00 and 100.00.");
      return;
    }

    try {
      setLoading(true);
      const payload: UpdateTheatreTaxConfigurationInput = {
        theatreId,
        taxSystemType,
        taxJurisdictionCountry: taxJurisdictionCountry.trim().toUpperCase(),
        taxPercentage: taxPercentage.trim(),
        pricingTaxModel,
        isTaxExempt,
        exemptionReason: isTaxExempt ? exemptionReason.trim() : null,
        regionalTaxCode: regionalTaxCode.trim() || null,
        internationalTaxNumber: internationalTaxNumber.trim() || null,
        taxStatus,
        notes: notes.trim() || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update tax configuration";
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
            <Scale className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-bold text-zinc-100">Country-Aware Tax Configuration</h2>
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
              <label className="text-xs font-medium text-zinc-400">Tax System Framework</label>
              <select
                value={taxSystemType}
                onChange={(e) => setTaxSystemType(e.target.value as TaxSystemType)}
                className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="GST">GST (India / Australia / Singapore / Canada)</option>
                <option value="VAT">VAT (UK / European Union / UAE)</option>
                <option value="SALES_TAX">Sales Tax (United States)</option>
                <option value="CUSTOM">Custom Regional Tax</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Jurisdiction Country (ISO-3)</label>
              <Input
                value={taxJurisdictionCountry}
                onChange={(e) => setTaxJurisdictionCountry(e.target.value.toUpperCase())}
                placeholder="e.g. IND, USA, GBR"
                maxLength={3}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Default Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                placeholder="18.00"
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Ticket Pricing Tax Model</label>
              <select
                value={pricingTaxModel}
                onChange={(e) => setPricingTaxModel(e.target.value as PricingTaxModel)}
                className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="TAX_INCLUSIVE">Tax Inclusive (Customer pays displayed amount)</option>
                <option value="TAX_EXCLUSIVE">Tax Exclusive (Tax added at checkout)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Regional / State Tax Code</label>
              <Input
                value={regionalTaxCode}
                onChange={(e) => setRegionalTaxCode(e.target.value)}
                placeholder="e.g. MH-27 (Maharashtra State Code)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">International / Cross-Border Tax ID</label>
              <Input
                value={internationalTaxNumber}
                onChange={(e) => setInternationalTaxNumber(e.target.value)}
                placeholder="Optional foreign tax identification number"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTaxExempt"
                checked={isTaxExempt}
                onChange={(e) => setIsTaxExempt(e.target.checked)}
                className="h-4 w-4 rounded bg-zinc-800 border-zinc-700 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="isTaxExempt" className="text-sm font-medium text-zinc-200 cursor-pointer">
                Exempt Theatre from Standard Exhibition Tax
              </label>
            </div>

            {isTaxExempt && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-amber-400">Legal Exemption Basis / Reason</label>
                <Input
                  value={exemptionReason}
                  onChange={(e) => setExemptionReason(e.target.value)}
                  placeholder="e.g. Non-profit cultural festival exemption under Section 12AA"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Tax Compliance Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Input tax credit ledger reference, municipal tax surcharges, entertainment cess..."
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-500 text-white">
              {loading ? "Updating Tax Config..." : "Save Tax Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
