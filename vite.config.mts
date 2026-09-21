import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";
// import federation from "@originjs/vite-plugin-federation"; //Haider
// import path from "node:path";   //Haider1

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
export default defineConfig(({ mode }) => {
  // Load VIT_REMOTE_* from .env.[mode] so remote URLs are never
  // hard-coded - see  src/remotes/registery.ts for how these are consumed
  // at return too.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [
      tailwindcss(),
      react(),
      federation({
        name: "Shell",
        remotes: {
          // key: URL to that remote's remoteEntry.js.
          // Declaring  it here lets Vite/Rollup do type-safty dynamic `import('cim_fixed/FixedApp')` calss;
          // the *actual* runtime, still only hapends when a remote is requested at runtime, so undeployed remote does no break
          // the Shell' build or startup - it only fails when that MFE is opned,
          cim_fixed: `${env.VITE_REMOTE_FIXED_URL}/remoteEntry.js`,
          cim_order: `${env.VITE_REMOTE_ORDER_URL}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, requiredVersion: "19.1.0" },
          "react-dom": { singleton: true, requiredVersion: "19.1.0" },
          "react-router-dom": { singleton: true, requiredVersion: "^7.5.3" },
        },
      }),
    ],
    build: {
      target: "esnext",
      outDir: "dist",
      modulePreload: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3000,
    },
  };

  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },
});
