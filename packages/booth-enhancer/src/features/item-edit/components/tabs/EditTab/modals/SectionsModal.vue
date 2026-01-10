<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedChangelogTemplate } from '../../../../config-types';
import { createSectionFromTemplate } from '../../../../utils/sectionResolver';
import { formatDate } from '../../../../utils/templateParser';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';
import SectionTemplateModal from './SectionTemplateModal.vue';

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

// 模板配置 Modal 状态
const showTemplateModal = ref(false);

// 获取选中的更新日志模板
const selectedChangelogTemplate = computed(() => 
  getSelectedChangelogTemplate(props.globalTemplates, props.itemConfig)
);

function addSectionTemplate(): void {
  props.globalTemplates.sectionTemplates.push({
    id: crypto.randomUUID(),
    name: '新模板',
    headline: '',
    body: ''
  });
}

function removeSectionTemplate(index: number): void {
  props.globalTemplates.sectionTemplates.splice(index, 1);
}

function onTemplateReorder(fromIndex: number, toIndex: number): void {
  const templates = props.globalTemplates.sectionTemplates;
  const [removed] = templates.splice(fromIndex, 1);
  templates.splice(toIndex, 0, removed);
}

function createFromTemplate(templateId: string): void {
  const template = props.globalTemplates.sectionTemplates.find(t => t.id === templateId);
  if (!template) return;
  
  props.itemConfig.sections.push(createSectionFromTemplate(template));
  emit('close');
}

function addChangelogEntry(): void {
  props.itemConfig.changelog.unshift({
    id: crypto.randomUUID(),
    date: Date.now(),
    type: 'added',
    content: ''
  });
}

function removeChangelogEntry(index: number): void {
  props.itemConfig.changelog.splice(index, 1);
}

function onChangelogReorder(fromIndex: number, toIndex: number): void {
  const changelog = props.itemConfig.changelog;
  const [removed] = changelog.splice(fromIndex, 1);
  changelog.splice(toIndex, 0, removed);
}

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
    <template #header-actions>
      <button 
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="showTemplateModal = true"
        title="模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>
    <div class="be-flex be-flex-column" style="min-height: 400px;">
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
        <div v-if="activeTab === 'templates'" class="be-flex be-flex-column be-gap-sm">
          <div class="be-flex be-justify-end">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addSectionTemplate" title="添加新的 Section 模板">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>

          <div v-if="!globalTemplates.sectionTemplates || globalTemplates.sectionTemplates.length === 0" class="empty-hint">
            暂无模板，点击"添加模板"创建
          </div>

          <DraggableCardList
            v-else
            :items="globalTemplates.sectionTemplates"
            @remove="removeSectionTemplate"
            @reorder="onTemplateReorder"
          >
            <template #actions="{ item: template }">
              <input v-model="template.name" type="text" class="be-flex-1 be-font-bold be-p-xs be-px-sm be-text-base" 
                style="height: 28px;" placeholder="模板名称" />
            </template>

            <template #content="{ item: template }">
              <div class="form-group">
                <label>Headline</label>
                <input v-model="template.headline" type="text" 
                  placeholder="支持变量: {itemName}, {supportCount}" />
              </div>
              
              <div class="form-group">
                <label>Body</label>
                <textarea v-model="template.body" rows="1"
                  placeholder="支持变量: {itemName}, {supportCount}"></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- Tab 2: 从模板创建 -->
        <div v-if="activeTab === 'create'" class="be-flex be-flex-column be-gap-sm">
          <p class="be-m-0 be-pb-sm be-text-secondary">选择一个模板来创建 Section 实例</p>

          <div v-if="!globalTemplates.sectionTemplates || globalTemplates.sectionTemplates.length === 0" class="empty-hint">
            暂无模板，请先在"Section 模板库"中创建模板
          </div>

          <div v-else class="be-grid be-grid-cols-2 be-gap-sm">
            <div v-for="template in globalTemplates.sectionTemplates" :key="template.id" 
              class="be-p-sm be-border be-rounded be-cursor-pointer be-transition"
              @click="createFromTemplate(template.id)"
            >
              <div class="be-text-md be-font-bold be-text-primary be-mb-sm">{{ template.name }}</div>
              <div class="be-text-sm be-text-secondary">
                <div class="be-mb-xs be-whitespace-nowrap be-overflow-hidden be-text-ellipsis">{{ template.headline || '(无标题)' }}</div>
                <div class="be-text-muted">{{ template.body || '(无内容)' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: 更新日志 -->
        <div v-if="activeTab === 'changelog'" class="be-flex be-flex-column be-gap-sm">
          <div class="be-flex be-justify-end">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addChangelogEntry" title="添加新的更新日志">
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
            <template #actions="{ item: entry }">
              <select v-model="entry.type" class="be-p-xs be-px-sm be-text-sm be-flex-shrink-0" style="height: 24px; width: auto;">
                <option value="release">Released</option>
                <option value="added">Added</option>
                <option value="fixed">Fixed</option>
                <option value="updated">Updated</option>
              </select>
              <span class="be-flex-1 be-text-sm be-text-secondary be-text-right">{{ formatDate(entry.date) }}</span>
            </template>

            <template #content="{ item: entry }">
              <textarea v-model="entry.content" rows="1" 
                placeholder="更新内容"></textarea>
            </template>
          </DraggableCardList>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" @click="emit('close')" title="关闭">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- 模板配置 Modal -->
  <SectionTemplateModal
    :show="showTemplateModal"
    :global-templates="globalTemplates"
    @close="showTemplateModal = false"
  />
</template>

