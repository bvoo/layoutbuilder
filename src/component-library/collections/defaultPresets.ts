import type { ComponentPresetCollection } from '../types'
import { elementSizePresets } from '@/stores/layoutStore'

export const defaultPresetCollections: ComponentPresetCollection[] = [
  {
    tool: 'button',
    defaultSelection: 'sanwa-30',
    options: [
      {
        id: 'sanwa-24',
        label: 'Sanwa 24mm • Circle',
        payload: {
          type: 'button',
          name: 'Sanwa 24mm',
          shape: 'circle',
          size: { width: 24, height: 24 },
          metadata: { diameter: 24, brand: 'Sanwa', model: 'OBSF-24' }
        }
      },
      {
        id: 'sanwa-30',
        label: 'Sanwa 30mm • Circle',
        payload: {
          type: 'button',
          name: 'Sanwa 30mm',
          shape: 'circle',
          size: { width: 30, height: 30 },
          metadata: { diameter: 30, brand: 'Sanwa', model: 'OBSF-30' }
        }
      },
      {
        id: 'kailh-choc',
        label: 'Kailh Choc • 14×14mm',
        payload: {
          type: 'button',
          name: 'Kailh Choc',
          shape: 'square',
          size: { width: 14, height: 14 },
          metadata: { brand: 'Kailh', model: 'Choc V2', footprint: '14×14mm' }
        }
      }
    ]
  },
  {
    tool: 'lever',
    defaultSelection: 'lever-standard',
    options: [
      {
        id: 'lever-standard',
        label: 'Lever • 30×80mm',
        payload: {
          type: 'lever',
          shape: 'rectangle',
          size: elementSizePresets.lever
        }
      }
    ]
  }
]
