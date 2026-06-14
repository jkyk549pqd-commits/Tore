/**
 * 主题状态管理 Store
 * 管理全局主题状态，包括主题模式（浅色/深色/自定义）和主题颜色
 */
import { defineStore } from "pinia";
import { ipc } from "/@/utils/ipcRenderer";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    // 当前主题模式：light, dark, custom
    currentTheme: localStorage.getItem("theme") || "light",
    // 自定义主题色
    themeColor: localStorage.getItem("custom-color") || "#409EFF",
  }),

  getters: {
    /**
     * 判断当前是否为深色主题
     */
    isDark: (state) => state.currentTheme === "dark",

    /**
     * 获取当前项目主体颜色
     */
    getThemeColor: (state) => {
      return state.themeColor;
    },

    /**
     * 获取当前主题的图标
     */
    themeIcon: (state) => {
      if (state.currentTheme === "dark") {
        return "Moon";
      } else if (state.currentTheme === "custom") {
        return "Setting";
      }
      return "Sunny";
    },
  },

  actions: {
    /**
     * 设置主题模式
     * @param {string} theme - 主题模式：light, dark, custom
     */
    setTheme(theme) {
      if (["light", "dark", "custom"].includes(theme)) {
        this.currentTheme = theme;
        this.saveToStorage();
        this.applyTheme(theme);
        this.syncThemeToComponents(theme);
      }
    },

    /**
     * 设置自定义主题色
     * @param {string} color - 颜色值，如 '#409EFF'
     */
    setThemeColor(color) {
      this.themeColor = color;
      this.saveToStorage();
      this.applyThemeColor(color);
      this.syncThemeColorToComponents(color);
    },

    /**
     * 应用主题到 DOM
     * @param {string} theme - 主题模式
     */
    async applyTheme(theme) {
      const html = document.documentElement;

      // 移除所有主题类
      html.classList.remove("light", "dark", "custom");

      // 添加新主题类
      html.classList.add(theme);

      // 设置 data-theme 属性
      html.setAttribute("data-theme", theme);

      // 同步到 Electron 标题栏
      const ipcApiRoute = {
        setTheme: "controller/system/setWindowBackgroundColor",
      };
      if (ipc) {
        const bgColor = theme === "dark" ? "#1f1f1f" : "#ffffff";
        ipc.invoke(ipcApiRoute.setTheme, {
          color: bgColor,
        });
        // console.log("同步主题到 Electron 标题栏");
      } else {
        console.log("未找到 ipcRenderer");
      }
    },

    /**
     * 应用自定义主题色
     * @param {string} color - 颜色值
     */
    applyThemeColor(color) {
      const html = document.documentElement;

      // 设置 CSS 变量
      html.style.setProperty("--el-color-primary", color);
      html.style.setProperty("--custom-primary", color);
      html.style.setProperty("--primary-color", color);

      // 生成主题色的不同变体（用于 Element Plus）
      const shades = this.generateColorShades(color);
      html.style.setProperty("--el-color-primary-light-3", shades.light3);
      html.style.setProperty("--el-color-primary-light-5", shades.light5);
      html.style.setProperty("--el-color-primary-light-7", shades.light7);
      html.style.setProperty("--el-color-primary-light-8", shades.light8);
      html.style.setProperty("--el-color-primary-light-9", shades.light9);
      html.style.setProperty("--el-color-primary-dark-2", shades.dark2);

      // 设置 RGB 格式和透明度变体（用于首页组件）
      html.style.setProperty("--primary-rgb", shades.rgb);
      html.style.setProperty("--primary-light", `rgba(${shades.rgb}, 0.1)`);
      html.style.setProperty("--primary-hover", `rgba(${shades.rgb}, 0.2)`);
      html.style.setProperty("--primary-lighter", `rgba(${shades.rgb}, 0.05)`);
      html.style.setProperty("--primary-light-3", `rgba(${shades.rgb}, 0.3)`);
      html.style.setProperty("--primary-light-5", `rgba(${shades.rgb}, 0.5)`);
      html.style.setProperty("--primary-light-8", `rgba(${shades.rgb}, 0.8)`);
    },

    /**
     * 生成主题色的不同变体
     * @param {string} color - 基础颜色
     * @returns {object} 颜色变体对象
     */
    generateColorShades(color) {
      // 简单的颜色变体生成（实际项目中可以使用更复杂的算法）
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const adjust = (value, amount) => {
        const adjusted = Math.max(0, Math.min(255, value + amount));
        return adjusted.toString(16).padStart(2, "0");
      };

      return {
        light3: `#${adjust(r, 51)}${adjust(g, 51)}${adjust(b, 51)}`,
        light5: `#${adjust(r, 85)}${adjust(g, 85)}${adjust(b, 85)}`,
        light7: `#${adjust(r, 119)}${adjust(g, 119)}${adjust(b, 119)}`,
        light8: `#${adjust(r, 136)}${adjust(g, 136)}${adjust(b, 136)}`,
        light9: `#${adjust(r, 153)}${adjust(g, 153)}${adjust(b, 153)}`,
        dark2: `#${adjust(r, -34)}${adjust(g, -34)}${adjust(b, -34)}`,
        rgb: `${r}, ${g}, ${b}`,
      };
    },

    /**
     * 同步主题到组件（通过自定义事件）
     * @param {string} theme - 主题模式
     */
    syncThemeToComponents(theme) {
      // 触发自定义事件，让组件监听主题变化
      window.dispatchEvent(new CustomEvent("themeChange", { detail: theme }));
    },

    /**
     * 同步主题色到组件
     * @param {string} color - 颜色值
     */
    syncThemeColorToComponents(color) {
      // 触发自定义事件，让组件监听颜色变化
      window.dispatchEvent(
        new CustomEvent("themeColorChange", { detail: color })
      );
    },

    /**
     * 保存主题设置到本地存储
     */
    saveToStorage() {
      localStorage.setItem("theme", this.currentTheme);
      localStorage.setItem("custom-color", this.themeColor);
    },

    /**
     * 从本地存储加载主题设置
     */
    loadFromStorage() {
      const savedTheme = localStorage.getItem("theme");
      const savedColor = localStorage.getItem("custom-color");

      if (savedTheme) {
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
        this.syncThemeToComponents(savedTheme);
      }

      if (savedColor) {
        this.themeColor = savedColor;
        this.applyThemeColor(savedColor);
        this.syncThemeColorToComponents(savedColor);
      }
    },

    /**
     * 重置主题为默认
     */
    resetTheme() {
      this.setTheme("light");
      this.setThemeColor("#409EFF");
    },
  },
});
