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

import { MetricsAPI } from "@/api/metrics";
import type { MetricsRangeQueryResponse } from "@/types/api";

// Simple regex to extract execExpression calls from GraphQL query
const execExpressionRegex =
  /([a-zA-Z_][a-zA-Z0-9_]*):\s*execExpression\(expression:\s*\$([a-zA-Z_][a-zA-Z0-9_]*),\s*entity:\s*\$([a-zA-Z_][a-zA-Z0-9_]*),\s*duration:\s*\$duration\)/g;

async function customQuery(param: { queryStr: string; conditions: { [key: string]: unknown } }) {
  const { queryStr, conditions } = param;

  // Extract duration from conditions
  const duration = conditions.duration as { start: string; end: string; step: string };

  // Find all execExpression calls
  const expressions: Array<{
    fieldName: string;
    expressionVar: string;
    entityVar: string;
  }> = [];

  let match;
  while ((match = execExpressionRegex.exec(queryStr)) !== null) {
    expressions.push({
      fieldName: match[1],
      expressionVar: match[2],
      entityVar: match[3],
    });
  }

  if (expressions.length === 0) {
    return { errors: "No execExpression calls found in query", data: {} };
  }

  try {
    // For now, handle only the first expression (simplified implementation)
    const expr = expressions[0];
    const expression = conditions[expr.expressionVar] as string;

    if (!expression) {
      return { errors: `Expression variable ${expr.expressionVar} not found in conditions`, data: {} };
    }

    // Call the REST API
    const response = (await MetricsAPI.queryRange({
      query: expression,
      start: duration.start,
      end: duration.end,
      step: duration.step,
    })) as MetricsRangeQueryResponse;

    if (response.status !== "success") {
      return { errors: "Metrics query failed", data: {} };
    }

    // Transform REST response to GraphQL-like response
    const data: Record<string, any> = {};

    for (const expr of expressions) {
      const expression = conditions[expr.expressionVar] as string;
      if (expression) {
        // Find matching result in the response
        const result =
          response.data.result.find((r: any) => r.metric && Object.keys(r.metric).length > 0) ||
          response.data.result[0];

        if (result) {
          data[expr.fieldName] = {
            type: response.data.resultType === "matrix" ? "TIME_SERIES_VALUES" : "SINGLE_VALUE",
            results: [
              {
                metric: result.metric
                  ? {
                      labels: Object.entries(result.metric).map(([key, value]) => ({
                        key,
                        value: String(value),
                      })),
                    }
                  : undefined,
                values:
                  (result as any).values?.map(([timestamp, value]: [any, any]) => ({
                    value: parseFloat(String(value)),
                    id: String(timestamp),
                  })) ||
                  ((result as any).value
                    ? [
                        {
                          value: parseFloat(String((result as any).value[1])),
                          id: String((result as any).value[0]),
                        },
                      ]
                    : []),
              },
            ],
            error: undefined,
          };
        }
      }
    }

    return { data };
  } catch (error) {
    console.error("Metrics query error:", error);
    return { errors: error instanceof Error ? error.message : "Unknown error", data: {} };
  }
}

export default customQuery;
