<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import type { ControlElement } from "@/types/layout";

const layoutStore = useLayoutStore();
const { selectedElements } = storeToRefs(layoutStore);

const activeElement = computed(() => selectedElements.value[0] ?? null);

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const getRadiusPercentage = (element: ControlElement | null) => {
  if (!element) return 0;
  const raw = (element.metadata as Record<string, unknown>).radius;
  return typeof raw === "number" ? clampPercentage(raw) : 0;
};

const handleRadiusChange = (value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return;
  const radius = clampPercentage(value);
  layoutStore.updateElement(activeElement.value.id, {
    metadata: {
      ...activeElement.value.metadata,
      radius,
    },
  });
};
</script>

<template>
  <section v-if="activeElement" class="flex flex-col gap-2">
    <label
      class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
      for="component-radius"
      >Corner Radius (%)</label
    >
    <input
      id="component-radius"
      class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
      type="number"
      step="1"
      min="0"
      max="100"
      :value="getRadiusPercentage(activeElement)"
      @input="
        (event) =>
          handleRadiusChange(
            parseFloat((event.target as HTMLInputElement).value)
          )
      "
    />
  </section>
</template>
