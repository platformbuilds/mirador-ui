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
const PREFIX = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? "/api" : "";
export const HttpURL = {
  ClusterNodes: `${PREFIX}/status/cluster/nodes`,
  ConfigTTL: `${PREFIX}/status/config/ttl`,
  DebuggingConfigDump: `${PREFIX}/debugging/config/dump`,
  // RCA (Root Cause Analysis) APIs - REST endpoints
  RCAInvestigate: `${PREFIX}/v1/rca/investigate`,
  RCACorrelations: `${PREFIX}/v1/rca/correlations`,
  RCAServiceGraph: `${PREFIX}/v1/rca/service-graph`,
  // Unified Query APIs - REST endpoints for correlation
  UnifiedQuery: `${PREFIX}/v1/unified/query`,
  UnifiedCorrelation: `${PREFIX}/v1/unified/correlation`,
  UnifiedMetadata: `${PREFIX}/v1/unified/metadata`,
  UnifiedHealth: `${PREFIX}/v1/unified/health`,
  // TTL and configuration APIs
  MetricsTTL: `${PREFIX}/status/config/ttl/metrics`,
  RecordsTTL: `${PREFIX}/status/config/ttl/records`,
  // Template/Dashboard APIs
  Templates: `${PREFIX}/v1/templates`,
  // Trace support check
  TraceSupport: `${PREFIX}/status/capabilities/trace`,
};
