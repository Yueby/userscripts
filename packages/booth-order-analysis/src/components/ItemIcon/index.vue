<template>
  <div class="item-icon-container">
    <img 
      v-if="!props.privacyMode && iconUrl" 
      :src="iconUrl" 
      :alt="alt" 
      @error="onImageError"
      class="item-icon"
    />
    <div v-else class="privacy-icon">
      <svg :width="iconSize" :height="iconSize" viewBox="0 0 16 16" fill="none">
        <rect width="16" height="16" rx="2" fill="#f3f4f6"/>
        <path d="M8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 7.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#9ca3af"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { ItemManager } from '../../utils/booth/item-manager';

interface Props {
  itemId?: string;
  items?: any[];
  size?: string;
  alt?: string;
  privacyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '32px',
  alt: '商品图标',
  privacyMode: false
});

const iconUrl = ref<string>('');

// 计算图标尺寸
const iconSize = computed(() => {
  const size = parseInt(props.size);
  return Math.min(size, 16);
});

// 获取图标URL
const loadIcon = () => {
  if (!props.itemId && (!props.items || props.items.length === 0)) {
    iconUrl.value = '';
    return;
  }

  let targetItemId = props.itemId;
  
  if (!targetItemId && props.items && props.items.length > 0) {
    // 从商品数组中获取第一个商品的ID
    targetItemId = props.items[0].itemId;
  }

  if (targetItemId) {
    // 使用商品管理器获取图标
    const itemManager = ItemManager.getInstance();
    const iconUrlFromManager = itemManager.getItemIcon(targetItemId);
    iconUrl.value = iconUrlFromManager;
  } else {
    iconUrl.value = '';
  }
};

// 图片加载失败
const onImageError = () => {
  iconUrl.value = '';
};

// 监听属性变化
watch(() => [props.itemId, props.items], () => {
  loadIcon();
}, { deep: true });

// 组件挂载时加载图标
onMounted(() => {
  loadIcon();
});
</script>

<style scoped>
.item-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: v-bind(size);
  height: v-bind(size);
  border-radius: 4px;
  overflow: hidden;
  background: #f3f4f6;
}

.item-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.privacy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  color: #9ca3af;
}
</style> 