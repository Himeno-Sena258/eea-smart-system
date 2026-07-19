import { AlertTriangle, BarChart3, ChartNoAxesCombined } from "lucide-react"
import { roleLabels } from "@/constants/role-options"
import { useUiStore } from "@/stores"
import { AttainmentRadarChart } from "./attainment-radar-chart"
import { attainmentRadarMockMap } from "./mock/attainment-mock"

const threshold = 0.68

export function AttainmentPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const mock = attainmentRadarMockMap[activeRole]

  if (!mock) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">达成度分析</h1>
        <p className="mt-3 text-sm text-slate-500">当前角色暂无达成度分析视图。</p>
      </section>
    )
  }

  const weakItems = mock.requirementResult.items.filter((item) => item.attainmentVal < threshold)

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <ChartNoAxesCombined size={16} />
          达成度分析
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            达成度评价看板
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">基于成绩数据的底线阈值自动计算结果。</p>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <BarChart3 size={19} className="text-blue-700" />
              {mock.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{mock.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">{roleLabels[activeRole]}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{mock.scopeName}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{mock.updatedAt}</span>
          </div>
        </div>

        <AttainmentRadarChart result={mock.requirementResult} threshold={threshold} />
      </section>

      {weakItems.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-red-800">
            <AlertTriangle size={19} />
            低达成维度
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {weakItems.map((item) => (
              <article className="rounded-lg border border-red-200 bg-white p-4" key={item.requirementId}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-base font-extrabold text-red-800">
                      {item.requirementCode} {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-red-600">低于标准底线 {threshold.toFixed(2)}</p>
                  </div>
                  <strong className="text-2xl leading-none text-red-700">{item.attainmentVal.toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}
