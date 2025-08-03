<template>
  <span :class="textClass">
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** 要显示的原始值 */
  value: string | number;
  /** 是否启用遮罩 */
  masked?: boolean;
  /** 遮罩字符，默认为 "*" */
  maskChar?: string;
  /** 自定义CSS类名 */
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  masked: false,
  maskChar: '*',
  class: ''
});

const textClass = computed(() => props.class);

const displayText = computed(() => {
  if (!props.masked) {
    return String(props.value);
  }
  
  const valueStr = String(props.value);
  const length = valueStr.length;
  
  // 根据长度决定遮罩字符数量
  if (length <= 2) {
    return props.maskChar.repeat(2);
  } else if (length <= 4) {
    return props.maskChar.repeat(4);
  } else {
    return props.maskChar.repeat(6);
  }
});
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style> 