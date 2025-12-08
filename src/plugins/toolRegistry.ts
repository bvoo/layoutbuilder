import { shallowRef, type Component, type ShallowRef } from "vue";
import type { ControlElement } from "@/types/layout";

/**
 * Context passed to tool event handlers.
 * Provides access to layout store actions and canvas state.
 */
export interface ToolContext {
  /** Add a new element to the canvas */
  addElement: (payload: Record<string, unknown>) => void;
  /** Remove elements by ID */
  removeElements: (ids: string[]) => void;
  /** Select an element */
  selectElement: (id: string) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Update an element */
  updateElement: (
    id: string,
    payload: Record<string, unknown>,
    options?: { skipHistory?: boolean }
  ) => void;
  /** Get the currently queued creation preset */
  creationPreset: Record<string, unknown> | null;
  /** Convert screen coordinates to world coordinates */
  screenToWorld: (x: number, y: number) => { x: number; y: number };
  /** Snap a value to grid */
  snapToGrid: (value: number) => number;
}

/**
 * Plugin definition for a tool.
 * Each tool (select, erase, button dropper, etc.) registers its behavior
 * through this interface.
 */
export interface ToolPlugin {
  /** Unique tool identifier */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Icon component for the toolbar */
  icon: Component;
  /** Tool group for toolbar organization */
  group: "selection" | "controls" | "utilities";
  /** CSS cursor to use when this tool is active */
  cursor?: string;
  /** Weight for ordering within group (lower = first) */
  weight?: number;

  // Event handlers
  /** Called when the canvas is clicked (not on an element) */
  onCanvasClick?: (event: MouseEvent, ctx: ToolContext) => void;
  /** Called when an element is clicked */
  onElementClick?: (
    event: MouseEvent,
    elementId: string,
    ctx: ToolContext
  ) => void;
  /** Called when starting to drag an element */
  onDragStart?: (
    event: PointerEvent,
    element: ControlElement,
    ctx: ToolContext
  ) => boolean | void;
  /** Called during element drag */
  onDragMove?: (
    event: PointerEvent,
    element: ControlElement,
    ctx: ToolContext
  ) => void;
  /** Called when element drag ends */
  onDragEnd?: (
    event: PointerEvent,
    element: ControlElement,
    ctx: ToolContext
  ) => void;
}

/**
 * Internal registry storage.
 */
const registry: ShallowRef<Map<string, ToolPlugin>> = shallowRef(new Map());

/**
 * Register a tool with the registry.
 */
export function registerTool(plugin: ToolPlugin): void {
  const newMap = new Map(registry.value);
  newMap.set(plugin.id, plugin);
  registry.value = newMap;
}

/**
 * Unregister a tool from the registry.
 */
export function unregisterTool(id: string): void {
  const newMap = new Map(registry.value);
  newMap.delete(id);
  registry.value = newMap;
}

/**
 * Get a tool plugin by ID.
 */
export function getToolPlugin(id: string): ToolPlugin | undefined {
  return registry.value.get(id);
}

/**
 * Get all registered tool plugins.
 */
export function getAllToolPlugins(): ToolPlugin[] {
  return Array.from(registry.value.values());
}

/**
 * Get tools organized by group for the toolbar.
 */
export function getToolsByGroup(): Record<"selection" | "controls" | "utilities", ToolPlugin[]> {
  const result: Record<"selection" | "controls" | "utilities", ToolPlugin[]> = {
    selection: [],
    controls: [],
    utilities: [],
  };

  for (const plugin of registry.value.values()) {
    result[plugin.group].push(plugin);
  }

  // Sort each group by weight
  for (const group of Object.keys(result) as Array<keyof typeof result>) {
    result[group].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  }

  return result;
}

/**
 * Get the cursor for a tool.
 */
export function getToolCursor(id: string): string {
  const plugin = registry.value.get(id);
  return plugin?.cursor ?? "default";
}
