<template>
  <div
    :class="['mirador-widget', `mirador-widget--${type}`, { 'mirador-widget--loading': loading }]"
    :style="widgetStyle"
  >
    <!-- Widget Header -->
    <div v-if="showHeader" class="mirador-widget__header">
      <div class="mirador-widget__title">
        <Icon v-if="icon" :name="icon" class="mirador-widget__icon" />
        <span>{{ title }}</span>
      </div>
      <div class="mirador-widget__actions">
        <button
          v-if="refreshable"
          @click="handleRefresh"
          :disabled="loading"
          class="mirador-widget__action"
          title="Refresh"
        >
          <Icon name="refresh" :class="{ rotating: loading }" />
        </button>
        <button v-if="expandable" @click="handleExpand" class="mirador-widget__action" title="Expand">
          <Icon name="expand" />
        </button>
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Widget Content -->
    <div class="mirador-widget__content">
      <!-- Loading State -->
      <div v-if="loading" class="mirador-widget__loading">
        <div class="mirador-widget__spinner"></div>
        <span>Loading...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mirador-widget__error">
        <Icon name="warning" class="mirador-widget__error-icon" />
        <div class="mirador-widget__error-message">
          <p>{{ error }}</p>
          <button @click="handleRefresh" class="mirador-widget__retry"> Try Again </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="isEmpty" class="mirador-widget__empty">
        <Icon name="inbox" class="mirador-widget__empty-icon" />
        <p>{{ emptyMessage }}</p>
      </div>

      <!-- Widget Content Slot -->
      <div v-else class="mirador-widget__body">
        <slot :data="data" :config="config" />
      </div>
    </div>

    <!-- Widget Footer -->
    <div v-if="showFooter" class="mirador-widget__footer">
      <div class="mirador-widget__meta">
        <span v-if="lastUpdated" class="mirador-widget__timestamp">
          Updated: {{ lastUpdated ? formatTimestamp(lastUpdated) : "" }}
        </span>
        <span v-if="dataCount" class="mirador-widget__count"> {{ dataCount }} items </span>
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, PropType } from "vue";
  import Icon from "../Icon.vue";
  import { useMiradorStackWidget } from "../composables/useMiradorStackWidget";

  export default defineComponent({
    name: "MiradorBaseWidget",
    components: {
      Icon,
    },
    props: {
      type: {
        type: String as PropType<string>,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        default: "",
      },
      loading: {
        type: Boolean,
        default: false,
      },
      error: {
        type: String,
        default: "",
      },
      data: {
        type: Object,
        default: () => ({}),
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
      showHeader: {
        type: Boolean,
        default: true,
      },
      showFooter: {
        type: Boolean,
        default: false,
      },
      refreshable: {
        type: Boolean,
        default: true,
      },
      expandable: {
        type: Boolean,
        default: false,
      },
      emptyMessage: {
        type: String,
        default: "No data available",
      },
      lastUpdated: {
        type: [String, Number, Date, null] as PropType<string | number | Date | null>,
        default: null,
        required: false,
      },
      dataCount: {
        type: Number,
        default: 0,
      },
    },
    emits: ["refresh", "expand"],
    setup(props, { emit }) {
      const { formatTimestamp, defaultTheme } = useMiradorStackWidget();

      const widgetStyle = computed(() => ({
        width: `${props.width}px`,
        height: `${props.height}px`,
        "--primary-color": defaultTheme.primaryColor,
        "--background-color": defaultTheme.backgroundColor,
        "--text-color": defaultTheme.textColor,
        "--border-color": defaultTheme.borderColor,
        "--success-color": defaultTheme.successColor,
        "--warning-color": defaultTheme.warningColor,
        "--error-color": defaultTheme.errorColor,
      }));

      const isEmpty = computed(() => {
        if (Array.isArray(props.data)) {
          return props.data.length === 0;
        }
        return Object.keys(props.data).length === 0;
      });

      const handleRefresh = () => {
        emit("refresh");
      };

      const handleExpand = () => {
        emit("expand");
      };

      return {
        widgetStyle,
        isEmpty,
        handleRefresh,
        handleExpand,
        formatTimestamp,
      };
    },
  });
</script>

<style lang="scss" scoped>
  .mirador-widget {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--background-color);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    transition: box-shadow 0.3s ease;
    overflow: hidden;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    }

    &--loading {
      pointer-events: none;
    }
  }

  .mirador-widget__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    background: rgb(0 0 0 / 2%);
  }

  .mirador-widget__title {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: var(--text-color);
    font-size: 14px;
  }

  .mirador-widget__icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }

  .mirador-widget__actions {
    display: flex;
    gap: 8px;
  }

  .mirador-widget__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-color);
    transition: background-color 0.2s ease;

    &:hover {
      background: rgb(0 0 0 / 10%);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .mirador-widget__content {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .mirador-widget__body {
    height: 100%;
    padding: 16px;
  }

  .mirador-widget__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-color);
    font-size: 14px;
  }

  .mirador-widget__spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  .mirador-widget__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;
    text-align: center;
  }

  .mirador-widget__error-icon {
    width: 32px;
    height: 32px;
    color: var(--error-color);
    margin-bottom: 12px;
  }

  .mirador-widget__error-message p {
    color: var(--text-color);
    margin: 0 0 12px;
    font-size: 14px;
  }

  .mirador-widget__retry {
    padding: 6px 12px;
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }

  .mirador-widget__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgb(0 0 0 / 45%);
    font-size: 14px;
  }

  .mirador-widget__empty-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .mirador-widget__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-top: 1px solid var(--border-color);
    background: rgb(0 0 0 / 2%);
    font-size: 12px;
    color: rgb(0 0 0 / 65%);
  }

  .mirador-widget__meta {
    display: flex;
    gap: 12px;
  }

  .rotating {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
