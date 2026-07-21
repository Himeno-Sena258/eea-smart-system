import { request } from "./http"
import type {
  AssignUserRolesPayload,
  ChangePasswordPayload,
  CreateUserPayload,
  ID,
  LoginPayload,
  LoginResult,
  PageResult,
  ResetPasswordPayload,
  Role,
  ImportResult,
  SubmitUserImportPayload,
  UpdateProfilePayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  User,
  UserImportPreviewResult,
  UserPageQuery,
} from "@/models"

const multipartHeaders = {
  "Content-Type": "multipart/form-data",
}

const toImportForm = (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

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

export const logout = async () => {
  const response = await request<string>({
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
  const response = await request<string>({
    url: "/auth/password",
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const updateCurrentUserProfile = async (payload: UpdateProfilePayload) => {
  const response = await request<string>({
    url: "/auth/me",
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const uploadCurrentUserAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await request<string>({
    url: "/auth/me/avatar",
    method: "POST",
    data: formData,
    headers: multipartHeaders,
  })
  return response.data
}

export const deleteCurrentUserAvatar = async () => {
  const response = await request<string>({
    url: "/auth/me/avatar",
    method: "DELETE",
  })
  return response.data
}

export const resetUserPassword = async (id: ID, payload: ResetPasswordPayload) => {
  const response = await request<string>({
    url: `/admin/users/${id}/reset-password`,
    method: "PUT",
    params: payload,
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

export const getUserPage = async (query?: UserPageQuery) => {
  const response = await request<PageResult<User>>({
    url: "/admin/users",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getUserDetail = async (id: ID) => {
  const response = await request<User>({
    url: `/admin/users/${id}`,
    method: "GET",
  })
  return response.data
}

export const createUser = async (payload: CreateUserPayload) => {
  const response = await request<User>({
    url: "/admin/users",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateUser = async (id: ID, payload: UpdateUserPayload) => {
  const response = await request<User>({
    url: `/admin/users/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const updateUserStatus = async (id: ID, payload: UpdateUserStatusPayload) => {
  const response = await request<string>({
    url: `/admin/users/${id}/status`,
    method: "PUT",
    params: payload,
  })
  return response.data
}

export const assignUserRoles = async (id: ID, payload: AssignUserRolesPayload) => {
  const response = await request<boolean>({
    url: `/admin/users/${id}/roles`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteUser = async (id: ID) => {
  const response = await request<boolean>({
    url: `/admin/users/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const previewUserImport = async (file: File) => {
  const response = await request<UserImportPreviewResult>({
    url: "/admin/users/import/preview",
    method: "POST",
    data: toImportForm(file),
    headers: multipartHeaders,
  })
  return response.data
}

export const submitUserImport = async (payload: SubmitUserImportPayload) => {
  const response = await request<ImportResult>({
    url: "/admin/users/import",
    method: "POST",
    data: payload,
  })
  return response.data
}
