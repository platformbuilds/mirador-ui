# MiradorStack Widget Development Framework

A comprehensive widget development framework for building custom observability dashboards in MiradorStack.

## 🎯 Overview

The MiradorStack Widget Framework provides a foundation for building interactive, data-driven widgets that integrate seamlessly with the MiradorStack observability platform. It includes:

- **Base Components**: Reusable widget foundation with common functionality
- **Pre-built Widgets**: Ready-to-use widgets for common observability use cases
- **Composables**: Reactive utilities for API integration and widget management
- **Type Definitions**: Comprehensive TypeScript support
- **Development Tools**: Scaffolding and utilities for rapid widget development

## 📁 Directory Structure

```
src/components/MiradorStack/
├── types/                  # TypeScript type definitions
│   └── index.ts           # Widget and API types
├── composables/           # Vue composables for shared functionality
│   ├── useMiradorStackAPI.ts      # API integration
│   └── useMiradorStackWidget.ts   # Widget utilities
├── widgets/               # Widget components
│   ├── MiradorBaseWidget.vue      # Base widget component
│   ├── MiradorMetricsChart.vue    # Time-series metrics charts
│   ├── MiradorServiceStatus.vue   # Service health monitoring
│   ├── MiradorAlertDashboard.vue  # Alert management
│   └── index.ts          # Widget exports and registry
└── index.ts              # Main framework entry point
```

## 🚀 Quick Start

### 1. Import Components

```typescript
// Import individual widgets
import { 
  MiradorMetricsChart,
  MiradorServiceStatus,
  MiradorAlertDashboard 
} from '@/components/MiradorStack/widgets';

// Import composables
import { useMiradorStackWidget } from '@/components/MiradorStack/composables/useMiradorStackWidget';
```

### 2. Use Pre-built Widgets

```vue
<template>
  <!-- Metrics Chart Widget -->
  <MiradorMetricsChart
    title="CPU Usage"
    :queries="cpuQueries"
    :config="chartConfig"
    :width="500"
    :height="350"
    @refresh="handleRefresh"
  />

  <!-- Service Status Widget -->
  <MiradorServiceStatus
    title="Service Health"
    :config="{ maxServices: 12, showMetrics: true }"
    :width="600"
    :height="400"
  />

  <!-- Alert Dashboard Widget -->
  <MiradorAlertDashboard
    title="Active Alerts"
    :config="{ maxAlerts: 50, autoRefresh: true }"
    :width="700"
    :height="500"
  />
</template>

<script setup lang="ts">
const cpuQueries = [
  {
    id: 'cpu-usage',
    name: 'CPU Usage',
    type: 'metrics' as const,
    query: 'cpu_usage_percent',
    datasource: 'mirador-core',
    interval: '1m',
  }
];

const chartConfig = {
  chartType: 'line' as const,
  showLegend: true,
  unit: '%',
  thresholds: [
    { value: 80, color: '#faad14', label: 'Warning' },
    { value: 90, color: '#f5222d', label: 'Critical' },
  ],
};
</script>
```

## 🛠️ Creating Custom Widgets

### 1. Widget Development Scaffold

Use the built-in scaffold generator to create new widgets:

```typescript
import { MiradorStackDevTools } from '@/components/MiradorStack';

const scaffold = MiradorStackDevTools.generateWidgetScaffold('CustomWidget');
console.log(scaffold.template); // Complete Vue component template
console.log(scaffold.usage);    // Usage examples
```

### 2. Manual Widget Creation

Create a custom widget by extending `MiradorBaseWidget`:

```vue
<template>
  <MiradorBaseWidget
    type="custom-widget"
    :title="title"
    icon="custom-icon"
    :loading="loading"
    :error="error"
    :data="widgetData"
    :config="config"
    :width="width"
    :height="height"
    @refresh="handleRefresh"
  >
    <template #default="{ data }">
      <div class="custom-widget-content">
        <!-- Your custom widget implementation -->
      </div>
    </template>
  </MiradorBaseWidget>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MiradorBaseWidget from './MiradorBaseWidget.vue';
import { useMiradorStackWidget } from '../composables/useMiradorStackWidget';

const props = defineProps<{
  title: string;
  config: any;
  width: number;
  height: number;
}>();

const { formatNumber, getStatusColor } = useMiradorStackWidget();

const loading = ref(false);
const error = ref('');
const widgetData = ref({});

const handleRefresh = async () => {
  loading.value = true;
  try {
    // Implement your data fetching logic
    const response = await fetch('/api/v1/custom-data');
    widgetData.value = await response.json();
  } catch (err) {
    error.value = 'Failed to load data';
  } finally {
    loading.value = false;
  }
};

onMounted(handleRefresh);
</script>
```

## 🔧 Widget Configuration

### Metrics Chart Configuration

```typescript
interface MetricsChartConfig {
  chartType: 'line' | 'area' | 'bar';
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
```

### Service Status Configuration

```typescript
interface ServiceStatusConfig {
  maxServices?: number;
  showMetrics?: boolean;
  statusFilter?: string[];
  sortBy?: 'name' | 'status' | 'requestRate' | 'errorRate';
}
```

### Alert Dashboard Configuration

```typescript
interface AlertDashboardConfig {
  maxAlerts?: number;
  showResolved?: boolean;
  autoRefresh?: boolean;
  sortBy?: 'timestamp' | 'severity' | 'source';
}
```

## 🔌 API Integration

### Using the API Composable

```typescript
import { useMiradorStackAPI } from '@/components/MiradorStack/composables/useMiradorStackAPI';

const { data, loading, error, refresh } = useMiradorStackAPI({
  queries: [
    {
      id: 'metrics-query',
      name: 'CPU Metrics',
      type: 'metrics',
      query: 'cpu_usage_percent',
      datasource: 'mirador-core',
    }
  ],
  autoRefresh: true,
  refreshInterval: 30, // seconds
  timeRange: {
    from: '-1h',
    to: 'now',
  },
});
```

### API Response Format

The framework expects API responses in this format:

```typescript
interface MiradorStackAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

## 🎨 Styling and Theming

### CSS Variables

Widgets use CSS variables for consistent theming:

```scss
.mirador-widget {
  --primary-color: #1890ff;
  --background-color: #ffffff;
  --text-color: #000000d9;
  --border-color: #d9d9d9;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
}
```

### Custom Styling

Override widget styles using scoped CSS:

```vue
<style lang="scss" scoped>
.custom-widget-content {
  padding: 16px;
  background: var(--background-color);
  
  .custom-element {
    color: var(--primary-color);
    border: 1px solid var(--border-color);
  }
}
</style>
```

## 📊 Available Widgets

### 1. MiradorMetricsChart
- **Purpose**: Display time-series metrics data
- **Features**: Line, area, bar charts with thresholds
- **Use Cases**: CPU usage, memory usage, request rates

### 2. MiradorServiceStatus  
- **Purpose**: Monitor service health and performance
- **Features**: Service grid, metrics display, status indicators
- **Use Cases**: Microservice monitoring, health dashboards

### 3. MiradorAlertDashboard
- **Purpose**: Manage alerts and notifications
- **Features**: Alert filtering, severity management, actions
- **Use Cases**: Incident management, alert triage

### 4. MiradorBaseWidget
- **Purpose**: Foundation for custom widgets
- **Features**: Loading states, error handling, responsive design
- **Use Cases**: Building new custom widgets

## 🛠️ Development Tools

### Widget Scaffold Generator

```typescript
import { MiradorStackDevTools } from '@/components/MiradorStack';

// Generate a new widget scaffold
const scaffold = MiradorStackDevTools.generateWidgetScaffold('NetworkMonitor');

// scaffold includes:
// - Complete Vue component template
// - TypeScript setup
// - SCSS styles
// - Usage examples
```

### Development Setup Helper

```typescript
const devSetup = MiradorStackDevTools.createWidgetDevelopmentSetup();

console.log(devSetup.sampleQueries);    // Sample API queries
console.log(devSetup.sampleConfig);     // Sample widget config
console.log(devSetup.developmentTips);  // Development best practices
```

## 🚀 Integration with Existing Dashboard

### 1. Register Widgets

Add widgets to the existing SkyWalking dashboard system:

```typescript
// In src/views/dashboard/configuration/widget/graph-styles/index.ts
import MiradorMetricsChart from '@/components/MiradorStack/widgets/MiradorMetricsChart.vue';
import MiradorServiceStatus from '@/components/MiradorStack/widgets/MiradorServiceStatus.vue';

export default {
  // ... existing configs
  MiradorMetricsChart,
  MiradorServiceStatus,
};
```

### 2. Add Widget Types

Update the dashboard types:

```typescript
// In src/types/dashboard.ts
export type GraphConfig = 
  | BarConfig
  | LineConfig
  // ... existing types
  | MiradorMetricsConfig
  | MiradorServiceConfig;
```

### 3. Widget Selection UI

Add MiradorStack widgets to the widget picker:

```vue
<!-- In widget configuration components -->
<template>
  <div class="widget-selector">
    <div class="widget-category">
      <h3>MiradorStack Widgets</h3>
      <div class="widget-grid">
        <div class="widget-option" @click="selectWidget('mirador-metrics-chart')">
          <Icon name="chart-line" />
          <span>Metrics Chart</span>
        </div>
        <div class="widget-option" @click="selectWidget('mirador-service-status')">
          <Icon name="server" />
          <span>Service Status</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 📝 Best Practices

### 1. Widget Development
- Always extend `MiradorBaseWidget` for consistency
- Implement proper error handling and loading states
- Use TypeScript for type safety
- Follow the established naming convention: `Mirador[WidgetName]`

### 2. Performance
- Use `v-memo` for expensive computations
- Implement virtual scrolling for large data sets
- Debounce API calls and user interactions
- Use `shallowRef` for large objects

### 3. Accessibility
- Add proper ARIA labels and roles
- Implement keyboard navigation
- Ensure color contrast compliance
- Provide alternative text for visual elements

### 4. Testing
- Write unit tests for widget logic
- Test with various data scenarios
- Validate responsive behavior
- Test error and loading states

## 🔍 Troubleshooting

### Common Issues

1. **Widget not displaying data**
   - Check API endpoint configuration
   - Verify data format matches expected types
   - Check network requests in browser dev tools

2. **Styling issues**
   - Ensure CSS variables are properly defined
   - Check for conflicting styles
   - Verify responsive breakpoints

3. **Performance problems**
   - Implement data virtualization for large datasets
   - Use `useMemo` for expensive calculations
   - Optimize re-render cycles

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Set debug flag in widget config
const config = {
  debug: true,
  // ... other config
};
```

## 🔮 Future Enhancements

- Real-time data streaming support
- Advanced chart types (heatmaps, sankey diagrams)
- Drag-and-drop dashboard builder
- Widget templates and marketplace
- Advanced filtering and correlation features
- Mobile-optimized widget variants

## 📄 License

This framework is part of the MiradorStack project and follows the Apache 2.0 license.