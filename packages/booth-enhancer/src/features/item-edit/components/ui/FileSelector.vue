<script setup lang="ts">
import { computed } from 'vue';

interface FileItem {
  id: string;
  name: string;
}

const props = defineProps<{
  files: FileItem[];
  selectedFileIds: string[];
  emptyText?: string;
  columns?: number;
  maxHeight?: string;
}>();

const emit = defineEmits<{
  'update:selectedFileIds': [fileIds: string[]];
}>();

function toggleFileSelection(fileId: string): void {
  const currentSelection = [...props.selectedFileIds];
  const index = currentSelection.indexOf(fileId);
  
  if (index > -1) {
    currentSelection.splice(index, 1);
  } else {
    currentSelection.push(fileId);
  }
  
  emit('update:selectedFileIds', currentSelection);
}

function isFileSelected(fileId: string): boolean {
  return props.selectedFileIds.includes(fileId);
}

const gridColumns = computed((): number => props.columns || 2);
const emptyHint = computed((): string => props.emptyText || '暂无文件，请先上传文件');
</script>

<template>
  <div class="file-selector">
    <div v-if="files.length > 0" class="file-grid" :style="{
      gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
      maxHeight: maxHeight || '300px'
    }">
      <button
        v-for="file in files"
        :key="file.id"
        class="file-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start"
        :class="{ 'is-selected': isFileSelected(file.id) }"
        type="button"
        @click="toggleFileSelection(file.id)"
      >
        <span class="be-text-sm be-font-medium">{{ file.name }}</span>
      </button>
    </div>
    
    <div v-else class="empty-hint be-text-center be-text-secondary be-py-md">
      {{ emptyHint }}
    </div>
  </div>
</template>

<style scoped>
.file-selector {
  width: 100%;
}

.file-grid {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
}

.file-item {
  padding: 6px 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item:hover {
  transform: translateY(-1px);
}

.file-item.is-selected {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}
</style>
