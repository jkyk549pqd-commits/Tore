/**
 * 测试工具函数集合
 */

import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia } from "pinia";
import { config } from "@vue/test-utils";

/**
 * 创建测试路由
 */
export function createTestRouter(routes = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
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
      ...routes,
    ],
  });
}

/**
 * 创建测试 Pinia 实例
 */
export function createTestPinia() {
  return createPinia();
}

/**
 * 等待下一个 tick
 */
export function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * 等待多个 tick
 */
export async function waitTicks(count = 1) {
  for (let i = 0; i < count; i++) {
    await nextTick();
  }
}

/**
 * 创建 Mock 组件
 */
export function createMockComponent(template = "<div></div>") {
  return {
    name: "MockComponent",
    template,
  };
}

/**
 * Mock 响应式数据
 */
export function mockReactive(data) {
  return JSON.parse(JSON.stringify(data));
}

/**
 * 等待异步操作完成
 */
export function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
      } else {
        setTimeout(checkCondition, 10);
      }
    };

    checkCondition();
  });
}

/**
 * 模拟文件对象
 */
export function createMockFile(
  content,
  name = "test.json",
  type = "application/json"
) {
  return new File([content], name, { type });
}

/**
 * 清理所有 mocks
 */
export function clearAllMocks() {
  vi.clearAllMocks();
  vi.restoreAllMocks();
}

/**
 * 设置路由 query 参数
 */
export async function setRouteQuery(router, query) {
  await router.replace({ query });
}

/**
 * 获取当前路由信息
 */
export function getCurrentRoute(router) {
  return router.currentRoute.value;
}
