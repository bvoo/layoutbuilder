<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "./stores/layoutStore";
import ToolbarOverlay from "./components/ToolbarOverlay.vue";
import ComponentPresetOverlay from "./components/ComponentPresetOverlay.vue";
import MeasureSettingsPanel from "./components/canvas/MeasureSettingsPanel.vue";
import LayerSidebar from "./components/LayerSidebar.vue";
import LayoutCanvas from "./components/LayoutCanvas.vue";
import ElementInspector from "./components/ElementInspector.vue";
import StatusBar from "./components/StatusBar.vue";

const layoutStore = useLayoutStore();
const { activeTool } = storeToRefs(layoutStore);

const isMeasureToolActive = computed(() => activeTool.value === "measure");
</script>

<template>
  <div
    class="pointer-events-none absolute top-6 z-20 flex w-full justify-center"
  >
    <StatusBar />
  </div>

  <div class="relative h-full w-full text-slate-100">
    <LayoutCanvas />
  </div>

  <div
    class="pointer-events-auto absolute left-1/2 bottom-28 z-20 flex -translate-x-1/2"
  >
    <ComponentPresetOverlay />
    <MeasureSettingsPanel v-if="isMeasureToolActive" />
  </div>

  <div
    class="pointer-events-auto absolute left-1/2 bottom-8 z-20 flex -translate-x-1/2 px-3"
  >
    <ToolbarOverlay />
  </div>

  <div
    class="pointer-events-auto absolute left-6 top-6 z-20 hidden w-80 lg:block"
  >
    <LayerSidebar />
  </div>

  <div
    class="pointer-events-auto absolute right-6 top-6 z-20 hidden w-80 lg:block"
  >
    <ElementInspector />
  </div>
</template>

