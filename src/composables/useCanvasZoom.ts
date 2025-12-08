import { ref, type Ref, type ComputedRef } from "vue";

export interface CanvasZoomOptions {
  unitScale: ComputedRef<number>;
  offset: Ref<{ x: number; y: number }>;
  /** Optional external zoom ref. If not provided, creates its own. */
  zoom?: Ref<number>;
  onUserInteraction?: () => void;
}

export interface CanvasZoomState {
  zoom: Ref<number>;
  translateZToggle: Ref<boolean>;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  handleWheel: (event: WheelEvent, containerRect: DOMRect) => void;
  setZoom: (value: number) => void;
}

export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 3;

/**
 * Composable for canvas zoom functionality.
 * Handles mouse wheel zooming with zoom-toward-pointer behavior.
 */
export function useCanvasZoom(options: CanvasZoomOptions): CanvasZoomState {
  const { unitScale, offset, onUserInteraction } = options;

  // Use provided zoom ref or create a new one
  const zoom = options.zoom ?? ref(1);
  const translateZToggle = ref(false);

  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

  /**
   * Set zoom level directly, clamped to valid range.
   */
  const setZoom = (value: number): void => {
    zoom.value = clamp(value, MIN_ZOOM, MAX_ZOOM);
  };

  /**
   * Handle mouse wheel zoom.
   * Zooms toward the pointer position to maintain focus on the area of interest.
   */
  const handleWheel = (event: WheelEvent, containerRect: DOMRect): void => {
    event.preventDefault();
    onUserInteraction?.();

    const factor = Math.exp(-event.deltaY * 0.0015);
    const next = clamp(zoom.value * factor, MIN_ZOOM, MAX_ZOOM);
    if (Math.abs(next - zoom.value) < 0.0005) return;

    // Calculate pointer position relative to container
    const pointerX = event.clientX - containerRect.left;
    const pointerY = event.clientY - containerRect.top;

    // Calculate world position under pointer at current zoom
    const currentUnitPx = unitScale.value * zoom.value;
    const worldX = (pointerX - offset.value.x) / currentUnitPx;
    const worldY = (pointerY - offset.value.y) / currentUnitPx;

    // Calculate new offset to keep same world point under pointer
    const nextUnitPx = unitScale.value * next;
    offset.value = {
      x: pointerX - worldX * nextUnitPx,
      y: pointerY - worldY * nextUnitPx,
    };

    zoom.value = next;
    // Toggle translateZ to force GPU layer refresh and prevent rendering artifacts
    translateZToggle.value = !translateZToggle.value;
  };

  return {
    zoom,
    translateZToggle,
    MIN_ZOOM,
    MAX_ZOOM,
    handleWheel,
    setZoom,
  };
}
