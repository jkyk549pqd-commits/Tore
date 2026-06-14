/**
 * CodeMirror 主题动态加载相关的 Composable
 * 支持按需加载主题，减少初始加载时间和包体积
 */

// 主题映射表：主题名称对应的 CSS 导入函数
const THEME_MAP = {
  "3024-day": () => import("codemirror/theme/3024-day.css"),
  "3024-night": () => import("codemirror/theme/3024-night.css"),
  "duotone-dark": () => import("codemirror/theme/duotone-dark.css"),
  "duotone-light": () => import("codemirror/theme/duotone-light.css"),
  dracula: () => import("codemirror/theme/dracula.css"),
  solarized: () => import("codemirror/theme/solarized.css"),
  monokai: () => import("codemirror/theme/monokai.css"),
  "material-palenight": () => import("codemirror/theme/material-palenight.css"),
  abcdef: () => import("codemirror/theme/abcdef.css"),
  yonce: () => import("codemirror/theme/yonce.css"),
  "ambiance-mobile": () => import("codemirror/theme/ambiance-mobile.css"),
  ambiance: () => import("codemirror/theme/ambiance.css"),
  "base16-dark": () => import("codemirror/theme/base16-dark.css"),
  "base16-light": () => import("codemirror/theme/base16-light.css"),
  bespin: () => import("codemirror/theme/bespin.css"),
  blackboard: () => import("codemirror/theme/blackboard.css"),
  cobalt: () => import("codemirror/theme/cobalt.css"),
  idea: () => import("codemirror/theme/idea.css"),
  "lesser-dark": () => import("codemirror/theme/lesser-dark.css"),
  liquibyte: () => import("codemirror/theme/liquibyte.css"),
  lucario: () => import("codemirror/theme/lucario.css"),
  material: () => import("codemirror/theme/material.css"),
  mbo: () => import("codemirror/theme/mbo.css"),
  "mdn-like": () => import("codemirror/theme/mdn-like.css"),
  midnight: () => import("codemirror/theme/midnight.css"),
  "oceanic-next": () => import("codemirror/theme/oceanic-next.css"),
  "panda-syntax": () => import("codemirror/theme/panda-syntax.css"),
  "paraiso-dark": () => import("codemirror/theme/paraiso-dark.css"),
  "paraiso-light": () => import("codemirror/theme/paraiso-light.css"),
  railscasts: () => import("codemirror/theme/railscasts.css"),
  rubyblue: () => import("codemirror/theme/rubyblue.css"),
  seti: () => import("codemirror/theme/seti.css"),
  shadowfox: () => import("codemirror/theme/shadowfox.css"),
  "the-matrix": () => import("codemirror/theme/the-matrix.css"),
  "tomorrow-night-bright": () =>
    import("codemirror/theme/tomorrow-night-bright.css"),
  "tomorrow-night-eighties": () =>
    import("codemirror/theme/tomorrow-night-eighties.css"),
  ttcn: () => import("codemirror/theme/ttcn.css"),
  twilight: () => import("codemirror/theme/twilight.css"),
  eclipse: () => import("codemirror/theme/eclipse.css"),
};

// 已加载的主题缓存
const loadedThemes = new Set();

/**
 * CodeMirror 主题管理 Composable
 * @returns {Object} 主题管理方法和状态
 */
export function useCodeMirrorThemes() {
  /**
   * 动态加载主题 CSS
   * @param {string} theme - 主题名称
   * @returns {Promise<void>}
   */
  async function loadTheme(theme) {
    // 如果主题已加载，直接返回
    if (loadedThemes.has(theme)) {
      return;
    }

    try {
      const loader = THEME_MAP[theme];
      if (loader) {
        await loader();
        loadedThemes.add(theme);
      } else {
        console.warn(`主题 "${theme}" 未在 THEME_MAP 中定义`);
      }
    } catch (error) {
      console.error(`加载主题 "${theme}" 失败:`, error);
      throw error;
    }
  }

  /**
   * 预加载多个主题
   * @param {string[]} themes - 主题名称数组
   * @returns {Promise<void[]>}
   */
  async function preloadThemes(themes) {
    const loadPromises = themes
      .filter((theme) => !loadedThemes.has(theme))
      .map((theme) => loadTheme(theme));
    return Promise.all(loadPromises);
  }

  /**
   * 检查主题是否已加载
   * @param {string} theme - 主题名称
   * @returns {boolean}
   */
  function isThemeLoaded(theme) {
    return loadedThemes.has(theme);
  }

  /**
   * 获取所有可用的主题名称
   * @returns {string[]}
   */
  function getAvailableThemes() {
    return Object.keys(THEME_MAP);
  }

  return {
    loadTheme,
    preloadThemes,
    isThemeLoaded,
    getAvailableThemes,
  };
}

/**
 * 静态导入常用主题（向后兼容）
 * 如果需要确保某些主题立即可用，可以在组件中直接导入
 */
export function importCommonThemes() {
  import("codemirror/theme/3024-day.css");
  import("codemirror/theme/dracula.css");
  import("codemirror/theme/monokai.css");
  import("codemirror/theme/solarized.css");
}
