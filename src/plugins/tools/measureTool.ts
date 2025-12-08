import { Ruler } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";

/**
 * Measure tool - placeholder for future measurement functionality.
 */
export const measureTool = {
  id: "measure",
  name: "Measure",
  icon: Ruler,
  group: "selection" as const,
  cursor: "crosshair",
  weight: 2,
};

export function registerMeasureTool(): void {
  registerTool(measureTool);
}
