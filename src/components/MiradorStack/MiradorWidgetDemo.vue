<template>
  <div class="mirador-widget-demo">
    <div class="demo-header">
      <h1>🚀 MiradorStack Widget Development Framework</h1>
      <p>Interactive widget development and testing environment</p>

      <div class="demo-controls">
        <button @click="refreshAllWidgets" class="refresh-btn">
          <Icon name="refresh" :class="{ spinning: refreshing }" />
          Refresh All
        </button>
        <button @click="toggleTheme" class="theme-btn">
          <Icon :name="isDarkTheme ? 'sun' : 'moon'" />
          {{ isDarkTheme ? "Light" : "Dark" }} Theme
        </button>
        <button @click="showConfig = !showConfig" class="config-btn">
          <Icon name="settings" />
          Configuration
        </button>
      </div>
    </div>

    <!-- Widget Configuration Panel -->
    <div v-if="showConfig" class="config-panel">
      <h3>Widget Configuration</h3>
      <div class="config-grid">
        <div class="config-section">
          <h4>Metrics Chart</h4>
          <label>
            Chart Type:
            <select v-model="metricsConfig.chartType">
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
            </select>
          </label>
          <label>
            <input type="checkbox" v-model="metricsConfig.showLegend" />
            Show Legend
          </label>
          <label>
            Unit:
            <input type="text" v-model="metricsConfig.unit" placeholder="%" />
          </label>
        </div>

        <div class="config-section">
          <h4>Service Status</h4>
          <label>
            Max Services:
            <input type="number" v-model="serviceConfig.maxServices" min="1" max="20" />
          </label>
          <label>
            <input type="checkbox" v-model="serviceConfig.showMetrics" />
            Show Metrics
          </label>
        </div>

        <div class="config-section">
          <h4>Alert Dashboard</h4>
          <label>
            Max Alerts:
            <input type="number" v-model="alertConfig.maxAlerts" min="5" max="100" />
          </label>
          <label>
            <input type="checkbox" v-model="alertConfig.showResolved" />
            Show Resolved
          </label>
        </div>
      </div>
    </div>

    <!-- Widget Grid -->
    <div class="widget-grid">
      <!-- Metrics Chart Widget -->
      <div class="widget-container">
        <div class="widget-header">
          <h3>📊 Metrics Chart Widget</h3>
          <div class="widget-actions">
            <button @click="generateNewMetricsData">🎲 Random Data</button>
            <button @click="exportWidget('metrics')">📤 Export</button>
          </div>
        </div>
        <MiradorMetricsChart
          title="CPU & Memory Usage"
          :queries="metricsQueries"
          :config="metricsConfig"
          :width="500"
          :height="350"
          :auto-refresh="true"
          :refresh-interval="30"
          @refresh="handleMetricsRefresh"
          @time-range-change="handleTimeRangeChange"
        />
      </div>

      <!-- Service Status Widget -->
      <div class="widget-container">
        <div class="widget-header">
          <h3>🛡️ Service Status Widget</h3>
          <div class="widget-actions">
            <button @click="toggleServiceHealth">🔄 Toggle Health</button>
            <button @click="exportWidget('service')">📤 Export</button>
          </div>
        </div>
        <MiradorServiceStatus
          title="MiradorStack Services"
          :config="serviceConfig"
          :width="600"
          :height="400"
          @service-click="handleServiceClick"
          @refresh="handleServiceRefresh"
        />
      </div>

      <!-- Alert Dashboard Widget -->
      <div class="widget-container">
        <div class="widget-header">
          <h3>🚨 Alert Dashboard Widget</h3>
          <div class="widget-actions">
            <button @click="simulateNewAlert">➕ New Alert</button>
            <button @click="exportWidget('alert')">📤 Export</button>
          </div>
        </div>
        <MiradorAlertDashboard
          title="System Alerts"
          :config="alertConfig"
          :width="700"
          :height="500"
          @alert-click="handleAlertClick"
          @alert-action="handleAlertAction"
          @refresh="handleAlertRefresh"
        />
      </div>

      <!-- Base Widget Example -->
      <div class="widget-container">
        <div class="widget-header">
          <h3>🧩 Base Widget Example</h3>
          <div class="widget-actions">
            <button @click="toggleBaseWidgetState">🔄 Toggle State</button>
          </div>
        </div>
        <MiradorBaseWidget
          type="demo-widget"
          title="Custom Widget Demo"
          icon="widget"
          :loading="baseWidgetLoading"
          :error="baseWidgetError"
          :data="baseWidgetData"
          :width="400"
          :height="300"
          :show-footer="true"
          @refresh="handleBaseWidgetRefresh"
        >
          <template #default="{ data }">
            <div class="demo-content">
              <h4>Custom Widget Content</h4>
              <p>This demonstrates how to create custom widgets using MiradorBaseWidget.</p>
              <div class="demo-stats">
                <div class="stat-item">
                  <span class="stat-label">Data Points</span>
                  <span class="stat-value">{{ Object.keys(data).length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Status</span>
                  <span class="stat-value">{{ baseWidgetLoading ? "Loading" : "Ready" }}</span>
                </div>
              </div>
              <pre class="data-preview">{{ JSON.stringify(data, null, 2) }}</pre>
            </div>
          </template>
        </MiradorBaseWidget>
      </div>

      <!-- RCA Widget -->
      <div class="widget-container">
        <div class="widget-header">
          <h3>🔍 Root Cause Analysis Widget</h3>
          <div class="widget-actions">
            <button @click="refreshRCAWidget">🔄 Refresh</button>
          </div>
        </div>
        <MiradorRCAWidget />
      </div>
    </div>

    <!-- Development Tools Section -->
    <div class="dev-tools">
      <h2>🛠️ Development Tools</h2>

      <div class="tool-section">
        <h3>Widget Scaffold Generator</h3>
        <div class="scaffold-generator">
          <input
            v-model="newWidgetName"
            placeholder="Enter widget name (e.g., NetworkMonitor)"
            @keyup.enter="generateScaffold"
          />
          <button @click="generateScaffold" :disabled="!newWidgetName"> Generate Scaffold </button>
        </div>

        <div v-if="scaffoldOutput" class="scaffold-output">
          <h4>Generated Component:</h4>
          <pre><code>{{ scaffoldOutput.template }}</code></pre>
          <h4>Usage:</h4>
          <pre><code>{{ scaffoldOutput.usage }}</code></pre>
        </div>
      </div>

      <div class="tool-section">
        <h3>API Integration Test</h3>
        <div class="api-test">
          <input v-model="testApiEndpoint" placeholder="API endpoint to test" />
          <button @click="testApiEndpoint && testAPI(testApiEndpoint)"> Test API </button>
        </div>

        <div v-if="apiTestResult" class="api-result">
          <h4>API Test Result:</h4>
          <pre><code>{{ JSON.stringify(apiTestResult, null, 2) }}</code></pre>
        </div>
      </div>

      <div class="tool-section">
        <h3>Performance Monitor</h3>
        <div class="performance-stats">
          <div class="perf-item">
            <span>Render Time</span>
            <span>{{ renderTime }}ms</span>
          </div>
          <div class="perf-item">
            <span>Memory Usage</span>
            <span>{{ memoryUsage }}MB</span>
          </div>
          <div class="perf-item">
            <span>Active Widgets</span>
            <span>{{ activeWidgets }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="event-log">
      <h3>📝 Event Log</h3>
      <div class="log-controls">
        <button @click="clearLog">Clear</button>
        <button @click="exportLog">Export</button>
      </div>
      <div class="log-entries">
        <div v-for="(entry, index) in eventLog" :key="index" :class="['log-entry', `log-${entry.type}`]">
          <span class="log-time">{{ entry.timestamp }}</span>
          <span class="log-type">{{ entry.type.toUpperCase() }}</span>
          <span class="log-message">{{ entry.message }}</span>
          <span v-if="entry.data" class="log-data">{{ JSON.stringify(entry.data) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from "vue";
  // import { MiradorStackDevTools } from '../index';

  // Import widgets (note: in real implementation, these would be proper imports)
  // For demo purposes, we'll create placeholder components
  const MiradorMetricsChart = { template: '<div class="widget-placeholder">Metrics Chart Widget</div>' };
  const MiradorServiceStatus = { template: '<div class="widget-placeholder">Service Status Widget</div>' };
  const MiradorAlertDashboard = { template: '<div class="widget-placeholder">Alert Dashboard Widget</div>' };
  const MiradorBaseWidget = { template: '<div class="widget-placeholder">Base Widget</div>' };
  const MiradorRCAWidget = { template: '<div class="widget-placeholder">RCA Widget</div>' };
  const Icon = { template: '<span class="icon">🔸</span>' };

  // Reactive state
  const showConfig = ref(false);
  const isDarkTheme = ref(false);
  const refreshing = ref(false);
  const newWidgetName = ref("");
  const scaffoldOutput = ref<any>(null);
  const testApiEndpoint = ref("/api/v1/metrics");
  const apiTestResult = ref<any>(null);

  // Widget configurations
  const metricsConfig = reactive({
    chartType: "line",
    showLegend: true,
    showGrid: true,
    unit: "%",
    decimals: 1,
    thresholds: [
      { value: 80, color: "#faad14", label: "Warning" },
      { value: 90, color: "#f5222d", label: "Critical" },
    ],
  });

  const serviceConfig = reactive({
    maxServices: 12,
    showMetrics: true,
    sortBy: "name",
  });

  const alertConfig = reactive({
    maxAlerts: 50,
    showResolved: true,
    autoRefresh: true,
    sortBy: "timestamp",
  });

  // Base widget state
  const baseWidgetLoading = ref(false);
  const baseWidgetError = ref("");
  const baseWidgetData = ref({
    message: "Hello from custom widget!",
    count: 42,
    items: ["item1", "item2", "item3"],
  });

  // Sample queries
  const metricsQueries = ref([
    {
      id: "cpu-usage",
      name: "CPU Usage",
      type: "metrics",
      query: "cpu_usage_percent",
      datasource: "mirador-core",
      interval: "1m",
    },
    {
      id: "memory-usage",
      name: "Memory Usage",
      type: "metrics",
      query: "memory_usage_percent",
      datasource: "mirador-core",
      interval: "1m",
    },
  ]);

  // Event logging
  const eventLog = ref<any[]>([]);
  const logEvent = (type: string, message: string, data?: any) => {
    eventLog.value.unshift({
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Keep only last 100 entries
    if (eventLog.value.length > 100) {
      eventLog.value = eventLog.value.slice(0, 100);
    }
  };

  // Performance monitoring
  const renderTime = ref(0);
  const memoryUsage = ref(0);
  const activeWidgets = computed(() => 4); // Static for demo

  // Event handlers
  const refreshAllWidgets = async () => {
    refreshing.value = true;
    logEvent("info", "Refreshing all widgets");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logEvent("success", "All widgets refreshed successfully");
    } catch (error) {
      logEvent("error", "Failed to refresh widgets", error);
    } finally {
      refreshing.value = false;
    }
  };

  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    document.body.classList.toggle("dark-theme", isDarkTheme.value);
    logEvent("info", `Switched to ${isDarkTheme.value ? "dark" : "light"} theme`);
  };

  const generateNewMetricsData = () => {
    logEvent("info", "Generated new metrics data");
  };

  const toggleServiceHealth = () => {
    logEvent("info", "Toggled service health status");
  };

  const simulateNewAlert = () => {
    logEvent("warning", "Simulated new alert created");
  };

  const toggleBaseWidgetState = () => {
    baseWidgetLoading.value = !baseWidgetLoading.value;
    if (baseWidgetLoading.value) {
      setTimeout(() => {
        baseWidgetLoading.value = false;
        baseWidgetData.value.count += 1;
      }, 2000);
    }
    logEvent("info", "Toggled base widget state");
  };

  const generateScaffold = () => {
    if (!newWidgetName.value) return;

    try {
      // scaffoldOutput.value = MiradorStackDevTools.generateWidgetScaffold(newWidgetName.value);
      scaffoldOutput.value = {
        template: `<template>\n  <div class="custom-widget">\n    <h3>${newWidgetName.value} Widget</h3>\n    <p>Generated scaffold for ${newWidgetName.value}</p>\n  </div>\n</template>`,
        usage: `// Import and use the generated ${newWidgetName.value} widget\n<${newWidgetName.value}Widget />`,
      };
      logEvent("success", `Generated scaffold for ${newWidgetName.value}`);
    } catch (error) {
      logEvent("error", "Failed to generate scaffold", error);
    }
  };

  const testAPI = async (endpoint: string) => {
    try {
      logEvent("info", `Testing API endpoint: ${endpoint}`);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      apiTestResult.value = {
        success: true,
        status: 200,
        data: { message: "API test successful" },
        timestamp: new Date().toISOString(),
      };
      logEvent("success", "API test completed successfully");
    } catch (error: any) {
      apiTestResult.value = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      logEvent("error", "API test failed", error);
    }
  };

  const exportWidget = (type: string) => {
    logEvent("info", `Exported ${type} widget configuration`);
  };

  const clearLog = () => {
    eventLog.value = [];
    logEvent("info", "Event log cleared");
  };

  const exportLog = () => {
    const logData = JSON.stringify(eventLog.value, null, 2);
    const blob = new Blob([logData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mirador-widget-log.json";
    a.click();
    URL.revokeObjectURL(url);
    logEvent("info", "Event log exported");
  };

  const refreshRCAWidget = () => {
    logEvent("info", "RCA widget refreshed");
  };

  // Widget event handlers
  const handleMetricsRefresh = () => logEvent("info", "Metrics chart refreshed");
  const handleTimeRangeChange = (range: string) => logEvent("info", `Time range changed to ${range}`);
  const handleServiceClick = (service: any) => logEvent("info", `Service clicked: ${service?.name || "unknown"}`);
  const handleServiceRefresh = () => logEvent("info", "Service status refreshed");
  const handleAlertClick = (alert: any) => logEvent("info", `Alert clicked: ${alert?.id || "unknown"}`);
  const handleAlertAction = (action: any) => logEvent("info", `Alert action: ${action?.action}`, action);
  const handleAlertRefresh = () => logEvent("info", "Alert dashboard refreshed");
  const handleBaseWidgetRefresh = () => logEvent("info", "Base widget refreshed");

  // Performance monitoring
  const startPerformanceMonitoring = () => {
    setInterval(() => {
      renderTime.value = Math.random() * 50 + 10;
      memoryUsage.value = Math.random() * 100 + 50;
    }, 2000);
  };

  // Lifecycle
  onMounted(() => {
    logEvent("success", "MiradorStack Widget Demo initialized");
    startPerformanceMonitoring();
  });
</script>

<style lang="scss" scoped>


  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .mirador-widget-demo {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      color: #1890ff;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  .demo-controls {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #1890ff;
        color: #1890ff;
      }
    }
  }

  .config-panel {
    background: #f9f9f9;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;

    h3 {
      margin-top: 0;
    }
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .config-section {
    h4 {
      margin-bottom: 10px;
      color: #262626;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;

      input,
      select {
        margin-left: 8px;
        padding: 4px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
      }
    }
  }

  .widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .widget-container {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;

    h3 {
      margin: 0;
      font-size: 16px;
    }
  }

  .widget-actions {
    display: flex;
    gap: 8px;

    button {
      padding: 4px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;

      &:hover {
        border-color: #1890ff;
      }
    }
  }

  .widget-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    background: #f5f5f5;
    color: #8c8c8c;
    font-size: 18px;
    font-weight: 500;
  }

  .demo-content {
    padding: 16px;
    height: 100%;

    h4 {
      margin-top: 0;
      color: #262626;
    }

    p {
      color: #666;
      margin-bottom: 16px;
    }
  }

  .demo-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 12px;
      color: #8c8c8c;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
    }
  }

  .data-preview {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-size: 11px;
    max-height: 100px;
    overflow-y: auto;
  }

  .dev-tools {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    h2 {
      margin-top: 0;
      color: #1890ff;
    }
  }

  .tool-section {
    margin-bottom: 30px;

    h3 {
      color: #262626;
    }
  }

  .scaffold-generator {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #1890ff;
      background: #1890ff;
      color: white;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .scaffold-output,
  .api-result {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 12px;

    h4 {
      margin-top: 0;
    }

    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
  }

  .api-test {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }
  }

  .performance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .perf-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .event-log {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 20px;

    h3 {
      margin-top: 0;
      color: #262626;
    }
  }

  .log-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    button {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }
  }

  .log-entries {
    max-height: 300px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 12px;
  }

  .log-entry {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid #f0f0f0;

    &.log-success {
      color: #52c41a;
    }

    &.log-warning {
      color: #faad14;
    }

    &.log-error {
      color: #f5222d;
    }

    &.log-info {
      color: #1890ff;
    }
  }

  .log-time {
    color: #8c8c8c;
  }

  .log-type {
    font-weight: 600;
    min-width: 60px;
  }

  .log-data {
    font-size: 10px;
    color: #666;
    word-break: break-all;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
  }

  // Dark theme support
  :global(.dark-theme) {
    .mirador-widget-demo {
      background: #1f1f1f;
      color: #d4d4d4;
    }

    .widget-placeholder {
      background: #2a2a2a;
      color: #8c8c8c;
    }
  }
</style>
