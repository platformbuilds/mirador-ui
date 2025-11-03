<template>
  <MiradorBaseWidget
    type="metrics-chart"
    :title="title"
    icon="chart-line"
    :loading="loading"
    :error="error"
    :data="chartData"
    :config="config"
    :width="width"
    :height="height"
    :last-updated="lastUpdated"
    :data-count="dataCount"
    :show-footer="true"
    @refresh="handleRefresh"
  >
    <template #default>
      <div ref="chartContainer" class="metrics-chart-container">
        <canvas ref="chartCanvas" :width="chartWidth" :height="chartHeight"></canvas>
      </div>
    </template>

    <template #header-actions>
      <div class="chart-controls">
        <select v-model="selectedTimeRange" @change="handleTimeRangeChange" class="time-range-selector">
          <option value="5m">5 minutes</option>
          <option value="1h">1 hour</option>
          <option value="6h">6 hours</option>
          <option value="1d">1 day</option>
          <option value="7d">7 days</option>
        </select>
      </div>
    </template>
  </MiradorBaseWidget>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick, PropType } from "vue";
  import MiradorBaseWidget from "./MiradorBaseWidget.vue";
  import { useMiradorStackWidget } from "../composables/useMiradorStackWidget";

  interface MetricsChartConfig {
    chartType: "line" | "area" | "bar";
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    yAxisLabel?: string;
    xAxisLabel?: string;
    unit?: string;
    decimals?: number;
    thresholds?: Array<{
      value: number;
      color: string;
      label?: string;
    }>;
  }

  interface DataPoint {
    timestamp: number;
    value: number;
  }

  interface TimeSeries {
    name: string;
    data: DataPoint[];
    color?: string;
    unit?: string;
  }

  export default defineComponent({
    name: "MiradorMetricsChart",
    components: {
      MiradorBaseWidget,
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      queries: {
        type: Array,
        required: true,
      },
      config: {
        type: Object as PropType<MetricsChartConfig>,
        default: () => ({
          chartType: "line",
          showLegend: true,
          showGrid: true,
          decimals: 2,
        }),
      },
      width: {
        type: Number,
        default: 500,
      },
      height: {
        type: Number,
        default: 350,
      },
      autoRefresh: {
        type: Boolean,
        default: true,
      },
      refreshInterval: {
        type: Number,
        default: 30, // seconds
      },
    },
    emits: ["time-range-change", "refresh"],
    setup(props, { emit }) {
      const { formatNumber, formatTimestamp, generateChartColors, debounce } = useMiradorStackWidget();

      // Reactive data
      const loading = ref(false);
      const error = ref("");
      const timeSeries = ref<TimeSeries[]>([]);
      const lastUpdated = ref<Date | null>(null);
      const selectedTimeRange = ref("1h");

      // Chart references
      const chartContainer = ref<HTMLDivElement>();
      const chartCanvas = ref<HTMLCanvasElement>();
      const chart = ref<any>(null);

      // Computed properties
      const chartData = computed(() => ({
        timeSeries: timeSeries.value,
      }));

      const dataCount = computed(() => timeSeries.value.reduce((sum, series) => sum + series.data.length, 0));

      const chartWidth = computed(
        () => Math.max(props.width - 32, 200), // Account for padding
      );

      const chartHeight = computed(
        () => Math.max(props.height - 120, 150), // Account for header/footer
      );

      // Chart creation and updates
      const createChart = async () => {
        if (!chartCanvas.value || !timeSeries.value.length) return;

        // Destroy existing chart
        if (chart.value) {
          chart.value.destroy();
        }

        try {
          // Dynamic import of Chart.js to avoid SSR issues
          const { Chart, registerables } = await import("chart.js");
          Chart.register(...registerables);

          const ctx = chartCanvas.value.getContext("2d");
          if (!ctx) return;

          const colors = generateChartColors(timeSeries.value.length);

          const datasets = timeSeries.value.map((series, index) => ({
            label: series.name,
            data: series.data.map((point) => ({
              x: point.timestamp,
              y: point.value,
            })),
            borderColor: series.color || colors[index],
            backgroundColor:
              props.config.chartType === "area"
                ? (series.color || colors[index]) + "20"
                : series.color || colors[index],
            fill: props.config.chartType === "area",
            tension: 0.4,
            pointRadius: props.config.chartType === "line" ? 2 : 0,
          }));

          chart.value = new Chart(ctx, {
            type: props.config.chartType === "bar" ? "bar" : "line",
            data: { datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: "index",
              },
              plugins: {
                legend: {
                  display: props.config.showLegend !== false,
                  position: "bottom",
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const value = formatNumber(context.parsed.y, props.config.decimals || 2);
                      const unit = props.config.unit || "";
                      return `${context.dataset.label}: ${value}${unit}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  type: "time",
                  display: true,
                  title: {
                    display: !!props.config.xAxisLabel,
                    text: props.config.xAxisLabel || "",
                  },
                  grid: {
                    display: props.config.showGrid !== false,
                  },
                },
                y: {
                  display: true,
                  title: {
                    display: !!props.config.yAxisLabel,
                    text: props.config.yAxisLabel || "",
                  },
                  grid: {
                    display: props.config.showGrid !== false,
                  },
                  ticks: {
                    callback: (value: any) => {
                      const formatted = formatNumber(value, props.config.decimals || 2);
                      return formatted + (props.config.unit || "");
                    },
                  },
                },
              },
            },
          });

          // Add threshold lines if configured
          if (props.config.thresholds) {
            addThresholdLines();
          }
        } catch (err) {
          console.error("Error creating chart:", err);
          error.value = "Failed to create chart";
        }
      };

      const addThresholdLines = () => {
        if (!chart.value || !props.config.thresholds) return;

        // Add threshold annotations (requires chartjs-plugin-annotation)
        // This is a simplified version - full implementation would require the plugin
        const thresholds = props.config.thresholds;
        console.log("Thresholds configured:", thresholds);
      };

      const updateChart = debounce(async () => {
        if (chart.value && timeSeries.value.length > 0) {
          const colors = generateChartColors(timeSeries.value.length);

          chart.value.data.datasets = timeSeries.value.map((series, index) => ({
            label: series.name,
            data: series.data.map((point) => ({
              x: point.timestamp,
              y: point.value,
            })),
            borderColor: series.color || colors[index],
            backgroundColor:
              props.config.chartType === "area"
                ? (series.color || colors[index]) + "20"
                : series.color || colors[index],
            fill: props.config.chartType === "area",
            tension: 0.4,
            pointRadius: props.config.chartType === "line" ? 2 : 0,
          }));

          chart.value.update("none");
        } else {
          await createChart();
        }
      }, 100);

      // Event handlers
      const handleRefresh = () => {
        emit("refresh");
      };

      const handleTimeRangeChange = () => {
        emit("time-range-change", selectedTimeRange.value);
      };

      // Simulated data fetching (replace with actual API calls)
      const fetchData = async () => {
        loading.value = true;
        error.value = "";

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Generate sample data (replace with actual API integration)
          const sampleData = generateSampleData();
          timeSeries.value = sampleData;
          lastUpdated.value = new Date();
        } catch (err) {
          error.value = "Failed to fetch metrics data";
          console.error("Error fetching data:", err);
        } finally {
          loading.value = false;
        }
      };

      // Generate sample data for demonstration
      const generateSampleData = (): TimeSeries[] => {
        const now = Date.now();
        const timeRange = selectedTimeRange.value;
        let duration = 3600000; // 1 hour default
        let interval = 60000; // 1 minute

        switch (timeRange) {
          case "5m":
            duration = 300000;
            interval = 5000;
            break;
          case "6h":
            duration = 21600000;
            interval = 360000;
            break;
          case "1d":
            duration = 86400000;
            interval = 1800000;
            break;
          case "7d":
            duration = 604800000;
            interval = 3600000;
            break;
        }

        const dataPoints: DataPoint[] = [];
        for (let i = duration; i > 0; i -= interval) {
          dataPoints.push({
            timestamp: now - i,
            value: Math.random() * 100 + Math.sin(i / 1000000) * 20,
          });
        }

        return [
          {
            name: "CPU Usage",
            data: dataPoints,
            unit: "%",
          },
          {
            name: "Memory Usage",
            data: dataPoints.map((p) => ({
              ...p,
              value: Math.random() * 80 + 10,
            })),
            unit: "%",
          },
        ];
      };

      // Watch for data changes
      watch(() => timeSeries.value, updateChart, { deep: true });

      // Watch for config changes
      watch(() => props.config, createChart, { deep: true });

      // Watch for time range changes
      watch(selectedTimeRange, fetchData);

      // Lifecycle hooks
      onMounted(async () => {
        await fetchData();
        await nextTick();
        createChart();
      });

      onUnmounted(() => {
        if (chart.value) {
          chart.value.destroy();
        }
      });

      return {
        loading,
        error,
        chartData,
        dataCount,
        lastUpdated,
        selectedTimeRange,
        chartContainer,
        chartCanvas,
        chartWidth,
        chartHeight,
        handleRefresh,
        handleTimeRangeChange,
      };
    },
  });
</script>

<style lang="scss" scoped>
  .metrics-chart-container {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .chart-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .time-range-selector {
    padding: 4px 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }
</style>
