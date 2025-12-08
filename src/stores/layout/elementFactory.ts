import { nanoid } from "nanoid";
import { controlElementSchema, type ControlElement, type ElementCreatePayload } from "@/types/layout";
import { getDefaultSize, getDefaultRadius } from "@/plugins/elementRegistry";
import { defaultElementSizes } from "./defaults";

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Create a new element with the given payload.
 * Uses the element registry for defaults when available.
 */
export const createElement = (
  payload: ElementCreatePayload = {}
): ControlElement => {
  const type = payload.type ?? "button";
  
  const registrySize = getDefaultSize(type);
  const fallbackSize = defaultElementSizes[type as keyof typeof defaultElementSizes];
  const size: ControlElement["size"] =
    payload.size ?? registrySize ?? fallbackSize ?? { width: 30, height: 30 };
  
  const metadata: Record<string, unknown> = payload.metadata
    ? { ...payload.metadata }
    : {};
  
  const rawRadius = metadata.radius;
  const registryRadius = getDefaultRadius(type);
  const radius =
    typeof rawRadius === "number"
      ? clampPercentage(rawRadius)
      : registryRadius ?? 0;
  metadata.radius = radius;

  const base: ControlElement = {
    id: nanoid(),
    name: payload.name ?? "New Element",
    mapping: payload.mapping ?? "",
    type,
    variant: payload.variant ?? "standard",
    size,
    position: payload.position ?? { x: 0, y: 0 },
    rotation: payload.rotation ?? 0,
    relativeTo: payload.relativeTo,
    metadata,
  };

  return controlElementSchema.parse(base);
};

export const cloneElement = (element: ControlElement): ControlElement =>
  controlElementSchema.parse({
    ...element,
    id: element.id,
  });

export const buildElementName = (
  type: string,
  occurrences: number
) => `${capitalize(type)} ${occurrences}`;
