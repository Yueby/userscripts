<script setup lang="ts">
import { computed } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedNameTemplate } from '../../../../config-types';
import { parseTemplate } from '../../../../utils/templateParser';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  totalSupport: number;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

// 模板变量
const templateVars = computed(() => ({
  itemName: props.itemConfig.itemName,
  supportCount: props.totalSupport
}));

// 获取选中的模板内容
const selectedTemplate = computed(() => 
  getSelectedNameTemplate(props.globalTemplates, props.itemConfig)
);

// 预览最终商品名
const previewName = computed(() => 
  parseTemplate(selectedTemplate.value, templateVars.value)
);

// 更新当前选中的模板内容
function updateCurrentTemplate(event: Event): void {
  if (!props.globalTemplates.nameTemplates || !props.itemConfig.selectedTemplates) return;
  
  const target = event.target as HTMLInputElement;
  const template = props.globalTemplates.nameTemplates.find(
    t => t.id === props.itemConfig.selectedTemplates.nameTemplateId
  );
  if (template) {
    template.template = target.value;
  }
}

// 保存并关闭
function handleSave(): void {
  emit('save');
  emit('close');
}
</script>

<template>
  <Modal
    :show="show"
    title="编辑商品名"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
    width="500px"
  >
    <div class="modal-content">
      <div class="form-group">
        <label>商品基础名称</label>
        <input v-model="itemConfig.itemName" type="text" 
          placeholder="输入商品名称" />
      </div>

      <div class="form-group">
        <label>商品类型</label>
        <select v-model="itemConfig.itemType">
          <option value="normal">普通商品</option>
          <option value="adaptation">适配商品</option>
        </select>
      </div>

      <div class="form-group" v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0">
        <label>选择模板</label>
        <select v-model="itemConfig.selectedTemplates.nameTemplateId">
          <option v-for="template in globalTemplates.nameTemplates" :key="template.id" :value="template.id">
            {{ template.name }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0">
        <label>模板内容 <span class="label-hint">(编辑当前选中模板)</span></label>
        <p class="form-hint">支持变量: {itemName}, {supportCount}</p>
        <input 
          :value="selectedTemplate" 
          @input="updateCurrentTemplate($event)"
          type="text" 
          placeholder="如: {itemName} ({supportCount}体対応)" 
        />
      </div>
      
      <div v-else class="empty-hint">
        请先在全局模板配置中添加商品名模板
      </div>

      <div class="preview-box compact">
        <div class="preview-label">预览</div>
        <div class="preview-content">{{ previewName }}</div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-secondary" @click="emit('close')">
        取消
      </button>
      <button class="booth-btn booth-btn-md booth-btn-primary" @click="handleSave">
        保存
      </button>
    </template>
  </Modal>
</template>

<style scoped>
/* 使用全局样式系统，无需额外样式 */
</style>
