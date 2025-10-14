import type { ElementCreatePayload } from '@/types/layout'

export type ComponentToolId = string

export interface ComponentPresetOption {
  id: string
  label: string
  payload: ElementCreatePayload
}

export interface ComponentPresetCollection {
  tool: ComponentToolId
  options: ComponentPresetOption[]
  defaultSelection?: ComponentPresetOption['id']
}
