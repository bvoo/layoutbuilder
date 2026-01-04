import type { ComponentPresetCollection } from "../types";
import { elementSizePresets } from "@/stores/layoutStore";

export const defaultPresetCollections: ComponentPresetCollection[] = [
  {
    tool: "button",
    defaultSelection: "sanwa-30",
    options: [
      {
        id: "sanwa-24",
        label: "Sanwa 24mm • Circle",
        payload: {
          type: "button",
          name: "Sanwa 24mm",
          size: { width: 24, height: 24 },
          metadata: {
            diameter: 24,
            brand: "Sanwa",
            model: "OBSF-24",
            radius: 100,
          },
        },
      },
      {
        id: "sanwa-30",
        label: "Sanwa 30mm • Circle",
        payload: {
          type: "button",
          name: "Sanwa 30mm",
          size: { width: 30, height: 30 },
          metadata: {
            diameter: 30,
            brand: "Sanwa",
            model: "OBSF-30",
            radius: 100,
          },
        },
      },
      {
        id: "kailh-choc",
        label: "Kailh Choc • 14×14mm",
        payload: {
          type: "button",
          name: "Kailh Choc",
          size: { width: 14, height: 14 },
          metadata: {
            brand: "Kailh",
            model: "Choc V2",
            footprint: "14×14mm",
            radius: 0,
          },
        },
      },
      {
        id: "seimitsu-24",
        label: "Seimitsu PS-14-G • 24mm",
        payload: {
          type: "button",
          name: "Seimitsu 24mm",
          size: { width: 24, height: 24 },
          metadata: {
            diameter: 24,
            brand: "Seimitsu",
            model: "PS-14-G",
            radius: 100,
          },
        },
      },
      {
        id: "seimitsu-30",
        label: "Seimitsu PS-14-GN • 30mm",
        payload: {
          type: "button",
          name: "Seimitsu 30mm",
          size: { width: 30, height: 30 },
          metadata: {
            diameter: 30,
            brand: "Seimitsu",
            model: "PS-14-GN",
            radius: 100,
          },
        },
      },
      {
        id: "crown-202",
        label: "Crown SDB-202 • 28mm",
        payload: {
          type: "button",
          name: "Crown 28mm",
          size: { width: 28, height: 28 },
          metadata: {
            diameter: 28,
            brand: "Crown/Samducksa",
            model: "SDB-202",
            radius: 100,
          },
        },
      },
      {
        id: "gamerfinger-hbfs",
        label: "GamerFinger HBFS • 30mm",
        payload: {
          type: "button",
          name: "GamerFinger 30mm",
          size: { width: 30, height: 30 },
          metadata: {
            diameter: 30,
            brand: "GamerFinger",
            model: "HBFS-30",
            radius: 100,
          },
        },
      },
      {
        id: "cherry-mx",
        label: "Cherry MX • 15.6×15.6mm",
        payload: {
          type: "button",
          name: "Cherry MX",
          size: { width: 15.6, height: 15.6 },
          metadata: {
            brand: "Cherry",
            model: "MX",
            footprint: "15.6×15.6mm",
            radius: 0,
          },
        },
      },
      {
        id: "gateron-lp",
        label: "Gateron Low Profile • 15×15mm",
        payload: {
          type: "button",
          name: "Gateron LP",
          size: { width: 15, height: 15 },
          metadata: {
            brand: "Gateron",
            model: "Low Profile",
            footprint: "15×15mm",
            radius: 0,
          },
        },
      },
    ],
  },
  {
    tool: "lever",
    defaultSelection: "sanwa-jlf",
    options: [
      {
        id: "sanwa-jlf",
        label: "Sanwa JLF • 95×53mm",
        payload: {
          type: "lever",
          name: "Sanwa JLF",
          size: { width: 95, height: 53 },
          metadata: {
            brand: "Sanwa",
            model: "JLF-TP-8YT",
            mountingPlate: "S-Plate",
            radius: 0,
            shaftDiameter: 21.3,
            mountingHoles: [
              // Left side slots (oval) - 4 slots at x=6.5mm
              { x: 6.5, y: 6.5, shape: "slot", width: 5.2, height: 7.8 },
              { x: 6.5, y: 16.5, shape: "slot", width: 5.2, height: 7.8 },
              { x: 6.5, y: 36.5, shape: "slot", width: 5.2, height: 7.8 },
              { x: 6.5, y: 46.5, shape: "slot", width: 5.2, height: 7.8 },
              // Right side holes (ø5.8mm) - 41.25mm from center
              { x: 88.75, y: 11.75, diameter: 5.8 },
              { x: 88.75, y: 41.25, diameter: 5.8 },
              // Center mounting holes (ø4.75mm) - around shaft
              { x: 41.25, y: 10.75, diameter: 4.75 },
              { x: 53.75, y: 10.75, diameter: 4.75 },
              { x: 41.25, y: 42.25, diameter: 4.75 },
              { x: 53.75, y: 42.25, diameter: 4.75 },
            ],
          },
        },
      },
      {
        id: "seimitsu-ls32",
        label: "Seimitsu LS-32 • 90×40mm",
        payload: {
          type: "lever",
          name: "Seimitsu LS-32",
          size: { width: 90, height: 40 },
          metadata: {
            brand: "Seimitsu",
            model: "LS-32-01",
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              { x: 10, y: 10, diameter: 4 },
              { x: 80, y: 10, diameter: 4 },
              { x: 10, y: 30, diameter: 4 },
              { x: 80, y: 30, diameter: 4 },
            ],
          },
        },
      },
      {
        id: "seimitsu-ls40",
        label: "Seimitsu LS-40 • 84×40mm",
        payload: {
          type: "lever",
          name: "Seimitsu LS-40",
          size: { width: 84, height: 40 },
          metadata: {
            brand: "Seimitsu",
            model: "LS-40-01",
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              { x: 10, y: 10, diameter: 4 },
              { x: 74, y: 10, diameter: 4 },
              { x: 10, y: 30, diameter: 4 },
              { x: 74, y: 30, diameter: 4 },
            ],
          },
        },
      },
      {
        id: "crown-309mj",
        label: "Crown 309MJ • 95×45mm",
        payload: {
          type: "lever",
          name: "Crown 309MJ",
          size: { width: 95, height: 45 },
          metadata: {
            brand: "Crown/Samducksa",
            model: "CWL-309MJ",
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              { x: 10, y: 10, diameter: 4 },
              { x: 85, y: 10, diameter: 4 },
              { x: 10, y: 35, diameter: 4 },
              { x: 85, y: 35, diameter: 4 },
            ],
          },
        },
      },
      {
        id: "hori-hayabusa",
        label: "Hori Hayabusa • 90×40mm",
        payload: {
          type: "lever",
          name: "Hori Hayabusa",
          size: { width: 90, height: 40 },
          metadata: {
            brand: "Hori",
            model: "Hayabusa",
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              { x: 10, y: 10, diameter: 4 },
              { x: 80, y: 10, diameter: 4 },
              { x: 10, y: 30, diameter: 4 },
              { x: 80, y: 30, diameter: 4 },
            ],
          },
        },
      },
      {
        id: "lever-standard",
        label: "Generic • 30×80mm",
        payload: {
          type: "lever",
          name: "Lever",
          size: elementSizePresets.lever,
          metadata: {
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              { x: 5, y: 5, diameter: 4 },
              { x: 25, y: 5, diameter: 4 },
              { x: 5, y: 75, diameter: 4 },
              { x: 25, y: 75, diameter: 4 },
            ],
          },
        },
      },
      {
        id: "lever-slotted",
        label: "Slotted Mount • 80×50mm",
        payload: {
          type: "lever",
          name: "Slotted Lever",
          size: { width: 80, height: 50 },
          metadata: {
            radius: 0,
            shaftDiameter: 24,
            mountingHoles: [
              // Corner circles
              { x: 8, y: 8, shape: "circle", diameter: 4 },
              { x: 72, y: 8, shape: "circle", diameter: 4 },
              { x: 8, y: 42, shape: "circle", diameter: 4 },
              { x: 72, y: 42, shape: "circle", diameter: 4 },
              // Adjustment slots on sides
              { x: 8, y: 25, shape: "slot", width: 4, height: 12 },
              { x: 72, y: 25, shape: "slot", width: 4, height: 12 },
            ],
          },
        },
      },
    ],
  },
];
