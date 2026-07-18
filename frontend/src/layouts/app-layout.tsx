import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[320px_minmax(0,1fr)]">
      <AppSidebar />
      <main className="min-w-0 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
