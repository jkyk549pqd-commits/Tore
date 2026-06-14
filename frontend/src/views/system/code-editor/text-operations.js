/**
 * 文本操作工具函数
 * 提供多种格式（SQL、YAML、XML、TOML、编程语言等）的格式化和压缩功能
 */

import { ElMessage } from "element-plus";
import { format } from "sql-formatter";

/**
 * 格式化 SQL 语句
 * @param {string} sqlString - SQL 字符串
 * @param {Object} options - 格式化选项
 * @param {string} options.language - SQL 语言类型 (sql, mysql, postgresql, sqlite 等)
 * @param {number} options.indentSize - 缩进大小，默认为 2
 * @param {string} options.indentStyle - 缩进风格 (space | tab)，默认为 space
 * @param {boolean} options.uppercase - 关键字大写，默认为 false
 * @returns {string} 格式化后的 SQL 字符串
 */
export function formatSQLString(sqlString, options = {}) {
  if (!sqlString || sqlString.trim() === "") {
    return sqlString;
  }

  try {
    // 配置 sql-formatter 选项
    const formatterOptions = {
      language: options.language || "sql",
      tabWidth: options.indentSize || 2,
      useTabs: options.indentStyle === "tab",
      keywordCase: options.uppercase ? "upper" : "preserve",
      expressionWidth: 50, // 设置一个合理的宽度值以启用自动换行
      indentStyle: "standard", // 标准缩进风格
    };

    // 使用 sql-formatter 进行格式化
    // sql-formatter 自动支持 DDL 和 DML 语句
    const formatted = format(sqlString, formatterOptions);

    return formatted.trim();
  } catch (error) {
    // 如果格式化失败，提供详细的错误信息
    throw new Error(`SQL 格式化失败: ${error.message}`);
  }
}

/**
 * 压缩 SQL 语句
 * @param {string} sqlString - SQL 字符串
 * @returns {string} 压缩后的 SQL 字符串
 */
export function compressSQLString(sqlString) {
  if (!sqlString || sqlString.trim() === "") {
    return sqlString;
  }

  try {
    // 移除注释和多余空白
    return sqlString
      .replace(/--.*$/gm, "") // 移除单行注释
      .replace(/\/\*[\s\S]*?\*\//g, "") // 移除多行注释
      .replace(/\s+/g, " ") // 压缩空白为单个空格
      .replace(/\s*([(),;])\s*/g, "$1") // 移除符号周围空格
      .trim();
  } catch (error) {
    throw new Error("SQL 压缩失败: " + error.message);
  }
}

/**
 * 格式化 YAML 字符串
 * @param {string} yamlString - YAML 字符串
 * @returns {string} 格式化后的 YAML 字符串
 */
export function formatYAMLString(yamlString) {
  if (!yamlString || yamlString.trim() === "") {
    return yamlString;
  }

  try {
    // 基础 YAML 格式化（简化版本）
    // 如果需要完整的 YAML 解析，可以使用 js-yaml 库
    const lines = yamlString.split("\n");
    const formatted = [];
    let indent = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        // 保留空行和注释
        formatted.push(line);
        return;
      }

      // 计算当前缩进
      const currentIndent = line.search(/\S/);
      if (currentIndent < indent) {
        indent = currentIndent;
      }

      // 简单的键值对格式化
      if (trimmed.includes(":")) {
        const [key, value] = trimmed.split(":").map((s) => s.trim());
        if (value) {
          formatted.push("  ".repeat(indent) + `${key}: ${value}`);
        } else {
          formatted.push("  ".repeat(indent) + `${key}:`);
          indent += 2;
        }
      } else {
        formatted.push("  ".repeat(indent) + trimmed);
      }
    });

    return formatted.join("\n").trim();
  } catch (error) {
    throw new Error("YAML 格式化失败: " + error.message);
  }
}

/**
 * 压缩 YAML 字符串
 * @param {string} yamlString - YAML 字符串
 * @returns {string} 压缩后的 YAML 字符串
 */
export function compressYAMLString(yamlString) {
  if (!yamlString || yamlString.trim() === "") {
    return yamlString;
  }

  try {
    // 移除多余空白，但保留基本结构
    return yamlString
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/^[ \t]+/gm, (match) => {
        // 保持必要的缩进
        const minimalIndent = Math.min(2, match.length);
        return " ".repeat(minimalIndent);
      })
      .trim();
  } catch (error) {
    throw new Error("YAML 压缩失败: " + error.message);
  }
}

/**
 * 格式化 XML 字符串
 * @param {string} xmlString - XML 字符串
 * @param {number} indentSize - 缩进大小
 * @returns {string} 格式化后的 XML 字符串
 */
export function formatXMLString(xmlString, indentSize = 2) {
  if (!xmlString || xmlString.trim() === "") {
    return xmlString;
  }

  try {
    // 基础 XML 格式化（简化版本）
    const indent = " ".repeat(indentSize);
    let formatted = "";
    let pad = 0;

    // 移除空白和换行
    xmlString = xmlString.replace(/>\s+</g, "><").trim();

    // 格式化标签
    const tokens = xmlString.split(/(<[^>]+>)/g).filter(Boolean);

    tokens.forEach((token) => {
      if (token.match(/^<\/\w/)) {
        // 闭合标签，减少缩进
        pad = Math.max(0, pad - 1);
      }

      if (token.trim()) {
        formatted += indent.repeat(pad) + token + "\n";
      }

      if (token.match(/^<\w[^>]*[^\/]$/)) {
        // 开始标签（非自闭合），增加缩进
        pad++;
      }
    });

    return formatted.trim();
  } catch (error) {
    throw new Error("XML 格式化失败: " + error.message);
  }
}

/**
 * 压缩 XML 字符串
 * @param {string} xmlString - XML 字符串
 * @returns {string} 压缩后的 XML 字符串
 */
export function compressXMLString(xmlString) {
  if (!xmlString || xmlString.trim() === "") {
    return xmlString;
  }

  try {
    // 移除所有空白和换行
    return xmlString
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/\s*([<>])\s*/g, "$1")
      .trim();
  } catch (error) {
    throw new Error("XML 压缩失败: " + error.message);
  }
}

/**
 * 格式化 TOML 字符串
 * @param {string} tomlString - TOML 字符串
 * @returns {string} 格式化后的 TOML 字符串
 */
export function formatTOMLString(tomlString) {
  if (!tomlString || tomlString.trim() === "") {
    return tomlString;
  }

  try {
    // 基础 TOML 格式化（简化版本）
    const lines = tomlString.split("\n");
    const formatted = [];
    let currentSection = "";

    lines.forEach((line) => {
      const trimmed = line.trim();

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith("#")) {
        formatted.push(line);
        return;
      }

      // 处理节（section）
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        if (formatted.length > 0) {
          formatted.push(""); // 节之间添加空行
        }
        formatted.push(trimmed);
        return;
      }

      // 处理键值对
      if (trimmed.includes("=")) {
        const [key, value] = trimmed.split("=").map((s) => s.trim());
        formatted.push(`${key} = ${value}`);
      } else {
        formatted.push(trimmed);
      }
    });

    return formatted.join("\n").trim();
  } catch (error) {
    throw new Error("TOML 格式化失败: " + error.message);
  }
}

/**
 * 压缩 TOML 字符串
 * @param {string} tomlString - TOML 字符串
 * @returns {string} 压缩后的 TOML 字符串
 */
export function compressTOMLString(tomlString) {
  if (!tomlString || tomlString.trim() === "") {
    return tomlString;
  }

  try {
    // 移除多余空白
    return tomlString
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/\s*=\s*/g, "=") // 移除等号周围空格
      .trim();
  } catch (error) {
    throw new Error("TOML 压缩失败: " + error.message);
  }
}

/**
 * 格式化配置文件（conf/ini/properties）
 * @param {string} configString - 配置字符串
 * @returns {string} 格式化后的配置字符串
 */
export function formatConfigString(configString) {
  if (!configString || configString.trim() === "") {
    return configString;
  }

  try {
    const lines = configString.split("\n");
    const formatted = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) {
        formatted.push(line);
        return;
      }

      // 处理键值对（支持 = 和 : 分隔符）
      const separators = ["=", ":"];
      let separatorIndex = -1;

      for (const sep of separators) {
        const index = trimmed.indexOf(sep);
        if (index > 0) {
          separatorIndex = index;
          break;
        }
      }

      if (separatorIndex > 0) {
        const key = trimmed.substring(0, separatorIndex).trim();
        const value = trimmed.substring(separatorIndex + 1).trim();
        const separator = trimmed[separatorIndex];
        formatted.push(`${key} ${separator} ${value}`);
      } else {
        formatted.push(trimmed);
      }
    });

    return formatted.join("\n").trim();
  } catch (error) {
    throw new Error("配置文件格式化失败: " + error.message);
  }
}

/**
 * 压缩配置文件（conf/ini/properties）
 * @param {string} configString - 配置字符串
 * @returns {string} 压缩后的配置字符串
 */
export function compressConfigString(configString) {
  if (!configString || configString.trim() === "") {
    return configString;
  }

  try {
    return configString
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/\s*([=:])\s*/g, "$1") // 移除分隔符周围空格
      .trim();
  } catch (error) {
    throw new Error("配置文件压缩失败: " + error.message);
  }
}

/**
 * 统一的文本格式化函数
 * @param {string} textString - 文本字符串
 * @param {string} format - 格式类型 (sql|yaml|xml|toml|conf|javascript|python|java|go)
 * @returns {string} 格式化后的文本字符串
 * @throws {Error} 如果格式化失败
 */
export function formatTextString(textString, format) {
  if (!textString) return textString;

  const formatFunctions = {
    sql: formatSQLString,
    yaml: formatYAMLString,
    xml: formatXMLString,
    toml: formatTOMLString,
    conf: formatConfigString,
    javascript: formatJavaScriptCode,
    python: formatPythonCode,
    java: formatJavaCode,
    go: formatGoCode,
  };

  const formatFn = formatFunctions[format];
  if (!formatFn) {
    throw new Error(`不支持的格式: ${format}`);
  }

  return formatFn(textString);
}

/**
 * 统一的文本压缩函数
 * @param {string} textString - 文本字符串
 * @param {string} format - 格式类型 (sql|yaml|xml|toml|conf|javascript|python|java|go)
 * @returns {string} 压缩后的文本字符串
 * @throws {Error} 如果压缩失败
 */
export function compressTextString(textString, format) {
  if (!textString) return textString;

  const compressFunctions = {
    sql: compressSQLString,
    yaml: compressYAMLString,
    xml: compressXMLString,
    toml: compressTOMLString,
    conf: compressConfigString,
    javascript: compressJavaScriptCode,
    python: compressPythonCode,
    java: compressJavaCode,
    go: compressGoCode,
  };

  const compressFn = compressFunctions[format];
  if (!compressFn) {
    throw new Error(`不支持的格式: ${format}`);
  }

  return compressFn(textString);
}

/**
 * 执行文本操作
 * @param {string} textString - 文本字符串
 * @param {string} operation - 操作类型: 'format', 'compress'
 * @param {string} format - 格式类型 (sql|yaml|xml|toml|conf)
 * @returns {Object} 包含success, result, error的对象
 */
export function executeTextOperation(textString, operation, format) {
  try {
    if (!textString || textString.trim() === "") {
      return {
        success: true,
        result: textString,
        error: null,
      };
    }

    let result;
    switch (operation) {
      case "format":
        result = formatTextString(textString, format);
        break;
      case "compress":
        result = compressTextString(textString, format);
        break;
      default:
        throw new Error(`不支持的操作: ${operation}`);
    }

    return {
      success: true,
      result,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      result: textString,
      error: error.message,
    };
  }
}

/**
 * 带消息提示的文本操作执行
 * @param {string} textString - 文本字符串
 * @param {string} operation - 操作类型: 'format', 'compress'
 * @param {string} format - 格式类型 (sql|yaml|xml|toml|conf)
 * @param {Function} callback - 回调函数，接收处理后的文本
 */
export function executeTextOperationWithMessage(
  textString,
  operation,
  format,
  callback
) {
  const { success, result, error } = executeTextOperation(
    textString,
    operation,
    format
  );

  if (success) {
    // ElMessage.success(getSuccessMessage(operation));
    callback(result);
  } else {
    ElMessage.error(error || getErrorMessage(operation, format));
  }
}

/**
 * 获取成功消息
 * @param {string} operation - 操作类型
 * @returns {string} 成功消息
 */
function getSuccessMessage(operation) {
  const messages = {
    format: "格式化成功",
    compress: "压缩成功",
  };
  return messages[operation] || "操作成功";
}

/**
 * 获取错误消息
 * @param {string} operation - 操作类型
 * @param {string} format - 格式类型
 * @returns {string} 错误消息
 */
function getErrorMessage(operation, format) {
  const messages = {
    format: `${format.toUpperCase()} 格式错误，无法格式化，请检查后重试！`,
    compress: `${format.toUpperCase()} 格式错误，无法压缩，请检查后重试！`,
  };
  return messages[operation] || "操作失败，请检查后重试！";
}

/**
 * 文本状态持久化管理器
 * 负责文本编辑器状态的保存、恢复和重置
 */
export const TextStatePersistenceManager = {
  /**
   * 保存当前状态到store
   * @param {Object} params - 保存参数
   * @param {string} params.stateKey - 状态键
   * @param {string} params.textContent - 文本内容
   * @param {boolean} params.showCodemirrorConf - 是否显示CodeMirror配置面板
   * @param {string} params.selectedFileFormat - 选中的文件格式
   * @param {boolean} params.isContentSaved - 内容是否已保存
   * @param {Object} userStore - 用户store实例
   */
  saveStateToStore({
    stateKey,
    textContent,
    showCodemirrorConf,
    selectedFileFormat,
    isContentSaved,
    userStore,
  }) {
    userStore.setInstanceState(stateKey, {
      textContent,
      showCodemirrorConf,
      selectedFileFormat,
      isContentSaved,
    });
  },

  /**
   * 从store恢复状态
   * @param {string} stateKey - 状态键
   * @param {Object} userStore - 用户store实例
   * @returns {Object|null} 恢复的状态对象
   */
  restoreStateFromStore(stateKey, userStore) {
    return userStore.getInstanceState(stateKey);
  },

  /**
   * 重置编辑器状态
   * @param {Function} setTextContent - 设置文本内容的函数
   * @param {Function} setShowCodemirrorConf - 设置是否显示CodeMirror配置面板的函数
   */
  resetEditorState(setTextContent, setShowCodemirrorConf) {
    setTextContent("");
    setShowCodemirrorConf(false);
  },

  /**
   * 应用恢复的状态
   * @param {Object} state - 要应用的状态
   * @param {Function} setTextContent - 设置文本内容的函数
   * @param {Function} setShowCodemirrorConf - 设置是否显示CodeMirror配置面板的函数
   */
  applyRestoredState(state, setTextContent, setShowCodemirrorConf) {
    setTextContent(state.textContent || "");
    setShowCodemirrorConf(state.showCodemirrorConf || false);
  },
};

/**
 * 文本对比工具
 */
export const TextCompare = {
  /**
   * 准备比较数据并保存到sessionStorage
   * @param {string} textStr1 - 第一个文本字符串
   * @param {string} textStr2 - 第二个文本字符串
   * @param {string} format - 文本格式
   * @returns {boolean} 是否准备成功
   */
  prepareCompareData(textStr1, textStr2, format = "text") {
    if (!textStr1 || !textStr2) {
      return false;
    }

    try {
      // 直接复用 sessionStorage 的 'jsonDiff' key
      // jsonDiff 页面应该能处理普通文本对比
      sessionStorage.setItem(
        "jsonDiff",
        JSON.stringify({
          jsonStr1: textStr1, // 复用 jsonStr1 字段名
          jsonStr2: textStr2, // 复用 jsonStr2 字段名
          format: format, // 添加格式标识
          isText: true, // 标识为文本对比
        })
      );
      return true;
    } catch (e) {
      console.warn("prepareCompareData set sessionStorage failed", e);
      return false;
    }
  },
};

/**
 * 编程语言格式化函数
 */

/**
 * 格式化 JavaScript 代码
 * @param {string} code - JavaScript 代码字符串
 * @returns {string} 格式化后的代码
 */
export function formatJavaScriptCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // 简化的 JavaScript 格式化（避免浏览器环境 Prettier 兼容性问题）
    const lines = code.split("\n");
    const formatted = [];
    let indentLevel = 0;
    const indentSize = 2;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        // 保留空行但不超过一个
        if (
          formatted.length > 0 &&
          formatted[formatted.length - 1].trim() !== ""
        ) {
          formatted.push("");
        }
        continue;
      }

      // 处理缩进减少
      if (
        trimmed.startsWith("}") ||
        trimmed.startsWith("]") ||
        trimmed.startsWith(")") ||
        trimmed.startsWith("else") ||
        trimmed.startsWith("catch") ||
        trimmed.startsWith("finally")
      ) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 添加适当缩进
      formatted.push(" ".repeat(indentLevel * indentSize) + trimmed);

      // 处理缩进增加
      if (
        trimmed.endsWith("{") ||
        trimmed.endsWith("[") ||
        trimmed.endsWith("(")
      ) {
        indentLevel++;
      }
    }

    return formatted.join("\n");
  } catch (error) {
    throw new Error(`JavaScript 格式化失败: ${error.message}`);
  }
}

/**
 * 压缩 JavaScript 代码
 * @param {string} code - JavaScript 代码字符串
 * @returns {string} 压缩后的代码
 */
export function compressJavaScriptCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // 简化的 JavaScript 压缩
    return code
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/^[ \t]+/gm, (match) => {
        // 保持最小缩进
        const minimalIndent = Math.min(2, match.length);
        return " ".repeat(minimalIndent);
      })
      .replace(/\s*([{}():;,])\s*/g, "$1") // 压缩符号周围空格
      .trim();
  } catch (error) {
    throw new Error(`JavaScript 压缩失败: ${error.message}`);
  }
}

/**
 * 格式化 Python 代码
 * @param {string} code - Python 代码字符串
 * @returns {string} 格式化后的代码
 */
export function formatPythonCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // Prettier 暂不支持 Python，这里使用简化的缩进格式化
    const lines = code.split("\n");
    const formatted = [];
    let indentLevel = 0;
    const indentSize = 4;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        formatted.push("");
        continue;
      }

      // 处理缩进减少（return, break, continue 等）
      if (
        trimmed.startsWith("return ") ||
        trimmed.startsWith("break") ||
        trimmed.startsWith("continue") ||
        trimmed.startsWith("pass") ||
        (trimmed.startsWith("}") && trimmed.endsWith(":"))
      ) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 添加适当缩进
      formatted.push(" ".repeat(indentLevel * indentSize) + trimmed);

      // 处理缩进增加（以 : 结尾的行）
      if (trimmed.endsWith(":")) {
        indentLevel++;
      }
    }

    return formatted.join("\n");
  } catch (error) {
    throw new Error(`Python 格式化失败: ${error.message}`);
  }
}

/**
 * 压缩 Python 代码
 * @param {string} code - Python 代码字符串
 * @returns {string} 压缩后的代码
 */
export function compressPythonCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // 移除多余空行和注释，保留基本结构
    const lines = code.split("\n");
    const compressed = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      compressed.push(trimmed);
    }

    return compressed.join("\n");
  } catch (error) {
    throw new Error(`Python 压缩失败: ${error.message}`);
  }
}

/**
 * 格式化 Java 代码
 * @param {string} code - Java 代码字符串
 * @returns {string} 格式化后的代码
 */
export function formatJavaCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // 使用基础格式化
    return basicJavaFormat(code);
  } catch (error) {
    throw new Error(`Java 格式化失败: ${error.message}`);
  }
}

/**
 * 基础 Java 格式化（降级方案）
 * @param {string} code - Java 代码
 * @returns {string} 格式化后的代码
 */
function basicJavaFormat(code) {
  try {
    const lines = code.split("\n");
    const formatted = [];
    let indentLevel = 0;
    const indentSize = 2;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        formatted.push("");
        continue;
      }

      // 处理大括号
      if (trimmed.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 添加缩进
      formatted.push(" ".repeat(indentLevel * indentSize) + trimmed);

      // 处理缩进增加
      if (trimmed.endsWith("{")) {
        indentLevel++;
      }
    }

    return formatted.join("\n");
  } catch (error) {
    return code; // 失败时返回原代码
  }
}

/**
 * 压缩 Java 代码
 * @param {string} code - Java 代码字符串
 * @returns {string} 压缩后的代码
 */
export function compressJavaCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    return code
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/^[ \t]+/gm, (match) => {
        // 保持最小缩进
        const minimalIndent = Math.min(2, match.length);
        return " ".repeat(minimalIndent);
      })
      .trim();
  } catch (error) {
    throw new Error(`Java 压缩失败: ${error.message}`);
  }
}

/**
 * 格式化 Go 代码
 * @param {string} code - Go 代码字符串
 * @returns {string} 格式化后的代码
 */
export function formatGoCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    // 使用基础格式化
    return basicGoFormat(code);
  } catch (error) {
    throw new Error(`Go 格式化失败: ${error.message}`);
  }
}

/**
 * 基础 Go 格式化（降级方案）
 * @param {string} code - Go 代码
 * @returns {string} 格式化后的代码
 */
function basicGoFormat(code) {
  try {
    const lines = code.split("\n");
    const formatted = [];
    let indentLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        formatted.push("");
        continue;
      }

      // 处理大括号
      if (trimmed.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 使用 tab 缩进
      formatted.push("\t".repeat(indentLevel) + trimmed);

      // 处理缩进增加
      if (trimmed.endsWith("{")) {
        indentLevel++;
      }
    }

    return formatted.join("\n");
  } catch (error) {
    return code; // 失败时返回原代码
  }
}

/**
 * 压缩 Go 代码
 * @param {string} code - Go 代码字符串
 * @returns {string} 压缩后的代码
 */
export function compressGoCode(code) {
  if (!code || code.trim() === "") {
    return code;
  }

  try {
    return code
      .replace(/\n\s*\n/g, "\n") // 移除多余空行
      .replace(/^[ \t]+/gm, (match) => {
        // Go 使用 tab，转换为最小 tab
        const tabs = Math.min(1, Math.ceil(match.length / 8));
        return "\t".repeat(tabs);
      })
      .trim();
  } catch (error) {
    throw new Error(`Go 压缩失败: ${error.message}`);
  }
}
