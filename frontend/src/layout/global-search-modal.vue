<!--
  * 全局搜索弹框组件
  * 支持主题切换和主题色适配
  * 使用 Element Plus 重构，解决 tabindex 高度问题
-->
<template>
  <el-dialog
    v-model="searchModalVisible"
    :title="$t('globalSearch.title')"
    width="800px"
    class="global-search-modal"
    :class="{ 'dark-modal': isDarkTheme }"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="closeSearch"
    @opened="handleDialogOpened"
  >
    <!-- 搜索输入框 -->
    <div class="search-input-wrapper">
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('globalSearch.placeholder')"
        size="large"
        @input="onSearchInput"
        @keydown="handleKeydown"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results-wrapper">
      <div v-if="searchLoading" class="search-loading">
        <el-icon class="is-loading loading-icon"><Loading /></el-icon>
        <span class="loading-text">{{ $t("globalSearch.searching") }}</span>
      </div>

      <div
        v-else-if="searchResults.length === 0 && searchKeyword"
        class="search-empty"
      >
        <el-empty :description="$t('globalSearch.noResults')" />
      </div>

      <div v-else-if="searchResults.length > 0" class="search-results">
        <div
          v-for="(result, index) in searchResults"
          :key="result.id"
          class="search-result-item"
          :class="{
            selected: selectedIndex === index,
            'dark-item': isDarkTheme,
          }"
          @mouseenter="selectedIndex = index"
        >
          <div class="result-header">
            <span>
              <span class="result-type">{{ result.type }}</span>
              <span class="result-header-actions" @click.stop>
                <el-button
                  link
                  type="success"
                  @click="copyContent(result.content)"
                >
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                </el-button>
              </span>
            </span>
            <div class="result-time">
              {{ formatTime(result.crtTime) }}
            </div>
          </div>
          <div class="result-content">
            <highlight-text
              :text="result.content || '无内容'"
              :keyword="searchKeyword"
            />
          </div>
          <div class="result-footer">
            <span v-if="result.tag" class="result-tab">{{
              result.parentPage
            }}</span>
            <span class="result-opt-type">{{
              result.optType === "2" ? t("version.manual") : t("version.auto")
            }}</span>
            <span v-if="result.tag" class="result-tag">{{ result.tag }}</span>
            <span v-if="result.parent" class="result-parent">{{
              result.parent
            }}</span>
          </div>
        </div>
      </div>

      <div v-else class="search-hint">
        <div class="hint-icon">
          <el-icon><Search /></el-icon>
        </div>
        <div class="hint-text">
          {{ $t("globalSearch.navigation") }}
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <template #footer v-if="searchResults.length > 0">
      <div class="search-pagination">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
          :disabled="isPaginating"
        />
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from "vue";
import { useThemeStore } from "/@/store/modules/theme";
import { useGlobalSearch } from "/@/composables/use-global-search";
import HighlightText from "./components/highlight-text.vue";
import { Search, Loading, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

// 主题 Store
const themeStore = useThemeStore();
const isDarkTheme = computed(() => themeStore.isDark);
const { t } = useI18n();

// 使用全局搜索逻辑
const {
  searchModalVisible,
  searchKeyword,
  searchResults,
  searchLoading,
  isPaginating,
  pagination,
  selectedIndex,
  openSearch,
  closeSearch,
  debouncedSearch,
  handleKeydown,
  selectResult,
  formatTime,
  handlePageChange,
  handlePageSizeChange,
} = useGlobalSearch();

// 暴露方法供外部调用
defineExpose({
  openSearch,
  closeSearch,
});

// 搜索输入变化
function onSearchInput() {
  debouncedSearch();
}

// 对话框打开后聚焦到输入框
function handleDialogOpened() {
  // Element Plus 的输入框结构
  const searchInput = document.querySelector(".search-input .el-input__inner");
  if (searchInput) {
    searchInput.focus();
  }
}

// 监听主题变化
onMounted(() => {
  window.addEventListener("themeChange", handleThemeChange);
  window.addEventListener("themeColorChange", handleThemeColorChange);
  window.addEventListener("global-search-open", openSearch);
});

onUnmounted(() => {
  window.removeEventListener("themeChange", handleThemeChange);
  window.removeEventListener("themeColorChange", handleThemeColorChange);
  window.removeEventListener("global-search-open", openSearch);
});

function handleThemeChange(event) {
  // 主题切换时,弹框会自动响应 CSS 变量变化
}

function handleThemeColorChange(event) {
  // 主题色切换时,弹框会自动响应 CSS 变量变化
}

// 复制内容到剪贴板
async function copyContent(content) {
  try {
    const textToCopy = content || "";

    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 现代方案：使用 Clipboard API
      await navigator.clipboard.writeText(textToCopy);
      ElMessage.success(t("home.recent.copySuccess") || "复制成功");
    } else {
      // 回退方案：使用旧的 execCommand 方法
      const tempTextarea = document.createElement("textarea");
      tempTextarea.value = textToCopy;
      tempTextarea.style.position = "fixed";
      tempTextarea.style.left = "-999999px";
      document.body.appendChild(tempTextarea);
      tempTextarea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          ElMessage.success("复制成功");
        } else {
          ElMessage.error("复制失败");
        }
      } catch (err) {
        ElMessage.error("复制失败");
        console.error("复制错误:", err);
      } finally {
        document.body.removeChild(tempTextarea);
      }
    }
  } catch (err) {
    ElMessage.error("复制失败");
    console.error("复制错误:", err);
  }
}
</script>

<style lang="less" scoped>
@import "/@/theme/global-search-theme.css";

.global-search-modal {
  // 使用 CSS 变量实现主题适配
  background-color: var(--search-modal-bg);
  color: var(--search-text-primary);

  :deep(.el-dialog) {
    background-color: var(--search-modal-bg);
    border: 1px solid var(--search-border-color);
    border-radius: 8px;
    overflow: hidden;

    // 确保 dialog 容器正确显示，不添加 tabindex 相关问题
    height: auto;
    display: block;

    // 防止 tabindex="0" 相关的高度问题
    &:focus {
      outline: none;
    }
  }

  // 确保对话框容器没有 tabindex 相关问题
  :deep(.el-overlay-dialog) {
    display: flex;
    justify-content: center;
    align-items: center;

    .el-dialog {
      margin: 0;
    }
  }

  :deep(.el-dialog__header) {
    background-color: var(--search-modal-bg);
    border-bottom: 1px solid var(--search-border-color);
    padding: 16px 24px;
    margin: 0;
  }

  :deep(.el-dialog__title) {
    color: var(--search-text-primary);
    font-size: 18px;
    font-weight: 600;
  }

  :deep(.el-dialog__headerbtn) {
    color: var(--search-text-secondary);

    &:hover {
      color: var(--search-text-primary);
    }
  }

  :deep(.el-dialog__body) {
    background-color: var(--search-modal-bg);
    padding: 20px 24px;

    // 确保内容区域有合适的高度
    max-height: 70vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    background-color: var(--search-modal-bg);
    border-top: 1px solid var(--search-border-color);
    padding: 16px 24px;
    margin: 0;
  }

  .search-input-wrapper {
    margin-bottom: 20px;

    .search-input {
      :deep(.el-input__wrapper) {
        background-color: var(--el-fill-color);
        border-color: var(--search-border-color);
        border-radius: 8px;
        padding: 8px 16px;
        box-shadow: none;

        &.is-focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
        }
      }

      :deep(.el-input__inner) {
        color: var(--search-text-primary);
        font-size: 14px;

        &::placeholder {
          color: var(--el-text-color-placeholder);
        }
      }

      .search-icon {
        color: var(--search-text-secondary);
        font-size: 16px;
      }

      .shortcut-hint {
        color: var(--el-text-color-placeholder);
        font-size: 12px;
        font-weight: 500;
        background-color: var(--el-fill-color-light);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }

  .search-results-wrapper {
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
    padding: 5px 5px;
    border-radius: 8px;

    .search-loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: var(--search-text-secondary);

      .loading-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .loading-text {
        color: var(--search-text-secondary);
      }
    }

    .search-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: var(--search-text-secondary);

      :deep(.el-empty__description) {
        color: var(--search-text-secondary);
      }
    }

    .search-hint {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: var(--search-text-secondary);

      .hint-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .hint-text {
        font-size: 14px;
        opacity: 0.8;
      }
    }

    .search-results {
      position: relative;

      .search-result-item {
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid var(--search-border-color);
        border-radius: 8px;
        background-color: var(--search-bg-page);
        cursor: pointer;
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          border-color: var(--el-color-primary);
          background-color: var(--search-fill-color-light);
          box-shadow: var(--search-result-hover-shadow);
        }

        &.selected {
          border-color: var(--el-color-primary);
          background-color: var(--search-fill-color);
          box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
        }

        &.dark-item {
          // 深色主题特定样式
          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.32);
          }
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          margin-bottom: 1px;

          :deep(.result-type) {
            display: inline-block;
            font-weight: 600;
            color: var(--el-color-primary);
            font-size: 14px;
            line-height: 1.5;
            padding: 2px 8px;
            border-radius: 16px;
            background-color: rgba(var(--el-color-primary-rgb), 0.1);
          }

          :deep(.result-header-actions) {
            .el-button {
              padding: 0px 10px 6px 10px;
              font-size: 16px;
              height: auto;
            }

            .el-icon {
              font-size: 16px;
            }
          }

          .result-time {
            display: flex;
            align-items: end;
            color: var(--search-text-secondary);
            font-size: 12px;
          }
        }

        .result-content {
          margin-bottom: 12px;
          color: var(--el-text-color-regular);
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
        }

        .result-footer {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .result-tab,
          .result-opt-type,
          .result-tag,
          .result-parent {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 16px;
            font-size: 12px;
            line-height: 1.4;
            background-color: var(--search-fill-color-light);
            color: var(--search-text-secondary);
            border: 1px solid var(--search-border-color);
          }
        }
      }
    }
  }

  .search-pagination {
    display: flex;
    justify-content: flex-end;

    :deep(.el-pagination) {
      .el-pager li {
        background-color: var(--search-modal-bg);
        border-color: var(--search-border-color);
        color: var(--search-text-primary);

        &:hover {
          color: var(--el-color-primary);
        }

        &.is-active {
          background-color: var(--el-color-primary);
          color: #ffffff;
        }
      }

      .el-pagination__total {
        color: var(--search-text-secondary);
        margin-right: 16px;
      }

      .btn-prev,
      .btn-next {
        background-color: var(--search-modal-bg);
        color: var(--search-text-primary);

        &:hover:not(:disabled) {
          color: var(--el-color-primary);
        }

        &:disabled {
          color: var(--el-text-color-placeholder);
        }
      }

      .el-pagination__jump {
        color: var(--search-text-secondary);

        .el-input__wrapper {
          background-color: var(--search-modal-bg);
          border-color: var(--search-border-color);

          .el-input__inner {
            color: var(--search-text-primary);
          }
        }
      }
    }
  }
}

// 深色模式特定样式
:deep(.dark-modal) {
  .el-dialog {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.48);
  }
}

// 浅色模式特定样式
.global-search-modal:not(.dark-modal) {
  :deep(.el-dialog) {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}
</style>
