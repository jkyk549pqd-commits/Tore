/**
 * 文件类型路由 Composable
 * 根据文件扩展名或内容自动识别类型，路由到对应编辑器
 */
import { useRouter } from "vue-router";
import { useUserStore } from "/@/store/modules/system/user";

// 文件扩展名到编辑器类型的映射
const EXTENSION_MAP = {
  // JSON Editor
  json: { editor: "json", path: "/json" },

  // Code Editor
  js: { editor: "code", path: "/code-editor", format: "javascript" },
  jsx: { editor: "code", path: "/code-editor", format: "javascript" },
  ts: { editor: "code", path: "/code-editor", format: "javascript" },
  tsx: { editor: "code", path: "/code-editor", format: "javascript" },
  py: { editor: "code", path: "/code-editor", format: "python" },
  java: { editor: "code", path: "/code-editor", format: "java" },
  go: { editor: "code", path: "/code-editor", format: "go" },

  // Text Editor
  yaml: { editor: "text", path: "/text-editor", format: "yaml" },
  yml: { editor: "text", path: "/text-editor", format: "yaml" },
  xml: { editor: "text", path: "/text-editor", format: "xml" },
  xsl: { editor: "text", path: "/text-editor", format: "xml" },
  xsd: { editor: "text", path: "/text-editor", format: "xml" },
  svg: { editor: "text", path: "/text-editor", format: "xml" },
  toml: { editor: "text", path: "/text-editor", format: "toml" },
  dockerfile: { editor: "text", path: "/text-editor", format: "dockerfile" },
  sh: { editor: "text", path: "/text-editor", format: "shell" },
  bash: { editor: "text", path: "/text-editor", format: "shell" },
  zsh: { editor: "text", path: "/text-editor", format: "shell" },
  md: { editor: "text", path: "/text-editor", format: "md" },
  markdown: { editor: "text", path: "/text-editor", format: "md" },
  sql: { editor: "text", path: "/text-editor", format: "sql" },
  conf: { editor: "text", path: "/text-editor", format: "conf" },
  ini: { editor: "text", path: "/text-editor", format: "conf" },
  properties: { editor: "text", path: "/text-editor", format: "properties" },
  txt: { editor: "text", path: "/text-editor", format: "text" },
};

export function useFileRouter() {
  const router = useRouter();

  const userStore = useUserStore();
  /**
   * 根据文件名获取扩展名
   */
  function getExtension(filename) {
    if (!filename) return "";
    // 处理 Dockerfile 等无扩展名文件
    const lower = filename.toLowerCase();
    if (lower === "dockerfile" || lower.startsWith("dockerfile.")) {
      return "dockerfile";
    }
    const parts = lower.split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  /**
   * 根据文件扩展名获取路由信息
   */
  function getRouteByExtension(filename) {
    const ext = getExtension(filename);
    return (
      EXTENSION_MAP[ext] || {
        editor: "text",
        path: "/text-editor",
        format: "text",
      }
    );
  }

  /**
   * 尝试检测内容类型
   */
  function detectContentType(content) {
    if (!content || typeof content !== "string") return null;
    const trimmed = content.trim();
    // JSON 检测
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        JSON.parse(trimmed);
        return { editor: "json", path: "/json" };
      } catch {
        return { editor: "text", path: "/text-editor", format: "text" };
      }
    }
    // YAML 检测 (以 --- 开头或包含 key: value 模式)
    if (trimmed.startsWith("---") || /^\w+:\s/m.test(trimmed)) {
      return { editor: "text", path: "/text-editor", format: "yaml" };
    }
    // XML 检测
    if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
      return { editor: "text", path: "/text-editor", format: "xml" };
    }
    // SQL 检测
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/im.test(trimmed)) {
      return { editor: "text", path: "/text-editor", format: "sql" };
    }
    // Shell 检测
    if (trimmed.startsWith("#!/bin/") || trimmed.startsWith("#!")) {
      return { editor: "text", path: "/text-editor", format: "shell" };
    }
    return { editor: "text", path: "/text-editor", format: "text" };
  }

  /**
   * 导航到对应编辑器
   */
  function navigateToEditor(editorType, options = {}) {
    const { format, content, filename } = options;
    const instanceId = userStore.getNextInstanceId();
    const query = { _instance_: instanceId };

    let path;
    switch (editorType) {
      case "json":
        path = "/json";
        break;
      case "code":
        path = "/code-editor";
        if (format) query.format = format;
        break;
      case "text":
        path = "/text-editor";
        if (format) query.format = format;
        break;
      default:
        path = "/json";
    }

    // 如果有内容，通过 sessionStorage 传递
    if (content) {
      sessionStorage.setItem("importedFileData", content);
      query.import = "true";
    }

    if (filename) {
      query.filename = filename;
    }

    router.push({ path, query });
  }

  /**
   * 根据文件自动路由
   */
  function routeFile(file) {
    return new Promise((resolve, reject) => {
      const routeInfo = getRouteByExtension(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        navigateToEditor(routeInfo.editor, {
          format: routeInfo.format,
          content,
          filename: file.name,
        });
        resolve();
      };

      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsText(file);
    });
  }

  return {
    getExtension,
    getRouteByExtension,
    detectContentType,
    navigateToEditor,
    routeFile,
    EXTENSION_MAP,
  };
}
