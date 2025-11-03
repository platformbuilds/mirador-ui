/**
 * MiradorStack Widget Configuration Composable
 * Provides reactive widget configuration management
 */

export interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useMiradorStackWidget() {
  // Default MiradorStack theme
  const defaultTheme: WidgetTheme = {
    primaryColor: "#1890ff",
    secondaryColor: "#722ed1",
    backgroundColor: "#ffffff",
    textColor: "#000000d9",
    borderColor: "#d9d9d9",
    successColor: "#52c41a",
    warningColor: "#faad14",
    errorColor: "#f5222d",
    infoColor: "#1890ff",
  };

  // Standard widget sizes
  const standardSizes = {
    small: { width: 300, height: 200 },
    medium: { width: 500, height: 350 },
    large: { width: 800, height: 500 },
    xlarge: { width: 1200, height: 700 },
  };

  // Get runtime configuration
  const getConfig = () => {
    return (window as any).__MIRADOR_CONFIG__ || {};
  };

  // Format numbers for display
  const formatNumber = (value: number, decimals = 2): string => {
    if (isNaN(value)) return "N/A";

    if (value >= 1e9) {
      return (value / 1e9).toFixed(decimals) + "B";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(decimals) + "M";
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(decimals) + "K";
    }

    return value.toFixed(decimals);
  };

  // Format duration (milliseconds to human readable)
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get status color based on health
  const getStatusColor = (status: string, theme = defaultTheme): string => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "ok":
      case "success":
        return theme.successColor;
      case "warning":
      case "degraded":
        return theme.warningColor;
      case "error":
      case "critical":
      case "unhealthy":
        return theme.errorColor;
      case "info":
      case "unknown":
      default:
        return theme.infoColor;
    }
  };

  // Generate chart colors
  const generateChartColors = (count: number, theme = defaultTheme): string[] => {
    const baseColors = [
      theme.primaryColor,
      theme.successColor,
      theme.warningColor,
      theme.errorColor,
      theme.secondaryColor,
      "#13c2c2",
      "#eb2f96",
      "#f759ab",
      "#9254de",
      "#40a9ff",
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }

    return colors;
  };

  // Convert timestamp to display format
  const formatTimestamp = (timestamp: string | number | Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Debounce utility for resize/input events
  const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Throttle utility for scroll/resize events
  const throttle = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), delay);
      }
    };
  };

  // Create responsive size calculator
  const calculateResponsiveSize = (
    containerWidth: number,
    containerHeight: number,
    aspectRatio = 16 / 9,
  ): WidgetSize => {
    const width = Math.min(containerWidth, containerHeight * aspectRatio);
    const height = Math.min(containerHeight, containerWidth / aspectRatio);

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    };
  };

  return {
    defaultTheme,
    standardSizes,
    getConfig,
    formatNumber,
    formatDuration,
    formatBytes,
    formatTimestamp,
    getStatusColor,
    generateChartColors,
    calculateResponsiveSize,
    debounce,
    throttle,
  };
}
