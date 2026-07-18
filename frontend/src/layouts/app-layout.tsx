import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout() {
  return (
    <div className="app-frame">
      <AppSidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
