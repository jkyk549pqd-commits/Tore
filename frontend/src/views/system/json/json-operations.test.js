/**
 * JSON操作函数测试
 */

import { describe, it, expect, vi } from "vitest";
import {
  formatJsonString,
  compressJsonString,
  sortObjectKeys,
  sortJsonString,
  addEscapes,
  removeEscapes,
  executeJsonOperation,
} from "./json-operations";

// Mock Element Plus message
vi.mock("element-plus", () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("JSON操作函数", () => {
  describe("formatJsonString", () => {
    it("应该格式化压缩的JSON", () => {
      const compressed = '{"name":"test","age":25}';
      const formatted = formatJsonString(compressed);
      expect(formatted).toMatch(/^\{/);
      expect(formatted).toContain("\n");
      expect(formatted).toContain('  "name"');
    });

    it("应该保持嵌套结构的缩进", () => {
      const nested = '{"user":{"name":"test","age":25}}';
      const formatted = formatJsonString(nested);
      expect(formatted).toContain('    "name"');
      expect(formatted).toContain('  "user"');
    });

    it("应该处理空字符串", () => {
      expect(formatJsonString("")).toBe("");
      expect(formatJsonString(null)).toBe(null);
    });

    it("应该抛出无效JSON的错误", () => {
      expect(() => formatJsonString("invalid json")).toThrow();
    });
  });

  describe("compressJsonString", () => {
    it("应该压缩格式化的JSON", () => {
      const formatted = '{\n  "name": "test",\n  "age": 25\n}';
      const compressed = compressJsonString(formatted);
      expect(compressed).toBe('{"name":"test","age":25}');
    });

    it("应该处理已经是压缩状态的JSON", () => {
      const alreadyCompressed = '{"name":"test"}';
      const result = compressJsonString(alreadyCompressed);
      expect(result).toBe(alreadyCompressed);
    });

    it("应该处理空字符串", () => {
      expect(compressJsonString("")).toBe("");
      expect(compressJsonString(null)).toBe(null);
    });

    it("应该抛出无效JSON的错误", () => {
      expect(() => compressJsonString("invalid")).toThrow();
    });
  });

  describe("sortObjectKeys", () => {
    it("应该按字母顺序排序对象的键", () => {
      const unsorted = { z: 1, a: 2, m: 3 };
      const sorted = sortObjectKeys(unsorted);
      const keys = Object.keys(sorted);
      expect(keys).toEqual(["a", "m", "z"]);
    });

    it("应该递归排序嵌套对象的键", () => {
      const nested = {
        b: { z: 1, a: 2 },
        a: { y: 1, x: 2 },
      };
      const sorted = sortObjectKeys(nested);
      expect(Object.keys(sorted)).toEqual(["a", "b"]);
      expect(Object.keys(sorted.a)).toEqual(["x", "y"]);
      expect(Object.keys(sorted.b)).toEqual(["a", "z"]);
    });

    it("应该处理数组的元素", () => {
      const withArray = { b: [{ z: 1, a: 2 }], a: [3, 1, 2] };
      const sorted = sortObjectKeys(withArray);
      expect(Object.keys(sorted)).toEqual(["a", "b"]);
      expect(Object.keys(sorted.b[0])).toEqual(["a", "z"]);
    });

    it("应该处理null和undefined", () => {
      expect(sortObjectKeys(null)).toBe(null);
      expect(sortObjectKeys(undefined)).toBe(undefined);
    });

    it("应该处理原始类型", () => {
      expect(sortObjectKeys("string")).toBe("string");
      expect(sortObjectKeys(123)).toBe(123);
      expect(sortObjectKeys(true)).toBe(true);
    });

    it("应该处理空对象", () => {
      expect(sortObjectKeys({})).toEqual({});
    });
  });

  describe("sortJsonString", () => {
    it("应该排序JSON字符串的键", () => {
      const input = '{"z":1,"a":2,"m":3}';
      const sorted = sortJsonString(input);
      expect(sorted.indexOf('"a"')).toBeLessThan(sorted.indexOf('"m"'));
      expect(sorted.indexOf('"m"')).toBeLessThan(sorted.indexOf('"z"'));
    });

    it("应该保持格式化后的结构", () => {
      const input = '{"z":1,"a":2}';
      const sorted = sortJsonString(input);
      expect(sorted).toContain("\n");
      expect(sorted).toContain("  ");
    });

    it("应该处理嵌套结构", () => {
      const input = '{"b":{"z":1,"a":2},"a":1}';
      const sorted = sortJsonString(input);
      expect(sorted.indexOf('"a"')).toBeLessThan(sorted.indexOf('"b"'));
    });

    it("应该处理空字符串", () => {
      expect(sortJsonString("")).toBe("");
      expect(sortJsonString(null)).toBe(null);
    });

    it("应该抛出无效JSON的错误", () => {
      expect(() => sortJsonString("invalid")).toThrow();
    });
  });

  describe("addEscapes", () => {
    it("应该添加转义字符", () => {
      expect(addEscapes('test"quote')).toBe('test\\"quote');
      expect(addEscapes("test\\backslash")).toBe("test\\\\backslash");
    });

    it("应该处理多个需要转义的字符", () => {
      expect(addEscapes('test"quote\\slash')).toBe('test\\"quote\\\\slash');
    });

    it("应该处理空字符串", () => {
      expect(addEscapes("")).toBe("");
    });

    it("应该处理null", () => {
      expect(addEscapes(null)).toBe(null);
    });

    it("应该处理没有需要转义字符的字符串", () => {
      expect(addEscapes("normal string")).toBe("normal string");
    });
  });

  describe("removeEscapes", () => {
    it("应该移除转义字符", () => {
      expect(removeEscapes('test\\"quote')).toBe('test"quote');
      expect(removeEscapes("test\\\\backslash")).toBe("test\\backslash");
    });

    it("应该处理多个转义字符", () => {
      expect(removeEscapes('test\\"quote\\\\slash')).toBe('test"quote\\slash');
    });

    it("应该处理转义换行符", () => {
      expect(removeEscapes("line1\\nline2")).toBe("line1\nline2");
    });

    it("应该处理空字符串", () => {
      expect(removeEscapes("")).toBe("");
    });

    it("应该处理null", () => {
      expect(removeEscapes(null)).toBe(null);
    });
  });

  describe("executeJsonOperation", () => {
    it("应该执行format操作", () => {
      const result = executeJsonOperation('{"name":"test"}', "format");
      expect(result.success).toBe(true);
      expect(result.result).toContain("\n");
    });

    it("应该执行compress操作", () => {
      const result = executeJsonOperation('{\n  "name": "test"\n}', "compress");
      expect(result.success).toBe(true);
      expect(result.result).toBe('{"name":"test"}');
    });

    it("应该执行sort操作", () => {
      const result = executeJsonOperation('{"z":1,"a":2}', "sort");
      expect(result.success).toBe(true);
      expect(result.result.indexOf('"a"')).toBeLessThan(
        result.result.indexOf('"z"')
      );
    });

    it("应该执行addEscape操作", () => {
      const result = executeJsonOperation('test"quote', "addEscape");
      expect(result.success).toBe(true);
      expect(result.result).toBe('test\\"quote');
    });

    it("应该执行removeEscape操作", () => {
      const result = executeJsonOperation('test\\"quote', "removeEscape");
      expect(result.success).toBe(true);
      expect(result.result).toBe('test"quote');
    });

    it("应该处理空字符串", () => {
      const result = executeJsonOperation("", "format");
      expect(result.success).toBe(true);
      expect(result.result).toBe("");
    });

    it("应该处理无效操作类型", () => {
      const result = executeJsonOperation('{"test":1}', "invalid");
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("应该处理无效JSON", () => {
      const result = executeJsonOperation("invalid json", "format");
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
