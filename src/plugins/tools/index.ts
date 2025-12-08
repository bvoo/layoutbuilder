import { registerSelectTool } from "./selectTool";
import { registerEraseTool } from "./eraseTool";
import { registerButtonTool } from "./buttonTool";
import { registerLeverTool } from "./leverTool";
import { registerPanTool } from "./panTool";
import { registerMeasureTool } from "./measureTool";

/**
 * Register all built-in tools.
 * Call this during app initialization.
 */
export function registerBuiltInTools(): void {
  registerSelectTool();
  registerPanTool();
  registerMeasureTool();
  registerButtonTool();
  registerLeverTool();
  registerEraseTool();
}

export { selectTool, registerSelectTool } from "./selectTool";
export { eraseTool, registerEraseTool } from "./eraseTool";
export { buttonTool, registerButtonTool } from "./buttonTool";
export { leverTool, registerLeverTool } from "./leverTool";
export { panTool, registerPanTool } from "./panTool";
export { measureTool, registerMeasureTool } from "./measureTool";
