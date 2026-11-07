import React from "react";
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, Milestone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface TimelineEntry {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: "completed" | "in-progress" | "pending" | "flagged";
  actor?: string;
  tag?: string;
}

/**
 * Enterprise Audit Timeline
 * Used for operational activities, projector calibration steps, and ticket logs.
 */
export function AuditTimeline({
  entries,
  className,
}: {
  entries: TimelineEntry[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 relative pl-6 border-l-2 border-[#2A3445]", className)}>
      {entries.map((item) => (
        <div key={item.id} className="relative group text-xs space-y-1">
          {/* Timeline Dot Indicator */}
          <div
            className={cn(
              "absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ring-[#070B12]",
              item.status === "completed"
                ? "bg-emerald-400"
                : item.status === "in-progress"
                ? "bg-[#FBBF24] animate-pulse"
                : item.status === "flagged"
                ? "bg-rose-400"
                : "bg-[#2A3445]"
            )}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-white text-sm">{item.title}</span>
            <span className="text-[11px] font-mono text-[#64748B] shrink-0">{item.timestamp}</span>
          </div>

          {item.subtitle && <p className="text-xs text-[#94A3B8] leading-relaxed">{item.subtitle}</p>}

          <div className="flex items-center gap-2 pt-1">
            {item.actor && <span className="text-[10px] text-[#64748B]">By {item.actor}</span>}
            {item.tag && <Badge variant="outline" size="sm">{item.tag}</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Enterprise Milestone Roadmap Timeline
 */
export function MilestoneTimeline({
  milestones,
  className,
}: {
  milestones: { year: string; title: string; desc: string; active?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4", className)}>
      {milestones.map((m, idx) => (
        <div
          key={idx}
          className={cn(
            "p-5 rounded-2xl bg-[#161F2E] border space-y-2 relative",
            m.active ? "border-[#FBBF24]" : "border-[#2A3445]"
          )}
        >
          <div className="font-mono text-xs font-bold text-[#FBBF24]">{m.year}</div>
          <h4 className="font-bold text-white text-sm">{m.title}</h4>
          <p className="text-xs text-[#94A3B8]">{m.desc}</p>
        </div>
      ))}
    </div>
  );
}

