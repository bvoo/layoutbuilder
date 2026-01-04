import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { ControlElement, ElementCreatePayload } from "@/types/layout";

export interface PlacementPreviewOptions {
  /** Current active tool */
  activeTool: Ref<string>;
  /** Current creation preset from store */
  creationPreset: Ref<ElementCreatePayload | null>;
  /** Tools that support placement preview */
  dropperTools?: string[];
  /** Convert screen coordinates to world coordinates */
  screenToWorld: (x: number, y: number) => { x: number; y: number };
  /** Snap position to grid */
  snapToGrid: (value: number) => number;
}

export interface PlacementPreviewState {
  /** Current preview position in world coordinates */
  previewPosition: Ref<{ x: number; y: number } | null>;
  /** Whether preview is currently visible */
  isPreviewVisible: Ref<boolean>;
  /** Whether a dropper tool is currently active */
  isDropperToolActive: ComputedRef<boolean>;
  /** The preview element (for rendering) */
  previewElement: ComputedRef<ControlElement | null>;
  /** Update preview position from pointer event */
  updatePreviewPosition: (event: PointerEvent, containerEl: HTMLElement) => void;
  /** Hide the preview */
  hidePreview: () => void;
}

/**
 * Composable for element placement preview functionality.
 * Shows a ghost preview of the element being placed that follows the cursor.
 */
export function usePlacementPreview(
  options: PlacementPreviewOptions
): PlacementPreviewState {
  const {
    activeTool,
    creationPreset,
    dropperTools = ["button", "lever"],
    screenToWorld,
    snapToGrid,
  } = options;

  const previewPosition = ref<{ x: number; y: number } | null>(null);
  const isPreviewVisible = ref(false);

  const isDropperToolActive = computed(
    () => dropperTools.includes(activeTool.value) && creationPreset.value !== null
  );

  const previewElement = computed<ControlElement | null>(() => {
    if (!isDropperToolActive.value || !previewPosition.value || !creationPreset.value) {
      return null;
    }
    const preset = creationPreset.value;
    const size = preset.size ?? { width: 30, height: 30 };
    return {
      id: "__preview__",
      name: preset.name ?? "",
      mapping: "",
      type: preset.type ?? "button",
      variant: preset.variant ?? "",
      size,
      position: previewPosition.value,
      rotation: preset.rotation ?? 0,
      metadata: preset.metadata ?? {},
    };
  });

  const updatePreviewPosition = (
    event: PointerEvent,
    containerEl: HTMLElement
  ): void => {
    if (!isDropperToolActive.value) {
      isPreviewVisible.value = false;
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const pointerX = event.clientX - containerRect.left;
    const pointerY = event.clientY - containerRect.top;
    const world = screenToWorld(pointerX, pointerY);
    const preset = creationPreset.value;
    const presetSize = preset?.size ?? { width: 30, height: 30 };

    let positionX = world.x - presetSize.width / 2;
    let positionY = world.y - presetSize.height / 2;

    positionX = snapToGrid(positionX);
    positionY = snapToGrid(positionY);

    previewPosition.value = { x: positionX, y: positionY };
    isPreviewVisible.value = true;
  };

  const hidePreview = (): void => {
    isPreviewVisible.value = false;
  };

  return {
    previewPosition,
    isPreviewVisible,
    isDropperToolActive,
    previewElement,
    updatePreviewPosition,
    hidePreview,
  };
}
