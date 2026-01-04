<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import {
  measurements,
  measureSettings,
  getMeasurementDistance,
  removeMeasurement,
  startDragEndpoint,
  updateDraggedEndpoint,
  endDragEndpoint,
  draggedEndpoint,
  startDragMeasurement,
  updateDraggedMeasurement,
  endDragMeasurement,
  draggedMeasurement,
  clearAllMeasurements,
  snapPointToElements,
  isMeasuring,
} from "@/plugins/tools/measureTool";
// lucide x
import { X } from "lucide-vue-next";

const props = defineProps<{
  unitScale: number;
  zoom: number;
  offset: { x: number; y: number };
  screenToWorld: (x: number, y: number) => { x: number; y: number };
}>();

const layoutStore = useLayoutStore();
const { activeTool, settings, elements } = storeToRefs(layoutStore);

watch(activeTool, (tool) => {
  if (tool !== "measure" && !measureSettings.value.persistent) {
    clearAllMeasurements();
  }
});

const hasMeasurements = computed(() => measurements.value.length > 0);

const formatDistance = (distance: number): string => {
  const unit = settings.value.units;
  return `${distance.toFixed(2)} ${unit}`;
};

const getLineStyle = (start: { x: number; y: number }, end: { x: number; y: number }) => {
  const scale = props.unitScale * props.zoom;
  const startX = start.x * scale + props.offset.x;
  const startY = start.y * scale + props.offset.y;
  const endX = end.x * scale + props.offset.x;
  const endY = end.y * scale + props.offset.y;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${length}px`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "0 50%",
  };
};

const getPointStyle = (point: { x: number; y: number }) => {
  const scale = props.unitScale * props.zoom;
  return {
    left: `${point.x * scale + props.offset.x}px`,
    top: `${point.y * scale + props.offset.y}px`,
  };
};

const getLabelPosition = (start: { x: number; y: number }, end: { x: number; y: number }) => {
  const scale = props.unitScale * props.zoom;
  const midX = ((start.x + end.x) / 2) * scale + props.offset.x;
  const midY = ((start.y + end.y) / 2) * scale + props.offset.y;

  return {
    left: `${midX}px`,
    top: `${midY}px`,
  };
};

const handleEndpointPointerDown = (
  event: PointerEvent,
  measurementId: string,
  endpoint: "start" | "end"
) => {
  event.stopPropagation();
  event.preventDefault();
  startDragEndpoint(measurementId, endpoint);
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
};

const handleEndpointPointerMove = (event: PointerEvent) => {
  if (!draggedEndpoint.value) return;
  
  const containerEl = document.querySelector("[data-canvas-container]");
  if (!containerEl) return;
  
  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;
  const rawWorld = props.screenToWorld(pointerX, pointerY);
  
  const world = snapPointToElements(rawWorld, elements.value, props.unitScale, props.zoom);
  updateDraggedEndpoint(world);
};

const handleEndpointPointerUp = (event: PointerEvent) => {
  (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  endDragEndpoint();
};

const handleEndpointClick = (event: MouseEvent) => {
  if (!isMeasuring.value) {
    event.stopPropagation();
  }
};

const handleRemove = (event: MouseEvent, measurementId: string) => {
  event.stopPropagation();
  removeMeasurement(measurementId);
};

// Label drag handlers (moves entire measurement)
const handleLabelPointerDown = (
  event: PointerEvent,
  measurementId: string
) => {
  event.stopPropagation();
  event.preventDefault();

  const containerEl = document.querySelector("[data-canvas-container]");
  if (!containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;
  const world = props.screenToWorld(pointerX, pointerY);

  startDragMeasurement(measurementId, world);
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
};

const handleLabelPointerMove = (event: PointerEvent) => {
  if (!draggedMeasurement.value) return;

  const containerEl = document.querySelector("[data-canvas-container]");
  if (!containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const pointerX = event.clientX - containerRect.left;
  const pointerY = event.clientY - containerRect.top;
  const world = props.screenToWorld(pointerX, pointerY);

  updateDraggedMeasurement(world);
};

const handleLabelPointerUp = (event: PointerEvent) => {
  (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  endDragMeasurement();
};
</script>

<template>
  <div
    v-if="hasMeasurements"
    class="pointer-events-none absolute inset-0 z-50"
  >
    <div
      v-for="measurement in measurements"
      :key="measurement.id"
      class="pointer-events-none"
    >
      <!-- Measurement line -->
      <div
        class="pointer-events-none absolute h-0.5 bg-primary"
        :style="getLineStyle(measurement.start, measurement.end)"
      />

      <!-- Start point (draggable) -->
      <div
        class="pointer-events-auto absolute size-3 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full bg-primary ring-2 ring-white transition-transform hover:scale-125"
        :style="getPointStyle(measurement.start)"
        @pointerdown="(e) => handleEndpointPointerDown(e, measurement.id, 'start')"
        @pointermove="handleEndpointPointerMove"
        @pointerup="handleEndpointPointerUp"
        @click="handleEndpointClick"
      />

      <!-- End point (draggable) -->
      <div
        class="pointer-events-auto absolute size-3 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full bg-primary ring-2 ring-white transition-transform hover:scale-125"
        :style="getPointStyle(measurement.end)"
        @pointerdown="(e) => handleEndpointPointerDown(e, measurement.id, 'end')"
        @pointermove="handleEndpointPointerMove"
        @pointerup="handleEndpointPointerUp"
        @click="handleEndpointClick"
      />

      <!-- Distance label (draggable to move entire measurement) -->
      <div
        class="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-full cursor-move items-center gap-1.5 rounded-md bg-primary py-1 pl-2 pr-1 text-xs font-semibold text-white shadow-lg select-none"
        :style="getLabelPosition(measurement.start, measurement.end)"
        @pointerdown="(e) => handleLabelPointerDown(e, measurement.id)"
        @pointermove="handleLabelPointerMove"
        @pointerup="handleLabelPointerUp"
        @click.stop
      >
        <span class="leading-none">{{ formatDistance(getMeasurementDistance(measurement)) }}</span>
        <button
          v-if="activeTool === 'measure'"
          class="pointer-events-auto flex size-4 shrink-0 items-center justify-center rounded hover:bg-white/20 bg-primary"
          @click="(e) => handleRemove(e, measurement.id)"
        >
          <X class="size-3" />
        </button>
      </div>
    </div>
  </div>
</template>
