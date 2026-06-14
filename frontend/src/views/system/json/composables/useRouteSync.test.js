/**
 * JSON编辑器路由同步 Composable 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useRouteSync } from "./useRouteSync";
import {
  getInstanceIdFromQuery,
  handleRouteQueryChange,
  initializeInstanceState,
  handleActivatedState,
} from "/@/utils/instance-state-manager";

// Mock 实例状态管理工具
vi.mock("/@/utils/instance-state-manager", () => ({
  getInstanceIdFromQuery: vi.fn(),
  handleRouteQueryChange: vi.fn(),
  initializeInstanceState: vi.fn(),
  handleActivatedState: vi.fn(),
}));

describe("useRouteSync - 路由同步 Composable", () => {
  let mockRoute;
  let isRestoringState;
  let composable;

  beforeEach(() => {
    // 重置 mocks
    vi.clearAllMocks();

    // 设置测试数据
    mockRoute = {
      name: "902",
      query: {},
    };

    isRestoringState = ref(false);

    // 设置 mock 返回值
    getInstanceIdFromQuery.mockReturnValue(null);
    
    // 让 initializeInstanceState 调用 mock 的 getInstanceIdFromQuery
    initializeInstanceState.mockImplementation((query, routeName) => {
      const instanceId = getInstanceIdFromQuery(query);
      return {
        instanceId,
        stateKey: routeName && instanceId ? `${routeName}_instance_${instanceId}` : `${routeName}_default`,
        hasExistingState: !!instanceId
      };
    });

    handleRouteQueryChange.mockReturnValue({
      newInstanceId: null,
      newStateKey: "902_default",
    });

    handleActivatedState.mockReturnValue({
      instanceId: null,
      stateKey: "902_default",
    });

    // 获取 composable 实例
    composable = useRouteSync({ route: mockRoute, isRestoringState });
  });

  describe("初始状态", () => {
    it("应该初始化实例ID为null", () => {
      expect(composable.instanceId.value).toBe(null);
    });

    it("应该初始化默认状态key", () => {
      expect(composable.stateKey.value).toBe("902_default");
    });

    it("应该提供所有必要的方法", () => {
      expect(composable.initializeRouteState).toBeInstanceOf(Function);
      expect(composable.handleQueryChange).toBeInstanceOf(Function);
      expect(composable.handleActivation).toBeInstanceOf(Function);
    });
  });

  describe("initializeRouteState", () => {
    it("应该正确初始化路由状态", () => {
      composable.initializeRouteState();

      expect(initializeInstanceState).toHaveBeenCalledWith(
        mockRoute.query,
        mockRoute.name
      );
      expect(composable.instanceId.value).toBe(null);
      expect(composable.stateKey.value).toBe("902_default");
    });

    it("应该处理有实例ID的路由", () => {
      getInstanceIdFromQuery.mockReturnValue("1");
      initializeInstanceState.mockReturnValue({
        instanceId: "1",
        stateKey: "902_instance_1",
        hasExistingState: true,
      });

      mockRoute.query = { _instance_1: "1" };

      composable.initializeRouteState();

      expect(composable.instanceId.value).toBe("1");
      expect(composable.stateKey.value).toBe("902_instance_1");
    });

    it("应该调用getInstanceIdFromQuery", () => {
      composable.initializeRouteState();

      expect(getInstanceIdFromQuery).toHaveBeenCalledWith(mockRoute.query);
    });
  });

  describe("handleQueryChange", () => {
    it("应该处理路由查询变化", () => {
      const newQuery = { _instance_1: "1" };
      const oldQuery = {};
      const currentState = {
        jsonStr1: '{"test":1}',
        jsonStr2: "{}",
        showRightBox: false,
      };

      handleRouteQueryChange.mockReturnValue({
        newInstanceId: "1",
        newStateKey: "902_instance_1",
      });

      const result = composable.handleQueryChange({
        newQuery,
        oldQuery,
        currentState,
      });

      expect(isRestoringState.value).toBe(true);
      expect(handleRouteQueryChange).toHaveBeenCalledWith(
        newQuery,
        oldQuery,
        mockRoute.name
      );
      expect(composable.instanceId.value).toBe("1");
      expect(composable.stateKey.value).toBe("902_instance_1");
      expect(result).toEqual({
        instanceId: "1",
        stateKey: "902_instance_1",
      });
    });

    it("应该设置恢复状态标志", () => {
      const newQuery = { _instance_2: "2" };
      const oldQuery = {};
      const currentState = {};

      composable.handleQueryChange({ newQuery, oldQuery, currentState });

      expect(isRestoringState.value).toBe(true);
    });

    it("应该处理没有实例ID的查询", () => {
      const newQuery = { other: "param" };
      const oldQuery = {};
      const currentState = {};

      handleRouteQueryChange.mockReturnValue({
        newInstanceId: null,
        newStateKey: "902_default",
      });

      composable.handleQueryChange({ newQuery, oldQuery, currentState });

      expect(composable.instanceId.value).toBe(null);
      expect(composable.stateKey.value).toBe("902_default");
    });
  });

  describe("handleActivation", () => {
    it("应该处理组件激活", () => {
      handleActivatedState.mockReturnValue({
        instanceId: "1",
        stateKey: "902_instance_1",
      });

      mockRoute.query = { _instance_1: "1" };

      const result = composable.handleActivation();

      expect(handleActivatedState).toHaveBeenCalledWith(
        mockRoute.query,
        mockRoute.name
      );
      expect(composable.instanceId.value).toBe("1");
      expect(composable.stateKey.value).toBe("902_instance_1");
      expect(result).toEqual({
        instanceId: "1",
        stateKey: "902_instance_1",
      });
    });

    it("应该处理无效的路由名称", () => {
      mockRoute.name = undefined;

      handleActivatedState.mockReturnValue({
        instanceId: null,
        stateKey: "902_default",
      });

      composable.handleActivation();

      expect(handleActivatedState).toHaveBeenCalledWith(
        mockRoute.query,
        "902" // 应该使用默认值
      );
    });

    it("应该处理没有实例ID的激活", () => {
      mockRoute.query = {};

      handleActivatedState.mockReturnValue({
        instanceId: null,
        stateKey: "902_default",
      });

      composable.handleActivation();

      expect(composable.instanceId.value).toBe(null);
      expect(composable.stateKey.value).toBe("902_default");
    });
  });

  describe("状态键生成", () => {
    it("应该为默认实例生成正确的状态键", () => {
      getInstanceIdFromQuery.mockReturnValue(null);
      initializeInstanceState.mockReturnValue({
        instanceId: null,
        stateKey: "902_default",
        hasExistingState: false,
      });

      composable.initializeRouteState();

      expect(composable.stateKey.value).toBe("902_default");
    });

    it("应该为多实例生成正确的状态键", () => {
      getInstanceIdFromQuery.mockReturnValue("1");
      initializeInstanceState.mockReturnValue({
        instanceId: "1",
        stateKey: "902_instance_1",
        hasExistingState: true,
      });

      composable.initializeRouteState();

      expect(composable.stateKey.value).toBe("902_instance_1");
    });

    it("应该为不同实例生成不同的状态键", () => {
      const composable1 = useRouteSync({
        route: { name: "902", query: { _instance_1: "1" } },
        isRestoringState: ref(false),
      });

      const composable2 = useRouteSync({
        route: { name: "902", query: { _instance_2: "2" } },
        isRestoringState: ref(false),
      });

      getInstanceIdFromQuery.mockImplementation((query) => {
        if (query._instance_1) return "1";
        if (query._instance_2) return "2";
        return null;
      });

      initializeInstanceState.mockImplementation((query, routeName) => {
        const instanceId = getInstanceIdFromQuery(query);
        return {
          instanceId,
          stateKey: instanceId
            ? `${routeName}_instance_${instanceId}`
            : `${routeName}_default`,
          hasExistingState: !!instanceId,
        };
      });

      composable1.initializeRouteState();
      composable2.initializeRouteState();

      expect(composable1.stateKey.value).toBe("902_instance_1");
      expect(composable2.stateKey.value).toBe("902_instance_2");
    });
  });

  describe("路由变化处理", () => {
    it("应该正确处理从默认实例到多实例的切换", () => {
      const currentState = {
        jsonStr1: "{}",
        jsonStr2: "",
        showRightBox: false,
      };

      // 初始化为默认实例
      composable.initializeRouteState();
      expect(composable.instanceId.value).toBe(null);
      expect(composable.stateKey.value).toBe("902_default");

      // 切换到多实例
      const newQuery = { _instance_1: "1" };
      handleRouteQueryChange.mockReturnValue({
        newInstanceId: "1",
        newStateKey: "902_instance_1",
      });

      composable.handleQueryChange({
        newQuery,
        oldQuery: {},
        currentState,
      });

      expect(composable.instanceId.value).toBe("1");
      expect(composable.stateKey.value).toBe("902_instance_1");
    });

    it("应该正确处理多实例之间的切换", () => {
      const currentState = {
        jsonStr1: "{}",
        jsonStr2: "",
        showRightBox: false,
      };

      // 初始化为实例1
      mockRoute.query = { _instance_1: "1" };
      getInstanceIdFromQuery.mockReturnValue("1");
      initializeInstanceState.mockReturnValue({
        instanceId: "1",
        stateKey: "902_instance_1",
        hasExistingState: true,
      });

      composable.initializeRouteState();

      // 切换到实例2
      const newQuery = { _instance_2: "2" };
      const oldQuery = { _instance_1: "1" };
      getInstanceIdFromQuery.mockReturnValue("2");

      handleRouteQueryChange.mockReturnValue({
        newInstanceId: "2",
        newStateKey: "902_instance_2",
      });

      composable.handleQueryChange({ newQuery, oldQuery, currentState });

      expect(composable.instanceId.value).toBe("2");
      expect(composable.stateKey.value).toBe("902_instance_2");
    });
  });

  describe("恢复状态标志管理", () => {
    it("应该在查询变化时设置恢复标志", () => {
      composable.handleQueryChange({
        newQuery: { _instance_1: "1" },
        oldQuery: {},
        currentState: {},
      });

      expect(isRestoringState.value).toBe(true);
    });

    it("应该允许外部控制恢复标志", () => {
      expect(isRestoringState.value).toBe(false);

      isRestoringState.value = true;
      expect(isRestoringState.value).toBe(true);

      isRestoringState.value = false;
      expect(isRestoringState.value).toBe(false);
    });
  });
});
