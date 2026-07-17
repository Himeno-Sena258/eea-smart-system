import type { DateTimeString, ID, Nullable } from "./common"

export type RoleCode =
  | "ADMIN"
  | "DIRECTOR"
  | "COORDINATOR"
  | "INSTRUCTOR"
  | "STUDENT"

export type UserStatus = 0 | 1

export interface Role {
  id?: ID
  roleName: string
  roleCode: RoleCode | string
  description?: string
}

export interface User {
  id: ID
  username: string
  realName: string
  email?: string
  phone?: string
  status?: UserStatus
  orgId?: Nullable<ID>
  orgName?: Nullable<string>
  roleCodes?: Array<RoleCode | string>
  roleNames?: string[]
  roles?: Role[]
  permissions?: string[]
  studentNo?: string
  classId?: ID
  className?: string
  createdAt?: DateTimeString
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  userId: ID
  username: string
  realName: string
  roles: Array<RoleCode | string>
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordPayload {
  newPassword?: string
}

export interface AssignUserRolesPayload {
  roleCodes: Array<RoleCode | string>
}

export interface UpdateUserStatusPayload {
  status: UserStatus
}

export interface UserPageQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  roleCode?: RoleCode | string
  orgId?: ID
}

export interface CreateUserPayload {
  username: string
  password?: string
  realName: string
  email?: string
  phone?: string
  orgId?: ID
  roleCodes: Array<RoleCode | string>
  studentNo?: string
  classId?: ID
}

export type UpdateUserPayload = Partial<
  Pick<User, "realName" | "email" | "phone" | "status" | "orgId" | "roleCodes" | "studentNo" | "classId">
>
