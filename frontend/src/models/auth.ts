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
  status: UserStatus
  orgId?: Nullable<ID>
  orgName?: Nullable<string>
  roles?: Role[]
  permissions?: string[]
  createdAt?: DateTimeString
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  user: User
}

export interface RegisterPayload {
  username: string
  password: string
  confirmPassword: string
  realName: string
  email?: string
  phone?: string
  roleCode: RoleCode
  orgId?: ID
  studentNo?: string
  classId?: ID
}

export interface RegisterResult {
  id: ID
  username: string
  realName: string
  roleCode: RoleCode | string
  status: UserStatus
  createdAt: DateTimeString
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordPayload {
  newPassword: string
}

export interface AssignUserRolesPayload {
  roleIds: ID[]
}

export interface UpdateUserStatusPayload {
  status: UserStatus
}

export type CreateUserPayload = Omit<RegisterPayload, "confirmPassword">
export type UpdateUserPayload = Partial<
  Pick<User, "realName" | "email" | "phone" | "status" | "orgId">
>
