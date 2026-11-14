import React from "react";
import { ConnectedTheatreDashboard } from "@/components/theatre-dashboard";
import { theatreDashboardService } from "@/lib/services/theatre-dashboard.service";

export const metadata = {
  title: "Operator Dashboard | Theatre Admin | CineSphere OS",
};

export default async function TheatreDashboardPage() {
  const theatreId = "th-pun-001";
  const bundle = await theatreDashboardService.getDashboardBundle(theatreId);

  return <ConnectedTheatreDashboard initialBundle={bundle} />;
}
