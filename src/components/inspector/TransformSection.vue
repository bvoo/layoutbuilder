<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";

const layoutStore = useLayoutStore();
const { selectedElements } = storeToRefs(layoutStore);

const activeElement = computed(() => selectedElements.value[0] ?? null);

const handlePositionChange = (axis: "x" | "y", value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return;
  layoutStore.updateElement(activeElement.value.id, {
    position: {
      ...activeElement.value.position,
      [axis]: value,
    },
  });
};

const handleSizeChange = (axis: "width" | "height", value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return;
  layoutStore.updateElement(activeElement.value.id, {
    size: {
      ...activeElement.value.size,
      [axis]: value,
    },
  });
};

const handleRotationChange = (value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return;
  layoutStore.updateElement(activeElement.value.id, { rotation: value });
};
</script>

<template>
  <section v-if="activeElement" class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-2">
        <label
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
          for="component-position-x"
          >Position X</label
        >
        <input
          id="component-position-x"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          :value="activeElement.position.x"
          @input="
            (event) =>
              handlePositionChange(
                'x',
                parseFloat((event.target as HTMLInputElement).value)
              )
          "
        />
      </div>
      <div class="flex flex-col gap-2">
        <label
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
          for="component-position-y"
          >Position Y</label
        >
        <input
          id="component-position-y"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          :value="activeElement.position.y"
          @input="
            (event) =>
              handlePositionChange(
                'y',
                parseFloat((event.target as HTMLInputElement).value)
              )
          "
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-2">
        <label
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
          for="component-width"
          >Width</label
        >
        <input
          id="component-width"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          min="0"
          :value="activeElement.size.width"
          @input="
            (event) =>
              handleSizeChange(
                'width',
                parseFloat((event.target as HTMLInputElement).value)
              )
          "
        />
      </div>
      <div class="flex flex-col gap-2">
        <label
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
          for="component-height"
          >Height</label
        >
        <input
          id="component-height"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          min="0"
          :value="activeElement.size.height"
          @input="
            (event) =>
              handleSizeChange(
                'height',
                parseFloat((event.target as HTMLInputElement).value)
              )
          "
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label
        class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
        for="component-rotation"
        >Rotation</label
      >
      <input
        id="component-rotation"
        class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
        type="number"
        step="1"
        :value="activeElement.rotation"
        @input="
          (event) =>
            handleRotationChange(
              parseFloat((event.target as HTMLInputElement).value)
            )
        "
      />
    </div>
  </section>
</template>
