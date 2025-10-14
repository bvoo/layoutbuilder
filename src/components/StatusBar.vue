<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/stores/layoutStore'

const layoutStore = useLayoutStore()
const { selection, isDirty } = storeToRefs(layoutStore)
</script>

<template>
  <div class="flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/10 px-6 py-2 text-sm text-slate-200 text-center shadow-lg backdrop-blur-lg">
    <span v-if="selection.length">Selected: {{ selection.length }}</span>
    <span v-if="isDirty">Unsaved changes</span>
  </div>
</template>
