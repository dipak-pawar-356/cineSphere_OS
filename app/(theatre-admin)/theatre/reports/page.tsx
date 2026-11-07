import React from "react";
import Link from "next/link";
import { THEATRE_REPORTS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Audit & Operational Reports | CineSphere OS",
};

export default function TheatreReportsPage() {
  const reportTypes = [
    { title: "Daily Box Office Collection Report", category: "Revenue", desc: "Detailed breakdown of ticket collections per show, split by payment rail.", size: "2.4 MB" },
    { title: "Auditorium Occupancy & Seat Utilization", category: "Operations", desc: "Hall-by-hall occupancy percentage, VIP recliner fill rate, and turnaround times.", size: "4.1 MB" },
    { title: "Distributor Box Office Remittance Ledger", category: "Compliance", desc: "Studio contractual split share calculation for Warner Bros, Universal, and Dharma.", size: "1.9 MB" },
    { title: "Gourmet F&B Concessions Sales Margin", category: "Concessions", desc: "Food counter inventory drawdown, top combo yields, and beverage revenue.", size: "1.8 MB" },
    { title: "Turnstile QR Scan Log & Usher Audit", category: "Security", desc: "Digital ticket scanning logs with exact timestamp records and turnstile gate IDs.", size: "3.2 MB" },
    { title: "GST Entertainment Tax Monthly Return", category: "Tax Compliance", desc: "18% GST output tax liability statement mapped to state commercial authorities.", size: "1.1 MB" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Audit Reports & Distributor Filings"
        subtitle="Automated Daily Box Office Ledgers, Tax Filings & Concession Margin Audits"
        badge="Ready for Export"
        badgeVariant="success"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((rep, idx) => (
          <Card key={idx} variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm">{rep.category}</Badge>
                <span className="text-[10px] font-mono text-[#64748B]">{rep.size}</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{rep.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">{rep.desc}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445] space-y-2">
              <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                <Clock className="h-3 w-3" /> Generated today at 06:00 AM
              </span>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <Button variant="outline" size="xs" disabled className="text-[10px] border-[#2A3445] text-[#CBD5E1]">
                  PDF
                </Button>
                <Button variant="outline" size="xs" disabled className="text-[10px] border-[#2A3445] text-[#CBD5E1]">
                  Excel
                </Button>
                <Button variant="outline" size="xs" disabled className="text-[10px] border-[#2A3445] text-[#CBD5E1]">
                  CSV
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
