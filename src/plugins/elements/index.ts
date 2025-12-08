import { registerElement } from "../elementRegistry";
import ButtonElement from "./ButtonElement.vue";
import LeverElement from "./LeverElement.vue";
import CustomElement from "./CustomElement.vue";

/**
 * Register all built-in element types.
 * Call this during app initialization.
 */
export function registerBuiltInElements(): void {
  registerElement({
    type: "button",
    displayName: "Button",
    defaultSize: { width: 32, height: 32 },
    defaultRadius: 100,
    canvasComponent: ButtonElement,
  });

  registerElement({
    type: "lever",
    displayName: "Lever",
    defaultSize: { width: 30, height: 80 },
    defaultRadius: 12,
    canvasComponent: LeverElement,
  });

  registerElement({
    type: "custom",
    displayName: "Custom",
    defaultSize: { width: 30, height: 30 },
    defaultRadius: 0,
    canvasComponent: CustomElement,
  });
}

// Re-export components for direct use if needed
export { ButtonElement, LeverElement, CustomElement };
