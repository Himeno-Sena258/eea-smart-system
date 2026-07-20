import { Download, FileText, FolderOpen, Save, Send, Sparkles, UsersRound } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useUiStore } from "@/stores"
import { reportDataSourcesMock, reportMock, reportSectionsMock, type ReportSectionMock } from "./mock/reports-mock"

const statusMetaMap = {
  0: { label: "未开始", className: "bg-slate-100 text-slate-600" },
  1: { label: "编写中", className: "bg-blue-100 text-blue-700" },
  2: { label: "已完成", className: "bg-emerald-100 text-emerald-700" },
} as const

const reportStatusMap = {
  0: "草稿",
  1: "编写中",
  2: "待审核",
  3: "已归档",
} as const

function SectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: ReportSectionMock[]
  activeId: number
  onSelect: (id: number) => void
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="m-0 flex items-center gap-2 text-base font-extrabold text-slate-950">
        <FolderOpen size={18} className="text-blue-700" />
        报告目录
      </h2>
      <div className="mt-4 grid max-h-[520px] gap-1 overflow-y-auto pr-1">
        {sections.map((section) => {
          const status = statusMetaMap[section.status]
          const active = section.id === activeId

          return (
            <button
              className={[
                "grid gap-1 rounded-lg p-2.5 text-left transition",
                active ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50",
              ].join(" ")}
              key={section.id}
              onClick={() => onSelect(Number(section.id))}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold">{section.sectionCode}. {section.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">负责人: {section.assigneeName}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export function ReportsPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [activeSectionId, setActiveSectionId] = useState(Number(reportSectionsMock[2].id))
  const activeSection = useMemo(
    () => reportSectionsMock.find((section) => section.id === activeSectionId) ?? reportSectionsMock[0],
    [activeSectionId],
  )
  const currentSources = reportDataSourcesMock.filter((source) => source.sectionId === activeSection.id)
  const completedCount = reportSectionsMock.filter((section) => section.status === 2).length
  const canManage = activeRole === "DIRECTOR"
  const canEdit = activeRole === "DIRECTOR" || activeRole === "INSTRUCTOR"

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <FileText size={16} />
            自评报告协同
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              {reportMock.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              章节分派、协同编辑、数据源自动填充与报告导出统一入口。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <Button variant="outline" type="button">
              <UsersRound size={16} />
              章节分派
            </Button>
          ) : null}
          <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
            <Download size={16} />
            导出报告
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">报告状态</p>
          <strong className="mt-2 block text-xl font-extrabold text-blue-800">{reportStatusMap[reportMock.status]}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">完成章节</p>
          <strong className="mt-2 block text-xl font-extrabold text-emerald-800">{completedCount}/{reportSectionsMock.length}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 text-sm font-bold text-slate-500">更新时间</p>
          <strong className="mt-2 block text-xl font-extrabold text-slate-950">{reportMock.updatedAt.slice(0, 10)}</strong>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <SectionNav sections={reportSectionsMock} activeId={activeSectionId} onSelect={setActiveSectionId} />

        <section className="flex min-h-[620px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="m-0 text-sm font-extrabold text-slate-600">
                正在编辑: {activeSection.sectionCode}. {activeSection.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">负责人: {activeSection.assigneeName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canEdit ? (
                <Button variant="outline" type="button">
                  <Sparkles size={16} />
                  自动插入数据图表
                </Button>
              ) : null}
              {canEdit ? (
                <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
                  <Save size={16} />
                  保存章节
                </Button>
              ) : null}
              {canEdit ? (
                <Button variant="outline" type="button">
                  <Send size={16} />
                  标记完成
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid flex-1 gap-5 overflow-y-auto p-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
            <article className="mx-auto w-full max-w-3xl">
              <h2 className="text-center text-2xl font-extrabold text-slate-950">
                {activeSection.sectionCode}. {activeSection.title}
              </h2>
              <textarea
                className="mt-6 min-h-[260px] w-full resize-y rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                defaultValue={activeSection.content}
                readOnly={!canEdit}
              />
              <div className="my-5 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center text-blue-600">
                <Sparkles className="mx-auto mb-2" size={28} />
                此处可链接系统数据图表，导出时自动生成
              </div>
            </article>

            <aside className="grid content-start gap-4">
              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="m-0 text-base font-extrabold text-slate-950">数据源</h3>
                <div className="mt-3 grid gap-2">
                  {currentSources.length > 0 ? currentSources.map((source) => (
                    <div className="rounded-lg bg-slate-50 p-3" key={`${source.sourceType}-${source.sourceKey}`}>
                      <p className="m-0 text-sm font-extrabold text-blue-700">{source.sourceType}</p>
                      <p className="mt-1 text-xs text-slate-500">{String(source.autoFillConfig.title ?? source.sourceKey)}</p>
                    </div>
                  )) : (
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">当前章节暂无绑定数据源。</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="m-0 text-base font-extrabold text-slate-950">协作状态</h3>
                <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                  <p className="m-0">章节状态: {statusMetaMap[activeSection.status].label}</p>
                  <p className="m-0">最近更新: {activeSection.updatedAt}</p>
                  <p className="m-0">报告版本: {reportMock.version}</p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </section>
  )
}
