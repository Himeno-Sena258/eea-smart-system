import type { ReactNode } from "react"
import type { RoleCode } from "@/models"
import { AttainmentPage } from "@/pages/attainment-page"
import { CoursesPage } from "@/pages/courses-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { ImprovementsPage } from "@/pages/improvements-page"
import { ProgramPage } from "@/pages/program-page"
import { ReportsPage } from "@/pages/reports-page"
import { SurveysPage } from "@/pages/surveys-page"
import { TeachingClassesPage } from "@/pages/teaching-classes-page"
import { UsersPage } from "@/pages/users-page"

export interface AppRoute {
  path: string
  title: string
  description: string
  roles: RoleCode[]
  element: ReactNode
}

export const appRoutes: AppRoute[] = [
  {
    path: "/dashboard",
    title: "工作台",
    description: "按当前角色展示待办、统计和快捷入口。",
    roles: ["ADMIN", "DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <DashboardPage />,
  },
  {
    path: "/admin/users",
    title: "用户与组织",
    description: "账号开户、组织架构、行政班级和审计入口。",
    roles: ["ADMIN"],
    element: <UsersPage />,
  },
  {
    path: "/program",
    title: "培养方案",
    description: "方案版本、毕业要求、指标点和课程支撑矩阵。",
    roles: ["DIRECTOR"],
    element: <ProgramPage />,
  },
  {
    path: "/courses",
    title: "课程管理",
    description: "课程信息、大纲、课程目标、考核配置和课程资源。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <CoursesPage />,
  },
  {
    path: "/teaching-classes",
    title: "教学班",
    description: "教学班名单、成绩录入、成绩单和佐证材料。",
    roles: ["COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <TeachingClassesPage />,
  },
  {
    path: "/attainment",
    title: "达成度分析",
    description: "专业、课程、班级和个人维度的达成度分析。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
    element: <AttainmentPage />,
  },
  {
    path: "/surveys",
    title: "问卷评价",
    description: "间接评价问卷的发布、填写和统计。",
    roles: ["DIRECTOR", "STUDENT"],
    element: <SurveysPage />,
  },
  {
    path: "/improvements",
    title: "持续改进",
    description: "专业、课程和班级层面的改进闭环。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR"],
    element: <ImprovementsPage />,
  },
  {
    path: "/reports",
    title: "自评报告",
    description: "报告创建、章节分派、协同编辑和导出。",
    roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR"],
    element: <ReportsPage />,
  },
]
