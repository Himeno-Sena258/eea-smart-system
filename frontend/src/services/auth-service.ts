import { request } from "./http"
import type {
  AssignUserRolesPayload,
  ChangePasswordPayload,
  CreateUserPayload,
  ID,
  LoginPayload,
  LoginResult,
  PageQuery,
  PageResult,
  RegisterPayload,
  RegisterResult,
  ResetPasswordPayload,
  Role,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  User,
} from "@/models"

export interface RolePayload {
  roleName: string
  roleCode: string
  description?: string
}

export const login = async (payload: LoginPayload) => {
  const response = await request<LoginResult>({
    url: "/auth/login",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const register = async (payload: RegisterPayload) => {
  const response = await request<RegisterResult>({
    url: "/auth/register",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const logout = async () => {
  const response = await request<boolean>({
    url: "/auth/logout",
    method: "POST",
  })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await request<User>({
    url: "/auth/me",
    method: "GET",
  })
  return response.data
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await request<boolean>({
    url: "/auth/password",
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const resetUserPassword = async (id: ID, payload: ResetPasswordPayload) => {
  const response = await request<boolean>({
    url: `/users/${id}/password/reset`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const getRoleList = async () => {
  const response = await request<Role[]>({
    url: "/roles",
    method: "GET",
  })
  return response.data
}

export const getRoleDetail = async (id: ID) => {
  const response = await request<Role>({
    url: `/roles/${id}`,
    method: "GET",
  })
  return response.data
}

export const createRole = async (payload: RolePayload) => {
  const response = await request<Role>({
    url: "/roles",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateRole = async (id: ID, payload: RolePayload) => {
  const response = await request<Role>({
    url: `/roles/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteRole = async (id: ID) => {
  const response = await request<boolean>({
    url: `/roles/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getUserPage = async (query?: PageQuery) => {
  const response = await request<PageResult<User>>({
    url: "/users",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getUserDetail = async (id: ID) => {
  const response = await request<User>({
    url: `/users/${id}`,
    method: "GET",
  })
  return response.data
}

export const createUser = async (payload: CreateUserPayload) => {
  const response = await request<User>({
    url: "/users",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateUser = async (id: ID, payload: UpdateUserPayload) => {
  const response = await request<User>({
    url: `/users/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const updateUserStatus = async (id: ID, payload: UpdateUserStatusPayload) => {
  const response = await request<User>({
    url: `/users/${id}/status`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const assignUserRoles = async (id: ID, payload: AssignUserRolesPayload) => {
  const response = await request<boolean>({
    url: `/users/${id}/roles`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteUser = async (id: ID) => {
  const response = await request<boolean>({
    url: `/users/${id}`,
    method: "DELETE",
  })
  return response.data
}
