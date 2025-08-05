<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS, type UserSettings } from '../../types/settings';
import { CurrencyManager } from '../../utils/currency/currency-manager';
import { SettingsManager } from '../../utils/settings/settings-manager';
import Modal from '../common/Modal/index.vue';

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
  targetCurrency: 'CNY',
  privacyMode: false
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
  
  // 实时触发设置变化事件
  emit('settings-changed', settings.value);
};

// 获取汇率显示信息
const getExchangeRateDisplay = computed(() => {
  const selectedCurrency = settings.value.targetCurrency;
  if (selectedCurrency === 'JPY') {
    return '¥1.0000';
  }

  const rate = CurrencyManager.getExchangeRateSync(selectedCurrency);
  const symbol = CURRENCY_OPTIONS.find(option => option.value === selectedCurrency)?.symbol || '';
  return `${symbol}${rate?.toFixed(4) || '0.0000'}`;
});

// 获取汇率更新时间
const getExchangeRateUpdateTime = computed(() => {
  const cacheStatus = CurrencyManager.getCacheStatus();
  if (cacheStatus.updateTime) {
    return `更新时间: ${cacheStatus.updateTime}`;
  }
  return '实时更新';
});

// 处理隐私模式变化
const handlePrivacyModeChange = () => {
  // 实时触发设置变化事件
  emit('settings-changed', settings.value);
};

// 处理货币变化
const handleCurrencyChange = () => {
  // 实时触发设置变化事件
  emit('settings-changed', settings.value);
};

// 关闭设置页面
const closeSettings = () => {
  emit('close');
};

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <Modal 
    :visible="visible" 
    title="设置" 
    size="medium"
    @close="closeSettings"
  >
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
          <select id="currency-select" v-model="settings.targetCurrency" @change="handleCurrencyChange" class="currency-select">
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
        <h3>隐私设置</h3>
        <p class="setting-description">
          开启隐私模式后，所有敏感信息（订单数量、订单编号、金额）将显示为 "*"。
        </p>

        <div class="setting-item">
          <label class="booth-toggle">
            <input 
              type="checkbox" 
              v-model="settings.privacyMode" 
              @change="handlePrivacyModeChange"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">隐私模式</span>
          </label>
        </div>
      </div>

      <div class="setting-section">
        <h3>数据管理</h3>
        <div class="setting-actions">
          <button @click="saveSettings" :disabled="isSaving" class="booth-btn booth-btn-success booth-btn-md">
            {{ isSaving ? '保存中...' : '保存设置' }}
          </button>
          <button @click="resetSettings" class="booth-btn booth-btn-secondary booth-btn-md">重置为默认</button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>

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

</style>