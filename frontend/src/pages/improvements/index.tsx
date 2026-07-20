import { AlertTriangle, CheckCircle2, ClipboardList, FileText, RefreshCw, Send, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUiStore } from "@/stores"
import { improvementRecordsMock, statusMetaMap, type ImprovementRecord } from "./mock/improvements-mock"

const roleTitleMap = {
  DIRECTOR: "专业持续改进总览",
  COORDINATOR: "课程持续改进跟踪",
  INSTRUCTOR: "班级教学改进任务单",
} as const

function RecordCard({
  record,
  actionLabel = "审阅",
}: {
  record: ImprovementRecord
  actionLabel?: string
}) {
  const status = statusMetaMap[record.status]
  const isLow = record.attainmentVal < record.threshold

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${status.className}`}>
            {status.label}
          </span>
          <h3 className="mt-2 text-sm font-extrabold text-slate-950">
            {record.courseName} / {record.className} / {record.objectiveCode}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{record.teacherName} / {record.createdAt}</p>
        </div>
        <div className={isLow ? "text-right text-red-700" : "text-right text-emerald-700"}>
          <p className="m-0 text-xs font-extrabold">达成度</p>
          <strong className="mt-1 block text-xl leading-none">{record.attainmentVal.toFixed(2)}</strong>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-2.5">
          <p className="m-0 text-xs font-extrabold text-slate-400">问题归因分析</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{record.problemAnalysis}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5">
          <p className="m-0 text-xs font-extrabold text-slate-400">下一轮改进措施</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{record.improvementMeasures}</p>
        </div>
      </div>
      {record.reviewerComment ? (
        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">审阅意见：{record.reviewerComment}</p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button variant="outline" type="button">{actionLabel}</Button>
      </div>
    </article>
  )
}

function InstructorView() {
  const task = improvementRecordsMock[0]

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="relative overflow-hidden rounded-lg border border-red-200 bg-white p-4 shadow-sm">
        <div className="absolute top-0 left-0 h-full w-1 bg-red-500" />
        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
          系统任务单
        </span>
        <h2 className="mt-3 text-base font-extrabold text-slate-950">
          {task.courseName} ({task.className}) - {task.objectiveCode} 达成度低于 {task.threshold.toFixed(2)} 分析报告
        </h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-extrabold text-slate-700">问题归因分析</span>
            <textarea
              className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              defaultValue={task.problemAnalysis}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-extrabold text-slate-700">下一轮改进措施</span>
            <textarea
              className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              defaultValue={task.improvementMeasures}
            />
          </label>
          <div className="flex justify-end">
            <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
              <Send size={16} />
              提交报告
            </Button>
          </div>
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <section className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="m-0 text-sm font-bold text-red-700">低达成目标</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-red-700">{task.objectiveCode}</strong>
          <p className="mt-2 text-xs font-bold text-red-600">
            {task.attainmentVal.toFixed(2)} &lt; {task.threshold.toFixed(2)}
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h3 className="m-0 text-base font-extrabold text-slate-950">历史反思</h3>
          <div className="mt-3 grid gap-2">
            {improvementRecordsMock.slice(1).map((record) => (
              <div className="rounded-lg border border-slate-200 p-2.5" key={record.id}>
                <p className="m-0 text-sm font-extrabold text-slate-800">{record.courseName} / {record.objectiveCode}</p>
                <p className="mt-1 text-xs text-slate-500">{statusMetaMap[record.status].label}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

function ReviewView({ role }: { role: "DIRECTOR" | "COORDINATOR" }) {
  const lowCount = improvementRecordsMock.filter((record) => record.attainmentVal < record.threshold).length
  const reviewedCount = improvementRecordsMock.filter((record) => record.status === "REVIEWED").length

  return (
    <div className="grid gap-4">
      <section className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">改进记录</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{improvementRecordsMock.length}</strong>
        </article>
        <article className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="m-0 text-sm font-bold text-red-700">低达成记录</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-red-700">{lowCount}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">已审阅</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">{reviewedCount}</strong>
        </article>
      </section>

      <section className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
        {improvementRecordsMock.map((record) => (
          <RecordCard actionLabel={role === "DIRECTOR" ? "查看闭环" : "审阅"} key={record.id} record={record} />
        ))}
      </section>
    </div>
  )
}

export function ImprovementsPage() {
  const activeRole = useUiStore((state) => state.activeRole)

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <RefreshCw size={16} />
          持续改进
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            {activeRole in roleTitleMap ? roleTitleMap[activeRole as keyof typeof roleTitleMap] : "持续改进闭环"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            针对达成度预警生成归因分析与教改措施，形成 PDCA 闭环记录。
          </p>
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-slate-500">
            <ClipboardList size={16} />
            问题来源
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-slate-950">达成度预警</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-slate-500">
            <TrendingUp size={16} />
            改进周期
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-slate-950">本轮教学周期</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-slate-500">
            <CheckCircle2 size={16} />
            闭环状态
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-slate-950">持续跟踪</strong>
        </article>
      </section>

      {activeRole === "INSTRUCTOR" ? <InstructorView /> : null}
      {activeRole === "DIRECTOR" || activeRole === "COORDINATOR" ? <ReviewView role={activeRole} /> : null}
      {activeRole !== "INSTRUCTOR" && activeRole !== "DIRECTOR" && activeRole !== "COORDINATOR" ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold">
            <AlertTriangle size={19} />
            当前角色暂无持续改进视图
          </h2>
        </section>
      ) : null}
    </section>
  )
}
