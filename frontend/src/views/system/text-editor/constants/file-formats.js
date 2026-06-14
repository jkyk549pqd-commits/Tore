/**
 * 支持的文件格式配置
 */
export const SUPPORTED_FILE_FORMATS = [
  {
    value: "text",
    label: "Plain Text",
    mode: "text/plain",
    lint: false,
    icon: "Document",
    sampleFile: "readme.txt",
    description: "纯文本模式，无语法高亮",
  },
  {
    value: "yaml",
    label: "YAML",
    mode: "yaml",
    lint: true,
    icon: "DocumentCopy",
    sampleFile: "config.yaml",
    description: "YAML 配置文件",
    extensions: ["yaml", "yml"],
  },
  {
    value: "xml",
    label: "XML",
    mode: "xml",
    lint: false, // CodeMirror 5 没有内置的 XML lint 插件
    icon: "Document",
    sampleFile: "data.xml",
    description: "XML 标记语言",
    extensions: ["xml", "xsl", "xsd", "svg"],
  },
  {
    value: "toml",
    label: "TOML",
    mode: "toml",
    lint: true,
    icon: "Document",
    sampleFile: "config.toml",
    description: "TOML 配置文件",
    extensions: ["toml"],
  },
  {
    value: "dockerfile",
    label: "Dockerfile",
    mode: "dockerfile",
    lint: false,
    icon: "Platform",
    sampleFile: "Dockerfile",
    description: "Docker 容器配置",
    extensions: ["dockerfile", "Dockerfile"],
  },
  {
    value: "shell",
    label: "Shell Script",
    mode: "shell",
    lint: true,
    icon: "Promotion",
    sampleFile: "script.sh",
    description: "Shell 脚本文件",
    extensions: ["sh", "bash", "zsh"],
  },
  {
    value: "md",
    label: "Markdown",
    mode: "md",
    lint: true,
    icon: "md",
    sampleFile: "script.sh",
    description: "Markdown 文件",
    extensions: ["md"],
  },
  {
    value: "sql",
    label: "SQL",
    mode: "sql",
    lint: true,
    icon: "sql",
    sampleFile: "database.sql",
    description: "SQL 数据库脚本",
    extensions: ["sql"],
  },
  {
    value: "conf",
    label: "Config",
    mode: "properties",
    lint: false,
    icon: "conf",
    sampleFile: "app.conf",
    description: "配置文件 (conf/ini/properties)",
    extensions: ["conf", "ini", "cfg", "properties"],
  },
];

/**
 * 默认格式
 */
export const DEFAULT_FILE_FORMAT = "text";

/**
 * 根据格式值获取配置
 */
export const getFormatConfig = (formatValue) => {
  return (
    SUPPORTED_FILE_FORMATS.find((format) => format.value === formatValue) ||
    SUPPORTED_FILE_FORMATS[0]
  );
};

/**
 * 根据文件扩展名推断格式
 */
export const inferFormatFromExtension = (filename) => {
  if (!filename) return DEFAULT_FILE_FORMAT;

  const ext = filename.split(".").pop().toLowerCase();

  for (const format of SUPPORTED_FILE_FORMATS) {
    if (format.extensions && format.extensions.includes(ext)) {
      return format.value;
    }
  }

  return DEFAULT_FILE_FORMAT;
};
