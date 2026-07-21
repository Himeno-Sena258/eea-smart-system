import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
  UserRound,
} from "lucide-react"
import { Link } from "react-router-dom"
import { roleLabels } from "@/constants/role-options"
import type { DashboardStat, DashboardTodo, DashboardWarning, RoleCode, RoleDashboard } from "@/models"
import { getRoleDashboard } from "@/services"
import { useUiStore } from "@/stores"

type DashboardTone = "blue" | "green" | "amber" | "slate"

interface DashboardQuickLink {
  title: string
  description: string
  targetPath: string
  tone: DashboardTone
}

const quickLinksMap: Record<RoleCode, DashboardQuickLink[]> = {
  ADMIN: [
    { title: "用户与组织", description: "维护账号、角色与组织基础数据", targetPath: "/admin/users", tone: "blue" },
    { title: "个人中心", description: "查看当前登录账号信息", targetPath: "/profile", tone: "slate" },
  ],
  DIRECTOR: [
    { title: "培养方案", description: "查看培养方案与指标点体系", targetPath: "/program", tone: "blue" },
    { title: "达成度分析", description: "查看毕业要求达成情况", targetPath: "/attainment", tone: "green" },
    { title: "自评报告", description: "协同维护认证自评报告", targetPath: "/reports", tone: "amber" },
  ],
  COORDINATOR: [
    { title: "课程主数据", description: "查看课程目标与考核配置", targetPath: "/courses", tone: "blue" },
    { title: "教学班与成绩", description: "查看课程相关教学班数据", targetPath: "/teaching-classes", tone: "green" },
    { title: "持续改进", description: "跟踪课程改进记录", targetPath: "/improvements", tone: "amber" },
  ],
  INSTRUCTOR: [
    { title: "成绩录入", description: "进入教学班分项成绩网格", targetPath: "/teaching-classes", tone: "blue" },
    { title: "持续改进", description: "提交教学班改进分析", targetPath: "/improvements", tone: "amber" },
    { title: "达成度分析", description: "查看教学班 CO 达成度", targetPath: "/attainment", tone: "green" },
  ],
  STUDENT: [
    { title: "我的成绩", description: "查看课程总评和分项明细", targetPath: "/teaching-classes", tone: "blue" },
    { title: "问卷评价", description: "查看和填写开放问卷", targetPath: "/surveys", tone: "amber" },
    { title: "达成度分析", description: "查看个人毕业要求达成度", targetPath: "/attainment", tone: "green" },
  ],
}

const toneClassMap: Record<DashboardTone, { card: string; text: string }> = {
  blue: { card: "border-blue-200 bg-blue-50/70", text: "text-blue-700" },
  green: { card: "border-emerald-200 bg-emerald-50/70", text: "text-emerald-700" },
  amber: { card: "border-amber-200 bg-amber-50/80", text: "text-amber-700" },
  slate: { card: "border-slate-200 bg-white", text: "text-slate-700" },
}

const statToneList = [
  "border-blue-200 bg-blue-50 text-blue-800",
  "border-emerald-200 bg-emerald-50 text-emerald-800",
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-slate-200 bg-white text-slate-950",
]

const generatedTime = (value?: string) => value?.slice(0, 16).replace("T", " ") ?? "-"
const statDescriptionMap: Record<string, string> = {
  auditLogCount: "系统运行记录",
  courseCount: "课程范围",
  orgCount: "组织架构",
  passedCount: "学习进展",
  requirementCount: "毕业要求体系",
  roleCount: "权限配置",
  schemeCount: "方案建设",
  surveyProgress: "评价反馈",
  tcCount: "教学运行",
  userCount: "账号基础数据",
}
const priorityLabelMap: Record<string, string> = {
  HIGH: "高优先级",
  MEDIUM: "中优先级",
  LOW: "低优先级",
}
const todoTitle = (todo: DashboardTodo) => todo.label ?? todo.title ?? todo.id ?? "待办事项"
const todoMeta = (todo: DashboardTodo) => {
  if (todo.priority && priorityLabelMap[todo.priority]) return priorityLabelMap[todo.priority]
  return todo.type ?? "待处理"
}
const warningText = (warning: DashboardWarning) => warning.message ?? warning.title ?? warning.type ?? "预警提醒"
const warningLevelText = (level?: string) => level ? priorityLabelMap[level] ?? level : ""

function StatCard({ stat, index }: { stat: DashboardStat; index: number }) {
  return (
    <article className={`rounded-lg border p-4 ${statToneList[index % statToneList.length]}`}>
      <p className="m-0 text-sm font-bold opacity-80">{stat.label}</p>
      <strong className="mt-2 block text-3xl leading-none font-extrabold">
        {stat.value}
        {"unit" in stat && typeof stat.unit === "string" ? <span className="ml-1 text-base">{stat.unit}</span> : null}
      </strong>
      <p className="mt-3 text-xs font-semibold opacity-70">{stat.status ?? statDescriptionMap[stat.key] ?? "业务统计"}</p>
    </article>
  )
}

function TodoCard({ todo }: { todo: DashboardTodo }) {
  const body = (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-extrabold text-slate-950">{todoTitle(todo)}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">{todoMeta(todo)}</p>
        </div>
        {todo.count !== undefined || todo.progress !== undefined || todo.total !== undefined ? (
          <strong className="text-xl font-extrabold text-blue-700">
            {todo.count ?? todo.progress ?? ""}
            {todo.total !== undefined ? `/${todo.total}` : ""}
          </strong>
        ) : null}
      </div>
      {todo.progress !== undefined ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-700" style={{ width: `${Math.min(100, Math.max(0, todo.progress))}%` }} />
        </div>
      ) : null}
    </article>
  )

  if (!todo.targetPath) return body

  return (
    <Link className="block no-underline" to={todo.targetPath}>
      {body}
    </Link>
  )
}

export function DashboardPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [dashboard, setDashboard] = useState<RoleDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickLinks = quickLinksMap[activeRole]
  const rolesText = useMemo(() => dashboard?.roles?.join(" / ") || roleLabels[activeRole], [activeRole, dashboard?.roles])
  const stats = dashboard?.stats ?? []
  const todos = dashboard?.todos ?? []
  const warnings = dashboard?.warnings ?? []

  useEffect(() => {
    setLoading(true)
    setError(null)
    void getRoleDashboard(activeRole)
      .then(setDashboard)
      .catch((requestError: Error) => {
        setDashboard(null)
        setError(requestError.message)
      })
      .finally(() => setLoading(false))
  }, [activeRole])

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid max-w-4xl gap-2.5">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <LayoutDashboard size={16} />
            角色工作台
          </p>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            {dashboard?.title ?? roleLabels[activeRole]}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
            <UserRound size={13} />
            {rolesText}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
            <Clock3 size={13} />
            {generatedTime(dashboard?.generatedAt)}
          </span>
          {loading ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
              <RefreshCw size={13} className="animate-spin" />
              加载中
            </span>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}
      {dashboard?.notice ? (
        <p className="m-0 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-bold text-blue-700">{dashboard.notice}</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {stats.length > 0 ? (
          stats.map((stat, index) => <StatCard key={stat.key} stat={stat} index={index} />)
        ) : (
          <article className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-400">
            {loading ? "正在读取工作台数据..." : "暂无统计数据"}
          </article>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <ListChecks size={19} className="text-blue-700" />
            待办事项
          </h2>
          <div className="mt-4 grid gap-3">
            {todos.length > 0 ? (
              todos.map((todo) => <TodoCard key={todo.id ?? `${todo.type}-${todo.title}-${todo.label}`} todo={todo} />)
            ) : (
              <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-400">
                当前暂无待办事项
              </p>
            )}
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <Bell size={19} className="text-amber-600" />
              预警提醒
            </h2>
            <div className="mt-4 grid gap-2">
              {warnings.length > 0 ? warnings.map((warning) => (
                <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" key={`${warning.type}-${warningText(warning)}`}>
                  {warningLevelText(warning.level) ? `${warningLevelText(warning.level)} / ` : ""}{warningText(warning)}
                </p>
              )) : (
                <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="mr-1 inline" size={16} />
                  当前暂无预警事项
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="m-0 text-lg font-extrabold text-slate-950">快捷入口</h2>
            <div className="mt-4 grid gap-2">
              {quickLinks.map((link) => {
                const tone = toneClassMap[link.tone]

                return (
                  <Link
                    className={`group rounded-lg border p-3 no-underline transition hover:border-blue-200 hover:bg-blue-50 ${tone.card}`}
                    key={link.title}
                    to={link.targetPath}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`m-0 text-sm font-extrabold ${tone.text}`}>{link.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{link.description}</p>
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-blue-600" size={16} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}
