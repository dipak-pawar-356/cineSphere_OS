import React from "react";
import { HallDesignerCanvasClient } from "./hall-designer-canvas-client";

/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Page (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Hosts the Hall Designer Foundation and Visual Canvas & Grid System.
 * Guarantees that in-flight shows query only published layouts, while theatre
 * designers create and validate isolated draft versions.
 * ==============================================================================
 */

export const metadata = {
  title: "Hall Designer & Canvas System | CineSphere OS",
  description:
    "Enterprise auditorium layout designer with immutable layout definition layer, multi-density snapping grid, and unit conversion engine.",
};

export default function HallDesignerPage() {
  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      <HallDesignerCanvasClient />
    </div>
  );
}
