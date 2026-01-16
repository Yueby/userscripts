<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { DescriptionTemplate, GlobalTemplateConfig } from '../../../../config-types';
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
  get(): DescriptionTemplate[] {
    return props.globalTemplates.descriptionTemplates ||= [];
  },
  set(value: DescriptionTemplate[]): void {
    props.globalTemplates.descriptionTemplates = value;
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
    title="描述模板配置"
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
      <p class="form-hint" v-html="TEMPLATE_HINTS.full.replace('\n', '<br>')"></p>
      <DraggableCardList
        v-if="globalTemplates.descriptionTemplates && globalTemplates.descriptionTemplates.length > 0"
        :items="globalTemplates.descriptionTemplates"
        :key-extractor="(item: DescriptionTemplate) => item.id"
        @remove="removeTemplate"
        @reorder="onReorder"
      >
        <template #actions="{ item }">
          <input v-model="item.name" type="text" placeholder="输入模板名称" style="flex: 1; min-width: 0;" />
        </template>
        <template #content="{ item }">
          <div class="form-group">
            <label>模板内容</label>
            <textarea v-model="item.template" rows="1" placeholder="输入模板内容"></textarea>
          </div>
        </template>
      </DraggableCardList>

      <div v-else class="empty-hint">
        暂无模板，点击"添加模板"创建
      </div>
    </SectionHeader>
  </Modal>
</template>
