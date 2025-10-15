<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/stores/layoutStore'
import type { ControlElement } from '@/types/layout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const layoutStore = useLayoutStore()
const { selectedElements } = storeToRefs(layoutStore)

const activeElement = computed<ControlElement | null>(() => selectedElements.value[0] ?? null)
const hasMultipleSelection = computed(() => selectedElements.value.length > 1)

const handleStringChange = (field: 'name' | 'mapping' | 'variant', value: string) => {
  if (!activeElement.value) return
  layoutStore.updateElement(activeElement.value.id, { [field]: value })
}

const handleNumberChange = (field: 'rotation', value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return
  layoutStore.updateElement(activeElement.value.id, { [field]: value })
}

const handlePositionChange = (axis: 'x' | 'y', value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return
  layoutStore.updateElement(activeElement.value.id, {
    position: {
      ...activeElement.value.position,
      [axis]: value
    }
  })
}

const handleSizeChange = (axis: 'width' | 'height', value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return
  layoutStore.updateElement(activeElement.value.id, {
    size: {
      ...activeElement.value.size,
      [axis]: value
    }
  })
}

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value))

const getRadiusPercentage = (element: ControlElement | null) => {
  if (!element) return 0
  const raw = (element.metadata as Record<string, unknown>).radius
  return typeof raw === 'number' ? clampPercentage(raw) : 0
}

const handleRadiusChange = (value: number) => {
  if (!activeElement.value || Number.isNaN(value)) return
  const radius = clampPercentage(value)
  layoutStore.updateElement(activeElement.value.id, {
    metadata: {
      ...activeElement.value.metadata,
      radius
    }
  })
}

const clearRelativeAnchor = () => {
  if (!activeElement.value) return
  layoutStore.setRelativeAnchor(activeElement.value.id, undefined)
}
</script>

<template>
  <div class="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg backdrop-blur-xl">
    <header class="space-y-1">
      <h2 class="text-lg font-semibold uppercase tracking-[0.15em] text-slate-100">Inspector</h2>
      <p v-if="!activeElement" class="text-xs text-slate-300">Select a component to edit its properties.</p>
      <p v-else class="text-xs text-slate-300">
        Editing <strong class="font-semibold text-slate-100">{{ activeElement.name }}</strong>
        <span v-if="hasMultipleSelection"> (+{{ selectedElements.length - 1 }} more)</span>
      </p>
    </header>

    <div v-if="activeElement" class="flex flex-col gap-4">
      <section class="flex flex-col gap-2">
        <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-name">Name</label>
        <input
          id="component-name"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="text"
          :value="activeElement.name"
          @input="(event) => handleStringChange('name', (event.target as HTMLInputElement).value)"
        />
      </section>

      <section class="flex flex-col gap-2">
        <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-mapping">Mapping</label>
        <input
          id="component-mapping"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="text"
          :value="activeElement.mapping"
          @input="(event) => handleStringChange('mapping', (event.target as HTMLInputElement).value)"
        />
      </section>

      <Separator class="bg-white/10" />

      <section class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-position-x">Position X</label>
          <input
            id="component-position-x"
            class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="number"
            step="1"
            :value="activeElement.position.x"
            @input="(event) => handlePositionChange('x', parseFloat((event.target as HTMLInputElement).value))"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-position-y">Position Y</label>
          <input
            id="component-position-y"
            class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="number"
            step="1"
            :value="activeElement.position.y"
            @input="(event) => handlePositionChange('y', parseFloat((event.target as HTMLInputElement).value))"
          />
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-width">Width</label>
          <input
            id="component-width"
            class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="number"
            step="1"
            min="0"
            :value="activeElement.size.width"
            @input="(event) => handleSizeChange('width', parseFloat((event.target as HTMLInputElement).value))"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-height">Height</label>
          <input
            id="component-height"
            class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="number"
            step="1"
            min="0"
            :value="activeElement.size.height"
            @input="(event) => handleSizeChange('height', parseFloat((event.target as HTMLInputElement).value))"
          />
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-radius">Corner Radius (%)</label>
        <input
          id="component-radius"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          min="0"
          max="100"
          :value="getRadiusPercentage(activeElement)"
          @input="(event) => handleRadiusChange(parseFloat((event.target as HTMLInputElement).value))"
        />
      </section>

      <section class="flex flex-col gap-2">
        <label class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300" for="component-rotation">Rotation</label>
        <input
          id="component-rotation"
          class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          type="number"
          step="1"
          :value="activeElement.rotation"
          @input="(event) => handleNumberChange('rotation', parseFloat((event.target as HTMLInputElement).value))"
        />
      </section>

      <Separator class="bg-white/10" />

      <section class="space-y-2">
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-300">Relative Position</p>
            <p class="text-xs text-slate-400">
              {{ activeElement.relativeTo ? `Anchored to ${activeElement.relativeTo.targetId}` : 'Not anchored' }}
            </p>
          </div>
          <Button variant="ghost" size="sm" :disabled="!activeElement.relativeTo" @click="clearRelativeAnchor">
            Clear Anchor
          </Button>
        </div>
        <p class="text-xs text-slate-400">Relative anchoring tools will appear here in a future update.</p>
      </section>
    </div>

    <div v-else class="mt-6 flex flex-col gap-2 text-sm text-slate-300">
      <p>No component selected.</p>
      <p>Select a component on the canvas to view and edit its properties.</p>
    </div>
  </div>
</template>
