<!--
  * 系统日志列表
  *
-->
<template>
  <div class="history-container">
    <!-- 列设置弹窗 -->
    <ColumnSettingsDialog
      v-model:visible="columnSettingsVisible"
      :columns="columnSettingsData"
      :loading="saveLoading"
      @save="saveColumnSettings"
      @reset="resetColumnSettings"
    />

    <div class="page-header">
      <!-- 查询区域 -->
      <QueryForm
        :model="queryForm"
        :has-selected="hasSelected"
        @search="query"
        @reset="resetQuery"
        @batch-delete="batchDelete"
      />
    </div>

    <!-- 表格区域 -->
    <div class="page-content">
      <!-- 表格操作栏 -->
      <div
        class="table-toolbar"
        style="
          margin-bottom: 12px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        "
      >
        <el-tooltip
          :content="$t('history.btn.columnSettings')"
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            type="primary"
            size="small"
            @click="showTableColumnSettings"
          >
            <el-icon><EllipsisOutlined /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 主表格 -->
      <HistoryTable
        ref="historyTableRef"
        :columns="displayColumns"
        :data="tableData"
        :loading="tableLoading"
        @selection-change="handleSelectionChange"
        @view="openDrawer"
        @delete="singleDelete"
        @versions="openVersionTimeline"
      />

      <!-- 分页 -->
      <TablePagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @change="handleTableChange"
      />
    </div>

    <LogOperateModal ref="logOperateModal" @reloadList="query" />

    <!-- 版本时间线抽屉 -->
    <VersionTimeline
      v-model:visible="versionTimelineVisible"
      :log-record="currentVersionLog"
      @compare="openVersionCompare"
      @restored="query"
      @activeChanged="handleActiveChanged"
    />

    <!-- 版本对比弹窗 -->
    <VersionCompareModal
      v-model:visible="versionCompareVisible"
      :old-version="compareOldVersion"
      :new-version="compareNewVersion"
      :log-type="currentVersionLog?.type"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { EllipsisOutlined } from "@ant-design/icons-vue";
import LogOperateModal from "./components/log-operate-modal.vue";
import QueryForm from "./components/query-form.vue";
import HistoryTable from "./components/history-table.vue";
import TablePagination from "./components/table-pagination.vue";
import ColumnSettingsDialog from "./components/column-settings-dialog.vue";
import VersionTimeline from "./components/version-timeline.vue";
import VersionCompareModal from "./components/version-compare-modal.vue";
import { useHistory, columns, formatDate } from "./use-history.js";
import { TABLE_ID_CONST } from "/@/constants/support/table-id-const";
import { tableColumnConfigApi } from "/@/api/system/table-column-config-api";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

// 国际化
const { t } = useI18n();

// 使用 composable 获取所有状态和方法
const {
  queryForm,
  tableLoading,
  tableData,
  pagination,
  selectedRowKeys,
  hasSelected,
  logOperateModal,
  query,
  resetQuery,
  handleTableChange,
  onSelectChange,
  singleDelete,
  batchDelete,
  openDrawer,
} = useHistory();

const historyTableRef = ref(null);
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// Element Plus 表格选择变化处理
const handleSelectionChange = (selection) => {
  const selectedKeys = selection.map((item) => item.id);
  onSelectChange(selectedKeys, selection);
};

// ==================== 版本时间线管理 ====================

const versionTimelineVisible = ref(false);
const currentVersionLog = ref(null);
const versionCompareVisible = ref(false);
const compareOldVersion = ref(null);
const compareNewVersion = ref(null);

// 打开版本时间线
function openVersionTimeline(row) {
  currentVersionLog.value = row;
  versionTimelineVisible.value = true;
}

// 打开版本对比
function openVersionCompare({ oldVersion, newVersion }) {
  compareOldVersion.value = oldVersion;
  compareNewVersion.value = newVersion;
  versionCompareVisible.value = true;
}

// 处理Active版本切换事件
function handleActiveChanged(version) {
  // 刷新列表页数据
  query();
  // ElMessage.success(t("version.activeChanged"));
}

// ==================== 表格列配置管理 ====================

// 表格列配置管理
const displayColumns = ref([...columns]);
const tableId = TABLE_ID_CONST.SYSTEM.HISTORY;

// 列设置弹窗相关
const columnSettingsVisible = ref(false);
const columnSettingsData = ref([]);
const saveLoading = ref(false);

// 获取当前用户ID (全局默认配置)
const getCurrentUserId = () => {
  // 根据实际项目调整,如果有用户认证体系,返回具体用户ID
  // 目前返回null表示使用全局默认配置
  return null;
};

// 加载用户表格列配置
async function loadUserTableColumnConfig() {
  try {
    const userId = getCurrentUserId();
    const config = await tableColumnConfigApi.getUserTableColumn({
      tableId,
      userId,
    });
    // console.log("加载到的列配置:", config);
    if (config && config.conf_value) {
      try {
        const userColumns = JSON.parse(config.conf_value);
        // 合并用户配置和原始列定义
        displayColumns.value = mergeColumnsWithOriginal(columns, userColumns);
      } catch (e) {
        console.error("解析列配置失败:", e);
        displayColumns.value = [...columns];
      }
    }
  } catch (error) {
    console.error("加载列配置失败:", error);
    displayColumns.value = [...columns];
  }
}

// 合并列配置函数
function mergeColumnsWithOriginal(originalColumns, userColumns) {
  // 如果用户有自定义配置,按照用户配置的顺序和属性
  if (userColumns && userColumns.length > 0) {
    return userColumns.map((userCol) => {
      const originalCol = originalColumns.find(
        (oc) => oc.columnKey === userCol.columnKey
      );
      // 合并用户配置和原始配置,优先使用用户配置
      return {
        ...(originalCol || {}),
        ...userCol,
        showFlag: userCol.showFlag !== undefined ? userCol.showFlag : true,
      };
    });
  }

  // 如果没有用户配置,返回原始列定义
  return originalColumns.map((col) => ({
    ...col,
    showFlag: col.showFlag !== false,
  }));
}

// 显示列设置弹窗
function showTableColumnSettings() {
  columnSettingsData.value = displayColumns.value.map((col) => ({
    ...col,
    showFlag: col.showFlag !== false,
  }));
  columnSettingsVisible.value = true;
}

// 保存列配置
async function saveColumnSettings(columnsData) {
  try {
    saveLoading.value = true;
    const userId = getCurrentUserId();

    // 构建保存的列配置
    const columnsToSave = columnsData.map((col) => ({
      columnKey: col.columnKey,
      title: col.title,
      dataIndex: col.dataIndex,
      width: col.width,
      align: col.align,
      showFlag: col.showFlag,
      fixed: col.fixed,
    }));
    console.log("准备保存的列配置:", columnsToSave);

    await tableColumnConfigApi.saveUserTableColumn({
      tableId,
      userId,
      columns: columnsToSave,
    });

    // 更新显示的列
    displayColumns.value = mergeColumnsWithOriginal(columns, columnsToSave);
    columnSettingsVisible.value = false;
  } catch (error) {
    console.error("保存列配置失败:", error);
  } finally {
    saveLoading.value = false;
  }
}

// 重置列配置为默认
async function resetColumnSettings() {
  try {
    saveLoading.value = true;
    const userId = getCurrentUserId();

    await tableColumnConfigApi.resetUserTableColumn({
      tableId,
      userId,
    });

    // 重新加载配置
    await loadUserTableColumnConfig();
    columnSettingsVisible.value = false;
  } catch (error) {
    console.error("重置列配置失败:", error);
  } finally {
    saveLoading.value = false;
  }
}

// 组件挂载时加载配置 - 优化：延迟加载，不阻塞首屏渲染
onMounted(() => {
  // 延迟加载配置，不影响首屏渲染
  requestAnimationFrame(() => {
    loadUserTableColumnConfig();
  });
});
</script>

<style lang="less" scoped src="./index.less"></style>
<style lang="less">
.confirm-dialog-with-hover-effects {
  border-radius: 16px;
}
</style>
