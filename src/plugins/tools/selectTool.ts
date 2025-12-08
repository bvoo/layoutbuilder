import { Pointer } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";
import type { ToolContext } from "../toolRegistry";

/**
 * Select tool - default tool for selecting and moving elements.
 */
export const selectTool = {
  id: "select",
  name: "Select",
  icon: Pointer,
  group: "selection" as const,
  cursor: "grab",
  weight: 0,

  onElementClick: (
    _event: MouseEvent,
    elementId: string,
    ctx: ToolContext
  ) => {
    ctx.selectElement(elementId);
  },

  onCanvasClick: (_event: MouseEvent, ctx: ToolContext) => {
    ctx.clearSelection();
  },
};

export function registerSelectTool(): void {
  registerTool(selectTool);
}
