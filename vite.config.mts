import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// RBC Shell — Module Federation HOST.
// No `remotes` are declared statically here: proposal §5.2 / CLAUDE.md both
// call for a remote registry rather than URLs hard-coded through the code
// (or the config). Remotes are registered at runtime from
// public/mfe-registry.json via src/registry/loadRemote.ts using
// @originjs/vite-plugin-federation's dynamic-remote APIs.
//
// `shared` still needs to be declared here at build time so the Shell and
// every MFE agree on a single React runtime instance — see CLAUDE.md's
// pinned versions table. Keep these versions exactly in sync with each MFE's
// own federation config.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "rbcShell",
      remotes: {},
      shared: {
        react: { requiredVersion: "19.1.0", singleton: true },
        "react-dom": { requiredVersion: "19.1.0", singleton: true },
        "react-router-dom": { requiredVersion: "^7.5.3", singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3000,
  },
});
