/**
 * JSON 编辑器操作相关的 Composable
 * 处理格式化、压缩、排序、转义等 JSON 操作
 */
import { ref } from "vue";
import { executeJsonOperationWithMessage } from "../json-operations";

export function useJsonEditorOperations({ emit, t, localValue }) {
  // 统一按钮状态管理
  const buttonStates = ref({
    format: false,
    escape: false,
  });

  /**
   * 统一的 JSON 操作处理函数
   * @param {string} operation - 操作类型 (format|compress|sort|addEscape|removeEscape)
   * @param {string|null} stateKey - 状态键值，用于切换按钮状态
   */
  function handleJsonOperation(operation, stateKey) {
    if (stateKey !== null) {
      buttonStates.value[stateKey] = !buttonStates.value[stateKey];
    }
    executeJsonOperationWithMessage(
      localValue.value,
      operation,
      (result) => {
        emit("update:modelValue", result);
      },
      t
    );
  }

  /**
   * 格式化 JSON
   */
  function handleFormat() {
    handleJsonOperation("format", "format");
  }

  /**
   * 压缩 JSON
   */
  function handleCompress() {
    handleJsonOperation("compress", "format");
  }

  /**
   * 排序 JSON 键
   */
  function handleSort() {
    handleJsonOperation("sort", null);
  }

  /**
   * 添加转义字符
   */
  function handleAddEscape() {
    handleJsonOperation("addEscape", "escape");
  }

  /**
   * 移除转义字符
   */
  function handleRemoveEscape() {
    handleJsonOperation("removeEscape", "escape");
  }

  return {
    buttonStates,
    handleFormat,
    handleCompress,
    handleSort,
    handleAddEscape,
    handleRemoveEscape,
  };
}
