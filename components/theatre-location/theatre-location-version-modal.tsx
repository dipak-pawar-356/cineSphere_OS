"use client";

import React, { useState, useEffect } from "react";
import {
  TheatreLocationRecord,
  TheatreLocationVersionRecord,
} from "@/types/theatre-location.types";
import { rollbackTheatreLocationVersionAction } from "@/actions/theatre-location-actions";
import { Button } from "@/components/ui/button";
import {
  X,
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  Shield,
  AlertTriangle,
} from "lucide-react";

export interface TheatreLocationVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: TheatreLocationRecord;
  versions: TheatreLocationVersionRecord[];
  onRolledBack: (updated: TheatreLocationRecord) => void;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  actorUserId: string;
}

export function TheatreLocationVersionModal({
  isOpen,
  onClose,
  location,
  versions,
  onRolledBack,
  actorRole,
  actorUserId,
}: TheatreLocationVersionModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<TheatreLocationVersionRecord | null>(
    versions[0] || null
  );
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);

  useEffect(() => {
    if (versions.length > 0) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  if (!isOpen) return null;

  const handleRollback = async (targetVersion: number) => {
    if (targetVersion === location.version) return;
    const confirmed = window.confirm(
      `Are you sure you want to rollback to Version v${targetVersion}? This will create a new forward version restoring those address and coordinates snapshots.`
    );
    if (!confirmed) return;

    setIsRollingBack(true);
    setRollbackError(null);

    try {
      const res = await rollbackTheatreLocationVersionAction(
        {
          locationId: location.id,
          theatreId: location.theatreId,
          versionNumber: targetVersion,
          reason: `Manual rollback to v${targetVersion} via Location Console`,
        },
        {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? location.theatreId : undefined,
        }
      );

      if (res.success && res.data) {
        onRolledBack(res.data);
        onClose();
      } else {
        setRollbackError(res.error?.message || "Failed to rollback version.");
      }
    } catch (err: unknown) {
      setRollbackError(err instanceof Error ? err.message : "Rollback failed.");
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 id="version-modal-title" className="text-lg font-bold text-white">
                Location Version Audit History
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Current live version: <span className="font-mono text-[#FBBF24]">v{location.version}</span> • {location.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[#1E293B] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {rollbackError && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{rollbackError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Version List */}
            <div className="space-y-2 md:border-r md:border-[#1E293B] md:pr-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] pb-1">
                Version Timeline ({versions.length})
              </h3>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {versions.map((ver) => {
                  const isCurrent = ver.versionNumber === location.version;
                  const isSelected = selectedVersion?.id === ver.id;
                  return (
                    <button
                      key={ver.id}
                      onClick={() => setSelectedVersion(ver)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 text-white"
                          : "bg-[#1E293B]/60 border-[#334155]/60 hover:bg-[#1E293B] text-[#94A3B8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white">
                          v{ver.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate mt-1">
                        {ver.changeSummary || "Location update"}
                      </div>
                      <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-1 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(ver.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Version Detail */}
            <div className="md:col-span-2 space-y-4">
              {selectedVersion ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Snapshot v{selectedVersion.versionNumber}
                        {selectedVersion.versionNumber === location.version && (
                          <span className="text-xs text-emerald-400 font-normal">(Active Live Version)</span>
                        )}
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Saved by {selectedVersion.updatedByRole} on{" "}
                        {new Date(selectedVersion.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    {selectedVersion.versionNumber !== location.version && (
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isRollingBack}
                        onClick={() => handleRollback(selectedVersion.versionNumber)}
                        className="gap-1.5 border-amber-500/40 text-[#FBBF24] hover:bg-amber-500/10 text-xs font-semibold"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {isRollingBack ? "Rolling back..." : `Rollback to v${selectedVersion.versionNumber}`}
                      </Button>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090D16] border border-[#1E293B] space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Changed Fields
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVersion.updatedFields.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-lg bg-[#1E293B] text-[11px] font-mono text-[#CBD5E1] border border-[#334155]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090D16] border border-[#1E293B] space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Address Snapshot
                    </h5>
                    <pre className="text-[11px] font-mono text-[#94A3B8] overflow-x-auto whitespace-pre-wrap max-h-48 p-2 rounded-xl bg-black/40">
                      {JSON.stringify(selectedVersion.nextValues, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-xs text-[#64748B]">
                  Select a version on the left to inspect snapshot details.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E293B] flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#334155] text-xs font-semibold"
          >
            Close History
          </Button>
        </div>
      </div>
    </div>
  );
}
