import { ref, type Ref } from "vue";
import type {
  ControlElement,
  LayoutPreset,
  LayoutSettings,
  ElementCreatePayload,
} from "@/types/layout";
import { cloneElement } from "./elementFactory";

const STORAGE_KEY = "layoutbuilder_history";

export type LayoutSnapshot = {
  elements: ControlElement[];
  canvas: LayoutPreset["canvas"];
  settings: LayoutSettings;
  selection: string[];
};

export const HISTORY_LIMIT = 100;

interface HistoryDependencies {
  canvas: Ref<LayoutPreset["canvas"]>;
  settings: Ref<LayoutSettings>;
  elements: Ref<ControlElement[]>;
  selection: Ref<string[]>;
  hoveredElementId: Ref<string | null>;
  creationPreset: Ref<ElementCreatePayload | null>;
  markDirty: () => void;
}

export const createHistoryManager = ({
  canvas,
  settings,
  elements,
  selection,
  hoveredElementId,
  creationPreset,
  markDirty,
}: HistoryDependencies) => {
  const history = ref<LayoutSnapshot[]>([]);
  const historyIndex = ref(-1);
  const isRestoring = ref(false);

  const captureSnapshot = (): LayoutSnapshot => ({
    elements: elements.value.map((element) => cloneElement(element)),
    canvas: { ...canvas.value },
    settings: { ...settings.value },
    selection: [...selection.value],
  });

  const saveToStorage = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          history: history.value,
          historyIndex: historyIndex.value,
        })
      );
    } catch (e) {
      console.error("Failed to save history to storage", e);
    }
  };

  const loadFromStorage = (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const parsed = JSON.parse(stored);
      if (!parsed.history || !Array.isArray(parsed.history)) return false;

      history.value = parsed.history;
      historyIndex.value = parsed.historyIndex;

      // Apply the current state
      const currentSnapshot = history.value[historyIndex.value];
      if (currentSnapshot) {
        applySnapshot(currentSnapshot);
        return true;
      }
    } catch (e) {
      console.error("Failed to load history from storage", e);
    }
    return false;
  };

  const commitSnapshot = () => {
    if (isRestoring.value) return;
    const snapshot = captureSnapshot();
    if (historyIndex.value < history.value.length - 1) {
      history.value.splice(historyIndex.value + 1);
    }
    history.value.push(snapshot);
    if (history.value.length > HISTORY_LIMIT) {
      history.value.shift();
      historyIndex.value = Math.max(historyIndex.value - 1, -1);
    }
    historyIndex.value = history.value.length - 1;
    saveToStorage();
  };

  const applySnapshot = (snapshot: LayoutSnapshot) => {
    isRestoring.value = true;
    canvas.value = { ...snapshot.canvas };
    settings.value = { ...snapshot.settings };
    elements.value = snapshot.elements.map((element) => cloneElement(element));
    selection.value = [...snapshot.selection];
    hoveredElementId.value = null;
    creationPreset.value = null;
    isRestoring.value = false;
    markDirty();
  };

  const undo = () => {
    if (history.value.length === 0) return;
    if (historyIndex.value <= 0) {
      historyIndex.value = 0;
    } else {
      historyIndex.value -= 1;
    }
    const snapshot = history.value[historyIndex.value];
    if (!snapshot) return;
    applySnapshot(snapshot);
    saveToStorage();
  };

  const redo = () => {
    if (history.value.length === 0) return;
    if (historyIndex.value >= history.value.length - 1) return;
    historyIndex.value += 1;
    const snapshot = history.value[historyIndex.value];
    if (!snapshot) return;
    applySnapshot(snapshot);
    saveToStorage();
  };

  const resetHistory = () => {
    history.value = [];
    historyIndex.value = -1;
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    historyIndex,
    isRestoring,
    commitSnapshot,
    undo,
    redo,
    resetHistory,
    captureSnapshot,
    applySnapshot,
    loadFromStorage,
  };
};
