<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedNameTemplate } from '../../../../config-types';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import TemplateSelector from '../../../ui/TemplateSelector.vue';
import NameTemplateModal from './NameTemplateModal.vue';
import { BUTTON_CLASSES, TEMPLATE_HINTS } from './template-hints';

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

// 初始化 selectedTemplates（如果不存在）
function initializeSelectedTemplates(): void {
  if (!props.itemConfig.selectedTemplates) {
    props.itemConfig.selectedTemplates = {
      nameTemplateId: props.globalTemplates.nameTemplates?.[0]?.id || '',
      descriptionTemplateId: props.globalTemplates.descriptionTemplates?.[0]?.id || '',
      discountTemplateId: props.globalTemplates.discountTemplates?.[0]?.id || ''
    };
  }
}

onMounted(initializeSelectedTemplates);

// 模板配置 Modal 状态
const showTemplateModal = ref(false);

// 获取选中的模板内容
const selectedTemplate = computed((): string => 
  getSelectedNameTemplate(props.globalTemplates, props.itemConfig)
);

// 更新当前选中的模板内容
function updateCurrentTemplate(event: Event): void {
  const templates = props.globalTemplates.nameTemplates;
  const selectedId = props.itemConfig.selectedTemplates?.nameTemplateId;
  
  if (!templates || !selectedId) return;
  
  const target = event.target as HTMLInputElement;
  const template = templates.find(t => t.id === selectedId);
  
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
        :class="BUTTON_CLASSES.addButton" 
        @click="showTemplateModal = true"
        title="模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>
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

      <div class="form-group">
        <label>商品类型名称 <span class="label-hint">(用于生成复数形式，如 Avatar → Avatars)</span></label>
        <input 
          v-model="itemConfig.itemTypeName" 
          type="text" 
          placeholder="如: Avatar, Model, Texture" 
        />
      </div>

      <TemplateSelector
        v-model="itemConfig.selectedTemplates.nameTemplateId"
        :templates="globalTemplates.nameTemplates"
        label="选择模板"
        empty-hint="请先在全局模板配置中添加商品名模板"
      />

      <div v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0" class="form-group">
        <label>模板内容 <span class="label-hint">(编辑当前选中模板)</span></label>
        <p class="form-hint" v-html="TEMPLATE_HINTS.full.replace('\n', '<br>')"></p>
        <input 
          :value="selectedTemplate" 
          @input="updateCurrentTemplate($event)"
          type="text" 
          placeholder="如: {智能标题}" 
        />
      </div>
    </div>

    <template #footer>
      <button :class="BUTTON_CLASSES.closeButton" @click="emit('close')" title="取消">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button :class="BUTTON_CLASSES.saveButton" @click="handleSave" title="保存">
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
