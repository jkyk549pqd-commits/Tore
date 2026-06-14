/**
 * useStatePersistence composable 单元测试
 */

import { ref } from "vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStatePersistence } from "./useStatePersistence";
import { TextStatePersistenceManager } from "../text-operations";

// Mock store
const mockStore = {
  getInstanceState: vi.fn(),
  setInstanceState: vi.fn(),
};

vi.mock("/@/store/modules/system/user", () => ({
  useUserStore: () => mockStore,
}));

vi.mock("../text-operations", () => ({
  TextStatePersistenceManager: {
    saveStateToStore: vi.fn(),
    restoreStateFromStore: vi.fn(),
    resetEditorState: vi.fn(),
    applyRestoredState: vi.fn(),
  },
}));

describe("useStatePersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该正确初始化 composable", () => {
    const textContent = ref("测试内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { saveState, restoreState, applyState, resetState } =
      useStatePersistence({
        textContent,
        isRestoringState,
        stateKey,
      });

    expect(saveState).toBeDefined();
    expect(restoreState).toBeDefined();
    expect(applyState).toBeDefined();
    expect(resetState).toBeDefined();
  });

  it("应该调用 saveStateToStore 保存状态", () => {
    const textContent = ref("测试内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { saveState } = useStatePersistence({
      textContent,
      isRestoringState,
      stateKey,
    });

    saveState();

    expect(TextStatePersistenceManager.saveStateToStore).toHaveBeenCalledWith({
      stateKey: "textEditor_default",
      textContent: "测试内容",
      isContentSaved: undefined,
      userStore: mockStore,
    });
  });

  it("应该调用 restoreStateFromStore 恢复状态", () => {
    const mockState = {
      textContent: "恢复的内容",
      isContentSaved: true,
    };

    TextStatePersistenceManager.restoreStateFromStore.mockReturnValue(
      mockState
    );

    const textContent = ref("测试内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { restoreState } = useStatePersistence({
      textContent,
      isRestoringState,
      stateKey,
    });

    const result = restoreState();

    expect(result).toEqual(mockState);
    expect(
      TextStatePersistenceManager.restoreStateFromStore
    ).toHaveBeenCalledWith("textEditor_default", mockStore);
  });

  it("应该调用 applyRestoredState 应用恢复的状态", () => {
    const mockState = {
      textContent: "恢复的内容",
      isContentSaved: true,
    };

    TextStatePersistenceManager.restoreStateFromStore.mockReturnValue(
      mockState
    );

    const textContent = ref("初始内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { applyState } = useStatePersistence({
      textContent,
      isRestoringState,
      stateKey,
    });

    const result = applyState();

    expect(result).toBe(true);
    expect(TextStatePersistenceManager.applyRestoredState).toHaveBeenCalledWith(
      mockState,
      expect.any(Function)
    );
  });

  it("应该在没有保存状态时重置编辑器", () => {
    TextStatePersistenceManager.restoreStateFromStore.mockReturnValue(null);

    const textContent = ref("初始内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { applyState } = useStatePersistence({
      textContent,
      isRestoringState,
      stateKey,
    });

    const result = applyState();

    expect(result).toBe(false);
    expect(TextStatePersistenceManager.resetEditorState).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it("应该调用 resetEditorState 重置状态", () => {
    const textContent = ref("测试内容");
    const isRestoringState = ref(false);
    const stateKey = ref("textEditor_default");

    const { resetState } = useStatePersistence({
      textContent,
      isRestoringState,
      stateKey,
    });

    resetState();

    expect(TextStatePersistenceManager.resetEditorState).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });
});
