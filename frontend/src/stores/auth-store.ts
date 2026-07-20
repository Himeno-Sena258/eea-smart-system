import { create } from "zustand"
import type {
  AssignUserRolesPayload,
  ChangePasswordPayload,
  CreateUserPayload,
  ID,
  ImportResult,
  LoginPayload,
  PageResult,
  ResetPasswordPayload,
  Role,
  SubmitUserImportPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  User,
  UserImportPreviewResult,
  UserPageQuery,
} from "@/models"
import {
  assignUserRoles,
  changePassword,
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  getCurrentUser,
  getRoleDetail,
  getRoleList,
  getUserDetail,
  getUserPage,
  login,
  logout,
  previewUserImport,
  resetUserPassword,
  submitUserImport,
  updateRole,
  updateUser,
  updateUserStatus,
  type RolePayload,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

const CURRENT_USER_STORAGE_KEY = "eea-current-user"

const readStoredCurrentUser = () => {
  if (typeof window === "undefined") return null

  const storedValue = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY)
  if (!storedValue) return null

  try {
    return JSON.parse(storedValue) as User
  } catch {
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return null
  }
}

const writeStoredCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
    return
  }

  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
}

interface AuthStore extends RequestState, RequestActions {
  currentUser: User | null
  roles: Role[]
  currentRole: Role | null
  usersPage: PageResult<User> | null
  currentUserDetail: User | null
  userImportPreview: UserImportPreviewResult | null
  userImportResult: ImportResult | null
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<string>
  fetchCurrentUser: () => Promise<User>
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>
  resetUserPassword: (id: ID, payload: ResetPasswordPayload) => Promise<string>
  fetchRoles: () => Promise<Role[]>
  fetchRoleDetail: (id: ID) => Promise<Role>
  createRole: (payload: RolePayload) => Promise<Role>
  updateRole: (id: ID, payload: RolePayload) => Promise<Role>
  deleteRole: (id: ID) => Promise<boolean>
  fetchUsers: (query?: UserPageQuery) => Promise<PageResult<User>>
  fetchUserDetail: (id: ID) => Promise<User>
  createUser: (payload: CreateUserPayload) => Promise<User>
  updateUser: (id: ID, payload: UpdateUserPayload) => Promise<User>
  updateUserStatus: (id: ID, payload: UpdateUserStatusPayload) => Promise<string>
  assignUserRoles: (id: ID, payload: AssignUserRolesPayload) => Promise<boolean>
  deleteUser: (id: ID) => Promise<boolean>
  previewUserImport: (file: File) => Promise<UserImportPreviewResult>
  submitUserImport: (payload: SubmitUserImportPayload) => Promise<ImportResult>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...createInitialRequestState(),
  currentUser: readStoredCurrentUser(),
  roles: [],
  currentRole: null,
  usersPage: null,
  currentUserDetail: null,
  userImportPreview: null,
  userImportResult: null,
  clearError: () => set({ error: null }),
  login: (payload) =>
    runRequest(set, async () => {
      const result = await login(payload)
      const currentUser = {
        id: result.userId,
        username: result.username,
        realName: result.realName,
        roleCodes: result.roles,
      } satisfies User
      writeStoredCurrentUser(currentUser)
      return currentUser
    }, (currentUser) => ({ currentUser })),
  logout: () =>
    runRequest(set, logout, () => {
      writeStoredCurrentUser(null)
      return {
        currentUser: null,
        currentUserDetail: null,
      }
    }),
  fetchCurrentUser: () =>
    runRequest(set, getCurrentUser, (currentUser) => {
      writeStoredCurrentUser(currentUser)
      return { currentUser }
    }),
  changePassword: (payload) => runRequest(set, () => changePassword(payload)),
  resetUserPassword: (id, payload) => runRequest(set, () => resetUserPassword(id, payload)),
  fetchRoles: () => runRequest(set, getRoleList, (roles) => ({ roles })),
  fetchRoleDetail: (id) => runRequest(set, () => getRoleDetail(id), (currentRole) => ({ currentRole })),
  createRole: (payload) =>
    runRequest(set, () => createRole(payload), (role) => ({
      roles: [...get().roles, role],
    })),
  updateRole: (id, payload) =>
    runRequest(set, () => updateRole(id, payload), (role) => ({
      currentRole: role,
      roles: get().roles.map((item) => (item.id === id ? role : item)),
    })),
  deleteRole: (id) =>
    runRequest(set, () => deleteRole(id), () => ({
      currentRole: get().currentRole?.id === id ? null : get().currentRole,
      roles: get().roles.filter((item) => item.id !== id),
    })),
  fetchUsers: (query) => runRequest(set, () => getUserPage(query), (usersPage) => ({ usersPage })),
  fetchUserDetail: (id) =>
    runRequest(set, () => getUserDetail(id), (currentUserDetail) => ({ currentUserDetail })),
  createUser: (payload) =>
    runRequest(set, () => createUser(payload), (user) => ({
      currentUserDetail: user,
    })),
  updateUser: (id, payload) =>
    runRequest(set, () => updateUser(id, payload), (user) => ({
      currentUserDetail: user,
      currentUser: get().currentUser?.id === id ? user : get().currentUser,
    })),
  updateUserStatus: (id, payload) =>
    runRequest(set, () => updateUserStatus(id, payload)),
  assignUserRoles: (id, payload) => runRequest(set, () => assignUserRoles(id, payload)),
  deleteUser: (id) =>
    runRequest(set, () => deleteUser(id), () => ({
      currentUserDetail: get().currentUserDetail?.id === id ? null : get().currentUserDetail,
    })),
  previewUserImport: (file) =>
    runRequest(set, () => previewUserImport(file), (userImportPreview) => ({ userImportPreview })),
  submitUserImport: (payload) =>
    runRequest(set, () => submitUserImport(payload), (userImportResult) => ({
      userImportResult,
      userImportPreview: null,
    })),
}))
