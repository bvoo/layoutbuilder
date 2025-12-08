<script setup lang="ts">
import type { ControlElement } from "@/types/layout";

defineProps<{
  element: ControlElement;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  unitScale: number;
  translateZToggle: boolean;
}>();

defineEmits<{
  click: [event: MouseEvent];
  mouseenter: [];
  mouseleave: [];
  pointerdown: [event: PointerEvent];
  pointermove: [event: PointerEvent];
  pointerup: [event: PointerEvent];
}>();

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getElementStyle = (
  element: ControlElement,
  scale: number,
  translateZToggle: boolean
) => {
  const toPx = (value: number) => `${value * scale}px`;
  const baseTransform = `translate(${toPx(element.position.x)}, ${toPx(element.position.y)}) rotate(${element.rotation}deg)`;
  const transform = translateZToggle
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
</script>

<template>
  <div
    class="absolute select-none flex items-center justify-center outline-2 outline-white px-4 py-2 text-slate-100"
    :class="{
      'ring-2 ring-primary/40 border-primary/80 bg-primary/30': isSelected,
      'bg-primary/20': isHovered && !isSelected,
      'opacity-25': element.metadata.hidden,
      'transition-all duration-150': !isDragging,
    }"
    :style="getElementStyle(element, unitScale, translateZToggle)"
    data-element
    role="button"
    tabindex="0"
    @click="(e) => $emit('click', e)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @pointerdown="(e) => $emit('pointerdown', e)"
    @pointermove="(e) => $emit('pointermove', e)"
    @pointerup="(e) => $emit('pointerup', e)"
  >
    <slot>
      <span class="text-xs font-semibold uppercase tracking-[0.08em]">{{
        element.name
      }}</span>
    </slot>
  </div>
</template>
