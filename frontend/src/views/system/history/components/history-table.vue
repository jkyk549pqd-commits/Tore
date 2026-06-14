<!--
  * 历史记录表格组件
  *
-->
<template>
  <el-table
    ref="tableRef"
    :data="data"
    border
    stripe
    size="small"
    :loading="loading"
    row-key="id"
    :height="tableHeight"
    @selection-change="handleSelectionChange"
    style="width: 100%"
    table-layout="fixed"
  >
    <el-table-column type="selection" width="65" min-width="40" />

    <el-table-column
      v-for="column in displayColumns.filter((col) => col.showFlag !== false)"
      :key="column.columnKey || column.key"
      :prop="column.dataIndex"
      :label="$t(column.title)"
      :width="column.width"
      :min-width="column.minWidth"
      :align="column.align || 'left'"
      :fixed="column.fixed"
    >
      <template #default="{ row, column: col }">
        <template v-if="col.property === 'type'">
          <el-tag type="primary" size="small">{{ row.type }}</el-tag>
        </template>

        <template v-else-if="col.property === 'optType'">
          <el-tag type="success" size="small">{{
            getOptTypeText(row.optType)
          }}</el-tag>
        </template>

        <template v-else-if="col.property === 'tag'">
          <el-tag v-if="row.tag" type="warning" size="small">{{
            row.tag
          }}</el-tag>
          <span v-else>-</span>
        </template>

        <template v-else-if="col.property === 'parentPage'">
          <span v-if="row.parentPage">{{ row.parentPage }}</span>
          <span v-else>-</span>
        </template>

        <template v-else-if="col.property === 'content'">
          <el-tooltip
            placement="top"
            effect="light"
            popper-class="custom-tooltip"
          >
            <template #content>
              <div class="tooltip-content">{{ row.content }}</div>
            </template>
            <span class="content-text">{{ row.content }}</span>
          </el-tooltip>
        </template>

        <template v-else-if="col.property === 'crtTime'">
          <span v-if="row.crtTime">{{ formatDate(row.crtTime) }}</span>
          <span v-else>-</span>
        </template>

        <template v-else-if="col.property === 'updTime'">
          <span v-if="row.updTime">{{ formatDate(row.updTime) }}</span>
          <span v-else>-</span>
        </template>

        <template v-else-if="col.property === 'operate'">
          <div class="smart-table-operate">
            <el-tooltip
              effect="light"
              :content="$t('history.btn.view')"
              placement="top"
              :disabled="!showTooltips"
            >
              <el-button
                link
                type="success"
                size="small"
                @click="handleView(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              effect="light"
              :content="$t('history.btn.copy')"
              placement="top"
              :disabled="!showTooltips"
            >
              <el-button
                type="success"
                link
                size="small"
                @click="handleCopy(row)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              effect="light"
              :content="$t('version.btn.versions')"
              placement="top"
              :disabled="!showTooltips"
            >
              <el-button
                type="primary"
                link
                size="small"
                @click="handleVersions(row)"
              >
                <el-icon><Clock /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              effect="light"
              :content="$t('history.btn.delete')"
              placement="top"
              :disabled="!showTooltips"
            >
              <el-button
                type="success"
                link
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>

        <template v-else>
          <span>{{ row[col.property] }}</span>
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { View, Delete, CopyDocument, Clock } from "@element-plus/icons-vue";
import { formatDate } from "../use-history.js";
import { useAppConfigStore } from "/@/store/modules/system/app-config";

const { t } = useI18n();

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  tableHeight: {
    type: String,
    default: "calc(100vh - 300px)",
  },
});

const emit = defineEmits(["selection-change", "view", "delete", "versions"]);

const tableRef = ref(null);

// 显示的列（与 props.columns 保持同步）
const displayColumns = ref([...props.columns]);
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 监听 columns 变化
import { watch } from "vue";
watch(
  () => props.columns,
  (newColumns) => {
    displayColumns.value = [...newColumns];
  },
  { deep: true }
);

// 处理选择变化
const handleSelectionChange = (selection) => {
  emit("selection-change", selection);
};

// 处理查看
const handleView = (row) => {
  emit("view", row);
};

// 处理删除
const handleDelete = (row) => {
  emit("delete", row);
};

// 处理版本
const handleVersions = (row) => {
  emit("versions", row);
};

// 处理复制
const handleCopy = (row) => {
  const textToCopy = row.content || JSON.stringify(row);
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      ElMessage.success(t("json.editor.copySuccess"));
    })
    .catch(() => {
      ElMessage.error(t("json.editor.copyFailed"));
    });
};

// 获取操作类型的国际化文本
const getOptTypeText = (optType) => {
  switch (optType) {
    case "1":
      return t("history.optType.autoAdd");
    case "2":
      return t("history.optType.manualAdd");
    case "3":
      return t("history.optType.update");
    default:
      return optType;
  }
};

// 暴露 tableRef 供父组件使用
defineExpose({
  tableRef,
});
</script>

<style lang="less" scoped>
.tooltip-content {
  max-width: 400px;
  word-break: break-all;
}

.content-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smart-table-operate {
  display: flex;
  gap: 1px; // 增加间距以适应图标按钮
  justify-content: center; // 水平居中对齐
  align-items: center; // 垂直居中对齐

  // 纯图标按钮增加点击区域
  :deep(.el-button) {
    padding: 1px 1px;
  }
}
</style>
