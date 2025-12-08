<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import type { ControlElement } from "@/types/layout";
import {
  useCanvasCoordinates,
  useCanvasZoom,
  useCanvasPan,
  useElementDrag,
  useKeyboardShortcuts,
  createUndoRedoShortcuts,
} from "@/composables";

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

// Canvas ref
const canvasRef = ref<HTMLDivElement | null>(null);
const hasUserInteracted = ref(false);

// Shared state for composables
const offset = ref({ x: 0, y: 0 });
const zoom = ref(1);

// Initialize composables with shared zoom ref
const { unitScale, screenToWorld, snapToGrid, clamp } = useCanvasCoordinates({
  canvas,
  settings,
  zoom,
  offset,
});

const zoomState = useCanvasZoom({
  unitScale,
  offset,
  zoom,
  onUserInteraction: () => {
    hasUserInteracted.value = true;
  },
});

const panState = useCanvasPan({
  offset,
  onUserInteraction: () => {
    hasUserInteracted.value = true;
  },
});

const dragState = useElementDrag({
  unitScale,
  zoom: zoomState.zoom,
  onUpdateElement: (id, payload, options) => {
    layoutStore.updateElement(id, payload, options);
  },
  onSelectElement: (id) => {
    layoutStore.selectElement(id);
  },
  isSelected: (id) => selection.value.includes(id),
  onUserInteraction: () => {
    hasUserInteracted.value = true;
  },
});

useKeyboardShortcuts({
  shortcuts: createUndoRedoShortcuts(
    () => layoutStore.undo(),
    () => layoutStore.redo()
  ),
});

const gridStyle = computed(() => {
  const size = canvas.value.gridSize * unitScale.value * zoomState.zoom.value;
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
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${zoomState.zoom.value})`,
  transformOrigin: "top left",
  willChange: "transform",
}));

const elementStyle = (element: ControlElement) => {
  const scale = unitScale.value;
  const toPx = (value: number) => `${value * scale}px`;
  const baseTransform = `translate(${toPx(element.position.x)}, ${toPx(element.position.y)}) rotate(${element.rotation}deg)`;
  const transform = zoomState.translateZToggle.value
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

// Helper functions
const isSelected = (id: string) => selection.value.includes(id);

const centerBoard = () => {
  const containerEl = canvasRef.value;
  if (!containerEl) return;
  const containerRect = containerEl.getBoundingClientRect();
  const boardWidth = canvas.value.width * unitScale.value * zoomState.zoom.value;
  const boardHeight =
    canvas.value.height * unitScale.value * zoomState.zoom.value;
  offset.value = {
    x: (containerRect.width - boardWidth) / 2,
    y: (containerRect.height - boardHeight) / 2,
  };
};

const handleResize = () => {
  if (hasUserInteracted.value) return;
  centerBoard();
};

// Element placement for creation tools
const placeElementAtPointer = (event: MouseEvent) => {
  const preset = creationPreset.value;
  const containerEl = canvasRef.value;
  if (!preset || !containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;

  const world = screenToWorld(pointerX, pointerY);
  const presetSize = preset.size ?? { width: 30, height: 30 };

  let positionX = world.x - presetSize.width / 2;
  let positionY = world.y - presetSize.height / 2;

  positionX = snapToGrid(positionX);
  positionY = snapToGrid(positionY);

  layoutStore.addElement({
    ...preset,
    position: { x: positionX, y: positionY },
  });
};

// Event handlers
const handleCanvasClick = (event: MouseEvent) => {
  if (panState.isPanning.value) return;

  if (activeTool.value === "button" && creationPreset.value) {
    placeElementAtPointer(event);
    return;
  }

  layoutStore.clearSelection();
};

const handleElementClick = (event: MouseEvent, id: string) => {
  event.stopPropagation();
  if (dragState.elementWasDragged.value) {
    dragState.elementWasDragged.value = false;
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
  element: ControlElement
) => {
  if (activeTool.value === "erase") return;
  dragState.handleDragStart(event, element);
};

const handleElementPointerMove = (
  event: PointerEvent,
  element: ControlElement
) => {
  dragState.handleDragMove(event, element);
};

const handleElementPointerUp = (
  event: PointerEvent,
  element: ControlElement
) => {
  dragState.handleDragEnd(event, element, {
    snapToGrid: settings.value.snapToGrid ? snapToGrid : undefined,
  });
};

const handleWheel = (event: WheelEvent) => {
  const containerEl = canvasRef.value;
  if (!containerEl) return;
  zoomState.handleWheel(event, containerEl.getBoundingClientRect());
};

const handlePointerDown = (event: PointerEvent) => {
  panState.handlePanStart(event, event.currentTarget as HTMLElement);
};

const handlePointerMove = (event: PointerEvent) => {
  panState.handlePanMove(event);
};

const handlePointerUp = (event: PointerEvent) => {
  panState.handlePanEnd(event, event.currentTarget as HTMLElement);
};

// Lifecycle
onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    centerBoard();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div
    ref="canvasRef"
    class="absolute inset-0 overflow-hidden bg-[#2a2a2a]"
    :class="[
      {
        'cursor-grabbing': panState.isPanning.value,
        'cursor-crosshair': !panState.isPanning.value && activeTool === 'erase',
        'cursor-grab': !panState.isPanning.value && activeTool !== 'erase',
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
          'transition-all duration-150': !dragState.isDraggingElement.value,
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
