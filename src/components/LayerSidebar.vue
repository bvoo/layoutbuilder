<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "../stores/layoutStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LayoutTransferPanel from "@/components/LayoutTransferPanel.vue";
import type { AcceptableValue } from "reka-ui";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-vue-next";

const layoutStore = useLayoutStore();
const { elements, selection, settings, canvas } = storeToRefs(layoutStore);

const activeStackIds = computed(() =>
  elements.value.map((element) => element.id),
);

const unitOptions: { label: string; value: "mm" | "in" }[] = [
  { label: "Millimeters", value: "mm" },
  { label: "Inches", value: "in" },
];

const isSelected = (id: string) => selection.value.includes(id);

const handleSelect = (id: string | null | undefined) => {
  if (typeof id !== "string" || id.length === 0) return;
  layoutStore.selectElement(id);
};

const moveElement = (id: string, direction: "up" | "down") => {
  const index = elements.value.findIndex((element) => element.id === id);
  if (index === -1) return;

  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= elements.value.length) return;

  const reordered = [...activeStackIds.value];
  const [removed] = reordered.splice(index, 1);
  if (!removed) return;
  reordered.splice(nextIndex, 0, removed);
  layoutStore.reorderElements(reordered);
};

const handleUnitChange = (value: AcceptableValue) => {
  if (value !== "mm" && value !== "in") return;
  layoutStore.setSettings({
    ...settings.value,
    units: value,
  });
};

const handleSnapChange = (checked: boolean | "indeterminate") => {
  if (checked === "indeterminate") return;
  layoutStore.setSettings({
    ...settings.value,
    snapToGrid: checked,
  });
};

const handleGridSizeChange = (value: number) => {
  if (Number.isNaN(value) || value <= 0) return;
  layoutStore.setSettings({
    ...settings.value,
    gridSize: value,
  });
  layoutStore.setCanvas({
    ...canvas.value,
    gridSize: value,
  });
};

const handleResetLayout = () => {
  layoutStore.resetLayout();
};

const toggleVisibility = (id: string) => {
  const element = elements.value.find((item) => item.id === id);
  if (!element) return;
  const hidden = element.metadata.hidden === true;
  layoutStore.updateElement(id, {
    metadata: {
      ...element.metadata,
      hidden: !hidden,
    },
  });
};

const toggleLocked = (id: string) => {
  const element = elements.value.find((item) => item.id === id);
  if (!element) return;
  const locked = element.metadata.locked === true;
  layoutStore.updateElement(id, {
    metadata: {
      ...element.metadata,
      locked: !locked,
    },
  });
};
</script>

<template>
  <div
    class="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100 shadow-lg backdrop-blur-xl"
  >
    <header class="flex flex-col gap-3">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2
            class="text-base font-semibold uppercase tracking-[0.12em] text-slate-100"
          >
            Components
          </h2>
          <p class="text-xs text-slate-300">
            Arrange and manage all elements in the layout.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-slate-300 hover:text-slate-100"
                  @click="handleResetLayout"
                >
                  <RotateCcw class="size-4" />
                  <span class="sr-only">Reset layout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reset layout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <LayoutTransferPanel />
        </div>
      </div>

      <div
        class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-300"
      >
        <div class="flex min-w-[180px] flex-1 flex-col gap-1 text-left">
          <span>Units</span>
          <Select
            :model-value="settings.units"
            @update:model-value="handleUnitChange"
          >
            <SelectTrigger
              size="sm"
              class="w-full text-left normal-case tracking-normal"
            >
              <SelectValue placeholder="Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in unitOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex min-w-[100px] flex-1 flex-col gap-1 text-left">
          <span>Grid Size</span>
          <input
            id="grid-size"
            class="h-9 w-full rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-slate-100 normal-case tracking-normal transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            type="number"
            step="1"
            min="1"
            :value="settings.gridSize"
            @input="
              (event) =>
                handleGridSizeChange(
                  parseFloat((event.target as HTMLInputElement).value)
                )
            "
          />
        </div>
      </div>

      <label
        for="snap-to-grid"
        class="flex items-center gap-2.5 pt-1 cursor-pointer select-none"
      >
        <Checkbox
          id="snap-to-grid"
          class="shrink-0 aspect-square border-white/20 size-6"
          :model-value="settings.snapToGrid"
          @update:model-value="handleSnapChange"
        />
        <span class="text-xs text-slate-300">Snap to Grid</span>
      </label>
    </header>

    <Separator class="bg-white/10" />

    <ScrollArea class="flex-1">
      <ul class="flex flex-col gap-2">
        <li v-for="element in elements" :key="element.id">
          <button
            class="group relative flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
            :class="{
              'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10':
                isSelected(element.id),
            }"
            type="button"
            @click="handleSelect(element.id)"
          >
            <div class="flex flex-1 min-w-0 flex-col gap-1 pr-8">
              <span class="truncate text-sm font-semibold text-slate-100">{{
                element.name
              }}</span>
              <span class="truncate text-xs text-slate-300">
                {{ element.type }}
                <template v-if="element.type !== 'lever'">
                  - {{ element.mapping || "unmapped" }}
                </template>
              </span>
            </div>
            <div
              class="absolute right-2 flex items-center gap-1 p-1 rounded-lg backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100"
              :class="{
                'opacity-100 bg-transparent backdrop-blur-none':
                  element.metadata.hidden || element.metadata.locked,
              }"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                class="rounded-md transition-all"
                :class="{
                  'opacity-100 bg-white/10 text-slate-100':
                    element.metadata.hidden,
                  'text-slate-400 hover:bg-white/10 hover:text-slate-100':
                    !element.metadata.hidden,
                }"
                @click.stop="toggleVisibility(element.id)"
              >
                <component
                  :is="element.metadata.hidden ? EyeOff : Eye"
                  class="size-3.5"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="rounded-md transition-all"
                :class="{
                  'opacity-100 bg-white/10 text-slate-100':
                    element.metadata.locked,
                  'text-slate-400 hover:bg-white/10 hover:text-slate-100':
                    !element.metadata.locked,
                }"
                @click.stop="toggleLocked(element.id)"
              >
                <component
                  :is="element.metadata.locked ? Lock : Unlock"
                  class="size-3.5"
                />
              </Button>

              <div
                class="hidden h-4 w-px bg-white/10 sm:block"
              />

              <Button
                variant="ghost"
                size="icon-sm"
                class="rounded-md text-slate-400 transition-all hover:bg-white/10 hover:text-slate-100"
                @click.stop="moveElement(element.id, 'up')"
              >
                <ArrowUp class="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="rounded-md text-slate-400 transition-all hover:bg-white/10 hover:text-slate-100"
                @click.stop="moveElement(element.id, 'down')"
              >
                <ArrowDown class="size-3.5" />
              </Button>
            </div>
          </button>
        </li>
      </ul>
    </ScrollArea>
  </div>
</template>
