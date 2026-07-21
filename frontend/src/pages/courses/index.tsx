import { BookOpen, CheckCircle2, FileText, GitBranch, Layers3, PencilLine, Search, Settings2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { roleLabels } from "@/constants/role-options"
import type { AssessmentMethod, Course, CourseObjective, ID, StudentSyllabus } from "@/models"
import { getStudentSyllabusList } from "@/services"
import { useBaseStore, useCourseStore, useUiStore } from "@/stores"

const editableRoles = ["DIRECTOR", "COORDINATOR"]

const percent = (value: number) => {
  const normalized = value > 1 ? value : value * 100
  return `${Math.round(normalized)}%`
}

function CourseList({
  courses,
  keyword,
  selectedCourseId,
  onKeywordChange,
  onSelect,
}: {
  courses: Course[]
  keyword: string
  selectedCourseId: ID | null
  onKeywordChange: (keyword: string) => void
  onSelect: (courseId: ID) => void
}) {
  return (
    <aside className="h-full rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            className="h-10 bg-slate-50 pl-9"
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索课程"
            value={keyword}
          />
        </label>
      </div>
      <div className="grid max-h-[442px] gap-1 overflow-y-auto p-2">
        {courses.map((course) => {
          const isActive = course.id === selectedCourseId

          return (
            <button
              className={[
                "grid gap-1 rounded-lg p-2.5 text-left transition",
                isActive ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50",
              ].join(" ")}
              key={course.id}
              onClick={() => onSelect(course.id)}
              type="button"
            >
              <span className="text-sm font-extrabold">{course.courseCode} {course.courseName}</span>
              <span className={isActive ? "text-xs font-bold text-blue-600" : "text-xs text-slate-500"}>
                {course.courseType ?? "未分类"} / {course.credits} 学分 / {course.hours} 学时
              </span>
            </button>
          )
        })}
        {courses.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
            暂无课程数据
          </p>
        ) : null}
      </div>
    </aside>
  )
}

export function CoursesPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const isStudent = activeRole === "STUDENT"
  const programSchemes = useBaseStore((state) => state.programSchemes)
  const fetchProgramSchemes = useBaseStore((state) => state.fetchProgramSchemes)
  const fetchIndicatorTree = useBaseStore((state) => state.fetchIndicatorTree)
  const indicatorTree = useBaseStore((state) => state.indicatorTree)
  const clearBaseError = useBaseStore((state) => state.clearError)

  const coursesPage = useCourseStore((state) => state.coursesPage)
  const objectives = useCourseStore((state) => state.objectives)
  const indicatorMatrix = useCourseStore((state) => state.indicatorMatrix)
  const assessmentMethods = useCourseStore((state) => state.assessmentMethods)
  const loading = useCourseStore((state) => state.loading)
  const error = useCourseStore((state) => state.error)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const fetchObjectives = useCourseStore((state) => state.fetchObjectives)
  const fetchIndicatorMatrix = useCourseStore((state) => state.fetchIndicatorMatrix)
  const fetchAssessmentMethods = useCourseStore((state) => state.fetchAssessmentMethods)
  const clearCourseError = useCourseStore((state) => state.clearError)

  const [keyword, setKeyword] = useState("")
  const [selectedSchemeId, setSelectedSchemeId] = useState<ID | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<ID | null>(null)
  const [studentSyllabi, setStudentSyllabi] = useState<StudentSyllabus[]>([])
  const [studentLoading, setStudentLoading] = useState(false)
  const [studentError, setStudentError] = useState<string | null>(null)

  const studentCourses = useMemo<Course[]>(
    () =>
      studentSyllabi.map((syllabus) => ({
        id: syllabus.courseId,
        schemeId: 0,
        courseCode: `课程 ${syllabus.courseId}`,
        courseName: syllabus.courseName,
        credits: syllabus.credits,
        hours: syllabus.hours,
        courseType: "本人课程",
      })),
    [studentSyllabi],
  )
  const courses = isStudent ? studentCourses : coursesPage?.records ?? []
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? courses[0] ?? null,
    [courses, selectedCourseId],
  )
  const selectedStudentSyllabus = useMemo(
    () => studentSyllabi.find((syllabus) => syllabus.courseId === selectedCourse?.id) ?? null,
    [selectedCourse?.id, studentSyllabi],
  )
  const displayObjectives = useMemo<CourseObjective[]>(
    () =>
      isStudent
        ? selectedStudentSyllabus?.objectives.map((objective, index) => ({
          id: selectedStudentSyllabus.courseId * 1000 + index + 1,
          courseId: selectedStudentSyllabus.courseId,
          objectiveCode: objective.code,
          content: objective.content,
        })) ?? []
        : objectives,
    [isStudent, objectives, selectedStudentSyllabus],
  )
  const displayAssessmentMethods = useMemo<AssessmentMethod[]>(
    () =>
      isStudent
        ? selectedStudentSyllabus?.methods.map((method, index) => ({
          id: selectedStudentSyllabus.courseId * 1000 + index + 501,
          courseId: selectedStudentSyllabus.courseId,
          name: method.name,
          weight: method.weight,
          items: [],
        })) ?? []
        : assessmentMethods,
    [assessmentMethods, isStudent, selectedStudentSyllabus],
  )
  const displayIndicatorMatrix = isStudent ? [] : indicatorMatrix
  const canEdit = editableRoles.includes(activeRole)
  const totalWeight = displayAssessmentMethods.reduce((sum, method) => sum + method.weight, 0)
  const indicators = useMemo(() => indicatorTree.flatMap((requirement) => requirement.indicators), [indicatorTree])
  const indicatorNameMap = useMemo(
    () => Object.fromEntries(indicators.map((indicator) => [String(indicator.id), indicator.code])),
    [indicators],
  )
  const objectiveIndicatorCodes = useMemo(() => {
    const map = new Map<string, string[]>()

    if (isStudent && selectedStudentSyllabus) {
      selectedStudentSyllabus.objectives.forEach((objective, index) => {
        map.set(String(selectedStudentSyllabus.courseId * 1000 + index + 1), objective.indicatorCodes)
      })
      return map
    }

    displayIndicatorMatrix.forEach((item) => {
      const key = String(item.courseObjectiveId)
      const code = indicatorNameMap[String(item.indicatorPointId)]
      if (!code) return

      map.set(key, [...(map.get(key) ?? []), `${code}(${item.weight.toFixed(2)})`])
    })

    return map
  }, [displayIndicatorMatrix, indicatorNameMap, isStudent, selectedStudentSyllabus])

  useEffect(() => {
    if (isStudent) return

    void fetchProgramSchemes()
  }, [fetchProgramSchemes, isStudent])

  useEffect(() => {
    if (!isStudent) return

    clearBaseError()
    clearCourseError()
    setSelectedSchemeId(null)
    setStudentLoading(true)
    setStudentError(null)

    void getStudentSyllabusList()
      .then(setStudentSyllabi)
      .catch((error: unknown) => {
        setStudentSyllabi([])
        setStudentError(error instanceof Error ? error.message : "学生课程大纲加载失败")
      })
      .finally(() => setStudentLoading(false))
  }, [clearBaseError, clearCourseError, isStudent])

  useEffect(() => {
    if (isStudent) return
    if (selectedSchemeId || programSchemes.length === 0) return

    setSelectedSchemeId((programSchemes.find((scheme) => scheme.status === 1) ?? programSchemes[0]).id)
  }, [isStudent, programSchemes, selectedSchemeId])

  useEffect(() => {
    if (isStudent) return

    void fetchCourses({
      pageNum: 1,
      pageSize: 100,
      keyword: keyword.trim() || undefined,
      schemeId: selectedSchemeId ?? undefined,
    })
  }, [fetchCourses, isStudent, keyword, selectedSchemeId])

  useEffect(() => {
    if (!selectedCourse) {
      setSelectedCourseId(null)
      return
    }

    setSelectedCourseId(selectedCourse.id)
  }, [selectedCourse])

  useEffect(() => {
    if (!selectedCourse) return
    if (isStudent) return

    if (activeRole === "DIRECTOR") {
      void fetchIndicatorTree(selectedCourse.schemeId)
      void fetchIndicatorMatrix(selectedCourse.id)
    }

    if (activeRole === "COORDINATOR") {
      void fetchObjectives(selectedCourse.id)
      void fetchAssessmentMethods(selectedCourse.id)
    }
  }, [activeRole, fetchAssessmentMethods, fetchIndicatorMatrix, fetchIndicatorTree, fetchObjectives, isStudent, selectedCourse])

  const displayError = isStudent ? studentError : error
  const displayLoading = isStudent ? studentLoading : loading

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <BookOpen size={16} />
          课程质量管理
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            课程主数据
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            展示真实接口中的课程、课程目标、指标点支撑关系与考核方式。
          </p>
        </div>
      </header>

      {displayError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{displayError}</p>
      ) : null}

      {!isStudent ? <div className="flex flex-wrap gap-2">
        {programSchemes.map((scheme) => (
          <button
            className={[
              "rounded-lg border px-3 py-2 text-sm font-extrabold transition",
              scheme.id === selectedSchemeId
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            ].join(" ")}
            key={scheme.id}
            onClick={() => setSelectedSchemeId(scheme.id)}
            type="button"
          >
            {scheme.versionName}
          </button>
        ))}
      </div> : null}

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <CourseList
          courses={courses}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSelect={setSelectedCourseId}
          selectedCourseId={selectedCourseId}
        />

        <div className="grid gap-5">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-3.5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">
                  {selectedCourse ? `${selectedCourse.courseCode} ${selectedCourse.courseName}` : "未选择课程"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCourse ? `${selectedCourse.courseType ?? "未分类"} / ${selectedCourse.semester ?? "未设置学期"} / ${selectedCourse.credits} 学分` : "请先选择课程"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                  {roleLabels[activeRole]}
                </span>
                {canEdit ? (
                  <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled type="button">
                    <PencilLine size={16} />
                    编辑课程
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 p-4">
              <section>
                <h3 className="m-0 border-l-4 border-blue-700 pl-2 text-base font-extrabold text-slate-800">
                  课程目标
                </h3>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {displayObjectives.map((objective) => (
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={objective.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <strong className="text-blue-700">{objective.objectiveCode}</strong>
                        <span className="text-xs font-bold text-slate-500">
                          {objectiveIndicatorCodes.get(String(objective.id))?.join(", ") ?? "未关联指标点"}
                        </span>
                      </div>
                      <p className="m-0 text-sm leading-6 text-slate-700">{objective.content}</p>
                    </article>
                  ))}
                  {displayObjectives.length === 0 ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-400">
                      {displayLoading ? "正在加载课程目标..." : "暂无课程目标"}
                    </p>
                  ) : null}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="m-0 border-l-4 border-emerald-600 pl-2 text-base font-extrabold text-slate-800">
                    考核比例
                  </h3>
                  <span className={Math.abs(totalWeight - 1) < 0.001 || Math.abs(totalWeight - 100) < 0.001 ? "text-sm font-extrabold text-emerald-600" : "text-sm font-extrabold text-red-600"}>
                    合计 {percent(totalWeight)}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                  {displayAssessmentMethods.map((method) => (
                    <article
                      className="rounded-lg border border-slate-200 p-3 text-center transition hover:border-blue-200 hover:bg-blue-50"
                      key={method.id}
                    >
                      <p className="m-0 text-sm font-bold text-slate-500">{method.name}</p>
                      <strong className="mt-2 block text-2xl leading-none font-extrabold text-slate-950">
                        {percent(method.weight)}
                      </strong>
                      <p className="mt-2 text-xs font-semibold text-slate-500">{method.items?.length ?? 0} 个考核细项</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <FileText size={19} className="text-blue-700" />
                课程基本信息
              </h2>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-3 2xl:grid-cols-1">
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">课程代码</p>
                  <p className="m-0 mt-1">{selectedCourse?.courseCode ?? "-"}</p>
                </div>
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">课程名称</p>
                  <p className="m-0 mt-1">{selectedCourse?.courseName ?? "-"}</p>
                </div>
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">学分学时</p>
                  <p className="m-0 mt-1">
                    {selectedCourse ? `${selectedCourse.credits} 学分 / ${selectedCourse.hours} 学时` : "-"}
                  </p>
                </div>
              </div>
            </section>

            <aside className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <Settings2 size={19} className="text-blue-700" />
                  考核细项
                </h2>
                <div className="mt-3 grid max-h-[260px] gap-3 overflow-y-auto pr-1">
                  {displayAssessmentMethods.flatMap((method) =>
                    (method.items ?? []).map((item) => {
                      const objective = displayObjectives.find((target) => target.id === item.courseObjectiveId)

                      return (
                        <div className="rounded-lg border border-slate-200 p-3" key={item.id}>
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-sm text-slate-900">{item.name}</strong>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                              {method.name}
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            满分 {item.maxScore} / 支撑 {objective?.objectiveCode ?? "-"}
                          </p>
                        </div>
                      )
                    }),
                  )}
                  {displayAssessmentMethods.every((method) => !method.items || method.items.length === 0) ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                      暂无考核细项
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <GitBranch size={19} className="text-blue-700" />
                  指标点支撑
                </h2>
                <div className="mt-3 grid max-h-[260px] gap-3 overflow-y-auto pr-1">
                  {displayIndicatorMatrix.map((item) => (
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3" key={`${item.courseObjectiveId}-${item.indicatorPointId}`}>
                      <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
                      <div>
                        <p className="m-0 text-sm font-extrabold text-slate-900">
                          {displayObjectives.find((objective) => objective.id === item.courseObjectiveId)?.objectiveCode ?? "CO"} 支撑 {indicatorNameMap[String(item.indicatorPointId)] ?? "-"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">权重 {item.weight.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {displayIndicatorMatrix.length === 0 ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                      暂无指标点支撑关系
                    </p>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
