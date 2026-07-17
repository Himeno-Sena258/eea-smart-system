import type { DateTimeString, ID, PageQuery } from "./common"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | string

export interface AuditLog {
  id: ID
  userId: ID
  username: string
  action: AuditAction
  target: string
  targetId?: ID
  detail?: string
  ipAddress?: string
  createdAt: DateTimeString
}

export interface AuditLogQuery extends PageQuery {
  userId?: ID
  username?: string
  action?: AuditAction
  target?: string
  targetId?: ID
  startTime?: DateTimeString
  endTime?: DateTimeString
}

export const BusinessCode = {
  Success: 0,
  SystemError: 10000,
  Unauthorized: 20001,
  LoginExpired: 20002,
  Forbidden: 20004,
  ValidationFailed: 30001,
  FileTooLarge: 60002,
  ExcelImportPartialFailed: 60008,
} as const

export type BusinessCode = (typeof BusinessCode)[keyof typeof BusinessCode]
