<!--
  * 品牌展示区组件
  * 展示产品 Logo、名称、Slogan 和版本信息
-->
<template>
  <div
    class="brand-section"
    :class="{ compact: props.compact, 'dark-mode': isDarkMode }"
  >
    <div class="brand-logo" v-if="showLogo">
      <img
        src="/@/assets/images/logo/logo.png"
        alt="Logo"
        @error="handleImageError"
      />
    </div>
    <div class="brand-info">
      <h1 class="brand-title">{{ t("home.brand.title") }}</h1>
      <p class="brand-slogan" v-if="!props.compact && !props.simple">
        {{ t("home.brand.slogan") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "/@/store/modules/theme";

const { t } = useI18n();

const themeStore = useThemeStore();

// Props
const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
  simple: {
    type: Boolean,
    default: false,
  },
});

// 版本信息从 package.json 获取
const version = "4.1.0";

// 控制Logo显示
const showLogo = ref(true);

// 判断是否为深色模式
const isDarkMode = computed(() => themeStore.isDark);

// 处理图片加载错误
function handleImageError(event) {
  // 如果图片加载失败，隐藏Logo区域
  showLogo.value = false;
}
</script>

<style scoped lang="less">
.brand-section {
  text-align: center;
  margin-bottom: 100px;
  animation: fadeInDown 0.4s ease-out;
  transition: all 0.3s ease;

  // 紧凑模式
  &.compact {
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;

    .brand-logo {
      display: block;

      img {
        width: 80px;
        height: 80px;
        margin-bottom: 0;
      }
    }

    .brand-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 0;
    }

    .brand-slogan {
      display: none;
    }
  }

  .brand-logo {
    img {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 10px 0;
  }

  .brand-slogan {
    font-size: 18px;
    margin: 0 0 15px 0;
    font-weight: 300;
  }

  .brand-version {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }

  // 深色模式样式
  &.dark-mode {
    .brand-title {
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .brand-slogan {
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    .brand-version {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .brand-section {
    .brand-logo {
      img {
        width: 60px;
        height: 60px;
        margin-bottom: 15px;
      }
    }

    .brand-title {
      font-size: 28px;
    }

    .brand-slogan {
      font-size: 16px;
    }

    .brand-version {
      font-size: 12px;
      padding: 4px 12px;
    }
  }
}

// 主题适配
@media (prefers-color-scheme: dark) {
  .brand-section {
    .brand-title {
      color: rgba(255, 255, 255, 0.95);
    }

    .brand-slogan {
      color: rgba(255, 255, 255, 0.75);
    }

    .brand-version {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
}

@media (prefers-color-scheme: light) {
  .brand-section {
    .brand-title {
      color: #262626;
    }

    .brand-slogan {
      color: #8c8c8c;
    }

    .brand-version {
      background: #f5f5f5;
      color: #595959;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
