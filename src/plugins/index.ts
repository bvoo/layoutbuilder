export {
  registerElement,
  unregisterElement,
  getElementPlugin,
  getAllElementPlugins,
  getCanvasComponent,
  getDefaultSize,
  getDefaultRadius,
  hasElementType,
  getElementTypeChoices,
} from "./elementRegistry";
export type { ElementPlugin } from "./elementRegistry";

export {
  registerTool,
  unregisterTool,
  getToolPlugin,
  getAllToolPlugins,
  getToolsByGroup,
  getToolCursor,
} from "./toolRegistry";
export type { ToolPlugin, ToolContext } from "./toolRegistry";

export {
  registerInspectorSection,
  unregisterInspectorSection,
  getInspectorSection,
  getAllInspectorSections,
  getSectionsForElement,
} from "./inspectorRegistry";
export type { InspectorSection } from "./inspectorRegistry";
