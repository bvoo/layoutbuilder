import { computed, type Ref, type ComputedRef } from "vue";
import type { LayoutSettings, LayoutPreset } from "@/types/layout";

export interface CanvasCoordinatesOptions {
  canvas: Ref<LayoutPreset["canvas"]>;
  settings: Ref<LayoutSettings>;
  zoom: Ref<number>;
  offset: Ref<{ x: number; y: number }>;
}

export interface CanvasCoordinates {
  unitScale: ComputedRef<number>;
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  snapToGrid: (value: number) => number;
  clamp: (value: number, min: number, max: number) => number;
}

/**
 * Composable for canvas coordinate transformations.
 * Handles unit conversion (mm/in), screen-to-world transforms, and grid snapping.
 */
export function useCanvasCoordinates(
  options: CanvasCoordinatesOptions
): CanvasCoordinates {
  const { canvas, settings, zoom, offset } = options;

  /**
   * Pixel scale factor based on current unit system.
   * - Inches: 96 pixels per inch (standard screen DPI)
   * - Millimeters: ~3.78 pixels per mm (96 / 25.4)
   */
  const unitScale = computed(() =>
    settings.value.units === "in" ? 96 : 3.77952756
  );

  /**
   * Clamp a value between min and max.
   */
  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

  /**
   * Convert screen coordinates to world (canvas) coordinates.
   * Takes into account current zoom level and pan offset.
   */
  const screenToWorld = (
    screenX: number,
    screenY: number
  ): { x: number; y: number } => {
    const scaledUnit = unitScale.value * zoom.value;
    return {
      x: (screenX - offset.value.x) / scaledUnit,
      y: (screenY - offset.value.y) / scaledUnit,
    };
  };

  /**
   * Convert world (canvas) coordinates to screen coordinates.
   * Takes into account current zoom level and pan offset.
   */
  const worldToScreen = (
    worldX: number,
    worldY: number
  ): { x: number; y: number } => {
    const scaledUnit = unitScale.value * zoom.value;
    return {
      x: worldX * scaledUnit + offset.value.x,
      y: worldY * scaledUnit + offset.value.y,
    };
  };

  /**
   * Snap a world coordinate value to the grid if snapping is enabled.
   */
  const snapToGrid = (value: number): number => {
    if (!settings.value.snapToGrid) return value;
    const gridSize = canvas.value.gridSize;
    return Math.round(value / gridSize) * gridSize;
  };

  return {
    unitScale,
    screenToWorld,
    worldToScreen,
    snapToGrid,
    clamp,
  };
}
