<template>
  <div class="format-selector">
    <el-dropdown
      trigger="click"
      @command="handleFormatChange"
      placement="bottom-start"
    >
      <div class="format-selector-trigger">
        <img
          :src="currentIconUrl"
          class="format-icon-img"
          alt=""
          @error="handleImageError"
        />
        <span class="format-label">{{ currentLabel }}</span>
        <el-icon class="dropdown-arrow">
          <ArrowDown />
        </el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <div class="format-dropdown-header">
            <span>{{ t("textEditor.formatSelector.title") }}</span>
          </div>
          <el-dropdown-item
            v-for="format in formatOptions"
            :key="format.value"
            :command="format.value"
            class="format-dropdown-item"
            :class="{ 'is-active': format.value === modelValue }"
          >
            <img
              :src="getIconUrl(format)"
              class="format-item-icon-img"
              alt=""
              @error="handleImageError"
            />
            <div class="format-item-content">
              <span class="format-item-label">{{ format.label }}</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowDown } from "@element-plus/icons-vue";
import { SUPPORTED_FILE_FORMATS } from "../constants/file-formats";
import { getIconForFormat, DEFAULT_FILE_ICON } from "../constants/icon-mapping";

const { t } = useI18n();

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "text",
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// 获取图标 URL（使用本地 SVG 图标）
const getIconUrl = (format) => {
  const iconUrl = getIconForFormat(format.value);
  if (iconUrl) {
    return iconUrl;
  }
  // 如果找不到对应格式的图标，使用默认图标
  return DEFAULT_FILE_ICON;
};

// 获取国际化的格式配置
const getLocalizedFormat = (format) => {
  return {
    ...format,
    label: t(`textEditor.format.${format.value}`),
    description: t(`textEditor.format.${format.value}.description`),
  };
};

// 当前格式的配置
const currentFormat = computed(() => {
  const baseFormat =
    SUPPORTED_FILE_FORMATS.find((f) => f.value === props.modelValue) ||
    SUPPORTED_FILE_FORMATS[0];
  return getLocalizedFormat(baseFormat);
});

// 当前标签
const currentLabel = computed(() => currentFormat.value.label);

// 当前图标 URL
const currentIconUrl = computed(() => {
  return getIconUrl(currentFormat.value);
});

// 格式选项
const formatOptions = computed(() =>
  SUPPORTED_FILE_FORMATS.map((format) => getLocalizedFormat(format))
);

// 处理格式切换
const handleFormatChange = (format) => {
  emit("update:modelValue", format);
  emit("change", format);
};

// 处理图片加载错误
const handleImageError = (event) => {
  // 本地图标理论上不应该加载失败，但保留错误处理以防万一
  event.target.style.display = "none";
};
</script>

<style lang="less" scoped>
.format-selector {
  display: inline-block;

  :deep(.el-dropdown) {
    border-radius: 8px;
  }

  .format-selector-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--el-text-color-primary);

    &:hover {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    .format-icon-img {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    .format-label {
      font-size: 14px;
      font-weight: 500;
    }

    .dropdown-arrow {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.format-dropdown-header {
  padding: 8px 32px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px;
}

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  padding: 8px 0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--el-text-color-primary);

  &.is-active {
    border-radius: 16px;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &:hover {
    border-radius: 8px;
    background-color: var(--el-fill-color-light);
  }

  .format-item-icon-img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
    margin: 0 1px;
  }

  .format-item-content {
    display: flex;
    flex-direction: column;
    margin: 0 1px;

    .format-item-label {
      font-size: 14px;
      font-weight: 500;
    }

    .format-item-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

// 深色模式适配
[data-theme="dark"] {
  .format-selector {
    .format-selector-trigger {
      background: var(--el-fill-color-dark);
      color: var(--el-text-color-primary);

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      .dropdown-arrow {
        color: var(--el-text-color-secondary);
      }
    }
  }

  .format-dropdown-header {
    color: var(--el-text-color-primary);
    border-bottom-color: var(--el-border-color-lighter);
  }

  :deep(.el-dropdown-menu__item) {
    color: var(--el-text-color-primary);

    &.is-active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &:hover {
      background-color: var(--el-fill-color-dark);
    }

    .format-item-content {
      .format-item-desc {
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
