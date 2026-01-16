<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { GlobalTemplateConfig, ItemData, ItemEditConfig, NodeTree } from '../../../../config-types';
import { getSelectedDiscountIndicatorTemplate, getSelectedNameTemplate } from '../../../../config-types';
import { calculateTotalSupport, parseTemplate, pluralize } from '../../../../utils/templateParser';
import { PreviewBox } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import TemplateSelector from '../../../ui/TemplateSelector.vue';
import NameTemplateModal from './NameTemplateModal.vue';
import { BUTTON_CLASSES } from './template-hints';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  totalSupport: number;
  itemTree: NodeTree<ItemData>;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

// 初始化 selectedTemplates（如果不存在）
function initializeSelectedTemplates(): void {
  if (!props.itemConfig.selectedTemplates) {
    props.itemConfig.selectedTemplates = {
      nameTemplateId: props.globalTemplates.nameTemplates?.[0]?.id || '',
      descriptionTemplateId: props.globalTemplates.descriptionTemplates?.[0]?.id || '',
      discountTemplateId: props.globalTemplates.discountTemplates?.[0]?.id || '',
      discountIndicatorTemplateId: props.globalTemplates.discountIndicatorTemplates?.[0]?.id || ''
    };
  }
}

onMounted(initializeSelectedTemplates);

// 模板配置 Modal 状态
const showTemplateModal = ref(false);

// 计算模板变量（用于预览）
const templateVars = computed(() => {
  const config = props.itemConfig;
  if (!config) return { itemName: '', supportCount: 0 };
  
  const normalVariations = config.variations.filter(v => !v.isFullset);
  const firstVariation = normalVariations[0];
  const supportCount = calculateTotalSupport(config.variations);
  const itemTypeName = config.itemTypeName || 'Item';
  
  // 获取首个变体名
  const firstItemId = firstVariation?.fileItemMap ? Object.values(firstVariation.fileItemMap)[0] : null;
  const getItemName = (itemId: string) => {
    const node = props.itemTree.nodes[itemId];
    if (!node) return '未知商品';
    const itemData = node.data;
    if (!itemData) return node.name;
    return itemData.itemName;
  };
  const firstName = firstVariation?.name 
    || (firstItemId && getItemName(firstItemId))
    || config.itemName;
  
  // 智能标题
  const smartTitle = (normalVariations.length > 1 || supportCount > 1)
    ? `${supportCount} ${pluralize(itemTypeName, supportCount)}`
    : firstName;
  
  // 获取折扣标识
  const discountIndicatorTemplate = config.discount.enabled 
    ? getSelectedDiscountIndicatorTemplate(props.globalTemplates, config)
    : '';
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

// 预览商品名
const previewName = computed((): string => {
  const template = getSelectedNameTemplate(props.globalTemplates, props.itemConfig);
  return parseTemplate(template, templateVars.value);
});

// 保存并关闭
function handleSave(): void {
  emit('save');
  emit('close');
}
</script>

<template>
  <Modal
    :show="show"
    title="编辑商品名"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="showTemplateModal = true"
        title="模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>
    <div class="modal-content">
      <div class="form-group">
        <label>商品基础名称</label>
        <input v-model="itemConfig.itemName" type="text" 
          placeholder="输入商品名称" />
      </div>

      <div class="form-group">
        <label>商品类型</label>
        <select v-model="itemConfig.itemType">
          <option value="normal">普通商品</option>
          <option value="adaptation">适配商品</option>
        </select>
      </div>

      <div class="form-group">
        <label>商品类型名称 <span class="label-hint">(用于生成复数形式，如 Avatar → Avatars)</span></label>
        <input 
          v-model="itemConfig.itemTypeName" 
          type="text" 
          placeholder="如: Avatar, Model, Texture" 
        />
      </div>

      <TemplateSelector
        v-model="itemConfig.selectedTemplates.nameTemplateId"
        :templates="globalTemplates.nameTemplates"
        label="选择商品名模板"
        empty-hint="请先在全局模板配置中添加商品名模板"
      />

      <div class="form-group">
        <TemplateSelector
          v-model="itemConfig.selectedTemplates.discountIndicatorTemplateId"
          :templates="globalTemplates.discountIndicatorTemplates"
          label="折扣标识模板"
          empty-hint="请先在商品名模板配置中添加折扣标识模板"
        />
        <p class="form-hint be-text-xs be-text-secondary be-mt-xs">
          折扣标识会在启用打折时自动显示（在 Variation 配置中启用）
        </p>
      </div>

      <PreviewBox v-if="previewName" label="商品名预览:" type="text">
        <span class="be-text-primary be-text-lg be-font-semibold">{{ previewName }}</span>
      </PreviewBox>
    </div>

    <template #footer>
      <button :class="BUTTON_CLASSES.closeButton" @click="emit('close')" title="取消">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button :class="BUTTON_CLASSES.saveButton" @click="handleSave" title="保存">
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- 模板配置 Modal -->
  <NameTemplateModal
    :show="showTemplateModal"
    :global-templates="globalTemplates"
    :item-config="itemConfig"
    :item-tree="itemTree"
    @close="showTemplateModal = false"
  />
</template>
