<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import type { ControlElement } from "@/types/layout";

const layoutStore = useLayoutStore();
const {
  canvas,
  elements,
  selection,
  hoveredElementId,
  settings,
  activeTool,
  creationPreset,
} = storeToRefs(layoutStore);

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

const zoom = ref(1);
const offset = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const panState = ref({ startX: 0, startY: 0, originX: 0, originY: 0 });
const canvasRef = ref<HTMLDivElement | null>(null);
const translateZToggle = ref(false);
const draggedElementId = ref<string | null>(null);
const dragStart = ref({ pointerX: 0, pointerY: 0, elementX: 0, elementY: 0 });
const lastDragPosition = ref({ x: 0, y: 0 });
const elementWasDragged = ref(false);
const isDraggingElement = computed(() => draggedElementId.value !== null);

const hasUserInteracted = ref(false);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const unitScale = computed(() =>
  settings.value.units === "in" ? 96 : 3.77952756,
);

const gridStyle = computed(() => {
  const size = canvas.value.gridSize * unitScale.value * zoom.value;
  return {
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${offset.value.x}px ${offset.value.y}px`,
    backgroundImage:
      "linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
  };
});

const boardStyle = computed(() => ({
  width: `${canvas.value.width * unitScale.value}px`,
  height: `${canvas.value.height * unitScale.value}px`,
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${zoom.value})`,
  transformOrigin: "top left",
  willChange: "transform",
}));

const centerBoard = () => {
  const containerEl = canvasRef.value;
  if (!containerEl) return;
  const containerRect = containerEl.getBoundingClientRect();
  const boardWidth = canvas.value.width * unitScale.value * zoom.value;
  const boardHeight = canvas.value.height * unitScale.value * zoom.value;
  offset.value = {
    x: (containerRect.width - boardWidth) / 2,
    y: (containerRect.height - boardHeight) / 2,
  };
};

const handleResize = () => {
  if (hasUserInteracted.value) return;
  centerBoard();
};

const elementStyle = (element: ControlElement) => {
  const scale = unitScale.value;
  const toPx = (value: number) => `${value * scale}px`;
  const baseTransform = `translate(${toPx(element.position.x)}, ${toPx(element.position.y)}) rotate(${element.rotation}deg)`;
  const transform = translateZToggle.value
    ? `${baseTransform} translateZ(0)`
    : baseTransform;
  const rawRadius = (element.metadata as Record<string, unknown>).radius;
  const radius =
    typeof rawRadius === "number" ? clamp(rawRadius, 0, 100) : undefined;
  return {
    width: toPx(element.size.width),
    height: toPx(element.size.height),
    transform,
    ...(radius !== undefined ? { borderRadius: `${radius}%` } : {}),
  };
};

const isSelected = (id: string) => selection.value.includes(id);

const snapCoordinate = (value: number) => {
  return value;
};

const clampCoordinate = (value: number) => value;

const placeElementAtPointer = (event: MouseEvent) => {
  const preset = creationPreset.value;
  const containerEl = canvasRef.value;
  if (!preset || !containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;

  const scaledUnit = unitScale.value * zoom.value;
  const worldX = (pointerX - offset.value.x) / scaledUnit;
  const worldY = (pointerY - offset.value.y) / scaledUnit;

  const presetSize = preset.size ?? { width: 30, height: 30 };

  let positionX = worldX - presetSize.width / 2;
  let positionY = worldY - presetSize.height / 2;

  positionX = snapCoordinate(positionX);
  positionY = snapCoordinate(positionY);

  positionX = clampCoordinate(positionX);
  positionY = clampCoordinate(positionY);

  layoutStore.addElement({
    ...preset,
    position: {
      x: positionX,
      y: positionY,
    },
  });
};

const handleCanvasClick = (event: MouseEvent) => {
  if (isPanning.value) return;

  if (activeTool.value === "button" && creationPreset.value) {
    placeElementAtPointer(event);
    return;
  }

  layoutStore.clearSelection();
};

const handleElementClick = (event: MouseEvent, id: string) => {
  event.stopPropagation();
  if (elementWasDragged.value) {
    elementWasDragged.value = false;
    return;
  }
  if (activeTool.value === "erase") {
    layoutStore.removeElements([id]);
    return;
  }
  layoutStore.selectElement(id);
};

const handleElementMouseEnter = (id: string) => {
  layoutStore.setHoveredElement(id);
};

const handleElementMouseLeave = () => {
  layoutStore.setHoveredElement(null);
};

const handleElementPointerDown = (
  event: PointerEvent,
  element: ControlElement,
) => {
  if (event.button !== 0) return;
  if (activeTool.value === "erase") return;

  event.stopPropagation();
  event.preventDefault();

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  hasUserInteracted.value = true;

  if (!isSelected(element.id)) {
    layoutStore.selectElement(element.id);
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

const handleElementPointerMove = (
  event: PointerEvent,
  element: ControlElement,
) => {
  if (draggedElementId.value !== element.id) return;

  const deltaX = event.clientX - dragStart.value.pointerX;
  const deltaY = event.clientY - dragStart.value.pointerY;
  const scaledUnit = unitScale.value * zoom.value;

  const rawX = dragStart.value.elementX + deltaX / scaledUnit;
  const rawY = dragStart.value.elementY + deltaY / scaledUnit;

  const clampedX = clampCoordinate(rawX);
  const clampedY = clampCoordinate(rawY);

  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    elementWasDragged.value = true;
  }

  lastDragPosition.value = { x: clampedX, y: clampedY };
  layoutStore.updateElement(
    element.id,
    {
      position: {
        x: clampedX,
        y: clampedY,
      },
    },
    { skipHistory: true },
  );
};

const handleElementPointerUp = (
  event: PointerEvent,
  element: ControlElement,
) => {
  if (draggedElementId.value !== element.id) return;

  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  let finalX = lastDragPosition.value.x;
  let finalY = lastDragPosition.value.y;

  if (settings.value.snapToGrid) {
    finalX = clampCoordinate(snapCoordinate(finalX));
    finalY = clampCoordinate(snapCoordinate(finalY));
  }

  layoutStore.updateElement(element.id, {
    position: {
      x: finalX,
      y: finalY,
    },
  });

  draggedElementId.value = null;
};

const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
  const isModifier = event.metaKey || event.ctrlKey;
  if (!isModifier || event.altKey) return;

  const key = event.key.toLowerCase();
  if (key === "z") {
    event.preventDefault();
    if (event.shiftKey) {
      layoutStore.redo();
    } else {
      layoutStore.undo();
    }
  } else if (key === "y") {
    event.preventDefault();
    layoutStore.redo();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    centerBoard();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", handleResize);
});

const handleWheel = (event: WheelEvent) => {
  const containerEl = canvasRef.value;
  if (!containerEl) return;

  event.preventDefault();

  hasUserInteracted.value = true;

  const factor = Math.exp(-event.deltaY * 0.0015);
  const next = clamp(zoom.value * factor, MIN_ZOOM, MAX_ZOOM);
  if (Math.abs(next - zoom.value) < 0.0005) return;

  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;

  const currentUnitPx = unitScale.value * zoom.value;
  const worldX = (pointerX - offset.value.x) / currentUnitPx;
  const worldY = (pointerY - offset.value.y) / currentUnitPx;

  const nextUnitPx = unitScale.value * next;

  offset.value = {
    x: pointerX - worldX * nextUnitPx,
    y: pointerY - worldY * nextUnitPx,
  };

  zoom.value = next;
  translateZToggle.value = !translateZToggle.value;
};

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 2) return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
  panState.value = {
    startX: event.clientX,
    startY: event.clientY,
    originX: offset.value.x,
    originY: offset.value.y,
  };
  isPanning.value = true;
  hasUserInteracted.value = true;
};

const handlePointerMove = (event: PointerEvent) => {
  if (!isPanning.value) return;
  event.preventDefault();
  const deltaX = event.clientX - panState.value.startX;
  const deltaY = event.clientY - panState.value.startY;
  const nextX = offset.value.x + deltaX;
  const nextY = offset.value.y + deltaY;
  offset.value = {
    x: nextX,
    y: nextY,
  };
  panState.value.startX = event.clientX;
  panState.value.startY = event.clientY;
  panState.value.originX = nextX;
  panState.value.originY = nextY;
};

const handlePointerUp = (event: PointerEvent) => {
  if (!isPanning.value) return;
  isPanning.value = false;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
};
</script>

<template>
  <div
    ref="canvasRef"
    class="absolute inset-0 overflow-hidden bg-[#2a2a2a]"
    :class="[
      {
        'cursor-grabbing': isPanning,
        'cursor-crosshair': !isPanning && activeTool === 'erase',
        'cursor-grab': !isPanning && activeTool !== 'erase',
      },
    ]"
    :style="gridStyle"
    @wheel.prevent="handleWheel"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @contextmenu.prevent
    @click="handleCanvasClick"
  >
    <div
      class="relative min-h-max min-w-max rounded-2xl will-change-transform"
      :style="boardStyle"
    >
      <div
        v-for="element in elements"
        :key="element.id"
        class="absolute select-none flex items-center justify-center outline-2 outline-white px-4 py-2 text-slate-100"
        :class="{
          'ring-2 ring-primary/40 border-primary/80 bg-primary/30': isSelected(
            element.id,
          ),
          'bg-primary/20':
            hoveredElementId === element.id && !isSelected(element.id),
          'opacity-25': element.metadata.hidden,
          'transition-all duration-150': !isDraggingElement,
        }"
        :style="elementStyle(element)"
        data-element
        role="button"
        tabindex="0"
        @click="(event) => handleElementClick(event, element.id)"
        @mouseenter="() => handleElementMouseEnter(element.id)"
        @mouseleave="handleElementMouseLeave"
        @pointerdown="(event) => handleElementPointerDown(event, element)"
        @pointermove="(event) => handleElementPointerMove(event, element)"
        @pointerup="(event) => handleElementPointerUp(event, element)"
      >
        <span class="text-xs font-semibold uppercase tracking-[0.08em]">{{
          element.name
        }}</span>
      </div>
    </div>
  </div>
</template>
