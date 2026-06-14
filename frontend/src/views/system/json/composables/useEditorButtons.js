/**
 * 编辑器按钮配置相关的 Composable
 * 管理按钮定义、配置、排序、可见性等
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SortAscendingOutlined,
  PlusOutlined,
  MinusOutlined,
  CompassOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons-vue";
import { Document, CopyDocument } from "@element-plus/icons-vue";

export function useEditorButtons({ props, appConfigStore }) {
  const { t } = useI18n();

  /**
   * 按钮定义对象
   * 包含所有按钮的配置信息：图标、提示文本、处理函数、状态键等
   */
  const buttonDefinitions = {
    import: {
      icon: ImportOutlined,
      tooltip: "json.card.importBtn",
      handler: null, // 将由外部传入
      stateKey: "import",
      reverseType: true,
    },
    export: {
      icon: ExportOutlined,
      tooltip: "json.card.exportBtn",
      handler: null,
      stateKey: "import",
    },
    copy: {
      icon: CopyDocument,
      tooltip: "json.card.copyBtn",
      handler: null,
      stateKey: "copy",
    },
    paste: {
      icon: Document,
      tooltip: "json.card.pasteBtn",
      handler: null,
      stateKey: "copy",
      reverseType: true,
    },
    demo: {
      icon: CompassOutlined,
      tooltip: "tool.btn.demo",
      handler: null,
      stateKey: "delete",
      condition: "showDemo",
      reverseType: true,
    },
    clear: {
      icon: DeleteOutlined,
      tooltip: "tool.btn.clear",
      handler: null,
      stateKey: "delete",
    },
    format: {
      icon: ZoomInOutlined,
      tooltip: "tool.btn.format",
      handler: null,
      stateKey: "format",
    },
    compress: {
      icon: ZoomOutOutlined,
      tooltip: "tool.btn.compress",
      handler: null,
      stateKey: "format",
      reverseType: true,
    },
    sort: {
      icon: SortAscendingOutlined,
      tooltip: "tool.btn.sort",
      handler: null,
      stateKey: null,
    },
    addEscape: {
      icon: PlusOutlined,
      tooltip: "tool.btn.addEscape",
      handler: null,
      stateKey: "escape",
    },
    removeEscape: {
      icon: MinusOutlined,
      tooltip: "tool.btn.removeEscape",
      handler: null,
      stateKey: "escape",
      reverseType: true,
    },
  };

  /**
   * 从 store 读取按钮配置
   * 确保配置中包含所有定义的按钮
   */
  const buttonConfig = computed(() => {
    const config = appConfigStore.jsonEditorButtons;

    if (config) {
      const allButtonIds = Object.keys(buttonDefinitions);
      return allButtonIds.map((id) => {
        if (config[id]) {
          return {
            id,
            visible: config[id].visible,
            order: config[id].order,
          };
        } else {
          const index = allButtonIds.indexOf(id);
          return {
            id,
            visible: true,
            order: index + 1,
          };
        }
      });
    }

    return Object.keys(buttonDefinitions).map((id, index) => ({
      id,
      visible: true,
      order: index + 1,
    }));
  });

  /**
   * 排序后的按钮列表
   */
  const sortedButtons = computed(() => {
    return [...buttonConfig.value].sort((a, b) => a.order - b.order);
  });

  /**
   * 判断按钮是否应该显示
   * @param {string} buttonId - 按钮ID
   * @returns {boolean} 是否显示
   */
  function shouldShowButton(buttonId) {
    const def = buttonDefinitions[buttonId];
    if (def && def.condition === "showDemo") {
      return props.showDemo;
    }
    return true;
  }

  /**
   * 获取按钮的 tooltip 文本
   * @param {string} buttonId - 按钮ID
   * @returns {string} tooltip 文本
   */
  function getButtonTooltip(buttonId) {
    const def = buttonDefinitions[buttonId];
    return def ? t(def.tooltip) : "";
  }

  /**
   * 获取按钮的图标组件
   * @param {string} buttonId - 按钮ID
   * @returns {Component} 图标组件
   */
  function getButtonIcon(buttonId) {
    return buttonDefinitions[buttonId]?.icon;
  }

  /**
   * 获取按钮的类型（primary/default）
   * @param {string} buttonId - 按钮ID
   * @param {Object} buttonStates - 按钮状态对象
   * @returns {string} 按钮类型
   */
  function getButtonType(buttonId, buttonStates) {
    const def = buttonDefinitions[buttonId];
    if (!def) return "default";

    if (def.stateKey) {
      const stateValue = buttonStates[def.stateKey];
      return def.reverseType
        ? stateValue
          ? "default"
          : "primary"
        : stateValue
        ? "primary"
        : "default";
    }

    return "primary";
  }

  /**
   * 获取按钮的处理函数
   * @param {string} buttonId - 按钮ID
   * @param {Object} handlers - 处理函数映射对象
   * @returns {Function} 处理函数
   */
  function getButtonHandler(buttonId, handlers) {
    const def = buttonDefinitions[buttonId];
    return def?.handler || (() => {});
  }

  return {
    buttonDefinitions,
    buttonConfig,
    sortedButtons,
    shouldShowButton,
    getButtonTooltip,
    getButtonIcon,
    getButtonType,
    getButtonHandler,
  };
}
