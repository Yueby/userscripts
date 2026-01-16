<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { useModal, useStorage } from '../../composables';
import { createDefaultItemConfig, getSelectedDescriptionTemplate, getSelectedDiscountIndicatorTemplate, getSelectedDiscountTemplate } from '../../config-types';
import { applyDiscount, calculateVariationPrices } from '../../utils/priceCalculator';
import { resolveSectionContent, type ResolveContext } from '../../utils/sectionResolver';
import { calculateTotalSupport, formatDateTime, parseTemplate, pluralize } from '../../utils/templateParser';
import { FileSelector, Modal, PreviewBox } from '../ui';
import { icons, withSize } from '../ui/icons';
import { toast } from '../ui/Toast';

import DescriptionTemplateModal from './EditTab/modals/DescriptionTemplateModal.vue';
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
  const firstItemId = firstVariation?.fileItemMap ? Object.values(firstVariation.fileItemMap)[0] : null;
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
  
  // 解析折扣标识模板（支持 {折扣百分比} 变量）
  const discountIndicator = parseTemplate(discountIndicatorTemplate, {
    discountPercent: config.discount.discountPercent
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
  
  if (currentItemConfig.value.discount.enabled) {
    const normalOriginalPrice = currentItemConfig.value.pricing.normalVariationPrice;
    const normalDiscountedPrice = applyDiscount(
      normalOriginalPrice,
      currentItemConfig.value.discount
    );
    const fullsetOriginalPrice = currentItemConfig.value.pricing.fullsetPrice;
    const fullsetDiscountedPrice = applyDiscount(
      fullsetOriginalPrice,
      currentItemConfig.value.discount
    );
    
    const discountTemplate = getSelectedDiscountTemplate(globalTemplates.value, currentItemConfig.value);
    const discountText = parseTemplate(
      discountTemplate,
      {
        ...templateVars.value,
        originalPrice: normalOriginalPrice,
        discountedPrice: normalDiscountedPrice,
        discountPercent: currentItemConfig.value.discount.discountPercent,
        fullsetOriginalPrice: fullsetOriginalPrice,
        fullsetDiscountedPrice: fullsetDiscountedPrice,
        startDate: formatDateTime(currentItemConfig.value.discount.startDate),
        endDate: formatDateTime(currentItemConfig.value.discount.endDate)
      }
    );
    parts.push(discountText);
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

// 处理描述更新（由子组件调用）
function handleDescriptionUpdated(description: string): void {
  if (currentItemId.value) {
    data.value.itemConfigs[currentItemId.value].customDescription = description;
  }
}

// 商品选择相关（供所有子组件使用）
const tempSelectedItems = ref<string[]>([]);
const tempSelectedFileIds = ref<string[]>([]);

function toggleItemSelection(itemId: string): void {
  const index = tempSelectedItems.value.indexOf(itemId);
  if (index > -1) {
    tempSelectedItems.value.splice(index, 1);
  } else {
    tempSelectedItems.value.push(itemId);
  }
}

function isItemSelected(itemId: string): boolean {
  return tempSelectedItems.value.includes(itemId);
}

// 监听 modal 显示状态，自动初始化或清空选择值
watch(() => modalState.value.show, (isOpen) => {
  if (!isOpen) {
    tempSelectedItems.value = [];
    tempSelectedFileIds.value = [];
    return;
  }
  
  const { type, formData } = modalState.value;
  
  if (type === 'selectItem' && formData?.itemIds) {
    tempSelectedItems.value = [...formData.itemIds];
  }
  
  if (type === 'selectFile' && formData?.fileIds) {
    tempSelectedFileIds.value = [...formData.fileIds];
  }
})

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
    await variationsListSectionRef.value?.applyVariations();
    
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

    <template #footer>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" 
        type="button"
        title="取消"
        @click="modal.closeModal"
      >
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button 
        v-if="modalState.type === 'createItem'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="创建配置"
        :disabled="!modalState.formData.itemName?.trim()"
        @click="modal.confirmModal(modalState.formData)"
      >
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
      <button 
        v-else-if="modalState.type === 'editDescription'"
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="保存"
        @click="modal.confirmModal(modalState.formData)"
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

      <!-- 5. Variations 列表区 -->
      <VariationsListSection
        ref="variationsListSectionRef"
        :item-config="currentItemConfig"
        :global-templates="globalTemplates"
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
    <Modal
      :show="modalState.show && modalState.type === 'selectItem'"
      :title="modalState.title"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="modal.closeModal"
    >
      <div class="be-flex be-flex-column be-gap-sm">
        <p class="form-hint be-text-xs be-text-secondary">
          点击选择/取消商品关联（已选择: {{ tempSelectedItems.length }}）
        </p>
        
        <div 
          v-if="Object.keys(data.itemTree.nodes).filter(id => data.itemTree.nodes[id].data).length > 0"
          class="item-select-list"
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;"
        >
          <button
            v-for="nodeId in Object.keys(data.itemTree.nodes).filter(id => data.itemTree.nodes[id].data)"
            :key="nodeId"
            class="item-select-btn booth-btn booth-btn-sm booth-btn-ghost be-text-left"
            type="button"
            :style="{
              padding: '6px 8px',
              backgroundColor: isItemSelected(nodeId) ? 'rgba(59, 130, 246, 0.1)' : undefined,
              borderColor: isItemSelected(nodeId) ? 'rgba(59, 130, 246, 0.3)' : undefined
            }"
            @click="toggleItemSelection(nodeId)"
          >
            <div class="be-flex be-flex-column" style="gap: 2px;">
              <span class="be-text-sm be-font-medium">{{ data.itemTree.nodes[nodeId].data?.itemName || data.itemTree.nodes[nodeId].name }}</span>
              <span class="be-text-xs be-text-secondary">{{ data.itemTree.nodes[nodeId].data?.authorName }}</span>
            </div>
          </button>
        </div>
        
        <div v-else class="empty-hint">
          暂无商品数据，请先在 ItemTab 中添加
        </div>
      </div>
      
      <template #footer>
        <button 
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary"
          type="button"
          title="取消"
          @click="modal.closeModal"
        >
          <span v-html="withSize(icons.close, 18)"></span>
        </button>
        <button 
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          type="button"
          title="确认"
          @click="modal.confirmModal({ itemIds: tempSelectedItems })"
        >
          <span v-html="withSize(icons.check, 18)"></span>
        </button>
      </template>
    </Modal>

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
          :files="api.files"
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
          <span v-html="withSize(icons.close, 18)"></span>
        </button>
        <button 
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          type="button"
          title="确认"
          @click="modal.confirmModal({ fileIds: tempSelectedFileIds })"
        >
          <span v-html="withSize(icons.check, 18)"></span>
        </button>
      </template>
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
</style>
