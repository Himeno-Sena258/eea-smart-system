import type { RoleCode } from "@/models"

export const roleLabels: Record<RoleCode, string> = {
  ADMIN: "系统管理员",
  DIRECTOR: "专业负责人",
  COORDINATOR: "课程负责人",
  INSTRUCTOR: "授课教师",
  STUDENT: "学生",
}

export const roleOptions: Array<{ role: RoleCode; label: string }> = [
  { role: "ADMIN", label: roleLabels.ADMIN },
  { role: "DIRECTOR", label: roleLabels.DIRECTOR },
  { role: "COORDINATOR", label: roleLabels.COORDINATOR },
  { role: "INSTRUCTOR", label: roleLabels.INSTRUCTOR },
  { role: "STUDENT", label: roleLabels.STUDENT },
]
