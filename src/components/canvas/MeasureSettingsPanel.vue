<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  measureSettings,
  measurements,
  clearAllMeasurements,
} from "@/plugins/tools/measureTool";
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-100 shadow-lg backdrop-blur-xl"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
        Measure Settings
      </h3>
      <span class="text-xs text-slate-400">
        {{ measurements.length }} measurement{{ measurements.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <Separator class="bg-white/10" />

    <label
      for="persistent-measures"
      class="flex items-center gap-2.5 cursor-pointer select-none"
    >
      <Checkbox
        id="persistent-measures"
        class="shrink-0 aspect-square border-white/20 size-4"
        :model-value="measureSettings.persistent"
        @update:model-value="(v) => measureSettings.persistent = v === true"
      />
      <div class="flex flex-col">
        <span class="text-sm text-slate-100">Persistent</span>
        <span class="text-xs text-slate-400">Keep measurements when switching tools</span>
      </div>
    </label>

    <label
      for="multiple-measures"
      class="flex items-center gap-2.5 cursor-pointer select-none"
    >
      <Checkbox
        id="multiple-measures"
        class="shrink-0 aspect-square border-white/20 size-4"
        :model-value="measureSettings.showMultiple"
        @update:model-value="(v) => measureSettings.showMultiple = v === true"
      />
      <div class="flex flex-col">
        <span class="text-sm text-slate-100">Multiple</span>
        <span class="text-xs text-slate-400">Allow multiple measurements</span>
      </div>
    </label>

    <label
      for="snap-to-edges"
      class="flex items-center gap-2.5 cursor-pointer select-none"
    >
      <Checkbox
        id="snap-to-edges"
        class="shrink-0 aspect-square border-white/20 size-4"
        :model-value="measureSettings.snapToEdges"
        @update:model-value="(v) => measureSettings.snapToEdges = v === true"
      />
      <div class="flex flex-col">
        <span class="text-sm text-slate-100">Snap to Edges</span>
        <span class="text-xs text-slate-400">Snap to element corners, edges, and centers</span>
      </div>
    </label>

    <Separator class="bg-white/10" />

    <Button
      variant="ghost"
      size="sm"
      class="w-full text-slate-300 hover:text-slate-100"
      :disabled="measurements.length === 0"
      @click="clearAllMeasurements"
    >
      Clear All Measurements
    </Button>
  </div>
</template>
