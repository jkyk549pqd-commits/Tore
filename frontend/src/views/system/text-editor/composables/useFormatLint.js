/**
 * 文件格式语法校验 Composable
 * 提供各种格式的 Lint 功能
 */
import { load } from "js-yaml";
import { parse } from "@iarna/toml";

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
   * 根据格式获取 Lint 函数
   */
  const getLintFunction = (format) => {
    const lintFunctions = {
      yaml: lintYaml,
      toml: lintToml,
      shell: lintShell,
      xml: lintXml,
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

      // console.log("Lint functions registered");
    }
  };

  return {
    lintYaml,
    lintToml,
    lintShell,
    lintXml,
    getLintFunction,
    registerLintFunctions,
  };
}
