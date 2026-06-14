/**
 * VS Code 文件图标映射配置
 * 从本地图标目录导入 SVG 文件
 */

import textIcon from "/@/assets/vscode-icons/file_type_text.svg";
import yamlIcon from "/@/assets/vscode-icons/file_type_light_yaml.svg";
import xmlIcon from "/@/assets/vscode-icons/file_type_xml.svg";
import tomlIcon from "/@/assets/vscode-icons/file_type_light_toml.svg";
import dockerIcon from "/@/assets/vscode-icons/file_type_docker.svg";
import shellIcon from "/@/assets/vscode-icons/file_type_shell.svg";
import markdownIcon from "/@/assets/vscode-icons/file_type_markdown.svg";
import sqlIcon from "/@/assets/vscode-icons/file_type_sql.svg";
import confIcon from "/@/assets/vscode-icons/file_type_config.svg";

/**
 * 文件格式到图标的映射
 */
export const FILE_FORMAT_ICON_MAPPING = {
  text: textIcon,
  yaml: yamlIcon,
  xml: xmlIcon,
  toml: tomlIcon,
  dockerfile: dockerIcon,
  shell: shellIcon,
  md: markdownIcon,
  sql: sqlIcon,
  conf: confIcon,
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
