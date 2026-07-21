import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Database,
  Info,
  LayoutDashboard,
  ShieldAlert,
  UserRound,
} from "lucide-react"
import { Link } from "react-router-dom"
import { roleLabels } from "@/constants/role-options"
import type { RoleCode, RoleDashboard } from "@/models"
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
    { title: "个人中心", description: "查看授课教师账号信息", targetPath: "/profile", tone: "slate" },
  ],
  STUDENT: [
    { title: "我的成绩", description: "查看课程总评和分项明细", targetPath: "/teaching-classes", tone: "blue" },
    { title: "问卷评价", description: "查看和填写开放问卷", targetPath: "/surveys", tone: "amber" },
    { title: "个人中心", description: "查看学生账号信息", targetPath: "/profile", tone: "slate" },
  ],
}

const supportedFieldTextMap: Record<RoleCode, string[]> = {
  ADMIN: ["title", "userId", "roles", "notice"],
  DIRECTOR: ["title", "userId", "roles"],
  COORDINATOR: ["title", "userId", "roles"],
  INSTRUCTOR: ["title", "userId", "roles"],
  STUDENT: ["title", "userId", "roles"],
}

const pendingFieldTextMap: Record<RoleCode, string[]> = {
  ADMIN: ["用户总数", "组织机构数", "系统运行状态", "审计摘要"],
  DIRECTOR: ["培养方案统计", "毕业要求达成概览", "报告进度", "专业级预警"],
  COORDINATOR: ["课程大纲审核状态", "课程目标绑定分布", "课程级预警", "教学班横向对比"],
  INSTRUCTOR: ["授课教学班列表摘要", "成绩录入进度", "材料归档进度", "班级预警"],
  STUDENT: ["个人课程达成度", "毕业要求指标点达成图", "待填问卷", "学习预警"],
}

const toneClassMap: Record<DashboardTone, { card: string; text: string; badge: string }> = {
  blue: {
    card: "border-blue-200 bg-blue-50/70",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    card: "border-emerald-200 bg-emerald-50/70",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/80",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  slate: {
    card: "border-slate-200 bg-white",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700",
  },
}

export function DashboardPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [dashboard, setDashboard] = useState<RoleDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickLinks = quickLinksMap[activeRole]
  const rolesText = useMemo(() => dashboard?.roles?.join(" / ") || "-", [dashboard?.roles])

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
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              {dashboard?.title ?? roleLabels[activeRole]}
            </h1>
          </div>
        </div>
      </header>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        <article className="rounded-lg border border-blue-200 bg-blue-50/70 p-5">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-blue-700">
            <UserRound size={16} />
            当前用户ID
          </p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">
            {loading ? "..." : dashboard?.userId ?? "-"}
          </strong>
          <p className="mt-3 text-xs font-semibold text-slate-500">来自后端 dashboard 接口</p>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-5">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <BadgeCheck size={16} />
            当前角色
          </p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">
            {roleLabels[activeRole]}
          </strong>
          <p className="mt-3 text-xs font-semibold text-slate-500">{rolesText}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Database size={16} />
            已返回字段
          </p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-slate-950">
            {supportedFieldTextMap[activeRole].length}
          </strong>
          <p className="mt-3 text-xs font-semibold text-slate-500">
            {supportedFieldTextMap[activeRole].join(" / ")}
          </p>
        </article>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <Info size={19} className="text-blue-700" />
                后端已支持数据
              </h2>
              <p className="mt-1 text-sm text-slate-500">当前只展示后端真实返回字段，不再使用 mock 统计。</p>
            </div>
          </div>

          <div className="grid gap-3">
            {supportedFieldTextMap[activeRole].map((field) => (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={field}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-base font-extrabold text-slate-950">{field}</h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    已接入
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-amber-800">
              <ShieldAlert size={19} />
              待后端补充
            </h2>
            <div className="mt-4 grid gap-2">
              {pendingFieldTextMap[activeRole].map((item) => (
                <p className="m-0 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="m-0 text-lg font-extrabold text-slate-950">快捷入口</h2>
            <div className="mt-4 grid gap-2">
              {quickLinks.map((link) => {
                const tone = toneClassMap[link.tone]

                return (
                  <Link
                    className="group rounded-lg border border-slate-200 p-3 no-underline transition hover:border-blue-200 hover:bg-blue-50"
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
