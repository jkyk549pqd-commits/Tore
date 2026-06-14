"use strict";

/**
 * 后端工具函数集合
 * 提供常用的时间、字符串、数据验证等工具函数
 */

/**
 * 获取北京时间（东八区）
 * @returns {string} 格式化的北京时间字符串，格式：YYYY-MM-DD HH:mm:ss
 */
function getBeijingTime() {
  const date = new Date();
  // 获取UTC时间戳并加上8小时（东八区）
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (3600000 * 8));
  
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, "0");
  const day = String(beijingTime.getDate()).padStart(2, "0");
  const hours = String(beijingTime.getHours()).padStart(2, "0");
  const minutes = String(beijingTime.getMinutes()).padStart(2, "0");
  const seconds = String(beijingTime.getSeconds()).padStart(2, "0");
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取当前时间的ISO格式字符串
 * @returns {string} ISO格式的时间字符串
 */
function getISOTime() {
  return new Date().toISOString();
}

/**
 * 获取时间戳（毫秒）
 * @returns {number} 当前时间戳
 */
function getTimestamp() {
  return Date.now();
}

/**
 * 格式化时间戳为指定格式
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 时间格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
function formatTimestamp(timestamp, format = "YYYY-MM-DD HH:mm:ss") {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * 判断是否为空值（null、undefined、空字符串、空数组、空对象）
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为空
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === "string") {
    return value.trim() === "";
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 对象属性排序
 * @param {Object} obj - 要排序的对象
 * @returns {Object} 排序后的新对象
 */
function sortObjectKeys(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }
  
  const sortedObj = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sortedObj[key] = sortObjectKeys(obj[key]);
    });
  
  return sortedObj;
}

/**
 * 安全的JSON解析
 * @param {string} jsonString - JSON字符串
 * @param {*} defaultValue - 解析失败时的默认值
 * @returns {*} 解析后的对象或默认值
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise对象
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * @param {Function} fn - 要执行的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delayMs - 重试间隔（毫秒）
 * @returns {Promise} Promise对象
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  getBeijingTime,
  getISOTime,
  getTimestamp,
  formatTimestamp,
  deepClone,
  isEmpty,
  generateId,
  sortObjectKeys,
  safeJsonParse,
  delay,
  retry,
};