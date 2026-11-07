import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { User, Key, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Super Admin Profile | Super Admin HQ",
};

export default function SuperAdminProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Super Admin Identity & Security Keys"
        subtitle="Hardware FIDO2 Security Keys, 2FA Credentials & Audit Signatures"
        description="Manage your root executive credentials, session tokens, audit verification keypairs, and security notification preferences."
        badge="Executive Root"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="h-4 w-4" /> Rotate API Keypair
          </Button>
        }
      />

      <ComingSoon
        moduleName="FIDO2 / WebAuthn Hardware Key Authentication"
        description="YubiKey FIDO2 hardware token management and cryptographic audit signing key rotation activate in Phase 2."
        versionLabel="v1.2 Security Gateway"
        icon={User}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}

