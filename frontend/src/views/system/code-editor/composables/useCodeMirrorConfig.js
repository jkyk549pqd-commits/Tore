import { ref, computed, watch, nextTick } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useThemeStore } from "/@/store/modules/theme";
import { useCodeMirrorThemes } from "./useCodeMirrorThemes";

/**
 * CodeMirror 配置管理 Composable
 * 提供编辑器的主题、字体、行号等配置选项
 *
 * @returns {Object} CodeMirror 配置相关的状态和方法
 */
export function useCodeMirrorConfig() {
  const appConfigStore = useAppConfigStore();
  const themeStore = useThemeStore();
  const { loadTheme, getAvailableThemes } = useCodeMirrorThemes();

  // 获取当前系统主题
  const currentTheme = computed(() => themeStore.currentTheme);

  /**
   * localStorage 存储键定义
   */
  const STORAGE_KEYS = {
    cmTheme: "codeEditor.cmTheme",
    cmFontSize: "codeEditor.cmFontSize",
    cmLineWrapping: "codeEditor.cmLineWrapping",
    cmLineNumbers: "codeEditor.cmLineNumbers",
  };

  // 主题
  const cmTheme = ref(appConfigStore.$state.cmTheme || "eclipse");

  // 字体大小
  const cmFontSize = ref(appConfigStore.$state.cmFontSize || 14);

  // 行号显示
  const cmLineNumbers = ref(true); // 文本编辑器始终显示行号

  // 只读模式
  const cmReadOnly = ref(false);

  // 自动换行
  const cmLineWrapping = ref(appConfigStore.$state.cmLineWrapping || false);

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
   * 主题选项
   * 根据当前系统主题过滤适合的主题
   */
  const cmThemeOptions = computed(() => {
    const isDarkMode = currentTheme.value === "dark";
    const allThemes = getAvailableThemes();

    // 根据系统主题选择对应的主题分类
    const allowedThemes = isDarkMode ? DARK_THEMES : LIGHT_THEMES;

    // 为每个主题创建选项对象并过滤
    return allThemes
      .map((theme) => ({ label: theme, value: theme }))
      .filter((theme) => allowedThemes.includes(theme.value));
  });

  // 当前文件格式（默认为 text）
  // CodeEditor 支持的格式：text, javascript, python, java, go, typescript, cpp, c, ruby
  const supportedFormats = ["text", "javascript", "python", "java", "go", "typescript", "cpp", "c", "ruby"];

  const initializeFileFormat = () => {
    const currentState = appConfigStore.$state || {};
    let format = "text";

    if (currentState.selectedCodeFileFormat) {
      // 验证格式是否在支持列表中
      if (supportedFormats.includes(currentState.selectedCodeFileFormat)) {
        format = currentState.selectedCodeFileFormat;
      } else {
        // 无效格式，使用默认值并更新 store
        console.warn(
          `CodeMirrorConfig: 检测到无效的文件格式 ${currentState.selectedCodeFileFormat}，重置为默认值 text`
        );
        format = "text";
        appConfigStore.$patch({
          selectedCodeFileFormat: "text",
        });
      }
    } else {
      // 首次初始化，保存默认值到 store
      appConfigStore.$patch({
        selectedCodeFileFormat: "text",
      });
    }

    return format;
  };

  const currentFileFormat = ref(initializeFileFormat());

  // 文件格式到 CodeMirror 模式的映射
  const formatModeMap = {
    text: "text/plain",
    javascript: "javascript",
    python: "python",
    java: "text/x-java",
    go: "go",
    typescript: "javascript", // TypeScript 使用 JavaScript 模式，TypeScript 是 JavaScript 的超集
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    ruby: "ruby",
    yaml: "yaml",
    xml: "xml",
    toml: "toml",
    properties: "properties",
    dockerfile: "dockerfile",
    shell: "shell",
    md: "markdown",
    sql: "text/x-sql",
    conf: "properties",
  };

  // 文件格式到 Lint 配置的映射
  const formatLintMap = {
    text: false,
    javascript: true,
    python: false,
    java: false,
    go: false,
    typescript: true,
    cpp: false,
    c: false,
    ruby: false,
    yaml: true,
    xml: false, // CodeMirror 5 没有内置的 XML lint 插件
    toml: true,
    properties: false,
    dockerfile: false,
    shell: true,
    md: false,
    sql: false,
    conf: false,
  };

  // 文件格式到自动闭合标签的映射
  const formatAutoCloseTagsMap = {
    text: false,
    javascript: false,
    python: false,
    java: false,
    go: false,
    typescript: false,
    cpp: false,
    c: false,
    ruby: false,
    yaml: false,
    xml: true,
    toml: false,
    properties: false,
    dockerfile: false,
    shell: false,
    md: false,
    sql: false,
    conf: false,
  };

  /**
   * 根据文件格式创建 gutters 配置
   */
  const getGuttersForFormat = (format) => {
    const baseGutters = ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];

    if (formatLintMap[format]) {
      return [...baseGutters, "CodeMirror-lint-markers"];
    }

    return baseGutters;
  };

  /**
   * CodeMirror 配置选项
   * 支持动态切换文件格式
   */
  const cmOptions = computed(() => {
    const mode = formatModeMap[currentFileFormat.value] || "text/plain";
    const lint = formatLintMap[currentFileFormat.value] || false;
    const autoCloseTags =
      formatAutoCloseTagsMap[currentFileFormat.value] || false;
    const gutters = getGuttersForFormat(currentFileFormat.value);

    return {
      mode: mode,
      theme: cmTheme.value,
      lineNumbers: cmLineNumbers.value,
      lineWrapping: cmLineWrapping.value,
      readOnly: cmReadOnly.value,
      foldGutter: true,
      gutters: gutters,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: autoCloseTags,
      tabSize: 2,
      indentUnit: 2,
      lint: lint,
      placeholder: "请输入或粘贴内容...",
    };
  });

  /**
   * 更新文件格式
   */
  const updateFileFormat = (format) => {
    // 验证格式是否在支持列表中
    if (!supportedFormats.includes(format)) {
      console.warn(`CodeMirrorConfig: 不支持的文件格式 ${format}，已取消更新`);
      return;
    }

    currentFileFormat.value = format;

    // 保存到状态管理
    appConfigStore.$patch({
      selectedCodeFileFormat: format,
    });
  };

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
        // console.log("code-editor: 恢复用户保存的主题:", savedTheme);
        cmTheme.value = savedTheme;
        return;
      }
    } catch (error) {
      console.warn("code-editor: 读取 localStorage 主题偏好失败:", error);
    }

    // 选择第一个可用主题作为 fallback
    // console.log("code-editor: 切换到默认主题:", options[0].value);
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
          // console.log("code-editor: 恢复用户保存的字体大小:", fontSize);
          cmFontSize.value = fontSize;
        }
      }
    } catch (error) {
      console.warn("code-editor: 读取 localStorage 字体大小失败:", error);
    }

    // 恢复 cmLineWrapping
    try {
      const savedLineWrapping = localStorage.getItem(
        STORAGE_KEYS.cmLineWrapping
      );
      if (savedLineWrapping !== null) {
        const lineWrapping = savedLineWrapping === "true";
        // console.log("code-editor: 恢复用户保存的行自动换行:", lineWrapping);
        cmLineWrapping.value = lineWrapping;
      }
    } catch (error) {
      console.warn("code-editor: 读取 localStorage 行自动换行失败:", error);
    }

    // 恢复 cmLineNumbers
    try {
      const savedLineNumbers = localStorage.getItem(STORAGE_KEYS.cmLineNumbers);
      if (savedLineNumbers !== null) {
        const lineNumbers = savedLineNumbers === "true";
        // console.log("code-editor: 恢复用户保存的行号显示:", lineNumbers);
        cmLineNumbers.value = lineNumbers;
      }
    } catch (error) {
      console.warn("code-editor: 读取 localStorage 行号显示失败:", error);
    }
  };

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
   * 监听 CodeMirror 配置变化,动态更新 cmOptions
   */
  watch(
    [cmTheme, cmLineWrapping, cmLineNumbers, cmReadOnly, currentFileFormat],
    () => {
      console.log(
        "code-editor: CodeMirror 配置变更, 新主题:",
        cmTheme.value,
        "新格式:",
        currentFileFormat.value
      );
      // cmOptions 是 computed，会自动更新，这里添加日志用于调试
    }
  );

  /**
   * 保存主题偏好到 localStorage
   * @param {string} theme - 主题名称
   */
  const saveThemePreference = (theme) => {
    const storageKey = STORAGE_KEYS.cmTheme;
    try {
      localStorage.setItem(storageKey, theme);
      // console.log("code-editor: 保存主题偏好:", theme);
    } catch (error) {
      console.warn("code-editor: 保存主题偏好到 localStorage 失败:", error);
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
      // console.log("code-editor: 保存字体大小:", cmFontSize.value);
    } catch (error) {
      console.warn("code-editor: 保存字体大小到 localStorage 失败:", error);
    }

    try {
      // 保存 cmLineWrapping
      localStorage.setItem(
        STORAGE_KEYS.cmLineWrapping,
        cmLineWrapping.value.toString()
      );
      // console.log("code-editor: 保存行自动换行:", cmLineWrapping.value);
    } catch (error) {
      console.warn("code-editor: 保存行自动换行到 localStorage 失败:", error);
    }

    try {
      // 保存 cmLineNumbers
      localStorage.setItem(
        STORAGE_KEYS.cmLineNumbers,
        cmLineNumbers.value.toString()
      );
      // console.log("code-editor: 保存行号显示:", cmLineNumbers.value);
    } catch (error) {
      console.warn("code-editor: 保存行号显示到 localStorage 失败:", error);
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
        // 同时保存到 appConfigStore
        appConfigStore.$patch({
          cmTheme: newTheme,
        });
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

  /**
   * 监听行号显示变化，自动保存到 appConfigStore
   */
  watch(
    cmLineNumbers,
    (newValue) => {
      appConfigStore.$patch({
        cmLineNumbers: newValue,
      });
    },
    { immediate: false }
  );

  /**
   * 监听自动换行变化，自动保存到 appConfigStore
   */
  watch(
    cmLineWrapping,
    (newValue) => {
      appConfigStore.$patch({
        cmLineWrapping: newValue,
      });
    },
    { immediate: false }
  );

  /**
   * 监听只读模式变化，自动保存到 appConfigStore
   */
  watch(
    cmReadOnly,
    (newValue) => {
      appConfigStore.$patch({
        cmReadOnly: newValue,
      });
    },
    { immediate: false }
  );

  return {
    cmTheme,
    cmThemeOptions,
    cmFontSize,
    cmLineWrapping,
    cmLineNumbers,
    cmReadOnly,
    cmOptions,
    currentFileFormat,
    updateFileFormat,
    loadTheme,
    initializeTheme,
    initializeEditorConfig,
  };
}
