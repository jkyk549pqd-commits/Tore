import { ref, computed } from "vue";
import { logVersionApi } from "/@/api/system/log-version-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";

/**
 * 版本时间线 Composable
 * 管理版本列表状态、加载、选择对比、恢复等逻辑
 */
export function useVersionTimeline() {
  const { t } = useI18n();

  const versions = ref([]);
  const loading = ref(false);
  const currentLogId = ref(null);
  const pagination = ref({ pageNo: 1, pageSize: 20, total: 0 });
  const selectedForCompare = ref([]);

  // 是否可以开始对比（选中了2个版本）
  const canCompare = computed(() => selectedForCompare.value.length === 2);

  /**
   * 加载版本列表
   */
  async function loadVersions(logId, pageNo = 1) {
    if (!logId) return;
    loading.value = true;
    currentLogId.value = logId;
    try {
      const result = await logVersionApi.getLogVersions({
        logId,
        pageNo,
        pageSize: pagination.value.pageSize,
      });
      versions.value = result.list || [];
      pagination.value.total = result.total || 0;
      pagination.value.pageNo = pageNo;
    } catch (error) {
      console.error("加载版本列表失败:", error);
      versions.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 删除版本
   * @param {number} verLogId - 版本日志ID
   * @param {Object} socketClient - socket客户端
   * @returns {Promise<boolean>} 删除是否成功
   */
  async function deleleVersion(verLogId, socketClient) {
    if (!verLogId) return false;
    try {
      const delResult = await socketClient.invoke(
        "controller/system/deleteLogVersionsByVerLogId",
        { verLogId }
      );

      // 从本地数组中移除删除的版本，避免重新加载导致的闪烁
      const idx = versions.value.findIndex((v) => v.id === verLogId);
      if (idx > -1) {
        versions.value.splice(idx, 1);
        pagination.value.total = Math.max(0, pagination.value.total - 1);

        // 如果删除后当前页没有数据且不是第一页，则重新加载前一页
        if (versions.value.length === 0 && pagination.value.pageNo > 1) {
          await loadVersions(currentLogId.value, pagination.value.pageNo - 1);
        }
      }
      return true;
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error(t("version.deleteFailed"));
      return false;
    }
  }

  /**
   * 切换选择版本用于对比
   */
  function toggleSelectForCompare(version) {
    const idx = selectedForCompare.value.findIndex((v) => v.id === version.id);
    if (idx > -1) {
      selectedForCompare.value.splice(idx, 1);
    } else if (selectedForCompare.value.length < 2) {
      selectedForCompare.value.push(version);
    } else {
      // 已选2个，替换最早选的
      selectedForCompare.value.shift();
      selectedForCompare.value.push(version);
    }
  }

  /**
   * 清除对比选择
   */
  function clearSelection() {
    selectedForCompare.value = [];
  }

  /**
   * 获取排序后的对比数据（旧版本在左，新版本在右）
   */
  function getCompareData() {
    if (!canCompare.value) return null;
    const sorted = [...selectedForCompare.value].sort(
      (a, b) => a.version_no - b.version_no
    );
    return {
      oldVersion: sorted[0],
      newVersion: sorted[1],
    };
  }

  /**
   * 恢复版本（创建新日志记录）
   */
  async function restoreVersion(version, socketClient) {
    try {
      await ElMessageBox.confirm(t("version.restoreConfirm"), {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      });
    } catch {
      return false;
    }

    try {
      await socketClient.invoke("controller/system/addLogAndVersion", {
        type: "JSON",
        opt_type: "MANUAL_SAVE",
        tag: "restore",
        parent: "version_restore",
        content: version.content,
        md5: version.md5,
        crt_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        upd_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        optType: "MANUAL",
        message: `Restored from version ${version.version_no}`,
      });
      ElMessage.success(t("version.restoreSuccess"));
      return true;
    } catch (error) {
      console.error("恢复版本失败:", error);
      return false;
    }
  }

  /**
   * 设置Active版本
   * @param {Object} version - 版本对象
   * @param {number} logId - 日志ID
   * @param {Object} emit - emit函数
   */
  async function setActiveVersion(version, logId, emit) {
    try {
      await logVersionApi.setActiveVersion(logId, version.id);
      // ElMessage.success(t("version.setActiveSuccess"));
      // 重新加载版本列表
      await loadVersions(logId, pagination.value.pageNo);
      // 通知父组件刷新列表
      emit("activeChanged", version);
      return true;
    } catch (error) {
      console.error("设置Active版本失败:", error);
      ElMessage.error(t("version.setActiveFailed"));
      return false;
    }
  }

  /**
   * 判断版本是否被选中用于对比
   */
  function isSelectedForCompare(version) {
    return selectedForCompare.value.some((v) => v.id === version.id);
  }

  /**
   * 更新版本名称
   * @param {number} versionId - 版本ID
   * @param {string} name - 新名称
   * @returns {Promise<boolean>} 更新是否成功
   */
  async function updateVersionName(versionId, name) {
    try {
      await logVersionApi.updateVersionName(versionId, name);
      return true;
    } catch (error) {
      console.error("更新版本名称失败:", error);
      throw error;
    }
  }

  return {
    versions,
    loading,
    currentLogId,
    pagination,
    selectedForCompare,
    canCompare,
    loadVersions,
    toggleSelectForCompare,
    clearSelection,
    getCompareData,
    deleleVersion,
    restoreVersion,
    setActiveVersion,
    isSelectedForCompare,
    updateVersionName,
  };
}
