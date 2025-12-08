import { shallowRef, type Component, type ShallowRef } from "vue";
import type { ControlElement } from "@/types/layout";

/**
 * Plugin definition for an element type.
 * Each element type (button, lever, custom, etc.) registers its rendering
 * and configuration through this interface.
 */
export interface ElementPlugin {
  /** Unique type identifier (e.g., "button", "lever") */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Icon component for toolbars and lists */
  icon?: Component;
  /** Default size when creating new elements of this type */
  defaultSize: { width: number; height: number };
  /** Default corner radius percentage (0-100) */
  defaultRadius?: number;
  /** Vue component for rendering this element on the canvas */
  canvasComponent: Component;
  /** Optional custom inspector component for this element type */
  inspectorComponent?: Component;
}

/**
 * Internal registry storage.
 */
const registry: ShallowRef<Map<string, ElementPlugin>> = shallowRef(new Map());

/**
 * Register an element type with the registry.
 * If an element with the same type already exists, it will be replaced.
 */
export function registerElement(plugin: ElementPlugin): void {
  const newMap = new Map(registry.value);
  newMap.set(plugin.type, plugin);
  registry.value = newMap;
}

/**
 * Unregister an element type from the registry.
 */
export function unregisterElement(type: string): void {
  const newMap = new Map(registry.value);
  newMap.delete(type);
  registry.value = newMap;
}

/**
 * Get an element plugin by type.
 * Returns undefined if the type is not registered.
 */
export function getElementPlugin(type: string): ElementPlugin | undefined {
  return registry.value.get(type);
}

/**
 * Get all registered element plugins.
 */
export function getAllElementPlugins(): ElementPlugin[] {
  return Array.from(registry.value.values());
}

/**
 * Get the canvas component for an element.
 * Falls back to "custom" type if the specific type is not found.
 */
export function getCanvasComponent(element: ControlElement): Component | null {
  const plugin = registry.value.get(element.type);
  if (plugin) return plugin.canvasComponent;

  // Fallback to custom type
  const customPlugin = registry.value.get("custom");
  return customPlugin?.canvasComponent ?? null;
}

/**
 * Get the default size for an element type.
 */
export function getDefaultSize(
  type: string
): { width: number; height: number } | undefined {
  return registry.value.get(type)?.defaultSize;
}

/**
 * Get the default radius for an element type.
 */
export function getDefaultRadius(type: string): number | undefined {
  return registry.value.get(type)?.defaultRadius;
}

/**
 * Check if an element type is registered.
 */
export function hasElementType(type: string): boolean {
  return registry.value.has(type);
}

/**
 * Get element type choices for dropdowns, etc.
 */
export function getElementTypeChoices(): Array<{ type: string; displayName: string }> {
  return getAllElementPlugins().map((plugin) => ({
    type: plugin.type,
    displayName: plugin.displayName,
  }));
}
