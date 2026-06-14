<!--
  * 版本时间线组件
  * 展示某条日志记录的版本历史，支持查看、对比、恢复
-->
<template>
  <el-drawer
    v-model="visible"
    :title="t('version.title')"
    size="500px"
    direction="rtl"
    v-if="visible"
    @close="handleDrawerClose"
  >
    <!-- 对比操作栏 -->
    <div v-if="selectedForCompare.length > 0" class="compare-bar">
      <span class="compare-info">
        {{ t("version.selected", { count: selectedForCompare.length }) }}
      </span>
      <el-button size="small" @click="clearSelection">
        {{ t("version.cancelCompare") }}
      </el-button>
      <el-button
        class="compare-comfirm-btn"
        size="small"
        type="primary"
        :disabled="!canCompare"
        @click="handleCompare"
      >
        {{ t("version.startCompare") }}
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="versions.length === 0" class="empty-container">
      <el-empty :description="t('version.noVersions')" />
    </div>

    <!-- 版本时间线 -->
    <el-timeline v-else>
      <el-timeline-item
        v-for="version in versions"
        :key="version.id"
        :timestamp="version.crt_time"
        placement="top"
        :type="version.opt_type === '2' ? 'primary' : 'info'"
        :hollow="!isSelectedForCompare(version)"
      >
        <div class="version-card">
          <div class="version-header">
            <!-- 可编辑的版本名称 -->
            <div class="version-name-wrapper" @dblclick="startEditMsg(version)">
              <el-icon
                v-if="!editingVersionId || editingVersionId !== version.id"
                class="edit-icon"
              >
                <Edit />
              </el-icon>
              <el-input
                v-if="editingVersionId === version.id"
                :key="`input-${version.id}-${editingVersionId}`"
                :ref="(el) => setInputRef(version.id, el)"
                v-model="editingVersionMsg"
                size="small"
                :placeholder="t('version.namePlaceholder')"
                @blur="saveVersionMsg(version)"
                @keyup.enter="handleEnter(version)"
                @keyup.esc="cancelEdit"
                class="name-input"
              />
              <span v-else class="version-name">
                {{
                  version.message || t("version.no", { no: version.version_no })
                }}
              </span>
            </div>
            <div>
              <el-tag
                v-if="version.is_active"
                class="active-tag"
                type="success"
                size="small"
              >
                {{ t("version.active") }}
              </el-tag>
              <el-tag
                class="version-type-tag"
                :type="version.opt_type === '2' ? 'primary' : 'info'"
                size="small"
              >
                {{
                  version.opt_type === "2"
                    ? t("version.manual")
                    : t("version.auto")
                }}
              </el-tag>
            </div>
          </div>
          <div v-if="version.version_no" class="version-message">
            Version{{ version.version_no }}
          </div>
          <div class="version-actions">
            <!-- 主要操作区域 -->
            <div class="primary-actions">
              <el-button
                size="small"
                link
                type="primary"
                :icon="View"
                @click="handleView(version)"
              >
                {{ t("version.view") }}
              </el-button>
            </div>
            <div class="primary-actions">
              <el-button
                size="small"
                link
                :type="isSelectedForCompare(version) ? 'warning' : 'default'"
                @click="toggleSelectForCompare(version)"
              >
                {{ t("version.compare") }}
              </el-button>
            </div>

            <!-- 更多操作下拉菜单 -->
            <el-dropdown
              trigger="click"
              @command="(cmd) => handleMoreAction(cmd, version)"
            >
              <el-button size="small" link :icon="MoreFilled">
                {{ t("version.more") }}
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="!version.is_active"
                    :icon="Check"
                    command="setActive"
                  >
                    {{ t("version.setActive") }}
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Delete" command="delete">
                    {{ t("version.delete") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- 分页 -->
    <div v-if="pagination.total > pagination.pageSize" class="pagination-wrap">
      <el-pagination
        small
        layout="prev, pager, next"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :current-page="pagination.pageNo"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 内容查看弹窗 -->
    <el-dialog
      v-model="contentDialogVisible"
      :title="t('version.viewContent')"
      style="width: 50vw; height: 53vh; border-radius: 16px"
      append-to-body
      draggable
    >
      <div class="json-editor-wrapper">
        <JsonEditorLite
          v-if="contentDialogVisible"
          :model-value="viewingContent"
          :model-type="viewingType"
          :read-only="true"
          :auto-format="true"
        />
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, watch, onDeactivated, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { onClickOutside } from "@vueuse/core";
import { socketClient } from "/@/utils/socket-client";
import JsonEditorLite from "./json-editor-lite.vue";
import { useVersionTimeline } from "../composables/useVersionTimeline";
import {
  View,
  MoreFilled,
  Check,
  Delete,
  Refresh,
  Edit,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const props = defineProps({
  logRecord: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["compare", "restored", "activeChanged"]);

const visible = defineModel("visible", { type: Boolean, default: false });

const {
  versions,
  loading,
  pagination,
  selectedForCompare,
  canCompare,
  loadVersions,
  toggleSelectForCompare,
  clearSelection,
  getCompareData,
  deleleVersion,
  restoreVersion,
  setActiveVersion,
  isSelectedForCompare,
  updateVersionName,
} = useVersionTimeline();

// 内容查看
const contentDialogVisible = ref(false);
const viewingContent = ref("");
const viewingType = ref("json");

// 编辑版本名称状态
const editingVersionId = ref(null);
const editingVersionMsg = ref("");
const isSaving = ref(false); // 防止重复调用的状态锁

// 存储输入框的引用，用于 onClickOutside
const inputRefs = new Map();

// 监听 logRecord 变化，加载版本
watch(
  () => props.logRecord,
  (record) => {
    if (record && record.id && visible.value) {
      clearSelection();
      loadVersions(record.id);
    }
  }
);

watch(visible, (val) => {
  if (val && props.logRecord?.id) {
    clearSelection();
    loadVersions(props.logRecord.id);
  }
});

function handlePageChange(page) {
  if (props.logRecord?.id) {
    loadVersions(props.logRecord.id, page);
  }
}

function handleView(version) {
  // console.log("handleView:", version);
  viewingContent.value = version.content || "";
  viewingType.value = version.type || "TEXT";
  contentDialogVisible.value = true;
}

function handleCompare() {
  const data = getCompareData();
  if (data) {
    emit("compare", data);
  }
}

async function handleDelete(verId) {
  await deleleVersion(verId, socketClient);
}

async function handleRestore(version) {
  const success = await restoreVersion(version, socketClient);
  if (success) {
    emit("restored", version);
  }
}

async function handleSetActive(version) {
  if (!props.logRecord?.id) return;
  const success = await setActiveVersion(version, props.logRecord.id, emit);
  if (!success) {
    console.error("设置Active版本失败");
  }
}

function handleMoreAction(command, version) {
  switch (command) {
    case "setActive":
      handleSetActive(version);
      break;
    case "delete":
      handleDelete(version.id);
      break;
    case "restore":
      handleRestore(version);
      break;
  }
}

/**
 * 处理抽屉关闭事件
 * 在抽屉关闭时，如果有正在编辑的版本，自动保存
 */
function handleDrawerClose() {
  if (editingVersionId.value) {
    const editingVersion = versions.value.find(
      (v) => v.id === editingVersionId.value
    );
    if (editingVersion) {
      saveVersionMsg(editingVersion);
    }
  }
}

/**
 * 设置输入框引用并配置 onClickOutside
 * @param {number} versionId - 版本ID
 * @param {HTMLElement} el - 输入框元素
 */
function setInputRef(versionId, el) {
  if (el) {
    inputRefs.set(versionId, el);

    // 为新添加的输入框设置外部点击监听
    // 使用 once: true 确保只触发一次，避免重复注册导致的问题
    onClickOutside(el, () => {
      if (editingVersionId.value === versionId) {
        const editingVersion = versions.value.find((v) => v.id === versionId);
        if (editingVersion) {
          saveVersionMsg(editingVersion);
        }
      }
    }, { once: true });
  } else {
    inputRefs.delete(versionId);
  }
}

/**
 * 取消编辑版本名称
 * 按 ESC 键时触发，退出编辑模式但不保存
 */
function cancelEdit() {
  editingVersionId.value = null;
  editingVersionMsg.value = "";
}

/**
 * 开始编辑版本名称
 * @param {Object} version - 版本对象
 */
async function startEditMsg(version) {
  editingVersionId.value = version.id;
  editingVersionMsg.value = version.message || "";
  
  // 等待 DOM 更新完成后自动聚焦输入框
  await nextTick();
  const inputEl = document.querySelector('.name-input input');
  if (inputEl) {
    inputEl.focus();
    // 将光标移动到文本末尾
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
  }
}

/**
 * 处理回车键事件
 * 手动触发 blur 事件以保存版本名称
 * @param {Object} version - 版本对象
 */
function handleEnter(version) {
  // 找到对应的输入框元素（使用更精确的选择器）
  const inputEl = document.querySelector(`.name-input input:focus`);
  if (inputEl) {
    inputEl.blur();
  }
}

/**
 * 保存版本名称
 * @param {Object} version - 版本对象
 */
async function saveVersionMsg(version) {
  // 1. 防止并发调用
  if (isSaving.value) return;

  // 2. 检查版本ID
  if (editingVersionId.value !== version.id) return;

  const newName = editingVersionMsg.value.trim();

  // 3. 如果名称未变化，直接退出编辑模式
  if (newName === (version.message || "")) {
    editingVersionId.value = null;
    return;
  }

  try {
    isSaving.value = true; // 🔒 设置保存锁

    // 4. 立即退出编辑模式，防止重复触发
    editingVersionId.value = null;

    // 5. 调用 composable 中的更新方法
    await updateVersionName(version.id, newName);

    // 6. 更新本地数据
    const idx = versions.value.findIndex((v) => v.id === version.id);
    if (idx > -1) {
      versions.value[idx].message = newName;
    }
  } catch (error) {
    console.error("更新版本名称失败:", error);
    ElMessage.error(t("version.updateNameFailed"));
    // 失败时恢复编辑状态
    editingVersionId.value = version.id;
  } finally {
    isSaving.value = false; // 🔓 释放保存锁
  }
}

onDeactivated(() => {
  clearSelection();
  // console.log("VersionTimeline unmounted, cleared selection");
  // 修复：找到完整的 version 对象进行保存
  if (editingVersionId.value) {
    const editingVersion = versions.value.find(
      (v) => v.id === editingVersionId.value
    );
    if (editingVersion) {
      saveVersionMsg(editingVersion);
    }
  }
  // 清理所有输入框引用
  inputRefs.clear();
});

defineExpose({ loadVersions });
</script>

<style lang="less" scoped>
.compare-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  animation: fadeInRight 0.2s ease-out 0.2s both;

  .compare-info {
    flex: 1;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .el-button {
    border-radius: 8px;
    margin-left: 4px;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.version-card {
  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .version-name-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 150px;
      padding: 0 30px 0 0;

      &:hover {
        border-radius: 16px;
        background-color: var(--el-fill-color-light);
      }

      .edit-icon {
        font-size: 14px;
        color: var(--el-text-color-placeholder);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .version-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--el-text-color-primary);
        cursor: text;
        border-bottom: 1px dashed transparent;
        transition: border-color 0.2s;

        &:hover {
          border-bottom-color: var(--el-border-color);
        }
      }

      .name-input {
        width: 200px;
      }
    }

    .version-no {
      margin-right: 8px;
      font-weight: 600;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
    .version-type-tag {
      font-weight: 400;
      color: var(--el-color-primary);
      font-size: 10px;
      line-height: 1.5;
      margin-left: 4px;
      padding: 2px 8px;
      border-radius: 16px;
      background-color: rgba(var(--el-color-primary-rgb), 0.1);
    }
    .active-tag {
      font-weight: 500;
      border-radius: 16px;
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 8px rgba(103, 194, 58, 0.4);
      }
    }
  }

  .version-message {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    padding-left: 2px;
  }

  .version-actions {
    display: flex;
    justify-content: space-between;

    .primary-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-button {
        padding: 4px 8px;
        font-size: 13px;
        &:hover {
          border-radius: 16px;
          background-color: var(--el-fill-color-light);
        }

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .el-dropdown {
      .el-button {
        padding: 4px 8px;
        font-size: 13px;
        color: var(--el-text-color-regular);

        &:hover {
          border-radius: 16px;
          background-color: var(--el-fill-color-light);
        }

        .el-icon {
          margin-right: 2px;
        }

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.json-editor-wrapper {
  max-height: calc(55vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
    border-radius: 4px;

    &:hover {
      background: var(--el-border-color-dark);
    }
  }
}
</style>
