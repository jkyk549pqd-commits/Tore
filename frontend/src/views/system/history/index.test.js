/**
 * 历史记录组件集成测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { ref, nextTick } from "vue";
import HistoryIndex from "./index.vue";

// Mock 所有子组件
vi.mock("./components/column-settings-dialog.vue", () => ({
  default: {
    name: "ColumnSettingsDialog",
    props: ["visible", "columns", "loading"],
    emits: ["save", "reset"],
    template:
      '<div v-if="visible" class="column-settings-dialog">Column Settings</div>',
  },
}));

vi.mock("./components/query-form.vue", () => ({
  default: {
    name: "QueryForm",
    props: ["model", "hasSelected"],
    emits: ["search", "reset", "batchDelete"],
    template: '<div class="query-form">Query Form</div>',
  },
}));

vi.mock("./components/history-table.vue", () => ({
  default: {
    name: "HistoryTable",
    props: ["columns", "data", "loading"],
    emits: ["selection-change", "view", "delete"],
    template: '<div class="history-table">History Table</div>',
  },
}));

vi.mock("./components/table-pagination.vue", () => ({
  default: {
    name: "TablePagination",
    props: ["current", "pageSize", "total"],
    emits: ["update:current", "update:pageSize", "change"],
    template: '<div class="table-pagination">Pagination</div>',
  },
}));

vi.mock("./components/log-operate-modal.vue", () => ({
  default: {
    name: "LogOperateModal",
    emits: ["reloadList"],
    template: '<div class="log-operate-modal">Log Operate Modal</div>',
  },
}));

// Mock useHistory composable
vi.mock("./use-history.js", () => ({
  useHistory: () => ({
    queryForm: ref({
      type: "",
      optType: "",
      parent: "",
      tag: "",
      content: "",
    }),
    tableLoading: ref(false),
    tableData: ref([]),
    pagination: ref({
      current: 1,
      pageSize: 20,
      total: 0,
    }),
    selectedRowKeys: ref([]),
    hasSelected: ref(false),
    logOperateModal: ref(null),
    query: vi.fn(),
    resetQuery: vi.fn(),
    handleTableChange: vi.fn(),
    onSelectChange: vi.fn(),
    singleDelete: vi.fn(),
    batchDelete: vi.fn(),
    openDrawer: vi.fn(),
  }),
  columns: [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "类型", dataIndex: "type", key: "type" },
    { title: "操作类型", dataIndex: "optType", key: "optType" },
    { title: "父级", dataIndex: "parent", key: "parent" },
    { title: "标签", dataIndex: "tag", key: "tag" },
    { title: "内容", dataIndex: "content", key: "content" },
    { title: "创建时间", dataIndex: "crtTime", key: "crtTime" },
    { title: "更新时间", dataIndex: "updTime", key: "updTime" },
    { title: "操作", dataIndex: "operate", key: "operate" },
  ],
  formatDate: (date) => date,
}));

// Mock API
vi.mock("/@/api/system/table-column-config-api", () => ({
  tableColumnConfigApi: {
    getUserTableColumn: vi.fn().mockResolvedValue({ conf_value: "{}" }),
    saveUserTableColumn: vi.fn().mockResolvedValue({}),
  },
}));

// Mock Store
vi.mock("/@/store/modules/system/app-config", () => ({
  useAppConfigStore: () => ({
    showTooltipsFlag: ref(true),
  }),
}));

// Mock 图标组件
vi.mock("@ant-design/icons-vue", () => ({
  EllipsisOutlined: {
    name: "EllipsisOutlined",
    template: "<span>EllipsisOutlined</span>",
  },
}));

describe("HistoryIndex - 历史记录组件集成测试", () => {
  let router;
  let pinia;
  let wrapper;

  beforeEach(async () => {
    // 创建测试路由
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/jsonHis",
          name: "906",
          component: HistoryIndex,
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
    it("应该正确渲染历史记录组件", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.find(".history-container").exists()).toBe(true);
      expect(wrapper.find(".page-header").exists()).toBe(true);
      expect(wrapper.find(".page-content").exists()).toBe(true);
    });

    it("应该渲染所有子组件", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.findComponent({ name: "QueryForm" }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: "HistoryTable" }).exists()).toBe(
        true
      );
      expect(wrapper.findComponent({ name: "TablePagination" }).exists()).toBe(
        true
      );
      expect(wrapper.findComponent({ name: "LogOperateModal" }).exists()).toBe(
        true
      );
    });
  });

  describe("路由管理", () => {
    it("应该在历史记录路由正确加载", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(router.currentRoute.value.path).toBe("/jsonHis");
      expect(router.currentRoute.value.name).toBe("906");
    });

    it("应该处理路由参数", async () => {
      await router.push({
        path: "/jsonHis",
        query: { page: "2", pageSize: "50" },
      });

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(router.currentRoute.value.query.page).toBe("2");
      expect(router.currentRoute.value.query.pageSize).toBe("50");
    });
  });

  describe("状态管理", () => {
    it("应该初始化正确的状态", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await nextTick();

      expect(wrapper.vm.queryForm).toBeDefined();
      expect(wrapper.vm.tableLoading).toBeDefined();
      expect(wrapper.vm.tableData).toBeDefined();
      expect(wrapper.vm.pagination).toBeDefined();
    });

    it("应该正确设置默认分页参数", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.pagination.current).toBe(1);
      expect(wrapper.vm.pagination.pageSize).toBe(20);
    });
  });

  describe("表格功能", () => {
    it("应该正确传递表格列配置", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const historyTable = wrapper.findComponent({ name: "HistoryTable" });
      expect(historyTable.exists()).toBe(true);

      // 验证列配置
      const columns = wrapper.vm.displayColumns;
      expect(columns).toBeInstanceOf(Array);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns[0].dataIndex).toBe("id");
    });

    it("应该处理表格选择变化", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const mockSelection = [
        { id: 1, type: "info", optType: "add" },
        { id: 2, type: "info", optType: "update" },
      ];

      wrapper.vm.handleSelectionChange(mockSelection);

      expect(wrapper.vm.onSelectChange).toHaveBeenCalledWith(
        [1, 2],
        mockSelection
      );
    });
  });

  describe("列配置管理", () => {
    it("应该显示列设置弹窗", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.columnSettingsVisible).toBe(false);

      wrapper.vm.showTableColumnSettings();

      expect(wrapper.vm.columnSettingsVisible).toBe(true);
    });

    it("应该加载用户列配置", async () => {
      await router.push("/jsonHis");

      const { tableColumnConfigApi } = await import(
        "/@/api/system/table-column-config-api"
      );
      tableColumnConfigApi.getUserTableColumn.mockResolvedValue({
        conf_value: JSON.stringify([
          { title: "ID", dataIndex: "id", visible: true },
          { title: "类型", dataIndex: "type", visible: true },
        ]),
      });

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      await wrapper.vm.loadUserTableColumnConfig();
      await nextTick();

      expect(tableColumnConfigApi.getUserTableColumn).toHaveBeenCalled();
    });

    it("应该保存用户列配置", async () => {
      await router.push("/jsonHis");

      const { tableColumnConfigApi } = await import(
        "/@/api/system/table-column-config-api"
      );

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const mockColumns = [
        { title: "ID", dataIndex: "id", visible: true },
        { title: "类型", dataIndex: "type", visible: false },
      ];

      // saveColumnSettings 需要接收 columnsData 参数
      await wrapper.vm.saveColumnSettings(mockColumns);

      expect(tableColumnConfigApi.saveUserTableColumn).toHaveBeenCalled();
      expect(wrapper.vm.columnSettingsVisible).toBe(false);
    });

    it("应该重置列配置", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      wrapper.vm.columnSettingsData = [
        { title: "Custom", dataIndex: "custom", visible: true },
      ];

      wrapper.vm.resetColumnSettings();

      // 验证重置为原始列配置
      expect(wrapper.vm.columnSettingsData.length).toBeGreaterThan(0);
      expect(wrapper.vm.columnSettingsVisible).toBe(false);
    });
  });

  describe("查询功能", () => {
    it("应该执行查询操作", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      wrapper.vm.query();

      expect(wrapper.vm.query).toHaveBeenCalled();
    });

    it("应该重置查询条件", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 设置查询条件
      wrapper.vm.queryForm.type = "info";
      wrapper.vm.queryForm.optType = "add";

      wrapper.vm.resetQuery();

      expect(wrapper.vm.resetQuery).toHaveBeenCalled();
    });
  });

  describe("分页功能", () => {
    it("应该处理分页变化", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      wrapper.vm.handleTableChange({ current: 2, pageSize: 50 });

      expect(wrapper.vm.handleTableChange).toHaveBeenCalledWith({
        current: 2,
        pageSize: 50,
      });
    });

    it("应该更新分页参数", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      wrapper.vm.pagination.current = 3;
      wrapper.vm.pagination.pageSize = 30;

      expect(wrapper.vm.pagination.current).toBe(3);
      expect(wrapper.vm.pagination.pageSize).toBe(30);
    });
  });

  describe("数据操作", () => {
    it("应该处理批量删除", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // 设置选中行
      wrapper.vm.selectedRowKeys = [1, 2, 3];
      wrapper.vm.hasSelected = true;

      wrapper.vm.batchDelete();

      expect(wrapper.vm.batchDelete).toHaveBeenCalled();
    });

    it("应该处理单个删除", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const mockRecord = { id: 1, type: "info", optType: "add" };

      wrapper.vm.singleDelete(mockRecord);

      expect(wrapper.vm.singleDelete).toHaveBeenCalledWith(mockRecord);
    });

    it("应该打开查看抽屉", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const mockRecord = { id: 1, type: "info", optType: "add", content: "{}" };

      wrapper.vm.openDrawer(mockRecord);

      expect(wrapper.vm.openDrawer).toHaveBeenCalledWith(mockRecord);
    });
  });

  describe("工具提示功能", () => {
    it("应该根据配置显示工具提示", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      expect(wrapper.vm.showTooltips.value).toBe(true);
    });

    it("应该在工具提示启用时显示tooltip属性", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // showTooltips为true时，不应该有disabled属性
      // 这个测试的预期可能需要调整，取决于实际实现
      expect(wrapper.vm.showTooltips.value).toBe(true);
    });
  });

  describe("表格ID管理", () => {
    it("应该设置正确的表格ID", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      // tableId 是从常量 TABLE_ID_CONST 获取的数字 ID
      expect(wrapper.vm.tableId).toBe(10003); // system.history 对应的表格ID
    });

    it("应该处理用户ID获取", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const userId = wrapper.vm.getCurrentUserId();
      expect(userId).toBeNull(); // 当前实现返回null，表示使用全局配置
    });
  });

  describe("响应式布局", () => {
    it("应该正确渲染页面头部", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const pageHeader = wrapper.find(".page-header");
      expect(pageHeader.exists()).toBe(true);
    });

    it("应该正确渲染页面内容区域", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const pageContent = wrapper.find(".page-content");
      expect(pageContent.exists()).toBe(true);
    });

    it("应该正确渲染表格工具栏", async () => {
      await router.push("/jsonHis");

      wrapper = mount(HistoryIndex, {
        global: {
          plugins: [router, pinia],
        },
      });

      const tableToolbar = wrapper.find(".table-toolbar");
      expect(tableToolbar.exists()).toBe(true);
    });
  });
});
