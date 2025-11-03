/**
 * MiradorStack Components
 * Main entry point for MiradorStack UI components and widgets
 */

// Export all widgets
export * from "./widgets";

// Export composables
export { useMiradorStackWidget } from "./composables/useMiradorStackWidget";

// Export types (remove the problematic import for now)
// export * from './types';

// Main MiradorStack component installation function for Vue
export function installMiradorStack(app: any) {
  // Register global components if needed
  // This can be used when integrating MiradorStack widgets into the main Vue app

  console.log("MiradorStack components installed");

  return app;
}

// Development utilities
export const MiradorStackDevTools = {
  version: "1.0.0",
  components: {
    widgets: [
      "MiradorMetricsChart",
      "MiradorServiceStatus",
      "MiradorAlertDashboard",
      "MiradorRCAWidget",
      "MiradorBaseWidget",
    ],
    composables: ["useMiradorStackWidget"],
  },

  // Helper to create a new widget development environment
  createWidgetDevelopmentSetup() {
    return {
      sampleQueries: [
        {
          id: "cpu-usage",
          name: "CPU Usage",
          type: "metrics" as const,
          query: "cpu_usage_percent",
          datasource: "mirador-core",
          interval: "1m",
        },
        {
          id: "memory-usage",
          name: "Memory Usage",
          type: "metrics" as const,
          query: "memory_usage_percent",
          datasource: "mirador-core",
          interval: "1m",
        },
      ],

      sampleConfig: {
        chartType: "line" as const,
        showLegend: true,
        showGrid: true,
        unit: "%",
        decimals: 1,
        thresholds: [
          { value: 80, color: "#faad14", label: "Warning" },
          { value: 90, color: "#f5222d", label: "Critical" },
        ],
      },

      developmentTips: [
        "1. Use MiradorBaseWidget as the foundation for new widgets",
        "2. Implement useMiradorStackAPI composable for data fetching",
        "3. Follow the established naming convention: Mirador[WidgetName]",
        "4. Add proper TypeScript types for widget configurations",
        "5. Include responsive design considerations",
        "6. Implement error handling and loading states",
        "7. Add accessibility features (ARIA labels, keyboard navigation)",
        "8. Write unit tests for widget logic",
        "9. Document widget configuration options",
        "10. Consider performance optimizations for large datasets",
      ],
    };
  },

  // Widget development scaffold generator
  generateWidgetScaffold(widgetName: string) {
    const pascalCase = widgetName.charAt(0).toUpperCase() + widgetName.slice(1);
    const kebabCase = widgetName.replace(/([A-Z])/g, "-$1").toLowerCase();

    return {
      componentName: `Mirador${pascalCase}`,
      fileName: `Mirador${pascalCase}.vue`,
      widgetType: kebabCase,

      template: `<template>
  <MiradorBaseWidget
    type="${kebabCase}"
    :title="title"
    icon="widget"
    :loading="loading"
    :error="error"
    :data="widgetData"
    :config="config"
    :width="width"
    :height="height"
    :last-updated="lastUpdated"
    :show-footer="true"
    @refresh="handleRefresh"
  >
    <template #default="{ data }">
      <div class="${kebabCase}-container">
        <!-- Your widget content here -->
        <p>{{ widgetName }} Widget Content</p>
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </template>
  </MiradorBaseWidget>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import MiradorBaseWidget from './MiradorBaseWidget.vue';
import { useMiradorStackWidget } from '../composables/useMiradorStackWidget';

export default defineComponent({
  name: 'Mirador${pascalCase}',
  components: {
    MiradorBaseWidget,
  },
  props: {
    title: {
      type: String,
      default: '${widgetName} Widget',
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 300,
    },
  },
  setup(props) {
    const loading = ref(false);
    const error = ref('');
    const widgetData = ref({});
    const lastUpdated = ref<Date | null>(null);

    const handleRefresh = async () => {
      loading.value = true;
      try {
        // Implement your data fetching logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
        widgetData.value = { message: 'Data loaded successfully' };
        lastUpdated.value = new Date();
      } catch (err) {
        error.value = 'Failed to load data';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      handleRefresh();
    });

    return {
      loading,
      error,
      widgetData,
      lastUpdated,
      handleRefresh,
    };
  },
});
</script>

<style lang="scss" scoped>
.${kebabCase}-container {
  height: 100%;
  padding: 16px;
}
</style>`,

      usage: `// Import and use in your dashboard
import { Mirador${pascalCase} } from '@/components/MiradorStack/widgets';

// In your template
<Mirador${pascalCase}
  title="My ${pascalCase}"
  :config="{ /* your config */ }"
  :width="500"
  :height="350"
  @refresh="handleWidgetRefresh"
/>`,
    };
  },
};

export default {
  install: installMiradorStack,
  devTools: MiradorStackDevTools,
};
