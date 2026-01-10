<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GlobalTemplateConfig } from '../../../../config-types';
import { Modal } from '../../../ui';
import TabBar, { type Tab } from '../../../ui/TabBar.vue';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
  save: [templates: GlobalTemplateConfig];
}>();

// 初始化模板数据（防御性检查：确保所有模板数组存在）
function initializeTemplates(templates: GlobalTemplateConfig): GlobalTemplateConfig {
  const result = JSON.parse(JSON.stringify(templates));
  
  // 确保所有模板数组存在
  if (!result.nameTemplates) result.nameTemplates = [];
  if (!result.descriptionTemplates) result.descriptionTemplates = [];
  if (!result.discountTemplates) result.discountTemplates = [];
  if (!result.changelogTemplates) result.changelogTemplates = [];
  if (!result.itemInfoTemplates) result.itemInfoTemplates = [];
  if (!result.sectionTemplates) result.sectionTemplates = [];
  
  return result;
}

// 本地编辑状态
const localTemplates = ref<GlobalTemplateConfig>(initializeTemplates(props.globalTemplates));

// Tab 配置（缩短名称）
const tabs: Tab[] = [
  { id: 'name', label: '商品名' },
  { id: 'description', label: '描述' },
  { id: 'discount', label: '打折' },
  { id: 'changelog', label: '更新日志' },
  { id: 'itemInfo', label: '商品信息' },
  { id: 'sections', label: 'Section' }
];

const activeTab = ref('name');

// 处理关闭
function handleClose(): void {
  localTemplates.value = initializeTemplates(props.globalTemplates);
  emit('close');
}

// 处理保存
function handleSave(): void {
  emit('save', JSON.parse(JSON.stringify(localTemplates.value)));
  emit('close');
}

// ===== 通用模板管理函数 =====
function addTemplate<T extends { id: string; name: string; template: string }>(
  list: T[],
  defaultName: string,
  defaultTemplate: string
): void {
  list.push({
    id: crypto.randomUUID(),
    name: defaultName,
    template: defaultTemplate
  } as T);
}

function removeTemplate<T>(list: T[], index: number): void {
  if (list.length > 1) {
    list.splice(index, 1);
  }
}

// ===== 商品名模板 =====
function addNameTemplate(): void {
  addTemplate(localTemplates.value.nameTemplates, '新商品名模板', '{itemName}');
}

// ===== 描述模板 =====
function addDescriptionTemplate(): void {
  addTemplate(localTemplates.value.descriptionTemplates, '新描述模板', '');
}

// ===== 打折模板 =====
function addDiscountTemplate(): void {
  addTemplate(
    localTemplates.value.discountTemplates, 
    '新打折模板', 
    '【セール中】\n通常価格: ¥{originalPrice} → セール価格: ¥{discountedPrice} ({discountPercent}% OFF)'
  );
}

// ===== 更新日志模板 =====
function addChangelogTemplate(): void {
  addTemplate(localTemplates.value.changelogTemplates, '新更新日志模板', '◆ {date}\n{content}');
}

// ===== 商品信息模板 =====
function addItemInfoTemplate(): void {
  addTemplate(localTemplates.value.itemInfoTemplates, '新商品信息模板', '{authorName} - {itemName}');
}

// ===== Section 模板 =====
function addSectionTemplate(): void {
  localTemplates.value.sectionTemplates.push({
    id: crypto.randomUUID(),
    name: '新 Section 模板',
    headline: '',
    body: ''
  });
}

function removeSectionTemplate(index: number): void {
  localTemplates.value.sectionTemplates.splice(index, 1);
}

// 重排序处理函数
function onTemplateReorder<T>(list: T[], fromIndex: number, toIndex: number): void {
  const [removed] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, removed);
}

// 监听 props 变化
watch(() => props.globalTemplates, (newVal) => {
  localTemplates.value = initializeTemplates(newVal);
}, { deep: true });
</script>

<template>
  <Modal
    :show="show"
    title="全局模板配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="handleClose"
    width="700px"
  >
    <div class="template-config-modal">
      <TabBar :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

      <div class="template-content">
        <!-- 商品名模板 -->
        <div v-if="activeTab === 'name'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addNameTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>
          
          <DraggableCardList
            :items="localTemplates.nameTemplates"
            :show-remove-button="localTemplates.nameTemplates.length > 1"
            @remove="(index) => removeTemplate(localTemplates.nameTemplates, index)"
            @reorder="(from, to) => onTemplateReorder(localTemplates.nameTemplates, from, to)"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: template }">
              <div class="form-group">
                <label>模板内容</label>
                <p class="form-hint" v-pre>可用变量：{itemName}, {supportCount}</p>
                <input v-model="template.template" type="text" placeholder="例如：{itemName}" />
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- 描述模板 -->
        <div v-else-if="activeTab === 'description'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addDescriptionTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>
          
          <DraggableCardList
            :items="localTemplates.descriptionTemplates"
            :show-remove-button="localTemplates.descriptionTemplates.length > 1"
            @remove="(index) => removeTemplate(localTemplates.descriptionTemplates, index)"
            @reorder="(from, to) => onTemplateReorder(localTemplates.descriptionTemplates, from, to)"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: template }">
              <div class="form-group">
                <label>模板内容</label>
                <p class="form-hint" v-pre>可用变量：{itemName}, {supportCount}</p>
                <textarea v-model="template.template" rows="8" placeholder="输入描述模板..."></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- 打折模板 -->
        <div v-else-if="activeTab === 'discount'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addDiscountTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>
          
          <DraggableCardList
            :items="localTemplates.discountTemplates"
            :show-remove-button="localTemplates.discountTemplates.length > 1"
            @remove="(index) => removeTemplate(localTemplates.discountTemplates, index)"
            @reorder="(from, to) => onTemplateReorder(localTemplates.discountTemplates, from, to)"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: template }">
              <div class="form-group">
                <label>模板内容</label>
                <p class="form-hint" v-pre>可用变量：{originalPrice}, {discountedPrice}, {discountPercent}</p>
                <textarea v-model="template.template" rows="4" placeholder="例如：【セール中】&#10;通常価格: ¥{originalPrice} → セール価格: ¥{discountedPrice} ({discountPercent}% OFF)"></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- 更新日志模板 -->
        <div v-else-if="activeTab === 'changelog'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addChangelogTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>
          
          <DraggableCardList
            :items="localTemplates.changelogTemplates"
            :show-remove-button="localTemplates.changelogTemplates.length > 1"
            @remove="(index) => removeTemplate(localTemplates.changelogTemplates, index)"
            @reorder="(from, to) => onTemplateReorder(localTemplates.changelogTemplates, from, to)"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: template }">
              <div class="form-group">
                <label>模板内容</label>
                <p class="form-hint" v-pre>可用变量：{date}, {content}</p>
                <textarea v-model="template.template" rows="3" placeholder="例如：◆ {date}&#10;{content}"></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- 商品信息模板 -->
        <div v-else-if="activeTab === 'itemInfo'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addItemInfoTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>
          
          <p class="hint-text">商品信息模板用于格式化 ItemTab 中的商品数据显示</p>
          
          <DraggableCardList
            :items="localTemplates.itemInfoTemplates"
            :show-remove-button="localTemplates.itemInfoTemplates.length > 1"
            @remove="(index) => removeTemplate(localTemplates.itemInfoTemplates, index)"
            @reorder="(from, to) => onTemplateReorder(localTemplates.itemInfoTemplates, from, to)"
          >
            <template #header="{ item: template }">
              <input v-model="template.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: template }">
              <div class="form-group">
                <label>模板内容</label>
                <p class="form-hint" v-pre>可用变量：{authorName}, {itemName}, {itemUrl}</p>
                <textarea v-model="template.template" rows="3" placeholder="例如：{authorName} - {itemName}"></textarea>
              </div>
            </template>
          </DraggableCardList>
        </div>

        <!-- Section 模板 -->
        <div v-else-if="activeTab === 'sections'" class="template-section">
          <div class="section-header">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addSectionTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加模板
            </button>
          </div>

          <DraggableCardList
            v-if="localTemplates.sectionTemplates.length > 0"
            :items="localTemplates.sectionTemplates"
            @remove="removeSectionTemplate"
            @reorder="(from, to) => onTemplateReorder(localTemplates.sectionTemplates, from, to)"
          >
            <template #header="{ item: section }">
              <input v-model="section.name" type="text" class="template-name-input" placeholder="模板名称" />
            </template>
            <template #content="{ item: section }">
              <div class="form-group">
                <label>Headline</label>
                <p class="form-hint" v-pre>可用变量：{itemName}, {supportCount}</p>
                <input v-model="section.headline" type="text" placeholder="Section headline" />
              </div>
              <div class="form-group">
                <label>Body</label>
                <p class="form-hint" v-pre>可用变量：{itemName}, {supportCount}</p>
                <textarea v-model="section.body" rows="4" placeholder="Section body"></textarea>
              </div>
            </template>
          </DraggableCardList>

          <div v-else class="empty-hint">
            暂无 Section 模板，点击上方按钮添加
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-secondary" @click="handleClose">
        取消
      </button>
      <button class="booth-btn booth-btn-md booth-btn-primary" @click="handleSave">
        保存
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.template-config-modal {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-md);
  min-height: 500px;
  max-height: 70vh;
}

.template-content {
  flex: 1;
  overflow-y: auto;
}

.template-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--be-space-md);
}

.hint-text {
  margin-bottom: var(--be-space-md);
  padding: 10px;
  background: var(--be-color-bg-secondary);
  border-radius: var(--be-radius);
  font-size: 12px;
  color: var(--be-color-text-secondary);
}

.template-name-input {
  flex: 1;
  font-weight: 500;
}

.form-hint {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: var(--be-color-text-secondary);
  font-style: italic;
}

.empty-hint {
  text-align: center;
  padding: var(--be-space-xl);
  color: var(--be-color-text-secondary);
  font-size: 13px;
}
</style>
