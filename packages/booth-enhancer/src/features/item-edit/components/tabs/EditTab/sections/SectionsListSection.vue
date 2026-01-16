<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import { useModal } from '../../../../composables';
import type { GlobalTemplateConfig, ItemEditConfig, SectionTemplate, SectionType } from '../../../../config-types';
import { createSectionByType, createSectionFromTemplate, resolveSectionContent, type ResolveContext } from '../../../../utils/sectionResolver';
import type { TemplateVariables } from '../../../../utils/templateParser';
import { formatDate, parseTemplate } from '../../../../utils/templateParser';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import TemplateSelector from '../../../ui/TemplateSelector.vue';
import { toast } from '../../../ui/Toast';
import ItemInfoTemplateModal from '../modals/ItemInfoTemplateModal.vue';
import LogTemplateModal from '../modals/LogTemplateModal.vue';
import SectionTemplateModal from '../modals/SectionTemplateModal.vue';
import SectionTemplateSelectorModal from '../modals/SectionTemplateSelectorModal.vue';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  templateVars: TemplateVariables;
  api: ItemEditAPI;
  modal: ReturnType<typeof useModal>;
  itemTree: any;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// Modal 状态
const showSectionTemplateModal = ref(false);
const showSectionTemplateSelectorModal = ref(false);
const showLogTemplateModal = ref(false);
const showItemInfoTemplateModal = ref(false);

// 解析后的Sections
const resolvedSections = computed(() => {
  const context: ResolveContext = {
    variations: props.itemConfig.variations,
    itemTree: props.itemTree
  };
  
  return props.itemConfig.sections.map((section: any) => {
    const resolved = resolveSectionContent(section, props.globalTemplates, context);
    return {
      headline: parseTemplate(resolved.headline, props.templateVars),
      body: parseTemplate(resolved.body, props.templateVars)
    };
  });
});

// 从页面导入 Sections
function importSections(): void {
  const pageSections = props.api.sections;
  
  if (pageSections.length === 0) {
    toast.info('页面没有 Sections');
    return;
  }
  
  // 创建普通类型的 Sections
  props.itemConfig.sections = pageSections.map(() => 
    createSectionByType('normal', props.globalTemplates)
  );
  
  // 读取实际内容
  pageSections.forEach((section: any, index: number) => {
    const targetSection = props.itemConfig.sections[index];
    if (targetSection && targetSection.type === 'normal') {
      targetSection.headline = section.headlineInput?.value || '';
      targetSection.body = section.bodyTextarea?.value || '';
    }
  });
  
  toast.success(`已导入 ${pageSections.length} 个 Sections`);
}

// 添加 Section - 打开模板选择 Modal
function addSection(): void {
  showSectionTemplateSelectorModal.value = true;
}

// 处理模板选择
function handleTemplateSelect(template: SectionTemplate | null): void {
  if (template === null) {
    // 创建空 Section
    const newSection = createSectionByType('normal', props.globalTemplates);
    props.itemConfig.sections.push(newSection);
  } else {
    // 从模板创建 Section
    const newSection = createSectionFromTemplate(template, props.globalTemplates);
    props.itemConfig.sections.push(newSection);
  }
  showSectionTemplateSelectorModal.value = false;
}

// 删除 Section
function removeSection(index: number): void {
  props.itemConfig.sections.splice(index, 1);
}

// 切换 Section 类型
function changeSectionType(index: number, newType: SectionType): void {
  const oldSection = props.itemConfig.sections[index];
  const newSection = createSectionByType(newType, props.globalTemplates);
  
  // 保留 headline（如果旧 section 有的话）
  if (oldSection.headline) {
    newSection.headline = oldSection.headline;
  }
  
  props.itemConfig.sections.splice(index, 1, newSection);
}

// Log Section 操作
function addLogEntry(sectionIndex: number): void {
  const section = props.itemConfig.sections[sectionIndex];
  if (section.type !== 'log') return;
  
  section.logEntries.unshift({
    id: crypto.randomUUID(),
    date: Date.now(),
    content: ''
  });
}

function removeLogEntry(sectionIndex: number, entryIndex: number): void {
  const section = props.itemConfig.sections[sectionIndex];
  if (section.type !== 'log') return;
  
  section.logEntries.splice(entryIndex, 1);
}

function onLogEntryReorder(sectionIndex: number, fromIndex: number, toIndex: number): void {
  const section = props.itemConfig.sections[sectionIndex];
  if (section.type !== 'log') return;
  
  const [removed] = section.logEntries.splice(fromIndex, 1);
  section.logEntries.splice(toIndex, 0, removed);
}

// 预览 Section
function handlePreviewSection(index: number): void {
  props.modal.openModal({
    type: 'alert',
    title: 'Section 预览',
    formData: { sectionIndex: index }
  });
}

// 应用到页面
async function applySections(): Promise<void> {
  const sectionsToApply = resolvedSections.value;
  const diff = sectionsToApply.length - props.api.sections.length;
  
  // 1. 同步数量
  if (diff > 0) {
    // 添加不足的 sections
    for (let i = 0; i < diff; i++) {
      if (!await props.api.addSection()) {
        toast.error(`添加 Section 失败`);
        return;
      }
    }
  } else if (diff < 0) {
    // 删除多余的 sections（从后往前删）
    for (let i = 0; i < -diff; i++) {
      if (!await props.api.removeSection(props.api.sections.length - 1)) {
        toast.error(`删除 Section 失败`);
        return;
      }
    }
  }
  
  // 2. 更新所有 section 的内容
  sectionsToApply.forEach((section, index) => {
    props.api.updateSection(index, {
      headline: section.headline,
      body: section.body
    });
  });
  
  toast.success(`已应用 ${sectionsToApply.length} 个 Sections`);
  emit('applied');
}

function onSectionReorder(fromIndex: number, toIndex: number): void {
  const [removed] = props.itemConfig.sections.splice(fromIndex, 1);
  props.itemConfig.sections.splice(toIndex, 0, removed);
}

function openLogTemplateModal(): void {
  showLogTemplateModal.value = true;
}

defineExpose({
  applySections
});
</script>

<template>
  <SectionHeader :title="`Sections (${itemConfig.sections.length})`">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        title="从页面导入"
        @click="importSections"
      >
        <span v-html="withSize(icons.download, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="添加"
        @click="addSection()"
      >
        <span v-html="withSize(icons.plus, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="模板配置"
        @click="showSectionTemplateModal = true"
      >
        <span v-html="withSize(icons.edit, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary" 
        type="button"
        title="应用到页面"
        @click="applySections"
      >
        <span v-html="withSize(icons.send, 14)"></span>
      </button>
    </template>

    <div v-if="itemConfig.sections.length === 0" class="empty-hint">
      暂无 Sections，点击"添加"或"从页面导入"
    </div>

    <DraggableCardList
      v-else
      :items="itemConfig.sections"
      :key-extractor="(item: any) => item.id"
      @remove="removeSection"
      @reorder="onSectionReorder"
    >
      <template #actions="{ item: section, index }">
        <!-- 类型切换下拉框 -->
        <select 
          :value="section.type" 
          class="be-p-xs be-px-sm be-text-base" 
          style="height: 28px; width: auto; flex-shrink: 0;"
          @change="changeSectionType(index, ($event.target as HTMLSelectElement).value as SectionType)"
        >
          <option value="normal">普通</option>
          <option value="log">日志</option>
          <option value="iteminfo">商品信息</option>
        </select>
        
        <!-- Headline 输入 -->
        <input 
          v-model="section.headline" 
          type="text" 
          class="be-flex-1 be-p-xs be-px-sm be-text-base be-min-w-0"
          style="height: 28px;" 
          placeholder="输入 Headline"
        />
        
        <!-- Log 模板配置按钮（仅 log 类型显示） -->
        <button 
          v-if="section.type === 'log'"
          class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
          type="button"
          title="配置日志模板"
          @click.stop.prevent="openLogTemplateModal()"
        >
          <span v-html="withSize(icons.edit, 14)"></span>
        </button>
        
        <!-- ItemInfo 模板配置按钮（仅 iteminfo 类型显示） -->
        <button 
          v-if="section.type === 'iteminfo'"
          class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
          type="button"
          title="配置商品信息模板"
          @click.stop.prevent="showItemInfoTemplateModal = true"
        >
          <span v-html="withSize(icons.edit, 14)"></span>
        </button>
        
        <!-- 预览按钮 -->
        <button 
          class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
          type="button"
          title="预览"
          @click.stop.prevent="handlePreviewSection(index)"
        >
          <span v-html="withSize(icons.eye, 14)"></span>
        </button>
      </template>
      
      <template #content="{ item: section, index }">
        <!-- 普通 Section -->
        <div v-if="section.type === 'normal'" class="form-group">
          <textarea 
            v-model="section.body" 
            rows="1"
            placeholder="输入 Body"
          ></textarea>
        </div>
        
        <!-- Log Section -->
        <div v-else-if="section.type === 'log'" class="be-flex be-flex-column be-gap-sm">
          <!-- 模板选择 -->
          <SectionHeader>
            <TemplateSelector
              v-model="section.logTemplateId"
              :templates="globalTemplates.logTemplates"
              label="选择日志模板"
              empty-hint="请先添加日志模板"
            />
          </SectionHeader>
          
          <!-- 日志条目列表 -->
          <SectionHeader no-border>
            <template #title>日志条目 ({{ section.logEntries.length }})</template>
            <template #actions>
              <button 
                class="booth-btn booth-btn-sm booth-btn-secondary"
                type="button"
                title="添加日志"
                @click="addLogEntry(index)"
              >
                <span v-html="withSize(icons.plus, 14)"></span>
              </button>
            </template>
            
            <div v-if="section.logEntries.length === 0" class="empty-hint">
              暂无日志，点击"添加日志"创建
            </div>
            
            <DraggableCardList
              v-else
              :items="section.logEntries"
              :key-extractor="(item: any) => item.id"
              @remove="(entryIndex: number) => removeLogEntry(index, entryIndex)"
              @reorder="(from: number, to: number) => onLogEntryReorder(index, from, to)"
            >
              <template #actions="{ item: entry }">
                <input 
                  v-model.number="entry.date" 
                  type="number" 
                  class="be-flex-1 be-p-xs be-px-sm be-text-base" 
                  style="height: 28px; min-width: 120px;" 
                  :placeholder="formatDate(Date.now())" 
                />
              </template>
              <template #content="{ item: entry }">
                <div class="form-group">
                  <textarea 
                    v-model="entry.content" 
                    rows="1"
                    placeholder="输入日志内容"
                  ></textarea>
                </div>
              </template>
            </DraggableCardList>
          </SectionHeader>
        </div>
        
        <!-- ItemInfo Section -->
        <div v-else-if="section.type === 'iteminfo'" class="be-flex be-flex-column be-gap-sm">
          <!-- 模板选择 -->
          <SectionHeader>
            <TemplateSelector
              v-model="section.itemInfoTemplateId"
              :templates="globalTemplates.itemInfoTemplates"
              label="选择商品信息模板"
              empty-hint="请先添加商品信息模板"
            />
          </SectionHeader>
          
          <p class="form-hint be-text-xs be-text-secondary">
            商品信息会自动从 Variations 关联的商品中收集并按作者分组显示
          </p>
        </div>
      </template>
    </DraggableCardList>
  </SectionHeader>

  <!-- Template Modals -->
  <SectionTemplateSelectorModal
    :show="showSectionTemplateSelectorModal"
    :global-templates="globalTemplates"
    @close="showSectionTemplateSelectorModal = false"
    @select="handleTemplateSelect"
  />

  <SectionTemplateModal
    :show="showSectionTemplateModal"
    :global-templates="globalTemplates"
    @close="showSectionTemplateModal = false"
  />

  <LogTemplateModal
    :show="showLogTemplateModal"
    :global-templates="globalTemplates"
    @close="showLogTemplateModal = false"
  />

  <ItemInfoTemplateModal
    :show="showItemInfoTemplateModal"
    :global-templates="globalTemplates"
    @close="showItemInfoTemplateModal = false"
  />
</template>

<style scoped>
.empty-hint {
  padding: var(--be-space-md);
  text-align: center;
  color: var(--be-color-text-secondary);
  font-size: var(--be-font-size-md);
  background: var(--be-color-bg-secondary);
  border-radius: var(--be-radius);
}
</style>
