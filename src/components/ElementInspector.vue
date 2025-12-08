<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import { getSectionsForElement } from "@/plugins";
import type { ControlElement } from "@/types/layout";
import { Separator } from "@/components/ui/separator";

const layoutStore = useLayoutStore();
const { selectedElements } = storeToRefs(layoutStore);

const activeElement = computed<ControlElement | null>(
  () => selectedElements.value[0] ?? null
);
const hasMultipleSelection = computed(() => selectedElements.value.length > 1);

/**
 * Get the inspector sections that should be shown for the active element.
 */
const visibleSections = computed(() => {
  if (!activeElement.value) return [];
  return getSectionsForElement(activeElement.value);
});
</script>

<template>
  <div
    class="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg backdrop-blur-xl"
  >
    <header class="space-y-1">
      <h2
        class="text-lg font-semibold uppercase tracking-[0.15em] text-slate-100"
      >
        Inspector
      </h2>
      <p v-if="!activeElement" class="text-xs text-slate-300">
        Select a component to edit its properties.
      </p>
      <p v-else class="text-xs text-slate-300">
        Editing
        <strong class="font-semibold text-slate-100">{{
          activeElement.name
        }}</strong>
        <span v-if="hasMultipleSelection">
          (+{{ selectedElements.length - 1 }} more)</span
        >
      </p>
    </header>

    <div v-if="activeElement" class="flex flex-col gap-4">
      <template v-for="(section, index) in visibleSections" :key="section.id">
        <component :is="section.component" />
        <Separator
          v-if="index < visibleSections.length - 1"
          class="bg-white/10"
        />
      </template>
    </div>

    <div v-else class="mt-6 flex flex-col gap-2 text-sm text-slate-300">
      <p>No component selected.</p>
      <p>Select a component on the canvas to view and edit its properties.</p>
    </div>
  </div>
</template>
