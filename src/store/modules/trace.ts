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
import type { Trace, Span, TraceCondition } from "@/types/trace";
import { store } from "@/store";
import graphql from "@/graphql";
import fetchQuery from "@/graphql/http";
import { TracesAPI } from "@/api/traces";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { QueryOrders } from "@/views/dashboard/data";
import { EndpointsTopNDefault } from "../data";
import { useDuration } from "@/hooks/useDuration";
import { LogItem } from "@/types/log";
interface TraceState {
  services: Service[];
  instances: Instance[];
  endpoints: Endpoint[];
  traceList: Trace[];
  traceSpans: Span[];
  currentTrace: Nullable<Trace>;
  conditions: TraceCondition;
  traceSpanLogs: LogItem[];
  selectorStore: ReturnType<typeof useSelectorStore>;
  selectedSpan: Nullable<Span>;
  serviceList: string[];
  currentSpan: Nullable<Span>;
  hasQueryTracesV2Support: boolean;
  v2Traces: Trace[];
  loading: boolean;
}
const { getDurationTime } = useDuration();

export const PageSize = 20;

export const traceStore = defineStore({
  id: "trace",
  state: (): TraceState => ({
    services: [{ value: "0", label: "All", id: "" }],
    instances: [{ value: "0", label: "All", id: "" }],
    endpoints: [{ value: "0", label: "All", id: "" }],
    traceList: [],
    traceSpans: [],
    currentTrace: null,
    selectedSpan: null,
    conditions: {
      queryDuration: getDurationTime(),
      traceState: "ALL",
      queryOrder: QueryOrders[0].value,
      paging: { pageNum: 1, pageSize: PageSize },
    },
    traceSpanLogs: [],
    selectorStore: useSelectorStore(),
    serviceList: [],
    currentSpan: null,
    hasQueryTracesV2Support: false,
    v2Traces: [],
    loading: false,
  }),
  actions: {
    setTraceCondition(data: Recordable) {
      this.conditions = { ...this.conditions, ...data };
    },
    setCurrentTrace(trace: Nullable<Trace>) {
      this.currentTrace = trace || {};
    },
    setTraceSpans(spans: Span[]) {
      this.traceSpans = spans;
    },
    setSelectedSpan(span: Nullable<Span>) {
      this.selectedSpan = span || {};
    },
    setCurrentSpan(span: Nullable<Span>) {
      this.currentSpan = span || {};
    },
    setV2Spans(traceId: string) {
      const trace = this.traceList.find((d: Trace) => d.traceId === traceId);
      this.setTraceSpans(trace?.spans || []);
      this.serviceList = Array.from(new Set(trace?.spans.map((i: Span) => i.serviceCode)));
    },
    setTraceList(traces: Trace[]) {
      this.traceList = traces;
    },
    resetState() {
      this.traceSpans = [];
      this.traceList = [];
      this.currentTrace = {};
      this.conditions = {
        queryDuration: getDurationTime(),
        paging: { pageNum: 1, pageSize: 20 },
        traceState: "ALL",
        queryOrder: QueryOrders[0].value,
      };
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
    async getService(serviceId: string) {
      if (!serviceId) {
        return;
      }
      const response = await graphql.query("queryService").params({
        serviceId,
      });

      return response;
    },
    async getInstance(instanceId: string) {
      if (!instanceId) {
        return;
      }
      const response = await graphql.query("queryInstance").params({
        instanceId,
      });

      return response;
    },
    async getEndpoint(endpointId: string) {
      if (!endpointId) {
        return;
      }
      return await graphql.query("queryEndpoint").params({
        endpointId,
      });
    },
    async getInstances(id?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
      if (!serviceId) {
        return new Promise((resolve) => resolve({ errors: "Service ID is required" }));
      }
      const response = await graphql.query("queryInstances").params({
        serviceId: serviceId,
        duration: useAppStoreWithOut().durationTime,
      });

      if (response.errors) {
        return response;
      }
      this.instances = [{ value: "0", label: "All" }, ...response.data.pods];
      return response;
    },
    async getEndpoints(id?: string, keyword?: string) {
      const serviceId = this.selectorStore.currentService ? this.selectorStore.currentService.id : id;
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
    async getTraces() {
      if (this.hasQueryTracesV2Support) {
        return this.fetchV2Traces();
      }
      this.loading = true;

      // Map conditions to TracesAPI parameters
      const params: any = {
        limit: this.conditions.paging?.pageSize || PageSize,
        offset: ((this.conditions.paging?.pageNum || 1) - 1) * (this.conditions.paging?.pageSize || PageSize),
      };

      // Add duration range if available
      if (this.conditions.queryDuration) {
        params.startTime = this.conditions.queryDuration.start;
        params.endTime = this.conditions.queryDuration.end;
      }

      // Add service filter if selected
      if (this.selectorStore.currentService?.id && this.selectorStore.currentService.id !== "0") {
        params.serviceName = this.selectorStore.currentService.label;
      }

      // Add trace state filter (error traces)
      if (this.conditions.traceState === "ERROR") {
        params.tags = { error: "true" };
      }

      try {
        const response = (await TracesAPI.search(params)) as { status: string; data: any[]; metadata?: any };

        if (!response.data || response.data.length === 0) {
          this.traceList = [];
          this.setCurrentTrace(null);
          this.setTraceSpans([]);
          this.loading = false;
          return { data: { data: { traces: [] } } };
        }

        // Transform response to match expected GraphQL format
        const traces = response.data.map((trace: any) => ({
          traceIds: [{ value: trace.traceId, label: trace.traceId }],
          start: trace.startTime,
          duration: trace.duration,
          isError: trace.error,
          spans: [], // Will be populated when getting trace details
          traceId: trace.traceId,
          key: trace.traceId,
          serviceCode: trace.rootService,
          endpointNames: [trace.rootOperation],
          label: `${trace.rootService}: ${trace.rootOperation}`,
        }));

        this.traceList = traces;
        this.setCurrentTrace(traces[0] || null);

        // Get spans for the first trace
        if (traces[0]?.traceId) {
          this.getTraceSpans({ traceId: traces[0].traceId });
        }

        this.loading = false;
        return { data: { data: { traces } } };
      } catch (error) {
        this.loading = false;
        return { errors: error };
      }
    },
    async getTraceSpans(params: { traceId: string }) {
      if (this.hasQueryTracesV2Support) {
        this.setV2Spans(params.traceId);
        return new Promise((resolve) => resolve({}));
      }
      const appStore = useAppStoreWithOut();
      this.loading = true;

      try {
        const response = (await TracesAPI.getById(params.traceId)) as { status: string; data: any };

        if (response.status !== "success" || !response.data) {
          this.loading = false;
          return { errors: "Failed to fetch trace spans" };
        }

        const traceData = response.data;
        const spans = traceData.spans || [];

        // Transform spans to match expected format
        const transformedSpans = spans.map((span: any) => ({
          ...span,
          serviceCode: span.serviceName,
          endpointName: span.operationName,
          startTime: span.startTime,
          endTime: span.endTime,
          isError: span.error,
          tags: span.tags || {},
          logs: span.logs || [],
          refs: span.references || [],
        }));

        this.serviceList = Array.from(new Set(transformedSpans.map((i: any) => i.serviceCode)));
        this.setTraceSpans(transformedSpans);
        this.loading = false;

        return { data: { trace: { spans: transformedSpans } } };
      } catch (error) {
        this.loading = false;
        return { errors: error };
      }
    },
    async getSpanLogs(params: Recordable) {
      const response = await graphql.query("queryServiceLogs").params(params);
      if (response.errors) {
        this.traceSpanLogs = [];
        return response;
      }
      this.traceSpanLogs = response.data.queryLogs.logs || [];
      return response;
    },
    async getTagKeys() {
      // TODO: Implement tag keys retrieval via REST API
      // For now, return empty result as traces API may not support this directly
      return { data: { traceTagKeys: [] } };
    },
    async getTagValues(tagKey: string) {
      // TODO: Implement tag values retrieval via REST API
      // For now, return empty result as traces API may not support this directly
      return { data: { traceTagValues: [] } };
    },
    async getHasQueryTracesV2Support() {
      const response = await fetchQuery({
        method: "get",
        path: "TraceSupport",
      });
      this.hasQueryTracesV2Support = response?.hasQueryTracesV2Support || false;
      return response;
    },
    async fetchV2Traces() {
      this.loading = true;
      const response = await graphql.query("queryV2Traces").params({ condition: this.conditions });
      this.loading = false;
      if (response.errors) {
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return response;
      }
      this.v2Traces = response.data.queryTraces.traces || [];
      this.traceList = this.v2Traces
        .map((d: Trace) => {
          const newSpans = d.spans.map((span: Span) => {
            return {
              ...span,
              traceId: span.traceId,
              duration: span.endTime - span.startTime,
              label: `${span.serviceCode}: ${span.endpointName}`,
            };
          });
          const trace =
            newSpans.find((span: Span) => span.parentSpanId === -1 && span.refs.length === 0) || newSpans[0];
          return {
            endpointNames: trace.endpointName ? [trace.endpointName] : [],
            traceIds: trace.traceId ? [{ value: trace.traceId, label: trace.traceId }] : [],
            start: trace.startTime,
            duration: trace.endTime - trace.startTime,
            isError: trace.isError,
            spans: newSpans,
            traceId: trace.traceId,
            key: trace.traceId,
            serviceCode: trace.serviceCode,
            label: `${trace.serviceCode}: ${trace.endpointName}`,
          };
        })
        .sort((a: Trace, b: Trace) => b.duration - a.duration);
      const trace = this.traceList[0];
      if (!trace) {
        this.traceList = [];
        this.setCurrentTrace({});
        this.setTraceSpans([]);
        return response;
      }

      this.serviceList = Array.from(new Set(trace.spans.map((i: Span) => i.serviceCode)));
      this.setTraceSpans(trace.spans);
      this.setCurrentTrace(trace || {});
      return response;
    },
  },
});

export function useTraceStore() {
  return traceStore(store);
}
