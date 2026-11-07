"use client";

import React from "react";
import { FilterChip } from "./filter-chip";
import { cn } from "@/utils";

export interface StatusFilterProps {
  statuses?: { id: string; label: string; count?: number }[];
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  className?: string;
}

/**
 * Enterprise Operational Status Filter Group
 * Rapidly filters items across Active, Pending, Maintenance, and Inactive.
 */
export function StatusFilter({
  statuses = [
    { id: "all", label: "All Items" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending Review" },
    { id: "maintenance", label: "Maintenance" },
  ],
  selectedStatus = "all",
  onSelectStatus,
  className,
}: StatusFilterProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {statuses.map((st) => (
        <FilterChip
          key={st.id}
          label={st.label}
          count={st.count}
          active={selectedStatus === st.id}
          onClick={() => onSelectStatus?.(st.id)}
        />
      ))}
    </div>
  );
}

