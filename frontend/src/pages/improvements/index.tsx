import { AlertTriangle, CheckCircle2, ClipboardList, FileText, RefreshCw, Send, Sparkles, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { roleLabels } from "@/constants/role-options"
import type { ContinuousImprovement, ID, TeacherClass, TeacherCoAttainment, TeachingClass, TeachingImprovement } from "@/models"
import {
  generateImprovement,
  getImprovementList,
  getTeacherClassList,
  getTeacherCoAttainmentList,
  getTeacherImprovementList,
  getTeachingClassPage,
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
  lowAttainmentCos?: string
  problemAnalysis: string
  improvementMeasures: string
  creatorName?: string
  createdBy?: ID
  createdAt?: string
}

const toClassOptionFromTeacher = (item: TeacherClass): ClassOption => ({
  id: item.classId,
  label: `${item.courseName} / ${item.className}`,
  courseName: item.courseName,
  semester: item.semester,
})

const toClassOptionFromCommon = (item: TeachingClass): ClassOption => ({
  id: item.id,
  label: `${item.courseName ?? `课程 ${item.courseId}`} / ${item.className}`,
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
  className,
  problemAnalysis: record.problemAnalysis,
  improvementMeasures: record.improvementMeasures,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
})

const formatDate = (value?: string) => value?.slice(0, 16).replace("T", " ") ?? "-"

function RecordCard({ record }: { record: DisplayRecord }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-700">
            已提交
          </span>
          <h3 className="mt-2 text-base font-extrabold text-slate-950">{record.className}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {record.creatorName ?? (record.createdBy ? `教师ID ${record.createdBy}` : "提交人 -")} / {formatDate(record.createdAt)}
          </p>
        </div>
        {record.lowAttainmentCos ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-right text-red-700">
            <p className="m-0 text-xs font-extrabold">低达成目标</p>
            <strong className="mt-1 block text-sm leading-none">{record.lowAttainmentCos}</strong>
          </div>
        ) : null}
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
  const canReviewByClass = activeRole === "DIRECTOR" || activeRole === "COORDINATOR"
  const isSupported = canEdit || canReviewByClass
  const lowCos = useMemo(
    () => lowAttainments
      .filter((item) => Number(item.attainmentVal ?? 0) < Number(item.warningThreshold ?? 0.68))
      .map((item) => item.coCode)
      .join(", "),
    [lowAttainments],
  )

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
    const loadClasses = canEdit
      ? getTeacherClassList().then((data) => data.map(toClassOptionFromTeacher))
      : getTeachingClassPage({ pageNum: 1, pageSize: 50 }).then((page) => page.records.map(toClassOptionFromCommon))

    void loadClasses
      .then((options) => {
        setClassOptions(options)
        setSelectedClassId(options[0]?.id ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeRole, canEdit, isSupported])

  useEffect(() => {
    if (!selectedClass || !isSupported) return

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
  }, [selectedClass, canEdit, isSupported])

  const handleGenerateDraft = async () => {
    if (!selectedClass) return

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const draft = await generateImprovement(selectedClass.id)
      setProblemAnalysis(draft.suggestedAnalysis)
      setMessage("已根据低达成 CO 生成草稿")
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
          后端目前只支持授课教师提交班级改进记录，以及按教学班查询改进记录；{roleLabels[activeRole]} 暂无独立视图接口。
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
              {canEdit ? "班级教学改进任务单" : "按教学班查看持续改进"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              已接入教学班、低达成 CO、改进记录查询、草稿生成和教师提交接口。
            </p>
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
          <strong className="mt-2 block text-lg font-extrabold text-slate-950">{classOptions.length}</strong>
        </article>
        <article className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="m-0 flex items-center gap-2 text-sm font-bold text-red-700">
            <TrendingUp size={16} />
            低达成 CO
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

      {classOptions.length > 0 ? (
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

      {canReviewByClass ? (
        <section className="grid gap-3">
          {records.length > 0 ? records.map((record) => (
            <RecordCard key={record.id} record={record} />
          )) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-400">
              当前教学班暂无持续改进记录。
            </div>
          )}
        </section>
      ) : null}

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 font-semibold text-amber-800">
        <FileText className="mr-2 inline" size={16} />
        当前后端没有全专业/全课程持续改进聚合接口，也没有审核状态字段，所以本页只展示后端已支持的按教学班查询与教师提交能力。
      </section>
    </section>
  )
}
