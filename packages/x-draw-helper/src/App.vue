<script setup lang="ts">
import { ref, onMounted, onUnmounted, createApp, h, nextTick } from 'vue';
import TriggerButton from './components/TriggerButton.vue';
import DrawPanel from './components/DrawPanel.vue';

const TWEET_PATH_PATTERN = /^\/[^/]+\/status\/(\d+)/;
const ACTION_BAR_SELECTOR = 'div[role="group"]';
const TRIGGER_ID = 'x-draw-helper-trigger';

const isValidPage = ref(false);
const showPanel = ref(false);
const currentTweetId = ref<string | null>(null);

let triggerContainer: HTMLElement | null = null;
let triggerApp: ReturnType<typeof createApp> | null = null;
let observer: MutationObserver | null = null;
let lastUrl = '';

function findTargetTweet(): HTMLElement | null {
  const tweetId = window.location.pathname.match(TWEET_PATH_PATTERN)?.[1];
  if (!tweetId) return null;

  return Array.from(
    document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'),
  ).find((article) =>
    Array.from(article.querySelectorAll<HTMLAnchorElement>('a[href*="/status/"]'))
      .some((link) => link.pathname.match(TWEET_PATH_PATTERN)?.[1] === tweetId),
  ) ?? null;
}

function injectTrigger() {
  removeTrigger();

  const actionBar = findTargetTweet()?.querySelector(ACTION_BAR_SELECTOR);
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
  const valid = TWEET_PATH_PATTERN.test(window.location.pathname);
  isValidPage.value = valid;
  currentTweetId.value = valid ? window.location.pathname.match(TWEET_PATH_PATTERN)?.[1] ?? null : null;
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
  <DrawPanel v-if="showPanel" :tweet-id="currentTweetId" @close="closePanel" />
</template>
