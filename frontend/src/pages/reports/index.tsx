import { Database, Download, FileText, FolderOpen, PencilLine, Plus, Save, Send, Sparkles, Trash2 } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ID, ReportDataSource, ReportDataSourceType, ReportSection, SelfEvaluationReport } from "@/models"
import {
  autoFillReport,
  createReport,
  createReportSection,
  deleteReport,
  deleteReportSection,
  exportReport,
  getMyReportSections,
  getReportDataSourceList,
  getReportList,
  getReportSectionList,
  saveReportDataSources,
  updateReport,
  updateReportSection,
  updateReportSectionStatus,
} from "@/services"
import { useBaseStore, useUiStore } from "@/stores"

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
const formatAssignee = (section?: ReportSection | null) => section?.assigneeName || (section?.assignedTo ? `用户 ${section.assignedTo}` : "-")

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
              <span className="text-xs font-semibold text-slate-500">负责人 {formatAssignee(section)}</span>
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

function DataSourceDialog({
  section,
  trigger,
  onSaved,
}: {
  section: ReportSection
  trigger: ReactNode
  onSaved: () => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [sources, setSources] = useState<ReportDataSource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    void getReportDataSourceList(section.id)
      .then((items) => setSources(items.length > 0 ? items : [{ sourceType: "ATTAINMENT", sourceKey: "", autoFillConfig: "{}" }]))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [open, section.id])

  const updateSource = (index: number, patch: Partial<ReportDataSource>) => {
    setSources((current) => current.map((source, currentIndex) => currentIndex === index ? { ...source, ...patch } : source))
  }

  const handleSave = async () => {
    const normalized = sources.map((source) => ({
      ...source,
      sourceKey: source.sourceKey.trim(),
      autoFillConfig: source.autoFillConfig.trim() || "{}",
    }))

    if (normalized.some((source) => !source.sourceKey)) {
      setError("请填写数据源标识")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await saveReportDataSources(section.id, normalized)
      await onSaved()
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存数据源失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-96px)] overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">章节数据源</DialogTitle>
          <DialogDescription>{section.sectionCode}. {section.title}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
          {sources.map((source, index) => (
            <article className="grid gap-3 rounded-lg border border-slate-200 p-3" key={`${source.id ?? "new"}-${index}`}>
              <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
                  value={source.sourceType}
                  onChange={(event) => updateSource(index, { sourceType: event.target.value as ReportDataSourceType })}
                >
                  <option value="ATTAINMENT">达成度</option>
                  <option value="SURVEY">问卷</option>
                  <option value="TABLE">数据表格</option>
                  <option value="CHART">图表</option>
                </select>
                <Input placeholder="数据源标识，如教学班ID或问卷ID" value={source.sourceKey} onChange={(event) => updateSource(index, { sourceKey: event.target.value })} />
                <Button
                  disabled={sources.length === 1}
                  onClick={() => setSources((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  type="button"
                  variant="outline"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <textarea
                className="min-h-24 rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 outline-none focus:border-blue-400"
                value={source.autoFillConfig}
                onChange={(event) => updateSource(index, { autoFillConfig: event.target.value })}
              />
            </article>
          ))}
          <Button onClick={() => setSources((current) => [...current, { sourceType: "ATTAINMENT", sourceKey: "", autoFillConfig: "{}" }])} type="button" variant="outline">
            <Plus size={16} />
            添加数据源
          </Button>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleSave} type="button">保存数据源</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReportManageDialog({
  report,
  trigger,
  onSaved,
}: {
  report?: SelfEvaluationReport | null
  trigger: ReactNode
  onSaved: (reportId?: ID) => Promise<void> | void
}) {
  const programSchemes = useBaseStore((state) => state.programSchemes)
  const fetchProgramSchemes = useBaseStore((state) => state.fetchProgramSchemes)
  const [open, setOpen] = useState(false)
  const [schemeId, setSchemeId] = useState<ID>(0)
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [status, setStatus] = useState<0 | 1 | 2 | 3>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    void fetchProgramSchemes()
  }, [fetchProgramSchemes, open])

  useEffect(() => {
    if (!open) return
    setError(null)
    setSchemeId(report?.schemeId ?? programSchemes[0]?.id ?? 0)
    setTitle(report?.title ?? "")
    setVersion(report?.version ?? "")
    setStatus((report?.status ?? 0) as 0 | 1 | 2 | 3)
  }, [open, programSchemes, report])

  const handleSave = async () => {
    if (!title.trim() || !version.trim() || !schemeId) {
      setError("请完整填写报告标题、版本和培养方案")
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (report) {
        await updateReport(report.id, { title: title.trim(), version: version.trim(), status })
        await onSaved(report.id)
      } else {
        const saved = await createReport({ schemeId, title: title.trim(), version: version.trim() })
        await onSaved(saved.id)
      }
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存报告失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{report ? "编辑报告" : "新建报告"}</DialogTitle>
          <DialogDescription>维护自评报告基础信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">培养方案</span>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
              disabled={Boolean(report)}
              onChange={(event) => setSchemeId(Number(event.target.value))}
              value={schemeId}
            >
              <option value={0}>请选择培养方案</option>
              {programSchemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>{scheme.versionName}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">报告标题</span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">版本</span>
              <Input value={version} onChange={(event) => setVersion(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">状态</span>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
                onChange={(event) => setStatus(Number(event.target.value) as 0 | 1 | 2 | 3)}
                value={status}
              >
                <option value={0}>编写中</option>
                <option value={1}>审核中</option>
                <option value={2}>已完成</option>
                <option value={3}>已归档</option>
              </select>
            </label>
          </div>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleSave} type="button">保存报告</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionManageDialog({
  reportId,
  section,
  trigger,
  onSaved,
}: {
  reportId?: ID | null
  section?: ReportSection | null
  trigger: ReactNode
  onSaved: (sectionId?: ID) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [sectionCode, setSectionCode] = useState("")
  const [title, setTitle] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [status, setStatus] = useState<0 | 1 | 2>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSectionCode(section?.sectionCode ?? "")
    setTitle(section?.title ?? "")
    setAssignedTo(section?.assignedTo ? String(section.assignedTo) : "")
    setStatus((section?.status ?? 0) as 0 | 1 | 2)
  }, [open, section])

  const handleSave = async () => {
    if (!sectionCode.trim() || !title.trim()) {
      setError("请填写章节编号和标题")
      return
    }
    if (!section && !reportId) {
      setError("请先选择报告")
      return
    }

    const payload = {
      sectionCode: sectionCode.trim(),
      title: title.trim(),
      content: section?.content ?? "",
      assignedTo: assignedTo.trim() ? Number(assignedTo) : undefined,
      status,
    }

    setLoading(true)
    setError(null)
    try {
      if (section) {
        await updateReportSection(section.id, payload)
        await onSaved(section.id)
      } else {
        const saved = await createReportSection(reportId as ID, payload)
        await onSaved(saved.id)
      }
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存章节失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{section ? "编辑章节" : "新建章节"}</DialogTitle>
          <DialogDescription>维护章节标题、负责人和状态。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">章节编号</span>
              <Input value={sectionCode} onChange={(event) => setSectionCode(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">章节标题</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">负责人ID</span>
              <Input type="number" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">章节状态</span>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
                onChange={(event) => setStatus(Number(event.target.value) as 0 | 1 | 2)}
                value={status}
              >
                <option value={0}>未开始</option>
                <option value={1}>编写中</option>
                <option value={2}>已完成</option>
              </select>
            </label>
          </div>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleSave} type="button">保存章节</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReportsPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [reports, setReports] = useState<SelfEvaluationReport[]>([])
  const [activeReportId, setActiveReportId] = useState<ID | null>(null)
  const [sections, setSections] = useState<ReportSection[]>([])
  const [activeSectionId, setActiveSectionId] = useState<ID | null>(null)
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
      setContentDraft("")
      return
    }

    setContentDraft(activeSection.content ?? "")
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

  const handleDeleteReport = async () => {
    if (!activeReport) return
    if (!window.confirm(`确认删除报告「${activeReport.title}」吗？`)) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await deleteReport(activeReport.id)
      const nextReports = await getReportList()
      setReports(nextReports)
      setActiveReportId(nextReports[0]?.id ?? null)
      setActiveSectionId(null)
      setMessage("报告已删除")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "删除报告失败")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async () => {
    if (!activeSection) return
    if (!window.confirm(`确认删除章节「${activeSection.sectionCode}. ${activeSection.title}」吗？`)) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await deleteReportSection(activeSection.id)
      await refreshSections()
      setActiveSectionId(null)
      setMessage("章节已删除")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "删除章节失败")
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
            <ReportManageDialog
              onSaved={async (reportId) => {
                const nextReports = await getReportList()
                setReports(nextReports)
                setActiveReportId(reportId ?? nextReports[0]?.id ?? null)
                setMessage("报告已保存")
              }}
              trigger={<Button className="bg-blue-700 text-white hover:bg-blue-800" type="button"><Plus size={16} />新建报告</Button>}
            />
          ) : null}
          {canDirectorAction && activeReport ? (
            <ReportManageDialog
              onSaved={async (reportId) => {
                const nextReports = await getReportList()
                setReports(nextReports)
                setActiveReportId(reportId ?? activeReport.id)
                setMessage("报告已保存")
              }}
              report={activeReport}
              trigger={<Button type="button" variant="outline"><PencilLine size={16} />编辑报告</Button>}
            />
          ) : null}
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
          {canDirectorAction && activeReport ? (
            <Button disabled={loading} onClick={handleDeleteReport} variant="outline" type="button">
              <Trash2 size={16} />
              删除报告
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
              <p className="mt-1 text-xs font-semibold text-slate-500">负责人 {formatAssignee(activeSection)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canDirectorAction ? (
                <SectionManageDialog
                  onSaved={async (sectionId) => {
                    await refreshSections()
                    setActiveSectionId(sectionId ?? null)
                    setMessage("章节已保存")
                  }}
                  reportId={activeReport?.id}
                  trigger={<Button disabled={!activeReport} type="button" variant="outline"><Plus size={16} />新建章节</Button>}
                />
              ) : null}
              {canDirectorAction && activeSection ? (
                <SectionManageDialog
                  onSaved={async (sectionId) => {
                    await refreshSections()
                    setActiveSectionId(sectionId ?? activeSection.id)
                    setMessage("章节已保存")
                  }}
                  reportId={activeReport?.id}
                  section={activeSection}
                  trigger={<Button type="button" variant="outline"><PencilLine size={16} />编辑章节</Button>}
                />
              ) : null}
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
              {canDirectorAction && activeSection ? (
                <Button disabled={loading} onClick={handleDeleteSection} variant="outline" type="button">
                  <Trash2 size={16} />
                  删除章节
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid flex-1 gap-5 overflow-y-auto p-6 2xl:grid-cols-[minmax(0,1fr)_260px]">
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
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-base font-extrabold text-slate-950">协作状态</h3>
                  {canDirectorAction && activeSection ? (
                    <DataSourceDialog
                      onSaved={async () => {
                        setMessage("章节数据源已保存")
                      }}
                      section={activeSection}
                      trigger={<Button size="sm" type="button" variant="outline"><Database size={15} />数据源</Button>}
                    />
                  ) : null}
                </div>
                <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                  <p className="m-0">章节状态: {activeSection ? statusMetaMap[activeSection.status].label : "-"}</p>
                  <p className="m-0">负责人: {formatAssignee(activeSection)}</p>
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
