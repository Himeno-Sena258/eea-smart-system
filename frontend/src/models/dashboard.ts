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
  unit?: string
  status?: string
}

export interface DashboardTodo {
  id?: string
  type?: string
  title?: string
  label?: string
  targetPath?: string
  priority?: string
  count?: number
  total?: number
  progress?: number
}

export interface DashboardWarning {
  id?: string
  type?: string
  level?: string
  title?: string
  message: string
  targetPath?: string
}
