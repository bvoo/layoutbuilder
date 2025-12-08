<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import { Button } from "@/components/ui/button";

const layoutStore = useLayoutStore();
const { selectedElements } = storeToRefs(layoutStore);

const activeElement = computed(() => selectedElements.value[0] ?? null);

const clearRelativeAnchor = () => {
  if (!activeElement.value) return;
  layoutStore.setRelativeAnchor(activeElement.value.id, undefined);
};
</script>

<template>
  <section v-if="activeElement" class="space-y-2">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <p
          class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300"
        >
          Relative Position
        </p>
        <p class="text-xs text-slate-400">
          {{
            activeElement.relativeTo
              ? `Anchored to ${activeElement.relativeTo.targetId}`
              : "Not anchored"
          }}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        :disabled="!activeElement.relativeTo"
        @click="clearRelativeAnchor"
      >
        Clear Anchor
      </Button>
    </div>
    <p class="text-xs text-slate-400">
      Relative anchoring tools will appear here in a future update.
    </p>
  </section>
</template>
