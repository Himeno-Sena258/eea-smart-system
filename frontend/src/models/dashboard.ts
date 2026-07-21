import type { RoleCode } from "./auth"
import type { ID } from "./common"

export interface RoleDashboard {
  title: string
  userId?: ID
  roles?: Array<RoleCode | string>
  notice?: string
  generatedAt?: string
  stats?: DashboardStat[]
  todos?: DashboardTodo[]
  warnings?: DashboardWarning[]
}

export interface DashboardStat {
  key: string
  label: string
  value: string | number
}

export interface DashboardTodo {
  type: string
  label: string
  count?: number
  total?: number
  progress?: number
}

export interface DashboardWarning {
  type: string
  level?: string
  message: string
}
