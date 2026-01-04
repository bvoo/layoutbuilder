import { ref } from "vue";
import { Ruler } from "lucide-vue-next";
import { registerTool } from "../toolRegistry";
import type { ToolPlugin } from "../toolRegistry";
import type { ControlElement } from "@/types/layout";

export interface Measurement {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// Settings
export const measureSettings = ref({
  persistent: true,
  showMultiple: true,
  snapToEdges: true,
  snapThreshold: 15, // world units (mm or in)
});

// Measurements state
export const measurements = ref<Measurement[]>([]);
export const activeMeasurementId = ref<string | null>(null);
export const isMeasuring = ref(false);
export const draggedEndpoint = ref<{
  measurementId: string;
  endpoint: "start" | "end";
} | null>(null);
export const draggedMeasurement = ref<{
  measurementId: string;
  startOffset: { x: number; y: number };
  endOffset: { x: number; y: number };
} | null>(null);

let nextId = 1;
function generateId(): string {
  return `measure-${nextId++}`;
}

export function startMeasurement(point: { x: number; y: number }) {
  const id = generateId();
  const measurement: Measurement = {
    id,
    start: { ...point },
    end: { ...point },
  };
  
  if (!measureSettings.value.showMultiple) {
    measurements.value = [measurement];
  } else {
    measurements.value.push(measurement);
  }
  
  activeMeasurementId.value = id;
  isMeasuring.value = true;
}

export function updateMeasurementEnd(point: { x: number; y: number }) {
  if (!activeMeasurementId.value) return;
  const measurement = measurements.value.find(
    (m) => m.id === activeMeasurementId.value
  );
  if (measurement) {
    measurement.end = { ...point };
  }
}

export function finishMeasurement() {
  isMeasuring.value = false;
}

export function clearAllMeasurements() {
  measurements.value = [];
  activeMeasurementId.value = null;
  isMeasuring.value = false;
  draggedEndpoint.value = null;
}

export function removeMeasurement(id: string) {
  measurements.value = measurements.value.filter((m) => m.id !== id);
  if (activeMeasurementId.value === id) {
    activeMeasurementId.value = null;
  }
}

export function startDragEndpoint(
  measurementId: string,
  endpoint: "start" | "end"
) {
  draggedEndpoint.value = { measurementId, endpoint };
}

export function updateDraggedEndpoint(point: { x: number; y: number }) {
  if (!draggedEndpoint.value) return;
  const measurement = measurements.value.find(
    (m) => m.id === draggedEndpoint.value!.measurementId
  );
  if (measurement) {
    measurement[draggedEndpoint.value.endpoint] = { ...point };
  }
}

export function endDragEndpoint() {
  draggedEndpoint.value = null;
}

export function startDragMeasurement(
  measurementId: string,
  pointerWorld: { x: number; y: number }
) {
  const measurement = measurements.value.find((m) => m.id === measurementId);
  if (!measurement) return;

  // Calculate offset from pointer to each endpoint
  draggedMeasurement.value = {
    measurementId,
    startOffset: {
      x: measurement.start.x - pointerWorld.x,
      y: measurement.start.y - pointerWorld.y,
    },
    endOffset: {
      x: measurement.end.x - pointerWorld.x,
      y: measurement.end.y - pointerWorld.y,
    },
  };
}

export function updateDraggedMeasurement(pointerWorld: { x: number; y: number }) {
  if (!draggedMeasurement.value) return;
  const measurement = measurements.value.find(
    (m) => m.id === draggedMeasurement.value!.measurementId
  );
  if (measurement) {
    measurement.start = {
      x: pointerWorld.x + draggedMeasurement.value.startOffset.x,
      y: pointerWorld.y + draggedMeasurement.value.startOffset.y,
    };
    measurement.end = {
      x: pointerWorld.x + draggedMeasurement.value.endOffset.x,
      y: pointerWorld.y + draggedMeasurement.value.endOffset.y,
    };
  }
}

export function endDragMeasurement() {
  draggedMeasurement.value = null;
}

export function getMeasurementDistance(measurement: Measurement): number {
  const dx = measurement.end.x - measurement.start.x;
  const dy = measurement.end.y - measurement.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export const measureTool: ToolPlugin = {
  id: "measure",
  name: "Measure",
  icon: Ruler,
  group: "selection" as const,
  cursor: "crosshair",
  weight: 2,
};

export function registerMeasureTool(): void {
  registerTool(measureTool);
}

/** Get snap points for an element (edges and center) */
function getElementSnapPoints(element: ControlElement): { x: number; y: number }[] {
  const { x, y } = element.position;
  const { width, height } = element.size;
  
  return [
    { x: x + width / 2, y: y + height / 2 },  // center
    { x: x + width / 2, y: y },               // top
    { x: x + width / 2, y: y + height },      // bottom
    { x: x, y: y + height / 2 },              // left
    { x: x + width, y: y + height / 2 },      // right
    { x: x, y: y },                           // top-left
    { x: x + width, y: y },                   // top-right
    { x: x, y: y + height },                  // bottom-left
    { x: x + width, y: y + height },          // bottom-right
  ];
}

/** Snap a world point to the nearest element edge/corner/center */
export function snapPointToElements(
  point: { x: number; y: number },
  elements: ControlElement[],
  _unitScale: number,
  _zoom: number
): { x: number; y: number } {
  if (!measureSettings.value.snapToEdges) return point;
  
  const threshold = measureSettings.value.snapThreshold;
  let nearestPoint = point;
  let nearestDistance = Infinity;
  
  for (const element of elements) {
    for (const snapPoint of getElementSnapPoints(element)) {
      const dx = point.x - snapPoint.x;
      const dy = point.y - snapPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < threshold && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = { x: snapPoint.x, y: snapPoint.y };
      }
    }
  }
  
  return nearestPoint;
}

// Aliases for simpler API
export const setMeasureStart = startMeasurement;
export const setMeasureEnd = updateMeasurementEnd;
