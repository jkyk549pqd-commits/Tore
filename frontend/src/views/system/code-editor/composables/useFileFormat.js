import { ref, computed } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import {
  SUPPORTED_FILE_FORMATS,
  DEFAULT_FILE_FORMAT,
  getFormatConfig,
  inferFormatFromExtension,
} from "../constants/file-formats";

/**
 * 文件格式管理 Composable
 * 负责格式选择、切换和状态持久化
 */
export function useFileFormat(stateKey) {
  const appConfigStore = useAppConfigStore();

  // 当前选择的格式
  const selectedFormat = ref(DEFAULT_FILE_FORMAT);

  // 格式选项列表
  const formatOptions = computed(() => SUPPORTED_FILE_FORMATS);

  // 当前格式的配置
  const currentFormatConfig = computed(() =>
    getFormatConfig(selectedFormat.value)
  );

  /**
   * 初始化格式选择
   * 从状态管理中恢复上次选择的格式
   */
  const initializeFormat = () => {
    const currentState = appConfigStore.$state || {};

    // 验证格式是否在支持的列表中
    const isValidFormat = (format) => {
      return SUPPORTED_FILE_FORMATS.some((f) => f.value === format);
    };

    // 优先使用状态管理中的 CodeEditor 格式
    if (currentState.selectedCodeFileFormat) {
      if (isValidFormat(currentState.selectedCodeFileFormat)) {
        selectedFormat.value = currentState.selectedCodeFileFormat;
      } else {
        // 无效格式，使用默认值并更新 store
        console.warn(
          `CodeEditor: 检测到无效的文件格式 ${currentState.selectedCodeFileFormat}，重置为默认值 ${DEFAULT_FILE_FORMAT}`
        );
        selectedFormat.value = DEFAULT_FILE_FORMAT;
        saveFormatToState(DEFAULT_FILE_FORMAT);
      }
    } else {
      // 默认使用纯文本格式
      selectedFormat.value = DEFAULT_FILE_FORMAT;
      saveFormatToState(DEFAULT_FILE_FORMAT);
    }
  };

  /**
   * 切换文件格式
   */
  const switchFormat = (newFormat) => {
    if (!newFormat || newFormat === selectedFormat.value) {
      return;
    }
    selectedFormat.value = newFormat;

    // 保存到状态管理
    saveFormatToState(newFormat);
  };

  /**
   * 保存格式到状态管理
   */
  const saveFormatToState = (format) => {
    appConfigStore.$patch({
      selectedCodeFileFormat: format,
    });
  };

  /**
   * 重置格式到默认值
   */
  const resetFormat = () => {
    switchFormat(DEFAULT_FILE_FORMAT);
  };

  /**
   * 根据文件名自动推断格式
   */
  const autoDetectFormat = (filename) => {
    if (!filename) return;

    const inferredFormat = inferFormatFromExtension(filename);
    if (inferredFormat !== DEFAULT_FILE_FORMAT) {
      switchFormat(inferredFormat);
    }
  };

  return {
    selectedFormat,
    formatOptions,
    currentFormatConfig,
    initializeFormat,
    switchFormat,
    resetFormat,
    autoDetectFormat,
    DEFAULT_FILE_FORMAT,
  };
}

// 导出常量和工具函数
export { DEFAULT_FILE_FORMAT, inferFormatFromExtension, getFormatConfig };
