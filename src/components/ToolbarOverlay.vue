<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore } from "@/stores/layoutStore";
import { getToolsByGroup } from "@/plugins";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const layoutStore = useLayoutStore();
const { activeTool } = storeToRefs(layoutStore);

/**
 * Get tools from registry, organized by group.
 */
const toolGroups = computed(() => {
  const byGroup = getToolsByGroup();
  return [
    {
      label: "Selection",
      tools: byGroup.selection,
    },
    {
      label: "Controls",
      tools: byGroup.controls,
    },
    {
      label: "Utilities",
      tools: byGroup.utilities,
    },
  ].filter((group) => group.tools.length > 0);
});

const handleToolSelect = (toolId: string) => {
  layoutStore.setActiveTool(toolId);
};
</script>

<template>
  <div
    class="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 shadow-lg backdrop-blur-xl"
  >
    <div class="flex items-center">
      <TooltipProvider>
        <div class="flex items-center gap-4">
          <template v-for="(group, index) in toolGroups" :key="group.label">
            <div class="flex items-center gap-2">
              <template v-for="tool in group.tools" :key="tool.id">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-9 w-9 border transition-colors border-transparent data-[selected=true]:!border-white/80 data-[selected=true]:bg-white/15 data-[selected=true]:!text-white"
                      :class="
                        activeTool === tool.id ? '' : 'hover:border-white/20'
                      "
                      :data-selected="activeTool === tool.id"
                      @click="handleToolSelect(tool.id)"
                    >
                      <component :is="tool.icon" class="size-4" />
                      <span class="sr-only">{{ tool.name }}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent class="text-xs uppercase tracking-[0.1em]">
                    <span>{{ tool.name }}</span>
                  </TooltipContent>
                </Tooltip>
              </template>
            </div>
            <Separator
              v-if="index < toolGroups.length - 1"
              orientation="vertical"
              class="h-6 bg-white/10"
            />
          </template>
        </div>
      </TooltipProvider>
    </div>
  </div>
</template>
