/**
 * 首页最近记录 Composable 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useRecentRecords } from "./useRecentRecords";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { localRead, localSave, localRemove } from "/@/utils/local-util";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// Mock local-storage 工具
vi.mock("/@/utils/local-util", () => ({
  localRead: vi.fn(),
  localSave: vi.fn(),
  localRemove: vi.fn(),
}));

// Mock Ant Design message
vi.mock("ant-design-vue", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock vue-router's useRouter
vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

// Mock vue-i18n's useI18n
vi.mock("vue-i18n", () => ({
  useI18n: vi.fn(),
}));

describe("useRecentRecords - 最近记录 Composable", () => {
  let router;
  let pinia;
  let message;

  beforeAll(async () => {
    // 创建测试路由（只创建一次）
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/home",
          name: "home",
          component: { template: "<div>Home</div>" },
        },
        {
          path: "/json",
          name: "902",
          component: { template: "<div>JSON</div>" },
        },
      ],
    });

    // 等待路由准备就绪
    await router.push("/home");
    await router.isReady();

    // 创建 Pinia 实例（只创建一次）
    pinia = createPinia();
    setActivePinia(pinia);

    // 获取 message mock
    const antDesignVue = await import("ant-design-vue");
    message = antDesignVue.message;
  });

  beforeEach(async () => {
    // 每个测试前重置路由到 /home
    await router.push("/home");
    await router.isReady();

    // 清理 mocks
    vi.clearAllMocks();

    // Mock localRead to return null by default (empty records)
    localRead.mockReturnValue(null);

    // Mock useRouter 返回创建的 router（每次测试前重新设置）
    useRouter.mockReturnValue(router);

    // Mock useI18n 返回默认值
    useI18n.mockReturnValue({
      t: vi.fn((key) => key),
      locale: ref("zh-CN"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadRecentRecords", () => {
    it("应该从localStorage加载最近记录", () => {
      const mockData = [
        {
          id: 1,
          name: "test.json",
          content: '{"test":1}',
          timestamp: 1234567890,
        },
      ];
      localRead.mockReturnValue(JSON.stringify(mockData));

      const { loadRecentRecords, records } = useRecentRecords();

      loadRecentRecords();

      expect(localRead).toHaveBeenCalledWith("json_recent_records");
      // 修复：直接比较数组内容
      expect(records.value).toHaveLength(1);
      expect(records.value[0].id).toBe(1);
      expect(records.value[0].name).toBe("test.json");
    });

    it("应该处理空的localStorage", () => {
      localRead.mockReturnValue(null);

      const { loadRecentRecords, records } = useRecentRecords();

      loadRecentRecords();

      expect(records.value).toEqual([]);
    });

    it("应该处理无效的JSON数据", () => {
      localRead.mockReturnValue("invalid json");

      const { loadRecentRecords, records } = useRecentRecords();

      loadRecentRecords();

      // 无效JSON应该被捕获并返回空数组
      expect(records.value).toEqual([]);
    });

    it("应该设置loading状态", async () => {
      // mock 同步返回，避免异步问题
      localRead.mockReturnValue("[]");

      const { loadRecentRecords, loading } = useRecentRecords();

      loadRecentRecords();
      // loading在finally块中被设置为false，所以这里应该是false
      expect(loading.value).toBe(false);
    });
  });

  describe("addRecord", () => {
    it("应该添加新记录到列表顶部", () => {
      const { addRecord, records } = useRecentRecords();

      // 先添加一条记录
      addRecord({
        name: "old.json",
        content: "{}",
        original: "{}",
      });

      // 再添加一条新记录
      addRecord({
        name: "new.json",
        content: '{"new":1}',
        original: '{"new":1}',
      });

      expect(records.value.length).toBe(2);
      expect(records.value[0].name).toBe("new.json");
      expect(records.value[1].name).toBe("old.json");
    });

    it("应该限制最大记录数量为10条", () => {
      const { addRecord, records } = useRecentRecords();

      // 添加11条记录
      for (let i = 0; i < 11; i++) {
        addRecord({
          name: `test${i}.json`,
          content: `{ "test": ${i} }`,
          original: `{ "test": ${i} }`,
        });
      }

      expect(records.value.length).toBe(10);
      // 最新的记录应该在顶部
      expect(records.value[0].name).toBe("test10.json");
      // 最旧的记录应该被移除
      expect(
        records.value.find((r) => r.name === "test0.json")
      ).toBeUndefined();
    });

    it("应该更新已存在的同名记录", () => {
      const { addRecord, records } = useRecentRecords();

      // 先添加一条记录
      addRecord({
        name: "test.json",
        content: '{"old":1}',
        original: '{"old":1}',
      });

      // 添加同名记录应该更新
      addRecord({
        name: "test.json",
        content: '{"new":2}',
        original: '{"new":2}',
      });

      expect(records.value.length).toBe(1);
      expect(records.value[0].content).toBe('{"new":2}');
    });

    it("应该生成默认文件名", () => {
      const { addRecord, records } = useRecentRecords();

      addRecord({
        content: '{"test":1}',
        original: '{"test":1}',
      });

      expect(records.value[0].name).toBe("未命名文件");
    });

    it("应该调用localSave保存记录", () => {
      localSave.mockImplementation(() => {});

      const { addRecord } = useRecentRecords();

      addRecord({
        name: "test.json",
        content: '{"test":1}',
        original: '{"test":1}',
      });

      expect(localSave).toHaveBeenCalledWith(
        "json_recent_records",
        expect.stringContaining('"test.json"')
      );
    });
  });

  describe("deleteRecord", () => {
    it("应该删除指定ID的记录", () => {
      const composable = useRecentRecords();
      const { deleteRecord, addRecord, records } = composable;

      // 通过addRecord添加记录
      addRecord({ name: "test1.json", content: "{}", original: "{}" });
      addRecord({ name: "test2.json", content: "{}", original: "{}" });
      addRecord({ name: "test3.json", content: "{}", original: "{}" });

      const recordToDelete = records.value[1]; // test2.json
      deleteRecord(recordToDelete.id);

      expect(records.value.length).toBe(2);
      expect(
        records.value.find((r) => r.id === recordToDelete.id)
      ).toBeUndefined();
    });

    it("应该调用localSave保存更新后的记录", () => {
      let savedData = null;
      localSave.mockImplementation((key, data) => {
        if (key === "json_recent_records") {
          savedData = data;
        }
      });

      const composable = useRecentRecords();
      const { deleteRecord, addRecord, records } = composable;

      // 添加记录而不是直接设置
      addRecord({ name: "test1.json", content: "{}", original: "{}" });
      addRecord({ name: "test2.json", content: "{}", original: "{}" });

      deleteRecord(records.value[0].id);

      expect(localSave).toHaveBeenCalled();
      expect(savedData).toBeTruthy();
    });

    it("应该显示删除成功消息", () => {
      const { deleteRecord, addRecord, records } = useRecentRecords();

      // 添加记录
      addRecord({ name: "test.json", content: "{}", original: "{}" });

      deleteRecord(records.value[0].id);

      expect(message.success).toHaveBeenCalledWith("删除成功");
    });

    it("应该处理删除不存在的记录", () => {
      const { deleteRecord } = useRecentRecords();

      // 空列表时删除不存在的记录
      deleteRecord(999);

      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe("openRecord", () => {
    it("应该跳转到JSON页面并传递数据", async () => {
      const composable = useRecentRecords();
      const { openRecord, addRecord, records } = composable;

      // 添加测试记录
      addRecord({
        name: "test.json",
        content: '{"test":1}',
        original: '{"test":1}',
      });

      const testRecord = records.value[0];

      localSave.mockImplementation(() => {});

      await openRecord(testRecord);
      await router.isReady();

      expect(localSave).toHaveBeenCalled();
      expect(router.currentRoute.value.path).toBe("/json");
    });

    it("应该生成临时的localStorage key", async () => {
      const composable = useRecentRecords();
      const { openRecord, addRecord, records } = composable;

      // 添加测试记录
      addRecord({
        name: "test.json",
        content: '{"test":1}',
        original: '{"test":1}',
      });

      const testRecord = records.value[0];

      let tempKey = null;
      localSave.mockImplementation((key) => {
        if (key && key.startsWith("temp_json_")) {
          tempKey = key;
        }
      });

      await openRecord(testRecord);
      await router.isReady();

      expect(tempKey).toBeTruthy();
      expect(tempKey).toMatch(/^temp_json_\d+$/);
    });

    it("应该在路由查询中包含临时key", async () => {
      const composable = useRecentRecords();
      const { openRecord, addRecord, records } = composable;

      // 添加测试记录
      addRecord({
        name: "test.json",
        content: '{"test":1}',
        original: '{"test":1}',
      });

      const testRecord = records.value[0];

      localSave.mockImplementation(() => {});

      await openRecord(testRecord);
      await router.isReady();

      expect(router.currentRoute.value.query._temp_key).toBeTruthy();
      expect(router.currentRoute.value.query._instance_).toBeTruthy();
    });

    it("应该处理打开记录时的错误", async () => {
      const composable = useRecentRecords();
      const { openRecord, addRecord, records } = composable;

      // 添加测试记录
      addRecord({
        name: "test.json",
        content: '{"test":1}',
        original: '{"test":1}',
      });

      const testRecord = records.value[0];

      localSave.mockImplementation(() => {
        throw new Error("Storage error");
      });

      await openRecord(testRecord);
      await router.isReady();

      // 错误时应该留在当前页面
      expect(router.currentRoute.value.path).toBe("/home");
    });
  });
});
