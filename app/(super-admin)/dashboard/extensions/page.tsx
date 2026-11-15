import { Metadata } from "next";
import { enterpriseExtensionsService } from "@/lib/services/enterprise-extensions.service";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { EnterpriseExtensionsClient } from "./enterprise-extensions-client";

export const metadata: Metadata = {
  title: "Enterprise Extension Framework | CineSphere OS Super Admin",
  description:
    "Enterprise extension runtime kernel, 4-tier feature flag resolution, IoT device platform, and domain event bus.",
};

export default async function EnterpriseExtensionsPage() {
  const systemActor: SecurityActorContext = {
    userId: "super-admin-root",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "ext-page-init",
  };

  const overview = await enterpriseExtensionsService.getEnterpriseOverview(systemActor);
  const extensions = await enterpriseExtensionsService.listExtensions(systemActor);
  const flags = enterpriseExtensionsService.listFeatureFlags(systemActor);
  const devices = enterpriseExtensionsService.listDevices(systemActor);
  const events = enterpriseExtensionsService.getEventBusHistory(systemActor, { limit: 25 });
  const hierarchy = await enterpriseExtensionsService.getOrganizationHierarchy(systemActor);

  // Strip non-serializable function handles (lifecycle hooks) before passing to Client Component
  const serializableExtensions = extensions.map((item) => ({
    manifest: item.module.manifest,
    state: item.state,
  }));

  const serializableEvents = JSON.parse(JSON.stringify(events));
  const serializableHierarchy = JSON.parse(JSON.stringify(hierarchy));

  return (
    <EnterpriseExtensionsClient
      initialOverview={overview}
      initialExtensions={serializableExtensions}
      initialFlags={flags}
      initialDevices={devices}
      initialEvents={serializableEvents}
      initialHierarchy={serializableHierarchy}
    />
  );
}
