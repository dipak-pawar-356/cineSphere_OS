import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";

export interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card variant="elevated" className={cn("flex flex-col justify-between", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#2A3445]/50">
        <div>
          <CardTitle className="text-base font-bold text-white">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>

      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
