import { ref, type Ref } from "vue";

export interface CanvasPanOptions {
  offset: Ref<{ x: number; y: number }>;
  onUserInteraction?: () => void;
}

export interface CanvasPanState {
  isPanning: Ref<boolean>;
  handlePanStart: (event: PointerEvent, target: HTMLElement) => void;
  handlePanMove: (event: PointerEvent) => void;
  handlePanEnd: (event: PointerEvent, target: HTMLElement) => void;
}

/**
 * Composable for canvas panning functionality.
 * Handles right-click drag panning with pointer capture.
 */
export function useCanvasPan(options: CanvasPanOptions): CanvasPanState {
  const { offset, onUserInteraction } = options;

  const isPanning = ref(false);
  const panState = ref({ startX: 0, startY: 0, originX: 0, originY: 0 });

  /**
   * Start panning on right-click.
   */
  const handlePanStart = (event: PointerEvent, target: HTMLElement): void => {
    if (event.button !== 2) return;
    event.preventDefault();
    target.setPointerCapture(event.pointerId);

    panState.value = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.value.x,
      originY: offset.value.y,
    };
    isPanning.value = true;
    onUserInteraction?.();
  };

  /**
   * Update pan offset during drag.
   */
  const handlePanMove = (event: PointerEvent): void => {
    if (!isPanning.value) return;
    event.preventDefault();

    const deltaX = event.clientX - panState.value.startX;
    const deltaY = event.clientY - panState.value.startY;
    const nextX = offset.value.x + deltaX;
    const nextY = offset.value.y + deltaY;

    offset.value = { x: nextX, y: nextY };
    panState.value.startX = event.clientX;
    panState.value.startY = event.clientY;
    panState.value.originX = nextX;
    panState.value.originY = nextY;
  };

  /**
   * End panning and release pointer capture.
   */
  const handlePanEnd = (event: PointerEvent, target: HTMLElement): void => {
    if (!isPanning.value) return;
    isPanning.value = false;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  return {
    isPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
}
