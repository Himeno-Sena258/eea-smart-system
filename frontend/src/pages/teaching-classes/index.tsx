import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Save,
  Table2,
  UsersRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  ID,
  StudentCourseScore,
  TeacherClass,
  TeacherFinalScore,
  TeacherScoreGrid,
  TeachingClass,
} from "@/models"
import {
  getStudentCourseScores,
  getStudentScoreDetail,
  getTeacherClassList,
  getTeacherFinalScores,
  getTeacherScoreGrid,
  saveTeacherScores,
} from "@/services"
import { useTeachingStore, useUiStore } from "@/stores"

const threshold = 0.68

const scoreValue = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(1).replace(/\.0$/, "") : "-"

function ClassSelector({
  classes,
  selectedClassId,
  onSelect,
}: {
  classes: TeacherClass[]
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
            暂无教学班
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <ClassSelector classes={classes} onSelect={setSelectedClassId} selectedClassId={selectedClass?.classId ?? null} />

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
            <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading || !scoreGrid} onClick={handleSave} type="button">
              <Save size={16} />
              保存成绩
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-center text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="border-r border-b border-slate-200 p-3 text-left">学号</th>
                  <th className="border-r border-b border-slate-200 p-3 text-left">姓名</th>
                  {scoreGrid?.headers.map((item) => (
                    <th className="border-r border-b border-slate-200 bg-blue-50 p-3" key={item.itemId}>
                      {item.itemName} [{item.coCode}] ({scoreValue(item.maxScore)})
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
  const loading = useTeachingStore((state) => state.loading)
  const error = useTeachingStore((state) => state.error)

  const classes = teachingClassesPage?.records ?? []

  useEffect(() => {
    void fetchTeachingClasses({ pageNum: 1, pageSize: 100 })
  }, [fetchTeachingClasses])

  return (
    <div className="grid gap-5">
      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}
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
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <UsersRound size={19} className="text-blue-700" />
          教学班主数据
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 p-3 text-left">教学班</th>
                <th className="border-b border-slate-200 p-3 text-left">课程</th>
                <th className="border-b border-slate-200 p-3 text-left">教师</th>
                <th className="border-b border-slate-200 p-3 text-left">学期</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item: TeachingClass) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="p-3 font-extrabold text-slate-950">{item.className}</td>
                  <td className="p-3 text-slate-600">{item.courseName ?? `课程ID ${item.courseId}`}</td>
                  <td className="p-3 text-slate-600">{item.teacherName ?? `教师ID ${item.teacherId}`}</td>
                  <td className="p-3 text-slate-600">{item.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 ? (
            <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">
              {loading ? "正在加载教学班..." : "暂无教学班数据"}
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
                        {item.objectiveCode}
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
            <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">暂无成绩明细</p>
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
          <p className="mt-2 text-base leading-7 text-slate-600">
            使用真实接口查看教学班、录入分项成绩，并查询学生个人成绩明细。
          </p>
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
