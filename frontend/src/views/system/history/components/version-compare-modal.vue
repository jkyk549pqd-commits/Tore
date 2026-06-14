<!--
  * 版本对比弹窗组件
  * 复用 v-code-diff 展示两个版本的 side-by-side diff
-->
<template>
  <el-dialog
    v-model="visible"
    :title="t('version.compareTitle')"
    style="width: 60vw; border-radius: 16px"
    top="5vh"
    draggable
    :destroy-on-close="true"
    append-to-body
  >
    <div class="compare-header">
      <div class="compare-label">
        <el-tag type="info" size="small">
          {{ t("version.olderVersion") }} -
          {{ t("version.no", { no: oldVersion?.version_no }) }}
        </el-tag>
        <span class="compare-time">{{ oldVersion?.crt_time }}</span>
      </div>
      <div class="compare-label">
        <el-tag type="primary" size="small">
          {{ t("version.newerVersion") }} -
          {{ t("version.no", { no: newVersion?.version_no }) }}
        </el-tag>
        <span class="compare-time">{{ newVersion?.crt_time }}</span>
      </div>
    </div>
    <div class="diff-container">
      <CodeDiff
        :old-string="formatContent(oldVersion?.content)"
        :new-string="formatContent(newVersion?.content)"
        :language="diffLanguage"
        diffStyle="word"
        output-format="side-by-side"
        :theme="diffTheme"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { CodeDiff } from "v-code-diff";
import { useThemeStore } from "/@/store/modules/theme";

const { t } = useI18n();
const themeStore = useThemeStore();

const visible = defineModel("visible", { type: Boolean, default: false });

const props = defineProps({
  oldVersion: { type: Object, default: null },
  newVersion: { type: Object, default: null },
  logType: { type: String, default: "JSON" },
});

const diffTheme = computed(() =>
  themeStore.currentTheme === "light" ? "light" : "dark"
);

const diffLanguage = computed(() => {
  const type = props.logType?.toUpperCase();
  if (type === "JSON") return "json";
  if (type === "YAML") return "yaml";
  if (type === "XML") return "xml";
  return "text";
});

function formatContent(content) {
  if (!content) return "";
  if (props.logType?.toUpperCase() === "JSON") {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  }
  return content;
}
</script>

<style lang="less" scoped>
.compare-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;

  .compare-label {
    display: flex;
    align-items: center;
    gap: 8px;

    .compare-time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.diff-container {
  max-height: 70vh;
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
</style>
