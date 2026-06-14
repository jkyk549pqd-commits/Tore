<template>
  <div class="editor-config-panel">
    <el-row :gutter="12">
      <!-- 左侧区域: 基础配置 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-row :gutter="8">
          <el-col :xs="12" :sm="8">
            <el-space :size="4" wrap>
              <span class="config-label">{{ $t("json.code.theme") }}:</span>
              <el-select
                size="small"
                style="width: 100%; min-width: 80px; max-width: 120px"
                :model-value="cmTheme"
                @update:model-value="$emit('update:cmTheme', $event)"
                popper-class="theme-select-dropdown"
              >
                <el-option
                  v-for="item in themeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-space>
          </el-col>
          <el-col :xs="12" :sm="10">
            <el-space :size="4" wrap>
              <span class="config-label">{{ $t("json.code.fontSize") }}:</span>
              <el-input-number
                size="small"
                :model-value="cmFontSize"
                @update:model-value="$emit('update:cmFontSize', $event)"
                :min="10"
                :max="30"
                style="width: 100px"
              />
            </el-space>
          </el-col>
        </el-row>
      </el-col>

      <!-- 右侧区域: 开关配置 -->
      <el-col :xs="24" :sm="8" :md="12" :offset="4">
        <el-row :gutter="8" justify="end">
          <el-col :xs="12" :sm="6" class="switch-col">
            <el-space :size="4" wrap>
              <span class="config-label">{{ $t("json.code.lineNum") }}:</span>
              <el-switch
                size="small"
                :model-value="cmLineNumbers"
                @update:model-value="$emit('update:cmLineNumbers', $event)"
              />
            </el-space>
          </el-col>
          <el-col :xs="12" :sm="6" class="switch-col">
            <el-space :size="4" wrap>
              <span class="config-label">{{ $t("json.code.lineSplit") }}:</span>
              <el-switch
                size="small"
                :model-value="cmLineWrapping"
                @update:model-value="$emit('update:cmLineWrapping', $event)"
              />
            </el-space>
          </el-col>
          <el-col v-if="showReadOnly" :xs="12" :sm="6" class="switch-col">
            <el-space :size="4" wrap>
              <span class="config-label">{{ $t("json.code.readOnly") }}:</span>
              <el-switch
                size="small"
                :model-value="cmReadOnly"
                @update:model-value="$emit('update:cmReadOnly', $event)"
              />
            </el-space>
          </el-col>
          <el-col v-if="showDemoButton" :xs="12" :sm="6" class="switch-col">
            <el-space :size="4" wrap>
              <span class="config-label"
                >{{ $t("json.code.showDemoBtn") }}:</span
              >
              <el-switch
                size="small"
                :model-value="showDemo"
                @update:model-value="$emit('update:showDemo', $event)"
              />
            </el-space>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
defineProps({
  cmTheme: {
    type: String,
    default: "",
  },
  cmFontSize: {
    type: Number,
    default: 14,
  },
  cmLineWrapping: {
    type: Boolean,
    default: true,
  },
  cmLineNumbers: {
    type: Boolean,
    default: true,
  },
  cmReadOnly: {
    type: Boolean,
    default: false,
  },
  showDemo: {
    type: Boolean,
    default: true,
  },
  showReadOnly: {
    type: Boolean,
    default: true,
  },
  showDemoButton: {
    type: Boolean,
    default: true,
  },
  themeOptions: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  "update:cmTheme",
  "update:cmFontSize",
  "update:cmLineWrapping",
  "update:cmLineNumbers",
  "update:cmReadOnly",
  "update:showDemo",
]);
</script>

<style lang="less" scoped>
.editor-config-panel {
  padding: 12px 20px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);

  @media (max-width: 768px) {
    padding: 8px 12px;
  }

  .config-label {
    font-size: 13px;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 12px;
    }
  }

  .switch-col {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    @media (max-width: 768px) {
      justify-content: flex-start;
    }
  }

  // 为配置项添加交互动画效果
  .el-select,
  .el-input-number,
  .el-switch {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:focus {
      transform: scale(1.03);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
