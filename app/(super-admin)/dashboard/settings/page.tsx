import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Settings, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "HQ Settings | Super Admin HQ",
};

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="HQ Global Configuration"
        subtitle="Multi-Tenant Policies, Payment Gateways, Webhook Keys & Global SLAs"
        description="Configure circuit-wide currency exchange tables, convenience fee schedules, session timeouts, and CDN edge cache TTLs."
        badge="HQ Settings"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Save className="h-4 w-4" /> Save Global Configuration
          </Button>
        }
      />

      <ComingSoon
        moduleName="Global Multi-Tenant Gateway & Secret Management Vault"
        description="HashiCorp Vault / AWS Secrets Manager integration for payment keys and multi-tenant webhook listeners deploys in Phase 2."
        versionLabel="v1.2 Config Vault"
        icon={Settings}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
