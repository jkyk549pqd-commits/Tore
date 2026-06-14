/**
 * 文件导入导出相关的 Composable
 * 处理文本文件的导入、导出功能（基于 JSON 编辑器，但不做 JSON 格式验证）
 */
import { ref, toValue } from "vue";
import { ElMessage } from "element-plus";

export function useFileImportExport({
  emit,
  t,
  localValue,
  currentFileFormat,
}) {
  // 导入弹框状态
  const importDialogVisible = ref(false);

  // 文件格式到后缀名的映射
  const formatExtensions = {
    text: "txt",
    yaml: "yaml",
    xml: "xml",
    toml: "toml",
    properties: "properties",
    dockerfile: "dockerfile",
    shell: "sh",
    conf: "conf",
    javascript: "js",
    java: "java",
    python: "py",
    go: "go",
  };

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
    // 检查文件类型（支持纯文本文件）
    const validTypes = [
      "text/plain",
      "text/markdown",
      "text/javascript",
      "application/json",
      "application/octet-stream",
    ];
    const fileName = file.name.toLowerCase();
    const isValidType =
      validTypes.includes(file.type) ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".js") ||
      fileName.endsWith(".json") ||
      fileName.endsWith(".css") ||
      fileName.endsWith(".html") ||
      fileName.endsWith(".xml") ||
      fileName.endsWith(".yaml") ||
      fileName.endsWith(".yml");

    if (!isValidType) {
      ElMessage.error(t("json.editor.invalidFileType"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // 直接读取文件内容，不做 JSON 格式验证
        if (content.trim()) {
          localValue.value = content;
          ElMessage.success(t("json.editor.importSuccess"));
          importDialogVisible.value = false;
        } else {
          ElMessage.warning(t("json.editor.emptyFileContent"));
        }
      } catch (error) {
        ElMessage.error(t("json.editor.fileReadError"));
        console.error("文件读取错误:", error);
      }
    };
    reader.onerror = () => {
      ElMessage.error(t("json.editor.fileReadError"));
    };
    reader.readAsText(file);
  }

  /**
   * 根据文件格式获取MIME类型
   */
  function getMimeType(format) {
    const mimeTypes = {
      text: "text/plain",
      yaml: "text/yaml",
      xml: "text/xml",
      toml: "text/plain",
      properties: "text/plain",
      dockerfile: "text/plain",
      shell: "text/x-shellscript",
      conf: "text/plain",
    };
    return mimeTypes[format] || "text/plain";
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
      // 使用 toValue 获取当前文件格式的实际值
      const format = toValue(currentFileFormat);

      // 根据当前文件格式获取后缀名和MIME类型
      const extension = formatExtensions[format] || "txt";
      const mimeType = getMimeType(format);

      // 创建Blob对象，使用对应的MIME类型
      const blob = new Blob([localValue.value], {
        type: `${mimeType};charset=utf-8`,
      });

      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `code-editor-export-${timestamp}.${extension}`;

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      ElMessage.success(t("json.editor.exportSuccess") + ` (${extension})`);
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
