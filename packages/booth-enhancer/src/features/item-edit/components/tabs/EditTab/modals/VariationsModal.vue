<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ItemEditConfig, VariationData } from '../../../../config-types';
import { applyDiscount, suggestFullsetPrice } from '../../../../utils/priceCalculator';
import { calculateTotalSupport } from '../../../../utils/templateParser';
import { PreviewBox, SectionHeader } from '../../../ui';
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

const showFullsetConfirm = ref(false);

const totalSupport = computed((): number => 
  calculateTotalSupport(props.itemConfig.variations)
);

const hasFullset = computed((): boolean => 
  props.itemConfig.variations.some(v => v.isFullset)
);

const suggestedPrice = computed((): number => 
  suggestFullsetPrice(
    props.itemConfig.pricing.normalVariationPrice,
    totalSupport.value,
    props.itemConfig.discount
  )
);

const normalOriginalPrice = computed((): number => 
  props.itemConfig.pricing.normalVariationPrice
);

const normalDiscountedPrice = computed((): number => 
  applyDiscount(normalOriginalPrice.value, props.itemConfig.discount)
);

const fullsetOriginalPrice = computed((): number => 
  props.itemConfig.pricing.fullsetPrice
);

const fullsetDiscountedPrice = computed((): number => 
  applyDiscount(fullsetOriginalPrice.value, props.itemConfig.discount)
);

function getVariationPrice(variation: VariationData): number {
  if (variation.isFullset) {
    return applyDiscount(props.itemConfig.pricing.fullsetPrice, props.itemConfig.discount);
  }
  if (variation.useCustomPrice && variation.customPrice !== undefined) {
    return applyDiscount(variation.customPrice, props.itemConfig.discount);
  }
  return applyDiscount(props.itemConfig.pricing.normalVariationPrice, props.itemConfig.discount);
}

function addVariation(): void {
  const price = applyDiscount(
    props.itemConfig.pricing.normalVariationPrice,
    props.itemConfig.discount
  );
  
  props.itemConfig.variations.push({
    name: '',
    price,
    isFullset: false,
    useCustomPrice: false,
    fileIds: [],
    fileItemMap: {}
  });
}

function addFullsetVariation(): void {
  const existingFullsetIndex = props.itemConfig.variations.findIndex(v => v.isFullset);
  if (existingFullsetIndex !== -1) {
    props.itemConfig.variations.splice(existingFullsetIndex, 1);
  }
  
  props.itemConfig.variations.unshift({
    name: 'Fullset',
    price: suggestedPrice.value,
    isFullset: true
  });
}

function toggleFullset(variation: VariationData, index: number): void {
  if (variation.isFullset) {
    variation.isFullset = false;
    if (!variation.fileIds) {
      variation.fileIds = [];
    }
  } else {
    const existingFullsetIndex = props.itemConfig.variations.findIndex((v, i) => v.isFullset && i !== index);
    if (existingFullsetIndex !== -1) {
      const existingFullset = props.itemConfig.variations[existingFullsetIndex];
      existingFullset.isFullset = false;
      if (!existingFullset.fileIds) {
        existingFullset.fileIds = [];
      }
    }
    variation.isFullset = true;
  }
}

function handleAddVariation(): void {
  if (props.itemConfig.variations.length === 0 || !hasFullset.value) {
    showFullsetConfirm.value = true;
    return;
  }
  addVariation();
}

function confirmCreateFullset(): void {
  addFullsetVariation();
  showFullsetConfirm.value = false;
}

function cancelCreateFullset(): void {
  addVariation();
  showFullsetConfirm.value = false;
}

function removeVariation(index: number): void {
  props.itemConfig.variations.splice(index, 1);
}

function onVariationReorder(fromIndex: number, toIndex: number): void {
  const variations = props.itemConfig.variations;
  const [removed] = variations.splice(fromIndex, 1);
  variations.splice(toIndex, 0, removed);
}

function updateVariationPrice(variation: VariationData): void {
    if (variation.isFullset) {
      variation.price = applyDiscount(props.itemConfig.pricing.fullsetPrice, props.itemConfig.discount);
    } else if (variation.useCustomPrice && variation.customPrice !== undefined) {
      variation.price = applyDiscount(variation.customPrice, props.itemConfig.discount);
    } else {
      variation.price = applyDiscount(props.itemConfig.pricing.normalVariationPrice, props.itemConfig.discount);
    }
}

function handleSave(): void {
  props.itemConfig.variations.forEach(variation => {
    updateVariationPrice(variation);
  });
  
  emit('save');
  emit('close');
}
</script>

<template>
  <Modal
    :show="show"
    title="Variation 配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
        @click="handleAddVariation"
        title="添加"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
    </template>
    
    <div class="be-flex be-flex-column be-gap-sm">
      <!-- Variations 管理区 -->
      <SectionHeader title="Variations 管理">
        <div v-if="itemConfig.variations.length === 0" class="empty-hint">
          暂无 Variation，点击标题栏"添加"按钮添加
        </div>

        <DraggableCardList
          v-else
          :items="itemConfig.variations"
          :key-extractor="(item: any, index: number) => item.name || `variation-${index}`"
          @remove="removeVariation"
          @reorder="onVariationReorder"
        >
          <template #actions="{ item: variation, index }">
            <div class="be-flex be-align-center be-gap-sm" style="flex: 1;">
                <input v-model="variation.name" type="text" class="be-flex-1 be-p-xs be-px-sm be-text-base"
                  style="height: 28px;" placeholder="Variation 名称" />
              <label v-if="!hasFullset || variation.isFullset" class="booth-toggle" title="将此 Variation 设为 Fullset（合集包）">
                  <input type="checkbox" :checked="variation.isFullset" @change="toggleFullset(variation, index)" />
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Fullset</span>
                </label>
              </div>
          </template>
          <template #content="{ item: variation }">
              <!-- 价格显示/输入 -->
              <div class="be-flex be-align-center be-gap-sm">
              <span v-if="variation.isFullset" class="be-text-base be-text-primary">
                ¥{{ getVariationPrice(variation) }}
              </span>
              <template v-else>
                <span class="be-text-base be-text-primary be-flex-shrink-0">
                  ¥{{ getVariationPrice(variation) }}
                </span>
                <label class="booth-toggle be-flex-shrink-0" title="自定义此 Variation 的价格">
                    <input type="checkbox" v-model="variation.useCustomPrice" />
                    <span class="toggle-slider"></span>
                  </label>
                  <input 
                    v-if="variation.useCustomPrice"
                    v-model.number="variation.customPrice" 
                    type="number" 
                  class="be-flex-1 be-p-xs be-px-sm be-text-base" 
                  style="height: 28px; min-width: 80px;" 
                    min="0" 
                    placeholder="价格" 
                  />
                </template>
            </div>
          </template>
        </DraggableCardList>
      </SectionHeader>

      <!-- 价格配置区 -->
      <SectionHeader title="价格配置">
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

        <div class="be-flex be-gap-sm be-flex-wrap">
          <span class="be-p-xs be-px-sm be-text-sm be-text-secondary">总支持数: <strong>{{ totalSupport }}</strong></span>
        </div>
      </SectionHeader>

      <!-- 打折配置区 -->
      <div class="be-flex be-flex-column be-gap-sm">
        <label class="booth-toggle" title="启用打折功能">
          <input type="checkbox" v-model="itemConfig.discount.enabled" />
          <span class="toggle-slider"></span>
          <span class="toggle-label">启用打折</span>
        </label>

        <div v-if="itemConfig.discount.enabled" class="be-flex be-flex-column be-gap-sm">
          <div class="form-group">
            <label>折扣百分比 (%)</label>
            <input type="number" v-model.number="itemConfig.discount.discountPercent" 
              min="0" max="100" placeholder="0" />
          </div>

          <PreviewBox label="价格预览" type="text">
            <div class="be-flex be-flex-column be-gap-xs">
              <div class="be-flex be-justify-between">
                <span>普通 Variation:</span>
                <span>¥{{ normalOriginalPrice }} → ¥{{ normalDiscountedPrice }}</span>
              </div>
              <div class="be-flex be-justify-between">
                <span>Fullset:</span>
                <span>¥{{ fullsetOriginalPrice }} → ¥{{ fullsetDiscountedPrice }}</span>
              </div>
            </div>
          </PreviewBox>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" @click="emit('close')" title="取消">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" @click="handleSave" title="保存">
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- Fullset 确认 Modal -->
  <Modal
    :show="showFullsetConfirm"
    title="创建 Fullset"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="showFullsetConfirm = false"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <p class="be-m-0 be-text-base">
        {{ itemConfig.variations.length === 0 
          ? '这是第一个 Variation，是否创建 Fullset？' 
          : '当前没有 Fullset，是否创建 Fullset？' }}
      </p>
      <p class="be-m-0 be-text-sm be-text-secondary">
        Fullset 将包含所有支持的商品，建议价格为 ¥{{ suggestedPrice }}
      </p>
    </div>

    <template #footer>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" @click="cancelCreateFullset" title="创建普通 Variation">
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" @click="confirmCreateFullset" title="创建 Fullset">
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>
</template>

