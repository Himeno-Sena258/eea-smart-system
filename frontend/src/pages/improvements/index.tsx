import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw, Send, Sparkles, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { roleLabels } from "@/constants/role-options"
import { formatCourseObjectiveLabel } from "@/lib/course-objective-label"
import type { ContinuousImprovement, ID, TeacherClass, TeacherCoAttainment, TeachingImprovement } from "@/models"
import {
  generateImprovement,
  getCoordinatorImprovementList,
  getDirectorImprovementList,
  getImprovementList,
  getTeacherClassList,
  getTeacherCoAttainmentList,
  getTeacherImprovementList,
  reviewImprovement,
  saveTeacherImprovement,
} from "@/services"
import { useUiStore } from "@/stores"

type ClassOption = {
  id: ID
  label: string
  courseName?: string
  semester?: string
}

type DisplayRecord = {
  id: ID
  className: string
  courseName?: string
  teacherName?: string
  lowAttainmentCos?: string
  problemAnalysis: string
  improvementMeasures: string
  creatorName?: string
  createdBy?: ID
  createdAt?: string
  status?: number
  reviewedBy?: ID
  reviewerName?: string
  reviewedAt?: string
  reviewerComment?: string
  cycleLabel?: string
  followUpAt?: string
  followUpResult?: string
}

const toClassOptionFromTeacher = (item: TeacherClass): ClassOption => ({
  id: item.classId,
  label: `${item.courseName} / ${item.className}`,
  courseName: item.courseName,
  semester: item.semester,
})

const normalizeTeacherRecord = (record: TeachingImprovement): DisplayRecord => ({
  id: record.id,
  className: record.className,
  lowAttainmentCos: record.lowAttainmentCos,
  problemAnalysis: record.problemAnalysis,
  improvementMeasures: record.improvementMeasures,
  creatorName: record.creatorName,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
})

const normalizeCommonRecord = (record: ContinuousImprovement, className: string): DisplayRecord => ({
  id: record.id,
  className: record.teachingClassName ?? className,
  courseName: record.courseName,
  teacherName: record.teacherName,
  lowAttainmentCos: record.lowAttainmentCos,
  problemAnalysis: record.problemAnalysis,
  improvementMeasures: record.improvementMeasures,
  creatorName: record.creatorName,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  status: record.status,
  reviewedBy: record.reviewedBy,
  reviewerName: record.reviewerName,
  reviewedAt: record.reviewedAt,
  reviewerComment: record.reviewerComment,
  cycleLabel: record.cycleLabel,
  followUpAt: record.followUpAt,
  followUpResult: record.followUpResult,
})

const formatDate = (value?: string) => value?.slice(0, 16).replace("T", " ") ?? "-"
const improvementStatusLabels: Record<number, string> = {
  0: "待审核",
  1: "审核通过",
  2: "需修改",
}

function ReviewDialog({
  record,
  onReviewed,
}: {
  record: DisplayRecord
  onReviewed: () => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<number>(record.status ?? 1)
  const [comment, setComment] = useState(record.reviewerComment ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      await reviewImprovement(record.id, {
        status,
        reviewerComment: comment.trim() || undefined,
      })
      await onReviewed()
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "审核失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">审核记录</Button>
      </DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">审核持续改进记录</DialogTitle>
          <DialogDescription>{record.courseName ? `${record.courseName} / ${record.className}` : record.className}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">审核结果</span>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
              onChange={(event) => setStatus(Number(event.target.value))}
              value={status}
            >
              <option value={1}>审核通过</option>
              <option value={2}>需修改</option>
              <option value={0}>待审核</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">审核意见</span>
            <textarea
              className="min-h-28 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
              onChange={(event) => setComment(event.target.value)}
              value={comment}
            />
          </label>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleSubmit} type="button">
            提交审核
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RecordCard({ record, onReviewed }: { record: DisplayRecord; onReviewed?: () => Promise<void> | void }) {
  const statusLabel = record.status === undefined ? "已提交" : improvementStatusLabels[record.status] ?? `状态 ${record.status}`
  const classTitle = record.courseName ? `${record.courseName} / ${record.className}` : record.className

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-700">
            {statusLabel}
          </span>
          <h3 className="mt-2 text-base font-extrabold text-slate-950">{classTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {record.creatorName ?? (record.createdBy ? `教师ID ${record.createdBy}` : "提交人 -")} / {formatDate(record.createdAt)}
          </p>
          {record.teacherName ? (
            <p className="mt-1 text-xs font-bold text-slate-400">任课教师：{record.teacherName}</p>
          ) : null}
        </div>
        {record.lowAttainmentCos ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-right text-red-700">
            <p className="m-0 text-xs font-extrabold">低达成目标</p>
            <strong className="mt-1 block text-sm leading-none">{record.lowAttainmentCos}</strong>
          </div>
        ) : null}
        {onReviewed ? <ReviewDialog record={record} onReviewed={onReviewed} /> : null}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="m-0 text-xs font-extrabold text-slate-400">问题归因分析</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{record.problemAnalysis}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="m-0 text-xs font-extrabold text-slate-400">下一轮改进措施</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{record.improvementMeasures}</p>
        </div>
      </div>
      {(record.reviewedAt || record.reviewerComment || record.followUpResult) ? (
        <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 md:grid-cols-3">
          <p className="m-0">
            <span className="font-extrabold text-slate-400">审核人：</span>
            {record.reviewerName ?? (record.reviewedBy ? `用户 ${record.reviewedBy}` : "-")}
          </p>
          <p className="m-0">
            <span className="font-extrabold text-slate-400">审核时间：</span>
            {formatDate(record.reviewedAt)}
          </p>
          <p className="m-0">
            <span className="font-extrabold text-slate-400">跟踪时间：</span>
            {formatDate(record.followUpAt)}
          </p>
          {record.reviewerComment ? (
            <p className="m-0 md:col-span-3">
              <span className="font-extrabold text-slate-400">审核意见：</span>
              {record.reviewerComment}
            </p>
          ) : null}
          {record.followUpResult ? (
            <p className="m-0 md:col-span-3">
              <span className="font-extrabold text-slate-400">跟踪结果：</span>
              {record.followUpResult}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export function ImprovementsPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [selectedClassId, setSelectedClassId] = useState<ID | null>(null)
  const [records, setRecords] = useState<DisplayRecord[]>([])
  const [lowAttainments, setLowAttainments] = useState<TeacherCoAttainment[]>([])
  const [problemAnalysis, setProblemAnalysis] = useState("")
  const [improvementMeasures, setImprovementMeasures] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedClass = classOptions.find((item) => item.id === selectedClassId) ?? classOptions[0] ?? null
  const canEdit = activeRole === "INSTRUCTOR"
  const canReviewAggregate = activeRole === "DIRECTOR" || activeRole === "COORDINATOR"
  const isSupported = canEdit || canReviewAggregate
  const lowCos = useMemo(
    () => lowAttainments
      .filter((item) => Number(item.attainmentVal ?? 0) < Number(item.warningThreshold ?? 0.68))
      .map((item) => formatCourseObjectiveLabel({
        objectiveCode: item.coCode,
        content: item.indicatorPointContent,
      }, { maxLength: 16 }))
      .join(", "),
    [lowAttainments],
  )

  const refreshAggregateRecords = async () => {
    const data = activeRole === "DIRECTOR" ? await getDirectorImprovementList() : await getCoordinatorImprovementList()
    setRecords(data.map((record) => normalizeCommonRecord(record, `教学班 ${record.teachingClassId}`)))
  }

  const refreshRecords = async (classOption: ClassOption) => {
    if (canEdit) {
      const data = await getTeacherImprovementList(classOption.id)
      setRecords(data.map(normalizeTeacherRecord))
      const latest = data[0]
      setProblemAnalysis(latest?.problemAnalysis ?? "")
      setImprovementMeasures(latest?.improvementMeasures ?? "")
      return
    }

    const data = await getImprovementList(classOption.id)
    setRecords(data.map((record) => normalizeCommonRecord(record, classOption.label)))
  }

  useEffect(() => {
    setError(null)
    setMessage(null)
    setRecords([])
    setLowAttainments([])
    setProblemAnalysis("")
    setImprovementMeasures("")
    setClassOptions([])
    setSelectedClassId(null)

    if (!isSupported) return

    setLoading(true)
    if (canReviewAggregate) {
      void refreshAggregateRecords()
        .catch((requestError: Error) => setError(requestError.message))
        .finally(() => setLoading(false))
      return
    }

    void getTeacherClassList().then((data) => data.map(toClassOptionFromTeacher))
      .then((options) => {
        setClassOptions(options)
        setSelectedClassId(options[0]?.id ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeRole, canEdit, canReviewAggregate, isSupported])

  useEffect(() => {
    if (!selectedClass || !isSupported || canReviewAggregate) return

    setLoading(true)
    setError(null)
    void refreshRecords(selectedClass)
      .then(async () => {
        if (canEdit) {
          const attainments = await getTeacherCoAttainmentList(selectedClass.id)
          setLowAttainments(attainments)
        }
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [selectedClass, canEdit, canReviewAggregate, isSupported])

  const handleGenerateDraft = async () => {
    if (!selectedClass) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const draft = await generateImprovement(selectedClass.id)
      setProblemAnalysis(draft.suggestedAnalysis)
      setMessage("已根据低达成课程目标生成草稿")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "生成草稿失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedClass) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const submitMessage = await saveTeacherImprovement(selectedClass.id, {
        lowAttainmentCos: lowCos || "无低于 0.680 的目标",
        problemAnalysis,
        improvementMeasures,
      })
      await refreshRecords(selectedClass)
      setMessage(submitMessage)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交改进记录失败")
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold">
          <AlertTriangle size={19} />
          当前角色暂无持续改进接口
        </h2>
        <p className="mt-2 text-sm leading-6 font-semibold">
          {roleLabels[activeRole]} 暂无持续改进接口。
        </p>
      </section>
    )
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <RefreshCw size={16} />
            持续改进
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              {canEdit ? "班级教学改进任务单" : "持续改进记录"}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">{roleLabels[activeRole]}</span>
          {loading ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <RefreshCw size={12} className="animate-spin" />
              加载中
            </span>
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
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-slate-500">
            <ClipboardList size={16} />
            教学班
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-slate-950">
            {canEdit ? classOptions.length : new Set(records.map((record) => record.className)).size}
          </strong>
        </article>
        <article className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-red-700">
            <TrendingUp size={16} />
            低达成课程目标
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-red-700">{lowCos || "-"}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={16} />
            改进记录
          </p>
          <strong className="mt-2 block text-lg font-extrabold text-emerald-800">{records.length}</strong>
        </article>
      </section>

      {canEdit && classOptions.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {classOptions.map((item) => (
            <button
              className={
                item.id === selectedClass?.id
                  ? "rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-extrabold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
              }
              key={item.id}
              onClick={() => setSelectedClassId(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </section>
      ) : null}

      {canEdit ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="relative overflow-hidden rounded-lg border border-red-200 bg-white p-4 shadow-sm">
            <div className="absolute top-0 left-0 h-full w-1 bg-red-500" />
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
              教学改进任务单
            </span>
            <h2 className="mt-3 text-base font-extrabold text-slate-950">
              {selectedClass?.label ?? "请选择教学班"}
            </h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-sm font-extrabold text-slate-700">问题归因分析</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                  onChange={(event) => setProblemAnalysis(event.target.value)}
                  value={problemAnalysis}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-extrabold text-slate-700">下一轮改进措施</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                  onChange={(event) => setImprovementMeasures(event.target.value)}
                  value={improvementMeasures}
                />
              </label>
              <div className="flex flex-wrap justify-end gap-2">
                <Button disabled={loading || !selectedClass} onClick={handleGenerateDraft} variant="outline" type="button">
                  <Sparkles size={16} />
                  生成草稿
                </Button>
                <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !selectedClass} onClick={handleSubmit} type="button">
                  <Send size={16} />
                  提交报告
                </Button>
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="m-0 text-sm font-bold text-red-700">低达成目标</p>
              <strong className="mt-2 block text-xl leading-none font-extrabold text-red-700">{lowCos || "无"}</strong>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <h3 className="m-0 text-base font-extrabold text-slate-950">历史记录</h3>
              <div className="mt-3 grid gap-2">
                {records.length > 0 ? records.map((record) => (
                  <div className="rounded-lg border border-slate-200 p-2.5" key={record.id}>
                    <p className="m-0 text-sm font-extrabold text-slate-800">{record.className}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(record.createdAt)}</p>
                  </div>
                )) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">当前教学班暂无改进记录。</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {canReviewAggregate ? (
        <section className="grid gap-3">
          {records.length > 0 ? records.map((record) => (
            <RecordCard
              key={record.id}
              onReviewed={async () => {
                await refreshAggregateRecords()
                setMessage("审核结果已保存")
              }}
              record={record}
            />
          )) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-400">
              当前教学班暂无持续改进记录。
            </div>
          )}
        </section>
      ) : null}
    </section>
  )
}
