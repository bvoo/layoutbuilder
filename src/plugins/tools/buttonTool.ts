import { CircleDot } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";
import type { ToolContext } from "../toolRegistry";

/**
 * Button tool - places new button elements on canvas click.
 */
export const buttonTool = {
  id: "button",
  name: "Button",
  icon: CircleDot,
  group: "controls" as const,
  cursor: "crosshair",
  weight: 0,

  onCanvasClick: (event: MouseEvent, ctx: ToolContext) => {
    const preset = ctx.creationPreset;
    if (!preset) return;

    const world = ctx.screenToWorld(event.clientX, event.clientY);
    const size = (preset.size as { width: number; height: number }) ?? {
      width: 30,
      height: 30,
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

export function registerButtonTool(): void {
  registerTool(buttonTool);
}
