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

const Timeout = 2 * 60 * 1000;
export let globalAbortController = new AbortController();

export function abortRequestsAndUpdate() {
  globalAbortController.abort(`Request timeout ${Timeout}ms`);
  globalAbortController = new AbortController();
}

class HTTPError extends Error {
  response: Response;

  constructor(response: Response, detailText = "") {
    super(detailText || response.statusText);
    this.name = "HTTPError";
    this.response = response;
  }
}

export const BasePath = `/api/v1`;

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export async function httpRequest<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, params } = options;

  // Build URL with query parameters
  let url = `${BasePath}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const timeoutId = setTimeout(() => {
    abortRequestsAndUpdate();
  }, Timeout);

  try {
    const response: Response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: globalAbortController.signal,
    });

    if (response.ok) {
      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text() as unknown as T;
      }
    } else {
      const errorText = await response.text().catch(() => response.statusText);
      throw new HTTPError(response, errorText);
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      throw error;
    }
    throw new HTTPError(new Response(null, { status: 0 }), error instanceof Error ? error.message : "Network error");
  } finally {
    clearTimeout(timeoutId);
  }
}

// Convenience methods for common HTTP methods
export const apiClient = {
  get: <T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>,
  ) => httpRequest<T>(endpoint, { method: "GET", params, headers }),

  post: <T = unknown>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    httpRequest<T>(endpoint, { method: "POST", body, headers }),

  put: <T = unknown>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    httpRequest<T>(endpoint, { method: "PUT", body, headers }),

  delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
    httpRequest<T>(endpoint, { method: "DELETE", headers }),
};
