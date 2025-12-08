import { SlidersHorizontal } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";
import type { ToolContext } from "../toolRegistry";

/**
 * Lever tool - places new lever elements on canvas click.
 */
export const leverTool = {
  id: "lever",
  name: "Lever",
  icon: SlidersHorizontal,
  group: "controls" as const,
  cursor: "crosshair",
  weight: 1,

  onCanvasClick: (event: MouseEvent, ctx: ToolContext) => {
    const preset = ctx.creationPreset;
    if (!preset) return;

    const world = ctx.screenToWorld(event.clientX, event.clientY);
    const size = (preset.size as { width: number; height: number }) ?? {
      width: 30,
      height: 80,
    };

    let positionX = world.x - size.width / 2;
    let positionY = world.y - size.height / 2;

    positionX = ctx.snapToGrid(positionX);
    positionY = ctx.snapToGrid(positionY);

    ctx.addElement({
      ...preset,
      position: { x: positionX, y: positionY },
    });
  },
};

export function registerLeverTool(): void {
  registerTool(leverTool);
}
