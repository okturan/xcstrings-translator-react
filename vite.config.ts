import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { saveTranslationPlugin } from "./src/server/vitePlugin";

export default defineConfig({
  plugins: [react(), saveTranslationPlugin()],
});
