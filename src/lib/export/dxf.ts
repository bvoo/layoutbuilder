import {
  downloadBlob,
  formatNumber,
  getRoundedPolygonMm,
  getLayoutBounds,
} from "./utils";
import type { LayoutSnapshot } from "./types";

export const exportDxf = (snapshot: LayoutSnapshot, baseName: string) => {
  const units = snapshot.settings.units;
  const bounds = getLayoutBounds(snapshot, {
    segmentsPerCorner: 6,
    flipY: true,
  });
  const widthMm = bounds.maxX - bounds.minX;
  const heightMm = bounds.maxY - bounds.minY;
  const hasContent = widthMm > 0 && heightMm > 0;
  const lines: string[] = [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "9",
    "$ACADVER",
    "1",
    "AC1018",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "ENTITIES",
  ];

  if (hasContent) {
    snapshot.elements.forEach((element) => {
      const polygon = getRoundedPolygonMm(element, units, {
        segmentsPerCorner: 6,
        flipY: true,
      });
      if (polygon.length < 2) {
        return;
      }
      lines.push(
        "0",
        "LWPOLYLINE",
        "8",
        "0",
        "90",
        polygon.length.toString(),
        "70",
        "1",
      );
      polygon.forEach((point) => {
        const x = point.x - bounds.minX;
        const y = point.y - bounds.minY;
        lines.push("10", formatNumber(x).toString());
        lines.push("20", formatNumber(y).toString());
      });
    });
  }

  lines.push("0", "ENDSEC", "0", "EOF");
  downloadBlob(
    `${baseName}.dxf`,
    new Blob([lines.join("\n")], { type: "image/vnd.dxf" }),
  );
};
