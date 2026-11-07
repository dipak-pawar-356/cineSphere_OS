/**
 * CineSphere OS - Multi-Tenant Isolation Context
 */

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  customDomain?: string;
  isActive: boolean;
  plan: "ENTERPRISE" | "PRO" | "STARTER";
}

export function resolveTenantFromHostname(hostname: string): string {
  // Placeholder logic for subdomain/custom domain resolution
  // e.g. "amc.cinesphere.io" -> "amc"
  const parts = hostname.split(".");
  if (parts.length > 2 && parts[0] !== "www") {
    return parts[0];
  }
  return "enterprise-hq";
}

