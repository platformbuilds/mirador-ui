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

import { apiClient } from "./base";

export interface MetricsQueryRequest {
  query: string;
  time?: string;
  include_definitions?: boolean;
  label_keys?: string[];
}

export interface MetricsQueryRangeRequest {
  query: string;
  start: string;
  end: string;
  step: string;
  include_definitions?: boolean;
  label_keys?: string[];
}

export interface MetricsLabelsRequest {
  metric: string;
  start?: string;
  end?: string;
}

export interface MetricsSeriesRequest {
  match?: string[];
  start?: string;
  end?: string;
}

export interface MetricsNamesRequest {
  start?: string;
  end?: string;
  match?: string[];
}

export class MetricsAPI {
  /**
   * Execute an instant MetricsQL query
   */
  static async queryInstant(params: MetricsQueryRequest) {
    return apiClient.post("/metrics/query", params);
  }

  /**
   * Execute a range MetricsQL query
   */
  static async queryRange(params: MetricsQueryRangeRequest) {
    return apiClient.post("/metrics/query_range", params);
  }

  /**
   * Get labels for a specific metric
   */
  static async getLabels(params: MetricsLabelsRequest) {
    return apiClient.post("/metrics/labels", params);
  }

  /**
   * Get time series matching the specified selectors
   */
  static async getSeries(params: MetricsSeriesRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.start) queryParams.start = params.start;
    if (params.end) queryParams.end = params.end;
    if (params.match) {
      params.match.forEach((match, index) => {
        queryParams[`match[${index}]`] = match;
      });
    }
    return apiClient.get("/metrics/series", queryParams);
  }

  /**
   * Get metric names
   */
  static async getNames(params: MetricsNamesRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.start) queryParams.start = params.start;
    if (params.end) queryParams.end = params.end;
    if (params.match) {
      params.match.forEach((match, index) => {
        queryParams[`match[${index}]`] = match;
      });
    }
    return apiClient.get("/metrics/names", queryParams);
  }

  /**
   * Get label values for a specific label
   */
  static async getLabelValues(labelName: string) {
    return apiClient.get(`/label/${labelName}/values`);
  }
}
