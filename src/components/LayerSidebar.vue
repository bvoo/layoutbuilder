<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "../stores/layoutStore";
import { Button } from "@/components/ui/button";
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
const { elements, selection, settings } = storeToRefs(layoutStore);

const activeStackIds = computed(() =>
  elements.value.map((element) => element.id),
);

// const presetOptions = computed(() =>
//   presets.value.map((preset) => ({
//     label: preset.name,
//     value: preset.id,
//   })),
// );

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

// const handlePresetSelect = (presetId: string) => {
//   const preset = presets.value.find((item) => item.id === presetId);
//   if (preset) {
//     layoutStore.loadPreset(preset);
//   }
// };

// const handlePresetDropdownSelect = (key: string) => {
//   if (key === "manage-presets") {
//     return;
//   }
//   handlePresetSelect(key);
// };

// const handlePresetChange = (value: AcceptableValue) => {
//   if (typeof value !== "string") return;
//   handlePresetSelect(value);
// };

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
        <!-- <div class="flex min-w-[180px] flex-1 flex-col gap-1 text-left">
          <span>Preset</span>
          <Select
            :model-value="activePreset?.id ?? null"
            placeholder="Select preset"
            @update:model-value="handlePresetChange"
          >
            <SelectTrigger
              size="sm"
              class="w-full text-left normal-case tracking-normal"
            >
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in presetOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="uppercase tracking-wide"
              >Presets</Button
            >
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-48">
            <DropdownMenuItem
              @select="() => handlePresetDropdownSelect('manage-presets')"
            >
              Manage Presets
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="option in presetOptions"
              :key="option.value"
              @select="() => handlePresetSelect(option.value)"
            >
              {{ option.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> -->
      </div>
    </header>

    <Separator class="bg-white/10" />

    <ScrollArea class="flex-1">
      <ul class="flex flex-col gap-2">
        <li v-for="element in elements" :key="element.id">
          <button
            class="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
            :class="{
              'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10':
                isSelected(element.id),
            }"
            type="button"
            @click="handleSelect(element.id)"
          >
            <div class="flex flex-col gap-1">
              <span class="text-sm font-semibold text-slate-100">{{
                element.name
              }}</span>
              <span class="text-xs text-slate-300"
                >{{ element.type }} - {{ element.mapping || "unmapped" }}</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-slate-300 hover:text-slate-100"
                @click.stop="toggleVisibility(element.id)"
              >
                <component
                  :is="element.metadata.hidden ? EyeOff : Eye"
                  class="size-4"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-slate-300 hover:text-slate-100"
                @click.stop="toggleLocked(element.id)"
              >
                <component
                  :is="element.metadata.locked ? Lock : Unlock"
                  class="size-4"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-slate-300 hover:text-slate-100"
                @click.stop="moveElement(element.id, 'up')"
              >
                <ArrowUp class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-slate-300 hover:text-slate-100"
                @click.stop="moveElement(element.id, 'down')"
              >
                <ArrowDown class="size-4" />
              </Button>
            </div>
          </button>
        </li>
      </ul>
    </ScrollArea>
  </div>
</template>
