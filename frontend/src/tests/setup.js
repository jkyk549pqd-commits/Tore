import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock element-plus
vi.mock("element-plus", () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  ElNotification: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock ant-design-vue
vi.mock("ant-design-vue", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  Modal: {
    confirm: vi.fn(),
  },
}));

// Mock LocalStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  store: {},
};

localStorageMock.getItem.mockImplementation(
  (key) => localStorageMock.store[key] || null
);
localStorageMock.setItem.mockImplementation((key, value) => {
  localStorageMock.store[key] = String(value);
});
localStorageMock.removeItem.mockImplementation((key) => {
  delete localStorageMock.store[key];
});
localStorageMock.clear.mockImplementation(() => {
  localStorageMock.store = {};
});

global.localStorage = localStorageMock;

// Mock SessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  store: {},
};

sessionStorageMock.getItem.mockImplementation(
  (key) => sessionStorageMock.store[key] || null
);
sessionStorageMock.setItem.mockImplementation((key, value) => {
  sessionStorageMock.store[key] = String(value);
});
sessionStorageMock.removeItem.mockImplementation((key) => {
  delete sessionStorageMock.store[key];
});
sessionStorageMock.clear.mockImplementation(() => {
  sessionStorageMock.store = {};
});

global.sessionStorage = sessionStorageMock;

// Mock Electron API
global.window.electronAPI = {
  ipcRenderer: {
    invoke: vi.fn().mockResolvedValue({}),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
};

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.readyState = 0;
  }

  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2;
      if (this.onload) {
        this.onload({ target: { result: JSON.stringify(file.content || {}) } });
      }
    }, 0);
  }
};

// Mock Clipboard API
Object.defineProperty(global.navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
  configurable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:test-url");
global.URL.revokeObjectURL = vi.fn();

// Mock Element Plus message
global.ElMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

// Mock Ant Design message
global.message = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

// Mock Ant Design Modal
global.Modal = {
  confirm: vi.fn(),
};

// Vue Test Utils global config
config.global.mocks = {
  $t: (key) => key,
  $route: {
    path: "/",
    name: "home",
    query: {},
    params: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

// 清理函数，在每个测试后调用
afterEach(() => {
  // 清理 LocalStorage
  localStorageMock.store = {};
  // 清理 SessionStorage
  sessionStorageMock.store = {};
  // 清理所有 mock
  vi.clearAllMocks();
});
