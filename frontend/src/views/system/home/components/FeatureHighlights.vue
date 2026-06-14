<!--
  * 功能特色展示组件
  * 以卡片形式展示产品的核心功能亮点
-->
<template>
  <div class="feature-highlights">
    <h3>{{ t("home.features.title") }}</h3>
    <a-row :gutter="[16, 16]">
      <a-col
        :xs="12"
        :sm="12"
        :md="6"
        v-for="feature in features"
        :key="feature.id"
      >
        <div class="feature-card">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h4>{{ t(feature.titleKey) }}</h4>
          <p>{{ t(feature.descKey) }}</p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();

// 功能特色列表
const features = ref([
  {
    id: 1,
    icon: "✨",
    titleKey: "home.features.format",
    descKey: "home.features.formatDesc",
  },
  {
    id: 2,
    icon: "🔍",
    titleKey: "home.features.compare",
    descKey: "home.features.compareDesc",
  },
  {
    id: 3,
    icon: "🚀",
    titleKey: "home.features.largeFile",
    descKey: "home.features.largeFileDesc",
  },
  {
    id: 4,
    icon: "🔒",
    titleKey: "home.features.privacy",
    descKey: "home.features.privacyDesc",
  },
]);
</script>

<style scoped lang="less">
.feature-highlights {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  animation: fadeInUp 0.4s ease-out 0.4Rs both;

  h3 {
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 600;
    color: #262626;
  }

  :deep(.ant-col) {
    margin-bottom: 0;
  }
}

.feature-card {
  text-align: center;
  padding: 28px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    background: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-6px);
    border-color: var(--primary-color);
  }

  .feature-icon {
    font-size: 42px;
    margin-bottom: 16px;
    transition: transform 0.3s ease;
  }

  &:hover .feature-icon {
    transform: scale(1.2);
  }

  h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    line-height: 1.4;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #8c8c8c;
    line-height: 1.6;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .feature-highlights {
    padding: 20px;

    h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }
  }

  .feature-card {
    padding: 20px 12px;

    .feature-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }

    h4 {
      font-size: 14px;
      margin-bottom: 8px;
    }

    p {
      font-size: 12px;
    }
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .feature-card {
    padding: 24px 14px;

    .feature-icon {
      font-size: 38px;
    }

    h4 {
      font-size: 15px;
    }

    p {
      font-size: 13px;
    }
  }
}
</style>
