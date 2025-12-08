<script setup lang="ts">
import type { ControlElement } from "@/types/layout";

defineProps<{
  element: ControlElement;
}>();
</script>

<template>
  <div class="flex h-full w-full items-center justify-center">
    <span class="text-xs font-semibold uppercase tracking-[0.08em]">{{
      element.name
    }}</span>
  </div>
</template>
