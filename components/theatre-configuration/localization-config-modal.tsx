"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2 } from "lucide-react";
import type {
  LocalizationConfigurationRecord,
  UpdateLocalizationConfigInput,
  ConfigTimeFormat,
  ConfigNumberFormat,
  ConfigMeasurementUnits,
} from "@/types/theatre-configuration.types";

interface LocalizationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: LocalizationConfigurationRecord | null;
  onSave: (data: UpdateLocalizationConfigInput) => Promise<void>;
}

export function LocalizationConfigModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: LocalizationConfigModalProps) {
  const [currency, setCurrency] = useState(initialData?.currency || "INR");
  const [timezone, setTimezone] = useState(initialData?.timezone || "Asia/Kolkata");
  const [primaryLanguage, setPrimaryLanguage] = useState(initialData?.primaryLanguage || "en");
  const [supportedLanguages, setSupportedLanguages] = useState<string>(
    initialData?.supportedLanguages ? initialData.supportedLanguages.join(", ") : "en, hi, mr"
  );
  const [dateFormat, setDateFormat] = useState(initialData?.dateFormat || "YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<ConfigTimeFormat>(initialData?.timeFormat || "12H");
  const [numberFormat, setNumberFormat] = useState<ConfigNumberFormat>(initialData?.numberFormat || "INDIAN");
  const [measurementUnits, setMeasurementUnits] = useState<ConfigMeasurementUnits>(
    initialData?.measurementUnits || "METRIC"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const langs = supportedLanguages
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await onSave({
        theatreId,
        currency: currency.toUpperCase().trim(),
        timezone: timezone.trim(),
        primaryLanguage: primaryLanguage.trim().toLowerCase(),
        supportedLanguages: langs.length > 0 ? langs : ["en"],
        dateFormat: dateFormat.trim(),
        timeFormat,
        numberFormat,
        measurementUnits,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update localization configuration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Localization & Regional Formatting"
      description="Configure regional currency, calendar timezones, language matrix, and number formatting."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Currency (ISO 3-Letter)</label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
              placeholder="INR"
              className="bg-[#070B12] border-[#1E293B] text-white font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Timezone (IANA)</label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata"
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Primary Language (ISO 639)</label>
            <Input
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value)}
              maxLength={5}
              placeholder="en"
              className="bg-[#070B12] border-[#1E293B] text-white lowercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Supported Languages (Comma separated)</label>
            <Input
              value={supportedLanguages}
              onChange={(e) => setSupportedLanguages(e.target.value)}
              placeholder="en, hi, mr"
              className="bg-[#070B12] border-[#1E293B] text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Date Format</label>
            <Input
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Time Format</label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as ConfigTimeFormat)}
              className="w-full h-10 px-3 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="12H">12-Hour (11:30 PM)</option>
              <option value="24H">24-Hour (23:30)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Number Format</label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value as ConfigNumberFormat)}
              className="w-full h-10 px-3 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="INDIAN">Indian (1,00,000 Lakhs/Crores)</option>
              <option value="INTERNATIONAL">International (100,000 Millions)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Measurement Units</label>
            <select
              value={measurementUnits}
              onChange={(e) => setMeasurementUnits(e.target.value as ConfigMeasurementUnits)}
              className="w-full h-10 px-3 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="METRIC">Metric (Meters, Liters)</option>
              <option value="IMPERIAL">Imperial (Feet, Oz)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#1E293B]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-[#2A3445] text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Localization"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
