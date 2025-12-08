import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { ControlElement } from "@/types/layout";

export interface ElementDragOptions {
  unitScale: ComputedRef<number>;
  zoom: Ref<number>;
  onUpdateElement: (
    id: string,
    payload: { position: { x: number; y: number } },
    options?: { skipHistory?: boolean }
  ) => void;
  onSelectElement?: (id: string) => void;
  isSelected?: (id: string) => boolean;
  onUserInteraction?: () => void;
}

export interface ElementDragState {
  draggedElementId: Ref<string | null>;
  isDraggingElement: ComputedRef<boolean>;
  elementWasDragged: Ref<boolean>;
  lastDragPosition: Ref<{ x: number; y: number }>;
  handleDragStart: (event: PointerEvent, element: ControlElement) => void;
  handleDragMove: (event: PointerEvent, element: ControlElement) => void;
  handleDragEnd: (
    event: PointerEvent,
    element: ControlElement,
    options?: { snapToGrid?: (value: number) => number }
  ) => void;
}

/**
 * Composable for element drag-and-drop functionality.
 * Handles pointer capture, position tracking, and store updates.
 */
export function useElementDrag(options: ElementDragOptions): ElementDragState {
  const {
    unitScale,
    zoom,
    onUpdateElement,
    onSelectElement,
    isSelected,
    onUserInteraction,
  } = options;

  const draggedElementId = ref<string | null>(null);
  const elementWasDragged = ref(false);
  const dragStart = ref({ pointerX: 0, pointerY: 0, elementX: 0, elementY: 0 });
  const lastDragPosition = ref({ x: 0, y: 0 });

  const isDraggingElement = computed(() => draggedElementId.value !== null);

  /**
   * Start dragging an element on pointer down.
   */
  const handleDragStart = (
    event: PointerEvent,
    element: ControlElement
  ): void => {
    if (event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);

    onUserInteraction?.();

    if (isSelected && !isSelected(element.id)) {
      onSelectElement?.(element.id);
    }

    draggedElementId.value = element.id;
    elementWasDragged.value = false;
    dragStart.value = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      elementX: element.position.x,
      elementY: element.position.y,
    };
    lastDragPosition.value = { x: element.position.x, y: element.position.y };
  };

  /**
   * Update element position during drag.
   */
  const handleDragMove = (
    event: PointerEvent,
    element: ControlElement
  ): void => {
    if (draggedElementId.value !== element.id) return;

    const deltaX = event.clientX - dragStart.value.pointerX;
    const deltaY = event.clientY - dragStart.value.pointerY;
    const scaledUnit = unitScale.value * zoom.value;

    const rawX = dragStart.value.elementX + deltaX / scaledUnit;
    const rawY = dragStart.value.elementY + deltaY / scaledUnit;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      elementWasDragged.value = true;
    }

    lastDragPosition.value = { x: rawX, y: rawY };
    onUpdateElement(
      element.id,
      { position: { x: rawX, y: rawY } },
      { skipHistory: true }
    );
  };

  /**
   * End dragging and optionally snap to grid.
   */
  const handleDragEnd = (
    event: PointerEvent,
    element: ControlElement,
    endOptions?: { snapToGrid?: (value: number) => number }
  ): void => {
    if (draggedElementId.value !== element.id) return;

    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    let finalX = lastDragPosition.value.x;
    let finalY = lastDragPosition.value.y;

    if (endOptions?.snapToGrid) {
      finalX = endOptions.snapToGrid(finalX);
      finalY = endOptions.snapToGrid(finalY);
    }
    
    onUpdateElement(element.id, { position: { x: finalX, y: finalY } });

    draggedElementId.value = null;
  };

  return {
    draggedElementId,
    isDraggingElement,
    elementWasDragged,
    lastDragPosition,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
