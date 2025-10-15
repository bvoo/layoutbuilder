<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";

const layoutStore = useLayoutStore();
const { selection, isDirty } = storeToRefs(layoutStore);
</script>

<template>
  <Transition
    enter-active-class="duration-200 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-2 opacity-0"
  >
    <div
      v-if="selection.length || isDirty"
      class="flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/10 px-6 py-2 text-sm text-slate-200 text-center shadow-lg backdrop-blur-lg transition-transform"
    >
      <span v-if="selection.length">Selected: {{ selection.length }}</span>
      <span v-if="isDirty">Unsaved changes</span>
    </div>
  </Transition>
</template>
