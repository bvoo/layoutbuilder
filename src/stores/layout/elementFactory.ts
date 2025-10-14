import { nanoid } from 'nanoid'
import { controlElementSchema, type ControlElement, type ElementCreatePayload } from '@/types/layout'
import { defaultElementSizes } from './defaults'

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const createElement = (payload: ElementCreatePayload = {}): ControlElement => {
  const type: ControlElement['type'] = payload.type ?? 'button'
  const size: ControlElement['size'] =
    payload.size ?? defaultElementSizes[type] ?? defaultElementSizes.button

  const base: ControlElement = {
    id: nanoid(),
    name: payload.name ?? 'New Element',
    mapping: payload.mapping ?? '',
    type,
    variant: payload.variant ?? 'standard',
    shape: payload.shape ?? (type === 'lever' ? 'rectangle' : 'circle'),
    size,
    position: payload.position ?? { x: 0, y: 0 },
    rotation: payload.rotation ?? 0,
    relativeTo: payload.relativeTo,
    metadata: payload.metadata ?? {}
  }

  return controlElementSchema.parse(base)
}

export const cloneElement = (element: ControlElement): ControlElement =>
  controlElementSchema.parse({
    ...element,
    id: element.id
  })

export const buildElementName = (type: ControlElement['type'], occurrences: number) =>
  `${capitalize(type)} ${occurrences}`
