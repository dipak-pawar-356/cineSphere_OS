import React from "react";
import { ConnectedTheatreDashboard } from "@/components/theatre-dashboard";
import { theatreDashboardService } from "@/lib/services/theatre-dashboard.service";

export const metadata = {
  title: "Theatre Operations Command Center | CineSphere OS",
};

export default async function TheatreAdminDashboardPage() {
  const theatreId = "th-pun-001";
  const bundle = await theatreDashboardService.getDashboardBundle(theatreId);

  return <ConnectedTheatreDashboard initialBundle={bundle} />;
}
