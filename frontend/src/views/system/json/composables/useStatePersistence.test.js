/**
 * JSON编辑器状态持久化 Composable 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useStatePersistence } from "./useStatePersistence";
import { StatePersistenceManager } from "../json-operations";

// Mock 状态持久化管理器
vi.mock("../json-operations", () => ({
  StatePersistenceManager: {
    saveStateToStore: vi.fn(),
    restoreStateFromStore: vi.fn(),
    applyRestoredState: vi.fn(),
    resetEditorState: vi.fn(),
  },
}));

// Mock 用户Store
vi.mock("/@/store/modules/system/user", () => ({
  useUserStore: vi.fn(() => ({
    getInstanceState: vi.fn(),
    setInstanceState: vi.fn(),
    instanceStateMap: {},
  })),
}));

describe("useStatePersistence - 状态持久化 Composable", () => {
  let jsonStr1;
  let jsonStr2;
  let showRightBox;
  let showCodemirrorConf;
  let isRestoringState;
  let stateKey;
  let composable;
  let mockUserStore;

  beforeEach(() => {
    // 使用假计时器来处理 debounce
    vi.useFakeTimers();
    // 重置 mocks
    vi.clearAllMocks();

    // 设置测试数据
    jsonStr1 = ref('{"test":"value"}');
    jsonStr2 = ref('{"compare":"value"}');
    showRightBox = ref(false);
    showCodemirrorConf = ref(false);
    isRestoringState = ref(false);
    stateKey = ref("902_default");

    // 设置 mock 用户Store
    mockUserStore = {
      getInstanceState: vi.fn(() => null),
      setInstanceState: vi.fn(),
      instanceStateMap: {},
    };

    vi.doMock("/@/store/modules/system/user", () => ({
      useUserStore: () => mockUserStore,
    }));

    // 获取 composable 实例
    composable = useStatePersistence({
      jsonStr1,
      jsonStr2,
      showRightBox,
      showCodemirrorConf,
      isRestoringState,
      stateKey,
    });
  });

  describe("初始状态", () => {
    it("应该提供所有必要的方法", () => {
      expect(composable.saveState).toBeInstanceOf(Function);
      expect(composable.restoreState).toBeInstanceOf(Function);
      expect(composable.applyState).toBeInstanceOf(Function);
      expect(composable.resetState).toBeInstanceOf(Function);
    });
  });

  describe("saveState", () => {
    it("应该保存当前状态到Store", () => {
      const testKey = "902_default";

      composable.saveState();

      expect(StatePersistenceManager.saveStateToStore).toHaveBeenCalledWith({
        stateKey: testKey,
        jsonStr1: jsonStr1.value,
        jsonStr2: jsonStr2.value,
        showRightBox: showRightBox.value,
        userStore: expect.any(Object),
      });
    });

    it("应该使用当前的状态key", () => {
      stateKey.value = "902_instance_1";

      composable.saveState();

      expect(StatePersistenceManager.saveStateToStore).toHaveBeenCalledWith(
        expect.objectContaining({
          stateKey: "902_instance_1",
        })
      );
    });

    it("应该保存所有相关的状态", () => {
      jsonStr1.value = '{"new":"value"}';
      jsonStr2.value = '{"new":"compare"}';
      showRightBox.value = true;

      composable.saveState();

      expect(StatePersistenceManager.saveStateToStore).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonStr1: '{"new":"value"}',
          jsonStr2: '{"new":"compare"}',
          showRightBox: true,
        })
      );
    });
  });

  describe("restoreState", () => {
    it("应该从Store恢复状态", () => {
      const mockState = {
        jsonStr1: '{"restored":"value"}',
        jsonStr2: '{"restored":"compare"}',
        showRightBox: true,
        showCodemirrorConf: true,
      };

      StatePersistenceManager.restoreStateFromStore.mockReturnValue(mockState);

      const result = composable.restoreState();

      expect(
        StatePersistenceManager.restoreStateFromStore
      ).toHaveBeenCalledWith("902_default", expect.any(Object));
      expect(result).toBe(mockState);
    });

    it("应该返回null当没有保存的状态", () => {
      StatePersistenceManager.restoreStateFromStore.mockReturnValue(null);

      const result = composable.restoreState();

      expect(result).toBeNull();
    });
  });

  describe("applyState", () => {
    it("应该应用恢复的状态", () => {
      const mockState = {
        jsonStr1: '{"applied":"value"}',
        jsonStr2: '{"applied":"compare"}',
        showRightBox: true,
        showCodemirrorConf: true,
      };

      StatePersistenceManager.restoreStateFromStore.mockReturnValue(mockState);

      const result = composable.applyState();

      expect(StatePersistenceManager.applyRestoredState).toHaveBeenCalledWith(
        mockState,
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
      expect(result).toBe(true);
    });

    it("应该在状态应用时更新本地状态", () => {
      const mockState = {
        jsonStr1: '{"updated":"value"}',
        jsonStr2: '{"updated":"compare"}',
        showRightBox: true,
        showCodemirrorConf: false,
      };

      StatePersistenceManager.restoreStateFromStore.mockReturnValue(mockState);

      // 模拟 applyRestoredState 的回调
      StatePersistenceManager.applyRestoredState.mockImplementation(
        (state, callback1, callback2, callback3, callback4) => {
          callback1(state.jsonStr1);
          callback2(state.jsonStr2);
          callback3(state.showRightBox);
          callback4(state.showCodemirrorConf);
        }
      );

      composable.applyState();

      expect(jsonStr1.value).toBe('{"updated":"value"}');
      expect(jsonStr2.value).toBe('{"updated":"compare"}');
      expect(showRightBox.value).toBe(true);
      expect(showCodemirrorConf.value).toBe(false);
    });

    it("应该重置状态当没有保存的状态", () => {
      StatePersistenceManager.restoreStateFromStore.mockReturnValue(null);

      const result = composable.applyState();

      expect(StatePersistenceManager.resetEditorState).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
      expect(result).toBe(false);
    });

    it("应该在重置时清除本地状态", () => {
      // 设置初始状态
      jsonStr1.value = '{"initial":"value"}';
      jsonStr2.value = '{"initial":"compare"}';
      showRightBox.value = true;
      showCodemirrorConf.value = true;

      StatePersistenceManager.restoreStateFromStore.mockReturnValue(null);

      // 模拟 resetEditorState 的回调
      StatePersistenceManager.resetEditorState.mockImplementation(
        (callback1, callback2, callback3, callback4) => {
          callback1("");
          callback2("");
          callback3(false);
          callback4(false);
        }
      );

      composable.applyState();

      expect(jsonStr1.value).toBe("");
      expect(jsonStr2.value).toBe("");
      expect(showRightBox.value).toBe(false);
      expect(showCodemirrorConf.value).toBe(false);
    });
  });

  describe("resetState", () => {
    it("应该重置编辑器状态", () => {
      jsonStr1.value = '{"test":"value"}';
      jsonStr2.value = '{"test":"compare"}';
      showRightBox.value = true;
      showCodemirrorConf.value = true;

      // 模拟 resetEditorState 的回调
      StatePersistenceManager.resetEditorState.mockImplementation(
        (callback1, callback2, callback3, callback4) => {
          callback1("");
          callback2("");
          callback3(false);
          callback4(false);
        }
      );

      composable.resetState();

      expect(jsonStr1.value).toBe("");
      expect(jsonStr2.value).toBe("");
      expect(showRightBox.value).toBe(false);
      expect(showCodemirrorConf.value).toBe(false);
    });

    it("应该调用状态管理器的重置方法", () => {
      composable.resetState();

      expect(StatePersistenceManager.resetEditorState).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("状态隔离", () => {
    it("应该使用不同的状态key保存不同实例的状态", () => {
      const composable1 = useStatePersistence({
        jsonStr1: ref('{"instance":"1"}'),
        jsonStr2: ref("{}"),
        showRightBox: ref(false),
        showCodemirrorConf: ref(false),
        isRestoringState: ref(false),
        stateKey: ref("902_instance_1"),
      });

      const composable2 = useStatePersistence({
        jsonStr1: ref('{"instance":"2"}'),
        jsonStr2: ref("{}"),
        showRightBox: ref(false),
        showCodemirrorConf: ref(false),
        isRestoringState: ref(false),
        stateKey: ref("902_instance_2"),
      });

      composable1.saveState();
      composable2.saveState();

      expect(StatePersistenceManager.saveStateToStore).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          stateKey: "902_instance_1",
          jsonStr1: '{"instance":"1"}',
        })
      );

      expect(StatePersistenceManager.saveStateToStore).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          stateKey: "902_instance_2",
          jsonStr1: '{"instance":"2"}',
        })
      );
    });
  });

  describe("错误处理", () => {
    it("应该处理状态保存错误", () => {
      StatePersistenceManager.saveStateToStore.mockImplementation(() => {
        throw new Error("Save error");
      });

      expect(() => composable.saveState()).not.toThrow();
    });

    it("应该处理状态恢复错误", () => {
      StatePersistenceManager.restoreStateFromStore.mockImplementation(() => {
        throw new Error("Restore error");
      });

      const result = composable.restoreState();
      // 应该返回undefined而不是抛出错误
      expect(result).toBeUndefined();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});
