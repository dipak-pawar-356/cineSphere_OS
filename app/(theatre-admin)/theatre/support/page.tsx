import React from "react";
import Link from "next/link";
import { THEATRE_SUPPORT_TICKETS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Plus, Eye, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Exhibitor Hardware Support | CineSphere OS",
};

export default function TheatreSupportPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Exhibitor Hardware & Technical Escalation Desk"
        subtitle="Direct Vendor Dispatch for Laser Projector Maintenance, Audio Spares & POS Hardware"
        badge="2 Active Tickets"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Raise Hardware Ticket (Phase 2)
          </Button>
        }
      />

      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Subject & Issue Details</th>
                <th className="py-3.5 px-4">Hardware Category</th>
                <th className="py-3.5 px-4">Assigned Engineer</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_SUPPORT_TICKETS.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FBBF24]">{tkt.ticketNumber}</td>
                  <td className="py-3.5 px-4 font-bold text-white max-w-xs">{tkt.subject}</td>
                  <td className="py-3.5 px-4 text-[#CBD5E1]">{tkt.category}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{tkt.assignedEngineer}</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">{tkt.createdDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={tkt.priority === "High" ? "danger" : "warning"} size="sm">
                      {tkt.priority}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant={tkt.status === "Resolved" ? "success" : "secondary"} size="sm" dot>
                      {tkt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

