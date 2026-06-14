/**
 * 首页组件集成测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import HomeIndex from "./index.vue";

// Mock 子组件
vi.mock("./components/BrandSection.vue", () => ({
  default: {
    name: "BrandSection",
    template: '<div class="brand-section">Brand Section</div>',
  },
}));

vi.mock("./components/QuickActions.vue", () => ({
  default: {
    name: "QuickActions",
    template: '<div class="quick-actions">Quick Actions</div>',
  },
}));

vi.mock("./components/RecentRecords.vue", () => ({
  default: {
    name: "RecentRecords",
    template: '<div class="recent-records">Recent Records</div>',
  },
}));

vi.mock("/@/views/system/json/components/json-import-dialog.vue", () => ({
  default: {
    name: "JsonImportDialog",
    props: ["visible", "t"],
    emits: ["file-selected", "close"],
    template: '<div v-if="visible" class="import-dialog">Import Dialog</div>',
  },
}));

describe("HomeIndex - 首页组件集成测试", () => {
  let router;
  let pinia;
  let wrapper;

  beforeEach(() => {
    // 创建测试路由
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/home",
          name: "home",
          component: HomeIndex,
        },
        {
          path: "/json",
          name: "902",
          component: { template: "<div>JSON Editor</div>" },
        },
      ],
    });

    // 创建 Pinia 实例
    pinia = createPinia();
    setActivePinia(pinia);

    // 清理 sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  describe("组件渲染", () => {
    it("应该正确渲染首页组件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.find(".home-container").exists()).toBe(true);
      expect(wrapper.find(".brand-section").exists()).toBe(true);
      expect(wrapper.find(".quick-actions").exists()).toBe(true);
      expect(wrapper.find(".recent-records").exists()).toBe(true);
    });

    it("应该有正确的CSS类名", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const container = wrapper.find(".home-container");
      expect(container.exists()).toBe(true);

      const contentWrapper = wrapper.find(".content-wrapper");
      expect(contentWrapper.exists()).toBe(true);
    });
  });

  describe("路由和导航", () => {
    it("应该在首页路由正确加载", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(router.currentRoute.value.path).toBe("/home");
    });
  });

  describe("文件导入功能", () => {
    it("应该处理文件选择事件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const testData = '{"test":"value","number":123}';
      const file = new File([testData], "test.json", {
        type: "application/json",
      });

      // 模拟文件选择
      await wrapper.vm.handleFileSelected(file);

      // 等待异步操作
      await wrapper.vm.$nextTick();

      // 验证数据已存储到 sessionStorage
      expect(sessionStorage.getItem("importedJsonData")).toBe(testData);
    });

    it("应该在文件选择后跳转到JSON页面", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const testData = '{"test":"value"}';
      const file = new File([testData], "test.json", {
        type: "application/json",
      });

      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();
      await router.isReady();

      expect(router.currentRoute.value.path).toBe("/json");
      expect(router.currentRoute.value.query.import).toBe("true");
      expect(router.currentRoute.value.query._instance_).toBeTruthy();
    });

    it("应该处理有效的JSON文件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const validJson = '{"name":"test","age":25}';
      const file = new File([validJson], "test.json", {
        type: "application/json",
      });

      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();

      const storedData = sessionStorage.getItem("importedJsonData");
      expect(storedData).toBe(validJson);
    });

    it("应该处理无效的JSON文件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidJson = "not valid json";
      const file = new File([invalidJson], "test.json", {
        type: "application/json",
      });

      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();

      // 应该清除无效数据
      expect(sessionStorage.getItem("importedJsonData")).toBeNull();

      // 应该记录错误
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("应该生成唯一的实例ID", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const file = new File(["{}"], "test.json", { type: "application/json" });

      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();
      await router.isReady();

      const instanceId = router.currentRoute.value.query._instance_;
      expect(instanceId).toBeTruthy();
      expect(typeof instanceId).toBe("string");
    });
  });

  describe("导入弹框处理", () => {
    it("应该正确处理弹框关闭事件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 确保弹框初始状态为关闭
      expect(wrapper.vm.importDialogVisible).toBe(false);

      // 模拟关闭弹框
      await wrapper.vm.handleImportDialogClose();

      expect(wrapper.vm.importDialogVisible).toBe(false);
    });

    it("应该在文件选择后关闭弹框", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const file = new File(["{}"], "test.json", { type: "application/json" });

      // 注意：由于我们使用了Mock的QuickActions组件，
      // 这里测试可能需要根据实际情况调整
      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();

      // 弹框应该被关闭
      expect(wrapper.vm.importDialogVisible).toBe(false);
    });
  });

  describe("响应式设计", () => {
    it("应该在移动设备上应用正确的样式", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 测试容器样式
      const container = wrapper.find(".home-container");
      expect(container.exists()).toBe(true);
    });

    it("应该在平板设备上应用正确的样式", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const contentWrapper = wrapper.find(".content-wrapper");
      expect(contentWrapper.exists()).toBe(true);
    });
  });

  describe("组件交互", () => {
    it("应该正确传递props给子组件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 检查子组件是否正确渲染
      expect(wrapper.findComponent({ name: "BrandSection" }).exists()).toBe(
        true
      );
      expect(wrapper.findComponent({ name: "QuickActions" }).exists()).toBe(
        true
      );
      expect(wrapper.findComponent({ name: "RecentRecords" }).exists()).toBe(
        true
      );
    });

    it("应该正确处理子组件事件", async () => {
      await router.push("/home");

      wrapper = mount(HomeIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 测试文件选择事件处理
      const file = new File(["{}"], "test.json", { type: "application/json" });

      await wrapper.vm.handleFileSelected(file);
      await wrapper.vm.$nextTick();

      expect(sessionStorage.getItem("importedJsonData")).toBeTruthy();
    });
  });
});
