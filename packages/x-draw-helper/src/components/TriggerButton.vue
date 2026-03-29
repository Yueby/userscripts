<script setup lang="ts">
defineEmits<{
  click: [];
}>();
</script>

<template>
  <div class="flex items-center justify-center cursor-pointer px-1" role="button" tabindex="0" @click="$emit('click')">
    <div class="flex items-center justify-center w-[34.75px] h-[34.75px] rounded-full transition-colors hover:bg-[#1d9bf0]/10 group">
      <svg viewBox="0 0 24 24" class="w-[18.75px] h-[18.75px] text-[#71767b] transition-colors group-hover:text-[#1d9bf0]">
        <path
          d="M20 7h-1.18C19.23 6.36 19.5 5.6 19.5 4.78 19.5 3.24 18.26 2 16.72 2c-1.22 0-2.44.66-3.28 1.8L12 5.96l-1.44-2.16C9.72 2.66 8.5 2 7.28 2 5.74 2 4.5 3.24 4.5 4.78c0 .82.27 1.58.68 2.22H4c-1.1 0-2 .9-2 2v3c0 .55.45 1 1 1v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c.55 0 1-.45 1-1V9c0-1.1-.9-2-2-2zm-8 13H5v-7h7v7zm0-9H4V9h8v2zm1-3.08L14.42 5.8c.56-.84 1.42-1.3 2.3-1.3.86 0 1.78.7 1.78 1.78 0 .56-.19 1.08-.51 1.48l-.71.82H13v-.66zM11 7.58l-.71-.82C9.97 6.36 9.78 5.84 9.78 5.28 9.78 4.42 10.14 4 11 4c.88 0 1.74.46 2.3 1.3L11 7.58zM20 11h-7V9h7v2zm-1 9h-6v-7h7v7h-1z"
          fill="currentColor"
        /></svg>
    </div>
  </div>
</template>
