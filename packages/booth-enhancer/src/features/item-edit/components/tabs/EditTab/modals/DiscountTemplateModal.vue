<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { DiscountTemplate, GlobalTemplateConfig } from '../../../../config-types';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';
import { BUTTON_CLASSES, TEMPLATE_HINTS } from './template-hints';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
}>();

const templates = computed({
  get(): DiscountTemplate[] {
    return props.globalTemplates.discountTemplates ||= [];
  },
  set(value: DiscountTemplate[]): void {
    props.globalTemplates.discountTemplates = value;
  }
});

const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
  templates,
  defaultTemplate: { template: '' }
});
</script>

<template>
  <Modal
    :show="show"
    title="折扣模板配置"
    width="600px"
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
      <p class="form-hint" v-html="TEMPLATE_HINTS.discount.replace('\n', '<br>')"></p>
      <DraggableCardList
        v-if="globalTemplates.discountTemplates && globalTemplates.discountTemplates.length > 0"
        :items="globalTemplates.discountTemplates"
        :key-extractor="(item: DiscountTemplate) => item.id"
        @remove="removeTemplate"
        @reorder="onReorder"
      >
        <template #actions="{ item }">
          <input v-model="item.name" type="text" placeholder="输入模板名称" style="flex: 1; min-width: 0;" />
        </template>
        <template #content="{ item }">
          <div class="form-group">
            <label>模板内容</label>
            <textarea v-model="item.template" rows="3" placeholder="输入模板内容"></textarea>
          </div>
        </template>
      </DraggableCardList>

      <div v-else class="empty-hint">
        暂无模板，点击"添加模板"创建
      </div>
    </SectionHeader>
  </Modal>
</template>
