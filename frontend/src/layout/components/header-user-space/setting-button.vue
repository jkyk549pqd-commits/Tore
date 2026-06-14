<!--
  * 按钮配置模块
-->
<template>
  <div class="button-config-container">
    <div class="button-list">
      <div
        v-for="(btn, index) in buttonConfigList"
        :key="btn.id"
        class="button-item"
        :class="{
          dragging: index === draggedIndex,
          'drag-over':
            index === dragOverIndex && dragOverIndex !== draggedIndex,
        }"
        :draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event, index)"
        @dragend="handleDragEnd($event)"
        @drop="handleDrop($event, index)"
      >
        <div class="button-drag-handle">
          <menu-outlined />
        </div>
        <div class="button-info">
          <span class="button-label">{{ $t(`setting.button.${btn.id}`) }}</span>
          <a-switch
            size="small"
            v-model:checked="btn.visible"
            @change="updateButtonConfig"
            :checked-children="$t('setting.bread.show')"
            :un-checked-children="$t('setting.bread.hide')"
          />
        </div>
        <div class="button-order">
          <span>{{ btn.order }}</span>
        </div>
      </div>
    </div>
    <div class="button-config-header">
      <div class="button-config-title">
        {{ $t("setting.button.title") }}
      </div>
      <el-tooltip
        :content="$t('setting.button.reset')"
        effect="light"
        placement="bottom"
        :disabled="!showTooltips"
      >
        <el-button
          ref="resetButtonRef"
          class="operate-icon"
          :class="{ 'rotate-animation': isRotating }"
          size="small"
          circle
          type="primary"
          @click="handleResetButtonClick"
        >
          <template #icon><SyncOutlined /></template>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { socketClient } from "/@/utils/socket-client";
import { MenuOutlined } from "@ant-design/icons-vue";
import { SyncOutlined } from "@ant-design/icons-vue";

const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 按钮配置列表（用于UI显示和拖拽）
const buttonConfigList = ref([
  { id: "import", visible: true, order: 1 },
  { id: "export", visible: true, order: 2 },
  { id: "copy", visible: true, order: 3 },
  { id: "paste", visible: true, order: 4 },
  { id: "demo", visible: true, order: 5 },
  { id: "clear", visible: true, order: 6 },
  { id: "format", visible: true, order: 7 },
  { id: "compress", visible: true, order: 8 },
  { id: "sort", visible: true, order: 9 },
  { id: "addEscape", visible: true, order: 10 },
  { id: "removeEscape", visible: true, order: 11 },
]);

// 初始化按钮配置（从 store 读取）
function initButtonConfig() {
  if (appConfigStore.jsonEditorButtons) {
    const storeConfig = appConfigStore.jsonEditorButtons;
    buttonConfigList.value.forEach((btn) => {
      if (storeConfig[btn.id]) {
        btn.visible = storeConfig[btn.id].visible;
        btn.order = storeConfig[btn.id].order;
      }
    });
    // 按顺序排序
    buttonConfigList.value.sort((a, b) => a.order - b.order);
  }
}

// 在组件显示时初始化按钮配置
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initButtonConfig();
      // 重置动画状态,防止组件激活时触发动画
      isRotating.value = false;
    }
  }
);

// 更新按钮配置到数据库和 store
async function updateButtonConfig() {
  // 更新顺序
  buttonConfigList.value.forEach((btn, index) => {
    btn.order = index + 1;
  });

  // 构建批量更新配置对象（每个按钮单独一条记录）
  const configMap = {};
  buttonConfigList.value.forEach((btn) => {
    // 每个按钮的配置：{"visible":true,"order":1}
    configMap[`btn_${btn.id}`] = JSON.stringify({
      visible: btn.visible,
      order: btn.order,
    });
  });

  try {
    // 批量保存到数据库（type=2）
    const updResult = await socketClient.invoke(
      "controller/system/updateBatchConf",
      configMap
    );
    console.log("按钮配置已保存到数据库:", updResult);

    // 同步到 store
    const storeConfig = {};
    buttonConfigList.value.forEach((btn) => {
      storeConfig[btn.id] = {
        visible: btn.visible,
        order: btn.order,
      };
    });
    appConfigStore.updateConfig({
      jsonEditorButtons: storeConfig,
    });
  } catch (error) {
    console.error("保存按钮配置失败:", error);
  }
}

// 拖拽相关
let draggedIndex = null;
const dragOverIndex = ref(-1);

function handleDragStart(event, index) {
  draggedIndex = index;
  event.dataTransfer.effectAllowed = "move";
  // 延迟添加拖拽中的样式，让拖拽图标先显示
  setTimeout(() => {
    event.target.classList.add("dragging");
  }, 0);
}

function handleDragOver(event, index) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dragOverIndex.value = index;
}

function handleDragEnd(event) {
  event.target.classList.remove("dragging");
  draggedIndex = null;
  dragOverIndex.value = -1;
}

function handleDrop(event, dropIndex) {
  event.preventDefault();
  event.target.classList.remove("dragging");
  if (draggedIndex === null || draggedIndex === dropIndex) {
    draggedIndex = null;
    dragOverIndex.value = -1;
    return;
  }

  const draggedItem = buttonConfigList.value[draggedIndex];
  buttonConfigList.value.splice(draggedIndex, 1);
  buttonConfigList.value.splice(dropIndex, 0, draggedItem);

  updateButtonConfig();
  draggedIndex = null;
  dragOverIndex.value = -1;
}

// 重置按钮引用
const resetButtonRef = ref(null);
// 控制旋转动画的状态
const isRotating = ref(false);

// 处理重置按钮点击
async function handleResetButtonClick() {
  // 触发旋转动画
  isRotating.value = true;

  // 动画完成后重置状态
  setTimeout(() => {
    isRotating.value = false;
  }, 1000);

  // 执行重置操作
  await resetButtonConfig();
}

// 重置按钮配置
async function resetButtonConfig() {
  buttonConfigList.value = [
    { id: "import", visible: true, order: 1 },
    { id: "export", visible: true, order: 2 },
    { id: "copy", visible: true, order: 3 },
    { id: "paste", visible: true, order: 4 },
    { id: "demo", visible: true, order: 5 },
    { id: "clear", visible: true, order: 6 },
    { id: "format", visible: true, order: 7 },
    { id: "compress", visible: true, order: 8 },
    { id: "sort", visible: true, order: 9 },
    { id: "addEscape", visible: true, order: 10 },
    { id: "removeEscape", visible: true, order: 11 },
  ];
  await updateButtonConfig();
}
</script>

<style lang="less" scoped>
.button-config-container {
  .button-config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 10px;

    .button-config-title {
      font-size: 12px;
      font-weight: 300;
      color: var(--el-text-color-primary, #333);
    }

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    .operate-icon {
      width: 24px;
      height: 24px;
      border: none;
      transform-origin: center center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .operate-icon.rotate-animation {
      animation: rotate 1s forwards;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }

  .button-list {
    .button-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      margin-bottom: 6px;
      background: var(--el-fill-color-lighter, #f5f5f5);
      border-radius: 16px;
      cursor: move;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--el-border-color-lighter, #e8e8e8);

      &:hover {
        background: var(--el-fill-color, #e8e8e8);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        cursor: grabbing;
      }

      // 拖拽中的样式：高亮、放大
      &.dragging {
        transform: scale(1.05);
        background: var(--el-color-primary-light-9, rgba(64, 158, 255, 0.1));
        border-color: var(--el-color-primary, #409eff);
        box-shadow: 0 8px 24px
          var(--el-color-primary-light-3, rgba(64, 158, 255, 0.25));
        opacity: 0.9;
        z-index: 10;
      }

      // 拖拽经过的样式：准备接收
      &.drag-over {
        transform: scale(1.02);
        background: var(--el-color-primary-light-8, rgba(64, 158, 255, 0.15));
        border-color: var(--el-color-primary-light-3, rgba(64, 158, 255, 0.4));
        border-style: dashed;
      }

      .button-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-right: 12px;
        color: var(--el-text-color-secondary, #999);
        cursor: grab;
      }

      .button-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .button-label {
          font-size: 14px;
          color: var(--el-text-color-primary, #333);
        }
      }

      .button-order {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: 12px;
        background: var(--el-bg-color, #fff);
        border: 1px solid var(--el-border-color, #dcdfe6);
        border-radius: 50%;
        font-size: 12px;
        color: var(--el-text-color-secondary, #666);
        font-weight: 500;
      }
    }
  }
}
</style>
