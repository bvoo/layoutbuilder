import type {
  LayoutSnapshot,
  ExportFormat,
  ExportOptions,
  LayoutJsonPayload,
} from "./types";
import { sanitizeFilename } from "./utils";
import { exportJson, readLayoutJsonFile, parseLayoutJson } from "./json";
import { exportSvg } from "./svg";
import { exportDxf } from "./dxf";
import { exportPdf } from "./pdf";

export const exportLayout = async (
  format: ExportFormat,
  snapshot: LayoutSnapshot,
  options: ExportOptions = {},
) => {
  const baseName = options.filename
    ? sanitizeFilename(options.filename)
    : "layout";

  switch (format) {
    case "json":
      exportJson(snapshot, baseName);
      return;
    case "svg":
      exportSvg(snapshot, baseName);
      return;
    case "dxf":
      exportDxf(snapshot, baseName);
      return;
    case "pdf":
      await exportPdf(snapshot, baseName);
      return;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

export { readLayoutJsonFile, parseLayoutJson };
export type { LayoutSnapshot, ExportFormat, ExportOptions, LayoutJsonPayload };
