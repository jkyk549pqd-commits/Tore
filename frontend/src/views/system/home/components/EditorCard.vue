<!--
  * 编辑器入口卡片组件
  * 展示单个编辑器类型的入口，包含图标、描述和快捷操作
-->
<template>
  <div
    class="editor-card"
    :class="{ 'dark-mode': isDarkMode, 'simple-mode': simpleMode }"
    @click="$emit('click')"
  >
    <div class="card-header" :class="{ centered: simpleMode }">
      <div class="card-icon" :style="{ background: iconBg }">
        <component :is="icon" />
      </div>
      <div class="card-title-area">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-desc" v-if="description">{{ description }}</p>
      </div>
    </div>
    <div class="card-actions" v-if="actions && actions.length > 0" @click.stop>
      <a-button
        v-for="action in actions"
        :key="action.key"
        size="small"
        class="card-action-btn"
        @click="$emit('action', action.key)"
      >
        {{ action.label }}
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "/@/store/modules/theme";

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  iconBg: { type: String, default: "var(--primary-light)" },
  actions: { type: Array, default: () => [] },
  simpleMode: { type: Boolean, default: false },
});

defineEmits(["click", "action"]);

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDark);
</script>

<style scoped lang="less">
.editor-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-light-3);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .card-title-area {
      flex: 1;
      min-width: 0;

      .card-title {
        margin: 0 0 4px 0;
        font-size: 17px;
        font-weight: 600;
        color: #262626;
      }

      .card-desc {
        margin: 0;
        font-size: 13px;
        color: #8c8c8c;
        line-height: 1.4;
      }
    }

    // 简单模式居中布局
    &.centered {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 16px;

      .card-icon {
        width: 56px;
        height: 56px;
        font-size: 28px;
      }

      .card-title-area {
        text-align: center;

        .card-title {
          font-size: 18px;
          margin-bottom: 0;
        }
      }
    }
  }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .card-action-btn {
      border-radius: 16px;
      font-size: 12px;
      height: 28px;
      padding: 0 10px;
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      color: #595959;
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-lighter);
        border-color: var(--primary-light-5);
        color: var(--primary-color);
      }
    }
  }
}

// 深色模式
.editor-card.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-color: var(--primary-light-3);
  }

  .card-header {
    .card-title-area {
      .card-title {
        color: rgba(255, 255, 255, 0.95);
      }

      .card-desc {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .card-actions {
    .card-action-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: var(--primary-hover);
        border-color: var(--primary-light-3);
        color: var(--primary-light-8);
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .editor-card {
    padding: 18px;

    .card-header {
      .card-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      .card-title-area {
        .card-title {
          font-size: 15px;
        }

        .card-desc {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
