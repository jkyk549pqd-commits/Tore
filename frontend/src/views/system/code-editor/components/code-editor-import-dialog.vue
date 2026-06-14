<template>
  <el-dialog
    draggable
    v-model="dialogVisible"
    :title="t('codeEditor.card.importDialogTitle')"
    style="border-radius: 20px"
    width="500px"
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
        accept="text/*"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-content">
        <ImportOutlined style="font-size: 48px" />
        <div class="upload-text">
          <div class="upload-title">{{ t("json.card.uploadTitle") }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:visible", "file-selected", "close"]);
const fileInputRef = ref(null);
const fileList = ref([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

function handleFileSelect(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    emit("file-selected", file);
  }
  event.target.value = "";
}

function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    const file = files[0];
    emit("file-selected", file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function handleClose() {
  fileList.value = [];
  emit("close");
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
    border-color: #1890ff;
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  .anticon {
    color: @primary-color;
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
  color: #333;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}
</style>
