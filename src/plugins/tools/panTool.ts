import { Hand } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";

/**
 * Pan tool - enables left-click panning (as alternative to default right-click pan).
 * Note: The actual panning logic is handled by useCanvasPan composable;
 * this tool just provides the UI button and cursor.
 */
export const panTool = {
  id: "pan",
  name: "Pan",
  icon: Hand,
  group: "selection" as const,
  cursor: "grab",
  weight: 1,
};

export function registerPanTool(): void {
  registerTool(panTool);
}
