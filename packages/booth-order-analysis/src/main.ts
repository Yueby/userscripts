import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { DataLoader } from './utils/core/data-loader';
import { CurrencyConverter } from './utils/currency/currency-converter';
import { ItemManager } from './utils/booth/item-manager';
import { logger } from './utils/core/logger';

// 检查是否在 Booth 订单页面
function isBoothOrdersPage(): boolean {
  return window.location.href.includes('manage.booth.pm/orders');
}

// 数据加载器实例
const dataLoader = DataLoader.getInstance();

// 商品管理器实例
const itemManager = ItemManager.getInstance();

// 汇率转换器实例
const currencyConverter = CurrencyConverter;

// 插入按钮
function insertButton(): void {
  const targetSelector = 'body > div.page-wrap.box-border.relative.z-\\[2\\].flex-grow.basis-auto.bg-\\[\\#f1f5f8\\].shadow-\\[1px_0_0_0_rgba\\(0\\,0\\,0\\,0\\.05\\)\\].transition-all.duration-\\[180ms\\].ease-in.min-w-\\[970px\\].mobile\\:min-w-\\[auto\\] > main > div.manage-page-body > div > div.lo-grid.manage-nav-block.items-center';

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
    button.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-left: 12px;
      position: relative;
      min-width: 100px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;

    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
      #booth-analysis-button {
        position: relative;
        overflow: hidden;
      }
      
      #booth-analysis-button:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
      
      #booth-analysis-button:active {
        transform: translateY(0);
      }
      
      #booth-analysis-button .button-text {
        transition: opacity 0.3s ease;
      }
      
      #booth-analysis-button.loading .button-text {
        opacity: 1;
        margin-left: 24px;
      }
      
      #booth-analysis-button .loading-spinner {
        position: absolute;
        top: 50%;
        left: 12px;
        transform: translateY(-50%);
      }
      
      #booth-analysis-button .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #booth-analysis-button:disabled {
        background: #6b7280;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

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
      alert(`数据加载失败: ${result.error}`);
    }
    
  } catch (error) {
    logger.error('加载过程出错:', error);
    updateButtonState(false);
    alert(`加载失败: ${error}`);
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
      alert(`数据加载失败: ${result.error}`);
    }
    
  } catch (error) {
    logger.error('加载过程出错:', error);
    updateButtonState(false);
    alert(`加载失败: ${error}`);
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
  setTimeout(() => panel.style.opacity = '1', 10);
}

// 启动
if (isBoothOrdersPage()) {
  // 异步初始化汇率和商品管理器
  Promise.all([
    currencyConverter.initializeRates(),
    itemManager.initialize()
  ]).catch(error => {
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
}
