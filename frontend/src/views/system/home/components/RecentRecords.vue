<!--
  * 最近使用记录组件（多编辑器版本）
  * 展示用户最近处理的文件列表，支持按类型筛选、快速打开和删除
-->
<template>
  <div class="recent-records" :class="{ 'dark-mode': isDarkMode }">
    <div class="section-header">
      <h3>{{ t("home.recent.title") }}</h3>
      <a-button
        type="link"
        @click="viewAllHistory"
        class="view-all-btn"
        :style="{ color: themeColor }"
      >
        {{ t("home.recent.viewAll") }} <RightOutlined />
      </a-button>
    </div>

    <!-- 类型筛选 Tab -->
    <div class="filter-tabs">
      <a-button
        v-for="tab in filterTabs"
        :key="tab.key"
        size="small"
        :type="activeFilter === tab.key ? 'primary' : 'default'"
        class="filter-tab-btn"
        @click="setFilter(tab.key)"
      >
        {{ tab.label }}
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <div v-if="filteredRecords.length > 0" class="records-list-container">
        <div class="records-list">
          <div
            v-for="item in filteredRecords"
            :key="item.id"
            class="record-item"
            @click="openRecord(item)"
          >
            <div class="record-content">
              <div class="record-header">
                <span class="record-type-tag" :class="'tag-' + item.type">
                  {{ getTypeLabel(item) }}
                </span>
                <div class="record-info">
                  <div class="record-name">{{ item.name }}</div>
                  <div class="record-time">
                    {{ formatTime(item.timestamp) }}
                  </div>
                </div>
              </div>
              <div class="record-preview">{{ getPreview(item.content) }}</div>
            </div>
            <div class="record-actions" @click.stop>
              <el-button link type="success" @click="copyRecord(item)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-popconfirm
                :title="t('home.recent.deleteConfirm')"
                :confirm-button-text="t('common.confirm')"
                :cancel-button-text="t('common.cancel')"
                @confirm="deleteRecord(item.id)"
              >
                <template #reference>
                  <el-button link type="success">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>

      <a-empty
        v-else-if="!loading"
        :description="t('home.recent.empty')"
        class="empty-state"
      >
        <template #image>
          <InboxOutlined style="font-size: 64px; color: #d9d9d9" />
        </template>
      </a-empty>
    </a-spin>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RightOutlined, InboxOutlined } from "@ant-design/icons-vue";
import { Delete, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { useRecentRecords } from "../composables/useRecentRecords";
import { useThemeStore } from "/@/store/modules/theme";

const { t } = useI18n();
const {
  filteredRecords,
  loading,
  activeFilter,
  deleteRecord,
  openRecord,
  setFilter,
  formatTime,
  getPreview,
  getTypeLabel,
  viewAllHistory,
} = useRecentRecords();

const themeStore = useThemeStore();
const themeColor = computed(() => themeStore.themeColor);
const isDarkMode = computed(() => themeStore.isDark);

// 筛选 Tab 配置
const filterTabs = computed(() => [
  { key: "all", label: t("home.recent.filterAll") },
  { key: "json", label: "JSON" },
  { key: "code", label: t("home.recent.filterCode") },
  { key: "text", label: t("home.recent.filterText") },
]);

/**
 * 复制记录到剪贴板
 */
const copyRecord = async (item) => {
  try {
    let formatted = item.content;
    // JSON 类型尝试格式化
    if (item.type === "json" || !item.type) {
      try {
        formatted = JSON.stringify(JSON.parse(item.content), null, 2);
      } catch {
        // 非 JSON 保持原样
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(formatted);
      ElMessage.success(t("home.recent.copySuccess") || "复制成功");
    } else {
      const tempTextarea = document.createElement("textarea");
      tempTextarea.value = formatted;
      tempTextarea.style.position = "fixed";
      tempTextarea.style.left = "-999999px";
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      try {
        document.execCommand("copy");
        ElMessage.success(t("home.recent.copySuccess") || "复制成功");
      } catch {
        ElMessage.error(t("home.recent.copyFailed") || "复制失败");
      } finally {
        document.body.removeChild(tempTextarea);
      }
    }
  } catch {
    ElMessage.error(t("home.recent.copyFailed") || "复制失败");
  }
};
</script>

<style scoped lang="less">
.recent-records {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  min-height: 400px;
  animation: fadeInUp 0.4s ease-out 0.4s both;
  transition: all 0.3s ease;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #262626;
    }

    .view-all-btn {
      font-weight: 500;
      padding: 0;
      transition: all 0.3s ease;

      &:hover {
        filter: brightness(1.2);
      }
    }
  }

  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;

    .filter-tab-btn {
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .records-list-container {
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 8px;
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: var(--primary-color);
      transform: translateX(4px);
    }

    .record-content {
      flex: 1;
      min-width: 0;

      .record-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .record-type-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          flex-shrink: 0;
          text-transform: uppercase;

          &.tag-json {
            background: var(--primary-light);
            color: var(--primary-color);
          }

          &.tag-code {
            background: rgba(82, 196, 26, 0.1);
            color: #52c41a;
          }

          &.tag-text {
            background: rgba(250, 173, 20, 0.1);
            color: #faad14;
          }
        }

        .record-info {
          flex: 1;
          min-width: 0;
        }

        .record-name {
          font-size: 15px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .record-time {
          font-size: 13px;
          color: #8c8c8c;
        }
      }

      .record-preview {
        font-size: 13px;
        color: #595959;
        font-family: "Courier New", monospace;
        background: #f0f0f0;
        padding: 8px 12px;
        border-radius: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .record-actions {
      margin-left: 16px;
      flex-shrink: 0;
      display: flex;
      gap: 8px;
    }
  }

  .empty-state {
    padding: 60px 20px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式
@media (max-width: 768px) {
  .recent-records {
    padding: 20px;

    .filter-tabs {
      flex-wrap: wrap;
      gap: 6px;
    }

    .records-list-container {
      max-height: 300px;
    }

    .record-item {
      padding: 12px;

      .record-content {
        .record-header {
          gap: 8px;

          .record-name {
            font-size: 14px;
          }

          .record-time {
            font-size: 12px;
          }
        }

        .record-preview {
          font-size: 12px;
          padding: 6px 10px;
        }
      }
    }
  }
}

// 深色模式
.recent-records.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

  .section-header {
    h3 {
      color: rgba(255, 255, 255, 0.95);
    }
  }

  .records-list-container {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .record-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: v-bind(themeColor);
    }

    .record-content {
      .record-header {
        .record-name {
          color: rgba(255, 255, 255, 0.95);
        }

        .record-time {
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .record-preview {
        color: rgba(255, 255, 255, 0.8);
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>
