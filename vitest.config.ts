import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only the repo's own unit tests. Task pool tests under src/tasks/families
    // resolve their imports relative to a sandbox; they run there, not here.
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", "src/tasks/families/**"],
  },
});
