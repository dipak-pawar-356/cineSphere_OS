"use client";

import React, { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { cn } from "@/utils";
import { Spinner } from "@/components/loaders/spinner";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface EnterpriseTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  stickyHeader?: boolean;
  searchable?: boolean;
  filterActions?: React.ReactNode;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function EnterpriseTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = "No records located",
  emptyDescription = "There are no matching items in this manifest.",
  stickyHeader = true,
  searchable = true,
  filterActions,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  className,
}: EnterpriseTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const totalPages = Math.ceil((totalItems || data.length) / pageSize) || 1;

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-[#161F2E] border border-[#2A3445] shadow-[0_8px_30px_rgb(0,0,0,0.35)] overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Search & Action Bar Placeholder */}
      {(searchable || filterActions) && (
        <div className="p-4 border-b border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827]/60">
          {searchable ? (
            <div className="relative w-full sm:w-72 flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search table records..."
                className="w-full h-8.5 pl-8 pr-3 rounded-lg bg-[#070B12] text-xs text-[#F9FAFB] placeholder:text-[#94A3B8]/60 border border-[#2A3445] focus:border-[#FBBF24]/50 focus:ring-1 focus:ring-[#FBBF24]/30 outline-none"
              />
            </div>
          ) : (
            <div />
          )}

          {filterActions && <div className="flex items-center gap-2 self-end sm:self-auto">{filterActions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto w-full relative min-h-[160px]">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2">
            <Spinner size="lg" />
            <span className="text-xs text-[#94A3B8]">Loading table manifest...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <h4 className="text-sm font-bold text-white">{emptyTitle}</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">{emptyDescription}</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead
              className={cn(
                "bg-[#111827] text-[#94A3B8] font-bold text-[11px] uppercase tracking-wider border-b border-[#2A3445]",
                stickyHeader && "sticky top-0 z-10"
              )}
            >
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      "py-3.5 px-4 font-semibold select-none",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.sortable && "cursor-pointer hover:text-white"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown
                          className={cn(
                            "h-3 w-3",
                            sortKey === col.key ? "text-[#FBBF24]" : "text-[#94A3B8]/60"
                          )}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-[#111827]/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-3 px-4",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="p-3 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8] bg-[#111827]/40">
        <div>
          Showing page <span className="font-bold text-white">{currentPage}</span> of{" "}
          <span className="font-bold text-white">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            className="p-1.5 rounded-lg border border-[#2A3445] bg-[#111827] hover:bg-[#161F2E] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            className="p-1.5 rounded-lg border border-[#2A3445] bg-[#111827] hover:bg-[#161F2E] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
