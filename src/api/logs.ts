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

export interface LogsQueryRequest {
  query: string;
  query_language?: "lucene" | "logsql";
  search_engine?: "lucene" | "bleve";
  start?: number;
  end?: number;
  limit?: number;
  tenantId?: string;
}

export interface LogsSearchRequest {
  query: string;
  query_language?: "lucene" | "logsql";
  search_engine?: "lucene" | "bleve";
  start?: number;
  end?: number;
  limit?: number;
  page_after?: {
    ts: number;
    offset: number;
  };
  tenantId?: string;
}

export interface LogsHistogramRequest {
  query_language?: "lucene" | "logsql";
  query?: string;
  step?: number;
}

export interface LogsFacetsRequest {
  query_language?: "lucene" | "logsql";
  query?: string;
  fields?: string;
}

export class LogsAPI {
  /**
   * Query logs
   */
  static async query(params: LogsQueryRequest) {
    return apiClient.post("/logs/query", params);
  }

  /**
   * Search logs with pagination
   */
  static async search(params: LogsSearchRequest) {
    return apiClient.post("/logs/search", params);
  }

  /**
   * Get logs histogram for visualization
   */
  static async getHistogram(params: LogsHistogramRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.query_language) queryParams.query_language = params.query_language;
    if (params.query) queryParams.query = params.query;
    if (params.step) queryParams.step = params.step;

    return apiClient.get("/logs/histogram", queryParams);
  }

  /**
   * Get log facets for visualization
   */
  static async getFacets(params: LogsFacetsRequest = {}) {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.query_language) queryParams.query_language = params.query_language;
    if (params.query) queryParams.query = params.query;
    if (params.fields) queryParams.fields = params.fields;

    return apiClient.get("/logs/facets", queryParams);
  }

  /**
   * Get log fields
   */
  static async getFields() {
    return apiClient.get("/logs/fields");
  }

  /**
   * Get log streams
   */
  static async getStreams() {
    return apiClient.get("/logs/streams");
  }
}
