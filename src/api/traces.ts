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

export interface TracesSearchRequest {
  query?: string;
  query_language?: "lucene";
  search_engine?: "lucene" | "bleve";
  service?: string;
  operation?: string;
  tags?: string;
  minDuration?: string;
  maxDuration?: string;
  start?: string;
  end?: string;
  limit?: number;
}

export interface TracesFlamegraphRequest {
  mode?: "duration" | "self";
}

export class TracesAPI {
  /**
   * Search traces
   */
  static async search(params: TracesSearchRequest = {}) {
    return apiClient.post("/traces/search", params);
  }

  /**
   * Get trace by ID
   */
  static async getById(traceId: string) {
    return apiClient.get(`/traces/${traceId}`);
  }

  /**
   * Get services list
   */
  static async getServices() {
    return apiClient.get("/traces/services");
  }

  /**
   * Get operations for a service
   */
  static async getOperations(service: string) {
    return apiClient.get(`/traces/services/${service}/operations`);
  }

  /**
   * Get flame graph for a trace
   */
  static async getFlamegraph(traceId: string, params: TracesFlamegraphRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.mode) queryParams.mode = params.mode;
    return apiClient.get(`/traces/${traceId}/flamegraph`, queryParams);
  }

  /**
   * Get aggregate flame graph from traces search
   */
  static async getAggregateFlamegraph(params: TracesFlamegraphRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.mode) queryParams.mode = params.mode;

    let url = "/traces/flamegraph/search";
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    return apiClient.post(url, {});
  }
}
