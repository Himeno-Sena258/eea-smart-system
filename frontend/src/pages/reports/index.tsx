import { Download, FileText, FolderOpen, Save, Send, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import type { ID, ReportDataSource, ReportSection, SelfEvaluationReport } from "@/models"
import {
  autoFillReport,
  exportReport,
  getMyReportSections,
  getReportDataSourceList,
  getReportList,
  getReportSectionList,
  updateReportSection,
  updateReportSectionStatus,
} from "@/services"
import { useUiStore } from "@/stores"

const statusMetaMap = {
  0: { label: "未开始", className: "bg-slate-100 text-slate-600" },
  1: { label: "编写中", className: "bg-blue-100 text-blue-700" },
  2: { label: "已完成", className: "bg-emerald-100 text-emerald-700" },
} as const

const reportStatusMap = {
  0: "编写中",
  1: "审核中",
  2: "已完成",
  3: "已归档",
} as const

const formatDate = (value?: string) => value?.slice(0, 10) ?? "-"

function SectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: ReportSection[]
  activeId: ID | null
  onSelect: (id: ID) => void
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
              onClick={() => onSelect(section.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold">
                  {section.sectionCode}. {section.title}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">负责人ID {section.assignedTo ?? "-"}</span>
            </button>
          )
        })}
        {sections.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
            暂无章节
          </p>
        ) : null}
      </div>
    </aside>
  )
}

export function ReportsPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [reports, setReports] = useState<SelfEvaluationReport[]>([])
  const [activeReportId, setActiveReportId] = useState<ID | null>(null)
  const [sections, setSections] = useState<ReportSection[]>([])
  const [activeSectionId, setActiveSectionId] = useState<ID | null>(null)
  const [dataSources, setDataSources] = useState<ReportDataSource[]>([])
  const [contentDraft, setContentDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const canListReports = activeRole === "DIRECTOR" || activeRole === "ADMIN"
  const canEdit = activeRole === "DIRECTOR" || activeRole === "INSTRUCTOR"
  const canDirectorAction = activeRole === "DIRECTOR"
  const isTeacherView = activeRole === "INSTRUCTOR"

  const activeReport = useMemo(
    () => reports.find((report) => report.id === activeReportId) ?? reports[0] ?? null,
    [activeReportId, reports],
  )
  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0] ?? null,
    [activeSectionId, sections],
  )
  const completedCount = sections.filter((section) => section.status === 2).length

  useEffect(() => {
    if (!canListReports) return

    setLoading(true)
    setError(null)
    void getReportList()
      .then((data) => {
        setReports(data)
        setActiveReportId((current) => current ?? data[0]?.id ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [canListReports])

  useEffect(() => {
    if (!isTeacherView) return

    setLoading(true)
    setError(null)
    setReports([])
    setActiveReportId(null)
    void getMyReportSections()
      .then((data) => {
        setSections(data)
        setActiveSectionId((current) => current ?? data[0]?.id ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [isTeacherView])

  useEffect(() => {
    if (isTeacherView) return
    if (!activeReport) {
      setSections([])
      return
    }

    setLoading(true)
    setError(null)
    void getReportSectionList(activeReport.id)
      .then((data) => {
        setSections(data)
        setActiveSectionId((current) => current ?? data[0]?.id ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeReport, isTeacherView])

  useEffect(() => {
    if (!activeSection) {
      setDataSources([])
      setContentDraft("")
      return
    }

    setContentDraft(activeSection.content ?? "")
    void getReportDataSourceList(activeSection.id)
      .then(setDataSources)
      .catch((requestError: Error) => setError(requestError.message))
  }, [activeSection])

  const refreshSections = async () => {
    if (isTeacherView) {
      const nextSections = await getMyReportSections()
      setSections(nextSections)
      return
    }

    if (!activeReport) return
    const nextSections = await getReportSectionList(activeReport.id)
    setSections(nextSections)
  }

  const handleSaveSection = async () => {
    if (!activeSection) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await updateReportSection(activeSection.id, {
        sectionCode: activeSection.sectionCode,
        title: activeSection.title,
        content: contentDraft,
        assignedTo: activeSection.assignedTo,
        status: activeSection.status,
      })
      await refreshSections()
      setMessage("章节已保存")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存章节失败")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSection = async () => {
    if (!activeSection) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await updateReportSectionStatus(activeSection.id, { status: 2 })
      await refreshSections()
      setMessage("章节已标记完成")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "更新章节状态失败")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoFill = async () => {
    if (!activeReport) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const result = await autoFillReport(activeReport.id)
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "自动填充失败")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!activeReport) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const blob = await exportReport(activeReport.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${activeReport.title || "self-evaluation-report"}.docx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setMessage("自评报告已开始下载")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "导出失败")
    } finally {
      setLoading(false)
    }
  }

  if (!canListReports && !isTeacherView) {
    return (
      <section className="grid gap-5">
        <header className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <FileText size={16} />
            自评报告协同
          </p>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">自评报告</h1>
        </header>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 font-semibold text-amber-800">
          当前角色没有自评报告协同接口，暂不能接入真实服务。
        </section>
      </section>
    )
  }

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
              {isTeacherView ? "我的分配章节" : activeReport?.title ?? "暂无自评报告"}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canDirectorAction ? (
            <Button disabled={loading || !activeReport} onClick={handleAutoFill} variant="outline" type="button">
              <Sparkles size={16} />
              自动填充
            </Button>
          ) : null}
          {canDirectorAction ? (
            <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !activeReport} onClick={handleExport} type="button">
              <Download size={16} />
              导出预览
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">报告状态</p>
          <strong className="mt-2 block text-xl font-extrabold text-blue-800">
            {activeReport ? reportStatusMap[activeReport.status] : "-"}
          </strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">完成章节</p>
          <strong className="mt-2 block text-xl font-extrabold text-emerald-800">
            {completedCount}/{sections.length}
          </strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 text-sm font-bold text-slate-500">更新时间</p>
          <strong className="mt-2 block text-xl font-extrabold text-slate-950">{formatDate(activeReport?.updatedAt)}</strong>
        </article>
      </section>

      {reports.length > 1 ? (
        <section className="flex flex-wrap gap-2">
          {reports.map((report) => (
            <button
              className={
                report.id === activeReport?.id
                  ? "rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-extrabold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
              }
              key={report.id}
              onClick={() => {
                setActiveReportId(report.id)
                setActiveSectionId(null)
              }}
              type="button"
            >
              {report.version}
            </button>
          ))}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <SectionNav sections={sections} activeId={activeSection?.id ?? null} onSelect={setActiveSectionId} />

        <section className="flex min-h-[620px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="m-0 text-sm font-extrabold text-slate-600">
                正在编辑: {activeSection ? `${activeSection.sectionCode}. ${activeSection.title}` : "未选择章节"}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">负责人ID {activeSection?.assignedTo ?? "-"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canEdit ? (
                <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !activeSection} onClick={handleSaveSection} type="button">
                  <Save size={16} />
                  保存章节
                </Button>
              ) : null}
              {canEdit ? (
                <Button disabled={loading || !activeSection} onClick={handleCompleteSection} variant="outline" type="button">
                  <Send size={16} />
                  标记完成
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid flex-1 gap-5 overflow-y-auto p-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
            <article className="mx-auto w-full max-w-3xl">
              <h2 className="text-center text-2xl font-extrabold text-slate-950">
                {activeSection ? `${activeSection.sectionCode}. ${activeSection.title}` : "暂无章节"}
              </h2>
              {activeSection?.reportTitle ? (
                <p className="mt-2 text-center text-sm font-semibold text-slate-500">{activeSection.reportTitle}</p>
              ) : null}
              <textarea
                className="mt-6 min-h-[260px] w-full resize-y rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                onChange={(event) => setContentDraft(event.target.value)}
                readOnly={!canEdit || !activeSection}
                value={contentDraft}
              />
            </article>

            <aside className="grid content-start gap-4">
              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="m-0 text-base font-extrabold text-slate-950">数据源</h3>
                <div className="mt-3 grid gap-2">
                  {dataSources.length > 0 ? (
                    dataSources.map((source) => (
                      <div className="rounded-lg bg-slate-50 p-3" key={`${source.sourceType}-${source.sourceKey}`}>
                        <p className="m-0 text-sm font-extrabold text-blue-700">{source.sourceType}</p>
                        <p className="mt-1 text-xs break-all text-slate-500">{source.sourceKey}</p>
                        {source.autoFillConfig ? (
                          <pre className="mt-2 max-h-24 overflow-auto rounded bg-white p-2 text-[11px] leading-4 text-slate-500">
                            {source.autoFillConfig}
                          </pre>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">当前章节暂无绑定数据源。</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="m-0 text-base font-extrabold text-slate-950">协作状态</h3>
                <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                  <p className="m-0">章节状态: {activeSection ? statusMetaMap[activeSection.status].label : "-"}</p>
                  <p className="m-0">最近更新: {formatDate(activeSection?.updatedAt)}</p>
                  <p className="m-0">报告版本: {activeReport?.version ?? "-"}</p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </section>
  )
}
