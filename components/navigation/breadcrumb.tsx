import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs", className)}>
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center text-[#94A3B8] hover:text-[#F9FAFB] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3 text-[#64748B]" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#94A3B8] hover:text-[#F9FAFB] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "font-bold text-[#F9FAFB]" : "text-[#94A3B8]")}>
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight className="h-3 w-3 text-[#64748B]" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
