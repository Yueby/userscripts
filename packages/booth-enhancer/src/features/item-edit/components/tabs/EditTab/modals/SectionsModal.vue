<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedChangelogTemplate } from '../../../../config-types';
import { createSectionFromTemplate } from '../../../../utils/sectionResolver';
import { formatDate } from '../../../../utils/templateParser';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
}>();

type TabType = 'templates' | 'create' | 'changelog';
const activeTab = ref<TabType>('templates');

// 获取选中的更新日志模板
const selectedChangelogTemplate = computed(() => 
  getSelectedChangelogTemplate(props.globalTemplates, props.itemConfig)
);

// === Section 模板管理 ===

// 添加新模板
function addSectionTemplate(): void {
  props.globalTemplates.sectionTemplates.push({
    id: crypto.randomUUID(),
    name: '新模板',
    headline: '',
    body: ''
  });
}

// 删除模板（通过索引）
function removeSectionTemplate(index: number): void {
  props.globalTemplates.sectionTemplates.splice(index, 1);
}

// 模板重排序
function onTemplateReorder(fromIndex: number, toIndex: number): void {
  const templates = props.globalTemplates.sectionTemplates;
  const [removed] = templates.splice(fromIndex, 1);
  templates.splice(toIndex, 0, removed);
}

// 从模板创建 Section 实例
function createFromTemplate(templateId: string): void {
  const template = props.globalTemplates.sectionTemplates.find(t => t.id === templateId);
  if (!template) return;
  
  props.itemConfig.sections.push(createSectionFromTemplate(template));
  emit('close');
}

// === 更新日志管理 ===

// 添加更新日志条目
function addChangelogEntry(): void {
  props.itemConfig.changelog.unshift({
    id: crypto.randomUUID(),
    date: Date.now(),
    type: 'added',
    content: ''
  });
}

// 删除更新日志条目（通过索引）
function removeChangelogEntry(index: number): void {
  props.itemConfig.changelog.splice(index, 1);
}

// 更新日志重排序
function onChangelogReorder(fromIndex: number, toIndex: number): void {
  const changelog = props.itemConfig.changelog;
  const [removed] = changelog.splice(fromIndex, 1);
  changelog.splice(toIndex, 0, removed);
}

// 更新当前选中的更新日志模板内容
function updateChangelogTemplate(event: Event): void {
  if (!props.globalTemplates.changelogTemplates || !props.itemConfig.selectedTemplates) return;
  
  const target = event.target as HTMLTextAreaElement;
  const template = props.globalTemplates.changelogTemplates.find(
    t => t.id === props.itemConfig.selectedTemplates.changelogTemplateId
  );
  if (template) {
    template.template = target.value;
  }
}
</script>

<template>
  <Modal
    :show="show"
    title="Sections 高级配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
    width="700px"
  >
    <div class="sections-modal-content">
      <!-- Tab 导航 -->
      <div class="tab-nav">
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'templates' }"
          @click="activeTab = 'templates'"
        >
          Section 模板库
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'create' }"
          @click="activeTab = 'create'"
        >
          从模板创建
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'changelog' }"
          @click="activeTab = 'changelog'"
        >
          更新日志
        </button>
      </div>

      <!-- Tab 内容 -->
      <div class="tab-content">
        <!-- Tab 1: Section 模板库 -->
        <div v-if="activeTab === 'templates'" class="tab-panel">
          <div class="panel-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addSectionTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>

          <div v-if="globalTemplates.sectionTemplates.length === 0" class="empty-hint">
            暂无模板，点击"添加模板"创建
          </div>

          <DraggableCardList
            v-else
            :items="globalTemplates.sectionTemplates"
            @remove="removeSectionTemplate"
            @reorder="onTemplateReorder"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" 
                placeholder="模板名称" />
            </template>

            <template #content="{ item: template }">
              <div class="form-group">
                <label>Headline</label>
                <input v-model="template.headline" type="text" 
                  placeholder="支持变量: {itemName}, {supportCount}" />
              </div>
              
              <div class="form-group">
                <label>Body</label>
                <textarea v-model="template.body" rows="2"
                  placeholder="支持变量: {itemName}, {supportCount}"></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- Tab 2: 从模板创建 -->
        <div v-if="activeTab === 'create'" class="tab-panel">
          <p class="panel-hint">选择一个模板来创建 Section 实例</p>

          <div v-if="globalTemplates.sectionTemplates.length === 0" class="empty-hint">
            暂无模板，请先在"Section 模板库"中创建模板
          </div>

          <div v-else class="template-grid">
            <div v-for="template in globalTemplates.sectionTemplates" :key="template.id" 
              class="template-card" @click="createFromTemplate(template.id)">
              <div class="card-name">{{ template.name }}</div>
              <div class="card-preview">
                <div class="preview-line">{{ template.headline || '(无标题)' }}</div>
                <div class="preview-line preview-body">{{ template.body || '(无内容)' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: 更新日志 -->
        <div v-if="activeTab === 'changelog'" class="tab-panel">
          <div class="panel-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addChangelogEntry">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加更新
            </button>
          </div>

          <div class="form-group" v-if="globalTemplates.changelogTemplates && globalTemplates.changelogTemplates.length > 0">
            <label>选择模板</label>
            <select v-model="itemConfig.selectedTemplates.changelogTemplateId">
              <option v-for="template in globalTemplates.changelogTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="globalTemplates.changelogTemplates && globalTemplates.changelogTemplates.length > 0">
            <label>模板内容 <span class="label-hint">(编辑当前选中模板)</span></label>
            <p class="form-hint">支持变量: {date}, {content}</p>
            <textarea 
              :value="selectedChangelogTemplate" 
              @input="updateChangelogTemplate($event)"
              rows="2"
              placeholder="◆ {date}&#10;{content}"
            ></textarea>
          </div>
          
          <div v-else class="empty-hint">
            请先在全局模板配置中添加更新日志模板
          </div>

          <DraggableCardList
            v-if="itemConfig.changelog.length > 0"
            :items="itemConfig.changelog"
            @remove="removeChangelogEntry"
            @reorder="onChangelogReorder"
          >
            <template #header="{ item: entry }">
              <select v-model="entry.type" class="entry-type-select">
                <option value="release">Released</option>
                <option value="added">Added</option>
                <option value="fixed">Fixed</option>
                <option value="updated">Updated</option>
              </select>
              <span class="entry-date">{{ formatDate(entry.date) }}</span>
            </template>

            <template #content="{ item: entry }">
              <textarea v-model="entry.content" rows="2" 
                placeholder="更新内容"></textarea>
            </template>
          </DraggableCardList>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-primary" @click="emit('close')">
        关闭
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.sections-modal-content {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.tab-nav {
  display: flex;
  gap: var(--be-space-xs);
  border-bottom: 1px solid var(--be-color-border);
  margin-bottom: var(--be-space-md);
}

.tab-btn {
  padding: var(--be-space-sm) var(--be-space-md);
  font-size: var(--be-font-size-base);
  font-weight: 500;
  color: var(--be-color-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: var(--be-transition-normal);
}

.tab-btn:hover {
  color: var(--be-color-text);
  background: var(--be-color-bg-secondary);
}

.tab-btn.active {
  color: var(--be-color-primary);
  border-bottom-color: var(--be-color-primary);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
}

.panel-hint {
  margin: 0;
  padding: 12px;
  background: var(--be-color-bg-secondary);
  border-radius: var(--be-radius);
  font-size: var(--be-font-size-base);
  color: var(--be-color-text-secondary);
}

/* 模板名称输入框（DraggableCardList header 插槽内容） */
.template-name-input {
  flex: 1;
  font-weight: 600;
  padding: 4px var(--be-space-sm);
  font-size: var(--be-font-size-base);
  height: 28px;
}

/* 更新日志条目样式（DraggableCardList header 插槽内容） */
.entry-type-select {
  padding: 2px 6px;
  font-size: var(--be-font-size-sm);
  height: 24px;
  width: auto;
  flex-shrink: 0;
}

.entry-date {
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
  flex: 1;
  text-align: right;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-card {
  padding: 12px;
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
  cursor: pointer;
  transition: var(--be-transition-normal);
}

.template-card:hover {
  border-color: var(--be-color-primary);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.card-name {
  font-size: var(--be-font-size-md);
  font-weight: 600;
  color: var(--be-color-text);
  margin-bottom: var(--be-space-sm);
}

.card-preview {
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
}

.preview-line {
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-body {
  color: var(--be-color-text-muted);
}

.label-hint {
  font-size: var(--be-font-size-xs);
  color: var(--be-color-text-muted);
  font-weight: normal;
  font-style: italic;
}

.form-hint {
  margin: 4px 0 0;
  font-size: var(--be-font-size-xs);
  color: var(--be-color-text-secondary);
}
</style>
