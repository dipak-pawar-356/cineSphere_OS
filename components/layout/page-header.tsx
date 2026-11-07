import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@/components/navigation/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  badgeVariant = "primary",
  breadcrumbs,
  showBreadcrumb = true,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-6 border-b border-[#2A3445]/60", className)}>
      {showBreadcrumb && <Breadcrumb items={breadcrumbs} />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {title}
            </h1>
            {badge && (
              <Badge variant={badgeVariant} size="sm">
                {badge}
              </Badge>
            )}
          </div>

          {subtitle && (
            <p className="text-sm font-medium text-[#CBD5E1] tracking-wide">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed pt-1">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

