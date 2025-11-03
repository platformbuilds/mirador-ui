/*
 * Licensed to Apache Software Foundation (ASF) under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Apache Software Foundation (ASF) licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and
 * limitations under the License.
 */

// Common API Response Types
export interface APIResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  error?: string;
  timestamp?: string;
}

// Metrics API Types
export interface MetricsInstantQueryResponse {
  status: string;
  data: {
    resultType: "vector" | "scalar" | "string";
    result: Array<{
      metric: Record<string, string>;
      value: [number, string | number];
    }>;
  };
  metadata?: {
    executionTime: number;
    dataPoints: number;
    timeRange: string;
    step: number;
  };
  definitions?: {
    metrics: Record<string, MetricDefinition>;
    labels: Record<string, Record<string, LabelDefinition>>;
  };
}

export interface MetricsRangeQueryResponse {
  status: string;
  data: {
    resultType: "matrix";
    result: Array<{
      metric: Record<string, string>;
      values: Array<[number, string | number]>;
    }>;
  };
  metadata?: {
    executionTime: number;
    dataPoints: number;
    timeRange: string;
    step: number;
  };
  definitions?: {
    metrics: Record<string, MetricDefinition>;
    labels: Record<string, Record<string, LabelDefinition>>;
  };
}

export interface MetricDefinition {
  description?: string;
  owner?: string;
  tags?: string[];
  category?: string;
  sentiment?: string;
}

export interface LabelDefinition {
  type: string;
  required: boolean;
  allowedValues?: Record<string, unknown>;
  description?: string;
}

export interface MetricsLabelsResponse {
  status: string;
  data: string[];
}

export interface MetricsSeriesResponse {
  status: string;
  data: Array<Record<string, string>>;
}

export interface MetricsNamesResponse {
  status: string;
  data: string[];
}

// Logs API Types
export interface LogsQueryResponse {
  status: string;
  data: LogEntry[];
  metadata?: {
    total: number;
    returned: number;
  };
}

export interface LogsSearchResponse {
  status: string;
  data: {
    logs: LogEntry[];
    total: number;
    page_after?: {
      ts: number;
      offset: number;
    };
  };
}

export interface LogEntry {
  _time: string;
  _msg: string;
  [key: string]: unknown;
}

export interface LogsHistogramResponse {
  buckets: Array<{
    ts: number;
    count: number;
  }>;
  stats: {
    buckets: number;
    sampleN: number;
  };
  sampled: boolean;
}

export interface LogsFacetsResponse {
  facets: Array<{
    field: string;
    buckets: Array<{
      key: string;
      count: number;
    }>;
  }>;
  stats: {
    fields: number;
    sampleN: number;
  };
  sampled: boolean;
}

export interface LogsFieldsResponse {
  status: string;
  data: {
    fields: string[];
  };
}

// Traces API Types
export interface TracesSearchResponse {
  status: string;
  data: TraceSummary[];
  metadata?: {
    total: number;
    returned: number;
  };
}

export interface TraceSummary {
  traceId: string;
  rootService: string;
  rootOperation: string;
  startTime: number;
  endTime: number;
  duration: number;
  error: boolean;
  services: string[];
  operations: string[];
  spans: number;
  tags?: Record<string, string>;
}

export interface TraceDetail {
  traceId: string;
  spans: TraceSpan[];
  rootSpan?: TraceSpan;
  services: TraceService[];
  duration: number;
  startTime: number;
  endTime: number;
  error: boolean;
}

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  traceId: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  tags: Record<string, unknown>;
  logs: TraceLog[];
  references: TraceReference[];
  error: boolean;
}

export interface TraceLog {
  timestamp: number;
  fields: Record<string, unknown>;
}

export interface TraceReference {
  refType: "CHILD_OF" | "FOLLOWS_FROM";
  traceId: string;
  spanId: string;
}

export interface TraceService {
  name: string;
  operations: string[];
  numberOfSpans: number;
}

export interface FlameNode {
  name: string;
  value: number;
  children?: FlameNode[];
}

export interface TracesServicesResponse {
  status: string;
  data: string[];
}

export interface TracesOperationsResponse {
  status: string;
  data: string[];
}
