/**
 * 最近记录集成的 Composable
 * 在 JSON 编辑器中集成最近记录功能
 */
import { localRead, localSave } from "/@/utils/local-util";

const RECENT_RECORDS_KEY = "json_recent_records";
const MAX_RECENT_RECORDS = 10;

export function useRecentRecordsIntegration() {
  /**
   * 添加记录到最近使用记录
   * @param {Object} record - 记录对象
   * @param {string} record.name - 文件名
   * @param {string} record.content - JSON 内容
   * @param {string} record.original - 原始内容
   */
  function addToRecentRecords(record) {
    try {
      // 读取现有记录
      const existingData = localRead(RECENT_RECORDS_KEY);
      let records = existingData ? JSON.parse(existingData) : [];

      const newRecord = {
        id: Date.now(),
        name: record.name || "未命名文件",
        content: record.content || "",
        timestamp: Date.now(),
        original: record.original || "",
      };

      // 检查是否已存在相同名称的记录，如果存在则更新
      const existingIndex = records.findIndex((r) => r.name === newRecord.name);
      if (existingIndex !== -1) {
        records[existingIndex] = newRecord;
      } else {
        records = [newRecord, ...records].slice(0, MAX_RECENT_RECORDS);
      }

      // 保存回本地存储
      localSave(RECENT_RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("保存最近记录失败:", error);
    }
  }

  /**
   * 监听文件保存事件并添加到最近记录
   * @param {string} content - JSON 内容
   * @param {string} filename - 文件名（可选）
   */
  function handleFileSave(content, filename) {
    if (!content || content.trim() === "") {
      return;
    }

    try {
      // 验证 JSON 格式
      // JSON.parse(content);

      addToRecentRecords({
        name: filename || generateFilename(),
        content: content,
        original: content,
      });
    } catch (error) {
      // 不是有效的 JSON，不添加到记录
      console.warn("跳过无效 JSON:", error);
    }
  }

  /**
   * 生成默认文件名
   * @returns {string} 文件名
   */
  function generateFilename() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `json_${year}${month}${day}_${hour}${minute}${second}.json`;
  }

  return {
    addToRecentRecords,
    handleFileSave,
    generateFilename,
  };
}
