import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { resolve } from "path";

const pathResolve = (dir) => {
  return resolve(__dirname, ".", dir);
};

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "dist/",
      ],
    },
    include: [
      "src/**/*.{test,spec}.{js,ts}",
      "src/tests/**/*.{test,spec}.{js,ts}",
    ],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
  },
  resolve: {
    alias: [
      // 绝对路径重命名：/@/xxxx => src/xxxx
      {
        find: /\/@\//,
        replacement: pathResolve("src") + "/",
      },
      {
        find: /^~/,
        replacement: "",
      },
    ],
  },
  server: {
    port: 3000,
  },
});
