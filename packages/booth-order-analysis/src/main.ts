import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { ItemManager } from './utils/booth/item-manager';
import { DataLoader } from './utils/core/data-loader';
import { logger } from './utils/core/logger';
import { SessionManager } from './utils/core/session-manager';
import { CurrencyManager } from './utils/currency/currency-manager';

// 数据加载器实例
const dataLoader = DataLoader.getInstance();

// 商品管理器实例
const itemManager = ItemManager.getInstance();

// 汇率转换器实例
const currencyConverter = CurrencyManager;

// 插入按钮
function insertButton(): void {
  const targetSelector =
    'body > div.page-wrap.box-border.relative.z-\\[2\\].flex-grow.basis-auto.bg-\\[\\#f1f5f8\\].shadow-\\[1px_0_0_0_rgba\\(0\\,0\\,0\\,0\\.05\\)\\].transition-all.duration-\\[180ms\\].ease-in.min-w-\\[970px\\].mobile\\:min-w-\\[auto\\] > main > div.manage-page-body > div > div.lo-grid.manage-nav-block.items-center';

  const targetElement = document.querySelector(targetSelector);

  if (targetElement && !document.getElementById('booth-analysis-button')) {
    const button = document.createElement('button');
    button.id = 'booth-analysis-button';
    button.innerHTML = `
      <div class="loading-spinner" style="display: none;">
        <div class="spinner"></div>
      </div>
      <span class="button-text">订单分析</span>
    `;
    button.className = 'booth-btn booth-btn-primary booth-btn-md';
    button.style.cssText = `
      margin-left: 12px;
      position: relative;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener('click', handleButtonClick);
    targetElement.appendChild(button);
  }
}

// 更新按钮状态
function updateButtonState(isLoading: boolean): void {
  const button = document.getElementById('booth-analysis-button');
  if (!button) return;

  const buttonText = button.querySelector('.button-text') as HTMLElement;
  const loadingSpinner = button.querySelector('.loading-spinner') as HTMLElement;

  if (isLoading) {
    button.classList.add('loading');
    button.setAttribute('disabled', 'true');
    buttonText.textContent = '加载中...';
    buttonText.style.display = 'block';
    loadingSpinner.style.display = 'block';
  } else {
    button.classList.remove('loading');
    button.removeAttribute('disabled');
    buttonText.textContent = '订单分析';
    buttonText.style.display = 'block';
    loadingSpinner.style.display = 'none';
  }
}

// 处理按钮点击
async function handleButtonClick(): Promise<void> {
  // 检查是否正在加载
  if (dataLoader.isCurrentlyLoading()) {
    logger.warn('正在加载数据，请稍候...');
    return;
  }

  // 检查是否有数据，如果没有则重新加载
  if (dataLoader.hasData()) {
    showVuePanel();
  } else {
    updateButtonState(true);
    await loadDataAndShowPanel();
  }
}

// 只加载数据，不显示面板
async function loadDataOnly(): Promise<void> {
  try {
    const result = await dataLoader.loadOrdersFromCSV();

    if (result.success) {
      updateButtonState(false);
    } else {
      logger.error('数据加载失败:', result.error);
      updateButtonState(false);
    }
  } catch (error) {
    logger.error('加载过程出错:', error);
    updateButtonState(false);
  }
}

// 加载数据并显示面板
async function loadDataAndShowPanel(): Promise<void> {
  try {
    const result = await dataLoader.loadOrdersFromCSV();

    if (result.success) {
      updateButtonState(false);
      showVuePanel();
    } else {
      logger.error('数据加载失败:', result.error);
      updateButtonState(false);
    }
  } catch (error) {
    logger.error('加载过程出错:', error);
    updateButtonState(false);
  }
}

// 显示 Vue 面板
async function showVuePanel(): Promise<void> {
  const existingPanel = document.getElementById('booth-analysis-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  document.body.style.overflow = 'hidden';

  const panel = document.createElement('div');
  panel.id = 'booth-analysis-panel';
  panel.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  `;

  panel.appendChild(content);
  document.body.appendChild(panel);

  createApp(App).mount(content);
  setTimeout(() => (panel.style.opacity = '1'), 10);
}

// 启动 - 由于 vite.config 中已精确匹配订单页面，这里无需再检查
(async () => {
  // 先初始化 Session，再初始化其他管理器
  const sessionManager = SessionManager.getInstance();
  await sessionManager.getValidSession();

  // 异步初始化
  Promise.all([
    currencyConverter.initializeRates(),
    itemManager.initialize() // 现在有了 Session，可以正常访问 API
  ]).catch((error) => {
    logger.warn('初始化失败，使用默认设置:', error);
  });

  // 自动加载数据
  setTimeout(async () => {
    insertButton();

    // 检查是否已有数据，如果没有则自动加载
    if (!dataLoader.hasData()) {
      updateButtonState(true);
      await loadDataOnly();
    }
  }, 200);
})();
