"use client";

import React from "react";
import Link from "next/link";
import { ManagedHall } from "@/store/theatre-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";
import {
  Eye,
  Edit2,
  Copy,
  Archive,
  Power,
  Tv,
  Volume2,
  Sparkles,
  Calendar,
  Layers,
  Trash2,
} from "lucide-react";

interface HallTableViewProps {
  halls: ManagedHall[];
  onEdit: (hall: ManagedHall) => void;
  onDuplicate: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HallTableView({
  halls,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onArchive,
  onDelete,
}: HallTableViewProps) {
  if (halls.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#94A3B8] bg-[#0F172A] rounded-2xl border border-[#1E293B]">
        No cinema auditoriums matched the filter criteria.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#0B0F19]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#1E293B] bg-[#0F172A] text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            <th className="py-3 px-4">Screen & Code</th>
            <th className="py-3 px-4">Auditorium Name</th>
            <th className="py-3 px-4 text-center">Capacity</th>
            <th className="py-3 px-4">Sections</th>
            <th className="py-3 px-4">Projection</th>
            <th className="py-3 px-4">Sound Array</th>
            <th className="py-3 px-4 text-center">Shows</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]/70 font-normal text-[#CBD5E1]">
          {halls.map((hall) => {
            const sections = hall.sections || [];
            const isOnline = hall.status === "Active" || hall.status === "Show Running";

            return (
              <tr
                key={hall.id}
                className="hover:bg-[#161F2E]/60 transition-colors group"
              >
                {/* Screen & Code */}
                <td className="py-3 px-4 font-mono">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Screen 0{hall.hallNumber}</span>
                    <span className="text-[10px] text-[#FBBF24] font-semibold">{hall.hallCode}</span>
                  </div>
                </td>

                {/* Auditorium Name */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <Link
                      href={`/theatre/halls/${hall.id}`}
                      className="font-bold text-white hover:text-[#FBBF24] transition-colors"
                    >
                      {hall.name}
                    </Link>
                    <span className="text-[10px] text-[#64748B]">
                      {hall.screenType} • {hall.floorNumber || "Floor 2"}
                    </span>
                  </div>
                </td>

                {/* Capacity */}
                <td className="py-3 px-4 text-center">
                  <div className="font-mono font-bold text-white">{hall.capacity}</div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {hall.occupancyPercent}% fill
                  </span>
                </td>

                {/* Configured Sections */}
                <td className="py-3 px-4">
                  <div className="flex flex-wrap items-center gap-1.5 max-w-[180px]">
                    {sections.map((sec) => {
                      const tokens = getCategoryDesignTokens(sec.category);
                      return (
                        <span
                          key={sec.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold truncate"
                          style={{
                            backgroundColor: `${tokens.color}20`,
                            color: tokens.color,
                          }}
                          title={`${sec.name} (${sec.category}): ${sec.seatCount} seats`}
                        >
                          {sec.category.split(" ")[0]} ({sec.seatCount})
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Projection */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Tv className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                    <span className="truncate max-w-[130px]" title={hall.projectionType}>
                      {hall.projectionType}
                    </span>
                  </div>
                </td>

                {/* Sound */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Volume2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                    <span className="truncate max-w-[130px]" title={hall.soundSystem}>
                      {hall.soundSystem}
                    </span>
                  </div>
                </td>

                {/* Current Shows */}
                <td className="py-3 px-4 text-center font-mono">
                  {hall.currentShow ? (
                    <span className="text-[11px] text-white font-semibold">
                      {hall.currentShow}
                    </span>
                  ) : (
                    <span className="text-[#64748B] text-[10px]">None</span>
                  )}
                </td>

                {/* Operating Status */}
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={
                      hall.status === "Active" || hall.status === "Show Running"
                        ? "success"
                        : hall.status === "Maintenance"
                        ? "warning"
                        : hall.status === "Archived"
                        ? "secondary"
                        : "danger"
                    }
                    size="sm"
                    dot
                  >
                    {hall.status}
                  </Badge>
                </td>

                {/* Created Date */}
                <td className="py-3 px-4 text-[11px] text-[#64748B] font-mono whitespace-nowrap">
                  {hall.createdAt ? hall.createdAt.split("T")[0] : "2026-09-01"}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/theatre/halls/${hall.id}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onEdit(hall)}
                      className="h-7 w-7 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                      title="Edit Auditorium"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onDuplicate(hall.id)}
                      className="h-7 w-7 p-0 text-[#38BDF8] hover:text-sky-300 hover:bg-sky-400/10"
                      title="Duplicate Auditorium"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onToggleStatus(hall.id)}
                      className={`h-7 w-7 p-0 ${
                        isOnline
                          ? "text-emerald-400 hover:text-rose-400"
                          : "text-[#64748B] hover:text-emerald-400"
                      }`}
                      title={isOnline ? "Deactivate Hall" : "Activate Hall"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onArchive(hall.id)}
                      className="h-7 w-7 p-0 text-[#64748B] hover:text-white"
                      title="Archive Hall"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>

                    {hall.status === "Draft" || hall.status === "Archived" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onDelete(hall.id)}
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Hall"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
