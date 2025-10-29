<template>
    <div class="chart-container">
        <div class="chart-header">
            <h4>收入走势</h4>
            <div class="chart-info">
                <span class="data-points">{{ displayData.length }} 个数据点</span>
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ChartDataPoint } from '../../utils/analysis/data-analyzer';
import { DataAnalyzer } from '../../utils/analysis/data-analyzer';

interface Props {
    dataPoints: ChartDataPoint[];
    targetCurrency?: string;
    privacyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    privacyMode: false
});

const chartCanvas = ref<HTMLCanvasElement>();
let chart: Chart | null = null;

// 生成虚假数据
const generateFakeData = (originalData: ChartDataPoint[]): ChartDataPoint[] => {
  if (!props.privacyMode) {
    return originalData;
  }
  
  // 生成虚假的收入走势数据，确保收入至少十万，订单数至少1万
  const fakeData: ChartDataPoint[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (6 - i));
    
    fakeData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 900000) + 100000, // 10万-100万之间的随机收入
      orders: Math.floor(Math.random() * 40000) + 10000 // 1万-5万之间的随机订单数
    });
  }
  
  return fakeData.sort((a, b) => a.date.localeCompare(b.date));
};

// 计算显示数据
const displayData = computed(() => {
  return generateFakeData(props.dataPoints);
});

// 创建图表配置
const createChartConfig = (): ChartConfiguration => {
    const labels = displayData.value.map(point => DataAnalyzer.formatDateForDisplay(point.date));
    const revenueData = displayData.value.map(point => point.revenue);
    const orderData = displayData.value.map(point => point.orders);

    return {
        type: 'line' as ChartType,
        data: {
            labels,
            datasets: [
                {
                    label: '收入 (JPY)',
                    data: revenueData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: '订单数量',
                    data: orderData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (label.includes('收入')) {
                                return `${label}: ¥${value.toLocaleString()}`;
                            } else {
                                return `${label}: ${value} 单`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '日期',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                        display: true,
                        text: '收入 (JPY)',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '¥' + Number(value).toLocaleString();
                        }
                    }
                },
                y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                        display: true,
                        text: '订单数量',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function (value) {
                            return value + ' 单';
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
watch([() => props.dataPoints, () => props.privacyMode], () => {
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

.data-points {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
}

.chart-wrapper {
    position: relative;
    height: 250px;
    width: 100%;
    flex: 1;
}

canvas {
    width: 100% !important;
    height: 100% !important;
}
</style>