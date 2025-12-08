import { Eraser } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";
import type { ToolContext } from "../toolRegistry";

/**
 * Erase tool - deletes elements on click.
 */
export const eraseTool = {
  id: "erase",
  name: "Erase",
  icon: Eraser,
  group: "utilities" as const,
  cursor: "crosshair",
  weight: 0,

  onElementClick: (
    _event: MouseEvent,
    elementId: string,
    ctx: ToolContext
  ) => {
    ctx.removeElements([elementId]);
  },
};

export function registerEraseTool(): void {
  registerTool(eraseTool);
}
