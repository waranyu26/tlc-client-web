import type { AxiosError, AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// Backend response envelope: { code, message, data }. Success => code "100000".
// The response interceptor unwraps `data` so callers receive the payload directly,
// and throws an `ApiError` (carrying `code`) on any non-success envelope.
// ----------------------------------------------------------------------

export const API_SUCCESS_CODE = '100000';

export type ApiEnvelope<T = unknown> = {
  code: string;
  message: string;
  data: T;
};

export class ApiError extends Error {
  code: string;

  status?: number;

  data?: unknown;

  constructor(message: string, code: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  // SuperTokens uses header-based token transfer; credentials kept on for cookie fallback.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope | undefined;

    // Non-enveloped responses (e.g. SSE, raw) pass through untouched.
    if (!body || typeof body !== 'object' || !('code' in body)) {
      return response;
    }

    if (body.code !== API_SUCCESS_CODE) {
      throw new ApiError(body.message || 'Request failed', body.code, response.status, body.data);
    }

    // Unwrap: callers get the inner payload as `response.data`.
    response.data = body.data;
    return response;
  },
  (error: AxiosError<ApiEnvelope>) => {
    const body = error.response?.data;
    const message = body?.message || error.message || 'Something went wrong!';
    const code = body?.code || 'NETWORK_ERROR';
    return Promise.reject(new ApiError(message, code, error.response?.status, body?.data));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

/** Thin GET helper returning the unwrapped payload. */
export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  const [url, config] = Array.isArray(args) ? args : [args, {}];
  const res = await axiosInstance.get<T>(url, config);
  return res.data;
};
