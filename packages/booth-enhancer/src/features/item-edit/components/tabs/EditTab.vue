<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { useModal, useStorage } from '../../composables';
import {
  createDefaultItemConfig,
  getSelectedDescriptionTemplate,
  getSelectedDiscountTemplate,
  getSelectedNameTemplate
} from '../../config-types';
import { applyDiscount, calculateVariationPrices } from '../../utils/priceCalculator';
import { resolveSectionContent } from '../../utils/sectionResolver';
import { calculateTotalSupport, parseTemplate } from '../../utils/templateParser';
import { Modal, SectionHeader } from '../ui';
import { icons, withSize } from '../ui/icons';
import { DraggableCardList } from '../ui/list';
import { toast } from '../ui/Toast';

import DescriptionTemplateModal from './EditTab/modals/DescriptionTemplateModal.vue';
import NameModal from './EditTab/modals/NameModal.vue';
import SectionsModal from './EditTab/modals/SectionsModal.vue';
import VariationsModal from './EditTab/modals/VariationsModal.vue';

const props = defineProps<{
  api: ItemEditAPI;
}>();

const { data } = useStorage();
const modal = useModal();

// Modal 状态 computed
const modalState = computed(() => modal.state.value);
const isPreviewModal = computed(() => 
  modalState.value.type === 'alert' && modalState.value.formData?.sectionIndex !== undefined
);
const previewSectionIndex = computed(() => 
  modalState.value.formData?.sectionIndex as number | undefined
);

// 获取当前商品ID
const currentItemId = computed(() => {
  const match = window.location.pathname.match(/\/items\/(\d+)\/edit/);
  return match ? match[1] : null;
});

// 当前商品配置（不自动创建）
const currentItemConfig = computed(() => {
  if (!currentItemId.value) return null;
  return data.value.itemConfigs[currentItemId.value] || null;
});

// 是否存在配置
const hasConfig = computed(() => currentItemConfig.value !== null);

// 全局模板配置
const globalTemplates = computed(() => data.value.globalTemplates);

// 总支持数
const totalSupport = computed(() => {
  if (!currentItemConfig.value) return 0;
  return calculateTotalSupport(currentItemConfig.value.variations);
});

// 模板变量
const templateVars = computed(() => ({
  itemName: currentItemConfig.value?.itemName || '',
  supportCount: totalSupport.value
}));

// 预览：商品名
const previewName = computed(() => {
  if (!currentItemConfig.value) return '';
  const template = getSelectedNameTemplate(globalTemplates.value, currentItemConfig.value);
  return parseTemplate(template, templateVars.value);
});

// 预览：描述
const previewDescription = computed(() => {
  if (!currentItemConfig.value) return '';
  
  const parts: string[] = [];
  
  const descTemplate = getSelectedDescriptionTemplate(globalTemplates.value, currentItemConfig.value);
  const templateDesc = parseTemplate(descTemplate, templateVars.value);
  if (templateDesc) parts.push(templateDesc);
  
  if (currentItemConfig.value.customDescription) {
    parts.push(currentItemConfig.value.customDescription);
  }
  
  if (currentItemConfig.value.discount.enabled) {
    const normalOriginalPrice = currentItemConfig.value.pricing.normalVariationPrice;
    const normalDiscountedPrice = applyDiscount(
      normalOriginalPrice,
      currentItemConfig.value.discount
    );
    
    const discountTemplate = getSelectedDiscountTemplate(globalTemplates.value, currentItemConfig.value);
    const discountText = parseTemplate(
      discountTemplate,
      {
        ...templateVars.value,
        originalPrice: normalOriginalPrice,
        discountedPrice: normalDiscountedPrice,
        discountPercent: currentItemConfig.value.discount.discountPercent
      }
    );
    parts.push(discountText);
  }
  
  return parts.join('\n\n');
});

// 解析后的Sections
const resolvedSections = computed(() => {
  if (!currentItemConfig.value) return [];
  return currentItemConfig.value.sections.map(section => {
    const resolved = resolveSectionContent(section, globalTemplates.value.sectionTemplates);
    return {
      headline: parseTemplate(resolved.headline, templateVars.value),
      body: parseTemplate(resolved.body, templateVars.value)
    };
  });
});

// Modal 状态
const showNameModal = ref(false);
const showSectionsModal = ref(false);
const showPriceModal = ref(false);
const showDescTemplateModal = ref(false);

// 创建商品配置
async function handleCreateItem() {
  const result = await modal.openModal({
    type: 'createItem',
    title: '创建商品配置',
    formData: {
      itemName: '',
      itemType: 'adaptation'
    }
  });
  
  if (result?.itemName?.trim() && currentItemId.value) {
    const config = createDefaultItemConfig(currentItemId.value);
    config.itemName = result.itemName.trim();
    config.itemType = result.itemType;
    
    data.value.itemConfigs[currentItemId.value] = config;
    toast.success('已创建商品配置');
  }
}

// 预览 Section
async function handlePreviewSection(index: number): Promise<void> {
  // 先设置 formData，确保 isPreviewModal 为 true，Modal 组件被创建
  modal.state.value.formData = { sectionIndex: index };
  modal.state.value.type = 'alert';
  modal.state.value.title = 'Section 预览';
  modal.state.value.show = false;
  
  // 等待下一个 tick，确保 Modal 组件已经创建
  await nextTick();
  
  // 然后设置 show 为 true，触发 Transition 动画
  modal.state.value.show = true;
}

// 编辑描述
async function handleEditDescription() {
  if (!currentItemConfig.value) return;
  
  const descTemplate = getSelectedDescriptionTemplate(data.value.globalTemplates, currentItemConfig.value);
  
  const result = await modal.openModal({
    type: 'editDescription',
    title: '编辑描述',
    formData: {
      descriptionTemplate: descTemplate,
      customDescription: currentItemConfig.value.customDescription
    }
  });
  
  if (result) {
    // 更新选中的描述模板内容
    const templateId = currentItemConfig.value.selectedTemplates.descriptionTemplateId;
    const template = data.value.globalTemplates.descriptionTemplates.find(t => t.id === templateId);
    if (template) {
      template.template = result.descriptionTemplate;
    }
    // 更新自定义描述
    data.value.itemConfigs[currentItemId.value!].customDescription = result.customDescription;
  }
}

// 从页面导入 Sections
function importSections(): void {
  if (!currentItemConfig.value) return;
  
  const pageSections = props.api.sections;
  
  if (pageSections.length === 0) {
    toast.info('页面没有 Sections');
    return;
  }
  
  currentItemConfig.value.sections = pageSections.map(() => ({
    id: crypto.randomUUID(),
    headline: '',
    body: ''
  }));
  
  // 读取实际内容
  pageSections.forEach((section, index) => {
    const targetSection = currentItemConfig.value?.sections[index];
    if (targetSection) {
      targetSection.headline = section.headlineInput?.value || '';
      targetSection.body = section.bodyTextarea?.value || '';
    }
  });
  
  toast.success(`已导入 ${pageSections.length} 个 Sections`);
}

// 从页面导入 Variations
function importVariations(): void {
  if (!currentItemConfig.value) return;
  
  const pageVariations = props.api.variations;
  
  if (pageVariations.length === 0) {
    toast.info('页面没有 Variations');
    return;
  }
  
  currentItemConfig.value.variations = pageVariations.map((variation) => {
    const name = variation.nameInput?.value || '';
    const isFullset = name.toLowerCase().includes('fullset');
    const priceStr = variation.priceInput?.value || '0';
    const price = parseInt(priceStr.replace(/\D/g, '')) || 0;
    
    return {
      name,
      supportCount: 1,
      price,
      isFullset
    };
  });
  
  toast.success(`已导入 ${pageVariations.length} 个 Variations`);
}

// 添加 Section
function addSection(): void {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.sections.push({
    id: crypto.randomUUID(),
    headline: '',
    body: ''
  });
}

// 删除 Section
function removeSection(index: number): void {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.sections.splice(index, 1);
}

// 应用到页面
function applyName(): void {
  if (!currentItemConfig.value) return;
  props.api.setName(previewName.value);
  toast.success('已应用商品名');
}

function applyDescription(): void {
  if (!currentItemConfig.value) return;
  props.api.setDescription(previewDescription.value);
  toast.success('已应用描述');
}

function applySections(): void {
  if (!currentItemConfig.value) return;
  resolvedSections.value.forEach((section, index) => {
    props.api.updateSection(index, {
      headline: section.headline,
      body: section.body
    });
  });
  toast.success(`已应用 ${resolvedSections.value.length} 个 Sections`);
}

function applyVariations(): void {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.variations.forEach((variation, index) => {
    props.api.updateVariation(index, {
      name: variation.name,
      price: variation.price.toString()
    });
  });
  toast.success(`已应用 ${currentItemConfig.value.variations.length} 个 Variations`);
}

function onSectionReorder(fromIndex: number, toIndex: number): void {
  if (!currentItemConfig.value) return;
  const [removed] = currentItemConfig.value.sections.splice(fromIndex, 1);
  currentItemConfig.value.sections.splice(toIndex, 0, removed);
}

function removeVariation(index: number): void {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.variations.splice(index, 1);
}

function onVariationReorder(fromIndex: number, toIndex: number): void {
  if (!currentItemConfig.value) return;
  const [removed] = currentItemConfig.value.variations.splice(fromIndex, 1);
  currentItemConfig.value.variations.splice(toIndex, 0, removed);
}

// 监听价格和打折变化
watch(
  () => currentItemConfig.value?.discount,
  () => {
    if (currentItemConfig.value) {
      calculateVariationPrices(
        currentItemConfig.value.variations,
        currentItemConfig.value.pricing,
        currentItemConfig.value.discount
      );
    }
  },
  { deep: true }
);

// === 导入/导出功能 ===

// === 价格监听 ===

watch(
  () => currentItemConfig.value?.pricing,
  () => {
    if (currentItemConfig.value) {
      calculateVariationPrices(
        currentItemConfig.value.variations,
        currentItemConfig.value.pricing,
        currentItemConfig.value.discount
      );
    }
  },
  { deep: true }
);

onMounted(() => {
  if (!currentItemId.value) {
    toast.error('无法获取商品 ID');
  }
});
</script>

<template>
  <!-- Modals（放在最外层，确保任何状态下都能显示） -->
  <Modal
    v-if="!isPreviewModal"
    :show="modalState.show"
    :title="modalState.title"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="modal.closeModal"
    width="500px"
  >
    <!-- Header Actions -->
    <template #header-actions>
      <button 
        v-if="modalState.type === 'editDescription'"
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="showDescTemplateModal = true"
        title="模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>

    <!-- 创建商品配置 -->
    <div v-if="modalState.type === 'createItem'">
      <p class="hint-text">
        为当前商品创建编辑配置，配置后可以管理商品名称、描述、Sections 和 Variations。
      </p>

      <div class="form-group">
        <label>商品名称 <span class="required">*</span></label>
        <input 
          v-model="modalState.formData.itemName" 
          type="text" 
          placeholder="输入商品名称"
          @keyup.enter="modal.confirmModal(modalState.formData)"
        />
      </div>

      <div class="form-group">
        <label>商品类型</label>
        <select v-model="modalState.formData.itemType">
          <option value="normal">普通商品</option>
          <option value="adaptation">适配商品</option>
        </select>
      </div>
    </div>

    <!-- 编辑描述 -->
    <div v-else-if="modalState.type === 'editDescription'">
      <SectionHeader title="描述模板 (全局)">
        <p class="form-hint">支持变量: {itemName}, {supportCount}</p>
        <textarea 
          v-model="modalState.formData.descriptionTemplate" 
          rows="2"
          placeholder="全局描述模板"
        ></textarea>
      </SectionHeader>

      <SectionHeader title="自定义描述 (此商品专属)">
        <textarea 
          v-model="modalState.formData.customDescription" 
          rows="3"
          placeholder="输入此商品的特殊说明..."
        ></textarea>
      </SectionHeader>

      <SectionHeader title="最终描述预览">
        <pre class="be-text-base be-font-normal be-whitespace-pre-wrap be-break-words be-m-0">{{ previewDescription }}</pre>
      </SectionHeader>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" @click="modal.closeModal" title="取消">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button 
        v-if="modalState.type === 'createItem'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        @click="modal.confirmModal(modalState.formData)"
        :disabled="!modalState.formData.itemName?.trim()"
        title="创建配置"
      >
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
      <button 
        v-else-if="modalState.type === 'editDescription'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        @click="modal.confirmModal(modalState.formData)"
        title="保存"
      >
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- 无法获取商品 ID -->
  <div v-if="!currentItemId" class="empty-state">
    <div class="empty-icon" v-html="withSize(icons.alertCircle, 48)"></div>
    <div class="be-text-lg be-font-bold">无法获取商品 ID</div>
    <p>请确保在商品编辑页面使用此功能</p>
  </div>

  <!-- 未创建配置 - 显示创建按钮 -->
  <div v-else-if="!hasConfig" class="empty-state">
    <div class="empty-icon" v-html="withSize(icons.file, 64)"></div>
    <div class="be-text-lg be-font-bold">未配置此商品</div>
    <p>为当前商品创建编辑配置，开始管理商品信息</p>
    <button class="booth-btn booth-btn-lg booth-btn-primary" @click="handleCreateItem">
      <span v-html="withSize(icons.plus, 16)"></span>
      创建商品配置
    </button>
  </div>

  <!-- 已有配置 - 显示完整编辑界面 -->
  <div v-else-if="currentItemConfig" class="edit-tab">
    <div class="edit-tab-scrollable">
      <!-- 1. 商品名编辑区 -->
      <SectionHeader title="商品名称">
        <template #actions>
          <button class="booth-btn booth-btn-sm booth-btn-secondary" 
            @click="showNameModal = true"
            title="模板设置">
            <span v-html="withSize(icons.edit, 14)"></span>
          </button>
          <button class="booth-btn booth-btn-sm booth-btn-primary" 
            @click="applyName"
            title="应用到页面">
            <span v-html="withSize(icons.send, 14)"></span>
          </button>
        </template>
        <div class="form-group">
          <div class="be-flex be-justify-between be-align-center">
            <label>商品基础名称</label>
            <span class="be-text-xs be-text-secondary">{{ previewName || '(未设置)' }}</span>
          </div>
          <input v-model="currentItemConfig.itemName" type="text" 
            placeholder="输入商品名称" />
        </div>
      </SectionHeader>

      <!-- 2. 描述预览区 -->
      <SectionHeader title="商品描述">
        <template #actions>
          <button class="booth-btn booth-btn-sm booth-btn-secondary" 
            @click="handleEditDescription"
            title="编辑描述">
            <span v-html="withSize(icons.edit, 14)"></span>
          </button>
          <button class="booth-btn booth-btn-sm booth-btn-primary" 
            @click="applyDescription"
            title="应用到页面">
            <span v-html="withSize(icons.send, 14)"></span>
          </button>
        </template>
        <div v-if="!previewDescription" class="empty-hint">
          暂无描述，点击"编辑描述"添加
        </div>
        <div v-else class="be-mt-xs">
          <pre class="be-text-base be-font-normal be-whitespace-pre-wrap be-break-words be-m-0">{{ previewDescription }}</pre>
        </div>
      </SectionHeader>

    <!-- 3. Sections 列表区 -->
    <SectionHeader :title="`Sections (${currentItemConfig.sections.length})`">
      <template #actions>
        <button class="booth-btn booth-btn-sm booth-btn-ghost" 
          @click="importSections"
          title="从页面导入">
          <span v-html="withSize(icons.download, 14)"></span>
        </button>
        <button class="booth-btn booth-btn-sm booth-btn-secondary" 
          @click="addSection"
          title="添加">
          <span v-html="withSize(icons.plus, 14)"></span>
        </button>
        <button class="booth-btn booth-btn-sm booth-btn-secondary" 
          @click="showSectionsModal = true"
          title="高级配置">
          <span v-html="withSize(icons.edit, 14)"></span>
        </button>
        <button class="booth-btn booth-btn-sm booth-btn-primary" 
          @click="applySections"
          title="应用到页面">
          <span v-html="withSize(icons.send, 14)"></span>
        </button>
      </template>

      <div v-if="currentItemConfig.sections.length === 0" class="empty-hint">
        暂无 Sections，点击"添加"或"从页面导入"
      </div>

      <DraggableCardList
        v-else
        :items="currentItemConfig.sections"
        @remove="removeSection"
        @reorder="onSectionReorder"
      >
        <template #actions="{ item: section, index }">
          <input v-model="section.headline" type="text" 
            class="be-flex-1 be-p-xs be-px-sm be-text-base be-min-w-0"
            style="height: 28px;" 
            placeholder="输入 Headline" />
          <button 
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            @click.stop.prevent="handlePreviewSection(index)"
            title="预览"
            type="button"
          >
            <span v-html="withSize(icons.eye, 14)"></span>
          </button>
        </template>
        <template #content="{ item: section }">
          <div class="form-group">
            <textarea v-model="section.body" rows="1"
              placeholder="输入 Body"></textarea>
          </div>
        </template>
      </DraggableCardList>
    </SectionHeader>

    <!-- 4. Variations 列表区 -->
    <SectionHeader :title="`Variations (${currentItemConfig.variations.length})`">
      <template #actions>
        <button class="booth-btn booth-btn-sm booth-btn-ghost" 
          @click="importVariations"
          title="从页面导入">
          <span v-html="withSize(icons.download, 14)"></span>
        </button>
        <button class="booth-btn booth-btn-sm booth-btn-secondary" 
          @click="showPriceModal = true"
          title="Variation 配置">
          <span v-html="withSize(icons.edit, 14)"></span>
        </button>
        <button class="booth-btn booth-btn-sm booth-btn-primary" 
          @click="applyVariations"
          title="应用到页面">
          <span v-html="withSize(icons.send, 14)"></span>
        </button>
      </template>

      <div v-if="currentItemConfig.variations.length === 0" class="empty-hint">
        暂无 Variations，点击"编辑价格"添加
      </div>

      <DraggableCardList
        v-else
        :items="currentItemConfig.variations"
        @remove="removeVariation"
        @reorder="onVariationReorder"
      >
        <template #actions="{ item: variation }">
          <input v-model="variation.name" type="text" 
            class="be-flex-1 be-p-xs be-px-sm be-text-base"
            style="height: 28px;" 
            placeholder="Variation 名称" />
        </template>
        <template #content="{ item: variation }">
          <div class="variation-info">
            <div class="variation-details">
              <span class="support">x{{ variation.supportCount }}</span>
              <span class="price">¥{{ variation.price }}</span>
              <span v-if="variation.isFullset" class="badge">Fullset</span>
            </div>
          </div>
        </template>
      </DraggableCardList>
    </SectionHeader>
    </div>

    <NameModal
      :show="showNameModal"
      :item-config="currentItemConfig"
      :global-templates="globalTemplates"
      :total-support="totalSupport"
      @close="showNameModal = false"
      @save="showNameModal = false"
    />

    <SectionsModal
      :show="showSectionsModal"
      :item-config="currentItemConfig"
      :global-templates="globalTemplates"
      @close="showSectionsModal = false"
    />

    <VariationsModal
      :show="showPriceModal"
      :item-config="currentItemConfig"
      @close="showPriceModal = false"
      @save="showPriceModal = false"
    />

    <!-- Section 预览 Modal -->
    <Modal
      v-if="isPreviewModal"
      :show="modalState.show"
      :title="modalState.title"
      width="500px"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="modal.closeModal"
    >
      <SectionHeader v-if="previewSectionIndex !== undefined && resolvedSections[previewSectionIndex]" no-border>
        <div class="be-flex be-flex-column be-gap-sm">
          <div>
            <div class="be-text-xs be-font-medium be-text-secondary be-mb-xs">Headline</div>
            <div class="be-text-base be-font-bold be-text-primary">{{ resolvedSections[previewSectionIndex].headline }}</div>
          </div>
          <div>
            <pre class="be-text-base be-text-secondary be-whitespace-pre-wrap be-break-words be-m-0">{{ resolvedSections[previewSectionIndex].body }}</pre>
          </div>
        </div>
      </SectionHeader>
    </Modal>

    <!-- 描述模板配置 Modal -->
    <DescriptionTemplateModal
      :show="showDescTemplateModal"
      :global-templates="globalTemplates"
      @close="showDescTemplateModal = false"
    />
  </div>
</template>

<style scoped>
/* 顶部操作栏 */
.edit-tab-header {
  display: flex;
  align-items: center;
  gap: var(--be-space-sm);
  padding: var(--be-space-md);
  border-bottom: 1px solid var(--be-color-border);
  background: var(--be-color-bg);
}

.header-spacer {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--be-space-xl);
  text-align: center;
}

.empty-icon {
  color: var(--be-color-text-muted);
  margin-bottom: var(--be-space-lg);
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 var(--be-space-lg);
  font-size: var(--be-font-size-base);
  color: var(--be-color-text-secondary);
  max-width: 400px;
}

.empty-hint {
  padding: var(--be-space-md);
  text-align: center;
  color: var(--be-color-text-secondary);
  font-size: var(--be-font-size-md);
  background: var(--be-color-bg-secondary);
  border-radius: var(--be-radius);
}

/* 编辑区域 */
.edit-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.edit-tab-scrollable {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* section-header 和 empty-hint 样式已移至通用组件 */

/* Section 预览区样式（DraggableCardList footer 插槽内容） */
.section-preview {
  padding: var(--be-space-sm);
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
}

.preview-label {
  font-size: var(--be-font-size-xs);
  font-weight: 500;
  color: var(--be-color-text-muted);
  margin-bottom: 4px;
}

.preview-headline {
  font-size: var(--be-font-size-base);
  font-weight: 600;
  color: var(--be-color-text);
  margin-bottom: 4px;
}

.preview-body {
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Variations 列表 */
.variation-info {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-sm);
}

.variation-details {
  display: flex;
  align-items: center;
  gap: var(--be-space-sm);
}

.variation-details .support {
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
  padding: 2px 6px;
  background: var(--be-color-bg);
  border-radius: var(--be-radius-sm);
}

.variation-details .price {
  font-size: var(--be-font-size-base);
  font-weight: 600;
  color: var(--be-color-success);
}

.variation-details .badge {
  font-size: var(--be-font-size-xs);
  font-weight: 600;
  color: var(--be-color-primary);
  background: #dbeafe;
  padding: 2px var(--be-space-sm);
  border-radius: var(--be-radius-full);
}

/* 错误状态 */
.error-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--be-color-danger);
  font-size: var(--be-font-size-lg);
}
</style>
