/**
 * 剪贴板操作相关的 Composable
 * 处理复制、粘贴功能
 */
import { ref } from "vue";
import { ElMessage } from "element-plus";

export function useClipboardActions({ emit, t, localValue }) {
  // 统一按钮状态管理
  const buttonStates = ref({
    copy: false,
    paste: false,
    delete: false, // 用于清空按钮状态
  });

  /**
   * 复制内容到剪贴板
   * 优先使用现代 Clipboard API，保留旧版回退方案
   */
  async function handleCopy() {
    if (!localValue.value || localValue.value.trim() === "") {
      ElMessage.warning(t("textEditor.emptyContent"));
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // 现代方案：使用 Clipboard API
        await navigator.clipboard.writeText(localValue.value);
        buttonStates.value.copy = !buttonStates.value.copy;
        ElMessage.success(t("textEditor.copySuccess"));
      } else {
        // 回退方案：使用旧的 execCommand 方法
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = localValue.value;
        tempTextarea.style.position = "fixed";
        tempTextarea.style.left = "-999999px";
        document.body.appendChild(tempTextarea);
        tempTextarea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            buttonStates.value.copy = !buttonStates.value.copy;
            ElMessage.success(t("textEditor.copySuccess"));
          } else {
            ElMessage.error(t("textEditor.copyFailed"));
          }
        } catch (err) {
          ElMessage.error(t("textEditor.copyFailed"));
          console.error("复制错误:", err);
        } finally {
          document.body.removeChild(tempTextarea);
        }
      }
    } catch (err) {
      ElMessage.error(t("textEditor.copyFailed"));
      console.error("复制错误:", err);
    }
  }

  /**
   * 从剪贴板粘贴内容
   */
  async function handlePaste() {
    // 检查是否支持 Clipboard API
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      ElMessage.error(t("textEditor.browserNotSupportPaste"));
      return;
    }

    try {
      const pastedText = await navigator.clipboard.readText();
      if (pastedText && pastedText.trim() !== "") {
        localValue.value = pastedText;
        buttonStates.value.paste = !buttonStates.value.paste;
      } else {
        ElMessage.warning(t("textEditor.clipboardEmpty"));
      }
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.message.includes("permission")
      ) {
        ElMessage.error(t("textEditor.noClipboardPermission"));
      } else {
        ElMessage.error(t("textEditor.pasteFailed"));
      }
      console.error("粘贴错误:", err);
    }
  }

  /**
   * 清空编辑器内容
   */
  function handleClear() {
    if (!localValue.value || localValue.value.trim() === "") {
      ElMessage.warning(t("textEditor.emptyContent"));
      return;
    }
    localValue.value = "";
    buttonStates.value.delete = !buttonStates.value.delete;
  }

  return {
    buttonStates,
    handleCopy,
    handlePaste,
    handleClear,
  };
}
