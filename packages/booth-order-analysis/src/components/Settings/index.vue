<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { SettingsManager } from '../../utils/settings/settings-manager';
import { TIMEZONE_OPTIONS, CURRENCY_OPTIONS, type UserSettings } from '../../types/settings';
import { CurrencyConverter } from '../../utils/currency/currency-converter';
import { ExchangeRateAPI } from '../../utils/currency/exchange-rate-api';
import { logger } from '../../utils/core/logger';

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'settings-changed', settings: UserSettings): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const settings = ref<UserSettings>({
  timezone: 'Asia/Shanghai',
  displayName: '中国标准时间',
  targetCurrency: 'CNY'
});

const isSaving = ref(false);

// 加载设置
const loadSettings = () => {
  settings.value = SettingsManager.getSettings();
};

// 保存设置
const saveSettings = async () => {
  isSaving.value = true;

  try {
    SettingsManager.saveSettings(settings.value);
    emit('settings-changed', settings.value);

    // 显示成功提示
    setTimeout(() => {
      isSaving.value = false;
    }, 1000);
  } catch (error) {
    console.error('保存设置失败:', error);
    isSaving.value = false;
  }
};

// 重置设置
const resetSettings = () => {
  SettingsManager.resetSettings();
  loadSettings();
  emit('settings-changed', settings.value);
};

// 时区选择变化
const onTimezoneChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const selectedOption = TIMEZONE_OPTIONS.find(option => option.value === select.value);

  if (selectedOption) {
    settings.value.timezone = selectedOption.value;
    settings.value.displayName = selectedOption.label.split(' ')[0];
  }
};

// 获取汇率显示信息
const getExchangeRateDisplay = computed(() => {
  const selectedCurrency = settings.value.targetCurrency;
  if (selectedCurrency === 'JPY') {
    return '¥1.0000';
  }

  const rate = CurrencyConverter.getExchangeRate(selectedCurrency);
  const symbol = CURRENCY_OPTIONS.find(option => option.value === selectedCurrency)?.symbol || '';
  return `${symbol}${rate.toFixed(4)}`;
});

// 获取汇率更新时间
const getExchangeRateUpdateTime = computed(() => {
  const cacheStatus = ExchangeRateAPI.getCacheStatus();
  if (cacheStatus.updateTime) {
    return `更新时间: ${cacheStatus.updateTime}`;
  }
  return '实时更新';
});

// 关闭设置页面
const closeSettings = () => {
  emit('close');
};

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <div v-if="visible" class="settings-overlay" @click="closeSettings">
    <div class="settings-modal" @click.stop>
      <div class="settings-header">
        <h2>设置</h2>
        <button class="close-btn" @click="closeSettings">×</button>
      </div>

      <div class="settings-content">
        <div class="setting-section">
          <h3>时区设置</h3>
          <p class="setting-description">
            选择您的时区，系统会将Booth的JST时间转换为您的本地时间显示。
          </p>

          <div class="setting-item">
            <label for="timezone-select">时区：</label>
            <select id="timezone-select" v-model="settings.timezone" @change="onTimezoneChange" class="timezone-select">
              <option v-for="option in TIMEZONE_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="current-time">
            <span>当前时间：{{ new Date().toLocaleString('zh-CN', { timeZone: settings.timezone }) }}</span>
          </div>
        </div>

        <div class="setting-section">
          <h3>货币设置</h3>
          <p class="setting-description">
            选择目标货币，系统会将日元金额转换为您选择的货币显示。
          </p>

          <div class="setting-item">
            <label for="currency-select">目标货币：</label>
            <select id="currency-select" v-model="settings.targetCurrency" class="currency-select">
              <option v-for="option in CURRENCY_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="exchange-rate-info">
            <span>当前汇率：1 JPY = {{ getExchangeRateDisplay }}</span>
            <span class="update-time">{{ getExchangeRateUpdateTime }}</span>
          </div>
        </div>

        <div class="setting-section">
          <h3>数据管理</h3>
          <div class="setting-actions">
            <button @click="saveSettings" :disabled="isSaving" class="save-btn">
              {{ isSaving ? '保存中...' : '保存设置' }}
            </button>
            <button @click="resetSettings" class="reset-btn">重置为默认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.settings-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-header h2 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ef4444;
}

.settings-content {
  padding: 24px;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-section h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.setting-description {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.setting-item label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  min-width: 60px;
}

.timezone-select,
.currency-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
}

.current-time,
.exchange-rate-info {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 4px;
}

.setting-actions {
  display: flex;
  gap: 12px;
}

.save-btn,
.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.reset-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.reset-btn:hover {
  background: #e5e7eb;
}
</style>