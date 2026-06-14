<template>
  <div class="button-group">
    <el-tooltip
      :content="t('json.card.importBtn')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.import ? 'primary' : ''"
        size="small"
        @click="handleImport"
        circle
      >
        <template #icon>
          <ImportOutlined />
        </template>
      </el-button>
    </el-tooltip>

    <el-tooltip
      :content="t('json.card.exportBtn')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.import ? '' : 'primary'"
        size="small"
        @click="handleExport"
        circle
      >
        <template #icon>
          <ExportOutlined />
        </template>
      </el-button>
    </el-tooltip>

    <el-tooltip
      :content="t('textEditor.copyBtn')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.copy ? 'primary' : ''"
        size="small"
        @click="handleCopy"
        circle
      >
        <template #icon>
          <CopyDocument />
        </template>
      </el-button>
    </el-tooltip>

    <el-tooltip
      :content="t('textEditor.pasteBtn')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.copy ? '' : 'primary'"
        size="small"
        @click="handlePaste"
        circle
      >
        <template #icon>
          <Document />
        </template>
      </el-button>
    </el-tooltip>

    <el-tooltip
      :content="t('tool.btn.demo')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.delete ? '' : 'primary'"
        size="small"
        @click="handleDemo"
        circle
      >
        <template #icon>
          <CompassOutlined />
        </template>
      </el-button>
    </el-tooltip>
    <el-tooltip
      :content="t('tool.btn.clear')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.delete ? 'primary' : ''"
        size="small"
        @click="handleClear"
        circle
      >
        <template #icon>
          <DeleteOutlined />
        </template>
      </el-button>
    </el-tooltip>

    <!-- 格式化按钮 - 仅对支持的格式显示 -->
    <el-tooltip
      v-if="showFormatButtons"
      :content="t('tool.btn.format')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.format ? 'primary' : ''"
        size="small"
        @click="handleFormat"
        circle
      >
        <template #icon>
          <ZoomInOutlined />
        </template>
      </el-button>
    </el-tooltip>

    <!-- 压缩按钮 - 仅对支持的格式显示 -->
    <el-tooltip
      v-if="showFormatButtons"
      :content="t('tool.btn.compress')"
      placement="top"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :type="buttonStates.format ? '' : 'primary'"
        size="small"
        @click="handleCompress"
        circle
      >
        <template #icon>
          <ZoomOutOutlined />
        </template>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { CopyDocument, Document } from "@element-plus/icons-vue";
import {
  ImportOutlined,
  ExportOutlined,
  CompassOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons-vue";

const props = defineProps({
  buttonStates: {
    type: Object,
    required: true,
  },
  showTooltips: {
    type: Boolean,
    default: true,
  },
  t: {
    type: Function,
    required: true,
  },
  showFormatButtons: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "copy",
  "paste",
  "import",
  "export",
  "demo",
  "clear",
  "format",
  "compress",
]);

function handleCopy() {
  emit("copy");
}

function handlePaste() {
  emit("paste");
}

function handleImport() {
  emit("import");
}

function handleExport() {
  emit("export");
}

function handleDemo() {
  emit("demo");
}

function handleClear() {
  emit("clear");
}

function handleFormat() {
  emit("format");
}

function handleCompress() {
  emit("compress");
}
</script>

<style lang="less" scoped>
.button-group {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  animation: fadeInRight 0.4s ease-out 0.3s both;

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

  .el-button {
    margin-left: 0px;
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

.el-button.is-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  .el-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    width: 12px;
    height: 12px;
  }
}
</style>
