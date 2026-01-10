<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { ChangelogTemplate, GlobalTemplateConfig, SectionTemplate } from '../../../../config-types';
import { SectionHeader, TabBar } from '../../../ui';
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

type TabType = 'section' | 'changelog';
const activeTab = ref<TabType>('section');

const tabs = [
  { id: 'section', label: 'Section' },
  { id: 'changelog', label: '更新日志' }
];

// Section 模板管理
const sectionTemplates = computed({
  get: () => props.globalTemplates.sectionTemplates ||= [],
  set: (value) => { props.globalTemplates.sectionTemplates = value; }
});

const sectionManager = useTemplateManager({
  templates: sectionTemplates,
  defaultTemplate: { headline: '', body: '' }
});

// Changelog 模板管理
const changelogTemplates = computed({
  get: () => props.globalTemplates.changelogTemplates ||= [],
  set: (value) => { props.globalTemplates.changelogTemplates = value; }
});

const changelogManager = useTemplateManager({
  templates: changelogTemplates,
  defaultTemplate: { template: '◆ {date}\n{content}' }
});
</script>

<template>
  <Modal
    :show="show"
    title="Section 模板配置"
    width="700px"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="activeTab === 'section' ? sectionManager.addTemplate() : changelogManager.addTemplate()"
        title="添加模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>

    <div class="be-flex be-flex-column be-gap-sm">
      <TabBar
        :active-tab="activeTab"
        :tabs="tabs"
        @update:active-tab="activeTab = $event as TabType"
      />

      <!-- Section 模板 -->
      <div v-if="activeTab === 'section'" class="tab-content">
        <SectionHeader>
          <p class="form-hint">可用变量: {itemName}, {supportCount}</p>
          <DraggableCardList
          v-if="globalTemplates.sectionTemplates && globalTemplates.sectionTemplates.length > 0"
          :items="globalTemplates.sectionTemplates"
          :key-extractor="(item: SectionTemplate) => item.id"
          @remove="sectionManager.removeTemplate"
          @reorder="sectionManager.onReorder"
        >
          <template #content="{ item }">
            <div class="be-flex be-flex-column be-gap-sm">
              <div class="form-group">
                <label>模板名称</label>
                <input v-model="item.name" type="text" placeholder="输入模板名称" />
              </div>
              <div class="form-group">
                <label>Headline</label>
                <input v-model="item.headline" type="text" placeholder="输入 Headline" />
              </div>
              <div class="form-group">
                <label>Body</label>
                <textarea v-model="item.body" rows="1" placeholder="输入 Body"></textarea>
              </div>
            </div>
          </template>
        </DraggableCardList>

          <div v-else class="empty-hint">
            暂无模板，点击"添加模板"创建
          </div>
        </SectionHeader>
      </div>

      <!-- Changelog 模板 -->
      <div v-else-if="activeTab === 'changelog'" class="tab-content">
        <SectionHeader>
          <p class="form-hint">可用变量: {date}, {content}</p>
          <DraggableCardList
          v-if="globalTemplates.changelogTemplates && globalTemplates.changelogTemplates.length > 0"
          :items="globalTemplates.changelogTemplates"
          :key-extractor="(item: ChangelogTemplate) => item.id"
          @remove="changelogManager.removeTemplate"
          @reorder="changelogManager.onReorder"
        >
          <template #content="{ item, index }">
            <div class="be-flex be-flex-column be-gap-sm">
              <div class="form-group">
                <label>模板名称</label>
                <input v-model="item.name" type="text" placeholder="输入模板名称" />
              </div>
              <div class="form-group">
                <label>模板内容</label>
                <textarea v-model="item.template" rows="1" placeholder="输入模板内容"></textarea>
              </div>
              <div class="be-flex be-align-center be-gap-sm be-pt-xs">
                <label class="booth-toggle" title="设为默认">
                  <input 
                    type="checkbox" 
                    :checked="item.isDefault"
                    @change="changelogManager.setDefaultTemplate(index)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </template>
        </DraggableCardList>

          <div v-else class="empty-hint">
            暂无模板，点击"添加模板"创建
          </div>
        </SectionHeader>
      </div>
    </div>
  </Modal>
</template>

