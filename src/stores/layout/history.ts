import { ref, type Ref } from 'vue'
import type { ControlElement, LayoutPreset, LayoutSettings, ElementCreatePayload } from '@/types/layout'
import { cloneElement } from './elementFactory'

export type LayoutSnapshot = {
  elements: ControlElement[]
  canvas: LayoutPreset['canvas']
  settings: LayoutSettings
  selection: string[]
}

export const HISTORY_LIMIT = 100

interface HistoryDependencies {
  canvas: Ref<LayoutPreset['canvas']>
  settings: Ref<LayoutSettings>
  elements: Ref<ControlElement[]>
  selection: Ref<string[]>
  hoveredElementId: Ref<string | null>
  creationPreset: Ref<ElementCreatePayload | null>
  markDirty: () => void
}

export const createHistoryManager = ({
  canvas,
  settings,
  elements,
  selection,
  hoveredElementId,
  creationPreset,
  markDirty
}: HistoryDependencies) => {
  const history = ref<LayoutSnapshot[]>([])
  const historyIndex = ref(-1)
  const isRestoring = ref(false)

  const captureSnapshot = (): LayoutSnapshot => ({
    elements: elements.value.map((element) => cloneElement(element)),
    canvas: { ...canvas.value },
    settings: { ...settings.value },
    selection: [...selection.value]
  })

  const commitSnapshot = () => {
    if (isRestoring.value) return
    const snapshot = captureSnapshot()
    if (historyIndex.value < history.value.length - 1) {
      history.value.splice(historyIndex.value + 1)
    }
    history.value.push(snapshot)
    if (history.value.length > HISTORY_LIMIT) {
      history.value.shift()
      historyIndex.value = Math.max(historyIndex.value - 1, -1)
    }
    historyIndex.value = history.value.length - 1
  }

  const applySnapshot = (snapshot: LayoutSnapshot) => {
    isRestoring.value = true
    canvas.value = { ...snapshot.canvas }
    settings.value = { ...snapshot.settings }
    elements.value = snapshot.elements.map((element) => cloneElement(element))
    selection.value = [...snapshot.selection]
    hoveredElementId.value = null
    creationPreset.value = null
    isRestoring.value = false
    markDirty()
  }

  const undo = () => {
    if (history.value.length === 0) return
    if (historyIndex.value <= 0) {
      historyIndex.value = 0
    } else {
      historyIndex.value -= 1
    }
    const snapshot = history.value[historyIndex.value]
    if (!snapshot) return
    applySnapshot(snapshot)
  }

  const redo = () => {
    if (history.value.length === 0) return
    if (historyIndex.value >= history.value.length - 1) return
    historyIndex.value += 1
    const snapshot = history.value[historyIndex.value]
    if (!snapshot) return
    applySnapshot(snapshot)
  }

  const resetHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  return {
    history,
    historyIndex,
    isRestoring,
    commitSnapshot,
    undo,
    redo,
    resetHistory,
    captureSnapshot,
    applySnapshot
  }
}
