import type { ControlElement, LayoutPreset, LayoutSettings } from '@/types/layout'

export const defaultCanvas: LayoutPreset['canvas'] = {
  width: 600,
  height: 300,
  gridSize: 10,
  units: 'mm'
}

export const defaultSettings: LayoutSettings = {
  units: 'mm',
  snapToGrid: true,
  gridSize: 10,
  showMeasurements: true
}

export const elementSizePresets: Record<ControlElement['type'], ControlElement['size']> = {
  button: { width: 32, height: 32 },
  lever: { width: 30, height: 80 },
  custom: { width: 30, height: 30 }
}

export const defaultElementSizes = elementSizePresets
