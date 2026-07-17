import axios, { type AxiosRequestConfig } from "axios"
import type { ApiResponse } from "@/models"

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1"

export class ApiError<T = unknown> extends Error {
  code: number
  data?: T
  traceId?: string

  constructor(response: ApiResponse<T>) {
    super(response.message)
    this.name = "ApiError"
    this.code = response.code
    this.data = response.data
    this.traceId = response.traceId
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function request<T>(config: AxiosRequestConfig) {
  const response = await http.request<ApiResponse<T>>(config)
  const body = response.data

  if (body.code !== 0) {
    throw new ApiError(body)
  }

  return body
}

export function get<T>(url: string, params?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "GET", url, params }).then((response) => response.data)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "POST", url, data }).then((response) => response.data)
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "PUT", url, data }).then((response) => response.data)
}

export function del<T = boolean>(url: string, params?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "DELETE", url, params }).then((response) => response.data)
}

export function upload<T>(url: string, data: FormData, config?: AxiosRequestConfig) {
  return request<T>({
    ...config,
    method: "POST",
    url,
    data,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data",
    },
  }).then((response) => response.data)
}

export async function download(url: string, params?: unknown, config?: AxiosRequestConfig) {
  const response = await http.request<Blob>({
    ...config,
    method: "GET",
    url,
    params,
    responseType: "blob",
  })

  return response.data
}
