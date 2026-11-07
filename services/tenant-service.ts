import { ApiResponse } from "@/lib/security/api-client";

export interface TenantSummary {
  id: string;
  name: string;
  domain: string;
  screensTotal: number;
  status: "ACTIVE" | "PROVISIONING" | "SUSPENDED";
}

export const tenantService = {
  getTenantDetails: async (tenantId: string): Promise<ApiResponse<TenantSummary>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
};
