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
    value: "javascript",
    label: "JavaScript",
    mode: "javascript",
    lint: true,
    icon: "Code",
    sampleFile: "script.js",
    description: "JavaScript 编程语言",
    extensions: ["js", "jsx", "mjs"],
    supportsFormatting: true,
    supportsLinting: true,
    supportsCodeGeneration: true,
  },
  {
    value: "python",
    label: "Python",
    mode: "python",
    lint: false,
    icon: "Code",
    sampleFile: "script.py",
    description: "Python 编程语言",
    extensions: ["py"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
  },
  {
    value: "java",
    label: "Java",
    mode: "text/x-java",
    lint: false,
    icon: "Code",
    sampleFile: "Main.java",
    description: "Java 编程语言",
    extensions: ["java"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
  },
  {
    value: "go",
    label: "Go",
    mode: "go",
    lint: false,
    icon: "Code",
    sampleFile: "main.go",
    description: "Go 编程语言",
    extensions: ["go"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
  },
  {
    value: "typescript",
    label: "TypeScript",
    mode: "text/typescript",
    lint: true,
    icon: "Code",
    sampleFile: "app.ts",
    description: "TypeScript 编程语言",
    extensions: ["ts", "tsx"],
    supportsFormatting: true,
    supportsLinting: true,
    supportsCodeGeneration: true,
  },
  {
    value: "cpp",
    label: "C++",
    mode: "text/x-c++src",
    lint: false,
    icon: "Code",
    sampleFile: "main.cpp",
    description: "C++ 编程语言",
    extensions: ["cpp", "cc", "cxx", "hpp", "h"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
  },
  {
    value: "c",
    label: "C",
    mode: "text/x-csrc",
    lint: false,
    icon: "Code",
    sampleFile: "main.c",
    description: "C 编程语言",
    extensions: ["c", "h"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
  },
  {
    value: "ruby",
    label: "Ruby",
    mode: "text/x-ruby",
    lint: false,
    icon: "Code",
    sampleFile: "app.rb",
    description: "Ruby 编程语言",
    extensions: ["rb"],
    supportsFormatting: true,
    supportsLinting: false,
    supportsCodeGeneration: true,
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
