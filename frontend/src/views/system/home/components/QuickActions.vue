<!--
  * 快速入口组件
  * 提供 JSON 格式化、历史记录、文件导入等快速操作入口
-->
<template>
  <div class="quick-actions">
    <!-- JSON 格式化主按钮 -->
    <a-button
      type="primary"
      size="large"
      class="main-action-btn"
      @click="handleJsonFormat"
    >
      <template #icon>
        <CodeOutlined />
      </template>
      {{ t("home.quick.format") }}
    </a-button>

    <!-- 次要按钮组 -->
    <div class="secondary-actions">
      <a-button size="large" @click="handleJsonClipboard" class="secondary-btn">
        <template #icon>
          <FileTextOutlined />
        </template>
        {{ t("home.quick.clipboard") }}
      </a-button>
      <a-button size="large" @click="handleImport" class="secondary-btn">
        <template #icon>
          <ImportOutlined />
        </template>
        {{ t("home.quick.import") }}
      </a-button>
      <a-button size="large" @click="handleHistory" class="secondary-btn">
        <template #icon>
          <HistoryOutlined />
        </template>
        {{ t("home.quick.history") }}
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  CodeOutlined,
  HistoryOutlined,
  ImportOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import { useQuickActions } from "../composables/useQuickActions";
import { useThemeStore } from "/@/store/modules/theme";

const { t } = useI18n();
const {
  handleJsonFormat,
  handleJsonClipboard,
  handleHistory,
  handleImport,
  importDialogVisible,
} = useQuickActions();

const themeStore = useThemeStore();

// 获取当前主题色
const themeColor = computed(() => themeStore.themeColor);

// 将 importDialogVisible 暴露给父组件
defineExpose({
  importDialogVisible,
});
</script>

<style scoped lang="less">
.quick-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 60px;
  animation: fadeInUp 0.4s ease-out 0.2s both;

  .main-action-btn {
    width: 490px;
    height: 80px;
    font-size: 22px;
    font-weight: 600;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.3);
    transition: all 0.3s ease;
    background: v-bind(themeColor);
    border: none;
    color: white;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(var(--primary-rgb), 0.4);
      filter: brightness(1.1);
    }

    &:active {
      transform: translateY(-2px);
    }
  }

  .secondary-actions {
    display: flex;
    gap: 20px;

    .secondary-btn {
      width: 150px;
      height: 56px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #333;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        background: white;
        border-color: rgba(255, 255, 255, 0.5);
      }

      &:active {
        transform: translateY(-1px);
      }
    }
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .quick-actions {
    .main-action-btn {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

      &:hover {
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
      }
    }

    .secondary-actions {
      .secondary-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
      }
    }
  }
}

// 浅色模式适配
@media (prefers-color-scheme: light) {
  .quick-actions {
    .secondary-actions {
      .secondary-btn {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: #333;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

        &:hover {
          background: white;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quick-actions {
    gap: 20px;

    .main-action-btn {
      width: 100%;
      max-width: 300px;
      height: 72px;
      font-size: 20px;
    }

    .secondary-actions {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      gap: 12px;

      .secondary-btn {
        width: 100%;
        height: 48px;
        font-size: 15px;
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .quick-actions {
    .main-action-btn {
      width: 280px;
      height: 72px;
      font-size: 20px;
    }

    .secondary-actions {
      .secondary-btn {
        width: 130px;
        height: 52px;
        font-size: 15px;
      }
    }
  }
}
</style>
