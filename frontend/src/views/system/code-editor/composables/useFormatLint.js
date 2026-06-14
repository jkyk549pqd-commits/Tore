/**
 * 文件格式语法校验 Composable
 * 提供各种格式的 Lint 功能
 */
import { load } from "js-yaml";
import { parse } from "@iarna/toml";
import { parse as babelParse } from "@babel/parser";

export function useFormatLint() {
  /**
   * YAML 语法校验
   */
  const lintYaml = (text) => {
    try {
      load(text);
      return [];
    } catch (e) {
      return [
        {
          from: e.mark?.position || 0,
          to: e.mark?.position + 1 || 1,
          message: e.message,
          severity: "error",
        },
      ];
    }
  };

  /**
   * TOML 语法校验
   */
  const lintToml = (text) => {
    try {
      parse(text);
      return [];
    } catch (e) {
      return [
        {
          message: e.message,
          severity: "error",
        },
      ];
    }
  };

  /**
   * Shell 语法校验（基础版）
   * 注意：完整的 shell 检查需要集成 shellcheck
   */
  const lintShell = (text) => {
    const errors = [];
    const lines = text.split("\n");

    lines.forEach((line, index) => {
      // 检查未闭合的引号
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;

      if (singleQuotes % 2 !== 0) {
        errors.push({
          from: { line: index, ch: 0 },
          to: { line: index, ch: line.length },
          message: "未闭合的单引号",
          severity: "warning",
        });
      }

      if (doubleQuotes % 2 !== 0) {
        errors.push({
          from: { line: index, ch: 0 },
          to: { line: index, ch: line.length },
          message: "未闭合的双引号",
          severity: "warning",
        });
      }
    });

    return errors;
  };

  /**
   * XML 语法校验（基础版）
   */
  const lintXml = (text) => {
    const errors = [];

    // 检查标签匹配
    const openTags = text.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || [];
    const closeTags = text.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];
    const selfClosingTags =
      text.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*\/>/g) || [];

    openTags.forEach((tag) => {
      const tagName = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/)[1];

      // 检查是否有对应的闭合标签（自闭合标签除外）
      if (!tag.endsWith("/>") && !text.includes(`</${tagName}>`)) {
        errors.push({
          message: `标签 <${tagName}> 可能未闭合`,
          severity: "warning",
        });
      }
    });

    return errors;
  };

  /**
   * JavaScript 语法校验
   * 使用 Babel Parser 进行语法检查（浏览器兼容）
   */
  const lintJavaScript = (text) => {
    try {
      // 使用 Babel Parser 解析 JavaScript 代码
      const ast = babelParse(text, {
        sourceType: "module",
        ecmaVersion: 2022,
        ecmaFeatures: {
          jsx: true,
          impliedStrict: true,
        },
        plugins: ["jsx"],
      });

      // 如果解析成功，没有语法错误
      return [];
    } catch (error) {
      // 解析错误，转换为 CodeMirror 格式
      const loc = error.loc;
      if (loc) {
        return [
          {
            from: {
              line: loc.line - 1,
              ch: loc.column - 1,
            },
            to: {
              line: loc.line - 1,
              ch: loc.column - 1 + (error.message?.length || 5),
            },
            message: `语法错误: ${error.message}`,
            severity: "error",
          },
        ];
      }
      return [
        {
          from: 0,
          to: 1,
          message: `JavaScript 语法错误: ${error.message}`,
          severity: "error",
        },
      ];
    }
  };

  /**
   * Python 基础语法校验（简化版）
   */
  const lintPython = (text) => {
    const errors = [];
    const lines = text.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      // 检查缩进一致性
      const leadingSpaces = line.search(/\S/);
      if (leadingSpaces % 4 !== 0 && leadingSpaces > 0) {
        errors.push({
          from: { line: index, ch: 0 },
          to: { line: index, ch: line.length },
          message: "Python 缩进应为4的倍数",
          severity: "warning",
        });
      }

      // 检查常见语法错误
      if (
        trimmed.includes(":") &&
        !trimmed.endsWith(":") &&
        !trimmed.includes("print(")
      ) {
        // 简单的冒号检查
      }
    });

    return errors;
  };

  /**
   * Java 基础语法校验（简化版）
   */
  const lintJava = (text) => {
    const errors = [];
    const lines = text.split("\n");

    // 检查是否有类定义
    const hasClass = text.includes("class ") || text.includes("interface ");
    const hasMain = text.includes("public static void main");

    if (hasClass && !hasMain) {
      errors.push({
        message: "未找到 main 方法",
        severity: "warning",
      });
    }

    // 检查大括号匹配
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        message: `大括号不匹配: 开启 ${openBraces}, 关闭 ${closeBraces}`,
        severity: "error",
      });
    }

    return errors;
  };

  /**
   * Go 基础语法校验（简化版）
   */
  const lintGo = (text) => {
    const errors = [];
    const lines = text.split("\n");

    // 检查是否有 package 声明
    if (!text.includes("package ")) {
      errors.push({
        message: "缺少 package 声明",
        severity: "warning",
      });
    }

    // 检查大括号匹配
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        message: `大括号不匹配: 开启 ${openBraces}, 关闭 ${closeBraces}`,
        severity: "error",
      });
    }

    return errors;
  };

  /**
   * 根据格式获取 Lint 函数
   */
  const getLintFunction = (format) => {
    const lintFunctions = {
      yaml: lintYaml,
      toml: lintToml,
      shell: lintShell,
      xml: lintXml,
      javascript: lintJavaScript,
      python: lintPython,
      java: lintJava,
      go: lintGo,
    };

    return lintFunctions[format] || null;
  };

  /**
   * 注册全局 Lint 函数
   */
  const registerLintFunctions = () => {
    if (typeof window !== "undefined") {
      window.yamlLint = lintYaml;
      window.tomlLint = lintToml;
      window.shellLint = lintShell;
      window.xmlLint = lintXml;
      window.javascriptLint = lintJavaScript;
      window.pythonLint = lintPython;
      window.javaLint = lintJava;
      window.goLint = lintGo;

      // console.log("Lint functions registered");
    }
  };

  return {
    lintYaml,
    lintToml,
    lintShell,
    lintXml,
    lintJavaScript,
    lintPython,
    lintJava,
    lintGo,
    getLintFunction,
    registerLintFunctions,
  };
}
