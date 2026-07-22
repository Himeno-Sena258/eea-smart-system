export type ID = number
export type DateTimeString = string

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  traceId: string
  timestamp: DateTimeString
}

export interface PageResult<T> {
  records: T[]
  pageNum: number
  pageSize: number
  total: number
  pages: number
  activeCount?: number
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
}

export interface ValidationErrorItem {
  field?: string
  message: string
}

export interface ValidationErrorData {
  errors: ValidationErrorItem[]
}

export interface ImportErrorItem extends ValidationErrorItem {
  rowIndex: number
}

export interface ImportResult {
  totalRows: number
  successRows: number
  failedRows: number
  errors: ImportErrorItem[]
}

export interface DictOption<TValue extends string | number = string> {
  label: string
  value: TValue
  disabled?: boolean
}

export type Nullable<T> = T | null
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }
