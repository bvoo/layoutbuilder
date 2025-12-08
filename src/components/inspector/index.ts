import { registerInspectorSection } from "@/plugins/inspectorRegistry";
import NameSection from "./NameSection.vue";
import TransformSection from "./TransformSection.vue";
import AppearanceSection from "./AppearanceSection.vue";
import AnchorSection from "./AnchorSection.vue";

/**
 * Register all built-in inspector sections.
 * Call this during app initialization.
 */
export function registerBuiltInInspectorSections(): void {
  registerInspectorSection({
    id: "name",
    weight: 0,
    component: NameSection,
    shouldShow: () => true,
  });

  registerInspectorSection({
    id: "transform",
    weight: 10,
    component: TransformSection,
    shouldShow: () => true,
  });

  registerInspectorSection({
    id: "appearance",
    weight: 20,
    component: AppearanceSection,
    shouldShow: () => true,
  });

  registerInspectorSection({
    id: "anchor",
    weight: 30,
    component: AnchorSection,
    shouldShow: () => true,
  });
}

export { NameSection, TransformSection, AppearanceSection, AnchorSection };
