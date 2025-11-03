/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineStore } from "pinia";
import type { Instance, Endpoint, Service } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import { LogsAPI } from "@/api/logs";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useDuration } from "@/hooks/useDuration";
import { EndpointsTopNDefault } from "../data";

interface LogState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  conditions: Recordable;
  selectorStore: Recordable;
  supportQueryLogsByKeywords: boolean;
  logs: Recordable[];
  loadLogs: boolean;
  logHeaderType: string;
}
const { getDurationTime } = useDuration();

export const logStore = defineStore({
  id: "log",
  state: (): LogState => ({
    services: [{ value: "0", label: "All" }],
    instances: [{ value: "0", label: "All" }],
    endpoints: [{ value: "0", label: "All" }],
    conditions: {
      queryDuration: getDurationTime(),
      paging: { pageNum: 1, pageSize: 15 },
    },
    supportQueryLogsByKeywords: true,
    selectorStore: useSelectorStore(),
    logs: [],
    loadLogs: false,
    logHeaderType: localStorage.getItem("log-header-type") || "content",
  }),
  actions: {
    setLogCondition(data: Recordable) {
      this.conditions = { ...this.conditions, ...data };
    },
    resetState() {
      this.logs = [];
      this.conditions = {
        queryDuration: getDurationTime(),
        paging: { pageNum: 1, pageSize: 15 },
      };
    },
    setLogHeaderType(type: string) {
      this.logHeaderType = type;
    },
    async getServices(layer: string) {
      const response = await graphql.query("queryServices").params({
        layer,
      });
      if (response.errors) {
        return response;
      }
      this.services = response.data.services;
      return response;
    },
    async getInstances(id: string) {
      const serviceId = this.selectorStore.currentService?.id || id;
      if (!serviceId) {
        return new Promise((resolve) => resolve({ errors: "Service ID is required" }));
      }
      const response = await graphql.query("queryInstances").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (response.errors) {
        return response;
      }
      this.instances = [{ value: "0", label: "All" }, ...response.data.pods];
      return response;
    },
    async getEndpoints(id: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService?.id || id;
      if (!serviceId) {
        return new Promise((resolve) => resolve({ errors: "Service ID is required" }));
      }
      const response = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: useAppStoreWithOut().durationTime,
        keyword: keyword || "",
        limit: EndpointsTopNDefault,
      });
      if (response.errors) {
        return response;
      }
      this.endpoints = [{ value: "0", label: "All" }, ...response.data.pods];
      return response;
    },
    async getLogsByKeywords() {
      const response = await graphql.query("queryLogsByKeywords").params({});

      if (response.errors) {
        return response;
      }

      this.supportQueryLogsByKeywords = response.data.support;
      return response;
    },
    async getLogs() {
      const dashboardStore = useDashboardStore();
      if (dashboardStore.layerId === "BROWSER") {
        return this.getBrowserLogs();
      }
      return this.getServiceLogs();
    },
    async getServiceLogs() {
      this.loadLogs = true;
      try {
        const duration = this.conditions.queryDuration;
        const paging = this.conditions.paging || { pageNum: 1, pageSize: 15 };

        // Build query based on current service/instance selection
        const selectorStore = useSelectorStore();
        let query = "_time:5m"; // Default time range

        if (selectorStore.currentService && selectorStore.currentService.value !== "0") {
          query += ` AND serviceName:"${selectorStore.currentService.value}"`;
        }

        if (selectorStore.currentPod && selectorStore.currentPod.value !== "0") {
          query += ` AND serviceInstanceName:"${selectorStore.currentPod.value}"`;
        }

        const response = (await LogsAPI.search({
          query,
          query_language: "lucene",
          start: duration.start ? Math.floor(new Date(duration.start).getTime()) : undefined,
          end: duration.end ? Math.floor(new Date(duration.end).getTime()) : undefined,
          limit: paging.pageSize,
        })) as any;

        this.logs = response.data?.logs || [];
        return { data: { queryLogs: { logs: this.logs } } };
      } catch (error) {
        return { errors: error instanceof Error ? error.message : "Failed to fetch logs" };
      } finally {
        this.loadLogs = false;
      }
    },
    async getBrowserLogs() {
      this.loadLogs = true;
      const response = await graphql.query("queryBrowserErrorLogs").params({ condition: this.conditions });

      this.loadLogs = false;
      if (response.errors) {
        return response;
      }
      this.logs = response.data.queryBrowserErrorLogs.logs;
      return response;
    },
    async getLogTagKeys() {
      try {
        const response = (await LogsAPI.getFields()) as any;
        return { data: { tagKeys: response.data?.fields || [] } };
      } catch (error) {
        return { errors: error instanceof Error ? error.message : "Failed to fetch log fields" };
      }
    },
    async getLogTagValues(tagKey: string) {
      try {
        // For now, return empty array as the REST API doesn't have a direct equivalent
        // This could be implemented by querying logs and extracting unique values for the tag
        return { data: { tagValues: [] } };
      } catch (error) {
        return { errors: error instanceof Error ? error.message : "Failed to fetch tag values" };
      }
    },
  },
});

export function useLogStore(): Recordable {
  return logStore(store);
}
