<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AcceptableValue } from "reka-ui";
import {
  getComponentToolIds,
  getDefaultPresetId,
  getOptionsForTool,
  type ComponentPresetOption,
} from "@/component-library";

const layoutStore = useLayoutStore();
const { activeTool } = storeToRefs(layoutStore);

const componentTools = computed(() => getComponentToolIds());

const optionsForTool = computed<ComponentPresetOption[]>(() => {
  if (!activeTool.value) return [];
  return getOptionsForTool(activeTool.value);
});

const activeSelection = ref<string | null>(null);

const isComponentDropperActive = computed(() =>
  componentTools.value.includes(activeTool.value as string),
);

const queuePreset = (presetId: string) => {
  const option = optionsForTool.value.find((item) => item.id === presetId);
  if (!option) return;
  activeSelection.value = presetId;
  layoutStore.queueElementCreation({ ...option.payload });
};

watch(
  activeTool,
  (tool) => {
    if (!componentTools.value.includes(tool as string)) {
      activeSelection.value = null;
      return;
    }
    const defaultId = getDefaultPresetId(tool as string);
    if (defaultId) {
      queuePreset(defaultId);
    }
  },
  { immediate: true },
);

const handlePresetChange = (value: AcceptableValue) => {
  if (typeof value !== "string") return;
  queuePreset(value);
};
</script>

<template>
  <div
    v-if="isComponentDropperActive"
    class="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-xs uppercase tracking-[0.12em] text-slate-200 shadow-lg backdrop-blur-xl"
  >
    <span class="mr-3 text-slate-300">Component Preset</span>
    <Select
      :model-value="activeSelection"
      placeholder="Select preset"
      @update:model-value="handlePresetChange"
    >
      <SelectTrigger
        size="sm"
        class="w-60 text-left normal-case tracking-normal"
      >
        <SelectValue placeholder="Select preset" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in optionsForTool"
          :key="option.id"
          :value="option.id"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
