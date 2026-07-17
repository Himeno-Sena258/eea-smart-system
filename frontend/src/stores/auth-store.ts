import { create } from "zustand"
import type {
  AssignUserRolesPayload,
  ChangePasswordPayload,
  CreateUserPayload,
  ID,
  LoginPayload,
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
  register,
  resetUserPassword,
  updateRole,
  updateUser,
  updateUserStatus,
  type RolePayload,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface AuthStore extends RequestState, RequestActions {
  currentUser: User | null
  roles: Role[]
  currentRole: Role | null
  usersPage: PageResult<User> | null
  currentUserDetail: User | null
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<RegisterResult>
  logout: () => Promise<boolean>
  fetchCurrentUser: () => Promise<User>
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>
  resetUserPassword: (id: ID, payload: ResetPasswordPayload) => Promise<boolean>
  fetchRoles: () => Promise<Role[]>
  fetchRoleDetail: (id: ID) => Promise<Role>
  createRole: (payload: RolePayload) => Promise<Role>
  updateRole: (id: ID, payload: RolePayload) => Promise<Role>
  deleteRole: (id: ID) => Promise<boolean>
  fetchUsers: (query?: PageQuery) => Promise<PageResult<User>>
  fetchUserDetail: (id: ID) => Promise<User>
  createUser: (payload: CreateUserPayload) => Promise<User>
  updateUser: (id: ID, payload: UpdateUserPayload) => Promise<User>
  updateUserStatus: (id: ID, payload: UpdateUserStatusPayload) => Promise<User>
  assignUserRoles: (id: ID, payload: AssignUserRolesPayload) => Promise<boolean>
  deleteUser: (id: ID) => Promise<boolean>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...createInitialRequestState(),
  currentUser: null,
  roles: [],
  currentRole: null,
  usersPage: null,
  currentUserDetail: null,
  clearError: () => set({ error: null }),
  login: (payload) =>
    runRequest(set, async () => {
      const result = await login(payload)
      return result.user
    }, (currentUser) => ({ currentUser })),
  register: (payload) => runRequest(set, () => register(payload)),
  logout: () =>
    runRequest(set, logout, () => ({
      currentUser: null,
      currentUserDetail: null,
    })),
  fetchCurrentUser: () => runRequest(set, getCurrentUser, (currentUser) => ({ currentUser })),
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
    runRequest(set, () => updateUserStatus(id, payload), (user) => ({
      currentUserDetail: user,
    })),
  assignUserRoles: (id, payload) => runRequest(set, () => assignUserRoles(id, payload)),
  deleteUser: (id) =>
    runRequest(set, () => deleteUser(id), () => ({
      currentUserDetail: get().currentUserDetail?.id === id ? null : get().currentUserDetail,
    })),
}))
