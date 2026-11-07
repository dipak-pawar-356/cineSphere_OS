import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Settings, Shield, CreditCard } from "lucide-react";

export const metadata = {
  title: "Account Preferences | CineSphere Patron Portal",
};

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Preferences & Security"
        subtitle="Saved Payment Methods, 2FA Verification & Email Preferences"
        description="Configure one-click checkout wallets, notification frequencies, language preferences, and privacy controls."
        badge="Settings"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Saved Cards Vault & One-Click Express Checkout"
        description="PCI-DSS tokenized card management and passkey biometric login will activate in Phase 2."
        versionLabel="v1.2 Patron Settings"
        icon={Settings}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}
