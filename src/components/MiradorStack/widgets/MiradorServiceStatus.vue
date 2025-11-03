<template>
  <MiradorBaseWidget
    type="service-status"
    :title="title"
    icon="server"
    :loading="loading"
    :error="error"
    :data="serviceData"
    :config="config"
    :width="width"
    :height="height"
    :last-updated="lastUpdated"
    :data-count="services.length"
    :show-footer="true"
    @refresh="handleRefresh"
  >
    <template #default>
      <div class="service-status-grid">
        <div
          v-for="service in services"
          :key="service.id"
          :class="['service-card', `service-card--${service.status}`]"
          @click="handleServiceClick(service)"
        >
          <div class="service-header">
            <div class="service-name">{{ service.name }}</div>
            <div class="service-version">v{{ service.version }}</div>
          </div>

          <div class="service-status">
            <div :class="['status-indicator', `status-indicator--${service.status}`]"></div>
            <span class="status-text">{{ formatStatus(service.status) }}</span>
          </div>

          <div class="service-metrics">
            <div class="metric-item">
              <span class="metric-label">Requests/s</span>
              <span class="metric-value">{{ formatNumber(service.metrics.requestRate) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Error Rate</span>
              <span class="metric-value error-rate">{{ formatPercentage(service.metrics.errorRate) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">P95 Latency</span>
              <span class="metric-value">{{ formatDuration(service.metrics.latency.p95) }}</span>
            </div>
          </div>

          <div class="service-endpoints">
            <div class="endpoint-count">
              {{ service.endpoints.length }} endpoint{{ service.endpoints.length !== 1 ? "s" : "" }}
            </div>
            <div class="dependency-count">
              {{ service.dependencies.length }} dependenc{{ service.dependencies.length !== 1 ? "ies" : "y" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Service Details Modal -->
      <div v-if="selectedService" class="service-modal-overlay" @click="closeServiceDetails">
        <div class="service-modal" @click.stop>
          <div class="service-modal-header">
            <h3>{{ selectedService.name }} Details</h3>
            <button @click="closeServiceDetails" class="modal-close">×</button>
          </div>

          <div class="service-modal-content">
            <div class="service-detail-section">
              <h4>Endpoints</h4>
              <ul class="endpoint-list">
                <li v-for="endpoint in selectedService.endpoints" :key="endpoint">
                  {{ endpoint }}
                </li>
              </ul>
            </div>

            <div class="service-detail-section">
              <h4>Dependencies</h4>
              <ul class="dependency-list">
                <li v-for="dependency in selectedService.dependencies" :key="dependency">
                  {{ dependency }}
                </li>
              </ul>
            </div>

            <div class="service-detail-section">
              <h4>Metrics</h4>
              <div class="metrics-grid">
                <div class="metric-detail">
                  <span class="metric-title">Request Rate</span>
                  <span class="metric-detail-value">{{ formatNumber(selectedService.metrics.requestRate) }}/s</span>
                </div>
                <div class="metric-detail">
                  <span class="metric-title">Error Rate</span>
                  <span class="metric-detail-value">{{ formatPercentage(selectedService.metrics.errorRate) }}</span>
                </div>
                <div class="metric-detail">
                  <span class="metric-title">P50 Latency</span>
                  <span class="metric-detail-value">{{ formatDuration(selectedService.metrics.latency.p50) }}</span>
                </div>
                <div class="metric-detail">
                  <span class="metric-title">P95 Latency</span>
                  <span class="metric-detail-value">{{ formatDuration(selectedService.metrics.latency.p95) }}</span>
                </div>
                <div class="metric-detail">
                  <span class="metric-title">P99 Latency</span>
                  <span class="metric-detail-value">{{ formatDuration(selectedService.metrics.latency.p99) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MiradorBaseWidget>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted, PropType } from "vue";
  import MiradorBaseWidget from "./MiradorBaseWidget.vue";
  import { useMiradorStackWidget } from "../composables/useMiradorStackWidget";

  interface ServiceMetrics {
    requestRate: number;
    errorRate: number;
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
  }

  interface Service {
    id: string;
    name: string;
    version: string;
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    endpoints: string[];
    dependencies: string[];
    metrics: ServiceMetrics;
  }

  interface ServiceStatusConfig {
    maxServices?: number;
    showMetrics?: boolean;
    statusFilter?: string[];
    sortBy?: "name" | "status" | "requestRate" | "errorRate";
  }

  export default defineComponent({
    name: "MiradorServiceStatus",
    components: {
      MiradorBaseWidget,
    },
    props: {
      title: {
        type: String,
        default: "Service Status",
      },
      config: {
        type: Object as PropType<ServiceStatusConfig>,
        default: () => ({
          maxServices: 12,
          showMetrics: true,
          sortBy: "name",
        }),
      },
      width: {
        type: Number,
        default: 600,
      },
      height: {
        type: Number,
        default: 400,
      },
    },
    emits: ["service-click", "refresh"],
    setup(props, { emit }) {
      const { formatNumber, formatDuration, getStatusColor, defaultTheme } = useMiradorStackWidget();

      // Reactive data
      const loading = ref(false);
      const error = ref("");
      const services = ref<Service[]>([]);
      const selectedService = ref<Service | null>(null);
      const lastUpdated = ref<Date | null>(null);

      // Computed properties
      const serviceData = computed(() => ({
        services: services.value,
        healthy: services.value.filter((s) => s.status === "healthy").length,
        degraded: services.value.filter((s) => s.status === "degraded").length,
        unhealthy: services.value.filter((s) => s.status === "unhealthy").length,
        unknown: services.value.filter((s) => s.status === "unknown").length,
      }));

      // Utility functions
      const formatStatus = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1);
      };

      const formatPercentage = (value: number): string => {
        return `${(value * 100).toFixed(1)}%`;
      };

      // Event handlers
      const handleRefresh = () => {
        fetchServices();
        emit("refresh");
      };

      const handleServiceClick = (service: Service) => {
        selectedService.value = service;
        emit("service-click", service);
      };

      const closeServiceDetails = () => {
        selectedService.value = null;
      };

      // Data fetching
      const fetchServices = async () => {
        loading.value = true;
        error.value = "";

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Generate sample service data
          const sampleServices = generateSampleServices();
          services.value = sampleServices;
          lastUpdated.value = new Date();
        } catch (err) {
          error.value = "Failed to fetch service status";
          console.error("Error fetching services:", err);
        } finally {
          loading.value = false;
        }
      };

      // Generate sample service data
      const generateSampleServices = (): Service[] => {
        const serviceNames = [
          "mirador-core",
          "mirador-rca",
          "mirador-nrt-aggregator",
          "api-gateway",
          "user-service",
          "notification-service",
          "payment-service",
          "inventory-service",
          "order-service",
          "auth-service",
          "search-service",
          "analytics-service",
        ];

        const statuses: Service["status"][] = ["healthy", "degraded", "unhealthy", "unknown"];

        return serviceNames.slice(0, props.config.maxServices || 12).map((name, index) => ({
          id: `service-${index + 1}`,
          name,
          version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(
            Math.random() * 20,
          )}`,
          status: statuses[Math.floor(Math.random() * (index < 3 ? 2 : 4))], // First few services more likely to be healthy
          endpoints: [`/api/v1/${name}/health`, `/api/v1/${name}/metrics`, `/api/v1/${name}/status`].slice(
            0,
            Math.floor(Math.random() * 3) + 1,
          ),
          dependencies: serviceNames
            .filter((s) => s !== name)
            .slice(0, Math.floor(Math.random() * 3))
            .sort(),
          metrics: {
            requestRate: Math.random() * 1000 + 10,
            errorRate: Math.random() * 0.1,
            latency: {
              p50: Math.random() * 100 + 10,
              p95: Math.random() * 200 + 50,
              p99: Math.random() * 500 + 100,
            },
          },
        }));
      };

      // Lifecycle
      onMounted(() => {
        fetchServices();
      });

      return {
        loading,
        error,
        services,
        selectedService,
        serviceData,
        lastUpdated,
        formatStatus,
        formatNumber,
        formatDuration,
        formatPercentage,
        handleRefresh,
        handleServiceClick,
        closeServiceDetails,
      };
    },
  });
</script>

<style lang="scss" scoped>
  .service-status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    padding: 8px;
    max-height: calc(100% - 16px);
    overflow-y: auto;
  }

  .service-card {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    }

    &--healthy {
      border-left: 4px solid #52c41a;
    }

    &--degraded {
      border-left: 4px solid #faad14;
    }

    &--unhealthy {
      border-left: 4px solid #f5222d;
    }

    &--unknown {
      border-left: 4px solid #d9d9d9;
    }
  }

  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .service-name {
    font-weight: 600;
    font-size: 14px;
    color: #262626;
  }

  .service-version {
    font-size: 12px;
    color: #8c8c8c;
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 10px;
  }

  .service-status {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;

    &--healthy {
      background: #52c41a;
    }

    &--degraded {
      background: #faad14;
    }

    &--unhealthy {
      background: #f5222d;
    }

    &--unknown {
      background: #d9d9d9;
    }
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
  }

  .service-metrics {
    margin-bottom: 10px;
  }

  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 0;
  }

  .metric-label {
    font-size: 11px;
    color: #8c8c8c;
  }

  .metric-value {
    font-size: 11px;
    font-weight: 500;
    color: #262626;

    &.error-rate {
      color: #f5222d;
    }
  }

  .service-endpoints {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #8c8c8c;
    border-top: 1px solid #f0f0f0;
    padding-top: 8px;
  }

  // Modal styles
  .service-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .service-modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgb(0 0 0 / 20%);
  }

  .service-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #262626;
    }
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #8c8c8c;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #262626;
    }
  }

  .service-modal-content {
    padding: 20px;
    max-height: calc(80vh - 80px);
    overflow-y: auto;
  }

  .service-detail-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      color: #262626;
    }
  }

  .endpoint-list,
  .dependency-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 4px 0;
      font-size: 13px;
      color: #595959;
      font-family: monospace;
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .metric-detail {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
  }

  .metric-title {
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 4px;
  }

  .metric-detail-value {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }
</style>
