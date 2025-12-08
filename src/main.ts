import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";

import { registerBuiltInElements } from "./plugins/elements";
import { registerBuiltInTools } from "./plugins/tools";
import { registerBuiltInInspectorSections } from "./components/inspector";

registerBuiltInElements();
registerBuiltInTools();
registerBuiltInInspectorSections();

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
