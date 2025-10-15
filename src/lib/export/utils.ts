import type { ControlElement, LayoutSettings } from "@/types/layout";
import type { LayoutSnapshot } from "./types";

export const MM_PER_INCH = 25.4;
export const POINTS_PER_MM = 72 / MM_PER_INCH;

export const clampPercentage = (value: number) =>
  Math.min(100, Math.max(0, value));

export const downloadBlob = (filename: string, blob: Blob) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatNumber = (value: number) =>
  Number.parseFloat(value.toFixed(4));

export const valueToMillimeters = (
  value: number,
  units: LayoutSettings["units"],
) => (units === "in" ? value * MM_PER_INCH : value);

export const getElementRadiusMm = (
  element: ControlElement,
  units: LayoutSettings["units"],
) => {
  const rawRadius = (element.metadata as Record<string, unknown>).radius;
  const percentage = clampPercentage(
    typeof rawRadius === "number" ? rawRadius : 0,
  );
  const widthMm = valueToMillimeters(element.size.width, units);
  const heightMm = valueToMillimeters(element.size.height, units);
  const base = Math.min(widthMm, heightMm) / 2;
  return (percentage / 100) * base;
};

export type Point = { x: number; y: number };

type RoundedPolygonOptions = {
  segmentsPerCorner?: number;
  flipY?: boolean;
};

export const getRoundedPolygonMm = (
  element: ControlElement,
  units: LayoutSettings["units"],
  { segmentsPerCorner = 6, flipY = false }: RoundedPolygonOptions = {},
): Point[] => {
  const widthMm = valueToMillimeters(element.size.width, units);
  const heightMm = valueToMillimeters(element.size.height, units);
  const xMm = valueToMillimeters(element.position.x, units);
  const yMm = valueToMillimeters(element.position.y, units);
  const cx = xMm + widthMm / 2;
  const cy = yMm + heightMm / 2;
  const rotation = ((element.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const halfWidth = widthMm / 2;
  const halfHeight = heightMm / 2;
  const radius = Math.min(
    getElementRadiusMm(element, units),
    halfWidth,
    halfHeight,
  );

  const localPoints: Array<[number, number]> = [];

  if (radius <= 0) {
    localPoints.push(
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    );
  } else {
    const r = radius;
    const segments = Math.max(1, segmentsPerCorner);
    const pushArc = (
      centerX: number,
      centerY: number,
      startAngle: number,
      endAngle: number,
    ) => {
      for (let i = 0; i <= segments; i += 1) {
        const t = startAngle + ((endAngle - startAngle) * i) / segments;
        localPoints.push([
          centerX + r * Math.cos(t),
          centerY + r * Math.sin(t),
        ]);
      }
    };

    // Top edge
    localPoints.push([-halfWidth + r, -halfHeight]);
    localPoints.push([halfWidth - r, -halfHeight]);
    pushArc(halfWidth - r, -halfHeight + r, -Math.PI / 2, 0);

    // Right edge
    localPoints.push([halfWidth, -halfHeight + r]);
    localPoints.push([halfWidth, halfHeight - r]);
    pushArc(halfWidth - r, halfHeight - r, 0, Math.PI / 2);

    // Bottom edge
    localPoints.push([halfWidth - r, halfHeight]);
    localPoints.push([-halfWidth + r, halfHeight]);
    pushArc(-halfWidth + r, halfHeight - r, Math.PI / 2, Math.PI);

    // Left edge
    localPoints.push([-halfWidth, halfHeight - r]);
    localPoints.push([-halfWidth, -halfHeight + r]);
    pushArc(-halfWidth + r, -halfHeight + r, Math.PI, Math.PI * 1.5);
  }

  return localPoints
    .map(([localX, localY]) => {
      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;
      return {
        x: cx + rotatedX,
        y: flipY ? -(cy + rotatedY) : cy + rotatedY,
      } satisfies Point;
    })
    .reduce<Point[]>((acc, point, index, array) => {
      if (index === 0) {
        acc.push(point);
        return acc;
      }
      const prev = array[index - 1]!;
      if (Math.hypot(point.x - prev.x, point.y - prev.y) > 1e-6) {
        acc.push(point);
      }
      return acc;
    }, []);
};

export const sanitizeFilename = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const fallbackBounds = (
  snapshot: LayoutSnapshot,
  units: LayoutSettings["units"],
  options: RoundedPolygonOptions = {},
): Bounds => {
  const { flipY = false } = options;
  const widthMm = valueToMillimeters(snapshot.canvas.width, units);
  const heightMm = valueToMillimeters(snapshot.canvas.height, units);

  if (flipY) {
    return { minX: 0, minY: -heightMm, maxX: widthMm, maxY: 0 };
  }

  return { minX: 0, minY: 0, maxX: widthMm, maxY: heightMm };
};

export const getLayoutBounds = (
  snapshot: LayoutSnapshot,
  options: RoundedPolygonOptions = {},
): Bounds => {
  const units = snapshot.settings.units;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  snapshot.elements.forEach((element) => {
    const polygon = getRoundedPolygonMm(element, units, options);
    if (!polygon.length) {
      return;
    }
    polygon.forEach((point) => {
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    });
  });

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return fallbackBounds(snapshot, units, options);
  }

  if (maxX - minX <= 0 || maxY - minY <= 0) {
    return fallbackBounds(snapshot, units, options);
  }

  return { minX, minY, maxX, maxY };
};

export type { RoundedPolygonOptions };
