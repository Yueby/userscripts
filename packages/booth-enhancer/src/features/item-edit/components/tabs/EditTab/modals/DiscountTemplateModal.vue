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
  defaultTemplate: { header: '', periodTemplate: '' }
});
</script>

<template>
  <Modal
    :show="show"
    title="折扣模板配置"
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
        <span v-html="withSize(icons.plus, 16)"></span>
      </button>
    </template>

    <SectionHeader>
      <p class="form-hint">
        头部：只渲染一次（如总标题）<br>
        时段模板：对每个折扣时段循环渲染<br>
        {{ TEMPLATE_HINTS.discount }}
      </p>
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
          <div class="be-flex be-flex-column be-gap-sm">
            <div class="form-group">
              <label>头部（总标题，只渲染一次）</label>
              <input v-model="item.header" type="text" placeholder="如: ◆[セール開催中]◆" />
            </div>
            <div class="form-group">
              <label>时段模板（每个折扣时段循环渲染）</label>
              <textarea v-model="item.periodTemplate" rows="3" placeholder="如: ⏰ {折扣开始时间} - {折扣结束时间} ({折扣百分比}% OFF)&#10;- 単品: {原价} JPY >> {折扣价} JPY"></textarea>
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
