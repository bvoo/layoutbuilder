import { onMounted, onBeforeUnmount } from "vue";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
}

export interface KeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: () => boolean;
}

/**
 * Composable for centralized keyboard shortcut handling.
 * Automatically registers and cleans up event listeners.
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions): void {
  const { shortcuts, enabled = () => true } = options;

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (!enabled()) return;

    // Ignore if typing in an input or textarea
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

    const key = event.key.toLowerCase();
    const isCtrl = event.metaKey || event.ctrlKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    for (const shortcut of shortcuts) {
      const keyMatch = shortcut.key.toLowerCase() === key;
      const ctrlMatch = (shortcut.ctrl ?? false) === isCtrl;
      const shiftMatch = (shortcut.shift ?? false) === isShift;
      const altMatch = (shortcut.alt ?? false) === isAlt;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
}

/**
 * Create standard undo/redo shortcuts.
 */
export function createUndoRedoShortcuts(
  undo: () => void,
  redo: () => void
): KeyboardShortcut[] {
  return [
    { key: "z", ctrl: true, shift: false, handler: undo },
    { key: "z", ctrl: true, shift: true, handler: redo },
    { key: "y", ctrl: true, handler: redo },
  ];
}
