import { nanoid } from "nanoid";
import {
  controlElementSchema,
  type ControlElement,
  type ElementCreatePayload,
} from "@/types/layout";
import { defaultElementSizes } from "./defaults";

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

const defaultRadiusByType: Record<ControlElement["type"], number> = {
  button: 100,
  lever: 12,
  custom: 0,
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const createElement = (
  payload: ElementCreatePayload = {},
): ControlElement => {
  const type: ControlElement["type"] = payload.type ?? "button";
  const size: ControlElement["size"] =
    payload.size ?? defaultElementSizes[type] ?? defaultElementSizes.button;
  const metadata: Record<string, unknown> = payload.metadata
    ? { ...payload.metadata }
    : {};
  const rawRadius = metadata.radius;
  const radius =
    typeof rawRadius === "number"
      ? clampPercentage(rawRadius)
      : defaultRadiusByType[type];
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
  type: ControlElement["type"],
  occurrences: number,
) => `${capitalize(type)} ${occurrences}`;
