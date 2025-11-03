/** * Licensed to the Apache Software Foundation (ASF) under one or more * contributor license agreements. See the
NOTICE file distributed with * this work for additional information regarding copyright ownership. * The ASF licenses
this file to You under the Apache License, Version 2.0 * (the "License"); you may not use this file except in compliance
with * the License. You may obtain a copy of the License at * * http://www.apache.org/licenses/LICENSE-2.0 * * Unless
required by applicable law or agreed to in writing, software * distributed under the License is distributed on an "AS
IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. * See the License for the specific
language governing permissions and * limitations under the License. */
<template>
  <div class="mirador-rca-widget">
    <div class="rca-header">
      <h3>🔍 Root Cause Analysis</h3>
      <div class="rca-controls">
        <button @click="startInvestigation" :disabled="investigating" class="investigate-btn">
          {{ investigating ? "Investigating..." : "Start RCA" }}
        </button>
        <button @click="loadCorrelations" class="correlations-btn"> Load Correlations </button>
        <button @click="loadServiceGraph" class="service-graph-btn"> Service Graph </button>
      </div>
    </div>

    <!-- Investigation Form -->
    <div v-if="showInvestigationForm" class="investigation-form">
      <h4>Start RCA Investigation</h4>
      <form @submit.prevent="submitInvestigation">
        <div class="form-group">
          <label>Incident ID:</label>
          <input v-model="investigationData.incidentId" placeholder="INC-2025-001" required />
        </div>
        <div class="form-group">
          <label>Symptoms:</label>
          <textarea
            v-model="investigationData.symptoms"
            placeholder="high_cpu, connection_timeouts, error_rate"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Time Range:</label>
          <div class="time-range">
            <input type="datetime-local" v-model="investigationData.startTime" required />
            <span>to</span>
            <input type="datetime-local" v-model="investigationData.endTime" required />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="investigating">Start Investigation</button>
          <button type="button" @click="showInvestigationForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Correlations Display -->
    <div v-if="correlations.length > 0" class="correlations-section">
      <h4>Active Correlations</h4>
      <div class="correlations-list">
        <div
          v-for="correlation in correlations"
          :key="correlation.id"
          class="correlation-item"
          :class="`correlation-${
            correlation.confidence > 0.7 ? 'high' : correlation.confidence > 0.5 ? 'medium' : 'low'
          }`"
        >
          <div class="correlation-header">
            <span class="correlation-id">{{ correlation.id }}</span>
            <span class="correlation-confidence">{{ (correlation.confidence * 100).toFixed(1) }}% confidence</span>
          </div>
          <div class="correlation-query">{{ correlation.query }}</div>
          <div class="correlation-time">{{ formatTime(correlation.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- Service Graph Display -->
    <div v-if="serviceGraph" class="service-graph-section">
      <h4>Service Graph Analysis</h4>
      <div class="graph-visualization">
        <div class="graph-placeholder">
          <p>Service Graph Visualization</p>
          <p>Nodes: {{ serviceGraph.nodes?.length || 0 }}</p>
          <p>Edges: {{ serviceGraph.edges?.length || 0 }}</p>
        </div>
        <pre class="graph-data">{{ JSON.stringify(serviceGraph, null, 2) }}</pre>
      </div>
    </div>

    <!-- Results Display -->
    <div v-if="investigationResult" class="results-section">
      <h4>Investigation Results</h4>
      <div class="result-content">
        <div class="result-status" :class="`status-${investigationResult.status}`">
          Status: {{ investigationResult.status }}
        </div>
        <div v-if="investigationResult.rootCause" class="root-cause">
          <h5>Root Cause:</h5>
          <p>{{ investigationResult.rootCause }}</p>
        </div>
        <div v-if="investigationResult.recommendations" class="recommendations">
          <h5>Recommendations:</h5>
          <ul>
            <li v-for="rec in investigationResult.recommendations" :key="rec">{{ rec }}</li>
          </ul>
        </div>
        <pre class="raw-result">{{ JSON.stringify(investigationResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-section">
      <div class="error-message"> <strong>Error:</strong> {{ error }} </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import fetchQuery from "@/graphql/http";

  // Reactive state
  const investigating = ref(false);
  const showInvestigationForm = ref(false);
  const correlations = ref<any[]>([]);
  const serviceGraph = ref<any>(null);
  const investigationResult = ref<any>(null);
  const error = ref("");

  // Investigation form data
  const investigationData = reactive({
    incidentId: "",
    symptoms: "",
    startTime: "",
    endTime: "",
  });

  // Methods
  const startInvestigation = () => {
    showInvestigationForm.value = true;
    error.value = "";
  };

  const submitInvestigation = async () => {
    investigating.value = true;
    error.value = "";

    try {
      const payload = {
        incident_id: investigationData.incidentId,
        symptoms: investigationData.symptoms.split(",").map((s: string) => s.trim()),
        time_range: {
          start: new Date(investigationData.startTime).toISOString(),
          end: new Date(investigationData.endTime).toISOString(),
        },
        affected_services: [], // Optional
        anomaly_threshold: 0.8, // Optional
      };

      const response = await fetchQuery({
        method: "POST",
        path: "RCAInvestigate",
        json: payload,
      });

      if (response.errors) {
        throw new Error(response.errors);
      }

      // The response structure from mirador-core RCA handler
      investigationResult.value = response.data || response;
      showInvestigationForm.value = false;

      // Reset form
      investigationData.incidentId = "";
      investigationData.symptoms = "";
      investigationData.startTime = "";
      investigationData.endTime = "";
    } catch (err: any) {
      error.value = err.message || "Failed to start RCA investigation";
    } finally {
      investigating.value = false;
    }
  };

  const loadCorrelations = async () => {
    try {
      error.value = "";
      const response = await fetchQuery({
        method: "GET",
        path: "RCACorrelations",
      });

      if (response.errors) {
        throw new Error(response.errors);
      }

      // The response structure from mirador-core
      correlations.value = response.data?.correlations || response.correlations || [];
    } catch (err: any) {
      error.value = err.message || "Failed to load correlations";
    }
  };

  const loadServiceGraph = async () => {
    try {
      error.value = "";
      const payload = {
        start: new Date(Date.now() - 3600000).toISOString(), // Last hour
        end: new Date().toISOString(),
        client: "api-service", // Optional
        server: "database-service", // Optional
      };

      const response = await fetchQuery({
        method: "POST",
        path: "RCAServiceGraph",
        json: payload,
      });

      if (response.errors) {
        throw new Error(response.errors);
      }

      // The response structure from mirador-core
      serviceGraph.value = {
        nodes: [], // Will be populated from edges
        edges: response.edges || [],
        window: response.window,
        generated_at: response.generated_at,
      };
    } catch (err: any) {
      error.value = err.message || "Failed to load service graph";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
</script>

<style lang="scss" scoped>
  .mirador-rca-widget {
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .rca-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #1890ff;
    }
  }

  .rca-controls {
    display: flex;
    gap: 8px;

    button {
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #1890ff;
        color: #1890ff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .investigate-btn {
      background: #1890ff;
      color: white;
      border-color: #1890ff;

      &:hover {
        background: #40a9ff;
      }
    }
  }

  .investigation-form {
    background: #f9f9f9;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 20px;

    h4 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #262626;
    }

    .form-group {
      margin-bottom: 12px;

      label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: #595959;
      }

      input,
      textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #1890ff;
        }
      }

      textarea {
        resize: vertical;
        min-height: 60px;
      }
    }

    .time-range {
      display: flex;
      align-items: center;
      gap: 8px;

      input {
        flex: 1;
      }

      span {
        color: #8c8c8c;
      }
    }

    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;

      button {
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        cursor: pointer;

        &:first-child {
          background: #1890ff;
          color: white;
          border-color: #1890ff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .correlations-section,
  .service-graph-section,
  .results-section {
    margin-bottom: 20px;

    h4 {
      margin-bottom: 12px;
      color: #262626;
    }
  }

  .correlations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .correlation-item {
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: white;

    &.correlation-high {
      border-color: #52c41a;
      background: #f6ffed;
    }

    &.correlation-medium {
      border-color: #faad14;
      background: #fffbe6;
    }

    &.correlation-low {
      border-color: #f5222d;
      background: #fff2f0;
    }

    .correlation-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .correlation-id {
        font-weight: 600;
        color: #262626;
      }

      .correlation-confidence {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .correlation-query {
      font-family: monospace;
      font-size: 14px;
      color: #595959;
      margin-bottom: 4px;
    }

    .correlation-time {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .service-graph-section {
    .graph-visualization {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .graph-placeholder {
        padding: 20px;
        background: #f5f5f5;
        border-radius: 4px;
        text-align: center;
        color: #8c8c8c;

        p {
          margin: 4px 0;
        }
      }

      .graph-data {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  .results-section {
    .result-content {
      .result-status {
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 600;
        margin-bottom: 12px;

        &.status-completed {
          background: #f6ffed;
          color: #52c41a;
          border: 1px solid #b7eb8f;
        }

        &.status-in-progress {
          background: #fffbe6;
          color: #faad14;
          border: 1px solid #ffd591;
        }

        &.status-failed {
          background: #fff2f0;
          color: #f5222d;
          border: 1px solid #ffccc7;
        }
      }

      .root-cause,
      .recommendations {
        margin-bottom: 12px;

        h5 {
          margin-bottom: 8px;
          color: #262626;
        }

        p,
        ul {
          margin: 0;
          color: #595959;
        }

        ul {
          padding-left: 20px;
        }
      }

      .raw-result {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  .error-section {
    .error-message {
      padding: 12px;
      background: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 4px;
      color: #f5222d;
    }
  }
</style>
