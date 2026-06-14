<template>
  <div class="page-header" :class="{ 'is-pinned': isPinned }">
    <el-row justify="space-between" align="middle">
      <el-col :span="12">
        <div class="header-left">
          <h3 v-if="!showDiffView">{{ $t("codeEditor.title") }}</h3>
          <h3 v-if="showDiffView">{{ $t("codeEditor.diffTitle") }}</h3>
          <FormatSelector
            :model-value="selectedFormat"
            @update:model-value="handleFormatChange"
            @change="handleFormatChange"
          />
        </div>
      </el-col>
      <el-col :span="12" class="btn-header-right">
        <el-tooltip
          v-if="showPreviewButton"
          :content="
            showPreview
              ? $t('codeEditor.hidePreview')
              : $t('codeEditor.showPreview')
          "
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            :type="showPreview ? 'primary' : ''"
            size="small"
            @click="$emit('toggle-preview')"
          >
            <template #icon
              ><EyeOutlined v-if="!showPreview" /><EyeInvisibleOutlined v-else
            /></template>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="isSaved ? $t('codeEditor.saved') : $t('codeEditor.unsaved')"
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            :type="isSaved ? '' : 'primary'"
            size="small"
            :loading="isSaving"
            @click="$emit('save')"
          >
            <template #icon><SaveOutlined /></template>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="$t('codeEditor.diffBtn')"
          effect="light"
          placement="top"
          :disabled="!showTooltips"
        >
          <el-button
            :type="showDiffView ? '' : 'primary'"
            size="small"
            @click="$emit('toggle-diff')"
          >
            <template #icon><DiffOutlined /></template>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="$t('codeEditor.showConfig')"
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            size="small"
            :type="showConfig ? '' : 'primary'"
            @click="$emit('toggle-config')"
          >
            <template #icon><EllipsisOutlined /></template>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="
            isPinned ? $t('codeEditor.unpinBtn') : $t('codeEditor.pinBtn')
          "
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            :type="isPinned ? '' : 'primary'"
            size="small"
            @click="$emit('toggle-pin')"
          >
            <template #icon
              ><pushpin-outlined :rotate="isPinned ? 135 : 0"
            /></template>
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import FormatSelector from "./format-selector.vue";
import {
  SaveOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DiffOutlined,
} from "@ant-design/icons-vue";

const props = defineProps({
  isPinned: {
    type: Boolean,
    default: false,
  },
  isSaved: {
    type: Boolean,
    default: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  selectedFormat: {
    type: String,
    default: "text",
  },
  showPreview: {
    type: Boolean,
    default: false,
  },
  showConfig: {
    type: Boolean,
    default: false,
  },
  showDiffView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "save",
  "toggle-pin",
  "format-change",
  "toggle-preview",
  "toggle-config",
  "toggle-diff",
]);

// 计算是否显示预览按钮（仅 Markdown 格式）
const showPreviewButton = computed(() => props.selectedFormat === "md");

const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.$state.showTooltipsFlag);

// 处理格式变化
const handleFormatChange = (format) => {
  emit("format-change", format);
};
</script>

<style lang="less" scoped>
.page-header {
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
  z-index: 10;

  &.is-pinned {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .config-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.btn-header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2px;

  button {
    margin-left: 0px;
    padding: 5px 8px;
    border-radius: 8px;
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

// 深色模式适配
[data-theme="dark"] {
  .page-header {
    background-color: var(--el-bg-color);
    border-bottom-color: var(--el-border-color-lighter);

    &.is-pinned {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .header-left {
      h3 {
        color: var(--el-text-color-primary);
      }
    }

    .config-section {
      border-top-color: var(--el-border-color-lighter);
    }
  }

  .btn-header-right {
    button {
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      &:active {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
