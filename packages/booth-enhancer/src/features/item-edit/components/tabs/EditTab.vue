<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { useModal, useStorage } from '../../composables';
import {
  createDefaultItemConfig,
  getSelectedDescriptionTemplate,
  getSelectedDiscountTemplate,
  getSelectedNameTemplate,
  type GlobalTemplateConfig,
  type SingleItemConfig
} from '../../config-types';
import { downloadJSON, readJSONFile, triggerFileInput } from '../../utils/exportHelper';
import { applyDiscount, calculateVariationPrices } from '../../utils/priceCalculator';
import { resolveSectionContent } from '../../utils/sectionResolver';
import { calculateTotalSupport, parseTemplate } from '../../utils/templateParser';
import { Modal } from '../ui';
import { icons, withSize } from '../ui/icons';
import { DraggableCardList } from '../ui/list';
import { toast } from '../ui/Toast';

import NameModal from './EditTab/modals/NameModal.vue';
import PriceModal from './EditTab/modals/PriceModal.vue';
import SectionsModal from './EditTab/modals/SectionsModal.vue';
import TemplateConfigModal from './EditTab/modals/TemplateConfigModal.vue';

const props = defineProps<{
  api: ItemEditAPI;
}>();

const { data, exportSingleItem, importSingleItem } = useStorage();
const modal = useModal();

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
const showTemplateModal = ref(false);
const showImportConflictDialog = ref(false);
const pendingImportConfig = ref<SingleItemConfig | null>(null);

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
function importSections() {
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
    if (currentItemConfig.value!.sections[index]) {
      currentItemConfig.value!.sections[index].headline = 
        section.headlineInput?.value || '';
      currentItemConfig.value!.sections[index].body = 
        section.bodyTextarea?.value || '';
    }
  });
  
  toast.success(`已导入 ${pageSections.length} 个 Sections`);
}

// 从页面导入 Variations
function importVariations() {
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
function addSection() {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.sections.push({
    id: crypto.randomUUID(),
    headline: '',
    body: ''
  });
}

// 删除 Section
function removeSection(index: number) {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.sections.splice(index, 1);
}

// 应用到页面
function applyName() {
  if (!currentItemConfig.value) return;
  props.api.setName(previewName.value);
  toast.success('已应用商品名');
}

function applyDescription() {
  if (!currentItemConfig.value) return;
  props.api.setDescription(previewDescription.value);
  toast.success('已应用描述');
}

function applySections() {
  if (!currentItemConfig.value) return;
  resolvedSections.value.forEach((section, index) => {
    props.api.updateSection(index, {
      headline: section.headline,
      body: section.body
    });
  });
  toast.success(`已应用 ${resolvedSections.value.length} 个 Sections`);
}

function applyVariations() {
  if (!currentItemConfig.value) return;
  currentItemConfig.value.variations.forEach((variation, index) => {
    props.api.updateVariation(index, {
      name: variation.name,
      price: variation.price.toString()
    });
  });
  toast.success(`已应用 ${currentItemConfig.value.variations.length} 个 Variations`);
}

function applyAll() {
  applyName();
  applyDescription();
  applySections();
  applyVariations();
  toast.success('已应用所有更改到页面');
}

// 拖拽相关
// Section 重排序
function onSectionReorder(fromIndex: number, toIndex: number): void {
  if (!currentItemConfig.value) return;
  
  const sections = currentItemConfig.value.sections;
  const [removed] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, removed);
}

const draggedVariationIndex = ref<number | null>(null);

function onVariationDragStart(index: number) {
  draggedVariationIndex.value = index;
}

function onVariationDragOver(event: DragEvent) {
  event.preventDefault();
}

function onVariationDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault();
  if (!currentItemConfig.value || draggedVariationIndex.value === null) return;
  
  const variations = currentItemConfig.value.variations;
  const draggedItem = variations[draggedVariationIndex.value];
  variations.splice(draggedVariationIndex.value, 1);
  variations.splice(targetIndex, 0, draggedItem);
  
  draggedVariationIndex.value = null;
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

// 导出当前商品配置
function exportCurrentItem() {
  if (!currentItemId.value) {
    toast.error('无法获取当前商品ID');
    return;
  }
  
  try {
    const config = exportSingleItem(currentItemId.value);
    if (!config) {
      toast.error('当前商品没有配置数据');
      return;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadJSON(config, `booth-item-${currentItemId.value}-${timestamp}.json`);
    toast.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    toast.error('导出失败：' + (error as Error).message);
  }
}

// 导入商品配置
function importItemConfig() {
  triggerFileInput('application/json', async (file) => {
    try {
      const config = await readJSONFile(file) as SingleItemConfig;
      const success = importSingleItem(config, { replace: false });
      
      if (!success) {
        pendingImportConfig.value = config;
        showImportConflictDialog.value = true;
      } else {
        toast.success('导入成功');
      }
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入失败：' + (error as Error).message);
    }
  });
}

// 确认替换已有配置
function confirmReplaceConfig() {
  if (pendingImportConfig.value) {
    importSingleItem(pendingImportConfig.value, { replace: true });
    toast.success('导入成功');
  }
  showImportConflictDialog.value = false;
  pendingImportConfig.value = null;
};

// 取消导入
function cancelImport() {
  showImportConflictDialog.value = false;
  pendingImportConfig.value = null;
}

// 保存模板配置
function handleSaveTemplates(templates: GlobalTemplateConfig) {
  data.value.globalTemplates = templates;
  toast.success('模板配置已保存');
}

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
    :show="modal.state.value.show"
    :title="modal.state.value.title"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="modal.closeModal"
    width="500px"
  >
    <!-- 创建商品配置 -->
    <div v-if="modal.state.value.type === 'createItem'">
      <p class="hint-text">
        为当前商品创建编辑配置，配置后可以管理商品名称、描述、Sections 和 Variations。
      </p>

      <div class="form-group">
        <label>商品名称 <span class="required">*</span></label>
        <input 
          v-model="modal.state.value.formData.itemName" 
          type="text" 
          placeholder="输入商品名称"
          @keyup.enter="modal.confirmModal(modal.state.value.formData)"
        />
      </div>

      <div class="form-group">
        <label>商品类型</label>
        <select v-model="modal.state.value.formData.itemType">
          <option value="normal">普通商品</option>
          <option value="adaptation">适配商品</option>
        </select>
      </div>
    </div>

    <!-- 编辑描述 -->
    <div v-else-if="modal.state.value.type === 'editDescription'">
      <div class="form-group">
        <label>描述模板 <span class="label-hint">(全局)</span></label>
        <p class="form-hint">支持变量: {itemName}, {supportCount}</p>
        <textarea 
          v-model="modal.state.value.formData.descriptionTemplate" 
          rows="3"
          placeholder="全局描述模板"
        ></textarea>
      </div>

      <div class="form-group">
        <label>自定义描述 <span class="label-hint">(此商品专属)</span></label>
        <textarea 
          v-model="modal.state.value.formData.customDescription" 
          rows="6"
          placeholder="输入此商品的特殊说明..."
        ></textarea>
      </div>

      <div class="preview-box">
        <div class="preview-label">最终描述预览</div>
        <pre class="preview-content text">{{ previewDescription }}</pre>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-secondary" @click="modal.closeModal">
        取消
      </button>
      <button 
        v-if="modal.state.value.type === 'createItem'"
        class="booth-btn booth-btn-md booth-btn-primary" 
        @click="modal.confirmModal(modal.state.value.formData)"
        :disabled="!modal.state.value.formData.itemName?.trim()"
      >
        创建配置
      </button>
      <button 
        v-else-if="modal.state.value.type === 'editDescription'"
        class="booth-btn booth-btn-md booth-btn-primary" 
        @click="modal.confirmModal(modal.state.value.formData)"
      >
        保存
      </button>
    </template>
  </Modal>

  <!-- 无法获取商品 ID -->
  <div v-if="!currentItemId" class="empty-state">
    <div class="empty-icon" v-html="withSize(icons.alertCircle, 48)"></div>
    <h3>无法获取商品 ID</h3>
    <p>请确保在商品编辑页面使用此功能</p>
  </div>

  <!-- 未创建配置 - 显示创建按钮 -->
  <div v-else-if="!hasConfig" class="empty-state">
    <div class="empty-icon" v-html="withSize(icons.file, 64)"></div>
    <h3>未配置此商品</h3>
    <p>为当前商品创建编辑配置，开始管理商品信息</p>
    <button class="booth-btn booth-btn-lg booth-btn-primary" @click="handleCreateItem">
      <span v-html="withSize(icons.plus, 16)"></span>
      创建商品配置
    </button>
  </div>

  <!-- 已有配置 - 显示完整编辑界面 -->
  <div v-else-if="currentItemConfig" class="edit-tab">
    <!-- 顶部操作栏 -->
    <div class="edit-tab-header">
      <button class="booth-btn booth-btn-md booth-btn-primary" @click="showTemplateModal = true">
        <span v-html="withSize(icons.settings, 14)"></span>
        配置模板
      </button>
      <div class="header-spacer"></div>
      <button class="booth-btn booth-btn-sm booth-btn-secondary" @click="exportCurrentItem">
        <span v-html="withSize(icons.upload, 14)"></span>
        导出商品
      </button>
      <button class="booth-btn booth-btn-sm booth-btn-secondary" @click="importItemConfig">
        <span v-html="withSize(icons.download, 14)"></span>
        导入商品
      </button>
    </div>

    <div class="edit-tab-scrollable">
      <!-- 1. 商品名编辑区 -->
      <section class="edit-section">
        <div class="section-header">
          <h3>商品名称</h3>
          <div class="actions">
            <button class="booth-btn booth-btn-sm booth-btn-secondary" 
              @click="showNameModal = true">
              <span v-html="withSize(icons.settings, 14)"></span>
              模板设置
            </button>
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="applyName">
              应用到页面
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>商品基础名称</label>
          <input v-model="currentItemConfig.itemName" type="text" 
            placeholder="输入商品名称" />
        </div>
        <div class="preview-box">
          <div class="preview-label">预览</div>
          <div class="preview-content">{{ previewName || '(未设置)' }}</div>
        </div>
      </section>

      <!-- 2. 描述预览区 -->
      <section class="preview-section">
        <div class="section-header">
          <h3>商品描述</h3>
          <div class="actions">
            <button class="booth-btn booth-btn-sm booth-btn-secondary" 
              @click="handleEditDescription">
              <span v-html="withSize(icons.edit, 14)"></span>
              编辑描述
            </button>
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="applyDescription">
              应用到页面
            </button>
          </div>
        </div>
        <div class="preview-content">
          <pre class="preview-text">{{ previewDescription || '(未设置)' }}</pre>
        </div>
      </section>

    <!-- 3. Sections 列表区 -->
    <section class="list-section">
      <div class="section-header">
        <h3>Sections ({{ currentItemConfig.sections.length }})</h3>
        <div class="actions">
          <button class="booth-btn booth-btn-sm booth-btn-ghost" 
            @click="importSections">
            <span v-html="withSize(icons.download, 14)"></span>
            从页面导入
          </button>
          <button class="booth-btn booth-btn-sm booth-btn-secondary" 
            @click="addSection">
            <span v-html="withSize(icons.plus, 14)"></span>
            添加
          </button>
          <button class="booth-btn booth-btn-sm booth-btn-secondary" 
            @click="showSectionsModal = true">
            <span v-html="withSize(icons.settings, 14)"></span>
            高级配置
          </button>
        </div>
      </div>

      <div v-if="currentItemConfig.sections.length === 0" class="empty-hint">
        暂无 Sections，点击"添加"或"从页面导入"
      </div>

      <DraggableCardList
        v-else
        :items="currentItemConfig.sections"
        @remove="removeSection"
        @reorder="onSectionReorder"
      >
        <template #content="{ item: section }">
          <div class="form-group">
            <label>Headline</label>
            <input v-model="section.headline" type="text" 
              placeholder="输入 Headline" />
          </div>
          <div class="form-group">
            <label>Body</label>
            <textarea v-model="section.body" rows="3"
              placeholder="输入 Body"></textarea>
          </div>
        </template>

        <template #footer="{ index }">
          <div class="section-preview">
            <div class="preview-label">预览</div>
            <div class="preview-headline">{{ resolvedSections[index].headline }}</div>
            <div class="preview-body">{{ resolvedSections[index].body }}</div>
          </div>
        </template>
      </DraggableCardList>

      <div v-if="currentItemConfig.sections.length > 0" class="section-footer">
        <button class="booth-btn booth-btn-md booth-btn-primary" @click="applySections">
          应用 Sections 到页面
        </button>
      </div>
    </section>

    <!-- 4. Variations 列表区 -->
    <section class="list-section">
      <div class="section-header">
        <h3>Variations ({{ currentItemConfig.variations.length }})</h3>
        <div class="actions">
          <button class="booth-btn booth-btn-sm booth-btn-ghost" 
            @click="importVariations">
            <span v-html="withSize(icons.download, 14)"></span>
            从页面导入
          </button>
          <button class="booth-btn booth-btn-sm booth-btn-primary" 
            @click="showPriceModal = true">
            <span v-html="withSize(icons.settings, 14)"></span>
            价格与打折
          </button>
        </div>
      </div>

      <div v-if="currentItemConfig.variations.length === 0" class="empty-hint">
        暂无 Variations，点击"编辑价格"添加
      </div>

      <div v-else class="variations-list">
        <div 
          v-for="(variation, index) in currentItemConfig.variations" 
          :key="index"
          class="variation-card"
          draggable="true"
          @dragstart="onVariationDragStart(index)"
          @dragover="onVariationDragOver"
          @drop="onVariationDrop($event, index)"
        >
          <span class="drag-handle" v-html="withSize(icons.moreVertical, 14)"></span>
          <span class="number">#{{ index + 1 }}</span>
          <span class="name">{{ variation.name || '(未命名)' }}</span>
          <span class="support">x{{ variation.supportCount }}</span>
          <span class="price">¥{{ variation.price }}</span>
          <span v-if="variation.isFullset" class="badge">Fullset</span>
        </div>
      </div>

      <div v-if="currentItemConfig.variations.length > 0" class="section-footer">
        <button class="booth-btn booth-btn-md booth-btn-primary" @click="applyVariations">
          应用 Variations 到页面
        </button>
      </div>
    </section>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <button class="booth-btn booth-btn-lg booth-btn-primary" @click="applyAll">
        应用所有到页面
      </button>
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

    <PriceModal
      :show="showPriceModal"
      :item-config="currentItemConfig"
      @close="showPriceModal = false"
      @save="showPriceModal = false"
    />

    <!-- 模板配置 Modal -->
    <TemplateConfigModal
      :show="showTemplateModal"
      :global-templates="globalTemplates"
      @close="showTemplateModal = false"
      @save="handleSaveTemplates"
    />

    <!-- 导入冲突确认 Modal -->
    <Modal
      :show="showImportConflictDialog"
      title="导入确认"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="cancelImport"
      width="400px"
    >
      <div class="modal-content">
        <p>商品 ID <strong>{{ pendingImportConfig?.itemId }}</strong> 已存在配置。</p>
        <p>是否要替换现有配置？</p>
      </div>

      <template #footer>
        <button class="booth-btn booth-btn-md booth-btn-secondary" @click="cancelImport">
          取消
        </button>
        <button class="booth-btn booth-btn-md booth-btn-danger" @click="confirmReplaceConfig">
          替换
        </button>
      </template>
    </Modal>
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

.empty-state h3 {
  margin: 0 0 var(--be-space-sm);
  font-size: var(--be-font-size-xl);
  font-weight: 600;
  color: var(--be-color-text);
}

.empty-state p {
  margin: 0 0 var(--be-space-lg);
  font-size: var(--be-font-size-base);
  color: var(--be-color-text-secondary);
  max-width: 400px;
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
  padding: 6px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 编辑区域 */
.edit-section {
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-md);
  padding: var(--be-space-md);
}

/* 预览区域 */
.preview-section {
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-md);
  padding: var(--be-space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: var(--be-font-size-lg);
  font-weight: 600;
  color: var(--be-color-text);
}

.actions {
  display: flex;
  gap: var(--be-space-sm);
}

.preview-content {
  margin-top: var(--be-space-sm);
}

.preview-box {
  margin-top: var(--be-space-sm);
  padding: 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
}

.preview-label {
  font-size: var(--be-font-size-xs);
  font-weight: 500;
  color: var(--be-color-text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-box .preview-content {
  font-size: var(--be-font-size-md);
  color: var(--be-color-text);
  font-weight: 500;
  margin-top: 0;
}

.preview-text {
  padding: 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
  font-size: var(--be-font-size-base);
  color: var(--be-color-text);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 80px;
  margin: 0;
  font-family: inherit;
}

/* 列表区域 */
.list-section {
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-md);
  padding: var(--be-space-md);
}

.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: var(--be-color-text-muted);
  font-size: var(--be-font-size-base);
  font-style: italic;
}

/* Section 预览区样式（DraggableCardList footer 插槽内容） */
.section-preview {
  padding: 10px;
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
}

.preview-label {
  font-size: var(--be-font-size-xs);
  font-weight: 500;
  color: var(--be-color-text-muted);
  margin-bottom: 6px;
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
.variations-list {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-sm);
}

.variation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
  cursor: move;
  transition: var(--be-transition-normal);
}

.variation-card:hover {
  border-color: var(--be-color-border-hover);
  box-shadow: var(--be-shadow-sm);
}

.variation-card .number {
  font-size: var(--be-font-size-sm);
  font-weight: 600;
  color: var(--be-color-text-secondary);
}

.variation-card .name {
  flex: 1;
  font-size: var(--be-font-size-base);
  font-weight: 500;
  color: var(--be-color-text);
}

.variation-card .support {
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
  padding: 2px 6px;
  background: var(--be-color-bg);
  border-radius: var(--be-radius-sm);
}

.variation-card .price {
  font-size: var(--be-font-size-base);
  font-weight: 600;
  color: var(--be-color-success);
}

.variation-card .badge {
  font-size: var(--be-font-size-xs);
  font-weight: 600;
  color: var(--be-color-primary);
  background: #dbeafe;
  padding: 2px var(--be-space-sm);
  border-radius: var(--be-radius-full);
}

.section-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--be-space-md);
  background: var(--be-color-bg);
  border-top: 1px solid var(--be-color-border);
  display: flex;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* 错误状态 */
.error-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--be-color-danger);
  font-size: var(--be-font-size-lg);
}
</style>
