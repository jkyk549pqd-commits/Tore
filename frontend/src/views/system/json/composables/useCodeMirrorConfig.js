import { ref, computed, watch, nextTick } from "vue";
import { useThemeStore } from "/@/store/modules/theme";
import { CodeMirrorConfig } from "../json-operations";

/**
 * CodeMirror 配置管理 Composable
 * 负责编辑器主题、字体、行号等配置的管理
 *
 * @returns {Object} CodeMirror 配置相关的状态和方法
 */
export function useCodeMirrorConfig() {
  // 获取 store 实例
  const themeStore = useThemeStore();
  const currentTheme = computed(() => themeStore.currentTheme);

  /**
   * localStorage 存储键定义
   */
  const STORAGE_KEYS = {
    cmTheme: "jsonEditor.cmTheme",
    cmFontSize: "jsonEditor.cmFontSize",
    cmLineWrapping: "jsonEditor.cmLineWrapping",
    cmLineNumbers: "jsonEditor.cmLineNumbers",
  };

  // CodeMirror 配置状态
  const cmTabSize = ref(4);
  const cmLineWrapping = ref(true);
  const cmLineNumbers = ref(true);
  const cmReadOnly = ref(false);
  const cmFontSize = ref(14);
  const showDemo = ref(true);

  // 主题配置
  const allThemeOptions = ref(CodeMirrorConfig.themes);
  const cmTheme = ref("");

  /**
   * 主题分类
   * 明确分类深色和浅色主题，避免关键词匹配的歧义
   */
  const DARK_THEMES = [
    "3024-night",
    "duotone-dark",
    "dracula",
    "abcdef",
    "yonce",
    "cobalt",
    "liquibyte",
    "lucario",
    "material",
    "mbo",
    "railscasts",
    "rubyblue",
    "seti",
    "shadowfox",
    "the-matrix",
    "twilight",
    "monokai",
    "ambiance",
    "base16-dark",
    "bespin",
    "blackboard",
    "lesser-dark",
    "midnight",
    "oceanic-next",
    "panda-syntax",
    "paraiso-dark",
    "tomorrow-night-bright",
    "tomorrow-night-eighties",
  ];

  const LIGHT_THEMES = [
    "3024-day",
    "duotone-light",
    "idea",
    "solarized",
    "ambiance-mobile",
    "base16-light",
    "mdn-like",
    "paraiso-light",
    "ttcn",
    "eclipse",
  ];

  /**
   * 根据当前主题过滤主题选项
   * dark 模式显示适合深色主题，light 模式显示适合浅色主题
   */
  const cmThemeOptions = computed(() => {
    const isDarkMode = currentTheme.value === "dark";

    // 根据系统主题选择对应的主题分类
    const allowedThemes = isDarkMode ? DARK_THEMES : LIGHT_THEMES;

    // 过滤主题选项
    return allThemeOptions.value.filter((theme) =>
      allowedThemes.includes(theme.value)
    );
  });

  /**
   * 初始化主题
   * 根据当前系统主题设置默认值
   * 优先保留用户之前选择的主题偏好
   */
  const initializeTheme = () => {
    const options = cmThemeOptions.value;

    // 如果没有可用主题，直接返回
    if (options.length === 0) {
      return;
    }

    // 如果当前主题在新选项中，保持不变
    if (options.find((opt) => opt.value === cmTheme.value)) {
      return;
    }

    // 尝试从 localStorage 读取用户之前保存的主题偏好
    const storageKey = STORAGE_KEYS.cmTheme;
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme && options.find((opt) => opt.value === savedTheme)) {
        // console.log("json-editor: 恢复用户保存的主题:", savedTheme);
        cmTheme.value = savedTheme;
        return;
      }
    } catch (error) {
      console.warn("json-editor: 读取 localStorage 主题偏好失败:", error);
    }

    // 选择第一个可用主题作为 fallback
    // console.log("json-editor: 切换到默认主题:", options[0].value);
    cmTheme.value = options[0].value;
  };

  /**
   * 初始化编辑器配置
   * 从 localStorage 恢复用户的编辑器偏好设置
   */
  const initializeEditorConfig = () => {
    // 恢复 cmFontSize
    try {
      const savedFontSize = localStorage.getItem(STORAGE_KEYS.cmFontSize);
      if (savedFontSize) {
        const fontSize = parseInt(savedFontSize, 10);
        if (!isNaN(fontSize) && fontSize >= 10 && fontSize <= 32) {
          // console.log("json-editor: 恢复用户保存的字体大小:", fontSize);
          cmFontSize.value = fontSize;
        }
      }
    } catch (error) {
      console.warn("json-editor: 读取 localStorage 字体大小失败:", error);
    }

    // 恢复 cmLineWrapping
    try {
      const savedLineWrapping = localStorage.getItem(
        STORAGE_KEYS.cmLineWrapping
      );
      if (savedLineWrapping !== null) {
        const lineWrapping = savedLineWrapping === "true";
        // console.log("json-editor: 恢复用户保存的行自动换行:", lineWrapping);
        cmLineWrapping.value = lineWrapping;
      }
    } catch (error) {
      console.warn("json-editor: 读取 localStorage 行自动换行失败:", error);
    }

    // 恢复 cmLineNumbers
    try {
      const savedLineNumbers = localStorage.getItem(STORAGE_KEYS.cmLineNumbers);
      if (savedLineNumbers !== null) {
        const lineNumbers = savedLineNumbers === "true";
        // console.log("json-editor: 恢复用户保存的行号显示:", lineNumbers);
        cmLineNumbers.value = lineNumbers;
      }
    } catch (error) {
      console.warn("json-editor: 读取 localStorage 行号显示失败:", error);
    }
  };

  /**
   * 创建 CodeMirror 配置选项
   */
  const cmOptions = ref(
    CodeMirrorConfig.createOptions({
      lint: true,
      lineWrapping: cmLineWrapping,
      lineNumbers: cmLineNumbers,
      theme: cmTheme,
      readOnly: cmReadOnly,
    })
  );

  /**
   * 监听 CodeMirror 配置变化,动态更新 cmOptions
   */
  watch([cmTheme, cmLineWrapping, cmLineNumbers, cmReadOnly], () => {
    cmOptions.value = CodeMirrorConfig.createOptions({
      lineWrapping: cmLineWrapping.value,
      lineNumbers: cmLineNumbers.value,
      theme: cmTheme.value,
      readOnly: cmReadOnly.value,
      lint: true,
    });
  });

  /**
   * 监听系统主题变化,自动切换到合适的主题
   */
  watch(
    currentTheme,
    () => {
      nextTick(() => {
        initializeTheme();
      });
    },
    { flush: "post" }
  );

  /**
   * 保存主题偏好到 localStorage
   * @param {string} theme - 主题名称
   */
  const saveThemePreference = (theme) => {
    const storageKey = STORAGE_KEYS.cmTheme;
    try {
      localStorage.setItem(storageKey, theme);
      // console.log("json-editor: 保存主题偏好:", theme);
    } catch (error) {
      console.warn("json-editor: 保存主题偏好到 localStorage 失败:", error);
    }
  };

  /**
   * 保存编辑器配置到 localStorage
   */
  const saveEditorConfig = () => {
    try {
      // 保存 cmFontSize
      localStorage.setItem(
        STORAGE_KEYS.cmFontSize,
        cmFontSize.value.toString()
      );
      // console.log("json-editor: 保存字体大小:", cmFontSize.value);
    } catch (error) {
      console.warn("json-editor: 保存字体大小到 localStorage 失败:", error);
    }

    try {
      // 保存 cmLineWrapping
      localStorage.setItem(
        STORAGE_KEYS.cmLineWrapping,
        cmLineWrapping.value.toString()
      );
      // console.log("json-editor: 保存行自动换行:", cmLineWrapping.value);
    } catch (error) {
      console.warn("json-editor: 保存行自动换行到 localStorage 失败:", error);
    }

    try {
      // 保存 cmLineNumbers
      localStorage.setItem(
        STORAGE_KEYS.cmLineNumbers,
        cmLineNumbers.value.toString()
      );
      // console.log("json-editor: 保存行号显示:", cmLineNumbers.value);
    } catch (error) {
      console.warn("json-editor: 保存行号显示到 localStorage 失败:", error);
    }
  };

  /**
   * 监听主题变化，自动保存用户偏好
   */
  watch(
    cmTheme,
    (newTheme) => {
      if (newTheme) {
        saveThemePreference(newTheme);
      }
    },
    { immediate: false }
  );

  /**
   * 监听编辑器配置变化，自动保存用户偏好
   */
  watch(
    [cmFontSize, cmLineWrapping, cmLineNumbers],
    () => {
      saveEditorConfig();
    },
    { immediate: false }
  );

  return {
    // 状态
    cmTheme,
    cmThemeOptions,
    cmFontSize,
    cmLineWrapping,
    cmLineNumbers,
    cmReadOnly,
    showDemo,
    cmOptions,
    cmTabSize,

    // 方法
    initializeTheme,
    initializeEditorConfig,
  };
}
