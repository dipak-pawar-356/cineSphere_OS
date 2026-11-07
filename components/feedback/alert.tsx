import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/utils";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = "info", title, children, className }: AlertProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    danger: "bg-red-500/10 border-red-500/30 text-red-300",
  };

  const icons = {
    info: <Info className="h-4 w-4 shrink-0 text-blue-400" />,
    success: <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />,
    danger: <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-xs",
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div className="space-y-0.5">
        {title && <h4 className="font-bold text-white text-xs">{title}</h4>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}

