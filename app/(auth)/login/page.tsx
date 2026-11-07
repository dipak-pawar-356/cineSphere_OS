import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Authentication Portal",
  description: "Enterprise SSO & Authentication Portal.",
};

export default function LoginPage() {
  return (
    <PagePlaceholder
      badge="Identity Management"
      icon={ShieldCheck}
      targetRole="All Platform Roles"
      title="Authentication & SSO Portal"
      description="Unified authentication gateway supporting Okta, SAML 2.0, multi-factor hardware security keys, and tenant domain routing."
      phase="Phase 2 Identity Module"
      futureFeatures={[
        "Enterprise SAML 2.0 / OpenID Connect Integration",
        "Multi-Factor Biometric & TOTP Verification",
        "Automated Subdomain & Custom Tenant Routing",
        "Granular Role & Session Policy Enforcement",
      ]}
    />
  );
}
