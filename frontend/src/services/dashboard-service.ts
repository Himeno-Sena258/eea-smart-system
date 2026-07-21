import type { RoleCode, RoleDashboard } from "@/models"
import { request } from "./http"

const dashboardPathMap: Record<RoleCode, string> = {
  ADMIN: "/dashboard/admin",
  DIRECTOR: "/dashboard/director",
  COORDINATOR: "/dashboard/coordinator",
  INSTRUCTOR: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
}

export const getRoleDashboard = async (role: RoleCode) => {
  const response = await request<RoleDashboard>({
    url: dashboardPathMap[role],
    method: "GET",
  })
  return response.data
}
