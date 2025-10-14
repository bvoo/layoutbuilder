import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  layoutPresetSchema,
  layoutSettingsSchema,
  controlElementSchema,
  type ControlElement,
  type LayoutPreset,
  type LayoutSettings,
  type ElementCreatePayload,
  type UpdateElementPayload
} from '@/types/layout'
import { defaultCanvas, defaultSettings, defaultElementSizes } from './layout/defaults'
import { createElement, cloneElement, buildElementName } from './layout/elementFactory'
import { createHistoryManager } from './layout/history'

export type ActiveTool = 'select' | 'button' | 'lever' | 'measure' | 'pan' | 'erase' | string

export { elementSizePresets } from './layout/defaults'

export const useLayoutStore = defineStore('layout', () => {
  const canvas = ref<LayoutPreset['canvas']>({ ...defaultCanvas })
  const elements = ref<ControlElement[]>([])
  const presets = ref<LayoutPreset[]>([])
  const activePresetId = ref<string | null>(null)
  const settings = ref<LayoutSettings>({ ...defaultSettings })
  const selection = ref<string[]>([])
  const hoveredElementId = ref<string | null>(null)
  const activeTool = ref<ActiveTool>('select')
  const isDirty = ref(false)
  const creationPreset = ref<ElementCreatePayload | null>(null)
  const historyManager = createHistoryManager({
    canvas,
    settings,
    elements,
    selection,
    hoveredElementId,
    creationPreset,
    markDirty: () => {
      isDirty.value = true
    }
  })
  const {
    commitSnapshot: commitHistorySnapshot,
    undo: undoHistory,
    redo: redoHistory
  } = historyManager

  commitHistorySnapshot()

  const selectedElements = computed(() =>
    elements.value.filter((element) => selection.value.includes(element.id))
  )

  const activePreset = computed(() =>
    presets.value.find((preset) => preset.id === activePresetId.value) ?? null
  )

  const validateAndSetPresets = (nextPresets: LayoutPreset[]) => {
    presets.value = nextPresets.map((preset) => layoutPresetSchema.parse(preset))
  }

  const setCanvas = (nextCanvas: LayoutPreset['canvas']) => {
    canvas.value = layoutPresetSchema.shape.canvas.parse(nextCanvas)
    settings.value.units = canvas.value.units
    settings.value.gridSize = canvas.value.gridSize
    markDirty()
    commitHistorySnapshot()
  }

  const setSettings = (nextSettings: LayoutSettings) => {
    settings.value = layoutSettingsSchema.parse(nextSettings)
    markDirty()
    commitHistorySnapshot()
  }

  const addElement = (payload: ElementCreatePayload = {}) => {
    const type: ControlElement['type'] = payload.type ?? 'button'
    const size: ControlElement['size'] =
      payload.size ?? defaultElementSizes[type] ?? defaultElementSizes.button
    const position = payload.position ?? {
      x: Math.max(0, (canvas.value.width - size.width) / 2),
      y: Math.max(0, (canvas.value.height - size.height) / 2)
    }
    const occurrences = elements.value.filter((element) => element.type === type).length + 1
    const name = payload.name ?? buildElementName(type, occurrences)

    const element = createElement({
      ...payload,
      type,
      size,
      position,
      name
    })
    elements.value.push(element)
    selection.value = [element.id]
    markDirty()
    commitHistorySnapshot()
    return element
  }

  const updateElement = (id: string, payload: UpdateElementPayload, options: { skipHistory?: boolean } = {}) => {
    const index = elements.value.findIndex((element) => element.id === id)
    if (index === -1) return

    const updated = controlElementSchema.parse({
      ...elements.value[index],
      ...payload,
      id
    })
    elements.value.splice(index, 1, updated)
    markDirty()
    if (!options.skipHistory) {
      commitHistorySnapshot()
    }
  }

  const removeElements = (ids: string[]) => {
    if (!ids.length) return
    elements.value = elements.value.filter((element) => !ids.includes(element.id))
    selection.value = selection.value.filter((id) => !ids.includes(id))
    markDirty()
    commitHistorySnapshot()
  }

  const reorderElements = (orderedIds: string[]) => {
    if (orderedIds.length !== elements.value.length) return
    const map = new Map(elements.value.map((element) => [element.id, element] as const))
    const reordered: ControlElement[] = []
    for (const id of orderedIds) {
      const element = map.get(id)
      if (!element) return
      reordered.push(cloneElement(element))
    }
    elements.value = reordered
    markDirty()
    commitHistorySnapshot()
  }

  const setSelection = (ids: string[]) => {
    selection.value = [...new Set(ids)]
  }

  const selectElement = (id: string) => {
    if (!selection.value.includes(id)) {
      selection.value = [id]
    }
  }

  const toggleElementInSelection = (id: string) => {
    if (selection.value.includes(id)) {
      selection.value = selection.value.filter((selectedId) => selectedId !== id)
    } else {
      selection.value = [...selection.value, id]
    }
  }

  const clearSelection = () => {
    selection.value = []
  }

  const setHoveredElement = (id: string | null) => {
    hoveredElementId.value = id
  }

  const componentDropperTools: ActiveTool[] = ['button', 'lever']

  const setActiveTool = (tool: ActiveTool) => {
    activeTool.value = tool
    if (!componentDropperTools.includes(tool)) {
      creationPreset.value = null
    }
  }

  const queueElementCreation = (payload: ElementCreatePayload | null) => {
    creationPreset.value = payload
  }

  const loadPreset = (preset: LayoutPreset) => {
    const parsed = layoutPresetSchema.parse(preset)
    activePresetId.value = parsed.id
    canvas.value = { ...parsed.canvas }
    settings.value.units = parsed.canvas.units
    settings.value.gridSize = parsed.canvas.gridSize
    elements.value = parsed.elements.map((element) => cloneElement(element))
    selection.value = []
    markClean()
    commitHistorySnapshot()
  }

  const addPreset = (preset: LayoutPreset) => {
    const parsed = layoutPresetSchema.parse(preset)
    presets.value.push(parsed)
  }

  const updatePreset = (preset: LayoutPreset) => {
    const parsed = layoutPresetSchema.parse(preset)
    const index = presets.value.findIndex((existing) => existing.id === parsed.id)
    if (index === -1) {
      presets.value.push(parsed)
    } else {
      presets.value.splice(index, 1, parsed)
    }
    commitHistorySnapshot()
  }

  const markDirty = () => {
    isDirty.value = true
  }

  const markClean = () => {
    isDirty.value = false
  }

  const resetLayout = () => {
    elements.value = []
    selection.value = []
    canvas.value = { ...defaultCanvas }
    settings.value = { ...defaultSettings }
    activePresetId.value = null
    markClean()
    commitHistorySnapshot()
  }

  const setRelativeAnchor = (
    id: string,
    anchor: ControlElement['relativeTo'] | undefined
  ) => {
    updateElement(id, { relativeTo: anchor })
  }

  return {
    // state
    canvas,
    elements,
    presets,
    activePresetId,
    settings,
    selection,
    hoveredElementId,
    activeTool,
    isDirty,
    creationPreset,
    // getters
    selectedElements,
    activePreset,
    // actions
    validateAndSetPresets,
    setCanvas,
    setSettings,
    addElement,
    updateElement,
    removeElements,
    reorderElements,
    setSelection,
    selectElement,
    toggleElementInSelection,
    clearSelection,
    setHoveredElement,
    setActiveTool,
    queueElementCreation,
    loadPreset,
    addPreset,
    updatePreset,
    markDirty,
    markClean,
    resetLayout,
    undo: undoHistory,
    redo: redoHistory,
    setRelativeAnchor
  }
})
