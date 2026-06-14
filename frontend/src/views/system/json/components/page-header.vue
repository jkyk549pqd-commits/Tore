<template>
  <div class="page-header" :class="{ 'is-pinned': isPinned }">
    <el-row justify="space-between" align="middle">
      <el-col :span="12">
        <h3 v-if="!showDiffView">{{ $t("json.card.formatTitle") }}</h3>
        <h3 v-if="showDiffView">{{ $t("json.card.diffTitle") }}</h3>
      </el-col>
      <el-col :span="12" class="btn-header-right">
        <el-tooltip
          :content="$t('json.card.saveBtn')"
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
          :content="$t('json.card.diffBtn')"
          effect="light"
          placement="top"
          :disabled="!showTooltips"
        >
          <el-button
            :type="showDiffView ? '' : 'primary'"
            size="small"
            @click="$emit('toggle-diff')"
          >
            <template #icon><diff-outlined /></template>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="$t('json.card.showConf')"
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button
            size="small"
            :type="showConfig ? '' : 'primary'"
            @click="$emit('toggle-config')"
            ><template #icon><EllipsisOutlined /></template
          ></el-button>
        </el-tooltip>
        <el-tooltip
          :content="
            isPinned ? $t('json.card.unpinBtn') : $t('json.card.pinBtn')
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

defineProps({
  showDiffView: {
    type: Boolean,
    default: false,
  },
  showConfig: {
    type: Boolean,
    default: false,
  },
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
});

defineEmits(["toggle-diff", "toggle-config", "toggle-pin", "save"]);

// 从 appConfigStore 获取 tooltip 显示配置
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);
</script>

<style lang="less" scoped>
.page-header {
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
  z-index: 10;

  &.is-pinned {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
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
}
</style>
