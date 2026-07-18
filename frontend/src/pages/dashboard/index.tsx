import {
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useUiStore } from "@/stores"
import { dashboardMockMap, type DashboardTone } from "./mock/dashboard-mock"

const toneClassMap: Record<DashboardTone, { card: string; text: string; badge: string; bar: string }> = {
  blue: {
    card: "border-blue-200 bg-blue-50/70",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    bar: "bg-blue-600",
  },
  green: {
    card: "border-emerald-200 bg-emerald-50/70",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-600",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/80",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
  },
  red: {
    card: "border-red-200 bg-red-50/80",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-600",
  },
  slate: {
    card: "border-slate-200 bg-white",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700",
    bar: "bg-slate-500",
  },
}

export function DashboardPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const dashboard = dashboardMockMap[activeRole]

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid max-w-4xl gap-2.5">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <LayoutDashboard size={16} />
            角色工作台
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              {dashboard.title}
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-600">{dashboard.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {dashboard.stats.map((stat) => {
          const tone = toneClassMap[stat.tone]

          return (
            <article className={`rounded-lg border p-5 ${tone.card}`} key={stat.label}>
              <p className="m-0 text-sm font-bold text-slate-500">{stat.label}</p>
              <strong className={`mt-2 block text-3xl leading-none font-extrabold ${tone.text}`}>{stat.value}</strong>
              <p className="mt-3 text-xs font-semibold text-slate-500">{stat.hint}</p>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-extrabold text-slate-950">待办与提醒</h2>
              <p className="mt-1 text-sm text-slate-500">{dashboard.roleName}当前需要关注的事项</p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
              {dashboard.todos.length} 项
            </span>
          </div>

          <div className="grid gap-3">
            {dashboard.todos.map((todo) => {
              const tone = toneClassMap[todo.level]

              return (
                <article className={`rounded-lg border p-4 ${tone.card}`} key={todo.title}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="m-0 text-base font-extrabold text-slate-950">{todo.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{todo.description}</p>
                    </div>
                    <Link
                      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-extrabold ${tone.badge}`}
                      to={todo.targetPath}
                    >
                      {todo.action}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="grid gap-4">
          {dashboard.warnings.length > 0 ? (
            <section className="rounded-lg border border-red-200 bg-red-50 p-5">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-red-800">
                <AlertTriangle size={19} />
                预警
              </h2>
              <div className="mt-4 grid gap-3">
                {dashboard.warnings.map((warning) => (
                  <article className="rounded-lg border border-red-200 bg-white p-4" key={warning.title}>
                    <h3 className="m-0 text-base font-extrabold text-red-800">{warning.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-red-700">{warning.description}</p>
                    <div className="mt-3 flex items-end gap-2">
                      <strong className="text-2xl leading-none text-red-700">{warning.value}</strong>
                      {warning.threshold ? <span className="text-xs font-bold text-red-500">阈值 {warning.threshold}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="m-0 text-lg font-extrabold text-slate-950">快捷入口</h2>
            <div className="mt-4 grid gap-2">
              {dashboard.quickLinks.map((link) => (
                <Link
                  className="group rounded-lg border border-slate-200 p-3 no-underline transition hover:border-blue-200 hover:bg-blue-50"
                  key={link.title}
                  to={link.targetPath}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="m-0 text-sm font-extrabold text-slate-800 group-hover:text-blue-700">{link.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{link.description}</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-blue-600" size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {dashboard.chartItems ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="m-0 text-lg font-extrabold text-slate-950">{dashboard.chartTitle}</h2>
          <div className="mt-5 grid gap-4">
            {dashboard.chartItems.map((item) => {
              const isLow = item.value < 0.68

              return (
                <div className="grid gap-2" key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className={isLow ? "font-extrabold text-red-700" : "font-extrabold text-blue-700"}>
                      {item.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${isLow ? "bg-red-600" : "bg-blue-600"}`}
                      style={{ width: `${Math.min(item.value * 100, 100)}%` }}
                    />
                  </div>
                  {item.helper ? <p className="m-0 text-xs font-bold text-red-600">{item.helper}</p> : null}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </section>
  )
}
