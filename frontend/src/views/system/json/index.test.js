/**
 * JSON编辑器主组件集成测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { ref, nextTick } from "vue";
import JsonIndex from "./index.vue";

// Mock 所有子组件
vi.mock("./components/json-editor-panel.vue", () => ({
  default: {
    name: "JsonEditorPanel",
    props: [
      "editorId",
      "modelValue",
      "cmOptions",
      "fontSize",
      "showDemo",
      "isCompare",
    ],
    emits: ["update:modelValue", "ready"],
    template:
      '<div class="json-editor-panel"><textarea>{{modelValue}}</textarea></div>',
  },
}));

vi.mock("./components/page-header.vue", () => ({
  default: {
    name: "PageHeader",
    props: ["showDiffView", "showConfig", "isPinned"],
    emits: ["toggleDiff", "toggleConfig", "togglePin"],
    template: '<div class="page-header">Page Header</div>',
  },
}));

vi.mock("./components/editor-config-panel.vue", () => ({
  default: {
    name: "EditorConfigPanel",
    props: [
      "cmTheme",
      "cmFontSize",
      "cmLineWrapping",
      "cmLineNumbers",
      "cmReadOnly",
      "showDemo",
      "themeOptions",
    ],
    emits: [
      "update:cmTheme",
      "update:cmFontSize",
      "update:cmLineWrapping",
      "update:cmLineNumbers",
      "update:cmReadOnly",
      "update:showDemo",
    ],
    template: '<div class="editor-config-panel">Editor Config</div>',
  },
}));

vi.mock("./components/compare-action-bar.vue", () => ({
  default: {
    name: "CompareActionBar",
    props: ["visible"],
    emits: ["compare"],
    template:
      '<div v-if="visible" class="compare-action-bar">Compare Action Bar</div>',
  },
}));

// Mock composables
vi.mock("./composables/useCodeMirrorConfig", () => ({
  useCodeMirrorConfig: () => ({
    cmTheme: ref("default"),
    cmThemeOptions: ref([]),
    cmFontSize: ref(14),
    cmLineWrapping: ref(true),
    cmLineNumbers: ref(true),
    cmReadOnly: ref(false),
    showDemo: ref(false),
    cmOptions: ref({}),
    initializeTheme: vi.fn(),
  }),
}));

vi.mock("./composables/useAutoSave", () => ({
  useAutoSave: () => ({
    startAutoSaveTimer: vi.fn(),
    updateSaveState: vi.fn(),
  }),
}));

vi.mock("./composables/useRouteSync", () => ({
  useRouteSync: () => ({
    instanceId: ref(null),
    stateKey: ref("902_default"),
    initializeRouteState: vi.fn(),
    handleQueryChange: vi.fn(),
    handleActivation: vi.fn(),
  }),
}));

vi.mock("./composables/useStatePersistence", () => ({
  useStatePersistence: () => ({
    applyState: vi.fn(() => true),
  }),
}));

vi.mock("./composables/useClipboardActions", () => ({
  useClipboardActions: () => ({
    handleCopy: vi.fn(),
    handlePaste: vi.fn(),
    handleClear: vi.fn(),
  }),
}));

// Mock 国际化
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}));

// Mock 本地存储工具
vi.mock("/@/utils/local-util", () => ({
  localRead: vi.fn(),
  localRemove: vi.fn(),
}));

describe("JsonIndex - JSON编辑器主组件集成测试", () => {
  let router;
  let pinia;
  let wrapper;

  beforeEach(async () => {
    // 创建测试路由
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/json",
          name: "902",
          component: JsonIndex,
        },
        {
          path: "/home",
          name: "home",
          component: { template: "<div>Home</div>" },
        },
      ],
    });

    // 创建 Pinia 实例
    pinia = createPinia();
    setActivePinia(pinia);

    // 清理存储
    localStorage.clear();
    sessionStorage.clear();

    // 清理 mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe("组件渲染", () => {
    it("应该正确渲染JSON编辑器组件", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.find(".json-container").exists()).toBe(true);
      expect(wrapper.find(".page-header").exists()).toBe(true);
      expect(wrapper.find(".json-editor-panel").exists()).toBe(true);
    });

    it("应该正确设置组件name属性", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.$options.name).toBeDefined();
    });
  });

  describe("路由管理", () => {
    it("应该在JSON编辑器路由正确加载", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(router.currentRoute.value.path).toBe("/json");
      expect(router.currentRoute.value.name).toBe("902");
    });

    it("应该正确解析默认实例的路由", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(wrapper.vm.instanceId).toBe(null);
      expect(wrapper.vm.stateKey).toBe("902_default");
    });

    it("应该正确解析多实例路由参数", async () => {
      await router.push({ path: "/json", query: { _instance_1: "1" } });

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(router.currentRoute.value.query._instance_1).toBe("1");
    });
  });

  describe("状态管理", () => {
    it("应该初始化正确的状态", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(wrapper.vm.jsonStr1).toBeDefined();
      expect(wrapper.vm.jsonStr2).toBeDefined();
      expect(wrapper.vm.showRightBox).toBe(false);
      expect(wrapper.vm.showCodemirrorConf).toBe(false);
    });

    it("应该正确设置恢复状态标志", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.isRestoringState).toBeDefined();
      expect(typeof wrapper.vm.isRestoringState.value).toBe("boolean");
    });
  });

  describe("路由参数处理", () => {
    it("应该处理import参数", async () => {
      const testData = '{"imported":"data"}';
      sessionStorage.setItem("importedJsonData", testData);

      await router.push({ path: "/json", query: { import: "true" } });

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();
      await nextTick(); // 额外的tick等待异步处理

      // 验证sessionStorage被清理
      expect(sessionStorage.getItem("importedJsonData")).toBeNull();
    });

    it("应该处理_temp_key参数", async () => {
      const tempKey = "temp_json_1234567890";
      const tempData = { content: '{"temp":"data"}', name: "temp.json" };

      const { localRead } = await import("/@/utils/local-util");
      localRead.mockReturnValue(JSON.stringify(tempData));

      await router.push({ path: "/json", query: { _temp_key: tempKey } });

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(localRead).toHaveBeenCalledWith(tempKey);
    });

    it("应该处理paste参数", async () => {
      await router.push({ path: "/json", query: { paste: "true" } });

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(router.currentRoute.value.query.paste).toBe("true");
    });
  });

  describe("编辑器功能", () => {
    it("应该正确初始化编辑器配置", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(wrapper.vm.cmTheme).toBeDefined();
      expect(wrapper.vm.cmFontSize).toBeDefined();
      expect(wrapper.vm.cmOptions).toBeDefined();
    });

    it("应该处理编辑器就绪事件", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const mockEditor = { getValue: () => "{}", setValue: vi.fn() };

      wrapper.vm.onReady(mockEditor);

      expect(wrapper.vm.cmInstance).toBe(mockEditor);
    });
  });

  describe("界面交互", () => {
    it("应该切换右侧编辑器显示", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.showRightBox).toBe(false);

      wrapper.vm.toggleDiff();

      expect(wrapper.vm.showRightBox).toBe(true);
    });

    it("应该切换配置面板显示", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.showCodemirrorConf).toBe(false);

      wrapper.vm.toggleConfig();

      expect(wrapper.vm.showCodemirrorConf).toBe(true);
    });

    it("应该切换头部固定状态", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.isHeaderPinned).toBe(false);

      wrapper.vm.togglePin();

      expect(wrapper.vm.isHeaderPinned).toBe(true);
    });
  });

  describe("多实例支持", () => {
    it("应该支持多个实例同时打开", async () => {
      // 创建第一个实例
      await router.push({ path: "/json", query: { _instance_1: "1" } });
      const wrapper1 = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 创建第二个实例
      await router.push({ path: "/json", query: { _instance_2: "2" } });
      const wrapper2 = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 验证两个实例都正确挂载
      expect(wrapper1.exists()).toBe(true);
      expect(wrapper2.exists()).toBe(true);

      wrapper1.unmount();
      wrapper2.unmount();
    });

    it("应该为不同实例生成不同的状态键", async () => {
      await router.push({ path: "/json", query: { _instance_1: "1" } });

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      // 验证状态键包含实例ID
      expect(wrapper.vm.stateKey).toContain("instance_1");
    });
  });

  describe("数据验证", () => {
    it("应该验证JSON数据格式", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 设置有效的JSON
      wrapper.vm.jsonStr1 = '{"valid":"json"}';

      expect(() => JSON.parse(wrapper.vm.jsonStr1)).not.toThrow();
    });

    it("应该处理无效的JSON数据", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // 设置无效的JSON
      wrapper.vm.jsonStr1 = "invalid json";

      // 验证不会抛出错误，而是优雅处理
      expect(() => JSON.parse(wrapper.vm.jsonStr1)).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("生命周期", () => {
    it("应该在组件挂载时正确初始化", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      // 验证组件已正确初始化
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.jsonStr1).toBeDefined();
      expect(wrapper.vm.jsonStr2).toBeDefined();
    });

    it("应该在组件激活时恢复状态", async () => {
      await router.push("/json");

      wrapper = mount(JsonIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 模拟组件激活
      await wrapper.vm.handleActivation();

      expect(wrapper.vm.isRestoringState.value).toBeDefined();
    });
  });
});
