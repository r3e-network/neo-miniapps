import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "..", "..");
const sharedDir = resolve(repoRoot, "node_modules/@r3e-network/neo-miniapp-shared");

// Standalone vitest config for the custom-anchor miniapp. Resolves the @shared
// alias the same way the build config does and runs in jsdom so the PlayArea
// React component can be rendered with @testing-library/react.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": sharedDir,
      "@": sharedDir,
      "@framework": resolve(repoRoot, "node_modules/@r3e-network/neo-miniapp-framework"),
      // One React copy, or hooks render against a dispatcher that is null.
      react: resolve(repoRoot, "node_modules/react"),
      "react-dom": resolve(repoRoot, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
  },
});
