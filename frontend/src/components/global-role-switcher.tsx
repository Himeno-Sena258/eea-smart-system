import type { ComponentType } from "react"
import { BarChart3, CheckCircle2, ClipboardCheck, FileText, ShieldCheck, type LucideProps } from "lucide-react"
import type { RoleCode } from "@/models"
import { roleOptions } from "@/constants/role-options"
import { useAuthStore, useSystemStore, useUiStore } from "@/stores"

type RoleIcon = ComponentType<LucideProps>

const roleIconMap: Record<RoleCode, RoleIcon> = {
  ADMIN: ShieldCheck,
  DIRECTOR: BarChart3,
  COORDINATOR: ClipboardCheck,
  INSTRUCTOR: FileText,
  STUDENT: CheckCircle2,
}

export function GlobalRoleSwitcher() {
  const activeRole = useUiStore((state) => state.activeRole)
  const setActiveRole = useUiStore((state) => state.setActiveRole)
  const currentUser = useAuthStore((state) => state.currentUser)
  const roleDictOptions = useSystemStore((state) => state.roleOptions)
  const userRoleOptions = roleOptions
    .filter((option) => currentUser?.roleCodes?.includes(option.role))
    .map((option) => ({
      ...option,
      label: roleDictOptions.find((dictOption) => dictOption.value === option.role)?.label ?? option.label,
    }))

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
      {userRoleOptions.map((option) => {
        const Icon = roleIconMap[option.role]
        const isActive = option.role === activeRole

        return (
          <button
            className={[
              "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-extrabold transition",
              isActive ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
            ].join(" ")}
            key={option.role}
            onClick={() => setActiveRole(option.role)}
            type="button"
          >
            <Icon size={16} aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
