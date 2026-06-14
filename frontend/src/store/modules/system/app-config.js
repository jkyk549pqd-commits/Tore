/*
 * 项目的配置信息
 *
 */
import { defineStore } from "pinia";
import {
  appDefaultConfig,
  getAppConfigFromBackend,
} from "/@/config/app-config";
import localStorageKeyConst from "/@/constants/local-storage-key-const";
import { smartSentry } from "/@/lib/smart-sentry";
import { localRead, localSave } from "/@/utils/local-util";

let state = { ...appDefaultConfig };
let language = appDefaultConfig.language;
let appConfigStr = localRead(localStorageKeyConst.APP_CONFIG);

if (appConfigStr) {
  try {
    const savedState = JSON.parse(appConfigStr);
    // 合并保存的配置和默认配置，确保所有字段都存在
    state = { ...appDefaultConfig, ...savedState };
    language = state.language;

    // 临时修复：强制设置 keepTabsOnClose 为 true
    if (state.keepTabsOnClose === false) {
      console.log(
        "[app-config] 修正配置: 将 keepTabsOnClose 从 false 改为 true"
      );
      state.keepTabsOnClose = true;
      // 保存修正后的配置
      localSave(localStorageKeyConst.APP_CONFIG, JSON.stringify(state));
    }
  } catch (e) {
    smartSentry.captureError(e);
    // 解析失败时使用默认配置
    state = { ...appDefaultConfig };
  }
}

/**
 * 初始化应用配置（从后端获取）
 * @returns {Promise<void>}
 */
export async function initAppConfig() {
  try {
    const backendConfig = await getAppConfigFromBackend();

    // 读取本地存储的配置
    let localConfig = {};
    appConfigStr = localRead(localStorageKeyConst.APP_CONFIG);
    if (appConfigStr) {
      try {
        localConfig = JSON.parse(appConfigStr);
      } catch (e) {
        smartSentry.captureError(e);
        console.error("解析本地配置失败:", e);
      }
    }

    // 配置优先级：后端配置 > 本地配置 > 默认配置
    state = { ...appDefaultConfig, ...localConfig, ...backendConfig };
    language = state.language;

    // 验证并修复按钮配置，确保包含所有按钮
    if (state.jsonEditorButtons) {
      const defaultButtons = appDefaultConfig.jsonEditorButtons;
      const requiredButtons = Object.keys(defaultButtons);

      // 检查是否有缺失的按钮
      const missingButtons = requiredButtons.filter(
        (btnId) => !state.jsonEditorButtons[btnId]
      );

      if (missingButtons.length > 0) {
        // console.log("发现缺失的按钮配置:", missingButtons);
        // 添加缺失的按钮配置
        missingButtons.forEach((btnId) => {
          state.jsonEditorButtons[btnId] = { ...defaultButtons[btnId] };
        });
        // console.log("已自动添加缺失的按钮配置:", state.jsonEditorButtons);
      }
    }

    // console.log("应用配置初始化完成:", state);

    // 保存到本地存储
    try {
      localSave(localStorageKeyConst.APP_CONFIG, JSON.stringify(state));
    } catch (e) {
      smartSentry.captureError(e);
      console.error("保存配置到 localStorage 失败:", e);
    }
  } catch (error) {
    console.error("初始化应用配置失败，使用默认配置:", error);
    smartSentry.captureError(error);
    state = { ...appDefaultConfig };
    language = state.language;
  }
}

/**
 * 获取初始化的语言
 */
export const getInitializedLanguage = function () {
  return language;
};

export const useAppConfigStore = defineStore({
  id: "appConfig",
  state: () => ({
    // 读取config下的默认配置
    ...state,
  }),
  actions: {
    /**
     * 更新配置并保存到 localStorage
     * @param {Object} config - 要更新的配置对象
     */
    updateConfig(config) {
      this.$patch(config);
      try {
        const stateStr = JSON.stringify(this.$state);
        localSave(localStorageKeyConst.APP_CONFIG, stateStr);
        // 验证保存
        const savedStr = localStorage.getItem(localStorageKeyConst.APP_CONFIG);

        if (savedStr) {
          const saved = JSON.parse(savedStr);
        }
      } catch (e) {
        smartSentry.captureError(e);
        console.error("保存配置到 localStorage 失败:", e);
      }
    },
    reset() {
      for (const k in appDefaultConfig) {
        this[k] = appDefaultConfig[k];
      }
      try {
        localSave(localStorageKeyConst.APP_CONFIG, JSON.stringify(this.$state));
      } catch (e) {
        smartSentry.captureError(e);
        console.error("保存配置到 localStorage 失败:", e);
      }
    },
  },
});
