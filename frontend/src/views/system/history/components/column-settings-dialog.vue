<!--
  * 列设置弹窗组件
  *
-->
<template>
  <el-dialog
    class="column-settings-dialog"
    draggable
    v-model="dialogVisible"
    :title="$t('history.dialog.title')"
    width="750px"
    style="border-radius: 16px"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin: 20px 0px; border-radius: 8px"
    >
      <template #default>
        {{ $t("history.dialog.alert") }}
      </template>
    </el-alert>

    <el-table
      ref="tableRef"
      :data="localColumns"
      row-key="columnKey"
      :row-class-name="getRowClassName"
      border
      size="small"
      style="width: 100%; margin-bottom: 20px"
    >
      <el-table-column type="selection" width="80" />
      <el-table-column
        :label="$t('history.dialog.column')"
        prop="title"
        align="center"
        width="140"
      >
        <template #default="{ row }">
          <div style="display: flex; align-items: center">
            <el-icon v-if="!row.fixed" style="margin-right: 8px; cursor: move">
              <DragOutlined />
            </el-icon>
            <el-icon v-else style="margin-right: 8px">
              <pushpin-outlined />
            </el-icon>
            <span>{{ $t(row.title) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('history.dialog.show')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-switch
            v-model="row.showFlag"
            :active-text="$t('history.dialog.yes')"
            :inactive-text="$t('history.dialog.no')"
            inline-prompt
            size="small"
            :disabled="!!row.fixed"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('history.dialog.width')"
        prop="width"
        width="170"
        align="center"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.width"
            :min="50"
            :max="500"
            size="small"
            style="width: 90px"
          />
          <span style="margin-left: 5px">{{
            $t("history.dialog.widthUnit")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('history.dialog.operate')"
        width="120"
        align="center"
      >
        <template #default="{ row, $index }">
          <div
            v-if="!row.fixed"
            style="display: flex; justify-content: flex-end"
          >
            <el-button
              v-show="$index > 0"
              link
              type="primary"
              size="small"
              @click="moveColumn($index, -1)"
            >
              {{ $t("history.dialog.moveUp") }}
            </el-button>
            <el-button
              v-show="$index !== localColumns.length - 1"
              link
              type="primary"
              size="small"
              @click="moveColumn($index, 1)"
            >
              {{ $t("history.dialog.moveDown") }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="btn-group">
        <el-button @click="handleClose" style="border-radius: 16px">{{
          $t("history.dialog.cancel")
        }}</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSave"
          style="border-radius: 16px"
        >
          {{ $t("history.dialog.save") }}
        </el-button>
        <el-button
          type="danger"
          :loading="loading"
          @click="handleReset"
          style="border-radius: 16px"
        >
          {{ $t("history.dialog.reset") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { DragOutlined, PushpinOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "save", "reset"]);

const tableRef = ref(null);

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

// 本地列数据副本
const localColumns = ref([]);

// 监听 props.columns 变化，更新本地数据
watch(
  () => props.columns,
  (newColumns) => {
    localColumns.value = newColumns.map((col) => ({
      ...col,
      showFlag: col.showFlag !== false,
    }));
  },
  { immediate: true, deep: true }
);

// 获取表格行样式
const getRowClassName = ({ row }) => {
  return row.fixed ? "fixed-row" : "draggable-row";
};

// 移动列位置
const moveColumn = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < localColumns.value.length) {
    const temp = localColumns.value[index];
    localColumns.value[index] = localColumns.value[newIndex];
    localColumns.value[newIndex] = temp;
  }
};

// 处理保存
const handleSave = () => {
  emit("save", localColumns.value);
};

// 处理重置
const handleReset = () => {
  emit("reset");
};

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style lang="less" scoped>
.fixed-row {
  background-color: #f5f5f5;
}
.btn-group {
  .el-button {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
.draggable-row {
  cursor: move;
}
</style>
