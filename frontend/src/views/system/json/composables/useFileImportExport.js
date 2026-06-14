/**
 * 文件导入导出相关的 Composable
 * 处理文件导入、导出功能
 */
import { ref } from "vue";
import { ElMessage } from "element-plus";

export function useFileImportExport({ emit, t, localValue }) {
  // 导入弹框状态
  const importDialogVisible = ref(false);

  /**
   * 打开导入对话框
   */
  function handleImport() {
    importDialogVisible.value = true;
  }

  /**
   * 处理文件读取和验证
   * @param {File} file - 要处理的文件对象
   */
  function processFile(file) {
    // 检查文件类型
    const validTypes = [
      "text/plain",
      "application/json",
      "application/octet-stream",
    ];
    const fileName = file.name.toLowerCase();
    const isValidType =
      validTypes.includes(file.type) ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".json");

    if (!isValidType) {
      ElMessage.error(t("json.editor.invalidFileType"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // 验证是否为有效的JSON
        if (content.trim()) {
          JSON.parse(content); // 验证JSON格式
          localValue.value = content;
          ElMessage.success(t("json.editor.importSuccess"));
          importDialogVisible.value = false;
        } else {
          ElMessage.warning(t("json.editor.emptyFileContent"));
        }
      } catch (error) {
        ElMessage.error(t("json.editor.invalidJsonFormat"));
        console.error("JSON解析错误:", error);
      }
    };
    reader.onerror = () => {
      ElMessage.error(t("json.editor.fileReadError"));
    };
    reader.readAsText(file);
  }

  /**
   * 导出当前编辑器内容为文件
   */
  function handleExport() {
    if (!localValue.value || localValue.value.trim() === "") {
      ElMessage.warning(t("json.editor.emptyContent"));
      return;
    }

    try {
      // 创建Blob对象，保持当前格式
      const blob = new Blob([localValue.value], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `json-export-${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      ElMessage.success(t("json.editor.exportSuccess"));
    } catch (error) {
      ElMessage.error(t("json.editor.exportFailed"));
      console.error("导出错误:", error);
    }
  }

  /**
   * 关闭导入弹框
   */
  function handleCloseImportDialog() {
    importDialogVisible.value = false;
  }

  return {
    importDialogVisible,
    handleImport,
    handleExport,
    handleCloseImportDialog,
    processFile,
  };
}
