<script setup lang="ts">
import { computed } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, SectionTemplate } from '../../../../config-types';
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

// Section 模板管理
const sectionTemplates = computed({
  get(): SectionTemplate[] {
    return props.globalTemplates.sectionTemplates ||= [];
  },
  set(value: SectionTemplate[]): void {
    props.globalTemplates.sectionTemplates = value;
  }
});

const sectionManager = useTemplateManager({
  templates: sectionTemplates,
  defaultTemplate: { type: 'normal', headline: '', body: '' }
});
</script>

<template>
  <Modal
    :show="show"
    title="Section 模板配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="sectionManager.addTemplate()"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <div class="be-flex be-flex-column be-gap-sm">
      <SectionHeader>
        <p class="form-hint" v-html="TEMPLATE_HINTS.full.replace('\n', '<br>')"></p>
        <p class="form-hint be-text-xs be-text-secondary">
          <strong>模板类型说明：</strong><br>
          • <strong>普通</strong>：常规 Section，可包含任意内容<br>
          • <strong>日志</strong>：更新日志 Section，内容由日志条目动态生成（只需配置 Headline）<br>
          • <strong>商品信息</strong>：自动从 Variations 关联的商品生成信息列表
        </p>
        <DraggableCardList
          v-if="globalTemplates.sectionTemplates && globalTemplates.sectionTemplates.length > 0"
          :items="globalTemplates.sectionTemplates"
          :key-extractor="(item: SectionTemplate) => item.id"
          @remove="sectionManager.removeTemplate"
          @reorder="sectionManager.onReorder"
        >
        <template #actions="{ item }">
          <select
            v-model="item.type"
            class="be-p-xs be-px-sm be-text-base"
            style="height: 28px; width: auto; flex-shrink: 0;"
          >
            <option value="normal">普通</option>
            <option value="log">日志</option>
            <option value="iteminfo">商品信息</option>
          </select>
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
              <label>Headline</label>
              <input v-model="item.headline" type="text" placeholder="输入 Headline" />
            </div>
            <div v-if="item.type === 'normal' || !item.type" class="form-group">
              <label>Body</label>
              <textarea v-model="item.body" rows="1" placeholder="输入 Body"></textarea>
            </div>
            <p v-else-if="item.type === 'log'" class="form-hint be-text-xs be-text-secondary">
              日志类型的 Section 内容由日志条目动态生成，无需手动填写 Body
            </p>
            <p v-else-if="item.type === 'iteminfo'" class="form-hint be-text-xs be-text-secondary">
              商品信息类型的 Section 内容将自动从 Variations 关联的商品生成，无需手动填写 Body
            </p>
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
