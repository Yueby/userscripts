<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../api/item-edit';
import { ConfigStorage } from '../../features/item-edit/modules/ConfigStorage';

const props = defineProps<{
  api: ItemEditAPI;
  itemId: string;
}>();

const storage = ConfigStorage.getInstance();

// 表单数据
const name = ref('');
const description = ref('');
const sections = ref<{ headline: string; body: string }[]>([]);
const variations = ref<{ name: string; price: string }[]>([]);

// 状态标志，防止循环更新
let isUpdatingFromPage = false;
let isUpdatingFromWindow = false;

// === 初始化加载 ===
const loadFromPage = () => {
  isUpdatingFromPage = true;
  name.value = props.api.name;
  description.value = props.api.description;
  
  sections.value = props.api.sections.map(s => ({
    headline: s.headlineInput?.value || '',
    body: s.bodyTextarea?.value || ''
  }));
  
  variations.value = props.api.variations.map(v => ({
    name: v.nameInput?.value || '',
    price: v.priceInput?.value || ''
  }));
  
  isUpdatingFromPage = false;
};

// === 监听 Vue 数据变化 -> 更新页面 ===
watch(name, (val) => {
  if (isUpdatingFromPage) return;
  isUpdatingFromWindow = true;
  props.api.setName(val);
  storage.updateItemConfig(props.itemId, { name: val });
  isUpdatingFromWindow = false;
});

watch(description, (val) => {
  if (isUpdatingFromPage) return;
  isUpdatingFromWindow = true;
  props.api.setDescription(val);
  storage.updateItemConfig(props.itemId, { description: val });
  isUpdatingFromWindow = false;
});

watch(sections, (val) => {
  if (isUpdatingFromPage) return;
  isUpdatingFromWindow = true;
  val.forEach((section, index) => {
    props.api.updateSection(index, section);
  });
  storage.updateItemConfig(props.itemId, { sections: val });
  isUpdatingFromWindow = false;
}, { deep: true });

watch(variations, (val) => {
  if (isUpdatingFromPage) return;
  isUpdatingFromWindow = true;
  val.forEach((variation, index) => {
    props.api.updateVariation(index, variation);
  });
  storage.updateItemConfig(props.itemId, { variations: val });
  isUpdatingFromWindow = false;
}, { deep: true });

// === 监听页面 API 事件 -> 更新 Vue ===
onMounted(() => {
  loadFromPage();

  props.api.onNameChange((val) => {
    if (isUpdatingFromWindow) return;
    isUpdatingFromPage = true;
    name.value = val;
    isUpdatingFromPage = false;
  });

  props.api.onDescriptionChange((val) => {
    if (isUpdatingFromWindow) return;
    isUpdatingFromPage = true;
    description.value = val;
    isUpdatingFromPage = false;
  });

  props.api.onSectionsChange(() => {
    if (isUpdatingFromWindow) return;
    isUpdatingFromPage = true;
    sections.value = props.api.sections.map(s => ({
      headline: s.headlineInput?.value || '',
      body: s.bodyTextarea?.value || ''
    }));
    isUpdatingFromPage = false;
  });

  props.api.onVariationsChange(() => {
    if (isUpdatingFromWindow) return;
    isUpdatingFromPage = true;
    variations.value = props.api.variations.map(v => ({
      name: v.nameInput?.value || '',
      price: v.priceInput?.value || ''
    }));
    isUpdatingFromPage = false;
  });
});
</script>

<template>
  <div class="item-edit-tab">
    <div class="form-group">
      <label>商品名称</label>
      <input type="text" v-model="name" class="full-width" />
    </div>

    <div class="form-group">
      <label>商品描述</label>
      <textarea v-model="description" class="full-width description-area"></textarea>
    </div>

    <div class="section-list">
      <h3>Section 列表 ({{ sections.length }})</h3>
      <div v-for="(section, index) in sections" :key="index" class="list-item">
        <div class="item-header">Section {{ index + 1 }}</div>
        <input 
          type="text" 
          v-model="section.headline" 
          placeholder="标题" 
          class="full-width mb-2"
        />
        <textarea 
          v-model="section.body" 
          placeholder="正文"
          class="full-width body-area"
        ></textarea>
      </div>
    </div>

    <div class="variation-list">
      <h3>变体列表 ({{ variations.length }})</h3>
      <div v-for="(variation, index) in variations" :key="index" class="list-item flex-row">
        <span class="index">{{ index + 1 }}</span>
        <input 
          type="text" 
          v-model="variation.name" 
          placeholder="变体名称"
          class="flex-1"
        />
        <input 
          type="text" 
          v-model="variation.price" 
          placeholder="价格"
          class="price-input"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-edit-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  font-size: 14px;
  color: #334155;
}

.full-width {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.description-area {
  min-height: 120px;
  resize: vertical;
}

.body-area {
  min-height: 80px;
  resize: vertical;
}

h3 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.list-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.item-header {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 8px;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.index {
  font-weight: bold;
  color: #94a3b8;
  width: 20px;
}

.flex-1 {
  flex: 1;
}

.price-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}
</style>
