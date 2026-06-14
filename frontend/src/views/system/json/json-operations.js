/**
 * JSON操作工具函数
 * 提供JSON的格式化、压缩、排序、转义等常用操作
 */

import { jsonFormat, remEscap } from "/@/utils/str-util";
import { ElMessage } from "element-plus";
import md5 from "md5";

/**
 * 格式化JSON字符串
 * @param {string} jsonString - JSON字符串
 * @returns {string} 格式化后的JSON字符串
 * @throws {Error} 如果JSON格式错误
 */
export function formatJsonString(jsonString) {
  if (!jsonString) return jsonString;
  return jsonFormat(jsonString, "str");
}

/**
 * 压缩JSON字符串
 * @param {string} jsonString - JSON字符串
 * @returns {string} 压缩后的JSON字符串
 * @throws {Error} 如果JSON格式错误
 */
export function compressJsonString(jsonString) {
  if (!jsonString) return jsonString;
  return JSON.stringify(JSON.parse(jsonString));
}

/**
 * 递归排序对象的键
 * @param {*} obj - 要排序的对象
 * @returns {*} 排序后的对象
 */
export function sortObjectKeys(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);

  const sortedObj = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sortedObj[key] = sortObjectKeys(obj[key]);
    });
  return sortedObj;
}

/**
 * 排序JSON字符串
 * @param {string} jsonString - JSON字符串
 * @returns {string} 排序后的JSON字符串
 * @throws {Error} 如果JSON格式错误
 */
export function sortJsonString(jsonString) {
  if (!jsonString) return jsonString;
  const parsedJson = JSON.parse(jsonString);
  return JSON.stringify(sortObjectKeys(parsedJson), null, 2);
}

/**
 * 添加转义字符
 * @param {string} text - 文本字符串
 * @returns {string} 添加转义后的字符串
 */
export function addEscapes(text) {
  if (!text) return text;
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * 去除转义字符
 * @param {string} text - 文本字符串
 * @returns {string} 去除转义后的字符串
 */
export function removeEscapes(text) {
  if (!text) return text;
  return remEscap(text);
}

/**
 * 执行JSON操作并返回结果
 * @param {string} jsonString - JSON字符串
 * @param {string} operation - 操作类型: 'format', 'compress', 'sort', 'addEscape', 'removeEscape'
 * @returns {Object} 包含success, result, error的对象
 */
export function executeJsonOperation(jsonString, operation, t = null) {
  try {
    if (!jsonString) {
      return { success: true, result: jsonString, error: "" };
    }

    let result;
    switch (operation) {
      case "format":
        result = formatJsonString(jsonString);
        break;
      case "compress":
        result = compressJsonString(jsonString);
        break;
      case "sort":
        result = sortJsonString(jsonString);
        break;
      case "addEscape":
        result = addEscapes(jsonString);
        break;
      case "removeEscape":
        result = removeEscapes(jsonString);
        break;
      default:
        return {
          success: false,
          result: jsonString,
          error: t ? t("json.editor.unknownOperation") : "未知的操作类型",
        };
    }

    return { success: true, result, error: "" };
  } catch (error) {
    const errorMessages = t
      ? {
          format: t("json.editor.jsonFormatError"),
          compress: t("json.editor.jsonCompressError"),
          sort: t("json.editor.jsonSortError"),
          addEscape: t("json.editor.addEscapeError"),
          removeEscape: t("json.editor.removeEscapeError"),
        }
      : {
          format: "JSON格式错误，无法格式化，请检查后重试!",
          compress: "JSON格式错误，无法压缩，请检查后重试!",
          sort: "JSON格式错误，无法排序，请检查后重试!",
          addEscape: "内容无法添加转义字符，请检查后重试!",
          removeEscape: "内容无法去除转义字符，请检查后重试!",
        };
    const errorMessage =
      errorMessages[operation] ||
      (t ? t("json.editor.operationFailed") : "操作失败，请检查后重试!");
    return { success: false, result: jsonString, error: errorMessage };
  }
}

/**
 * 执行JSON操作并显示错误消息
 * @param {string} jsonString - JSON字符串
 * @param {string} operation - 操作类型
 * @param {Function} updateCallback - 更新结果的回调函数
 * @returns {boolean} 操作是否成功
 */
export function executeJsonOperationWithMessage(
  jsonString,
  operation,
  updateCallback,
  t = null
) {
  const { success, result, error } = executeJsonOperation(
    jsonString,
    operation,
    t
  );

  if (success) {
    if (updateCallback) {
      updateCallback(result);
    }
    return true;
  } else {
    if (t) {
      ElMessage.error(error);
    } else {
      ElMessage.error(error);
    }
    return false;
  }
}

/**
 * CodeMirror配置工具
 */
export const CodeMirrorConfig = {
  /**
   * 默认配置
   */
  defaultOptions: {
    height: "auto",
    mode: "application/json",
    lineWiseCopyCut: true,
    lint: true,
    foldGutter: true,
    gutters: [
      "CodeMirror-linenumbers",
      "CodeMirror-foldgutter",
      "CodeMirror-lint-markers",
    ],
    tabSize: 4,
  },

  /**
   * 可用的主题
   */
  themes: [
    { value: "idea", label: "idea" },
    { value: "3024-day", label: "3024-day" },
    { value: "3024-night", label: "3024-night" },
    { value: "duotone-light", label: "duotone-light" },
    { value: "dracula", label: "dracula" },
    { value: "solarized", label: "solarized" },
    { value: "abcdef", label: "abcdef" },
    { value: "yonce", label: "yonce" },
    { value: "ambiance-mobile", label: "ambiance-mobile" },
    { value: "ambiance", label: "ambiance" },
    { value: "base16-light", label: "base16-light" },
    { value: "cobalt", label: "cobalt" },
    { value: "lesser-dark", label: "lesser-dark" },
    { value: "liquibyte", label: "liquibyte" },
    { value: "lucario", label: "lucario" },
    { value: "material", label: "material" },
    { value: "mbo", label: "mbo" },
    { value: "mdn-like", label: "mdn-like" },
    { value: "paraiso-dark", label: "paraiso-dark" },
    { value: "paraiso-light", label: "paraiso-light" },
    { value: "railscasts", label: "railscasts" },
    { value: "rubyblue", label: "rubyblue" },
    { value: "seti", label: "seti" },
    { value: "shadowfox", label: "shadowfox" },
    { value: "the-matrix", label: "the-matrix" },
    { value: "tomorrow-night-bright", label: "tomorrow-night-bright" },
    { value: "tomorrow-night-eighties", label: "tomorrow-night-eighties" },
    { value: "ttcn", label: "ttcn" },
    { value: "twilight", label: "twilight" },
    { value: "eclipse", label: "eclipse" },
  ],

  /**
   * 创建配置对象
   * @param {Object} overrides - 覆盖的配置项
   * @returns {Object} CodeMirror配置对象
   */
  createOptions(overrides = {}) {
    return {
      ...this.defaultOptions,
      ...overrides,
    };
  },
};

/**
 * 容器高度更新工具
 */
export const ContainerHeightManager = {
  /**
   * 更新容器高度
   * @param {string} containerSelector - 容器选择器
   * @param {string} cardSelector - 卡片选择器
   * @param {string} headerSelector - 头部选择器
   * @param {Function} nextTick - Vue的nextTick函数
   */
  updateHeight(containerSelector, cardSelector, headerSelector, nextTick) {
    nextTick(() => {
      const textareaContainer = document.querySelector(containerSelector);
      const cardContainer = document.querySelector(cardSelector);

      if (textareaContainer && cardContainer) {
        const containerHeight = textareaContainer.offsetHeight;
        const headerHeight =
          document.querySelector(headerSelector)?.offsetHeight || 0;
        const minHeight = headerHeight + containerHeight + 100;
        const currentHeight = cardContainer.offsetHeight;
        const calculatedMinHeight = Math.max(
          minHeight,
          window.innerHeight - 110
        );

        if (currentHeight < calculatedMinHeight) {
          cardContainer.style.minHeight = calculatedMinHeight + "px";
        }
      }
    });
  },

  /**
   * 更新单个文本区域高度
   * @param {string} elementId - 元素ID
   * @param {Function} nextTick - Vue的nextTick函数
   * @param {number} minHeight - 最小高度
   */
  updateSingleHeight(elementId, nextTick, minHeight = 500) {
    nextTick(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.height = "auto";
        if (element.offsetHeight <= minHeight) {
          element.style.height = minHeight + "px";
        }
      }
    });
  },
};

/**
 * JSON比较工具
 */
export const JsonCompare = {
  /**
   * 准备比较数据并保存到sessionStorage
   * @param {string} jsonStr1 - 第一个JSON字符串
   * @param {string} jsonStr2 - 第二个JSON字符串
   * @returns {boolean} 是否准备成功
   */
  prepareCompareData(jsonStr1, jsonStr2) {
    if (!jsonStr1 || !jsonStr2) {
      return false;
    }

    try {
      sessionStorage.setItem(
        "jsonDiff",
        JSON.stringify({
          jsonStr1,
          jsonStr2,
        })
      );
      return true;
    } catch (e) {
      console.warn("prepareCompareData set sessionStorage failed", e);
      return false;
    }
  },
};

/**
 * 自动保存管理器
 */
export const AutoSaveManager = {
  getBeijingTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份加1，确保是两位数
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  async manualSaveCodeData({
    fromPage,
    textType,
    textStr,
    routeName,
    instanceId,
    inOptType,
    currentLogId,
    onSuccess,
    onError,
    socketClient,
    message,
    customName, // 新增参数：自定义名称
  }) {
    if (!textStr || textStr.trim() === "") {
      console.log("CodeStr数据为空，跳过保存");
      return { success: false, logId: currentLogId || null };
    }
    try {
      const tmpStr = md5(textStr);
      // 使用 customName 作为 tag，否则使用 routeName
      const tagName = customName || routeName || "text";

      // 已有 logId → 在现有日志上追加版本
      if (currentLogId) {
        const existing = await socketClient.invoke(
          "controller/system/getLogById",
          { id: currentLogId }
        );
        if (existing) {
          console.log("CodeStr数据已存在，existing:", existing);
          const newParent = customName || routeName;
          if (newParent && newParent !== existing.parentPage) {
            await socketClient.invoke("controller/system/updateLogParent", {
              id: existing.id,
              parent_page: newParent,
            });
          }

          const versionResult = await socketClient.invoke(
            "controller/system/createVersionForLog",
            {
              fromPage: fromPage || "2",
              logId: currentLogId,
              content: textStr,
              type: textType.toUpperCase() || "TEXT",
              md5: tmpStr,
              optType: inOptType || "2",
            }
          );
          return { success: true, logId: currentLogId };
        } else {
          console.log("CodeStr数据不存在，创建新日志，CodeType：", textType);
          const result = await socketClient.invoke(
            "controller/system/addLogAndVersion",
            {
              type: textType.toUpperCase() || "TEXT",
              opt_type: inOptType || "2",
              tag: instanceId || "code_default",
              parent_page: tagName,
              content: textStr,
              md5: tmpStr,
              crt_time: AutoSaveManager.getBeijingTime(),
              upd_time: AutoSaveManager.getBeijingTime(),
              optType: inOptType || "2",
            }
          );
          if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
          return { success: true, logId: result.logId };
        }
      }

      // 无 logId → MD5 去重检查 + 创建新日志
      const existing = await socketClient.invoke(
        "controller/system/getLogByMd5",
        { key: tmpStr, tag: instanceId }
      );
      if (existing) {
        console.log("CodeStr数据已存在，跳过保存");
        if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
        return { success: true, logId: existing.id || null };
      }

      const result = await socketClient.invoke(
        "controller/system/addLogAndVersion",
        {
          type: textType.toUpperCase() || "TEXT",
          opt_type: inOptType || "2",
          tag: instanceId || "code_default",
          parent_page: tagName,
          content: textStr,
          md5: tmpStr,
          optType: inOptType || "2",
          crt_time: AutoSaveManager.getBeijingTime(),
          upd_time: AutoSaveManager.getBeijingTime(),
        }
      );

      if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
      console.log("CodeStr手动保存成功, logId:", result.logId);
      return { success: true, logId: result.logId };
    } catch (error) {
      // 优化错误处理：对Socket.IO超时错误使用调试级别日志
      if (error.message && error.message.includes("Socket.IO 请求超时")) {
        console.debug("CodeStr数据保存暂时超时，可能是后端服务问题");
      } else {
        console.error("CodeStr数据手动保存失败:", error);
      }

      if (onError) {
        onError(error);
      } else if (message) {
        ElMessage.error(
          "Manual save failed: " + (error.message || "Unknown error")
        );
      }
      return { success: false, logId: currentLogId || null };
    }
  },

  async manualSaveTextData({
    fromPage,
    textType,
    textStr,
    routeName,
    instanceId,
    inOptType,
    currentLogId,
    onSuccess,
    onError,
    socketClient,
    message,
    customName, // 新增参数：自定义名称
  }) {
    if (!textStr || textStr.trim() === "") {
      console.log("textStr数据为空，跳过保存");
      return { success: false, logId: currentLogId || null };
    }
    try {
      const tmpStr = md5(textStr);
      // 使用 customName 作为 tag，否则使用 routeName
      const tagName = customName || routeName || "text";

      // 已有 logId → 在现有日志上追加版本
      if (currentLogId) {
        const existing = await socketClient.invoke(
          "controller/system/getLogById",
          { id: currentLogId }
        );
        if (existing) {
          console.log("textStr数据已存在，existing:", existing);
          const newParent = customName || routeName;
          if (newParent && newParent !== existing.parentPage) {
            await socketClient.invoke("controller/system/updateLogParent", {
              id: existing.id,
              parent_page: newParent,
            });
          }

          const versionResult = await socketClient.invoke(
            "controller/system/createVersionForLog",
            {
              fromPage: fromPage || "2",
              logId: currentLogId,
              content: textStr,
              type: textType.toUpperCase() || "TEXT",
              md5: tmpStr,
              optType: inOptType || "2",
            }
          );
          return { success: true, logId: currentLogId };
        } else {
          console.log("JSON数据不存在，创建新日志，textType：", textType);
          const result = await socketClient.invoke(
            "controller/system/addLogAndVersion",
            {
              type: textType.toUpperCase() || "TEXT",
              opt_type: inOptType || "2",
              tag: instanceId || "text_default",
              parent_page: tagName,
              content: textStr,
              md5: tmpStr,
              crt_time: AutoSaveManager.getBeijingTime(),
              upd_time: AutoSaveManager.getBeijingTime(),
              optType: inOptType || "2",
            }
          );
          if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
          return { success: true, logId: result.logId };
        }
      }

      // 无 logId → MD5 去重检查 + 创建新日志
      const existing = await socketClient.invoke(
        "controller/system/getLogByMd5",
        { key: tmpStr, tag: instanceId }
      );
      if (existing) {
        console.log("textStr数据已存在，跳过保存");
        if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
        return { success: true, logId: existing.id || null };
      }

      const result = await socketClient.invoke(
        "controller/system/addLogAndVersion",
        {
          type: textType.toUpperCase() || "TEXT",
          opt_type: inOptType || "2",
          tag: instanceId || "text_default",
          parent_page: tagName,
          content: textStr,
          md5: tmpStr,
          optType: inOptType || "2",
          crt_time: AutoSaveManager.getBeijingTime(),
          upd_time: AutoSaveManager.getBeijingTime(),
        }
      );

      if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
      console.log("string手动保存成功, logId:", result.logId);
      return { success: true, logId: result.logId };
    } catch (error) {
      // 优化错误处理：对Socket.IO超时错误使用调试级别日志
      if (error.message && error.message.includes("Socket.IO 请求超时")) {
        console.debug("textStr数据保存暂时超时，可能是后端服务问题");
      } else {
        console.error("textStr数据手动保存失败:", error);
      }

      if (onError) {
        onError(error);
      } else if (message) {
        ElMessage.error(
          "Manual save failed: " + (error.message || "Unknown error")
        );
      }
      return { success: false, logId: currentLogId || null };
    }
  },

  /**
   * 手动保存JSON数据到后端
   * @param {Object} params - 保存参数
   * @param {string} params.jsonStr - JSON字符串
   * @param {string} params.routeName - 路由名称
   * @param {string|null} params.instanceId - 实例ID
   * @param {Function} params.onSuccess - 成功回调
   * @param {Function} params.onError - 错误回调
   * @param {Object} params.socketClient - socket客户端实例
   * @param {Object} params.message - ant-design-vue的message对象
   * @returns {Promise<boolean>} 是否保存成功
   */
  async manualSaveJsonData({
    fromPage,
    jsonStr,
    routeName,
    instanceId,
    inOptType,
    currentLogId,
    onSuccess,
    onError,
    socketClient,
    message,
    customName,
  }) {
    if (!jsonStr || jsonStr.trim() === "") {
      console.log("JSON数据为空，跳过保存");
      return { success: false, logId: currentLogId || null };
    }

    try {
      const compressed = compressJsonString(jsonStr);
      const tmpStr = md5(compressed);
      const tagName = customName || routeName || "text";

      // 已有 logId → 在现有日志上追加版本
      if (currentLogId) {
        const existing = await socketClient.invoke(
          "controller/system/getLogById",
          { id: currentLogId }
        );
        if (existing) {
          console.log("JSON数据已存在，existing:", existing);
          await socketClient.invoke("controller/system/updateLogParent", {
            id: existing.id,
            parent_page: customName || routeName,
          });

          const versionResult = await socketClient.invoke(
            "controller/system/createVersionForLog",
            {
              fromPage: fromPage || "2",
              logId: currentLogId,
              type: "JSON",
              content: compressed,
              md5: tmpStr,
              optType: inOptType || "2",
            }
          );
          return { success: true, logId: currentLogId };
        } else {
          console.log("JSON数据不存在，创建新日志");
          const result = await socketClient.invoke(
            "controller/system/addLogAndVersion",
            {
              type: "JSON",
              opt_type: inOptType || "2",
              tag: instanceId || "json_default",
              parent_page: tagName,
              content: compressed,
              md5: tmpStr,
              crt_time: AutoSaveManager.getBeijingTime(),
              upd_time: AutoSaveManager.getBeijingTime(),
              optType: inOptType || "2",
            }
          );
          if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
          return { success: true, logId: result.logId };
        }
      }

      // 无 logId → MD5 去重检查 + 创建新日志
      const existing = await socketClient.invoke(
        "controller/system/getLogByMd5",
        { key: tmpStr, tag: instanceId }
      );
      if (existing) {
        console.log("JSON数据已存在，existing:", existing);
        if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
        return { success: true, logId: existing.id || null };
      }

      const result = await socketClient.invoke(
        "controller/system/addLogAndVersion",
        {
          type: "JSON",
          opt_type: inOptType || "2",
          tag: instanceId || "json_default",
          parent_page: tagName,
          content: compressed,
          md5: tmpStr,
          crt_time: AutoSaveManager.getBeijingTime(),
          upd_time: AutoSaveManager.getBeijingTime(),
          optType: inOptType || "2",
        }
      );

      if (onSuccess) onSuccess(AutoSaveManager.getBeijingTime());
      console.log("JSON手动保存成功, logId:", result.logId);
      return { success: true, logId: result.logId };
    } catch (error) {
      // 优化错误处理：对Socket.IO超时错误使用调试级别日志
      if (error.message && error.message.includes("Socket.IO 请求超时")) {
        console.debug("JSON数据保存暂时超时，可能是后端服务问题");
      } else {
        console.error("JSON数据手动保存失败:", error);
      }

      if (onError) {
        onError(error);
      } else if (message) {
        ElMessage.error(
          "Manual save failed: " + (error.message || "Unknown error")
        );
      }
      return { success: false, logId: currentLogId || null };
    }
  },

  /**
   * 创建自动保存定时器
   * @param {number} interval - 保存间隔（毫秒）
   * @param {Function} saveCallback - 保存回调函数
   * @returns {number|null} 定时器ID
   */
  createAutoSaveTimer(interval, saveCallback) {
    if (interval <= 0) {
      return null;
    }

    // console.log("自动保存定时器已启动，间隔:", interval / 1000, "秒");
    return setInterval(() => {
      saveCallback();
    }, interval);
  },

  /**
   * 清除自动保存定时器
   * @param {number|null} timerId - 定时器ID
   */
  clearAutoSaveTimer(timerId) {
    if (timerId) {
      clearInterval(timerId);
      // console.log("自动保存定时器已停止");
    }
  },
};

/**
 * 状态持久化管理器
 */
export const StatePersistenceManager = {
  /**
   * 保存当前状态到store
   * @param {Object} params - 保存参数
   * @param {string} params.stateKey - 状态键
   * @param {string} params.jsonStr1 - 第一个JSON字符串
   * @param {string} params.jsonStr2 - 第二个JSON字符串
   * @param {boolean} params.showRightBox - 是否显示右侧编辑器
   * @param {boolean} params.showCodemirrorConf - 是否显示CodeMirror配置面板
   * @param {Object} userStore - 用户store实例
   */
  saveStateToStore({
    stateKey,
    jsonStr1,
    jsonStr2,
    showRightBox,
    showCodemirrorConf,
    userStore,
  }) {
    userStore.setInstanceState(stateKey, {
      jsonStr1,
      jsonStr2,
      showRightBox,
      showCodemirrorConf,
    });
  },

  /**
   * 从store恢复状态
   * @param {string} stateKey - 状态键
   * @param {Object} userStore - 用户store实例
   * @returns {Object|null} 恢复的状态对象
   */
  restoreStateFromStore(stateKey, userStore) {
    return userStore.getInstanceState(stateKey);
  },

  /**
   * 重置编辑器状态
   * @param {Function} setJsonStr1 - 设置第一个JSON字符串的函数
   * @param {Function} setJsonStr2 - 设置第二个JSON字符串的函数
   * @param {Function} setShowRightBox - 设置是否显示右侧编辑器的函数
   * @param {Function} setShowCodemirrorConf - 设置是否显示CodeMirror配置的函数
   */
  resetEditorState(
    setJsonStr1,
    setJsonStr2,
    setShowRightBox,
    setShowCodemirrorConf
  ) {
    setJsonStr1("");
    setJsonStr2("");
    setShowRightBox(false);
    setShowCodemirrorConf(false);
  },

  /**
   * 应用恢复的状态
   * @param {Object} state - 要应用的状态
   * @param {Function} setJsonStr1 - 设置第一个JSON字符串的函数
   * @param {Function} setJsonStr2 - 设置第二个JSON字符串的函数
   * @param {Function} setShowRightBox - 设置是否显示右侧编辑器的函数
   * @param {Function} setShowCodemirrorConf - 设置是否显示CodeMirror配置的函数
   */
  applyRestoredState(
    state,
    setJsonStr1,
    setJsonStr2,
    setShowRightBox,
    setShowCodemirrorConf
  ) {
    setJsonStr1(state.jsonStr1 || "");
    setJsonStr2(state.jsonStr2 || "");
    setShowRightBox(state.showRightBox || false);
    setShowCodemirrorConf(state.showCodemirrorConf || false);
  },
};
