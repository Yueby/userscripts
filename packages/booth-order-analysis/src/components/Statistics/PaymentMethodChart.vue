<template>
  <div class="chart-container">
    <div class="chart-header">
      <h4>支付方式分布</h4>
      <div class="chart-info">
        <span class="total-orders">共 {{ totalOrders }} 单</span>
      </div>
    </div>
    <div class="chart-content">
      <div class="chart-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <div class="legend-container">
        <div v-for="item in displayData" :key="item.method" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: getItemColor(item.method) }"></div>
          <div class="legend-text">
            <span class="legend-label">{{ item.method }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { PaymentMethodData } from '../../utils/analysis/data-analyzer';
import { DataAnalyzer } from '../../utils/analysis/data-analyzer';

interface Props {
  paymentData: PaymentMethodData[];
  privacyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  privacyMode: false
});

const chartCanvas = ref<HTMLCanvasElement>();
let chart: Chart | null = null;

// 生成虚假数据
const generateFakeData = (originalData: PaymentMethodData[]): PaymentMethodData[] => {
  if (!props.privacyMode) {
    return originalData;
  }

  // 生成虚假的支付方式数据，确保总订单数至少1万
  const fakeMethods = ['魔法水晶支付', '时空传送支付', '意念转账', '彩虹币支付'];
  const fakeData: PaymentMethodData[] = fakeMethods.map((method) => {
    // 生成10000-50000之间的随机数，确保总订单数至少1万
    const count = Math.floor(Math.random() * 40000) + 10000;
    return {
      method,
      count,
      percentage: 0 // 稍后计算
    };
  });

  // 计算百分比
  const totalCount = fakeData.reduce((sum, item) => sum + item.count, 0);
  fakeData.forEach(item => {
    item.percentage = Math.round((item.count / totalCount) * 100);
  });

  return fakeData.sort((a, b) => b.count - a.count);
};

// 计算显示数据
const displayData = computed(() => {
  return generateFakeData(props.paymentData);
});

// 计算总订单数
const totalOrders = computed(() => {
  return displayData.value.reduce((sum, item) => sum + item.count, 0);
});

// 获取项目颜色
const getItemColor = (method: string): string => {
  const colors = DataAnalyzer.getChartColors(displayData.value.length);
  const index = displayData.value.findIndex(item => item.method === method);
  return colors[index] || '#6b7280';
};

// 创建图表配置
const createChartConfig = (): ChartConfiguration => {
  const labels = displayData.value.map(item => item.method);
  const data = displayData.value.map(item => item.count);
  const colors = displayData.value.map(item => getItemColor(item.method));

  return {
    type: 'doughnut' as ChartType,
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // 使用自定义图例
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function (context: any) {
              const label = context.label || '';
              const value = context.parsed;
              const percentage = ((value / totalOrders.value) * 100).toFixed(1);
              return `${label}: ${value} 单 (${percentage}%)`;
            }
          }
        }
      }
    }
  };
};

// 初始化图表
const initChart = () => {
  if (!chartCanvas.value) return;

  const config = createChartConfig();
  chart = new Chart(chartCanvas.value, config);

};

// 更新图表
const updateChart = () => {
  if (!chart) return;

  const config = createChartConfig();
  chart.data = config.data;
  if (config.options) {
    chart.options = config.options;
  }
  chart.update();

};

// 销毁图表
const destroyChart = () => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
};

// 监听数据变化
watch([() => props.paymentData, () => props.privacyMode], () => {
  if (chart) {
    updateChart();
  }
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.chart-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-orders {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.chart-content {
  display: flex;
  gap: 16px;
  flex: 1;
  align-items: flex-start;
}

.chart-wrapper {
  position: relative;
  height: 180px;
  width: 65%;
  flex-shrink: 0;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 35%;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 8px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 5px;
  border-radius: 3px;
  background: #f9fafb;
  transition: background 0.2s;
  border: 1px solid #e5e7eb;
  font-size: 10px;
  white-space: nowrap;
}

.legend-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-text {
  display: flex;
  align-items: center;
}

.legend-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
}
</style>