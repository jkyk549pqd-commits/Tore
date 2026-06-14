<template>
  <div class="button-group">
    <template v-for="btn in sortedButtons" :key="btn.id">
      <el-tooltip
        v-if="btn.visible && shouldShowButton(btn.id)"
        :content="getButtonTooltip(btn.id)"
        :placement="btn.id === 'removeEscape' ? 'left' : 'top'"
        effect="light"
        :disabled="!showTooltips"
      >
        <el-button
          :type="getButtonType(btn.id)"
          size="small"
          @click="handleButtonClick(btn.id)"
          circle
        >
          <template #icon>
            <component
              :is="getButtonIcon(btn.id)"
              v-if="['addEscape', 'removeEscape'].includes(btn.id)"
            >
              <template v-if="btn.id === 'addEscape'">
                <plus-outlined style="width: 10px; height: 10px" />
              </template>
              <template v-else>
                <minus-outlined style="width: 10px; height: 10px" />
              </template>
            </component>
            <component :is="getButtonIcon(btn.id)" v-else />
          </template>
        </el-button>
      </el-tooltip>
    </template>
  </div>
</template>

<script setup>
import { PlusOutlined, MinusOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  sortedButtons: {
    type: Array,
    required: true,
  },
  buttonDefinitions: {
    type: Object,
    required: true,
  },
  buttonStates: {
    type: Object,
    required: true,
  },
  showTooltips: {
    type: Boolean,
    default: true,
  },
  showDemo: {
    type: Boolean,
    default: false,
  },
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["button-click"]);

function shouldShowButton(buttonId) {
  const def = props.buttonDefinitions[buttonId];
  if (def && def.condition === "showDemo") {
    return props.showDemo;
  }
  return true;
}

function getButtonTooltip(buttonId) {
  const def = props.buttonDefinitions[buttonId];
  return def ? props.t(def.tooltip) : "";
}

function getButtonIcon(buttonId) {
  return props.buttonDefinitions[buttonId]?.icon;
}

function getButtonType(buttonId) {
  const def = props.buttonDefinitions[buttonId];
  if (!def) return "";

  if (def.stateKey) {
    const stateValue = props.buttonStates[def.stateKey];
    return def.reverseType
      ? stateValue
        ? ""
        : "primary"
      : stateValue
      ? "primary"
      : "";
  }

  return "primary";
}

function handleButtonClick(buttonId) {
  emit("button-click", buttonId);
}
</script>

<style lang="less" scoped>
.button-group {
  display: flex;
  gap: 2px;
  justify-content: space-between;
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
