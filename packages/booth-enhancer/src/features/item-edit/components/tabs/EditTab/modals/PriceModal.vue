<script setup lang="ts">
import { computed } from 'vue';
import type { ItemEditConfig } from '../../../../config-types';
import { applyDiscount, calculateVariationPrices, suggestFullsetPrice } from '../../../../utils/priceCalculator';
import { calculateTotalSupport } from '../../../../utils/templateParser';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const totalSupport = computed(() => calculateTotalSupport(props.itemConfig.variations));

const suggestedPrice = computed(() => 
  suggestFullsetPrice(
    props.itemConfig.pricing.normalVariationPrice,
    totalSupport.value,
    props.itemConfig.discount
  )
);

// 计算显示的价格
const normalOriginalPrice = computed(() => props.itemConfig.pricing.normalVariationPrice);
const normalDiscountedPrice = computed(() => 
  applyDiscount(props.itemConfig.pricing.normalVariationPrice, props.itemConfig.discount)
);

const fullsetOriginalPrice = computed(() => props.itemConfig.pricing.fullsetPrice);
const fullsetDiscountedPrice = computed(() => 
  applyDiscount(props.itemConfig.pricing.fullsetPrice, props.itemConfig.discount)
);

// 添加普通 Variation
function addVariation(): void {
  const price = applyDiscount(
    props.itemConfig.pricing.normalVariationPrice,
    props.itemConfig.discount
  );
  
  props.itemConfig.variations.push({
    name: '',
    supportCount: 1,
    price,
    isFullset: false
  });
}

// 添加 Fullset Variation
function addFullsetVariation(): void {
  props.itemConfig.variations.unshift({
    name: 'Fullset',
    supportCount: totalSupport.value,
    price: suggestedPrice.value,
    isFullset: true
  });
}

// 删除 Variation
function removeVariation(index: number): void {
  props.itemConfig.variations.splice(index, 1);
}

// Variation 重排序
function onVariationReorder(fromIndex: number, toIndex: number): void {
  const variations = props.itemConfig.variations;
  const [removed] = variations.splice(fromIndex, 1);
  variations.splice(toIndex, 0, removed);
}

// 保存并关闭
function handleSave(): void {
  // 确保 supportCount 是数字类型
  props.itemConfig.variations.forEach(variation => {
    variation.supportCount = Number(variation.supportCount) || 1;
  });
  
  // 重新计算所有 Variation 的价格
  calculateVariationPrices(
    props.itemConfig.variations,
    props.itemConfig.pricing,
    props.itemConfig.discount
  );
  
  emit('save');
  emit('close');
}
</script>

<template>
  <Modal
    :show="show"
    title="价格与打折配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
    width="700px"
  >
    <div class="price-modal-content">
      <!-- Variations 管理区 -->
      <div class="config-section">
        <div class="section-header">
          <h4 class="section-title">Variations 管理</h4>
          <div class="action-buttons">
            <button class="booth-btn booth-btn-sm booth-btn-primary" @click="addFullsetVariation">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加 Fullset
            </button>
            <button class="booth-btn booth-btn-sm booth-btn-secondary" @click="addVariation">
              <span v-html="withSize(icons.plus, 14)"></span>
              添加 Variation
            </button>
          </div>
        </div>

        <div v-if="itemConfig.variations.length === 0" class="empty-hint">
          暂无 Variation，点击上方按钮添加
        </div>

        <DraggableCardList
          v-else
          :items="itemConfig.variations"
          @remove="removeVariation"
          @reorder="onVariationReorder"
        >
          <template #content="{ item: variation }">
            <div class="variation-fields">
              <input v-model="variation.name" type="text" class="variation-name"
                placeholder="Variation 名称" />
              <input v-model.number="variation.supportCount" type="number" 
                class="variation-count" min="1" 
                :disabled="variation.isFullset"
                placeholder="数量" />
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="variation.isFullset" />
                <span>Fullset</span>
              </label>
            </div>
          </template>
        </DraggableCardList>
      </div>

      <!-- 价格配置区 -->
      <div class="config-section">
        <h4 class="section-title">价格配置</h4>
        
        <div class="price-row">
          <div class="form-group">
            <label>普通 Variation 价格 (¥)</label>
            <input type="number" v-model.number="itemConfig.pricing.normalVariationPrice" 
              min="0" placeholder="0" />
          </div>
          
          <div class="form-group">
            <label>Fullset 价格 (¥)</label>
            <p class="form-hint">建议: ¥{{ suggestedPrice }}</p>
            <input type="number" v-model.number="itemConfig.pricing.fullsetPrice" 
              min="0" placeholder="0" />
          </div>
        </div>

        <div class="info-row">
          <span class="info-badge">总支持数: <strong>{{ totalSupport }}</strong></span>
        </div>
      </div>

      <!-- 打折配置区 -->
      <div class="config-section">
        <div class="section-header">
          <label class="booth-toggle">
            <input type="checkbox" v-model="itemConfig.discount.enabled" />
            <span class="toggle-slider"></span>
            <span class="toggle-label">启用打折</span>
          </label>
        </div>

        <div v-if="itemConfig.discount.enabled" class="discount-body">
          <div class="form-group">
            <label>折扣百分比 (%)</label>
            <input type="number" v-model.number="itemConfig.discount.discountPercent" 
              min="0" max="100" placeholder="0" />
          </div>

          <div class="price-preview">
            <div class="preview-title">价格预览</div>
            <div class="price-item">
              <span class="label">普通 Variation:</span>
              <span class="price-value">
                ¥{{ normalOriginalPrice }} → ¥{{ normalDiscountedPrice }}
              </span>
            </div>
            <div class="price-item">
              <span class="label">Fullset:</span>
              <span class="price-value">
                ¥{{ fullsetOriginalPrice }} → ¥{{ fullsetDiscountedPrice }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-secondary" @click="emit('close')">
        取消
      </button>
      <button class="booth-btn booth-btn-md booth-btn-primary" @click="handleSave">
        保存
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.price-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-lg);
}

/* 配置区块（仅 PriceModal 使用） */
.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: var(--be-font-size-md);
  font-weight: 600;
  color: var(--be-color-text);
}

.action-buttons {
  display: flex;
  gap: var(--be-space-sm);
}

/* Variation 字段容器（DraggableCardList content 插槽内容） */
.variation-fields {
  display: flex;
  align-items: center;
  gap: var(--be-space-sm);
}

.variation-name {
  flex: 1;
  padding: 4px var(--be-space-sm);
  font-size: var(--be-font-size-base);
  height: 28px;
}

.variation-count {
  width: 70px;
  padding: 4px var(--be-space-sm);
  font-size: var(--be-font-size-base);
  height: 28px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--be-space-xs);
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

.checkbox-wrapper input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--be-space-md);
}

.info-row {
  display: flex;
  gap: var(--be-space-sm);
  flex-wrap: wrap;
}

.info-badge {
  padding: 4px 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-full);
  font-size: var(--be-font-size-sm);
  color: var(--be-color-text);
}

.discount-body {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-md);
}

.price-preview {
  padding: 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
}

.preview-title {
  font-size: var(--be-font-size-sm);
  font-weight: 600;
  color: var(--be-color-text-secondary);
  margin-bottom: var(--be-space-sm);
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--be-font-size-base);
  margin-bottom: 4px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-item .label {
  color: var(--be-color-text-secondary);
  font-weight: 500;
}

.price-item .price-value {
  color: var(--be-color-text);
  font-weight: 600;
}
</style>
