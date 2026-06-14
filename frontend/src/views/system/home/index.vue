<!--
  * 首页主容器组件
  * 整合编辑器入口、快捷工具栏和最近记录，提供多编辑器工作台入口
-->
<template>
  <div class="home-container" :class="[layoutModeClass, verticalLayoutClass]">
    <!-- 品牌展示区 - 基于配置显示 -->
    <BrandSection
      v-if="showBrandSection"
      :compact="layoutMode === 'compact'"
      :simple="layoutMode === 'simple'"
    />

    <!-- 内容区域容器 -->
    <div class="content-wrapper">
      <!-- 编辑器入口卡片区 - 基于配置显示 -->
      <EditorHub v-if="showEditorHub" :class="editorHubClass" />

      <!-- 通用快捷工具栏 - 基于配置显示 -->
      <QuickToolbar
        v-if="showQuickToolbar"
        :class="toolbarClass"
        @import="importDialogVisible = true"
      />

      <!-- 最近使用记录（多类型）- 基于配置显示 -->
      <RecentRecords v-if="showRecentRecords" :class="recentClass" />
    </div>

    <!-- 通用文件导入弹框 -->
    <ImportDialog v-model:visible="importDialogVisible" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import BrandSection from "./components/BrandSection.vue";
import EditorHub from "./components/EditorHub.vue";
import QuickToolbar from "./components/QuickToolbar.vue";
import RecentRecords from "./components/RecentRecords.vue";
import ImportDialog from "./components/ImportDialog.vue";

const importDialogVisible = ref(false);
const appConfigStore = useAppConfigStore();

// 当前布局模式
const layoutMode = computed(() => appConfigStore.homeLayoutMode || "standard");

// 布局模式类名
const layoutModeClass = computed(() => `layout-${layoutMode.value}`);

// 垂直布局类名
const verticalLayoutClass = computed(() => {
  return appConfigStore.homeVerticalLayout ? "vertical-layout-mode" : "";
});

// 组件可见性配置
const componentsVisibility = computed(() => {
  const visibility = appConfigStore.homeComponentsVisibility;
  return {
    showBrandSection: visibility?.showBrandSection ?? true,
    showEditorHub: visibility?.showEditorHub ?? true,
    showQuickToolbar: visibility?.showQuickToolbar ?? true,
    showRecentRecords: visibility?.showRecentRecords ?? true,
  };
});

// 各个组件的显示状态
const showBrandSection = computed(
  () => componentsVisibility.value.showBrandSection
);
const showEditorHub = computed(() => componentsVisibility.value.showEditorHub);
const showQuickToolbar = computed(
  () => componentsVisibility.value.showQuickToolbar
);
const showRecentRecords = computed(
  () => componentsVisibility.value.showRecentRecords
);

// 根据布局模式和组件可见性动态计算样式类
const editorHubClass = computed(() => {
  if (!showBrandSection.value && !showQuickToolbar.value) return "mt-0";
  if (layoutMode.value === "simple") return "mt-0";
  if (layoutMode.value === "compact") return "mt-16";
  return "mt-40";
});

const toolbarClass = computed(() => {
  if (layoutMode.value === "compact") return "mt-16 mb-16";
  return "mt-24 mb-24";
});

const recentClass = computed(() => {
  if (layoutMode.value === "compact") return "mt-16";
  return "mt-24";
});
</script>

<style lang="less">
.home-container {
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

// 简洁模式样式
.home-container.layout-simple {
  padding: 40px 20px;

  .content-wrapper {
    max-width: 1000px;
  }

  // 简单模式下 EditorCard 居中优化
  :deep(.editor-card) {
    padding: 28px 24px;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// 紧凑模式样式
.home-container.layout-compact {
  padding: 40px 20px;

  :deep(.editor-hub) {
    gap: 16px;

    .editor-card {
      padding: 20px;
    }
  }

  :deep(.quick-toolbar) {
    padding: 12px 24px;
  }
}

// 间距工具类
.mt-0 {
  margin-top: 0;
}
.mt-16 {
  margin-top: 16px;
}
.mt-24 {
  margin-top: 24px;
}
.mt-32 {
  margin-top: 32px;
}
.mt-40 {
  margin-top: 40px;
}
.mb-16 {
  margin-bottom: 16px;
}
.mb-32 {
  margin-bottom: 32px;
}

// 响应式设计
@media (max-width: 768px) {
  .home-container {
    padding: 24px 16px;
  }

  .home-container.layout-simple {
    padding: 16px;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .home-container {
    padding: 32px 20px;
  }
}

// 垂直布局模式样式
.home-container.vertical-layout-mode {
  // EditorHub 垂直布局
  .editor-hub {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 24px !important;
  }

  .editor-hub .editor-card {
    width: 100%;
    padding: 28px 32px !important;
    min-height: auto;
  }

  .editor-hub .editor-card .card-header {
    gap: 16px !important;
  }

  .editor-hub .editor-card .card-header .card-icon {
    width: 56px !important;
    height: 56px !important;
    font-size: 28px !important;
  }

  .editor-hub .editor-card .card-header .card-title-area .card-title {
    font-size: 19px !important;
  }

  .editor-hub .editor-card .card-header .card-title-area .card-desc {
    font-size: 14px !important;
    line-height: 1.5 !important;
  }

  .editor-hub .editor-card .card-actions {
    gap: 10px !important;
    margin-top: 4px;
  }

  .editor-hub .editor-card .card-actions .card-action-btn {
    height: 32px !important;
    padding: 0 14px !important;
    font-size: 13px !important;
  }

  // QuickToolbar 垂直布局
  .quick-toolbar {
    flex-direction: column !important;
    padding: 16px 24px !important;
  }

  .quick-toolbar .toolbar-divider {
    width: 100% !important;
    height: 1px !important;
    margin: 8px 0;
  }

  .quick-toolbar .toolbar-item {
    width: 100% !important;
    justify-content: flex-start !important;
    padding: 14px 20px !important;
    border-radius: 8px !important;
    gap: 12px !important;
  }

  .quick-toolbar .toolbar-item .toolbar-icon {
    font-size: 22px !important;
  }

  .quick-toolbar .toolbar-item .toolbar-label {
    font-size: 15px !important;
  }

  .quick-toolbar .toolbar-item:hover {
    background: var(--primary-light) !important;
    transform: translateX(4px) !important;
  }

  .quick-toolbar .toolbar-item:hover .toolbar-icon {
    color: var(--primary-color) !important;
  }

  .quick-toolbar .toolbar-item:hover .toolbar-label {
    color: var(--primary-color) !important;
  }

  // RecentRecords 垂直布局优化
  .recent-records {
    padding: 32px !important;
    border-radius: 18px !important;
    min-height: 420px !important;
  }

  .recent-records .section-header {
    margin-bottom: 20px !important;
  }

  .recent-records .section-header h3 {
    font-size: 22px !important;
    font-weight: 600 !important;
  }

  .recent-records .filter-tabs {
    gap: 10px !important;
    margin-bottom: 20px !important;
  }

  .recent-records .filter-tabs .filter-tab-btn {
    // padding: 6px 16px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
  }

  .recent-records .records-list-container {
    max-height: 450px !important;
  }

  .recent-records .records-list-container::-webkit-scrollbar {
    width: 8px !important;
  }

  .recent-records .records-list {
    gap: 14px !important;
  }

  .recent-records .record-item {
    padding: 18px !important;
    border-radius: 14px !important;
  }

  .recent-records .record-item .record-content .record-header {
    gap: 14px !important;
    margin-bottom: 10px !important;
  }

  .recent-records .record-item .record-content .record-header .record-type-tag {
    font-size: 12px !important;
    padding: 4px 10px !important;
    border-radius: 6px !important;
  }

  .recent-records
    .record-item
    .record-content
    .record-header
    .record-info
    .record-name {
    font-size: 16px !important;
    font-weight: 600 !important;
    margin-bottom: 6px !important;
  }

  .recent-records
    .record-item
    .record-content
    .record-header
    .record-info
    .record-time {
    font-size: 14px !important;
  }

  .recent-records .record-item .record-content .record-preview {
    font-size: 14px !important;
    padding: 10px 14px !important;
    border-radius: 8px !important;
    line-height: 1.6 !important;
    max-height: 60px;
    overflow-y: auto;
  }

  .recent-records .record-item .record-actions {
    margin-left: 20px !important;
    gap: 10px !important;
  }

  .recent-records .record-item:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
    transform: translateX(6px) !important;
    border-color: var(--primary-color) !important;
  }

  // 响应式适配
  @media (min-width: 769px) and (max-width: 992px) {
    .editor-hub {
      gap: 20px !important;
    }

    .editor-hub .editor-card {
      padding: 24px 28px !important;
    }

    .editor-hub .editor-card .card-header .card-icon {
      width: 52px !important;
      height: 52px !important;
      font-size: 26px !important;
    }

    .recent-records {
      padding: 28px !important;
    }

    .recent-records .records-list-container {
      max-height: 400px !important;
    }
  }

  @media (max-width: 768px) {
    .editor-hub {
      gap: 16px !important;
    }

    .editor-hub .editor-card {
      padding: 20px 24px !important;
    }

    .editor-hub .editor-card .card-header {
      gap: 12px !important;
    }

    .editor-hub .editor-card .card-header .card-icon {
      width: 48px !important;
      height: 48px !important;
      font-size: 24px !important;
    }

    .editor-hub .editor-card .card-header .card-title-area .card-title {
      font-size: 17px !important;
    }

    .editor-hub .editor-card .card-header .card-title-area .card-desc {
      font-size: 13px !important;
    }

    .editor-hub .editor-card .card-actions {
      gap: 8px !important;
    }

    .editor-hub .editor-card .card-actions .card-action-btn {
      height: 28px !important;
      padding: 0 12px !important;
      font-size: 12px !important;
    }

    .quick-toolbar {
      padding: 14px 20px !important;
    }

    .quick-toolbar .toolbar-item {
      padding: 12px 16px !important;
      gap: 10px !important;
    }

    .quick-toolbar .toolbar-item .toolbar-icon {
      font-size: 20px !important;
    }

    .quick-toolbar .toolbar-item .toolbar-label {
      font-size: 14px !important;
    }

    .recent-records {
      padding: 24px !important;
    }

    .recent-records .section-header h3 {
      font-size: 20px !important;
    }

    .recent-records .filter-tabs {
      flex-wrap: wrap;
      gap: 8px !important;
    }

    .recent-records .filter-tabs .filter-tab-btn {
      // padding: 5px 12px !important;
      font-size: 13px !important;
    }

    .recent-records .records-list-container {
      max-height: 350px !important;
    }

    .recent-records .record-item {
      padding: 14px !important;
    }

    .recent-records .record-item .record-content .record-header {
      gap: 10px !important;
    }

    .recent-records
      .record-item
      .record-content
      .record-header
      .record-type-tag {
      font-size: 11px !important;
      padding: 3px 8px !important;
    }

    .recent-records
      .record-item
      .record-content
      .record-header
      .record-info
      .record-name {
      font-size: 15px !important;
    }

    .recent-records
      .record-item
      .record-content
      .record-header
      .record-info
      .record-time {
      font-size: 13px !important;
    }

    .recent-records .record-item .record-content .record-preview {
      font-size: 13px !important;
      padding: 8px 12px !important;
    }

    .recent-records .record-item .record-actions {
      margin-left: 16px !important;
    }
  }
}
</style>
