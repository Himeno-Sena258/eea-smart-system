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
import { roleLabels } from "@/constants/role-options"
import type { RoleCode } from "@/models"
import { useSystemStore, useUiStore } from "@/stores"

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

const canAccess = (allowedRoles: RoleCode[], currentRole: RoleCode) => allowedRoles.includes(currentRole)

export function AppSidebar() {
  const currentRole = useUiStore((state) => state.activeRole)
  const roleOptions = useSystemStore((state) => state.roleOptions)
  const currentRoleLabel = roleOptions.find((option) => option.value === currentRole)?.label ?? roleLabels[currentRole]
  const visibleGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.roles, currentRole)),
    }))
    .filter((group) => canAccess(group.roles, currentRole) && group.items.length > 0)

  return (
    <aside
      className="static flex h-auto flex-col overflow-hidden border-b border-slate-200 bg-white shadow-[0_0_0_1px_rgb(15_23_42_/_2%)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r"
      aria-label="主导航"
    >
      <div className="flex min-h-[88px] items-center gap-3 border-b border-slate-200 bg-blue-50/50 px-7 text-[22px] font-extrabold text-blue-700">
        <div className="grid size-9 place-items-center text-blue-700" aria-hidden="true">
          <GraduationCap size={30} strokeWidth={2.4} />
        </div>
        <span>EEA 认证系统</span>
      </div>

      <nav className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] overflow-y-auto p-3 lg:block lg:p-0 lg:py-5">
        {visibleGroups.map((group, groupIndex) => (
          <section className="mb-0 lg:mb-6" key={group.title ?? "primary"}>
            {group.title ? (
              <p className="hidden px-6 pb-2 text-[13px] font-extrabold text-slate-400 lg:block">{group.title}</p>
            ) : null}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    end={groupIndex === 0}
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "flex min-h-12 items-center gap-4 rounded-lg px-3 text-sm font-extrabold text-slate-700 no-underline transition-colors lg:min-h-16 lg:rounded-none lg:border-r-[3px] lg:px-7 lg:text-[17px]",
                        isActive
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-transparent hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700",
                      ].join(" ")
                    }
                  >
                    <Icon className="shrink-0" size={19} strokeWidth={2} aria-hidden="true" />
                    <span>{item.title}</span>
                  </NavLink>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="mx-5 mb-5 hidden gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center lg:grid">
        <strong className="text-[15px] text-blue-700">{currentRoleLabel}</strong>
        <span className="text-sm text-slate-500">v2.0 运行正常</span>
      </div>
    </aside>
  )
}
