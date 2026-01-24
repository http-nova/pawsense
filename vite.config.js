import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 🔑 GitHub Pages base path (repo name)
  base: "/pawsense/",

  build: {
    outDir: "docs",      // ✅ build output folder
    emptyOutDir: true,   // ✅ clean old build
  },
});
