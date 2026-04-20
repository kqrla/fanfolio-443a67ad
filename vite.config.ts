import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Fully portable Vite config — no platform-specific plugins.
// Works on any static host (Vercel, Netlify, Cloudflare Pages, S3, GitHub Pages, etc.).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
});

