/**
 * JSON编辑器操作 Composable 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useJsonEditorOperations } from "./useJsonEditorOperations";
import { executeJsonOperationWithMessage } from "../json-operations";

// Mock JSON操作函数
vi.mock("../json-operations", () => ({
  executeJsonOperationWithMessage: vi.fn(),
}));

// Mock Element Plus message
vi.mock("element-plus", () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Import mock ElMessage for testing
import { ElMessage } from "element-plus";

describe("useJsonEditorOperations - JSON编辑器操作 Composable", () => {
  let emit;
  let t;
  let localValue;
  let composable;

  beforeEach(() => {
    // 重置 mocks
    vi.clearAllMocks();

    // 设置测试数据
    emit = vi.fn();
    t = (key) => key; // 简单的翻译函数 mock
    localValue = ref('{"test":"value"}');

    // 获取 composable 实例
    composable = useJsonEditorOperations({ emit, t, localValue });
  });

  describe("初始状态", () => {
    it("应该初始化按钮状态", () => {
      expect(composable.buttonStates.value.format).toBe(false);
      expect(composable.buttonStates.value.escape).toBe(false);
    });

    it("应该提供所有操作方法", () => {
      expect(composable.handleFormat).toBeInstanceOf(Function);
      expect(composable.handleCompress).toBeInstanceOf(Function);
      expect(composable.handleSort).toBeInstanceOf(Function);
      expect(composable.handleAddEscape).toBeInstanceOf(Function);
      expect(composable.handleRemoveEscape).toBeInstanceOf(Function);
    });
  });

  describe("handleFormat", () => {
    it("应该调用格式化操作", async () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"formatted": true}');
        }
      );

      composable.handleFormat();

      expect(executeJsonOperationWithMessage).toHaveBeenCalledWith(
        localValue.value,
        "format",
        expect.any(Function),
        t
      );
    });

    it("应该切换格式化按钮状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"formatted": true}');
        }
      );

      expect(composable.buttonStates.value.format).toBe(false);

      composable.handleFormat();

      expect(composable.buttonStates.value.format).toBe(true);
    });

    it("应该通过emit更新值", () => {
      const formattedValue = '{\n  "formatted": true\n}';
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(formattedValue);
        }
      );

      composable.handleFormat();

      expect(emit).toHaveBeenCalledWith("update:modelValue", formattedValue);
    });
  });

  describe("handleCompress", () => {
    it("应该调用压缩操作", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"compressed":true}');
        }
      );

      composable.handleCompress();

      expect(executeJsonOperationWithMessage).toHaveBeenCalledWith(
        localValue.value,
        "compress",
        expect.any(Function),
        t
      );
    });

    it("应该切换格式化按钮状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"compressed":true}');
        }
      );

      composable.handleCompress();

      expect(composable.buttonStates.value.format).toBe(true);
    });

    it("应该通过emit更新压缩后的值", () => {
      const compressedValue = '{"compressed":true}';
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(compressedValue);
        }
      );

      composable.handleCompress();

      expect(emit).toHaveBeenCalledWith("update:modelValue", compressedValue);
    });
  });

  describe("handleSort", () => {
    it("应该调用排序操作", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"a":1,"z":2}');
        }
      );

      composable.handleSort();

      expect(executeJsonOperationWithMessage).toHaveBeenCalledWith(
        localValue.value,
        "sort",
        expect.any(Function),
        t
      );
    });

    it("不应该改变按钮状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('{"a":1,"z":2}');
        }
      );

      const originalFormatState = composable.buttonStates.value.format;
      const originalEscapeState = composable.buttonStates.value.escape;

      composable.handleSort();

      expect(composable.buttonStates.value.format).toBe(originalFormatState);
      expect(composable.buttonStates.value.escape).toBe(originalEscapeState);
    });

    it("应该通过emit更新排序后的值", () => {
      const sortedValue = '{"a":1,"test":"value","z":2}';
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(sortedValue);
        }
      );

      composable.handleSort();

      expect(emit).toHaveBeenCalledWith("update:modelValue", sortedValue);
    });
  });

  describe("handleAddEscape", () => {
    it("应该调用添加转义操作", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('test\\"value');
        }
      );

      composable.handleAddEscape();

      expect(executeJsonOperationWithMessage).toHaveBeenCalledWith(
        localValue.value,
        "addEscape",
        expect.any(Function),
        t
      );
    });

    it("应该切换转义按钮状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('test\\"value');
        }
      );

      expect(composable.buttonStates.value.escape).toBe(false);

      composable.handleAddEscape();

      expect(composable.buttonStates.value.escape).toBe(true);
    });

    it("应该通过emit更新转义后的值", () => {
      const escapedValue = 'test\\"value';
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(escapedValue);
        }
      );

      composable.handleAddEscape();

      expect(emit).toHaveBeenCalledWith("update:modelValue", escapedValue);
    });
  });

  describe("handleRemoveEscape", () => {
    it("应该调用移除转义操作", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('test"value');
        }
      );

      composable.handleRemoveEscape();

      expect(executeJsonOperationWithMessage).toHaveBeenCalledWith(
        localValue.value,
        "removeEscape",
        expect.any(Function),
        t
      );
    });

    it("应该切换转义按钮状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback('test"value');
        }
      );

      composable.handleRemoveEscape();

      expect(composable.buttonStates.value.escape).toBe(true);
    });

    it("应该通过emit更新移除转义后的值", () => {
      const unescapedValue = 'test"value';
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(unescapedValue);
        }
      );

      composable.handleRemoveEscape();

      expect(emit).toHaveBeenCalledWith("update:modelValue", unescapedValue);
    });
  });

  describe("按钮状态切换", () => {
    it("格式化和压缩应该共享同一个状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback("{}");
        }
      );

      composable.handleFormat();
      expect(composable.buttonStates.value.format).toBe(true);

      composable.handleCompress();
      expect(composable.buttonStates.value.format).toBe(false);
    });

    it("添加和移除转义应该共享同一个状态", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback("test");
        }
      );

      composable.handleAddEscape();
      expect(composable.buttonStates.value.escape).toBe(true);

      composable.handleRemoveEscape();
      expect(composable.buttonStates.value.escape).toBe(false);
    });
  });

  describe("错误处理", () => {
    it("应该处理格式化错误", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback, translateFn) => {
          // 模拟错误情况，调用ElMessage.error
          ElMessage.error("Invalid JSON format");
        }
      );

      composable.handleFormat();

      // 应该调用错误消息
      expect(ElMessage.error).toHaveBeenCalledWith("Invalid JSON format");
    });

    it("应该处理压缩错误", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback, translateFn) => {
          // 模拟错误情况，调用ElMessage.error
          ElMessage.error("Compression failed");
        }
      );

      composable.handleCompress();

      expect(ElMessage.error).toHaveBeenCalledWith("Compression failed");
    });
  });

  describe("空值处理", () => {
    it("应该处理空JSON字符串", () => {
      localValue.value = "";

      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback("");
        }
      );

      composable.handleFormat();

      expect(emit).toHaveBeenCalledWith("update:modelValue", "");
    });

    it("应该处理null值", () => {
      localValue.value = null;

      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback) => {
          callback(null);
        }
      );

      composable.handleSort();

      expect(emit).toHaveBeenCalledWith("update:modelValue", null);
    });
  });

  describe("翻译函数", () => {
    it("应该传递翻译函数给操作函数", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback, translateFn) => {
          expect(translateFn).toBe(t);
          callback(value);
        }
      );

      composable.handleFormat();
    });

    it("应该使用翻译函数处理错误消息", () => {
      executeJsonOperationWithMessage.mockImplementation(
        (value, operation, callback, translateFn) => {
          // 模拟错误，调用错误消息
          ElMessage.error(translateFn("json.editor.invalidJsonFormat"));
        }
      );

      composable.handleFormat();

      expect(ElMessage.error).toHaveBeenCalledWith(
        "json.editor.invalidJsonFormat"
      );
    });
  });
});
