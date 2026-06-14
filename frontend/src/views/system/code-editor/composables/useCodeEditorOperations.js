/**
 * 代码编辑器操作相关的 Composable
 * 管理格式化和压缩等操作
 */
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  executeTextOperationWithMessage,
  formatTextString,
  compressTextString,
} from "../text-operations";

export function useCodeEditorOperations({
  emit,
  t,
  localValue,
  currentFileFormat,
}) {
  // 按钮状态管理
  const buttonStates = ref({
    format: false,
  });

  // 支持格式化和压缩的格式列表
  const supportedFormats = [
    "javascript",
    "python",
    "java",
    "go",
  ];

  // 判断当前格式是否支持格式化和压缩
  const isFormatSupported = computed(() => {
    return supportedFormats.includes(currentFileFormat.value);
  });

  /**
   * 统一的文本操作处理函数
   * @param {string} operation - 操作类型 (format|compress)
   * @param {string|null} stateKey - 状态键值，用于切换按钮状态
   */
  function handleTextOperation(operation, stateKey) {
    const textContent = localValue.value;

    // 检查是否支持该格式
    if (!isFormatSupported.value) {
      ElMessage.warning(
        t("codeEditor.formatNotSupported") ||
          `当前格式 ${currentFileFormat.value.toUpperCase()} 不支持格式化和压缩操作`
      );
      return;
    }

    // 检查内容是否为空
    if (!textContent || textContent.trim() === "") {
      ElMessage.warning(
        t("codeEditor.emptyContentWarning") || "内容为空，无法操作"
      );
      return;
    }

    // 执行文本操作
    executeTextOperationWithMessage(
      textContent,
      operation,
      currentFileFormat.value,
      (result) => {
        // 更新编辑器内容
        localValue.value = result;
        emit("update:modelValue", result);
        emit("change", result);

        // 切换按钮状态
        if (stateKey) {
          buttonStates.value[stateKey] = operation === "format";
        }
      }
    );
  }

  /**
   * 格式化文本
   */
  function handleFormat() {
    handleTextOperation("format", "format");
  }

  /**
   * 压缩文本
   */
  function handleCompress() {
    handleTextOperation("compress", "format");
  }

  /**
   * 重置按钮状态
   * @param {string} stateKey - 要重置的状态键
   */
  function resetButtonState(stateKey) {
    if (stateKey && buttonStates.value[stateKey] !== undefined) {
      buttonStates.value[stateKey] = false;
    }
  }

  /**
   * 获取按钮状态
   */
  function getButtonStates() {
    return buttonStates.value;
  }

  /**
   * 判断是否显示格式化/压缩按钮
   */
  function showFormatButtons() {
    return isFormatSupported.value;
  }

  return {
    buttonStates,
    isFormatSupported,
    handleFormat,
    handleCompress,
    resetButtonState,
    getButtonStates,
    showFormatButtons,
  };
}
