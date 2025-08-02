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
        <div v-for="item in paymentData" :key="item.method" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: getItemColor(item.method) }"></div>
          <div class="legend-text">
            <span class="legend-label">{{ item.method }}</span>
            <span class="legend-value">{{ item.count }} 单 ({{ item.percentage }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import type { PaymentMethodData } from '../../utils/analysis/chart-data-processor';
import { ChartDataProcessor } from '../../utils/analysis/chart-data-processor';
import { logger } from '../../utils/core/logger';

interface Props {
  paymentData: PaymentMethodData[];
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
let chart: Chart | null = null;

// 计算总订单数
const totalOrders = computed(() => {
  return props.paymentData.reduce((sum, item) => sum + item.count, 0);
});

// 获取项目颜色
const getItemColor = (method: string): string => {
  const colors = ChartDataProcessor.getChartColors(props.paymentData.length);
  const index = props.paymentData.findIndex(item => item.method === method);
  return colors[index] || '#6b7280';
};

// 创建图表配置
const createChartConfig = (): ChartConfiguration => {
  const labels = props.paymentData.map(item => item.method);
  const data = props.paymentData.map(item => item.count);
  const colors = props.paymentData.map(item => getItemColor(item.method));

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
  chart.options = config.options;
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
watch(() => props.paymentData, () => {
  if (chart) {
    updateChart();
  }
}, { deep: true });

onMounted(() => {
  initChart();
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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  width: 35%;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
  box-sizing: border-box;
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
  flex-direction: row;
  gap: 4px;
  align-items: center;
}

.legend-label {
  font-size: 10px;
  font-weight: 500;
  color: #374151;
}

.legend-value {
  font-size: 9px;
  color: #6b7280;
}
</style>