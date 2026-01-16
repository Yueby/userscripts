<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { DiscountIndicatorTemplate, GlobalTemplateConfig } from '../../../../config-types';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';
import { BUTTON_CLASSES } from './template-hints';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
}>();

const templates = computed({
  get(): DiscountIndicatorTemplate[] {
    return props.globalTemplates.discountIndicatorTemplates ||= [];
  },
  set(value: DiscountIndicatorTemplate[]): void {
    props.globalTemplates.discountIndicatorTemplates = value;
  }
});

const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
  templates,
  defaultTemplate: { template: '[SALE] ' }
});
</script>

<template>
  <Modal
    :show="show"
    title="折扣标识模板配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="addTemplate"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <SectionHeader>
      <p class="form-hint be-text-xs be-text-secondary">
        配置折扣标识的显示样式，可用变量: {折扣百分比}
      </p>
      <DraggableCardList
        v-if="globalTemplates.discountIndicatorTemplates && globalTemplates.discountIndicatorTemplates.length > 0"
        :items="globalTemplates.discountIndicatorTemplates"
        :key-extractor="(item: DiscountIndicatorTemplate) => item.id"
        @remove="removeTemplate"
        @reorder="onReorder"
      >
        <template #actions="{ item: template }">
          <input 
            v-model="template.name" 
            type="text" 
            placeholder="输入模板名称" 
            style="flex: 1; min-width: 0;" 
          />
        </template>
        <template #content="{ item }">
          <div class="be-flex be-flex-column be-gap-sm">
            <div class="form-group">
              <label>模板内容</label>
              <input v-model="item.template" type="text" placeholder="如: [SALE] 或 🔥 或 [-{折扣百分比}%]" />
            </div>
          </div>
        </template>
      </DraggableCardList>

      <div v-else class="empty-hint">
        暂无模板，点击"添加模板"创建
      </div>
    </SectionHeader>
  </Modal>
</template>
