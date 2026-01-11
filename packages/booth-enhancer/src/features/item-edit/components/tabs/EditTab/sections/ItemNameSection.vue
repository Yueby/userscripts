<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedNameTemplate } from '../../../../config-types';
import type { TemplateVariables } from '../../../../utils/templateParser';
import { parseTemplate } from '../../../../utils/templateParser';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { toast } from '../../../ui/Toast';
import NameModal from '../modals/NameModal.vue';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  templateVars: TemplateVariables;
  api: ItemEditAPI;
  totalSupport: number;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// Modal 状态
const showNameModal = ref(false);

// 预览：商品名
const previewName = computed((): string => {
  const template = getSelectedNameTemplate(props.globalTemplates, props.itemConfig);
  return parseTemplate(template, props.templateVars);
});

// 应用到页面
function applyName(): void {
  props.api.setName(previewName.value);
  toast.success('已应用商品名');
  emit('applied');
}

defineExpose({
  applyName
});
</script>

<template>
  <SectionHeader title="商品名称">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="模板设置"
        @click="showNameModal = true"
      >
        <span v-html="withSize(icons.edit, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary" 
        type="button"
        title="应用到页面"
        @click="applyName"
      >
        <span v-html="withSize(icons.send, 14)"></span>
      </button>
    </template>
    
    <div class="form-group">
      <input 
        v-model="itemConfig.itemName" 
        type="text" 
        placeholder="输入商品名称"
      />
    </div>
    
    <PreviewBox v-if="previewName" label="预览:" type="text">
      <span class="be-text-primary">{{ previewName }}</span>
    </PreviewBox>
  </SectionHeader>

  <!-- Name Modal -->
  <NameModal
    :show="showNameModal"
    :item-config="itemConfig"
    :global-templates="globalTemplates"
    :total-support="totalSupport"
    @close="showNameModal = false"
    @save="showNameModal = false"
  />
</template>
