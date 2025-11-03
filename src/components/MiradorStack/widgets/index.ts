/**
 * MiradorStack Widgets Index
 * Exports all available MiradorStack widgets for easy importing
 */

// Base Components
export { default as MiradorBaseWidget } from "./MiradorBaseWidget.vue";

// Metrics & Monitoring Widgets
export { default as MiradorMetricsChart } from "./MiradorMetricsChart.vue";
export { default as MiradorServiceStatus } from "./MiradorServiceStatus.vue";
export { default as MiradorAlertDashboard } from "./MiradorAlertDashboard.vue";

// RCA & Analysis Widgets
export { default as MiradorRCAWidget } from "./MiradorRCAWidget.vue";

// Widget Types & Configs
export * from "../types";
export * from "../composables/useMiradorStackAPI";
export * from "../composables/useMiradorStackWidget";

// Widget Registry for Dynamic Loading
export const MIRADOR_WIDGETS = {
  "metrics-chart": () => import("./MiradorMetricsChart.vue"),
  "service-status": () => import("./MiradorServiceStatus.vue"),
  "alert-dashboard": () => import("./MiradorAlertDashboard.vue"),
  "base-widget": () => import("./MiradorBaseWidget.vue"),
  "rca-widget": () => import("./MiradorRCAWidget.vue"),
} as const;

export type MiradorWidgetTypes = keyof typeof MIRADOR_WIDGETS;

// Widget Categories for Organization
export const WIDGET_CATEGORIES = {
  monitoring: {
    label: "Monitoring & Metrics",
    description: "Widgets for monitoring system metrics and performance",
    widgets: ["metrics-chart", "service-status"],
  },
  alerting: {
    label: "Alerts & Notifications",
    description: "Widgets for managing alerts and notifications",
    widgets: ["alert-dashboard"],
  },
  analytics: {
    label: "Analytics & Insights",
    description: "Widgets for data analysis and insights",
    widgets: ["rca-widget"],
  },
  operations: {
    label: "Operations & Management",
    description: "Widgets for operational tasks and management",
    widgets: [],
  },
} as const;

// Widget Metadata
export interface WidgetMetadata {
  id: string;
  name: string;
  description: string;
  category: keyof typeof WIDGET_CATEGORIES;
  icon: string;
  defaultSize: {
    width: number;
    height: number;
  };
  minSize: {
    width: number;
    height: number;
  };
  configSchema?: any;
}

export const WIDGET_METADATA: Record<MiradorWidgetTypes, WidgetMetadata> = {
  "metrics-chart": {
    id: "metrics-chart",
    name: "Metrics Chart",
    description: "Display time-series metrics data in various chart formats",
    category: "monitoring",
    icon: "chart-line",
    defaultSize: { width: 500, height: 350 },
    minSize: { width: 300, height: 200 },
  },
  "service-status": {
    id: "service-status",
    name: "Service Status",
    description: "Monitor the health and status of services",
    category: "monitoring",
    icon: "server",
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 400, height: 300 },
  },
  "alert-dashboard": {
    id: "alert-dashboard",
    name: "Alert Dashboard",
    description: "View and manage system alerts and notifications",
    category: "alerting",
    icon: "bell",
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 400 },
  },
  "rca-widget": {
    id: "rca-widget",
    name: "Root Cause Analysis",
    description: "Perform root cause analysis on incidents and system issues",
    category: "analytics",
    icon: "search",
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 600, height: 400 },
  },
  "base-widget": {
    id: "base-widget",
    name: "Base Widget",
    description: "Base component for creating custom widgets",
    category: "operations",
    icon: "widget",
    defaultSize: { width: 400, height: 300 },
    minSize: { width: 200, height: 150 },
  },
};

// Utility Functions
export const getWidgetComponent = async (type: MiradorWidgetTypes) => {
  const loader = MIRADOR_WIDGETS[type];
  if (!loader) {
    throw new Error(`Widget type "${type}" not found`);
  }
  return await loader();
};

export const getWidgetMetadata = (type: MiradorWidgetTypes): WidgetMetadata => {
  return WIDGET_METADATA[type];
};

export const getWidgetsByCategory = (category: keyof typeof WIDGET_CATEGORIES): MiradorWidgetTypes[] => {
  return Object.entries(WIDGET_METADATA)
    .filter(([, metadata]) => metadata.category === category)
    .map(([type]) => type as MiradorWidgetTypes);
};

export const getAllWidgetTypes = (): MiradorWidgetTypes[] => {
  return Object.keys(MIRADOR_WIDGETS) as MiradorWidgetTypes[];
};
