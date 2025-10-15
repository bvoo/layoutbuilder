import { PDFDocument, rgb } from "pdf-lib";
import {
  POINTS_PER_MM,
  downloadBlob,
  getRoundedPolygonMm,
  getLayoutBounds,
} from "./utils";
import type { LayoutSnapshot } from "./types";

export const exportPdf = async (snapshot: LayoutSnapshot, baseName: string) => {
  const doc = await PDFDocument.create();
  const units = snapshot.settings.units;
  const bounds = getLayoutBounds(snapshot);
  const pageWidthMm = bounds.maxX - bounds.minX;
  const pageHeightMm = bounds.maxY - bounds.minY;
  const marginMm = Math.max(pageWidthMm, pageHeightMm) * 0.05;
  const canvasWidthPt = pageWidthMm * POINTS_PER_MM;
  const canvasHeightPt = pageHeightMm * POINTS_PER_MM;
  const pageWidthPt = canvasWidthPt + marginMm * 2 * POINTS_PER_MM;
  const pageHeightPt = canvasHeightPt + marginMm * 2 * POINTS_PER_MM;

  const page = doc.addPage([pageWidthPt, pageHeightPt]);

  const translateX = marginMm * POINTS_PER_MM;
  const translateY = marginMm * POINTS_PER_MM;

  snapshot.elements.forEach((element) => {
    const polygon = getRoundedPolygonMm(element, units);
    if (polygon.length < 2) {
      return;
    }
    for (let index = 0; index < polygon.length; index += 1) {
      const current = polygon[index]!;
      const next = polygon[(index + 1) % polygon.length]!;
      const start = {
        x: (current.x - bounds.minX) * POINTS_PER_MM + translateX,
        y:
          page.getHeight() -
          ((current.y - bounds.minY) * POINTS_PER_MM + translateY),
      };
      const end = {
        x: (next.x - bounds.minX) * POINTS_PER_MM + translateX,
        y:
          page.getHeight() -
          ((next.y - bounds.minY) * POINTS_PER_MM + translateY),
      };
      page.drawLine({
        start,
        end,
        thickness: 1,
        color: rgb(0.13, 0.16, 0.22),
      });
    }
  });

  const pdfBytes = await doc.save();
  const arrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  downloadBlob(
    `${baseName}.pdf`,
    new Blob([arrayBuffer as BlobPart], { type: "application/pdf" }),
  );
};
