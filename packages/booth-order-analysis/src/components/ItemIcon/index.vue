<template>
  <div class="item-icon-container">
    <img 
      v-if="iconUrl" 
      :src="iconUrl" 
      :alt="alt" 
      @error="onImageError"
      class="item-icon"
    />
    <div v-else class="default-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zM8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
        <path d="M8 4c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1zM8 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="currentColor"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ItemManager } from '../../utils/booth/item-manager';

interface Props {
  itemId?: string;
  items?: any[];
  size?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: '32px',
  alt: '商品图标'
});

const iconUrl = ref<string>('');

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

.default-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f9fafb;
  color: #6b7280;
}
</style> 