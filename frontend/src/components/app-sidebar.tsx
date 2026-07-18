import type { ComponentType } from "react"
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutGrid,
  RefreshCw,
  ShieldCheck,
  Target,
  UserCircle,
  UsersRound,
  type LucideProps,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import type { RoleCode } from "@/models"
import { useAuthStore } from "@/stores"

type SidebarIcon = ComponentType<LucideProps>

interface SidebarItem {
  path: string
  title: string
  roles: RoleCode[]
  icon: SidebarIcon
}

interface SidebarGroup {
  title?: string
  roles: RoleCode[]
  items: SidebarItem[]
}

const roleLabels: Record<RoleCode, string> = {
  ADMIN: "系统管理员",
  DIRECTOR: "专业负责人",
  COORDINATOR: "课程负责人",
  INSTRUCTOR: "授课教师",
  STUDENT: "学生",
}

const allRoles: RoleCode[] = ["ADMIN", "DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"]
const businessRoles: RoleCode[] = ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"]
const qualityRoles: RoleCode[] = ["DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"]

const sidebarGroups: SidebarGroup[] = [
  {
    roles: allRoles,
    items: [
      {
        path: "/dashboard",
        title: "角色工作台",
        roles: allRoles,
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: "系统底座",
    roles: ["ADMIN"],
    items: [
      {
        path: "/admin/users",
        title: "用户与组织管理",
        roles: ["ADMIN"],
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "核心业务闭环",
    roles: businessRoles,
    items: [
      {
        path: "/program",
        title: "培养方案管理",
        roles: ["DIRECTOR"],
        icon: ClipboardList,
      },
      {
        path: "/courses",
        title: "课程质量管理",
        roles: businessRoles,
        icon: BookOpen,
      },
      {
        path: "/teaching-classes",
        title: "教学班与成绩",
        roles: ["COORDINATOR", "INSTRUCTOR", "STUDENT"],
        icon: UsersRound,
      },
      {
        path: "/attainment",
        title: "达成度分析",
        roles: businessRoles,
        icon: Target,
      },
    ],
  },
  {
    title: "质量保障与改进",
    roles: qualityRoles,
    items: [
      {
        path: "/surveys",
        title: "问卷与评价",
        roles: ["DIRECTOR", "STUDENT"],
        icon: ClipboardList,
      },
      {
        path: "/improvements",
        title: "持续改进",
        roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR"],
        icon: RefreshCw,
      },
      {
        path: "/reports",
        title: "自评报告协同",
        roles: ["DIRECTOR", "INSTRUCTOR"],
        icon: FileText,
      },
    ],
  },
  {
    title: "设置",
    roles: allRoles,
    items: [
      {
        path: "/profile",
        title: "个人中心",
        roles: allRoles,
        icon: UserCircle,
      },
    ],
  },
]

const isRoleCode = (role: string): role is RoleCode => role in roleLabels

const canAccess = (allowedRoles: RoleCode[], currentRole: RoleCode) => allowedRoles.includes(currentRole)

export function AppSidebar() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const currentRole = currentUser?.roleCodes?.find(isRoleCode) ?? "INSTRUCTOR"
  const visibleGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.roles, currentRole)),
    }))
    .filter((group) => canAccess(group.roles, currentRole) && group.items.length > 0)

  return (
    <aside className="app-sidebar" aria-label="主导航">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          <GraduationCap size={30} strokeWidth={2.4} />
        </div>
        <span>EEA 认证系统</span>
      </div>

      <nav className="side-nav">
        {visibleGroups.map((group, groupIndex) => (
          <section className="side-nav-group" key={group.title ?? "primary"}>
            {group.title ? <p className="side-nav-group-title">{group.title}</p> : null}
            <div className="side-nav-list">
              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    end={groupIndex === 0}
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `side-nav-link${isActive ? " active" : ""}`}
                  >
                    <Icon className="side-nav-icon" size={19} strokeWidth={2} aria-hidden="true" />
                    <span>{item.title}</span>
                  </NavLink>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="sidebar-status">
        <strong>{roleLabels[currentRole]}</strong>
        <span>v2.0 运行正常</span>
      </div>
    </aside>
  )
}
