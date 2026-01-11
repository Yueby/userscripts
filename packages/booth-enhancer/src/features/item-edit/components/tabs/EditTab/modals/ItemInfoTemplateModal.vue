<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, ItemInfoTemplate } from '../../../../config-types';
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

// ItemInfo 模板管理
const itemInfoTemplates = computed({
  get(): ItemInfoTemplate[] {
    return props.globalTemplates.itemInfoTemplates ||= [];
  },
  set(value: ItemInfoTemplate[]): void {
    props.globalTemplates.itemInfoTemplates = value;
  }
});

const itemInfoManager = useTemplateManager({
  templates: itemInfoTemplates,
  defaultTemplate: { template: '⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -' }
});
</script>

<template>
  <Modal
    :show="show"
    title="商品信息模板配置"
    width="700px"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="itemInfoManager.addTemplate()"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <div class="be-flex be-flex-column be-gap-sm">
      <SectionHeader>
        <p class="form-hint">可用变量: {作者名}, {商品名}, {商品链接}</p>
        <p class="form-hint">系统会自动按作者分组并循环渲染所有关联商品</p>
        <p class="form-hint">示例：⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -</p>
        <DraggableCardList
          v-if="globalTemplates.itemInfoTemplates && globalTemplates.itemInfoTemplates.length > 0"
          :items="globalTemplates.itemInfoTemplates"
          :key-extractor="(item: ItemInfoTemplate) => item.id"
          @remove="itemInfoManager.removeTemplate"
          @reorder="itemInfoManager.onReorder"
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
                <textarea v-model="item.template" rows="3" placeholder="输入模板内容"></textarea>
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
