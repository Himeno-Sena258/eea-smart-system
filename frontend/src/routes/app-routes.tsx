import type { ReactNode } from "react"
import type { RoleCode } from "@/models"
import { AttainmentPage } from "@/pages/attainment"
import { CoursesPage } from "@/pages/courses"
import { DashboardPage } from "@/pages/dashboard"
import { ImprovementsPage } from "@/pages/improvements"
import { ProfilePage } from "@/pages/profile"
import { ProgramPage } from "@/pages/program"
import { ReportsPage } from "@/pages/reports"
import { SettingsPage } from "@/pages/settings"
import { SurveysPage } from "@/pages/surveys"
import { TeachingClassesPage } from "@/pages/teaching-classes"
import { UsersPage } from "@/pages/users"

export interface AppRoute {
  path: string
  title: string
  description: string
  roles: RoleCode[]
  element: ReactNode
}

export const allRoles: RoleCode[] = ["ADMIN", "DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"]

export const appRoutes: AppRoute[] = [
  {
    path: "/dashboard",
    title: "角色工作台",
    description: "按当前角色展示待办、统计与快捷入口。",
    roles: allRoles,
    element: <DashboardPage />,
  },
  {
    path: "/admin/users",
    title: "用户管理",
    description: "账号开设、密码重置与状态管控。",
    roles: ["ADMIN"],
    element: <UsersPage />,
  },
  {
    path: "/admin/organizations",
    title: "组织架构管理",
    description: "学院、专业、班级的树状层级维护。",
    roles: ["ADMIN"],
    element: <OrganizationPage />,
  },
  {
    path: "/admin/import",
    title: "批量导入",
    description: "Excel批量导入师生账号数据。",
    roles: ["ADMIN"],
    element: <ImportPage />,
  },
  {
    path: "/program",
    title: "培养方案管理",
    description: "方案版本、毕业要求、指标点与课程支撑矩阵。",
    roles: ["DIRECTOR"],
    element: <ProgramPage />,
  },
  {
    path: "/courses",
    title: "课程质量管理",
    description: "课程信息、大纲、课程目标、考核配置与课程资源。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <CoursesPage />,
  },
  {
    path: "/teaching-classes",
    title: "教学班与成绩",
    description: "教学班名单、成绩录入、成绩单与佐证材料。",
    roles: ["COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <TeachingClassesPage />,
  },
  {
    path: "/attainment",
    title: "达成度分析",
    description: "专业、课程、班级与个人维度的达成度分析。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <AttainmentPage />,
  },
  {
    path: "/surveys",
    title: "问卷与评价",
    description: "间接评价问卷的发布、填写与统计。",
    roles: ["DIRECTOR", "STUDENT"],
    element: <SurveysPage />,
  },
  {
    path: "/improvements",
    title: "持续改进",
    description: "专业、课程与班级层面的改进闭环。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR"],
    element: <ImprovementsPage />,
  },
  {
    path: "/reports",
    title: "自评报告协同",
    description: "报告创建、章节分派、协同编辑与导出。",
    roles: ["DIRECTOR", "INSTRUCTOR"],
    element: <ReportsPage />,
  },
  {
    path: "/profile",
    title: "个人中心",
    description: "个人资料、账号安全与当前角色信息。",
    roles: allRoles,
    element: <ProfilePage />,
  },
  {
    path: "/settings",
    title: "系统设置",
    description: "学年学期、达成度阈值与认证标准版本设置。",
    roles: ["ADMIN"],
    element: <SettingsPage />,
  },
]
