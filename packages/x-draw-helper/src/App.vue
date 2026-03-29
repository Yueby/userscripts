<script setup lang="ts">
import { ref, onMounted, onUnmounted, createApp, h, nextTick } from 'vue';
import TriggerButton from './components/TriggerButton.vue';
import DrawPanel from './components/DrawPanel.vue';

const TWEET_URL_PATTERN = /https:\/\/x\.com\/[^/]+\/status\/\d+/;
const ACTION_BAR_SELECTOR =
  'article[data-testid="tweet"] div[role="group"]';
const TRIGGER_ID = 'x-draw-helper-trigger';

const isValidPage = ref(false);
const showPanel = ref(false);

let triggerContainer: HTMLElement | null = null;
let triggerApp: ReturnType<typeof createApp> | null = null;
let observer: MutationObserver | null = null;
let lastUrl = '';

function injectTrigger() {
  removeTrigger();

  const actionBar = document.querySelector(ACTION_BAR_SELECTOR);
  if (!actionBar) return;

  triggerContainer = document.createElement('div');
  triggerContainer.id = TRIGGER_ID;
  triggerContainer.style.display = 'flex';
  triggerContainer.style.alignItems = 'center';
  actionBar.appendChild(triggerContainer);

  triggerApp = createApp({
    render: () =>
      h(TriggerButton, {
        onClick: () => {
          showPanel.value = true;
        },
      }),
  });
  triggerApp.mount(triggerContainer);
}

function removeTrigger() {
  if (triggerApp) {
    triggerApp.unmount();
    triggerApp = null;
  }
  const existing = document.getElementById(TRIGGER_ID);
  if (existing) existing.remove();
  triggerContainer = null;
}

function checkUrl() {
  const valid = TWEET_URL_PATTERN.test(window.location.href);
  isValidPage.value = valid;
  if (!valid) {
    showPanel.value = false;
    removeTrigger();
  } else {
    nextTick(() => {
      setTimeout(injectTrigger, 500);
    });
  }
}

onMounted(() => {
  lastUrl = window.location.href;
  checkUrl();

  observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      checkUrl();
    }
    // Re-inject if trigger was removed (e.g., by X's virtual DOM)
    if (isValidPage.value && !document.getElementById(TRIGGER_ID)) {
      injectTrigger();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

onUnmounted(() => {
  observer?.disconnect();
  removeTrigger();
});

function closePanel() {
  showPanel.value = false;
}
</script>

<template>
  <DrawPanel v-if="showPanel" @close="closePanel" />
</template>
