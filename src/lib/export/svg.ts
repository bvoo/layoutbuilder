import {
  downloadBlob,
  formatNumber,
  valueToMillimeters,
  getElementRadiusMm,
  getLayoutBounds,
} from "./utils";
import type { LayoutSnapshot } from "./types";

export const exportSvg = (snapshot: LayoutSnapshot, baseName: string) => {
  const units = snapshot.settings.units;
  const bounds = getLayoutBounds(snapshot);
  const widthMm = bounds.maxX - bounds.minX;
  const heightMm = bounds.maxY - bounds.minY;
  const rects = snapshot.elements
    .map((element) => {
      const width = valueToMillimeters(element.size.width, units);
      const height = valueToMillimeters(element.size.height, units);
      const x = valueToMillimeters(element.position.x, units) - bounds.minX;
      const y = valueToMillimeters(element.position.y, units) - bounds.minY;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const radius = formatNumber(getElementRadiusMm(element, units));
      const rotation = formatNumber(element.rotation ?? 0);
      return `<rect x="${formatNumber(x)}" y="${formatNumber(y)}" width="${formatNumber(width)}" height="${formatNumber(height)}" rx="${radius}" ry="${radius}" transform="rotate(${rotation} ${formatNumber(cx)} ${formatNumber(cy)})" fill="none" stroke="#1f2937" stroke-width="0.35" />`;
    })
    .join("\n    ");

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${formatNumber(widthMm)}mm" height="${formatNumber(heightMm)}mm" viewBox="0 0 ${formatNumber(widthMm)} ${formatNumber(heightMm)}">
  <title>Layout Export</title>
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    ${rects}
  </g>
</svg>`;

  downloadBlob(
    `${baseName}.svg`,
    new Blob([content], { type: "image/svg+xml" }),
  );
};
