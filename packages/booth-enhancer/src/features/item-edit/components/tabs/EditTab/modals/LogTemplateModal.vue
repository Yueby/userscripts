<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, LogTemplate } from '../../../../config-types';
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

// Log 模板管理
const logTemplates = computed({
  get(): LogTemplate[] {
    return props.globalTemplates.logTemplates ||= [];
  },
  set(value: LogTemplate[]): void {
    props.globalTemplates.logTemplates = value;
  }
});

const logManager = useTemplateManager({
  templates: logTemplates,
  defaultTemplate: { template: '⟡ {日期}\n　・ {内容}' }
});
</script>

<template>
  <Modal
    :show="show"
    title="日志模板配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="logManager.addTemplate()"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <div class="be-flex be-flex-column be-gap-sm">
      <SectionHeader>
        <p class="form-hint">可用变量: {日期}, {内容}</p>
        <p class="form-hint">示例：⟡ {日期}\n　・ {内容}</p>
        <DraggableCardList
          v-if="globalTemplates.logTemplates && globalTemplates.logTemplates.length > 0"
          :items="globalTemplates.logTemplates"
          :key-extractor="(item: LogTemplate) => item.id"
          @remove="logManager.removeTemplate"
          @reorder="logManager.onReorder"
        >
          <template #actions="{ item }">
            <input 
              v-model="item.name" 
              type="text" 
              placeholder="输入模板名称" 
              style="flex: 1; min-width: 0;" 
            />
          </template>
          <template #content="{ item }">
            <div class="be-flex be-flex-column be-gap-sm">
              <div class="form-group">
                <label>模板内容</label>
                <textarea v-model="item.template" rows="2" placeholder="输入模板内容"></textarea>
              </div>
            </div>
          </template>
        </DraggableCardList>

        <div v-else class="empty-hint">
          暂无模板，点击"添加模板"创建
        </div>
      </SectionHeader>
    </div>
  </Modal>
</template>
