/*
 * 应用默认配置
 *
 */
import { socketClient } from "/@/utils/socket-client";

export const appDefaultConfig = {
  // i18n 语言选择
  language: "zh_CN",
  // 布局: side 或者 side-expand 或者 top
  layout: "side",
  // TextEditor 选择的文件格式（用于配置文件编辑器）
  selectedFileFormat: "text",
  // CodeEditor 选择的文件格式（用于代码编辑器）
  selectedCodeFileFormat: "text",
  // 侧边菜单宽度 ， 默认为200px
  sideMenuWidth: 200,
  // 菜单主题
  sideMenuTheme: "light",
  // 顶部菜单页面宽度
  pageWidth: "99%",
  // 标签页
  pageTagFlag: true,
  // 面包屑
  breadCrumbFlag: true,
  // 菜单单例模式：single（单例）、multi（多实例）
  sideMenuSingleMode: "single",
  // 标签页中是否显示实例ID后缀（用于区分同一路由多个实例）
  showInstanceIdInTag: false,
  // 网站名称
  websiteName: "Tore",
  // 主题颜色
  primaryColor: "red",
  // JSON自动保存间隔（秒），默认为60秒
  jsonAutoSaveInterval: 60,
  // CodeEditor自动保存间隔（秒），默认为60秒
  codeAutoSaveInterval: 60,
  // TextEditor自动保存间隔（秒），默认为60秒
  textAutoSaveInterval: 60,
  // 控制所有 tooltip 的显示/隐藏，默认为 true（显示）
  showTooltipsFlag: true,
  // 标签页持久化：关闭软件后是否保留标签页状态，默认为 true（保留）
  keepTabsOnClose: true,
  // 首页布局模式: simple（简洁）| standard（标准）| compact（紧凑）
  homeLayoutMode: "standard",
  // 首页垂直布局模式: 是否启用垂直布局（EditorHub、QuickToolbar、RecentRecords）
  homeVerticalLayout: false,
  // 首页组件可见性配置
  homeComponentsVisibility: {
    showBrandSection: true, // 品牌展示区显示
    showEditorHub: true, // 编辑器入口显示
    showQuickToolbar: true, // 快捷工具栏显示
    showRecentRecords: true, // 最近记录显示
  },
  // JSON编辑器按钮配置（type=2 的配置）
  jsonEditorButtons: {
    import: { visible: true, order: 1 },
    export: { visible: true, order: 2 },
    copy: { visible: true, order: 3 },
    paste: { visible: true, order: 4 },
    demo: { visible: true, order: 5 },
    clear: { visible: true, order: 6 },
    format: { visible: true, order: 7 },
    compress: { visible: true, order: 8 },
    sort: { visible: true, order: 9 },
    addEscape: { visible: true, order: 10 },
    removeEscape: { visible: true, order: 11 },
  },
};

/**
 * 从后端获取应用配置
 * 如果后端返回为空或出错，则返回默认配置
 * @returns {Promise<Object>} 应用配置对象
 */
export async function getAppConfigFromBackend() {
  try {
    // 从后端获取配置，type: "1" 表示应用配置类型
    const confResult = await socketClient.invoke(
      "controller/system/getConfByType",
      { type: "1" }
    );

    // 获取按钮配置（type=2）
    const buttonConfResult = await socketClient.invoke(
      "controller/system/getConfByType",
      { type: "2" }
    );

    // console.log("从后端获取应用配置:", confResult);

    // 如果后端返回为空或无效，使用默认配置
    if (!confResult || !Array.isArray(confResult) || confResult.length === 0) {
      console.log("后端返回配置为空，使用默认配置");
      return { ...appDefaultConfig };
    }

    // 后端返回的是配置项数组，每个配置项包含 conf_key 和 conf_value
    // 需要将数组转换为对象
    const backendConfig = {};

    // 定义后端配置键到前端配置键的映射
    const keyMapping = {
      language: "language",
      sideMenuSingleMode: "sideMenuSingleMode",
      layout: "layout",
      sideMenuWidth: "sideMenuWidth",
      sideMenuTheme: "sideMenuTheme",
      breadCrumbFlag: "breadCrumbFlag",
      pageTagFlag: "pageTagFlag",
      jsonAutoSaveInterval: "jsonAutoSaveInterval",
      codeAutoSaveInterval: "codeAutoSaveInterval",
      textAutoSaveInterval: "textAutoSaveInterval",
      showTooltipsFlag: "showTooltipsFlag",
      keepTabsOnClose: "keepTabsOnClose",
      homeLayoutMode: "homeLayoutMode",
      homeVerticalLayout: "homeVerticalLayout",
    };

    // 遍历配置项数组，转换为配置对象
    confResult.forEach((item) => {
      if (item && item.conf_key) {
        const frontendKey = keyMapping[item.conf_key];
        if (frontendKey) {
          // 处理布尔值和数字类型
          let value = item.conf_value;

          // 转换布尔字符串
          if (value === "true") value = true;
          if (value === "false") value = false;

          // 转换数字字符串
          if (typeof value === "string" && !isNaN(value) && value !== "") {
            const numValue = Number(value);
            // 检查是否应该保持为字符串（如语言代码）
            if (
              frontendKey !== "language" &&
              frontendKey !== "layout" &&
              frontendKey !== "sideMenuTheme" &&
              frontendKey !== "sideMenuSingleMode" &&
              frontendKey !== "homeLayoutMode"
            ) {
              value = numValue;
            }
          }

          backendConfig[frontendKey] = value;
        }
      }
    });

    // console.log("解析后的后端配置:", backendConfig);

    // 处理按钮配置（type=2，每个按钮单独一条记录）
    if (buttonConfResult && Array.isArray(buttonConfResult)) {
      const buttonConfig = {};

      // 按钮ID列表
      const buttonIds = [
        "copy",
        "paste",
        "demo",
        "clear",
        "format",
        "compress",
        "sort",
        "addEscape",
        "removeEscape",
      ];

      buttonIds.forEach((btnId) => {
        // 查找该按钮的配置记录
        const buttonItem = buttonConfResult.find(
          (item) => item.conf_key === `btn_${btnId}`
        );

        if (buttonItem && buttonItem.conf_value) {
          try {
            // 解析 JSON 格式的配置：{"visible":true,"order":1}
            const btnConfig = JSON.parse(buttonItem.conf_value);
            buttonConfig[btnId] = btnConfig;
          } catch (e) {
            console.error(`解析按钮 ${btnId} 配置失败:`, e);
            // 使用默认配置
            buttonConfig[btnId] = appDefaultConfig.jsonEditorButtons[btnId];
          }
        } else {
          // 如果没有找到配置，使用默认配置
          buttonConfig[btnId] = appDefaultConfig.jsonEditorButtons[btnId];
        }
      });

      backendConfig.jsonEditorButtons = buttonConfig;
    } else {
      // 如果没有获取到按钮配置，使用默认配置
      backendConfig.jsonEditorButtons = appDefaultConfig.jsonEditorButtons;
    }

    // 合并默认配置和后端配置，后端配置优先
    return { ...appDefaultConfig, ...backendConfig };
  } catch (error) {
    console.error("从后端获取应用配置失败，使用默认配置:", error);
    return { ...appDefaultConfig };
  }
}
