import type { RoleCode } from "./auth"
import type { ID } from "./common"

export interface RoleDashboard {
  title: string
  userId?: ID
  roles?: Array<RoleCode | string>
  notice?: string
}
