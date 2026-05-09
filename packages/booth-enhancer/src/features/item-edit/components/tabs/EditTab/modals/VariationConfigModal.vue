<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ItemEditConfig } from '../../../../config-types';
import { FileSelector } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  availableFiles: Array<{ id: string; name: string }>;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 通用文件选择（临时状态，保存时写入 config）
const tempCommonFiles = ref<string[]>([]);

// 监听 modal 打开时重置临时选择
watch(() => props.show, (show: boolean): void => {
  if (show) {
    tempCommonFiles.value = [...(props.itemConfig.commonFiles || [])];
  }
});

function handleSave(): void {
  props.itemConfig.commonFiles = tempCommonFiles.value;
  emit('close');
}
</script>

<template>
  <Modal
    :show="show"
    title="通用文件配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <p class="form-hint be-text-xs be-text-secondary">
        选择所有 variation 共享的通用文件（如材质、配饰等），这些文件会在应用时自动添加到每个 variation。
      </p>
      
      <div class="be-text-xs be-text-secondary">
        已选择: <strong>{{ tempCommonFiles.length }}</strong> 个文件
      </div>
      
      <FileSelector
        :files="availableFiles"
        :selected-file-ids="tempCommonFiles"
        @update:selected-file-ids="tempCommonFiles = $event"
      />
    </div>

    <template #footer>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" 
        type="button"
        title="取消"
        @click="emit('close')"
      >
        <span v-html="withSize(icons.close, 16)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="保存"
        @click="handleSave"
      >
        <span v-html="withSize(icons.check, 16)"></span>
      </button>
    </template>
  </Modal>
</template>
