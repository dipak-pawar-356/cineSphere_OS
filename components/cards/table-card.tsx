import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";

export interface TableCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TableCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: TableCardProps) {
  return (
    <Card variant="elevated" className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#2A3445]">
        <div>
          <CardTitle className="text-base font-bold text-white">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {actions && <div>{actions}</div>}
      </CardHeader>

      <div className="p-0 overflow-x-auto">{children}</div>
    </Card>
  );
}
