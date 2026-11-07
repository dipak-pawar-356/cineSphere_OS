import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tenant Admins | Super Admin HQ",
};

export default function SuperAdminAdminsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tenant Administrator Directory"
        subtitle="Cinema Chain Operators, Enterprise Directors & Regional Managers"
        description="Manage multi-tenant access credentials, role-based delegation, Okta/SAML SSO federation, and circuit operator permissions."
        badge="Access Control"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" /> Invite Admin
          </Button>
        }
      />

      <ComingSoon
        moduleName="Enterprise RBAC & Identity Federation"
        description="SAML 2.0 / OIDC single sign-on, scoped API service keys, and granular per-theatre role assignment will deploy in Phase 2."
        versionLabel="v1.2 IAM Gateway"
        icon={ShieldCheck}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}

