/**
 * VS Code 文件图标映射配置
 * 从本地图标目录导入 SVG 文件
 */
import textIcon from "/@/assets/vscode-icons/file_type_text.svg";
import goIcon from "/@/assets/vscode-icons/file_type_go.svg";
import javaIcon from "/@/assets/vscode-icons/file_type_java.svg";
import nodeIcon from "/@/assets/vscode-icons/file_type_node.svg";
import pythonIcon from "/@/assets/vscode-icons/file_type_python.svg";
import typescriptIcon from "/@/assets/vscode-icons/file_type_typescript.svg";
import cppIcon from "/@/assets/vscode-icons/file_type_cpp.svg";
import cIcon from "/@/assets/vscode-icons/file_type_c.svg";
import rubyIcon from "/@/assets/vscode-icons/file_type_ruby.svg";

/**
 * 文件格式到图标的映射
 */
export const FILE_FORMAT_ICON_MAPPING = {
  text: textIcon,
  java: javaIcon,
  go: goIcon,
  javascript: nodeIcon,
  python: pythonIcon,
  typescript: typescriptIcon,
  cpp: cppIcon,
  c: cIcon,
  ruby: rubyIcon,
};

/**
 * 根据文件格式获取图标 URL
 * @param {string} formatValue - 文件格式值
 * @returns {string|null} 图标 URL，如果不存在则返回 null
 */
export const getIconForFormat = (formatValue) => {
  return FILE_FORMAT_ICON_MAPPING[formatValue] || null;
};

/**
 * 默认图标（当找不到对应格式图标时使用）
 */
export const DEFAULT_FILE_ICON = textIcon;
