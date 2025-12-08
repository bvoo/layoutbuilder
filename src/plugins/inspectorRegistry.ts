import { shallowRef, type Component, type ShallowRef } from "vue";
import type { ControlElement } from "@/types/layout";

/**
 * Plugin definition for an inspector section.
 * Each section (name, transform, appearance, etc.) registers its rendering
 * and visibility logic through this interface.
 */
export interface InspectorSection {
  /** Unique section identifier */
  id: string;
  /** Human-readable title for the section header */
  title?: string;
  /** Weight for ordering (lower = higher in inspector) */
  weight: number;
  /** Vue component to render for this section */
  component: Component;
  /** Function to determine if this section should show for an element */
  shouldShow: (element: ControlElement) => boolean;
}

/**
 * Internal registry storage.
 */
const registry: ShallowRef<Map<string, InspectorSection>> = shallowRef(
  new Map()
);

/**
 * Register an inspector section.
 */
export function registerInspectorSection(section: InspectorSection): void {
  const newMap = new Map(registry.value);
  newMap.set(section.id, section);
  registry.value = newMap;
}

/**
 * Unregister an inspector section.
 */
export function unregisterInspectorSection(id: string): void {
  const newMap = new Map(registry.value);
  newMap.delete(id);
  registry.value = newMap;
}

/**
 * Get an inspector section by ID.
 */
export function getInspectorSection(id: string): InspectorSection | undefined {
  return registry.value.get(id);
}

/**
 * Get all registered inspector sections, sorted by weight.
 */
export function getAllInspectorSections(): InspectorSection[] {
  return Array.from(registry.value.values()).sort(
    (a, b) => a.weight - b.weight
  );
}

/**
 * Get sections that should be shown for a specific element.
 */
export function getSectionsForElement(
  element: ControlElement
): InspectorSection[] {
  return getAllInspectorSections().filter((section) =>
    section.shouldShow(element)
  );
}
