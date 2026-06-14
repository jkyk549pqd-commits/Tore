<!--
  * 查询表单组件
  *
-->
<template>
  <el-row class="query-section" :gutter="12">
    <el-col :span="3">
      <el-input
        v-model="localForm.type"
        :placeholder="$t('history.query.type')"
        size="small"
        style="width: 90%"
        clearable
      />
    </el-col>
    <el-col :span="3">
      <el-select
        v-model="localForm.optType"
        :placeholder="$t('history.query.optType')"
        size="small"
        style="width: 90%"
        clearable
      >
        <el-option
          v-for="item in optTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-col>
    <el-col :span="3">
      <el-input
        v-model="localForm.parentPage"
        :placeholder="$t('history.query.parent')"
        size="small"
        style="width: 90%"
        clearable
      />
    </el-col>
    <el-col :span="3">
      <el-input
        v-model="localForm.tag"
        :placeholder="$t('history.query.tag')"
        size="small"
        style="width: 90%"
        clearable
      />
    </el-col>
    <el-col :span="3">
      <el-input
        v-model="localForm.keyword"
        :placeholder="$t('history.query.keyword')"
        size="small"
        style="width: 90%"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-col>
    <el-col :span="6" class="btn-header-right">
      <el-button
        class="query-btn"
        type="primary"
        size="small"
        @click="handleSearch"
      >
        <el-icon><Search /></el-icon>
        <span class="btn-text">{{ $t("history.btn.query") }}</span>
      </el-button>
      <el-button class="reset-btn" size="small" @click="handleReset">
        <el-icon><Refresh /></el-icon>
        <span class="btn-text">{{ $t("history.btn.reset") }}</span>
      </el-button>
      <el-button
        class="batch-delete-btn"
        type="danger"
        size="small"
        @click="handleBatchDelete"
        :disabled="!hasSelected"
      >
        <el-icon><Delete /></el-icon>
        <span class="btn-text">{{ $t("history.btn.batchDelete") }}</span>
      </el-button>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Search, Refresh, Delete } from "@element-plus/icons-vue";

const { t } = useI18n();

// 操作类型选项
const optTypeOptions = computed(() => [
  {
    value: "1",
    label: t("history.optType.autoAdd"),
  },
  {
    value: "2",
    label: t("history.optType.manualAdd"),
  },
  {
    value: "3",
    label: t("history.optType.update"),
  },
]);

const props = defineProps({
  model: {
    type: Object,
    required: true,
    default: () => ({
      type: "",
      optType: "",
      parent: "",
      tag: "",
    }),
  },
  hasSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["search", "reset", "batch-delete"]);

// 本地表单数据
const localForm = computed({
  get: () => props.model,
  set: (value) => emit("update:model", value),
});

// 处理查询
const handleSearch = () => {
  emit("search");
};

// 处理重置
const handleReset = () => {
  emit("reset");
};

// 处理批量删除
const handleBatchDelete = () => {
  emit("batch-delete");
};
</script>

<style lang="less" scoped>
.query-section {
  width: 100%;

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
.btn-header-right {
  text-align: right;

  .query-btn,
  .reset-btn,
  .batch-delete-btn {
    width: 20%;
    border-radius: 16px;

    .el-icon {
      margin-right: 1px;
    }
  }

  .batch-delete-btn {
    width: 21%;
  }
}

// 响应式按钮布局
@media (max-width: 2080px) {
  .btn-header-right {
    .batch-delete-btn {
      width: 40px !important;
      min-width: 40px;
      padding: 8px;
      margin-left: 8px;

      // 隐藏按钮文字，仅显示图标
      .btn-text {
        display: none !important;
      }

      // 移除图标右边距，居中显示图标
      .el-icon {
        margin-right: 0;
        font-size: 16px;
      }
    }
  }
}

// 响应式按钮布局
@media (max-width: 1480px) {
  .btn-header-right {
    .query-btn,
    .reset-btn {
      width: 40px !important;
      min-width: 40px;
      padding: 8px;
      margin-left: 8px;

      // 隐藏按钮文字，仅显示图标
      .btn-text {
        display: none !important;
      }

      // 移除图标右边距，居中显示图标
      .el-icon {
        margin-right: 0;
        font-size: 16px;
      }
    }
  }
}
</style>
