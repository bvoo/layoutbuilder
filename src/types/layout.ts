import { z } from "zod";

export const controlElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  mapping: z.string(),
  type: z.string(),
  variant: z.string(),
  size: z.object({
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  rotation: z.number(),
  relativeTo: z
    .object({
      targetId: z.string(),
      offset: z.object({
        x: z.number(),
        y: z.number(),
      }),
      inheritRotation: z.boolean(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()),
});

export type ControlElement = z.infer<typeof controlElementSchema>;

export const layoutPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  canvas: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    gridSize: z.number().positive(),
    units: z.enum(["mm", "in"]),
  }),
  elements: z.array(controlElementSchema),
});

export type LayoutPreset = z.infer<typeof layoutPresetSchema>;

export const layoutSettingsSchema = z.object({
  units: z.enum(["mm", "in"]),
  snapToGrid: z.boolean(),
  gridSize: z.number().positive(),
  showMeasurements: z.boolean(),
});

export type LayoutSettings = z.infer<typeof layoutSettingsSchema>;

export type ElementCreatePayload = {
  name?: string;
  mapping?: string;
  type?: ControlElement["type"];
  variant?: string;
  size?: ControlElement["size"];
  position?: ControlElement["position"];
  rotation?: number;
  relativeTo?: ControlElement["relativeTo"];
  metadata?: ControlElement["metadata"];
};

export type UpdateElementPayload = Partial<Omit<ControlElement, "id">>;
