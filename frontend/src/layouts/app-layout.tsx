import { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalRoleSwitcher } from "@/components/global-role-switcher"
import { roleOptions } from "@/constants/role-options"
import type { RoleCode } from "@/models"
import { appRoutes } from "@/routes/app-routes"
import { useAuthStore, useBaseStore, useSystemStore, useUiStore } from "@/stores"

export function AppLayout() {
  const activeRole = useUiStore((state) => state.activeRole)
  const setActiveRole = useUiStore((state) => state.setActiveRole)
  const currentUser = useAuthStore((state) => state.currentUser)
  const fetchRoleOptions = useSystemStore((state) => state.fetchRoleOptions)
  const fetchOrganizationTypeOptions = useSystemStore((state) => state.fetchOrganizationTypeOptions)
  const fetchEvidenceLevelTagOptions = useSystemStore((state) => state.fetchEvidenceLevelTagOptions)
  const fetchSurveyTypeOptions = useSystemStore((state) => state.fetchSurveyTypeOptions)
  const fetchSemesterOptions = useSystemStore((state) => state.fetchSemesterOptions)
  const fetchReportStatusOptions = useSystemStore((state) => state.fetchReportStatusOptions)
  const fetchReportSectionStatusOptions = useSystemStore((state) => state.fetchReportSectionStatusOptions)
  const fetchReportDataSourceTypeOptions = useSystemStore((state) => state.fetchReportDataSourceTypeOptions)
  const fetchAuditActionOptions = useSystemStore((state) => state.fetchAuditActionOptions)
  const fetchOrganizationTree = useBaseStore((state) => state.fetchOrganizationTree)
  const fetchMajors = useBaseStore((state) => state.fetchMajors)
  const fetchClasses = useBaseStore((state) => state.fetchClasses)
  const location = useLocation()
  const navigate = useNavigate()
  const bootstrappedUserIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true, state: { from: location.pathname } })
      return
    }

    const allowedRoles = currentUser.roleCodes?.filter((roleCode): roleCode is RoleCode =>
      roleOptions.some((option) => option.role === roleCode),
    ) ?? []

    if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
      setActiveRole(allowedRoles[0])
      return
    }

    const currentRoute = appRoutes.find((route) => route.path === location.pathname)

    if (currentRoute && !currentRoute.roles.includes(activeRole)) {
      navigate("/dashboard", { replace: true })
    }
  }, [activeRole, currentUser, location.pathname, navigate, setActiveRole])

  useEffect(() => {
    if (!currentUser || bootstrappedUserIdRef.current === currentUser.id) return

    bootstrappedUserIdRef.current = currentUser.id
    void Promise.allSettled([
      fetchRoleOptions(),
      fetchOrganizationTypeOptions(),
      fetchEvidenceLevelTagOptions(),
      fetchSurveyTypeOptions(),
      fetchSemesterOptions(),
      fetchReportStatusOptions(),
      fetchReportSectionStatusOptions(),
      fetchReportDataSourceTypeOptions(),
      fetchAuditActionOptions(),
      fetchOrganizationTree(),
      fetchMajors({ pageNum: 1, pageSize: 100 }),
      fetchClasses({ pageNum: 1, pageSize: 100 }),
    ])
  }, [
    currentUser,
    fetchAuditActionOptions,
    fetchClasses,
    fetchEvidenceLevelTagOptions,
    fetchMajors,
    fetchOrganizationTree,
    fetchOrganizationTypeOptions,
    fetchReportDataSourceTypeOptions,
    fetchReportSectionStatusOptions,
    fetchReportStatusOptions,
    fetchRoleOptions,
    fetchSemesterOptions,
    fetchSurveyTypeOptions,
  ])

  return (
    <div className="grid min-h-screen lg:grid-cols-[320px_minmax(0,1fr)]">
      <AppSidebar />
      <main className="min-w-0 p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="m-0 text-xs font-extrabold tracking-[0.14em] text-slate-400 uppercase">Role Preview</p>
            <h1 className="m-0 mt-1 text-xl font-extrabold text-slate-950">全局角色切换</h1>
          </div>
          <GlobalRoleSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
