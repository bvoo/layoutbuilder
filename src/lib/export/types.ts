import type {
  ControlElement,
  LayoutPreset,
  LayoutSettings,
} from "@/types/layout";

export interface LayoutSnapshot {
  canvas: LayoutPreset["canvas"];
  elements: ControlElement[];
  settings: LayoutSettings;
}

export interface ExportOptions {
  filename?: string;
}

export type ExportFormat = "json" | "svg" | "dxf" | "pdf";

export interface LayoutJsonFile {
  version: number;
  elements: ControlElement[];
  settings: LayoutSettings;
  metadata?: {
    exportedAt?: string;
  };
}

export type LayoutJsonPayload = Pick<LayoutJsonFile, "elements" | "settings">;
