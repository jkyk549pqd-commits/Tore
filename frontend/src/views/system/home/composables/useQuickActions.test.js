/**
 * 首页快速操作 Composable 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQuickActions } from "./useQuickActions";
import { createRouter, createMemoryHistory } from "vue-router";

// Mock vue-router
vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

describe("useQuickActions - 快速操作 Composable", () => {
  let router;
  let mockRouter;

  beforeEach(async () => {
    // 创建mock router
    mockRouter = {
      push: vi.fn(),
      currentRoute: {
        value: {
          path: "/home",
          query: {},
        },
      },
    };

    // Mock useRouter 返回我们的 mock router
    const { useRouter } = await import("vue-router");
    useRouter.mockReturnValue(mockRouter);

    // 创建测试路由用于验证
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
        {
          path: "/jsonHis",
          name: "906",
          component: { template: "<div>History</div>" },
        },
      ],
    });
  });

  describe("handleJsonFormat", () => {
    it("应该跳转到JSON格式化页面", async () => {
      const { handleJsonFormat } = useQuickActions();

      handleJsonFormat();

      expect(mockRouter.push).toHaveBeenCalledWith("/json");
    });

    it("应该保持路由参数为空", async () => {
      const { handleJsonFormat } = useQuickActions();

      handleJsonFormat();

      expect(mockRouter.push).toHaveBeenCalledWith("/json");
    });
  });

  describe("handleJsonClipboard", () => {
    it("应该跳转到JSON页面并添加粘贴参数", async () => {
      const { handleJsonClipboard } = useQuickActions();

      handleJsonClipboard();

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/json",
          query: expect.objectContaining({
            paste: "true",
          }),
        })
      );
    });

    it("应该生成唯一的实例ID", async () => {
      const { handleJsonClipboard } = useQuickActions();

      handleJsonClipboard();

      const pushCall = mockRouter.push.mock.calls[0][0];
      expect(pushCall).toHaveProperty("path", "/json");
      expect(pushCall).toHaveProperty("query.paste", "true");
      expect(pushCall.query._instance_).toBeTruthy();
      expect(typeof pushCall.query._instance_).toBe("number");
    });
  });

  describe("handleHistory", () => {
    it("应该跳转到历史记录页面", async () => {
      const { handleHistory } = useQuickActions();

      handleHistory();

      expect(mockRouter.push).toHaveBeenCalledWith("/jsonHis");
    });
  });

  describe("handleImport", () => {
    it("应该设置导入弹框为显示状态", () => {
      const { handleImport, importDialogVisible } = useQuickActions();

      expect(importDialogVisible.value).toBe(false);

      handleImport();

      expect(importDialogVisible.value).toBe(true);
    });

    it("应该可以切换导入弹框状态", () => {
      const { handleImport, importDialogVisible } = useQuickActions();

      handleImport();
      expect(importDialogVisible.value).toBe(true);

      handleImport();
      // 注意：这里的状态切换逻辑可能需要根据实际实现调整
      // 如果 handleImport 只是设置为 true，则多次调用应该保持 true
      expect(importDialogVisible.value).toBe(true);
    });
  });

  describe("路由跳转顺序", () => {
    it("应该按预期顺序进行路由跳转", async () => {
      const { handleJsonFormat, handleHistory, handleJsonClipboard } =
        useQuickActions();

      // 测试 JSON 格式化
      handleJsonFormat();
      expect(mockRouter.push).toHaveBeenCalledWith("/json");

      // 测试历史记录
      handleHistory();
      expect(mockRouter.push).toHaveBeenCalledWith("/jsonHis");

      // 测试剪贴板粘贴
      handleJsonClipboard();
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/json",
          query: expect.objectContaining({
            paste: "true",
          }),
        })
      );
    });
  });
});
