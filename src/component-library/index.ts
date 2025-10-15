import {
  type ComponentPresetCollection,
  type ComponentPresetOption,
  type ComponentToolId,
} from "./types";
import { defaultPresetCollections } from "./collections/defaultPresets";

const userCollections: ComponentPresetCollection[] = [];

export const registerPresetCollection = (
  collection: ComponentPresetCollection,
) => {
  userCollections.push(collection);
};

export const getPresetCollections = (): ComponentPresetCollection[] => [
  ...defaultPresetCollections,
  ...userCollections,
];

export const getComponentToolIds = (): ComponentToolId[] => {
  const tools = new Set<ComponentToolId>();
  for (const collection of getPresetCollections()) {
    tools.add(collection.tool);
  }
  return Array.from(tools);
};

export const getCollectionForTool = (
  tool: ComponentToolId,
): ComponentPresetCollection | undefined =>
  getPresetCollections().find((collection) => collection.tool === tool);

export const getOptionsForTool = (
  tool: ComponentToolId,
): ComponentPresetOption[] => getCollectionForTool(tool)?.options ?? [];

export const getDefaultPresetId = (tool: ComponentToolId): string | null =>
  getCollectionForTool(tool)?.defaultSelection ?? null;

export type {
  ComponentPresetCollection,
  ComponentPresetOption,
  ComponentToolId,
};
