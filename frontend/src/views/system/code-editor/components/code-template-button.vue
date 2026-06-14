<template>
  <div class="code-template-dropdown">
    <el-dropdown
      @command="handleTemplateSelect"
      trigger="click"
      placement="bottom"
    >
      <el-button type="primary" size="small" :icon="MagicStick">
        {{ t("codeEditor.generateCode") || "生成代码" }}
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="option in templateOptions"
            :key="option.value"
            :command="option.value"
          >
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { MagicStick, ArrowDown } from "@element-plus/icons-vue";
import { useCodeGenerator } from "../composables/useCodeGenerator";

const props = defineProps({
  currentLanguage: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["codeGenerated"]);

const { t } = useI18n();
const { getTemplateOptions, generateCode } = useCodeGenerator();

/**
 * 获取当前语言的模板选项
 */
const templateOptions = computed(() => {
  return getTemplateOptions(props.currentLanguage);
});

/**
 * 处理模板选择
 * @param {string} templateKey - 模板键名
 */
function handleTemplateSelect(templateKey) {
  try {
    const code = generateCode(props.currentLanguage, templateKey);
    emit("codeGenerated", code);
  } catch (error) {
    console.error("生成代码失败:", error);
  }
}
</script>

<style lang="less" scoped>
.code-template-dropdown {
  display: inline-block;
}

.el-dropdown {
  .el-button {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
