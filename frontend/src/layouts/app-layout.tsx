import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalRoleSwitcher } from "@/components/global-role-switcher"
import { appRoutes } from "@/routes/app-routes"
import { useAuthStore, useUiStore } from "@/stores"

export function AppLayout() {
  const activeRole = useUiStore((state) => state.activeRole)
  const currentUser = useAuthStore((state) => state.currentUser)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true, state: { from: location.pathname } })
      return
    }

    const currentRoute = appRoutes.find((route) => route.path === location.pathname)

    if (currentRoute && !currentRoute.roles.includes(activeRole)) {
      navigate("/dashboard", { replace: true })
    }
  }, [activeRole, currentUser, location.pathname, navigate])

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
