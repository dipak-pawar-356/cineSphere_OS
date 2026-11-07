import { ID } from "./common.types";

/**
 * CineSphere OS - Platform Configuration
 * The root-level enterprise SaaS entity owned by Super Admin.
 */
export interface Platform {
  id: ID;
  name: string;
  tagline: string;
  version: string;
  totalTheatres: number;
  totalHalls: number;
  totalMovies: number;
  totalShows: number;
  supportedCurrencies: string[];
  defaultCurrency: string;
  defaultTimezone: string;
  tenants: string[];
  features: {
    dynamicPricing: boolean;
    concessionDispatch: boolean;
    seatLockTimeoutSeconds: number;
    hallDesigner3D: boolean;
    distributorSplitAutomations: boolean;
  };
}

