<script setup lang="ts">
import { computed } from "vue";
import type { ControlElement } from "@/types/layout";

type HoleShape = "circle" | "slot" | "rect" | "custom";

interface MountingHole {
  x: number;
  y: number;
  shape?: HoleShape;
  // For circle (default)
  diameter?: number;
  // For slot, rect, custom
  width?: number;
  height?: number;
  // For rotated shapes
  rotation?: number;
  // For custom SVG path (relative to hole center)
  path?: string;
}

const props = defineProps<{
  element: ControlElement;
}>();

const metadata = computed(() => props.element.metadata as Record<string, unknown>);

const shaftDiameter = computed(() => {
  const val = metadata.value.shaftDiameter;
  return typeof val === "number" ? val : 24;
});

const mountingHoles = computed(() => {
  const holes = metadata.value.mountingHoles;
  if (Array.isArray(holes)) {
    return holes as MountingHole[];
  }
  return [];
});

const toPercent = (value: number, dimension: number) => `${(value / dimension) * 100}%`;

const getHoleShape = (hole: MountingHole): HoleShape => hole.shape ?? "circle";

const getHoleWidth = (hole: MountingHole): number => hole.width ?? hole.diameter ?? 4;
const getHoleHeight = (hole: MountingHole): number => hole.height ?? hole.diameter ?? 4;

const getHoleStyle = (hole: MountingHole) => {
  const shape = getHoleShape(hole);
  const w = getHoleWidth(hole);
  const h = getHoleHeight(hole);
  const rotation = hole.rotation ?? 0;

  const base = {
    width: toPercent(w, props.element.size.width),
    height: toPercent(h, props.element.size.height),
    left: `calc(${toPercent(hole.x, props.element.size.width)} - ${toPercent(w / 2, props.element.size.width)})`,
    top: `calc(${toPercent(hole.y, props.element.size.height)} - ${toPercent(h / 2, props.element.size.height)})`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  };

  if (shape === "circle") {
    return { ...base, borderRadius: "50%" };
  } else if (shape === "slot") {
    return { ...base, borderRadius: "9999px" };
  } else if (shape === "rect") {
    return { ...base, borderRadius: "0" };
  }
  return base;
};

const isCustomShape = (hole: MountingHole): boolean => getHoleShape(hole) === "custom";

const getCustomPathViewBox = (hole: MountingHole): string => {
  const w = getHoleWidth(hole);
  const h = getHoleHeight(hole);
  return `${-w / 2} ${-h / 2} ${w} ${h}`;
};
</script>

<template>
  <div class="relative h-full w-full">
    <!-- Center shaft circle -->
    <div
      class="absolute rounded-full border-2 border-current opacity-60"
      :style="{
        width: toPercent(shaftDiameter, element.size.width),
        height: toPercent(shaftDiameter, element.size.height),
        left: `calc(50% - ${toPercent(shaftDiameter / 2, element.size.width)})`,
        top: `calc(50% - ${toPercent(shaftDiameter / 2, element.size.height)})`,
      }"
    />

    <!-- Mounting holes - predefined shapes -->
    <template v-for="(hole, index) in mountingHoles" :key="index">
      <div
        v-if="!isCustomShape(hole)"
        class="absolute bg-current opacity-40"
        :style="getHoleStyle(hole)"
      />
      <!-- Custom SVG shape -->
      <svg
        v-else
        class="absolute opacity-40"
        :style="{
          width: toPercent(getHoleWidth(hole), element.size.width),
          height: toPercent(getHoleHeight(hole), element.size.height),
          left: `calc(${toPercent(hole.x, element.size.width)} - ${toPercent(getHoleWidth(hole) / 2, element.size.width)})`,
          top: `calc(${toPercent(hole.y, element.size.height)} - ${toPercent(getHoleHeight(hole) / 2, element.size.height)})`,
          transform: hole.rotation ? `rotate(${hole.rotation}deg)` : undefined,
        }"
        :viewBox="getCustomPathViewBox(hole)"
        preserveAspectRatio="xMidYMid meet"
      >
        <path :d="hole.path" fill="currentColor" />
      </svg>
    </template>

    <!-- Element name -->
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs font-semibold uppercase tracking-[0.08em]">{{
        element.name
      }}</span>
    </div>
  </div>
</template>
