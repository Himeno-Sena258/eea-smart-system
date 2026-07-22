import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Download,
  PencilLine,
  Plus,
  Save,
  Table2,
  Trash2,
  Upload,
  UsersRound,
  X,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { formatCourseObjectiveLabel } from "@/lib/course-objective-label"
import type {
  AcademicTeachingClassImportPreviewResult,
  ID,
  ImportResult,
  StudentCourseScore,
  TeacherClass,
  TeacherFinalScore,
  TeacherScoreGrid,
  TeachingClass,
  TeachingClassPayload,
} from "@/models"
import {
  downloadScoreTemplate,
  getStudentCourseScores,
  getStudentScoreDetail,
  getTeacherClassList,
  getTeacherFinalScores,
  getTeacherScoreGrid,
  importScores,
  saveTeacherScores,
} from "@/services"
import { useTeachingStore, useUiStore } from "@/stores"

const threshold = 0.68

const scoreValue = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(1).replace(/\.0$/, "") : "-"

function TeachingClassDialog({
  teachingClass,
  trigger,
  onSave,
}: {
  teachingClass?: TeachingClass | null
  trigger: ReactNode
  onSave: (payload: TeachingClassPayload) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [semester, setSemester] = useState("")
  const [className, setClassName] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setCourseId(teachingClass?.courseId ? String(teachingClass.courseId) : "")
    setTeacherId(teachingClass?.teacherId ? String(teachingClass.teacherId) : "")
    setSemester(teachingClass?.semester ?? "")
    setClassName(teachingClass?.className ?? "")
  }, [open, teachingClass])

  const handleSave = async () => {
    const payload = {
      courseId: Number(courseId),
      teacherId: Number(teacherId),
      semester: semester.trim(),
      className: className.trim(),
    }

    if (!payload.courseId || !payload.teacherId || !payload.semester || !payload.className) {
      setError("请完整填写课程ID、教师ID、学期和教学班名称")
      return
    }

    try {
      await onSave(payload)
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存教学班失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{teachingClass ? "编辑教学班" : "新增教学班"}</DialogTitle>
          <DialogDescription>维护教学班、课程和任课教师关系。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">课程ID</span>
            <Input type="number" value={courseId} onChange={(event) => setCourseId(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">教师ID</span>
            <Input type="number" value={teacherId} onChange={(event) => setTeacherId(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">学期</span>
            <Input value={semester} onChange={(event) => setSemester(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">教学班名称</span>
            <Input value={className} onChange={(event) => setClassName(event.target.value)} />
          </label>
          {error ? <p className="m-0 text-sm font-bold text-red-600 sm:col-span-2">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">保存教学班</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportResultNote({ result }: { result: ImportResult | null }) {
  if (!result) return null

  return (
    <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
      导入完成：总计 {result.totalRows} 行，成功 {result.successRows} 行，失败 {result.failedRows} 行
    </p>
  )
}

function ClassSelector({
  classes,
  loading,
  selectedClassId,
  onSelect,
}: {
  classes: TeacherClass[]
  loading: boolean
  selectedClassId: ID | null
  onSelect: (classId: ID) => void
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="m-0 flex items-center gap-2 text-base font-extrabold text-slate-950">
        <UsersRound size={18} className="text-blue-700" />
        我的教学班
      </h2>
      <div className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
        {classes.map((item) => {
          const isActive = item.classId === selectedClassId

          return (
            <button
              className={[
                "rounded-lg border p-3 text-left transition",
                isActive ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50",
              ].join(" ")}
              key={item.classId}
              onClick={() => onSelect(item.classId)}
              type="button"
            >
              <p className="m-0 text-sm font-extrabold">{item.className}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{item.courseName} / {item.semester}</p>
              <p className="mt-2 text-xs font-bold text-slate-400">{item.studentCount} 人</p>
            </button>
          )
        })}
        {classes.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
            {loading ? "正在加载教学班..." : "当前登录账号没有关联教学班"}
          </p>
        ) : null}
      </div>
    </aside>
  )
}

function InstructorView() {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<ID | null>(null)
  const [scoreGrid, setScoreGrid] = useState<TeacherScoreGrid | null>(null)
  const [finalScores, setFinalScores] = useState<TeacherFinalScore[]>([])
  const [draftScores, setDraftScores] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const originalDraftsRef = useRef<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const selectedClass = useMemo(
    () => classes.find((item) => item.classId === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId],
  )

  useEffect(() => {
    void getTeacherClassList()
      .then((data) => {
        setClasses(data)
        setSelectedClassId((current) => current ?? data[0]?.classId ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
  }, [])

  useEffect(() => {
    if (!selectedClass) return

    setLoading(true)
    setError(null)
    setSaveMessage(null)
    void Promise.all([getTeacherScoreGrid(selectedClass.classId), getTeacherFinalScores(selectedClass.classId)])
      .then(([grid, scores]) => {
        setScoreGrid(grid)
        setFinalScores(scores)
        const nextDraft: Record<string, string> = {}
        grid.rows.forEach((row) => {
          grid.headers.forEach((header) => {
            const value = row.itemScores[header.itemId]
            nextDraft[`${row.studentId}-${header.itemId}`] = typeof value === "number" ? String(value) : ""
          })
        })
        setDraftScores(nextDraft)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [selectedClass])

  const finalScoreMap = useMemo(
    () => new Map(finalScores.map((item) => [String(item.studentId), item])),
    [finalScores],
  )

  const handleSave = async () => {
    if (!selectedClass || !scoreGrid) return

    const scores = scoreGrid.rows.flatMap((row) =>
      scoreGrid.headers
        .map((header) => {
          const rawValue = draftScores[`${row.studentId}-${header.itemId}`]
          if (rawValue === undefined || rawValue === "") return null
          return {
            studentId: row.studentId,
            assessmentItemId: header.itemId,
            actualScore: Number(rawValue),
          }
        })
        .filter((item): item is { studentId: ID; assessmentItemId: ID; actualScore: number } => item !== null),
    )

    setLoading(true)
    setError(null)
    setSaveMessage(null)

    try {
      await saveTeacherScores(selectedClass.classId, { scores })
      const [grid, totals] = await Promise.all([
        getTeacherScoreGrid(selectedClass.classId),
        getTeacherFinalScores(selectedClass.classId),
      ])
      setScoreGrid(grid)
      setFinalScores(totals)
      setSaveMessage("成绩已保存")
      setIsEditing(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败")
    } finally {
      setLoading(false)
    }
  }

  const reloadSelectedClassScores = async () => {
    if (!selectedClass) return
    const [grid, totals] = await Promise.all([
      getTeacherScoreGrid(selectedClass.classId),
      getTeacherFinalScores(selectedClass.classId),
    ])
    setScoreGrid(grid)
    setFinalScores(totals)
    const nextDraft: Record<string, string> = {}
    grid.rows.forEach((row) => {
      grid.headers.forEach((header) => {
        const value = row.itemScores[header.itemId]
        nextDraft[`${row.studentId}-${header.itemId}`] = typeof value === "number" ? String(value) : ""
      })
    })
    setDraftScores(nextDraft)
  }

  const handleDownloadTemplate = async () => {
    if (!selectedClass) return
    setError(null)
    setSaveMessage(null)
    try {
      const blob = await downloadScoreTemplate(selectedClass.classId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${selectedClass.className}-成绩模板.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setSaveMessage("成绩模板已开始下载")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "模板下载失败")
    }
  }

  const handleImportScores = async (file: File | null) => {
    if (!selectedClass || !file) return
    setLoading(true)
    setError(null)
    setSaveMessage(null)
    try {
      const result = await importScores(selectedClass.classId, file)
      await reloadSelectedClassScores()
      setSaveMessage(`成绩导入完成：成功 ${result.successRows} 行，失败 ${result.failedRows} 行`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "成绩导入失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <ClassSelector
        classes={classes}
        loading={loading}
        onSelect={setSelectedClassId}
        selectedClassId={selectedClass?.classId ?? null}
      />

      <div className="grid gap-5">
        {error ? (
          <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
        ) : null}
        {saveMessage ? (
          <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            {saveMessage}
          </p>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <Table2 size={19} className="text-blue-700" />
                分项成绩单
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedClass ? `${selectedClass.courseName} / ${selectedClass.className}` : "请选择教学班"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={loading || !selectedClass} onClick={handleDownloadTemplate} type="button" variant="outline">
                <Download size={16} />
                下载模板
              </Button>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">
                <Upload size={16} />
                导入成绩
                <input
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={(event) => {
                    void handleImportScores(event.target.files?.[0] ?? null)
                    event.target.value = ""
                  }}
                  type="file"
                />
              </label>
              {isEditing ? (
                <>
                  <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !scoreGrid} onClick={handleSave} type="button">
                    <Save size={16} /> 保存成绩
                  </Button>
                  <Button className="ml-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" variant="outline" onClick={() => {
                    setDraftScores(originalDraftsRef.current)
                    setIsEditing(false)
                  }} type="button">
                    <X size={16} /> 取消
                  </Button>
                </>
              ) : (
                <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !scoreGrid} onClick={() => {
                  originalDraftsRef.current = { ...draftScores }
                  setIsEditing(true)
                }} type="button">
                  <PencilLine size={16} /> 编辑
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-center text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="border-r border-b border-slate-200 p-3 text-left">学号</th>
                  <th className="border-r border-b border-slate-200 p-3 text-left">姓名</th>
                  {scoreGrid?.headers.map((item) => (
                    <th
                      className="border-r border-b border-slate-200 bg-blue-50 p-3"
                      key={item.itemId}
                      title={`支撑目标：${item.coCode}`}
                    >
                      <span className="block">{item.itemName}</span>
                      <span className="mt-1 block text-xs font-extrabold text-blue-700">
                        {formatCourseObjectiveLabel({ objectiveCode: item.coCode }, { mode: "compact" })} / {scoreValue(item.maxScore)} 分
                      </span>
                    </th>
                  ))}
                  <th className="border-b border-slate-200 p-3">总评</th>
                </tr>
              </thead>
              <tbody>
                {scoreGrid?.rows.map((student) => {
                  const total = finalScoreMap.get(String(student.studentId))

                  return (
                    <tr className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60" key={student.studentId}>
                      <td className="border-r border-slate-100 p-3 text-left font-mono text-slate-600">{student.studentNo}</td>
                      <td className="border-r border-slate-100 p-3 text-left font-bold text-slate-900">{student.studentName}</td>
                      {scoreGrid.headers.map((item) => {
                        const rawValue = draftScores[`${student.studentId}-${item.itemId}`]
                        const numericValue = Number(rawValue)
                        const isLow = rawValue !== "" && Number.isFinite(numericValue) && numericValue / item.maxScore < threshold

                        return (
                          <td className="border-r border-slate-100 p-3" key={item.itemId}>
                            {isEditing ? (
                            <input
                              className={isLow ? "h-8 w-20 rounded-md border border-red-200 bg-red-50 text-center font-bold text-red-700" : "h-8 w-20 rounded-md border border-slate-200 bg-white text-center font-bold text-slate-800"}
                              max={item.maxScore}
                              min={0}
                              onChange={(event) =>
                                setDraftScores((current) => ({
                                  ...current,
                                  [`${student.studentId}-${item.itemId}`]: event.target.value,
                                }))
                              }
                              type="number"
                              value={rawValue ?? ""}
                            />
                          ) : (
                            <span className={`font-bold ${isLow ? "text-red-700" : "text-slate-800"}`}>
                              {rawValue && rawValue !== "" ? rawValue : <span className="text-slate-400">未录入</span>}
                            </span>
                          )}
                          </td>
                        )
                      })}
                      <td className={total?.isPassed === 0 ? "p-3 font-extrabold text-red-700" : "p-3 font-extrabold text-emerald-700"}>
                        {scoreValue(total?.totalScore)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!scoreGrid || scoreGrid.rows.length === 0 ? (
              <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">
                {loading ? "正在加载成绩网格..." : "暂无成绩数据"}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <BarChart3 size={19} className="text-blue-700" />
            总评成绩
          </h2>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            {finalScores.slice(0, 8).map((item) => (
              <article className="rounded-lg border border-slate-200 p-3" key={item.studentId}>
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm text-slate-900">{item.studentName}</strong>
                  <span className={item.isPassed === 1 ? "text-xs font-extrabold text-emerald-600" : "text-xs font-extrabold text-red-600"}>
                    {item.isPassed === 1 ? "及格" : "预警"}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{scoreValue(item.totalScore)}</p>
                <p className="mt-1 text-xs text-slate-500">平时 {scoreValue(item.homeworkScore)} / 实验 {scoreValue(item.experimentScore)} / 期末 {scoreValue(item.examScore)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function ManagementView() {
  const teachingClassesPage = useTeachingStore((state) => state.teachingClassesPage)
  const fetchTeachingClasses = useTeachingStore((state) => state.fetchTeachingClasses)
  const createTeachingClass = useTeachingStore((state) => state.createTeachingClass)
  const updateTeachingClass = useTeachingStore((state) => state.updateTeachingClass)
  const deleteTeachingClass = useTeachingStore((state) => state.deleteTeachingClass)
  const previewAcademicTeachingClassImport = useTeachingStore((state) => state.previewAcademicTeachingClassImport)
  const submitAcademicTeachingClassImport = useTeachingStore((state) => state.submitAcademicTeachingClassImport)
  const importPreview = useTeachingStore((state) => state.academicTeachingClassImportPreview)
  const importResult = useTeachingStore((state) => state.academicTeachingClassImportResult)
  const loading = useTeachingStore((state) => state.loading)
  const error = useTeachingStore((state) => state.error)
  const [message, setMessage] = useState<string | null>(null)

  const classes = teachingClassesPage?.records ?? []

  useEffect(() => {
    void fetchTeachingClasses({ pageNum: 1, pageSize: 100 })
  }, [fetchTeachingClasses])

  const refreshClasses = () => fetchTeachingClasses({ pageNum: 1, pageSize: 100 })

  const handleDeleteClass = async (teachingClass: TeachingClass) => {
    if (!window.confirm(`确认删除教学班「${teachingClass.className}」吗？`)) return
    await deleteTeachingClass(teachingClass.id)
    await refreshClasses()
    setMessage("教学班已删除")
  }

  const handlePreviewImport = async (file: File | null) => {
    if (!file) return
    setMessage(null)
    await previewAcademicTeachingClassImport(file)
  }

  const handleSubmitImport = async () => {
    if (!importPreview) return
    await submitAcademicTeachingClassImport({ batchId: importPreview.batchId })
    await refreshClasses()
    setMessage("教务排课数据已导入")
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>
      ) : null}
      <ImportResultNote result={importResult} />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">教学班数量</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">{teachingClassesPage?.total ?? classes.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="m-0 text-sm font-bold text-emerald-700">当前页班级</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-emerald-800">{classes.length}</strong>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <UsersRound size={19} className="text-blue-700" />
            教学班主数据
          </h2>
          <div className="flex flex-wrap gap-2">
            <TeachingClassDialog
              onSave={async (payload) => {
                await createTeachingClass(payload)
                await refreshClasses()
                setMessage("教学班已创建")
              }}
              trigger={<Button className="bg-blue-700 text-white hover:bg-blue-800" type="button"><Plus size={16} />新增教学班</Button>}
            />
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">
              <Upload size={16} />
              导入排课
              <input
                accept=".xls,.xlsx"
                className="hidden"
                onChange={(event) => {
                  void handlePreviewImport(event.target.files?.[0] ?? null)
                  event.target.value = ""
                }}
                type="file"
              />
            </label>
          </div>
        </div>
        {importPreview ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <p className="m-0 text-sm font-bold text-blue-800">
                预览 {importPreview.totalRows} 行，有效 {importPreview.validRows} 行，无效 {importPreview.invalidRows} 行，教学班 {importPreview.teachingClassCount} 个
              </p>
              <Button disabled={loading || importPreview.validRows === 0} onClick={handleSubmitImport} type="button">
                提交导入
              </Button>
            </div>
            <div className="mt-3 max-h-44 overflow-y-auto rounded-lg border border-blue-100 bg-white">
              {importPreview.rows.slice(0, 8).map((row) => (
                <div className="grid gap-2 border-b border-slate-100 p-2 text-xs md:grid-cols-[60px_1fr_1fr_1fr]" key={row.rowIndex}>
                  <span className="font-mono text-slate-500">#{row.rowIndex}</span>
                  <span className="font-bold text-slate-800">{row.courseName}</span>
                  <span className="text-slate-600">{row.teachingClassName}</span>
                  <span className={row.validation === "PASS" ? "font-bold text-emerald-600" : "font-bold text-red-600"}>{row.message}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 p-3 text-left">教学班</th>
                <th className="border-b border-slate-200 p-3 text-left">课程</th>
                <th className="border-b border-slate-200 p-3 text-left">教师</th>
                <th className="border-b border-slate-200 p-3 text-left">学期</th>
                <th className="border-b border-slate-200 p-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item: TeachingClass) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="p-3 font-extrabold text-slate-950">{item.className}</td>
                  <td className="p-3 text-slate-600">{item.courseName ?? `课程ID ${item.courseId}`}</td>
                  <td className="p-3 text-slate-600">{item.teacherName ?? `教师ID ${item.teacherId}`}</td>
                  <td className="p-3 text-slate-600">{item.semester}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <TeachingClassDialog
                        teachingClass={item}
                        onSave={async (payload) => {
                          await updateTeachingClass(item.id, payload)
                          await refreshClasses()
                          setMessage("教学班已保存")
                        }}
                        trigger={<Button size="sm" type="button" variant="outline"><PencilLine size={15} />编辑</Button>}
                      />
                      <Button onClick={() => void handleDeleteClass(item)} size="sm" type="button" variant="outline">
                        <Trash2 size={15} />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 ? (
            <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">
              {loading ? "正在加载教学班..." : "后端当前没有返回教学班数据"}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function StudentView() {
  const [scores, setScores] = useState<StudentCourseScore[]>([])
  const [selectedClassId, setSelectedClassId] = useState<ID | null>(null)
  const [detail, setDetail] = useState<StudentCourseScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedScore = useMemo(
    () => scores.find((item) => item.teachingClassId === selectedClassId) ?? scores[0] ?? null,
    [scores, selectedClassId],
  )

  useEffect(() => {
    void getStudentCourseScores()
      .then((data) => {
        setScores(data)
        setSelectedClassId((current) => current ?? data[0]?.teachingClassId ?? null)
      })
      .catch((requestError: Error) => setError(requestError.message))
  }, [])

  useEffect(() => {
    if (!selectedScore) return

    setSelectedClassId(selectedScore.teachingClassId)
    void getStudentScoreDetail(selectedScore.teachingClassId)
      .then(setDetail)
      .catch((requestError: Error) => setError(requestError.message))
  }, [selectedScore])

  return (
    <div className="grid gap-5">
      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {scores.map((item) => (
          <button
            className={[
              "rounded-lg border p-4 text-left transition",
              item.teachingClassId === selectedScore?.teachingClassId
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50",
            ].join(" ")}
            key={item.teachingClassId}
            onClick={() => setSelectedClassId(item.teachingClassId)}
            type="button"
          >
            <p className="m-0 text-sm font-extrabold text-slate-950">{item.courseName}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.teachingClassName} / {item.semester}</p>
            <p className={item.passed ? "mt-3 text-2xl font-extrabold text-emerald-700" : "mt-3 text-2xl font-extrabold text-red-700"}>
              {scoreValue(item.totalScore)}
            </p>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <GraduationCap size={19} className="text-blue-700" />
            我的成绩明细
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {detail ? `${detail.courseName} / ${detail.teachingClassName}` : "请选择课程"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 p-4">考核项</th>
                <th className="border-b border-slate-200 p-4">所属方式</th>
                <th className="border-b border-slate-200 p-4">满分</th>
                <th className="border-b border-slate-200 p-4 text-blue-700">我的得分</th>
                <th className="border-b border-slate-200 p-4">支撑目标</th>
                <th className="border-b border-slate-200 p-4">状态</th>
              </tr>
            </thead>
            <tbody>
              {(detail?.items ?? []).map((item) => {
                const isLow = typeof item.score === "number" && typeof item.maxScore === "number" && item.score / item.maxScore < threshold

                return (
                  <tr className={isLow ? "border-b border-slate-100 bg-red-50/50" : "border-b border-slate-100"} key={item.itemId}>
                    <td className="p-4 font-bold text-slate-900">{item.itemName}</td>
                    <td className="p-4 text-slate-500">{item.methodName}</td>
                    <td className="p-4 text-slate-500">{scoreValue(item.maxScore)}</td>
                    <td className={isLow ? "p-4 text-lg font-extrabold text-red-700" : "p-4 text-lg font-extrabold text-slate-950"}>
                      {scoreValue(item.score)}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {formatCourseObjectiveLabel({ objectiveCode: item.objectiveCode }, { mode: "compact" })}
                      </span>
                    </td>
                    <td className={isLow ? "p-4 font-bold text-red-700" : "p-4 font-bold text-emerald-600"}>
                      {isLow ? "预警" : "达标"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(detail?.items ?? []).length === 0 ? (
            <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">
              {scores.length === 0 ? "当前登录学生没有课程成绩数据" : "暂无成绩明细"}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export function TeachingClassesPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const canManage = activeRole === "ADMIN" || activeRole === "DIRECTOR" || activeRole === "COORDINATOR"

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <UsersRound size={16} />
          教学班与成绩
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            教学班质量工作台
          </h1>
        </div>
      </header>

      {canManage ? <ManagementView /> : null}
      {activeRole === "INSTRUCTOR" ? <InstructorView /> : null}
      {activeRole === "STUDENT" ? <StudentView /> : null}
      {!canManage && activeRole !== "INSTRUCTOR" && activeRole !== "STUDENT" ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold">
            <AlertTriangle size={19} />
            当前角色暂无教学班视图
          </h2>
        </section>
      ) : null}
    </section>
  )
}
