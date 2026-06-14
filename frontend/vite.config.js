import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { resolve } from "path";
import customVariables from "/@/theme/custom-variables.js";
import path from "path";

const pathResolve = (dir) => {
  return resolve(__dirname, ".", dir);
};

export default defineConfig(() => {
  return {
    // 项目插件
    plugins: [vue()],
    // 基础配置
    base: "./",
    root: process.cwd(),
    publicDir: "public",
    resolve: {
      alias: [
        // 国际化替换
        {
          find: "vue-i18n",
          replacement: "vue-i18n/dist/vue-i18n.cjs.js",
        },
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
    optimizeDeps: {
      include: [
        "ant-design-vue/es/locale/zh_CN",
        "dayjs/locale/zh-cn",
        "ant-design-vue/es/locale/en_US",
      ],
      exclude: ["vue-demi"],
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: customVariables,
          javascriptEnabled: true,
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      "process.env": process.env,
      global: "globalThis",
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      brotliSize: false,
      sourcemap: false,
      minify: "terser",
      target: "esnext",
      terserOptions: {
        compress: {
          // 生产环境去除console及debug
          drop_console: false,
          drop_debugger: true,
        },
      },
    },
    configureWebpack: {
      devtool: "source-map",
    },
  };
});
