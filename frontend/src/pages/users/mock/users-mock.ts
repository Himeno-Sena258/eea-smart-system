import type { AuditLog, Organization, User } from "@/models"

export const organizationTreeMock: Organization[] = [
  {
    id: 1,
    name: "计算机学院",
    type: "COLLEGE",
    createdAt: "2026-01-01 09:00:00",
    children: [
      {
        id: 2,
        name: "软件工程专业",
        parentId: 1,
        type: "MAJOR",
        createdAt: "2026-01-01 09:05:00",
        children: [
          { id: 3, name: "软件工程 2024 级 1 班", parentId: 2, type: "CLASS", createdAt: "2026-01-01 09:10:00" },
          { id: 4, name: "软件工程 2024 级 2 班", parentId: 2, type: "CLASS", createdAt: "2026-01-01 09:10:00" },
        ],
      },
      {
        id: 5,
        name: "计算机科学与技术专业",
        parentId: 1,
        type: "MAJOR",
        createdAt: "2026-01-01 09:05:00",
      },
    ],
  },
]

export const usersMock: User[] = [
  {
    id: 10001,
    username: "10001",
    realName: "李主任",
    email: "director@example.edu.cn",
    phone: "13800138001",
    status: 1,
    orgId: 2,
    orgName: "软件工程专业",
    roleCodes: ["DIRECTOR"],
    createdAt: "2026-01-01 10:00:00",
  },
  {
    id: 10002,
    username: "10002",
    realName: "张老师",
    email: "teacher@example.edu.cn",
    phone: "13800138002",
    status: 1,
    orgId: 2,
    orgName: "软件工程专业",
    roleCodes: ["INSTRUCTOR"],
    createdAt: "2026-01-01 10:10:00",
  },
  {
    id: 2024001,
    username: "2024001",
    realName: "刘同学",
    email: "student@example.edu.cn",
    phone: "13800138003",
    status: 1,
    orgId: 3,
    orgName: "软件工程 2024 级 1 班",
    roleCodes: ["STUDENT"],
    studentNo: "2024001",
    classId: 3,
    className: "软件工程 2024 级 1 班",
    createdAt: "2026-01-01 10:20:00",
  },
  {
    id: 10003,
    username: "10003",
    realName: "王教授",
    email: "coordinator@example.edu.cn",
    phone: "13800138004",
    status: 0,
    orgId: 2,
    orgName: "软件工程专业",
    roleCodes: ["COORDINATOR"],
    createdAt: "2026-01-01 10:30:00",
  },
]

export interface ImportPreviewRow {
  account: string
  realName: string
  roleCode: string
  organization: string
  phone: string
  validation: "PASS" | "WARN"
  message: string
}

export const importPreviewRowsMock: ImportPreviewRow[] = [
  {
    account: "2024002",
    realName: "王同学",
    roleCode: "STUDENT",
    organization: "软件工程 2024 级 1 班",
    phone: "13800138005",
    validation: "PASS",
    message: "可导入",
  },
  {
    account: "10002",
    realName: "张老师",
    roleCode: "INSTRUCTOR",
    organization: "软件工程专业",
    phone: "13800138002",
    validation: "WARN",
    message: "账号已存在",
  },
]

export const auditLogsMock: AuditLog[] = [
  {
    id: 1,
    userId: 1,
    username: "admin",
    action: "CREATE",
    target: "admin/users",
    targetId: 2024002,
    detail: "批量导入学生账号",
    ipAddress: "10.10.1.8",
    createdAt: "2026-01-01 11:00:00",
  },
  {
    id: 2,
    userId: 1,
    username: "admin",
    action: "UPDATE",
    target: "admin/users/status",
    targetId: 10003,
    detail: "停用课程负责人账号",
    ipAddress: "10.10.1.8",
    createdAt: "2026-01-01 11:20:00",
  },
  {
    id: 3,
    userId: 1,
    username: "admin",
    action: "EXPORT",
    target: "audit-logs",
    detail: "导出审计日志",
    ipAddress: "10.10.1.8",
    createdAt: "2026-01-01 12:10:00",
  },
]
