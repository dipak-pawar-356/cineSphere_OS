import { create } from "zustand";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  circuitType: string;
}

interface TenantState {
  currentTenant: TenantInfo | null;
  setCurrentTenant: (tenant: TenantInfo | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: {
    id: "tenant-enterprise-hq",
    name: "CineSphere Global Circuit",
    slug: "cinesphere-hq",
    circuitType: "ENTERPRISE_MULTIPLEX",
  },
  setCurrentTenant: (currentTenant) => set({ currentTenant }),
}));
