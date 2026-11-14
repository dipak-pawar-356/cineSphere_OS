"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  RoleTemplateRecord,
  CreateTheatreRoleInput,
  InstantiateRoleFromTemplateInput,
} from "@/types/theatre-staff.types";
import { PLATFORM_PERMISSION_CATALOG } from "@/lib/repositories/theatre-staff.repository";
import { Sparkles, Layers, Shield, AlertCircle } from "lucide-react";

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  templates: RoleTemplateRecord[];
  onCreateCustomRole: (input: CreateTheatreRoleInput) => Promise<void>;
  onInstantiateTemplate: (input: InstantiateRoleFromTemplateInput) => Promise<void>;
}

export function CustomRoleModal({
  isOpen,
  onClose,
  theatreId,
  templates,
  onCreateCustomRole,
  onInstantiateTemplate,
}: CustomRoleModalProps) {
  const [source, setSource] = useState<"TEMPLATE" | "CUSTOM">("TEMPLATE");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || "");
  const [roleCode, setRoleCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hierarchyLevel, setHierarchyLevel] = useState(2);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group permission catalog by module
  const groupedPermissions = PLATFORM_PERMISSION_CATALOG.reduce<Record<string, typeof PLATFORM_PERMISSION_CATALOG>>(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    },
    {}
  );

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setName(tmpl.name);
      setDescription(tmpl.description);
      setHierarchyLevel(tmpl.hierarchyLevel);
      setSelectedPermissions([...tmpl.defaultPermissions]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (source === "TEMPLATE") {
        await onInstantiateTemplate({
          theatreId,
          templateId: selectedTemplateId,
          customName: name.trim() || undefined,
          customDescription: description.trim() || undefined,
          customHierarchyLevel: hierarchyLevel,
          overriddenPermissions: selectedPermissions.length > 0 ? selectedPermissions : undefined,
        });
      } else {
        await onCreateCustomRole({
          theatreId,
          roleCode: roleCode.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          hierarchyLevel,
          permissions: selectedPermissions,
        });
      }
      onClose();
      // Reset form
      setRoleCode("");
      setName("");
      setDescription("");
      setSelectedPermissions([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create theatre role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={source === "TEMPLATE" ? "Instantiate Role from Template" : "Create Custom Theatre Role"}
      description="Define distinct operational roles tailored to your cinema. All roles and assigned permissions remain isolated to your theatre tenant."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Source Toggle */}
        <div className="flex rounded-lg border border-[#2A3445] bg-[#0F172A] p-1">
          <button
            type="button"
            onClick={() => {
              setSource("TEMPLATE");
              handleTemplateChange(selectedTemplateId || templates[0]?.id || "");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
              source === "TEMPLATE"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#F59E0B]" />
            Use Platform Template
          </button>
          <button
            type="button"
            onClick={() => setSource("CUSTOM")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
              source === "CUSTOM"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Define Custom Unique Role
          </button>
        </div>

        {/* Template Selector (if Template Mode) */}
        {source === "TEMPLATE" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Select Standard Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category}) • Level {t.hierarchyLevel}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Code & Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {source === "CUSTOM" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Role Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                placeholder="e.g. VIP_LOUNGE_MGR"
                className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none uppercase"
              />
            </div>
          )}
          <div className={source === "CUSTOM" ? "sm:col-span-2" : "sm:col-span-2"}>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Role Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIP Lounge Experience Manager"
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Hierarchy Tier Level
            </label>
            <select
              value={hierarchyLevel}
              onChange={(e) => setHierarchyLevel(Number(e.target.value))}
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            >
              <option value={1}>Tier 1: Entry / Front-of-House</option>
              <option value={2}>Tier 2: Senior / Specialist</option>
              <option value={3}>Tier 3: Supervisor / Hall Lead</option>
              <option value={4}>Tier 4: Operations Manager</option>
              <option value={5}>Tier 5: Executive / General Manager</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Role Responsibility Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline daily duties, hall responsibilities, and authority scope..."
            className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        {/* Permissions Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Configurable Access Permissions ({selectedPermissions.length} Granted)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedPermissions(PLATFORM_PERMISSION_CATALOG.map((p) => p.key))}
                className="text-[11px] text-[#F59E0B] hover:underline"
              >
                Grant All
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => setSelectedPermissions([])}
                className="text-[11px] text-slate-400 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-56 space-y-3 overflow-y-auto rounded-lg border border-[#2A3445] bg-[#0F172A] p-3 text-xs">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <div key={moduleName} className="space-y-1.5">
                <span className="font-semibold text-slate-400">{moduleName}</span>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {perms.map((p) => {
                    const isChecked = selectedPermissions.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className={`flex items-start gap-2 rounded-md border p-2 transition-colors cursor-pointer ${
                          isChecked
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-[#2A3445]/60 bg-[#1E293B]/40 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(p.key)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-[#2A3445] bg-[#0F172A] text-emerald-500 focus:ring-0"
                        />
                        <div className="leading-tight">
                          <p className="font-medium text-white">{p.label}</p>
                          <p className="text-[10px] text-slate-500">{p.key}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 bg-[#F59E0B] font-medium text-slate-950 hover:bg-[#F59E0B]/90"
          >
            <Shield className="h-4 w-4" />
            {isSubmitting ? "Creating Role..." : source === "TEMPLATE" ? "Instantiate Role" : "Create Custom Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
