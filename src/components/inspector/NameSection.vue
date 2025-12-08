<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";

const layoutStore = useLayoutStore();
const { selectedElements } = storeToRefs(layoutStore);

const activeElement = computed(() => selectedElements.value[0] ?? null);

const handleChange = (field: "name" | "mapping", value: string) => {
  if (!activeElement.value) return;
  layoutStore.updateElement(activeElement.value.id, { [field]: value });
};
</script>

<template>
  <section v-if="activeElement" class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label
        class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
        for="component-name"
        >Name</label
      >
      <input
        id="component-name"
        class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
        type="text"
        :value="activeElement.name"
        @input="
          (event) =>
            handleChange('name', (event.target as HTMLInputElement).value)
        "
      />
    </div>

    <div class="flex flex-col gap-2">
      <label
        class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
        for="component-mapping"
        >Mapping</label
      >
      <input
        id="component-mapping"
        class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
        type="text"
        :value="activeElement.mapping"
        @input="
          (event) =>
            handleChange('mapping', (event.target as HTMLInputElement).value)
        "
      />
    </div>
  </section>
</template>
