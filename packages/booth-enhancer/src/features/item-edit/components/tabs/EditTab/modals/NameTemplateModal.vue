<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, NameTemplate } from '../../../../config-types';
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
  get(): NameTemplate[] {
    return props.globalTemplates.nameTemplates ||= [];
  },
  set(value: NameTemplate[]): void {
    props.globalTemplates.nameTemplates = value;
  }
});

const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
  templates,
  defaultTemplate: { template: '{smartTitle}' }
});
</script>

<template>
  <Modal
    :show="show"
    title="商品名模板配置"
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
      <p class="form-hint" v-html="TEMPLATE_HINTS.full.replace('\n', '<br>')"></p>
      <DraggableCardList
        v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0"
        :items="globalTemplates.nameTemplates"
        :key-extractor="(item: NameTemplate) => item.id"
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
              <textarea v-model="item.template" rows="1" placeholder="输入模板内容"></textarea>
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
