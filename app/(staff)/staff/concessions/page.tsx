import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Coffee, CheckCircle2, Clock } from "lucide-react";

export const metadata = {
  title: "Concessions POS | Staff Terminal",
};

export default function StaffConcessionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="F&B Concessions Dispatch"
        subtitle="Live Order Preparation Queue & Express Counter Pickup"
        description="Fulfill patron orders for caramel popcorn tubs, nachos, gourmet beverages, and in-theatre dining seat delivery."
        badge="Active F&B Queue"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Kitchen Display System (KDS) & Concession POS"
        description="Touchscreen kitchen preparation ticket bump bar and counter pickup buzzer notification activate in Phase 2."
        versionLabel="v1.2 F&B Kitchen"
        icon={Coffee}
        backHref="/staff"
        backLabel="Back to Shift Dashboard"
      />
    </div>
  );
}
