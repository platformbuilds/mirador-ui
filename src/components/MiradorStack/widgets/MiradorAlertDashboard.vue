<template>
  <MiradorBaseWidget
    type="alert-dashboard"
    :title="title"
    icon="bell"
    :loading="loading"
    :error="error"
    :data="alertData"
    :config="config"
    :width="width"
    :height="height"
    :last-updated="lastUpdated"
    :data-count="alerts.length"
    :show-footer="true"
    @refresh="handleRefresh"
  >
    <template #header-actions>
      <div class="alert-controls">
        <select v-model="selectedSeverity" @change="filterAlerts" class="severity-filter">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select v-model="selectedStatus" @change="filterAlerts" class="status-filter">
          <option value="">All Status</option>
          <option value="firing">Firing</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
    </template>

    <template #default>
      <div class="alert-dashboard">
        <!-- Alert Summary Cards -->
        <div class="alert-summary">
          <div class="summary-card critical">
            <div class="summary-icon">🚨</div>
            <div class="summary-content">
              <div class="summary-count">{{ alertSummary.critical }}</div>
              <div class="summary-label">Critical</div>
            </div>
          </div>
          <div class="summary-card warning">
            <div class="summary-icon">⚠️</div>
            <div class="summary-content">
              <div class="summary-count">{{ alertSummary.warning }}</div>
              <div class="summary-label">Warning</div>
            </div>
          </div>
          <div class="summary-card info">
            <div class="summary-icon">ℹ️</div>
            <div class="summary-content">
              <div class="summary-count">{{ alertSummary.info }}</div>
              <div class="summary-label">Info</div>
            </div>
          </div>
          <div class="summary-card resolved">
            <div class="summary-icon">✅</div>
            <div class="summary-content">
              <div class="summary-count">{{ alertSummary.resolved }}</div>
              <div class="summary-label">Resolved</div>
            </div>
          </div>
        </div>

        <!-- Alert List -->
        <div class="alert-list">
          <div
            v-for="alert in filteredAlerts"
            :key="alert.id"
            :class="['alert-item', `alert-item--${alert.severity}`, `alert-item--${alert.status}`]"
            @click="handleAlertClick(alert)"
          >
            <div class="alert-header">
              <div class="alert-severity-indicator">
                <div :class="['severity-badge', `severity-badge--${alert.severity}`]">
                  {{ alert.severity.toUpperCase() }}
                </div>
                <div :class="['status-badge', `status-badge--${alert.status}`]">
                  {{ alert.status.toUpperCase() }}
                </div>
              </div>
              <div class="alert-timestamp">
                {{ formatTimestamp(alert.timestamp) }}
              </div>
            </div>

            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-source">Source: {{ alert.source }}</div>
            </div>

            <div class="alert-labels">
              <span v-for="(value, key) in alert.labels" :key="key" class="alert-label"> {{ key }}={{ value }} </span>
            </div>

            <div class="alert-actions">
              <button
                v-if="alert.status === 'firing'"
                @click.stop="acknowledgeAlert(alert)"
                class="alert-action acknowledge"
              >
                Acknowledge
              </button>
              <button v-if="alert.status === 'firing'" @click.stop="resolveAlert(alert)" class="alert-action resolve">
                Resolve
              </button>
              <button @click.stop="viewAlertDetails(alert)" class="alert-action details"> Details </button>
            </div>
          </div>

          <div v-if="filteredAlerts.length === 0" class="no-alerts">
            <div class="no-alerts-icon">🔕</div>
            <div class="no-alerts-text">No alerts match the current filters</div>
          </div>
        </div>
      </div>

      <!-- Alert Details Modal -->
      <div v-if="selectedAlert" class="alert-modal-overlay" @click="closeAlertDetails">
        <div class="alert-modal" @click.stop>
          <div class="alert-modal-header">
            <h3>Alert Details</h3>
            <button @click="closeAlertDetails" class="modal-close">×</button>
          </div>

          <div class="alert-modal-content">
            <div class="alert-detail-section">
              <div class="alert-detail-title">{{ selectedAlert.title }}</div>
              <div class="alert-detail-meta">
                <span class="alert-detail-severity">{{ selectedAlert.severity.toUpperCase() }}</span>
                <span class="alert-detail-status">{{ selectedAlert.status.toUpperCase() }}</span>
                <span class="alert-detail-time">{{ formatTimestamp(selectedAlert.timestamp) }}</span>
              </div>
            </div>

            <div class="alert-detail-section">
              <h4>Description</h4>
              <p>{{ selectedAlert.description }}</p>
            </div>

            <div class="alert-detail-section">
              <h4>Source</h4>
              <p>{{ selectedAlert.source }}</p>
            </div>

            <div class="alert-detail-section">
              <h4>Labels</h4>
              <div class="labels-grid">
                <div v-for="(value, key) in selectedAlert.labels" :key="key" class="label-item">
                  <span class="label-key">{{ key }}</span>
                  <span class="label-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <div class="alert-modal-actions">
              <button
                v-if="selectedAlert.status === 'firing'"
                @click="acknowledgeAlert(selectedAlert)"
                class="modal-action acknowledge"
              >
                Acknowledge Alert
              </button>
              <button
                v-if="selectedAlert.status === 'firing'"
                @click="resolveAlert(selectedAlert)"
                class="modal-action resolve"
              >
                Resolve Alert
              </button>
              <button @click="closeAlertDetails" class="modal-action cancel"> Close </button>
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

  interface Alert {
    id: string;
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
    timestamp: string;
    source: string;
    labels: Record<string, string>;
    status: "firing" | "resolved";
  }

  interface AlertDashboardConfig {
    maxAlerts?: number;
    showResolved?: boolean;
    autoRefresh?: boolean;
    sortBy?: "timestamp" | "severity" | "source";
  }

  export default defineComponent({
    name: "MiradorAlertDashboard",
    components: {
      MiradorBaseWidget,
    },
    props: {
      title: {
        type: String,
        default: "Alert Dashboard",
      },
      config: {
        type: Object as PropType<AlertDashboardConfig>,
        default: () => ({
          maxAlerts: 50,
          showResolved: true,
          autoRefresh: true,
          sortBy: "timestamp",
        }),
      },
      width: {
        type: Number,
        default: 700,
      },
      height: {
        type: Number,
        default: 500,
      },
    },
    emits: ["alert-click", "alert-action", "refresh"],
    setup(props, { emit }) {
      const { formatTimestamp } = useMiradorStackWidget();

      // Reactive data
      const loading = ref(false);
      const error = ref("");
      const alerts = ref<Alert[]>([]);
      const selectedAlert = ref<Alert | null>(null);
      const selectedSeverity = ref("");
      const selectedStatus = ref("");
      const lastUpdated = ref<Date | null>(null);

      // Computed properties
      const alertData = computed(() => ({
        alerts: alerts.value,
        summary: alertSummary.value,
      }));

      const alertSummary = computed(() => ({
        critical: alerts.value.filter((a) => a.severity === "critical" && a.status === "firing").length,
        warning: alerts.value.filter((a) => a.severity === "warning" && a.status === "firing").length,
        info: alerts.value.filter((a) => a.severity === "info" && a.status === "firing").length,
        resolved: alerts.value.filter((a) => a.status === "resolved").length,
        total: alerts.value.length,
      }));

      const filteredAlerts = computed(() => {
        let filtered = alerts.value;

        if (selectedSeverity.value) {
          filtered = filtered.filter((a) => a.severity === selectedSeverity.value);
        }

        if (selectedStatus.value) {
          filtered = filtered.filter((a) => a.status === selectedStatus.value);
        }

        // Sort alerts
        filtered.sort((a, b) => {
          if (props.config.sortBy === "severity") {
            const severityOrder = { critical: 3, warning: 2, info: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
          }
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        return filtered.slice(0, props.config.maxAlerts || 50);
      });

      // Event handlers
      const handleRefresh = () => {
        fetchAlerts();
        emit("refresh");
      };

      const handleAlertClick = (alert: Alert) => {
        emit("alert-click", alert);
      };

      const filterAlerts = () => {
        // Filtering is handled by computed property
      };

      const acknowledgeAlert = (alert: Alert) => {
        console.log("Acknowledging alert:", alert.id);
        emit("alert-action", { action: "acknowledge", alert });
        // Update alert status locally (in real implementation, this would be an API call)
      };

      const resolveAlert = (alert: Alert) => {
        console.log("Resolving alert:", alert.id);
        alert.status = "resolved";
        emit("alert-action", { action: "resolve", alert });
        closeAlertDetails();
      };

      const viewAlertDetails = (alert: Alert) => {
        selectedAlert.value = alert;
      };

      const closeAlertDetails = () => {
        selectedAlert.value = null;
      };

      // Data fetching
      const fetchAlerts = async () => {
        loading.value = true;
        error.value = "";

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 600));

          // Generate sample alert data
          const sampleAlerts = generateSampleAlerts();
          alerts.value = sampleAlerts;
          lastUpdated.value = new Date();
        } catch (err) {
          error.value = "Failed to fetch alerts";
          console.error("Error fetching alerts:", err);
        } finally {
          loading.value = false;
        }
      };

      // Generate sample alert data
      const generateSampleAlerts = (): Alert[] => {
        const alertTemplates = [
          {
            severity: "critical" as const,
            title: "High CPU Usage Detected",
            description: "CPU usage has exceeded 90% for more than 5 minutes",
            source: "mirador-core",
          },
          {
            severity: "warning" as const,
            title: "Memory Usage Warning",
            description: "Memory usage is approaching 80% threshold",
            source: "mirador-rca",
          },
          {
            severity: "critical" as const,
            title: "Database Connection Failed",
            description: "Unable to establish connection to primary database",
            source: "api-gateway",
          },
          {
            severity: "warning" as const,
            title: "Slow API Response Time",
            description: "API response time has increased beyond acceptable limits",
            source: "user-service",
          },
          {
            severity: "info" as const,
            title: "Deployment Completed",
            description: "New version deployment has completed successfully",
            source: "deployment-pipeline",
          },
          {
            severity: "critical" as const,
            title: "Service Unavailable",
            description: "Payment service is returning 503 errors",
            source: "payment-service",
          },
          {
            severity: "warning" as const,
            title: "Disk Space Warning",
            description: "Available disk space is below 20%",
            source: "storage-monitor",
          },
          {
            severity: "info" as const,
            title: "Scheduled Maintenance",
            description: "Scheduled maintenance window starting in 2 hours",
            source: "maintenance-scheduler",
          },
        ];

        const statusOptions: Alert["status"][] = ["firing", "resolved"];
        const now = Date.now();

        return alertTemplates.map((template, index) => ({
          id: `alert-${index + 1}`,
          ...template,
          timestamp: new Date(now - Math.random() * 86400000 * 7).toISOString(), // Random time within last 7 days
          status: Math.random() > 0.3 ? "firing" : "resolved", // 70% firing, 30% resolved
          labels: {
            environment: Math.random() > 0.5 ? "production" : "staging",
            tenant: `tenant-${Math.floor(Math.random() * 5) + 1}`,
            region: Math.random() > 0.5 ? "us-east-1" : "eu-west-1",
            cluster: `cluster-${Math.floor(Math.random() * 3) + 1}`,
          },
        }));
      };

      // Lifecycle
      onMounted(() => {
        fetchAlerts();
      });

      return {
        loading,
        error,
        alerts,
        selectedAlert,
        selectedSeverity,
        selectedStatus,
        alertData,
        alertSummary,
        filteredAlerts,
        lastUpdated,
        formatTimestamp,
        handleRefresh,
        handleAlertClick,
        filterAlerts,
        acknowledgeAlert,
        resolveAlert,
        viewAlertDetails,
        closeAlertDetails,
      };
    },
  });
</script>

<style lang="scss" scoped>
  .alert-controls {
    display: flex;
    gap: 8px;
  }

  .severity-filter,
  .status-filter {
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

  .alert-dashboard {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .alert-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    padding: 0 16px;
  }

  .summary-card {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 6px;
    background: white;
    border: 1px solid #e8e8e8;

    &.critical {
      border-left: 4px solid #f5222d;
    }

    &.warning {
      border-left: 4px solid #faad14;
    }

    &.info {
      border-left: 4px solid #1890ff;
    }

    &.resolved {
      border-left: 4px solid #52c41a;
    }
  }

  .summary-icon {
    font-size: 20px;
    margin-right: 12px;
  }

  .summary-count {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
  }

  .summary-label {
    font-size: 12px;
    color: #8c8c8c;
  }

  .alert-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
  }

  .alert-item {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    margin-bottom: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }

    &--critical {
      border-left: 4px solid #f5222d;
    }

    &--warning {
      border-left: 4px solid #faad14;
    }

    &--info {
      border-left: 4px solid #1890ff;
    }

    &--resolved {
      opacity: 0.7;
    }
  }

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .alert-severity-indicator {
    display: flex;
    gap: 6px;
  }

  .severity-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    color: white;

    &--critical {
      background: #f5222d;
    }

    &--warning {
      background: #faad14;
    }

    &--info {
      background: #1890ff;
    }
  }

  .status-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;

    &--firing {
      background: #fff2e8;
      color: #fa8c16;
    }

    &--resolved {
      background: #f6ffed;
      color: #52c41a;
    }
  }

  .alert-timestamp {
    font-size: 11px;
    color: #8c8c8c;
  }

  .alert-content {
    margin-bottom: 8px;
  }

  .alert-title {
    font-weight: 600;
    color: #262626;
    margin-bottom: 4px;
  }

  .alert-description {
    font-size: 12px;
    color: #595959;
    margin-bottom: 4px;
  }

  .alert-source {
    font-size: 11px;
    color: #8c8c8c;
    font-style: italic;
  }

  .alert-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  .alert-label {
    font-size: 10px;
    background: #f5f5f5;
    color: #595959;
    padding: 2px 6px;
    border-radius: 10px;
    font-family: monospace;
  }

  .alert-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .alert-action {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s ease;

    &.acknowledge {
      background: #faad14;
      color: white;

      &:hover {
        background: #d48806;
      }
    }

    &.resolve {
      background: #52c41a;
      color: white;

      &:hover {
        background: #389e0d;
      }
    }

    &.details {
      background: #1890ff;
      color: white;

      &:hover {
        background: #096dd9;
      }
    }
  }

  .no-alerts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #8c8c8c;
  }

  .no-alerts-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  // Modal styles (reusing from service status)
  .alert-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .alert-modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgb(0 0 0 / 20%);
  }

  .alert-modal-header {
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

    &:hover {
      color: #262626;
    }
  }

  .alert-modal-content {
    padding: 20px;
    max-height: calc(80vh - 80px);
    overflow-y: auto;
  }

  .alert-detail-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #262626;
    }
  }

  .alert-detail-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .alert-detail-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .labels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .label-item {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .label-key {
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 2px;
  }

  .label-value {
    font-size: 12px;
    color: #262626;
    font-family: monospace;
  }

  .alert-modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .modal-action {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;

    &.acknowledge {
      background: #faad14;
      color: white;
    }

    &.resolve {
      background: #52c41a;
      color: white;
    }

    &.cancel {
      background: #f5f5f5;
      color: #262626;
    }
  }
</style>
