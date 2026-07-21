import { AlertTriangle, BarChart3, Calculator, ChartNoAxesCombined, RefreshCw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { roleLabels } from "@/constants/role-options"
import type {
  CourseObjectiveAttainmentResult,
  CoordinatorCourse,
  CoordinatorCourseAttainment,
  DirectorAttainment,
  DirectorProgramScheme,
  ID,
  RequirementAttainmentResult,
  StudentAttainment,
  TeacherClass,
  TeacherCoAttainment,
} from "@/models"
import {
  calculateDirectorAttainment,
  calculateTeacherCoAttainment,
  getDirectorAttainmentList,
  getDirectorProgramSchemeList,
  getCoordinatorCourseAttainmentList,
  getCoordinatorCourseList,
  getStudentAttainmentList,
  getTeacherClassList,
  getTeacherCoAttainmentList,
} from "@/services"
import { useUiStore } from "@/stores"
import { AttainmentBarChart } from "./attainment-bar-chart"
import { AttainmentRadarChart } from "./attainment-radar-chart"

const threshold = 0.68

const formatPercent = (value?: number | null) => (typeof value === "number" ? `${Math.round(value * 100)}%` : "-")

const toTeacherCourseObjectiveResult = (
  classId: ID | null,
  courseId: ID | null,
  rows: TeacherCoAttainment[],
): CourseObjectiveAttainmentResult => ({
  teachingClassId: classId ?? 0,
  courseId: courseId ?? 0,
  calculatedAt: "",
  items: rows.map((row) => ({
    courseObjectiveId: row.coId,
    objectiveCode: row.coCode,
    attainmentVal: Number(row.attainmentVal ?? 0),
    threshold: Number(row.warningThreshold ?? threshold),
    passed: row.isQualified === 1,
  })),
})

const toTeacherIndicatorResult = (classId: ID | null, rows: TeacherCoAttainment[]): RequirementAttainmentResult => {
  const groupMap = new Map<string, TeacherCoAttainment[]>()
  rows.forEach((row) => {
    const key = row.indicatorPointCode || row.coCode
    groupMap.set(key, [...(groupMap.get(key) ?? []), row])
  })

  return {
    schemeId: classId ?? 0,
    items: Array.from(groupMap.entries()).map(([code, group], index) => {
      const attainmentVal = group.reduce((sum, row) => sum + Number(row.attainmentVal ?? 0), 0) / group.length
      return {
        requirementId: index + 1,
        requirementCode: code,
        title: code,
        attainmentVal,
        indicatorItems: group.map((row) => ({
          indicatorPointId: row.coId,
          code: row.coCode,
          attainmentVal: Number(row.attainmentVal ?? 0),
        })),
      }
    }),
  }
}

const toDirectorRequirementResult = (schemeId: ID | null, rows: DirectorAttainment[]): RequirementAttainmentResult => ({
  schemeId: schemeId ?? 0,
  items: rows.map((row) => ({
    requirementId: row.indicatorPointId,
    requirementCode: row.indicatorPointCode,
    title: row.indicatorPointContent || row.indicatorPointCode,
    attainmentVal: Number(row.attainmentVal ?? 0),
    indicatorItems: [{
      indicatorPointId: row.indicatorPointId,
      code: row.indicatorPointCode,
      attainmentVal: Number(row.attainmentVal ?? 0),
    }],
  })),
})

const toCoordinatorRequirementResult = (courseId: ID | null, rows: CoordinatorCourseAttainment[]): RequirementAttainmentResult => ({
  schemeId: courseId ?? 0,
  items: rows.map((row) => ({
    requirementId: row.courseObjectiveId,
    requirementCode: row.objectiveCode,
    title: row.teachingClassName,
    attainmentVal: Number(row.attainmentVal ?? 0),
    indicatorItems: [{
      indicatorPointId: row.courseObjectiveId,
      code: row.objectiveCode,
      attainmentVal: Number(row.attainmentVal ?? 0),
    }],
  })),
})

const toStudentRequirementResult = (rows: StudentAttainment[]): RequirementAttainmentResult => {
  const rowsWithData = rows.filter((row) => row.attainmentValue !== null && row.attainmentValue !== undefined)

  return {
    schemeId: 0,
    items: rowsWithData.map((row, index) => ({
    requirementId: index + 1,
    requirementCode: row.indicatorCode,
    title: row.indicatorContent || row.indicatorCode,
    attainmentVal: Number(row.attainmentValue ?? 0),
    indicatorItems: [{
      indicatorPointId: index + 1,
      code: row.indicatorCode,
      attainmentVal: Number(row.attainmentValue ?? 0),
    }],
    })),
  }
}

export function AttainmentPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<ID | null>(null)
  const [teacherRows, setTeacherRows] = useState<TeacherCoAttainment[]>([])
  const [directorSchemes, setDirectorSchemes] = useState<DirectorProgramScheme[]>([])
  const [selectedSchemeId, setSelectedSchemeId] = useState<ID | null>(null)
  const [directorRows, setDirectorRows] = useState<DirectorAttainment[]>([])
  const [coordinatorCourses, setCoordinatorCourses] = useState<CoordinatorCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<ID | null>(null)
  const [coordinatorRows, setCoordinatorRows] = useState<CoordinatorCourseAttainment[]>([])
  const [studentRows, setStudentRows] = useState<StudentAttainment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedClass = teacherClasses.find((item) => item.classId === selectedClassId) ?? teacherClasses[0] ?? null
  const selectedScheme = directorSchemes.find((item) => item.id === selectedSchemeId) ?? directorSchemes[0] ?? null
  const selectedCourse = coordinatorCourses.find((item) => item.courseId === selectedCourseId) ?? coordinatorCourses[0] ?? null

  const teacherCourseResult = useMemo(
    () => toTeacherCourseObjectiveResult(selectedClass?.classId ?? null, selectedClass?.courseId ?? null, teacherRows),
    [selectedClass, teacherRows],
  )
  const teacherIndicatorResult = useMemo(
    () => toTeacherIndicatorResult(selectedClass?.classId ?? null, teacherRows),
    [selectedClass, teacherRows],
  )
  const directorResult = useMemo(
    () => toDirectorRequirementResult(selectedScheme?.id ?? null, directorRows),
    [directorRows, selectedScheme],
  )
  const coordinatorResult = useMemo(
    () => toCoordinatorRequirementResult(selectedCourse?.courseId ?? null, coordinatorRows),
    [coordinatorRows, selectedCourse],
  )
  const studentResult = useMemo(() => toStudentRequirementResult(studentRows), [studentRows])

  const activeResult =
    activeRole === "DIRECTOR" ? directorResult :
    activeRole === "COORDINATOR" ? coordinatorResult :
    activeRole === "INSTRUCTOR" ? teacherIndicatorResult :
    activeRole === "STUDENT" ? studentResult :
    null
  const weakItems = activeResult?.items.filter((item) => item.attainmentVal < threshold) ?? []
  const average = activeResult && activeResult.items.length > 0
    ? activeResult.items.reduce((sum, item) => sum + item.attainmentVal, 0) / activeResult.items.length
    : null

  useEffect(() => {
    setError(null)
    setMessage(null)
    setTeacherRows([])
    setDirectorRows([])
    setCoordinatorRows([])
    setStudentRows([])

    if (activeRole === "INSTRUCTOR") {
      setLoading(true)
      void getTeacherClassList()
        .then((data) => {
          setTeacherClasses(data)
          setSelectedClassId((current) => current ?? data[0]?.classId ?? null)
        })
        .catch((requestError: Error) => setError(requestError.message))
        .finally(() => setLoading(false))
      return
    }

    if (activeRole === "DIRECTOR") {
      setLoading(true)
      void getDirectorProgramSchemeList()
        .then((data) => {
          setDirectorSchemes(data)
          setSelectedSchemeId((current) => current ?? data[0]?.id ?? null)
        })
        .catch((requestError: Error) => setError(requestError.message))
        .finally(() => setLoading(false))
      return
    }

    if (activeRole === "COORDINATOR") {
      setLoading(true)
      void getCoordinatorCourseList()
        .then((data) => {
          setCoordinatorCourses(data)
          setSelectedCourseId((current) => current ?? data[0]?.courseId ?? null)
        })
        .catch((requestError: Error) => setError(requestError.message))
        .finally(() => setLoading(false))
      return
    }

    if (activeRole === "STUDENT") {
      setLoading(true)
      void getStudentAttainmentList()
        .then(setStudentRows)
        .catch((requestError: Error) => setError(requestError.message))
        .finally(() => setLoading(false))
    }
  }, [activeRole])

  useEffect(() => {
    if (activeRole !== "INSTRUCTOR" || !selectedClass) return

    setLoading(true)
    setError(null)
    void getTeacherCoAttainmentList(selectedClass.classId)
      .then(setTeacherRows)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeRole, selectedClass])

  useEffect(() => {
    if (activeRole !== "DIRECTOR" || !selectedScheme) return

    setLoading(true)
    setError(null)
    void getDirectorAttainmentList(selectedScheme.id, selectedScheme.grade)
      .then(setDirectorRows)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeRole, selectedScheme])

  useEffect(() => {
    if (activeRole !== "COORDINATOR" || !selectedCourse) return

    setLoading(true)
    setError(null)
    void getCoordinatorCourseAttainmentList(selectedCourse.courseId)
      .then(setCoordinatorRows)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [activeRole, selectedCourse])

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      if (activeRole === "INSTRUCTOR" && selectedClass) {
        const data = await calculateTeacherCoAttainment(selectedClass.classId)
        setTeacherRows(data)
        setMessage("教学班 CO 达成度已重新计算")
      }
      if (activeRole === "DIRECTOR" && selectedScheme) {
        const data = await calculateDirectorAttainment(selectedScheme.id, selectedScheme.grade)
        setDirectorRows(data)
        setMessage("专业毕业要求达成度已重新计算")
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "达成度计算失败")
    } finally {
      setLoading(false)
    }
  }

  if (!activeResult) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm leading-6 font-semibold text-amber-800">
        当前角色「{roleLabels[activeRole]}」没有后端达成度查询接口，暂不能接入真实服务。
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <ChartNoAxesCombined size={16} />
            达成度分析
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              达成度评价看板
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(activeRole === "DIRECTOR" || activeRole === "INSTRUCTOR") ? (
            <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleCalculate} type="button">
              <Calculator size={16} />
              重新计算
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

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <BarChart3 size={19} className="text-blue-700" />
            {activeRole === "DIRECTOR" ? selectedScheme?.name ?? "专业达成度" : null}
            {activeRole === "INSTRUCTOR" ? selectedClass ? `${selectedClass.courseName} / ${selectedClass.className}` : "教学班达成度" : null}
            {activeRole === "STUDENT" ? "我的毕业要求达成度" : null}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            平均达成度 {formatPercent(average)}，低于标准底线 {weakItems.length} 项。
          </p>
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
      </section>

      {activeRole === "DIRECTOR" && directorSchemes.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {directorSchemes.map((scheme) => (
            <button
              className={
                scheme.id === selectedScheme?.id
                  ? "rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-extrabold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
              }
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              type="button"
            >
              {scheme.name} {scheme.grade ? `/${scheme.grade}` : ""}
            </button>
          ))}
        </section>
      ) : null}

      {activeRole === "COORDINATOR" && coordinatorCourses.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {coordinatorCourses.map((course) => (
            <button
              className={
                course.courseId === selectedCourse?.courseId
                  ? "rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-extrabold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
              }
              key={course.courseId}
              onClick={() => setSelectedCourseId(course.courseId)}
              type="button"
            >
              {course.courseName}
            </button>
          ))}
        </section>
      ) : null}

      {activeRole === "INSTRUCTOR" && teacherClasses.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {teacherClasses.map((item) => (
            <button
              className={
                item.classId === selectedClass?.classId
                  ? "rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-extrabold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
              }
              key={item.classId}
              onClick={() => setSelectedClassId(item.classId)}
              type="button"
            >
              {item.courseName} / {item.className}
            </button>
          ))}
        </section>
      ) : null}

      <div className={activeRole === "INSTRUCTOR" ? "grid gap-6 xl:grid-cols-2" : "grid gap-6"}>
        {activeRole === "INSTRUCTOR" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="m-0 text-lg font-extrabold text-slate-950">教学班 CO 达成度</h2>
            <AttainmentBarChart
              primaryLabel="达成度计算值"
              primaryResult={teacherCourseResult}
              threshold={threshold}
            />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2">
            <h2 className="m-0 text-lg font-extrabold text-slate-950">
              {activeRole === "INSTRUCTOR" ? "支撑指标点画像" : "毕业要求指标点画像"}
            </h2>
          </div>
          <AttainmentRadarChart result={activeResult} threshold={threshold} />
        </section>
      </div>

      {activeRole === "DIRECTOR" && directorRows.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-lg font-extrabold text-slate-950">课程贡献明细</h2>
          <div className="mt-4 grid gap-3">
            {directorRows.slice(0, 5).map((row) => (
              <article className="rounded-lg border border-slate-200 p-4" key={row.indicatorPointId}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-base font-extrabold text-slate-950">{row.indicatorPointCode}</h3>
                    <p className="mt-1 text-sm text-slate-500">{row.indicatorPointContent}</p>
                  </div>
                  <strong className={row.isQualified ? "text-2xl text-blue-700" : "text-2xl text-red-700"}>
                    {Number(row.attainmentVal ?? 0).toFixed(2)}
                  </strong>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {row.courseContributions?.map((item) => (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm" key={`${row.indicatorPointId}-${item.courseId}-${item.coCode}`}>
                      <p className="m-0 font-extrabold text-slate-800">{item.courseName} {item.coCode}</p>
                      <p className="mt-1 text-slate-500">权重 {Number(item.weight ?? 0).toFixed(3)}，贡献 {Number(item.weightedContribution ?? 0).toFixed(3)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {weakItems.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-red-800">
            <AlertTriangle size={19} />
            低达成维度
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {weakItems.map((item) => (
              <article className="rounded-lg border border-red-200 bg-white p-4" key={item.requirementId}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-base font-extrabold text-red-800">
                      {item.requirementCode} {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-red-600">低于标准底线 {threshold.toFixed(2)}</p>
                  </div>
                  <strong className="text-2xl leading-none text-red-700">{item.attainmentVal.toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}
