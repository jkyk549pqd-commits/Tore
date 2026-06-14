<template>
  <el-button
    class="btn-compare"
    v-if="visible"
    type="primary"
    size="small"
    @click="handleCompare"
  >
    <template #icon
      ><el-icon><DocumentCopy /></el-icon
    ></template>
    {{ $t("json.btn.diff") }}
  </el-button>
</template>

<script setup>
import { DocumentCopy } from "@element-plus/icons-vue";

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["compare"]);

const handleCompare = () => {
  emit("compare");
};
</script>

<style lang="less" scoped>
.btn-compare {
  position: fixed;
  top: 50%;
  right: 50px;
  transform: translateY(-50%);
  z-index: 99;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  animation: fadeInRight 0.4s ease-out 0.35s both;
  will-change: transform, opacity;

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
}
</style>
