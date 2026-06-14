<!--
  * 通用文件导入弹框组件
  * 支持多种文件类型，根据扩展名自动路由到对应编辑器
  * 基于 text-editor-import-dialog 组件重构，保留智能文件路由功能
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('home.import.title')"
    draggable
    style="border-radius: 20px"
    width="500px"
    :footer="null"
    @close="handleClose"
  >
    <div
      class="upload-area"
      @click="triggerFileSelect"
      @dragover="handleDragOver"
      @drop="handleFileDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptExtensions"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-content">
        <ImportOutlined style="font-size: 48px" />
        <div class="upload-text">
          <div class="upload-title">{{ t("home.import.dragText") }}</div>
          <div class="upload-hint">{{ t("home.import.hint") }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ImportOutlined } from "@ant-design/icons-vue";
import { useFileRouter } from "../composables/useFileRouter";
import { ElMessage } from "element-plus";

const { t } = useI18n();
const { routeFile } = useFileRouter();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible"]);

const fileInputRef = ref(null);
const fileList = ref([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

// 支持的文件扩展名
const acceptExtensions =
  ".json,.js,.jsx,.ts,.tsx,.py,.java,.go,.yaml,.yml,.xml,.xsl,.xsd,.svg,.toml,.sh,.bash,.zsh,.md,.markdown,.sql,.conf,.ini,.properties,.txt,.dockerfile";

/**
 * 处理文件选择
 */
function handleFileSelect(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    handleFileImport(file);
  }
  event.target.value = "";
}

/**
 * 处理文件拖放
 */
function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    const file = files[0];
    handleFileImport(file);
  }
}

/**
 * 处理拖拽悬停
 */
function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * 触发文件选择器
 */
function triggerFileSelect() {
  fileInputRef.value?.click();
}

/**
 * 处理文件导入核心逻辑
 * @param {File} file - 要导入的文件对象
 */
function handleFileImport(file) {
  routeFile(file)
    .then(() => {
      emit("update:visible", false);
    })
    .catch((err) => {
      ElMessage.error(err.message || t("home.import.failed"));
    });
}

/**
 * 处理对话框关闭
 */
function handleClose() {
  fileList.value = [];
}
</script>

<style lang="less" scoped>
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: var(--primary-light-3);
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .anticon {
    color: var(--primary-color);
  }
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color);
}

.upload-hint {
  font-size: 14px;
  color: #999;
}
</style>
