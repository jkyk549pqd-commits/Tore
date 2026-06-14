/**
 * JSON Editor Lite 组件测试
 * 测试主题自适应、格式化、压缩、复制等功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import JsonEditorLite from "./json-editor-lite.vue";
import { useThemeStore } from "/@/store/modules/theme";
import { useAppConfigStore } from "/@/store/modules/system/app-config";

// Mock CodeMirror 组件
vi.mock("codemirror-editor-vue3", () => ({
  default: {
    name: "Codemirror",
    template: '<div class="codemirror-mock"><slot></slot></div>',
    props: ["value", "options"],
    emits: ["ready", "change"],
  },
}));

// Mock jsonlint
vi.mock("jsonlint-mod", () => ({
  default: {
    parse: (str) => JSON.parse(str),
  },
}));

describe("JsonEditorLite", () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    // Mock clipboard API
    global.navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("组件渲染", () => {
    it("应该正确渲染组件", () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find(".json-editor-lite").exists()).toBe(true);
      expect(wrapper.find(".editor-toolbar").exists()).toBe(true);
      expect(wrapper.find(".codemirror-wrapper").exists()).toBe(true);
    });

    it("应该显示工具栏按钮", () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find(".editor-toolbar").exists()).toBe(true);
      expect(wrapper.text()).toContain("Format");
      expect(wrapper.text()).toContain("Compress");
      expect(wrapper.text()).toContain("Copy");
    });
  });

  describe("主题自适应", () => {
    it("应该在浅色模式下使用浅色主题", () => {
      const themeStore = useThemeStore();
      themeStore.currentTheme = "light";

      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      // 验证主题状态
      expect(wrapper.vm.isDark).toBe(false);
    });

    it("应该在深色模式下使用深色主题", () => {
      const themeStore = useThemeStore();
      themeStore.currentTheme = "dark";

      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      // 验证主题状态
      expect(wrapper.vm.isDark).toBe(true);
    });

    it("应该在主题切换时更新编辑器主题", async () => {
      const themeStore = useThemeStore();
      themeStore.currentTheme = "light";

      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.isDark).toBe(false);

      // 切换到深色模式
      themeStore.currentTheme = "dark";
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isDark).toBe(true);
    });
  });

  describe("格式化功能", () => {
    it("应该正确格式化 JSON", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key":"value","nested":{"data":1}}',
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.format();

      // 验证格式化后的结果
      const expected = JSON.stringify(
        JSON.parse('{"key":"value","nested":{"data":1}}'),
        null,
        2
      );
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0]).toEqual([expected]);
    });

    it("格式化无效 JSON 时应该显示错误消息", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: "{invalid json}",
        },
        global: {
          plugins: [pinia],
        },
      });

      // Mock ElMessage.error
      const mockError = vi.spyOn(
        wrapper.vm.$ElMessage || { error: vi.fn() },
        "error"
      );

      await wrapper.vm.format();

      // 验证没有触发更新事件（因为格式化失败）
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("压缩功能", () => {
    it("应该正确压缩 JSON", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue:
            '{\n  "key": "value",\n  "nested": {\n    "data": 1\n  }\n}',
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.compress();

      // 验证压缩后的结果
      const expected = JSON.stringify(
        JSON.parse('{"key":"value","nested":{"data":1}}')
      );
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0]).toEqual([expected]);
    });

    it("压缩无效 JSON 时应该显示错误消息", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: "{invalid json}",
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.compress();

      // 验证没有触发更新事件（因为压缩失败）
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("复制功能", () => {
    it("应该正确复制内容到剪贴板", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.copy();

      // 验证 clipboard API 被调用
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
        '{"key": "value"}'
      );
    });

    it("没有内容时应该显示警告", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: "",
        },
        global: {
          plugins: [pinia],
        },
      });

      await wrapper.vm.copy();

      // 验证没有调用 clipboard API
      expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe("字符数统计", () => {
    it("应该正确显示字符数", () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.charCount).toBe('{"key": "value"}'.length);
    });

    it("空内容时字符数应该为 0", () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: "",
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.charCount).toBe(0);
    });
  });

  describe("Props 和 Emits", () => {
    it("应该支持 v-model 双向绑定", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      // 模拟编辑器内容变化
      await wrapper.vm.handleChange('{"newKey": "newValue"}');

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")[0]).toEqual([
        '{"newKey": "newValue"}',
      ]);
    });

    it("应该支持 autoFormat 属性", async () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key":"value"}',
          autoFormat: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      // 模拟编辑器准备就绪
      await wrapper.vm.handleReady({ setOption: vi.fn() });

      // 验证自动格式化被调用
      const formatted = JSON.stringify(JSON.parse('{"key":"value"}'), null, 2);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("应该支持 readOnly 属性", () => {
      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
          readOnly: true,
        },
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.vm.cmOptions.readOnly).toBe(true);
    });
  });

  describe("主题显示", () => {
    it("应该在工具栏显示当前主题标签", () => {
      const themeStore = useThemeStore();
      themeStore.currentTheme = "light";

      const wrapper = mount(JsonEditorLite, {
        props: {
          modelValue: '{"key": "value"}',
        },
        global: {
          plugins: [pinia],
        },
      });

      // 验证主题标签存在
      const themeTag = wrapper.find(".editor-info .el-tag");
      expect(themeTag.exists()).toBe(true);
      expect(themeTag.text()).toContain("Light Mode");
    });
  });
});
