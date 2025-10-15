import { z } from "zod";
import { downloadBlob } from "./utils";
import type { LayoutSnapshot, LayoutJsonPayload } from "./types";
import { controlElementSchema, layoutSettingsSchema } from "@/types/layout";

const metadataSchema = z
  .object({
    exportedAt: z.string().optional(),
  })
  .optional();

const layoutJsonSchema = z.object({
  version: z.number().optional(),
  elements: z.array(controlElementSchema),
  settings: layoutSettingsSchema,
  metadata: metadataSchema,
});

const cloneDeep = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export const exportJson = (snapshot: LayoutSnapshot, baseName: string) => {
  const payload = {
    version: 1,
    elements: cloneDeep(snapshot.elements),
    settings: cloneDeep(snapshot.settings),
    metadata: { exportedAt: new Date().toISOString() },
  } satisfies Record<string, unknown>;

  const content = JSON.stringify(payload, null, 2);

  downloadBlob(
    `${baseName}.json`,
    new Blob([content], { type: "application/json" }),
  );
};

export const parseLayoutJson = (content: string): LayoutJsonPayload => {
  const raw = JSON.parse(content);
  const parsed = layoutJsonSchema.parse(raw);
  const elements = parsed.elements.map((element) =>
    controlElementSchema.parse(element),
  );
  const settings = layoutSettingsSchema.parse(parsed.settings);
  return { elements, settings } satisfies LayoutJsonPayload;
};

export const readLayoutJsonFile = async (
  file: File,
): Promise<LayoutJsonPayload> => {
  const text = await file.text();
  return parseLayoutJson(text);
};
