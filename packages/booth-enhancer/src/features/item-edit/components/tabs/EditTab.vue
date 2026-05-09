<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { useApiFiles, useModal, useStorage } from '../../composables';
import { createDefaultItemConfig, getSelectedDescriptionTemplate, getSelectedDiscountIndicatorTemplate, getSelectedDiscountTemplate } from '../../config-types';
import { applyDiscountPercent, calculateVariationPrices, getActiveDiscount } from '../../utils/priceCalculator';
import { resolveSectionContent, type ResolveContext } from '../../utils/sectionResolver';
import { calculateTotalSupport, formatDateTime, parseTemplate, pluralize } from '../../utils/templateParser';
import { FileSelector, Modal, PreviewBox } from '../ui';
import { icons, withSize } from '../ui/icons';
import { toast } from '../ui/Toast';

import DescriptionTemplateModal from './EditTab/modals/DescriptionTemplateModal.vue';
import PricingModal from './EditTab/modals/PricingModal.vue';
import SelectItemModal from './EditTab/modals/SelectItemModal.vue';
import ItemDescriptionSection from './EditTab/sections/ItemDescriptionSection.vue';
import ItemNameSection from './EditTab/sections/ItemNameSection.vue';
import SectionsListSection from './EditTab/sections/SectionsListSection.vue';
import TagsSection from './EditTab/sections/TagsSection.vue';
import VariationsListSection from './EditTab/sections/VariationsListSection.vue';

const props = defineProps<{
  api: ItemEditAPI;
}>();

const { data } = useStorage();
const modal = useModal();

// 响应式的文件列表（监听 Booth 文件面板 DOM 变化）
const { files: reactiveFiles } = useApiFiles(props.api);

// Modal 状态
const modalState = computed(() => modal.state.value);

const isPreviewModal = computed(() => {
  const state = modalState.value;
  return state.type === 'alert' && state.formData?.sectionIndex !== undefined;
});

// 通用 Modal：排除预览、选择商品、选择文件
const isGeneralModal = computed(() => 
  !isPreviewModal.value 
  && modalState.value.type !== 'selectItem' 
  && modalState.value.type !== 'selectFile'
);

const previewSectionIndex = computed((): number | undefined => 
  modalState.value.formData?.sectionIndex as number | undefined
);

const showDescTemplateModal = ref(false);
const showPricingModal = ref(false);

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

// 模板变量（供子组件使用）
const templateVars = computed(() => {
  const config = currentItemConfig.value;
  if (!config) return { itemName: '', supportCount: 0 };
  
  const normalVariations = config.variations.filter(v => !v.isFullset);
  const firstVariation = normalVariations[0];
  const supportCount = totalSupport.value;
  const itemTypeName = config.itemTypeName || 'Item';
  
  // 获取首个变体名：优先级 variation.name > 关联商品名 > config.itemName
  const firstItemId = firstVariation?.fileItemMap ? Object.values(firstVariation.fileItemMap).flat()[0] : null;
  const getItemName = (itemId: string) => {
    const node = data.value.itemTree.nodes[itemId];
    if (!node) return '未知商品';
    const itemData = node.data;
    if (!itemData) return node.name;
    return itemData.itemName;
  };
  const firstName = firstVariation?.name 
    || (firstItemId && getItemName(firstItemId))
    || config.itemName;
  
  // 智能标题：多个 variation 或支持数>1时显示数量+类型，否则显示名字
  const smartTitle = (normalVariations.length > 1 || supportCount > 1)
    ? `${supportCount} ${pluralize(itemTypeName, supportCount)}`
    : firstName;
  
  // 获取折扣标识模板
  const discountIndicatorTemplate = config.discount.enabled 
    ? getSelectedDiscountIndicatorTemplate(globalTemplates.value, config)
    : '';
  
  // 解析折扣标识模板（取当前生效时段的折扣百分比）
  const activePeriod = getActiveDiscount(config.discount);
  const discountIndicator = parseTemplate(discountIndicatorTemplate, {
    discountPercent: activePeriod?.discountPercent ?? 0
  });
  
  return {
    itemName: config.itemName || '',
    supportCount,
    itemTypeName,
    itemTypePlural: pluralize(itemTypeName, supportCount),
    variationCount: normalVariations.length,
    firstName,
    smartTitle,
    discountIndicator
  };
});

// 计算解析后的 Sections（供预览 modal 使用）
const resolvedSections = computed(() => {
  if (!currentItemConfig.value) return [];
  
  const context: ResolveContext = {
    variations: currentItemConfig.value.variations,
    itemTree: data.value.itemTree
  };
  
  return currentItemConfig.value.sections.map(section => {
    const resolved = resolveSectionContent(section, globalTemplates.value, context);
    return {
      headline: parseTemplate(resolved.headline, templateVars.value),
      body: parseTemplate(resolved.body, templateVars.value)
    };
  });
});

// 预览描述（供编辑描述 modal 使用）
const previewDescription = computed((): string => {
  if (!currentItemConfig.value) return '';
  
  const parts: string[] = [];
  
  const descTemplate = getSelectedDescriptionTemplate(globalTemplates.value, currentItemConfig.value);
  const templateDesc = parseTemplate(descTemplate, templateVars.value);
  if (templateDesc) parts.push(templateDesc);
  
  // 使用 modal 中正在编辑的描述（如果在编辑中）
  const customDesc = modalState.value.type === 'editDescription' 
    ? modalState.value.formData?.customDescription 
    : currentItemConfig.value.customDescription;
    
  if (customDesc) {
    parts.push(customDesc);
  }
  
  if (currentItemConfig.value.discount.enabled && currentItemConfig.value.discount.periods.length > 0) {
    const normalOriginalPrice = currentItemConfig.value.pricing.normalVariationPrice;
    const fullsetOriginalPrice = currentItemConfig.value.pricing.fullsetPrice;
    const discountTpl = getSelectedDiscountTemplate(globalTemplates.value, currentItemConfig.value);
    
    if (discountTpl) {
      // B 方案：header 渲染一次 + periodTemplate 循环每个时段
      const headerText = discountTpl.header || '';
      const periodTpl = discountTpl.periodTemplate || (discountTpl as any).template || '';
      
      const periodTexts = currentItemConfig.value.discount.periods.map(period => {
        const normalDiscountedPrice = applyDiscountPercent(normalOriginalPrice, period.discountPercent);
        const fullsetDiscountedPrice = applyDiscountPercent(fullsetOriginalPrice, period.discountPercent);
        
        return parseTemplate(periodTpl, {
          ...templateVars.value,
          originalPrice: normalOriginalPrice,
          discountedPrice: normalDiscountedPrice,
          discountPercent: period.discountPercent,
          fullsetOriginalPrice: fullsetOriginalPrice,
          fullsetDiscountedPrice: fullsetDiscountedPrice,
          startDate: formatDateTime(period.startDate),
          endDate: formatDateTime(period.endDate)
        });
      });
      
      const discountBlock = [headerText, ...periodTexts].filter(Boolean).join('\n');
      parts.push(discountBlock);
    }
  }
  
  return parts.join('\n\n');
});

// 创建商品配置
async function handleCreateItem(): Promise<void> {
  const result = await modal.openModal({
    type: 'createItem',
    title: '创建商品配置',
    formData: {
      itemName: '',
      itemType: 'adaptation',
      itemTypeName: 'Avatar'
    }
  });
  
  if (result?.itemName?.trim() && currentItemId.value) {
    const config = createDefaultItemConfig(currentItemId.value);
    config.itemName = result.itemName.trim();
    config.itemType = result.itemType;
    const typeName = result.itemTypeName?.trim();
    if (typeName) {
      config.itemTypeName = typeName;
    }
    
    data.value.itemConfigs[currentItemId.value] = config;
    toast.success('已创建商品配置');
  }
}

// 处理描述更新（由子组件调用）
function handleDescriptionUpdated(description: string): void {
  if (currentItemId.value) {
    data.value.itemConfigs[currentItemId.value].customDescription = description;
  }
}

// 文件选择相关
const tempSelectedFileIds = ref<string[]>([]);

// 商品选择 modal 状态
const showSelectItemModal = ref(false);
const selectItemModalInitialIds = ref<string[]>([]);

// 监听 modal 显示状态，自动初始化或清空选择值
watch(() => modalState.value.show, (isOpen) => {
  if (!isOpen) {
    tempSelectedFileIds.value = [];
    showSelectItemModal.value = false;
    return;
  }
  
  const { type, formData } = modalState.value;
  
  if (type === 'selectItem' && formData?.itemIds) {
    selectItemModalInitialIds.value = [...formData.itemIds];
    showSelectItemModal.value = true;
  }
  
  if (type === 'selectFile' && formData?.fileIds) {
    tempSelectedFileIds.value = [...formData.fileIds];
  }
})

// 处理商品选择完成
function handleSelectItemSave(itemIds: string[]): void {
  modal.confirmModal({ itemIds });
  showSelectItemModal.value = false;
}

function handleSelectItemClose(): void {
  modal.closeModal();
  showSelectItemModal.value = false;
}

// 监听价格和折扣变化，自动更新 variation 价格
watch(
  () => {
    if (!currentItemConfig.value) return null;
    return {
      pricing: currentItemConfig.value.pricing,
      discount: currentItemConfig.value.discount
    };
  },
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

// Section 引用
const itemNameSectionRef = ref<InstanceType<typeof ItemNameSection> | null>(null);
const itemDescriptionSectionRef = ref<InstanceType<typeof ItemDescriptionSection> | null>(null);
const sectionsListSectionRef = ref<InstanceType<typeof SectionsListSection> | null>(null);
const tagsSectionRef = ref<InstanceType<typeof TagsSection> | null>(null);
const variationsListSectionRef = ref<InstanceType<typeof VariationsListSection> | null>(null);

// 应用所有配置
async function applyAll() {
  if (!currentItemConfig.value) {
    toast.error('没有配置数据');
    return;
  }

  try {
    // 按顺序应用各个 section
    await itemNameSectionRef.value?.applyName();
    await itemDescriptionSectionRef.value?.applyDescription();
    await sectionsListSectionRef.value?.applySections();
    await tagsSectionRef.value?.applyTags();
    
    // 仅适配商品应用 variations
    if (currentItemConfig.value.itemType === 'adaptation') {
      await variationsListSectionRef.value?.applyVariations();
    }
    
    toast.success('所有配置应用完成');
  } catch (error) {
    console.error('应用配置失败:', error);
    toast.error('应用配置失败');
  }
}

// 暴露给父组件
defineExpose({
  applyAll
});
</script>

<template>
  <!-- Modals（放在最外层，确保任何状态下都能显示） -->
  <Modal
    :show="modalState.show && isGeneralModal"
    :title="modalState.title"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="modal.closeModal"
  >
    <!-- Header Actions -->
    <template #header-actions>
      <button 
        v-if="modalState.type === 'editDescription'"
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        type="button"
        title="模板配置"
        @click="showDescTemplateModal = true"
      >
        <span v-html="withSize(icons.settings, 16)"></span>
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

      <div class="form-group">
        <label>
          商品类型名称
          <span class="label-hint">（用于生成复数形式，如 Avatar → Avatars）</span>
        </label>
        <input 
          v-model="modalState.formData.itemTypeName" 
          type="text" 
          placeholder="如: Avatar, Model, Texture"
          @keyup.enter="modal.confirmModal(modalState.formData)"
        />
      </div>
    </div>

    <!-- 编辑描述 -->
    <div v-else-if="modalState.type === 'editDescription'" class="be-flex be-flex-column be-gap-sm">
      <div class="form-group">
        <label>自定义描述 (此商品专属)</label>
        <textarea 
          v-model="modalState.formData.customDescription" 
          rows="8"
          placeholder="输入此商品的特殊说明..."
        ></textarea>
      </div>

      <PreviewBox label="最终描述预览" type="pre">{{ previewDescription }}</PreviewBox>
    </div>

    <!-- 通用确认 / 危险操作 -->
    <div v-else-if="modalState.type === 'delete'" class="modal-content">
      <p class="modal-message">{{ modalState.formData?.message || '确认执行此操作？' }}</p>
    </div>

    <template #footer>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" 
        type="button"
        title="取消"
        @click="modal.closeModal"
      >
        <span v-html="withSize(icons.close, 16)"></span>
      </button>
      <button 
        v-if="modalState.type === 'createItem'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="创建配置"
        :disabled="!modalState.formData.itemName?.trim()"
        @click="modal.confirmModal(modalState.formData)"
      >
        <span v-html="withSize(icons.check, 16)"></span>
      </button>
      <button 
        v-else-if="modalState.type === 'editDescription'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="保存"
        @click="modal.confirmModal(modalState.formData)"
      >
        <span v-html="withSize(icons.check, 16)"></span>
      </button>
      <button 
        v-else-if="modalState.type === 'delete'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-danger" 
        type="button"
        title="确认"
        @click="modal.confirmModal(true)"
      >
        <span v-html="withSize(icons.check, 16)"></span>
      </button>
    </template>
  </Modal>

  <!-- 无法获取商品 ID -->
  <div v-if="!currentItemId" class="empty-state">
    <div class="empty-icon-wrap empty-icon-wrap--warning">
      <span v-html="withSize(icons.alertCircle, 40)"></span>
    </div>
    <div class="empty-title">无法获取商品 ID</div>
    <p class="empty-subtitle">请确保在商品编辑页面使用此功能</p>
  </div>

  <!-- 未创建配置 - 显示创建按钮 -->
  <div v-else-if="!hasConfig" class="empty-state">
    <div class="empty-icon-wrap empty-icon-wrap--primary">
      <span v-html="withSize(icons.file, 40)"></span>
    </div>
    <div class="empty-title">还没有为这个商品创建配置</div>
    <p class="empty-subtitle">
      创建配置后可以统一管理名称、描述、Sections、Tags 和 Variations，一键应用到 Booth 编辑页
    </p>
    <button class="booth-btn booth-btn-lg booth-btn-primary empty-cta" @click="handleCreateItem">
      <span v-html="withSize(icons.plus, 16)"></span>
      <span>创建商品配置</span>
    </button>
  </div>

  <!-- 已有配置 - 显示完整编辑界面 -->
  <div v-else-if="currentItemConfig" class="edit-tab">
    <!-- 工具栏（固定，不随内容滚动） -->
    <div class="edit-tab-toolbar">
      <span class="toolbar-badge" title="适配数量">{{ totalSupport }} {{ currentItemConfig.itemTypeName || 'Items' }}</span>
      <span 
        v-if="currentItemConfig.discount.enabled" 
        class="toolbar-badge toolbar-badge--sale"
        title="折扣已启用"
      >SALE</span>
      <div style="flex: 1;"></div>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary"
        type="button"
        title="价格与折扣配置"
        @click="showPricingModal = true"
      >
        <span v-html="withSize(icons.settings, 14)"></span>
        <span>价格</span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary"
        type="button"
        title="应用所有配置到页面"
        @click="applyAll"
      >
        <span v-html="withSize(icons.send, 14)"></span>
        <span>应用所有</span>
      </button>
    </div>

    <div class="edit-tab-scrollable">
      <!-- 1. 商品名编辑区 -->
      <ItemNameSection
        ref="itemNameSectionRef"
        :item-config="currentItemConfig"
        :global-templates="globalTemplates"
        :template-vars="templateVars"
        :api="api"
        :total-support="totalSupport"
        :item-tree="data.itemTree"
      />

      <!-- 2. 商品描述区 -->
      <ItemDescriptionSection
        ref="itemDescriptionSectionRef"
        :item-config="currentItemConfig"
        :global-templates="globalTemplates"
        :template-vars="templateVars"
        :api="api"
        :modal="modal"
        :current-item-id="currentItemId!"
        :on-description-updated="handleDescriptionUpdated"
      />

      <!-- 3. Sections 列表区 -->
      <SectionsListSection
        ref="sectionsListSectionRef"
        :item-config="currentItemConfig"
        :global-templates="globalTemplates"
        :template-vars="templateVars"
        :api="api"
        :modal="modal"
        :item-tree="data.itemTree"
      />

      <!-- 4. Tags 区 -->
      <TagsSection
        ref="tagsSectionRef"
        :item-config="currentItemConfig"
        :api="api"
        :item-tree="data.itemTree"
        :tag-tree="data.tagTree"
      />

      <!-- 5. Variations 列表区（仅适配商品显示）-->
      <VariationsListSection
        v-if="currentItemConfig.itemType === 'adaptation'"
        ref="variationsListSectionRef"
        :item-config="currentItemConfig"
        :api="api"
        :modal="modal"
        :item-tree="data.itemTree"
      />
    </div>

    <!-- Section 预览 Modal -->
    <Modal
      :show="modalState.show && isPreviewModal"
      :title="modalState.title"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="modal.closeModal"
    >
      <PreviewBox v-if="previewSectionIndex !== undefined && resolvedSections[previewSectionIndex]" label="Section 预览:" type="pre">
        <div class="be-text-primary be-font-bold be-mb-sm">{{ resolvedSections[previewSectionIndex].headline }}</div>
        <div class="be-text-secondary">{{ resolvedSections[previewSectionIndex].body }}</div>
      </PreviewBox>
    </Modal>

    <!-- 商品选择 Modal -->
    <SelectItemModal
      :show="showSelectItemModal"
      :item-tree="data.itemTree"
      :initial-selected-ids="selectItemModalInitialIds"
      @close="handleSelectItemClose"
      @save="handleSelectItemSave"
    />

    <!-- 文件选择 Modal -->
    <Modal
      :show="modalState.show && modalState.type === 'selectFile'"
      :title="modalState.title"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="modal.closeModal"
    >
      <div class="be-flex be-flex-column be-gap-sm">
        <p class="form-hint be-text-xs be-text-secondary">
          点击选择文件（可多选，已选择: {{ tempSelectedFileIds.length }}）
        </p>
        
        <FileSelector
          :files="reactiveFiles"
          :selected-file-ids="tempSelectedFileIds"
          @update:selected-file-ids="tempSelectedFileIds = $event"
        />
      </div>
      
      <template #footer>
        <button 
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary"
          type="button"
          title="取消"
          @click="modal.closeModal"
        >
          <span v-html="withSize(icons.close, 16)"></span>
        </button>
        <button 
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          type="button"
          title="确认"
          @click="modal.confirmModal({ fileIds: tempSelectedFileIds })"
        >
          <span v-html="withSize(icons.check, 16)"></span>
        </button>
      </template>
    </Modal>

    <!-- 描述模板配置 Modal -->
    <DescriptionTemplateModal
      :show="showDescTemplateModal"
      :global-templates="globalTemplates"
      @close="showDescTemplateModal = false"
    />

    <!-- 价格/折扣配置 Modal -->
    <PricingModal
      :show="showPricingModal"
      :item-config="currentItemConfig"
      :global-templates="globalTemplates"
      @close="showPricingModal = false"
    />
  </div>
</template>

<style scoped>
/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--be-space-xl);
  text-align: center;
  gap: var(--be-space-md);
}

.empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: var(--be-space-xs);
}

.empty-icon-wrap--primary {
  background: rgba(59, 130, 246, 0.08);
  color: var(--be-color-primary);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.04);
}

.empty-icon-wrap--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--be-color-warning);
  box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.05);
}

.empty-title {
  font-size: var(--be-font-size-xl);
  font-weight: 600;
  color: var(--be-color-text);
  letter-spacing: -0.01em;
}

.empty-subtitle {
  margin: 0;
  font-size: var(--be-font-size-md);
  line-height: 1.55;
  color: var(--be-color-text-secondary);
  max-width: 360px;
}

.empty-cta {
  margin-top: var(--be-space-xs);
  gap: 6px;
}

/* 编辑区域 */
.edit-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.edit-tab-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.edit-tab-toolbar .booth-btn {
  gap: 4px;
}

.toolbar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--be-color-primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.toolbar-badge--sale {
  background: var(--be-color-success);
}

.edit-tab-scrollable {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 商品选择列表 */
.item-select-list {
  max-height: 400px;
  overflow-y: auto;
}

.item-select-btn {
  width: 100%;
  justify-content: flex-start;
  padding: var(--be-space-sm);
}

.item-select-btn:hover {
  background: var(--be-color-bg-hover);
}

/* 通用 Modal 消息样式 */
.modal-message {
  color: var(--be-color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}
</style>
