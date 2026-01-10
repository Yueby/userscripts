<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedNameTemplate } from '../../../../config-types';
import { parseTemplate } from '../../../../utils/templateParser';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import NameTemplateModal from './NameTemplateModal.vue';

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

// 模板配置 Modal 状态
const showTemplateModal = ref(false);

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
  if (!props.globalTemplates.nameTemplates || 
      !props.itemConfig.selectedTemplates ||
      !props.itemConfig.selectedTemplates.nameTemplateId) return;
  
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
    <template #header-actions>
      <button 
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="showTemplateModal = true"
        title="模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>
    <div class="modal-content">
      <div class="form-group">
        <div class="be-flex be-justify-between be-align-center">
          <label>商品基础名称</label>
          <span class="be-text-xs be-text-secondary">{{ previewName }}</span>
        </div>
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

      <div class="form-group" v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0 && itemConfig.selectedTemplates">
        <label>选择模板</label>
        <select v-model="itemConfig.selectedTemplates.nameTemplateId">
          <option v-for="template in globalTemplates.nameTemplates" :key="template.id" :value="template.id">
            {{ template.name }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0 && itemConfig.selectedTemplates">
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
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" @click="emit('close')" title="取消">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" @click="handleSave" title="保存">
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- 模板配置 Modal -->
  <NameTemplateModal
    :show="showTemplateModal"
    :global-templates="globalTemplates"
    @close="showTemplateModal = false"
  />
</template>
