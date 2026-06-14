/**
 * 最近记录管理相关的 Composable（多编辑器版本）
 * 处理 JSON、Code、Text 三种编辑器的最近使用记录
 */
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { localRead, localSave, localRemove } from "/@/utils/local-util";
import { ElMessage } from "element-plus";
import { useUserStore } from "/@/store/modules/system/user";

// 各编辑器的存储 key
const STORAGE_KEYS = {
  json: "json_recent_records",
  code: "code_recent_records",
  text: "text_recent_records",
};

const MAX_RECENT_RECORDS = 10;

// 递增计数器用于生成唯一ID
let recordIdCounter = Date.now();

export function useRecentRecords() {
  const router = useRouter();
  const records = ref([]);
  const loading = ref(false);
  const activeFilter = ref("all"); // all | json | code | text

  /**
   * 根据筛选条件过滤后的记录
   */
  const filteredRecords = computed(() => {
    if (activeFilter.value === "all") {
      return records.value;
    }
    return records.value.filter((r) => r.type === activeFilter.value);
  });

  /**
   * 加载所有编辑器的最近记录
   */
  function loadRecentRecords() {
    loading.value = true;
    try {
      const allRecords = [];

      // 加载各类型记录
      Object.entries(STORAGE_KEYS).forEach(([type, key]) => {
        const data = localRead(key);
        if (data) {
          const parsed = JSON.parse(data);
          const typed = parsed.map((r) => ({ ...r, type: r.type || type }));
          allRecords.push(...typed);
        }
      });

      // 按时间戳降序排列
      allRecords.sort((a, b) => b.timestamp - a.timestamp);

      // 限制总数
      records.value = allRecords.slice(0, MAX_RECENT_RECORDS * 3);
    } catch (error) {
      console.error("加载最近记录失败:", error);
      records.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 添加记录
   * @param {Object} record - 记录对象
   * @param {string} record.name - 文件名
   * @param {string} record.content - 内容
   * @param {string} record.type - 编辑器类型 json|code|text
   * @param {string} record.format - 文件格式（如 yaml, python 等）
   */
  function addRecord(record) {
    const type = record.type || "JSON";
    const storageKey = STORAGE_KEYS[type];
    if (!storageKey) return;

    recordIdCounter++;
    const newRecord = {
      id: recordIdCounter,
      name: record.name || "未命名文件",
      content: record.content || "",
      timestamp: Date.now(),
      type,
      format: record.format || "",
    };

    // 读取该类型的现有记录
    let typeRecords = [];
    try {
      const data = localRead(storageKey);
      typeRecords = data ? JSON.parse(data) : [];
    } catch {
      typeRecords = [];
    }

    // 检查是否已存在相同名称的记录
    const existingIndex = typeRecords.findIndex(
      (r) => r.name === newRecord.name
    );
    if (existingIndex !== -1) {
      typeRecords[existingIndex] = newRecord;
    } else {
      typeRecords = [newRecord, ...typeRecords].slice(0, MAX_RECENT_RECORDS);
    }

    // 保存
    localSave(storageKey, JSON.stringify(typeRecords));

    // 刷新全部记录
    loadRecentRecords();
  }

  /**
   * 删除记录
   * @param {number} id - 记录 ID
   */
  function deleteRecord(id) {
    // 找到记录确定类型
    const record = records.value.find((r) => r.id === id);
    if (!record) return;

    const type = record.type || "json";
    const storageKey = STORAGE_KEYS[type];

    try {
      const data = localRead(storageKey);
      let typeRecords = data ? JSON.parse(data) : [];
      typeRecords = typeRecords.filter((r) => r.id !== id);
      localSave(storageKey, JSON.stringify(typeRecords));
    } catch (error) {
      console.error("删除记录失败:", error);
    }

    records.value = records.value.filter((r) => r.id !== id);
    ElMessage.success("删除成功");
  }

  /**
   * 打开记录，根据类型跳转到对应编辑器
   * @param {Object} record - 记录对象
   */
  async function openRecord(record) {
    try {
      const userStore = useUserStore();
      const instanceId = userStore.getNextInstanceId();

      const tempKey = `temp_editor_${instanceId}`;
      localSave(
        tempKey,
        JSON.stringify({
          content: record.content,
          name: record.name,
          format: record.format,
        })
      );

      const type = record.type || "text";
      let path;
      const query = {
        _temp_key: tempKey,
        _instance_: instanceId,
      };

      switch (type) {
        case "code":
          path = "/code-editor";
          if (record.format) query.format = record.format;
          break;
        case "text":
          path = "/text-editor";
          if (record.format) query.format = record.format;
          break;
        default:
          path = "/json";
      }

      // 使用 nextTick 确保 DOM 更新完成后再进行路由跳转
      await new Promise((resolve) => setTimeout(resolve, 0));
      await router.push({ path, query });
    } catch (error) {
      console.error("打开记录失败:", error);
      ElMessage.error("打开记录失败");
    }
  }

  /**
   * 清空所有记录
   */
  function clearRecords() {
    Object.values(STORAGE_KEYS).forEach((key) => localRemove(key));
    records.value = [];
    ElMessage.success("已清空所有记录");
  }

  /**
   * 设置筛选类型
   */
  function setFilter(type) {
    activeFilter.value = type;
  }

  /**
   * 格式化时间显示
   */
  function formatTime(timestamp) {
    const { t, locale } = useI18n();
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return t("time.justNow");
    if (diff < 3600000)
      return t("time.minutesAgo", { minutes: Math.floor(diff / 60000) });
    if (diff < 86400000)
      return t("time.hoursAgo", { hours: Math.floor(diff / 3600000) });
    if (diff < 604800000)
      return t("time.daysAgo", { days: Math.floor(diff / 86400000) });

    return date.toLocaleDateString(
      locale.value === "zh_CN" ? "zh-CN" : "en-US"
    );
  }

  /**
   * 获取记录预览内容
   */
  function getPreview(content) {
    if (!content) return "";
    try {
      const parsed = JSON.parse(content);
      const str = JSON.stringify(parsed, null, 2);
      return str.length > 50 ? str.substring(0, 50) + "..." : str;
    } catch {
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
    }
  }

  /**
   * 获取类型显示标签
   */
  function getTypeLabel(record) {
    if (record.format) return record.format.toUpperCase();
    switch (record.type) {
      case "code":
        return "CODE";
      case "text":
        return "TEXT";
      default:
        return "JSON";
    }
  }

  /**
   * 查看所有历史记录
   */
  function viewAllHistory() {
    router.push("/jsonHis");
  }

  // 组件挂载时加载记录
  onMounted(() => {
    loadRecentRecords();
  });

  return {
    records,
    filteredRecords,
    loading,
    activeFilter,
    loadRecentRecords,
    addRecord,
    deleteRecord,
    openRecord,
    clearRecords,
    setFilter,
    formatTime,
    getPreview,
    getTypeLabel,
    viewAllHistory,
  };
}
