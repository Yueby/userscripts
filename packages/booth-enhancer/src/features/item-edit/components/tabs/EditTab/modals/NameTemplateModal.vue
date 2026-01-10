<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, NameTemplate } from '../../../../config-types';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
}>();

const templates = computed({
  get: () => props.globalTemplates.nameTemplates ||= [],
  set: (value) => { props.globalTemplates.nameTemplates = value; }
});

const { addTemplate, removeTemplate, setDefaultTemplate, onReorder } = useTemplateManager({
  templates,
  defaultTemplate: { template: '{itemName}' }
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
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="addTemplate"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <SectionHeader>
      <p class="form-hint">可用变量: {itemName}, {supportCount}</p>
      <DraggableCardList
        v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0"
        :items="globalTemplates.nameTemplates"
        :key-extractor="(item: NameTemplate) => item.id"
        @remove="removeTemplate"
        @reorder="onReorder"
      >
                <template #actions="{ item: template, index }">
                  <label class="booth-toggle" title="设为默认">
                    <input 
                      type="checkbox" 
                      :checked="template.isDefault"
                      @change="setDefaultTemplate(index)"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </template>
        <template #content="{ item }">
          <div class="be-flex be-flex-column be-gap-sm">
            <div class="form-group">
              <label>模板名称</label>
              <input v-model="item.name" type="text" placeholder="输入模板名称" />
            </div>
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

