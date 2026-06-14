/**
 * 字符串工具函数测试
 */

import { describe, it, expect } from "vitest";
import {
  convertLowerHyphen,
  convertUpperCamel,
  convertLowerCamel,
  jsonFormat,
  remEscap,
} from "/@/utils/str-util";

describe("str-util - 字符串工具函数", () => {
  describe("convertLowerHyphen", () => {
    it("应该将驼峰命名转换为小写中划线", () => {
      expect(convertLowerHyphen("userName")).toBe("user-name");
      expect(convertLowerHyphen("getUserInfo")).toBe("get-user-info");
      expect(convertLowerHyphen("ABC")).toBe("-a-b-c");
    });

    it("应该处理空字符串", () => {
      expect(convertLowerHyphen("")).toBe("");
    });

    it("应该处理 undefined 和 null", () => {
      expect(convertLowerHyphen(undefined)).toBe("");
      expect(convertLowerHyphen(null)).toBe("");
    });
  });

  describe("convertUpperCamel", () => {
    it("应该将下划线命名转换为大写驼峰", () => {
      expect(convertUpperCamel("user_name")).toBe("UserName");
      expect(convertUpperCamel("get_user_info")).toBe("GetUserInfo");
      expect(convertUpperCamel("ABC")).toBe("ABC");
    });

    it("应该处理空字符串", () => {
      expect(convertUpperCamel("")).toBe("");
    });

    it("应该处理 undefined 和 null", () => {
      expect(convertUpperCamel(undefined)).toBe("");
      expect(convertUpperCamel(null)).toBe("");
    });
  });

  describe("convertLowerCamel", () => {
    it("应该将下划线命名转换为小写驼峰", () => {
      expect(convertLowerCamel("user_name")).toBe("userName");
      expect(convertLowerCamel("get_user_info")).toBe("getUserInfo");
      expect(convertLowerCamel("ABC")).toBe("ABC");
    });

    it("应该处理空字符串", () => {
      expect(convertLowerCamel("")).toBe("");
    });

    it("应该处理 undefined 和 null", () => {
      expect(convertLowerCamel(undefined)).toBe("");
      expect(convertLowerCamel(null)).toBe("");
    });
  });

  describe("jsonFormat", () => {
    it("应该正确格式化JSON字符串为字符串", () => {
      const input = '{"name":"test","value":123}';
      const result = jsonFormat(input, "str");
      expect(result).toContain("\n");
      expect(result).toContain('  "name"');
      expect(result).toContain('  "value"');
    });

    it("应该正确格式化JSON字符串为对象", () => {
      const input = '{"name":"test","value":123}';
      const result = jsonFormat(input, "obj");
      expect(result).toEqual({ name: "test", value: 123 });
    });

    it("应该处理转义字符", () => {
      const input = '{"name":"\\"test\\""}';
      const result = jsonFormat(input, "str");
      expect(result).toContain('\\"test\\"');
    });

    it("应该抛出无效JSON的错误", () => {
      expect(() => jsonFormat("invalid json", "str")).toThrow(
        "JSON格式化失败，请检查srcStr字符串是否正确！"
      );
    });

    it("应该处理空字符串", () => {
      expect(() => jsonFormat("", "str")).toThrow();
    });
  });

  describe("remEscap", () => {
    it("应该去除转义字符", () => {
      expect(remEscap('test\\"quote')).toBe('test"quote');
      expect(remEscap("test\\nline")).toBe("test\nline");
      expect(remEscap("test\\\\backslash")).toBe("test\\backslash");
    });

    it("应该处理转义换行符", () => {
      expect(remEscap("line1\\nline2")).toBe("line1\nline2");
    });

    it("应该抛出非字符串输入的错误", () => {
      expect(() => remEscap(123)).toThrow("输入必须是字符串");
      expect(() => remEscap(null)).toThrow("输入必须是字符串");
      expect(() => remEscap(undefined)).toThrow("输入必须是字符串");
    });

    it("应该处理空字符串", () => {
      expect(remEscap("")).toBe("");
    });

    it("应该处理没有转义字符的字符串", () => {
      expect(remEscap("normal string")).toBe("normal string");
    });
  });
});
