<!--
  * 首页布局设置模块
  * 提供三种首页布局模式选择：简洁、标准、紧凑
-->
<template>
  <a-form
    layout="horizontal"
    :label-col="{ span: 8 }"
    :class="{ 'dark-mode': isDarkMode }"
  >
    <!-- 垂直布局模式开关 -->
    <a-form-item :label="$t('setting.verticalLayoutMode')">
      <a-switch
        v-model:checked="formState.homeVerticalLayout"
        @change="toggleVerticalLayout"
      />
    </a-form-item>

    <a-form-item :label="$t('setting.homeLayoutMode')">
      <a-radio-group
        v-model:value="formState.homeLayoutMode"
        @change="changeHomeLayoutMode"
        button-style="solid"
        class="layout-mode-selector"
      >
        <a-radio-button value="simple">
          {{ $t("setting.homeLayout.simple") }}
        </a-radio-button>
        <a-radio-button value="standard">
          {{ $t("setting.homeLayout.standard") }}
        </a-radio-button>
        <a-radio-button value="compact">
          {{ $t("setting.homeLayout.compact") }}
        </a-radio-button>
      </a-radio-group>
    </a-form-item>

    <!-- 组件显示控制 -->
    <a-form-item :label="$t('setting.componentVisibility')">
      <a-space direction="vertical" style="width: 100%">
        <a-checkbox
          v-model:checked="formState.showBrandSection"
          @change="
            (e) => toggleVisibility('showBrandSection', e.target.checked)
          "
        >
          <span class="component-label">
            {{ $t("setting.component.brandSection") }}
          </span>
          <span class="component-desc">
            ({{ $t("setting.component.brandSectionDesc") }})
          </span>
        </a-checkbox>

        <a-checkbox
          v-model:checked="formState.showEditorHub"
          @change="(e) => toggleVisibility('showEditorHub', e.target.checked)"
        >
          <span class="component-label">
            {{ $t("setting.component.editorHub") }}
          </span>
          <span class="component-desc">
            ({{ $t("setting.component.editorHubDesc") }})
          </span>
        </a-checkbox>

        <a-checkbox
          v-model:checked="formState.showQuickToolbar"
          @change="
            (e) => toggleVisibility('showQuickToolbar', e.target.checked)
          "
        >
          <span class="component-label">
            {{ $t("setting.component.quickToolbar") }}
          </span>
          <span class="component-desc">
            ({{ $t("setting.component.quickToolbarDesc") }})
          </span>
        </a-checkbox>

        <a-checkbox
          v-model:checked="formState.showRecentRecords"
          @change="
            (e) => toggleVisibility('showRecentRecords', e.target.checked)
          "
        >
          <span class="component-label">
            {{ $t("setting.component.recentRecords") }}
          </span>
          <span class="component-desc">
            ({{ $t("setting.component.recentRecordsDesc") }})
          </span>
        </a-checkbox>
      </a-space>
      <div class="component-tip">
        <InfoCircleOutlined />
        {{ $t("setting.component.minOneRequired") }}
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useThemeStore } from "/@/store/modules/theme";
import { ElMessage } from "element-plus";
import { InfoCircleOutlined } from "@ant-design/icons-vue";
import { socketClient } from "/@/utils/socket-client";

const { t } = useI18n();
const appConfigStore = useAppConfigStore();
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDark);

// 表单状态
const formState = reactive({
  homeLayoutMode: appConfigStore.homeLayoutMode || "standard",
  homeVerticalLayout: appConfigStore.homeVerticalLayout || false,
  showBrandSection:
    appConfigStore.homeComponentsVisibility?.showBrandSection ?? true,
  showEditorHub: appConfigStore.homeComponentsVisibility?.showEditorHub ?? true,
  showQuickToolbar:
    appConfigStore.homeComponentsVisibility?.showQuickToolbar ?? true,
  showRecentRecords:
    appConfigStore.homeComponentsVisibility?.showRecentRecords ?? true,
});

/**
 * 切换首页布局模式
 */
async function changeHomeLayoutMode() {
  appConfigStore.updateConfig({
    homeLayoutMode: formState.homeLayoutMode,
  });
  // console.log("首页布局模式已更新:", formState.homeLayoutMode);
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    homeLayoutMode: formState.homeLayoutMode,
  });
}

/**
 * 切换垂直布局模式
 */
function toggleVerticalLayout() {
  appConfigStore.updateConfig({
    homeVerticalLayout: formState.homeVerticalLayout,
  });

  // 延迟检查 localStorage（因为是异步的）
  setTimeout(() => {
    try {
      const configStr = localStorage.getItem("smart_admin_app_config");
      if (configStr) {
        const config = JSON.parse(configStr);
      } else {
        console.log("8. localStorage 中没有配置");
      }
    } catch (e) {
      console.error("读取 localStorage 失败:", e);
    }
  }, 100);
}

/**
 * 切换组件可见性
 * @param {string} componentKey - 组件键名
 * @param {boolean} newValue - 新的可见性值
 */
function toggleVisibility(componentKey, newValue) {
  // 验证：至少保留1个组件开启
  if (!newValue) {
    const activeCount = [
      "showBrandSection",
      "showEditorHub",
      "showQuickToolbar",
      "showRecentRecords",
    ].filter((key) => formState[key] || (key === componentKey && false)).length;

    // 如果关闭后没有组件开启，阻止操作
    if (activeCount < 1) {
      ElMessage.warning(t("setting.component.minOneRequired"));
      // 恢复原状态
      formState[componentKey] = !newValue;
      return;
    }
  }

  // 更新配置
  appConfigStore.updateConfig({
    homeComponentsVisibility: {
      showBrandSection: formState.showBrandSection,
      showEditorHub: formState.showEditorHub,
      showQuickToolbar: formState.showQuickToolbar,
      showRecentRecords: formState.showRecentRecords,
    },
  });
}
</script>

<style lang="less" scoped>
.layout-mode-selector {
  width: 100%;

  :deep(.ant-radio-button-wrapper) {
    flex: 1;
    text-align: center;
  }
}

.layout-mode-description {
  margin-top: 8px;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.5;
}

.component-label {
  font-weight: 500;
  color: #303133;
}

.component-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.component-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;

  .anticon {
    color: #409eff;
    font-size: 14px;
  }
}

.layout-preview-container {
  width: 100%;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.preview-card {
  width: 100%;
  min-height: 200px;
  background: white;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;

  // 简洁模式
  &.preview-simple {
    .preview-editor-hub {
      margin-top: 0;
    }
  }

  // 紧凑模式
  &.preview-compact {
    .preview-brand {
      margin-bottom: 12px;

      .preview-title {
        font-size: 14px;
      }

      .preview-slogan {
        display: none;
      }
    }

    .preview-editor-hub {
      gap: 8px;

      .preview-editor-card {
        padding: 8px;
        font-size: 12px;
      }
    }

    .preview-toolbar,
    .preview-recent {
      margin-top: 8px;
    }
  }
}

.preview-brand {
  text-align: center;
  margin-bottom: 20px;

  .preview-logo {
    margin-bottom: 8px;

    .logo-placeholder {
      width: 40px;
      height: 40px;
      margin: 0 auto;
      background: #409eff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }
  }

  .preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .preview-slogan {
    font-size: 12px;
    color: #909399;
  }
}

.preview-editor-hub {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .preview-editor-card {
    flex: 1;
    padding: 16px;
    background: #f0f9ff;
    border: 1px solid #409eff;
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #409eff;
  }
}

.preview-toolbar {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;

  .preview-tool-item {
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.preview-recent {
  .preview-recent-item {
    padding: 8px 12px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #606266;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 深色模式适配
&.dark-mode {
  .layout-mode-description {
    color: #909399;
  }

  .component-label {
    color: #e4e7ed;
  }

  .component-desc {
    color: #909399;
  }

  .component-tip {
    background: #1e3a5f;
    border-left-color: #409eff;
    color: #e4e7ed;

    .anticon {
      color: #409eff;
    }
  }

  .layout-preview-container {
    background: #1a1a1a;
    border-color: #3a3a3a;
  }

  .preview-card {
    background: #2b2b2b;
    border-color: #3a3a3a;

    .preview-brand {
      .preview-title {
        color: #d4d4d4;
      }

      .preview-slogan {
        color: #909399;
      }
    }

    .preview-editor-hub {
      .preview-editor-card {
        background: #1a3a5c;
        border-color: #409eff;
        color: #409eff;
      }
    }

    .preview-toolbar {
      background: #2b2b2b;
    }

    .preview-recent {
      .preview-recent-item {
        background: #2b2b2b;
        border-color: #3a3a3a;
        color: #d4d4d4;
      }
    }
  }
}
</style>
