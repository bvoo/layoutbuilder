<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileSymlink } from "lucide-vue-next";
import {
  exportLayout,
  readLayoutJsonFile,
  type ExportFormat,
} from "@/lib/export";

const layoutStore = useLayoutStore();
const { canvas, elements, settings } = storeToRefs(layoutStore);
const fileInput = ref<HTMLInputElement | null>(null);

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const handleExport = async (format: ExportFormat) => {
  try {
    await exportLayout(format, {
      canvas: clone(canvas.value),
      elements: clone(elements.value),
      settings: clone(settings.value),
    });
  } catch (error) {
    console.error(`Failed to export layout as ${format}`, error);
  }
};

const handleImportClick = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  try {
    const payload = await readLayoutJsonFile(file);
    layoutStore.loadFromJson(payload);
  } catch (error) {
    console.error("Failed to import layout JSON", error);
  } finally {
    input.value = "";
  }
};

const transferHandlers: Record<string, () => Promise<void> | void> = {
  "export-json": () => handleExport("json"),
  "export-svg": () => handleExport("svg"),
  "export-dxf": () => handleExport("dxf"),
  "export-pdf": () => handleExport("pdf"),
  "import-json": () => handleImportClick(),
};

const transferOptions = [
  { key: "import-json", label: "Import JSON" },
  { key: "separator", label: "" },
  { key: "export-json", label: "Export JSON" },
  { key: "export-svg", label: "Export SVG" },
  { key: "export-dxf", label: "Export DXF" },
  { key: "export-pdf", label: "Export PDF" },
];

const handleMenuSelect = async (key: string) => {
  const handler = transferHandlers[key];
  if (!handler) {
    return;
  }
  await handler();
};
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="hidden"
      @change="handleFileChange"
    />
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <span class="inline-flex">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-slate-300 hover:text-slate-100"
                  aria-label="Transfer layout"
                >
                  <FileSymlink class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-48">
                <template v-for="option in transferOptions" :key="option.key">
                  <DropdownMenuItem
                    v-if="option.key !== 'separator'"
                    @select="() => handleMenuSelect(option.key)"
                  >
                    {{ option.label }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-else />
                </template>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">Transfer layout</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
