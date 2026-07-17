import { NavLink, Outlet } from "react-router-dom"
import { appRoutes } from "@/routes/app-routes"

export function AppLayout() {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="brand-mark">EEA</span>
          <div>
            <p className="brand-title">认证智能服务系统</p>
            <p className="brand-subtitle">工程教育专业认证</p>
          </div>
        </div>
        <nav className="side-nav" aria-label="主导航">
          {appRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) => `side-nav-link${isActive ? " active" : ""}`}
            >
              <span>{route.title}</span>
              <small>{route.roles.join(" / ")}</small>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
