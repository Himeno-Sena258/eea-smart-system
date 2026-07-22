import { BookOpen, CheckCircle2, FileText, GitBranch, Layers3, PencilLine, Plus, Search, Settings2, Trash2, Upload } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
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
import { roleLabels } from "@/constants/role-options"
import { formatCourseObjectiveLabel } from "@/lib/course-objective-label"
import type {
  AssessmentMethod,
  AssessmentMethodPayload,
  AssessmentStandard,
  CoordinatorCourse,
  Course,
  CourseObjective,
  CourseResource,
  ID,
  StudentCourse,
  StudentSyllabus,
  TeacherCourse,
  TeachingContentItem,
} from "@/models"
import { getCoordinatorCourseList, getStudentCourseList, getStudentSyllabusList, getTeacherCourseList } from "@/services"
import { useBaseStore, useCourseStore, useUiStore } from "@/stores"

const editableRoles = ["DIRECTOR", "COORDINATOR"]

const percent = (value: number) => {
  const normalized = value > 1 ? value : value * 100
  return `${Math.round(normalized)}%`
}

function ObjectiveDialog({
  objective,
  trigger,
  onSave,
}: {
  objective?: CourseObjective | null
  trigger: ReactNode
  onSave: (payload: { objectiveCode: string; content: string }) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [objectiveCode, setObjectiveCode] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setObjectiveCode(objective?.objectiveCode ?? "")
    setContent(objective?.content ?? "")
  }, [objective, open])

  const handleSave = async () => {
    if (!objectiveCode.trim() || !content.trim()) {
      setError("请填写课程目标编码和内容")
      return
    }
    try {
      await onSave({ objectiveCode: objectiveCode.trim(), content: content.trim() })
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存课程目标失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{objective ? "编辑课程目标" : "新增课程目标"}</DialogTitle>
          <DialogDescription>维护课程目标编码和目标描述。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">目标编码</span>
            <Input value={objectiveCode} onChange={(event) => setObjectiveCode(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">目标描述</span>
            <textarea
              className="min-h-28 rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-blue-400"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">保存目标</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AssessmentMethodsDialog({
  methods,
  objectives,
  trigger,
  onSave,
}: {
  methods: AssessmentMethod[]
  objectives: CourseObjective[]
  trigger: ReactNode
  onSave: (methods: AssessmentMethodPayload[]) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [draftMethods, setDraftMethods] = useState<AssessmentMethodPayload[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setDraftMethods(methods.length > 0
      ? methods.map((method) => ({
          name: method.name,
          weight: method.weight,
          items: (method.items ?? []).map((item) => ({
            name: item.name,
            maxScore: item.maxScore,
            courseObjectiveId: item.courseObjectiveId,
          })),
        }))
      : [{ name: "期末考试", weight: 0.6, items: [] }])
  }, [methods, open])

  const updateMethod = (index: number, patch: Partial<AssessmentMethodPayload>) => {
    setDraftMethods((current) => current.map((method, currentIndex) => currentIndex === index ? { ...method, ...patch } : method))
  }

  const updateItem = (methodIndex: number, itemIndex: number, patch: Partial<NonNullable<AssessmentMethodPayload["items"]>[number]>) => {
    setDraftMethods((current) => current.map((method, currentIndex) => {
      if (currentIndex !== methodIndex) return method
      const items = method.items ?? []
      return {
        ...method,
        items: items.map((item, currentItemIndex) => currentItemIndex === itemIndex ? { ...item, ...patch } : item),
      }
    }))
  }

  const handleSave = async () => {
    const normalized = draftMethods.map((method) => ({
      ...method,
      name: method.name.trim(),
      weight: Number(method.weight),
      items: (method.items ?? []).map((item) => ({
        name: item.name.trim(),
        maxScore: Number(item.maxScore),
        courseObjectiveId: Number(item.courseObjectiveId),
      })),
    }))

    if (normalized.some((method) => !method.name || !Number.isFinite(method.weight))) {
      setError("请完整填写考核方式名称和权重")
      return
    }
    if (normalized.flatMap((method) => method.items ?? []).some((item) => !item.name || !Number.isFinite(item.maxScore) || !item.courseObjectiveId)) {
      setError("请完整填写考核细项名称、满分和课程目标")
      return
    }

    try {
      await onSave(normalized)
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存考核配置失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-96px)] overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">考核方式与细项</DialogTitle>
          <DialogDescription>维护考核方式权重，以及每个考核细项绑定的课程目标。</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[560px] gap-4 overflow-y-auto pr-1">
          {draftMethods.map((method, methodIndex) => (
            <article className="grid gap-3 rounded-lg border border-slate-200 p-3" key={methodIndex}>
              <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                <Input value={method.name} onChange={(event) => updateMethod(methodIndex, { name: event.target.value })} />
                <Input type="number" step="0.01" value={method.weight} onChange={(event) => updateMethod(methodIndex, { weight: Number(event.target.value) })} />
                <Button
                  disabled={draftMethods.length === 1}
                  onClick={() => setDraftMethods((current) => current.filter((_, currentIndex) => currentIndex !== methodIndex))}
                  type="button"
                  variant="outline"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="grid gap-2">
                {(method.items ?? []).map((item, itemIndex) => (
                  <div className="grid gap-2 rounded-lg bg-slate-50 p-2 md:grid-cols-[1fr_100px_160px_auto]" key={itemIndex}>
                    <Input placeholder="细项名称" value={item.name} onChange={(event) => updateItem(methodIndex, itemIndex, { name: event.target.value })} />
                    <Input type="number" placeholder="满分" value={item.maxScore} onChange={(event) => updateItem(methodIndex, itemIndex, { maxScore: Number(event.target.value) })} />
                    <select
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
                      value={item.courseObjectiveId}
                      onChange={(event) => updateItem(methodIndex, itemIndex, { courseObjectiveId: Number(event.target.value) })}
                    >
                      <option value={0}>选择目标</option>
                      {objectives.map((objective) => (
                        <option key={objective.id} value={objective.id}>{formatCourseObjectiveLabel(objective, { maxLength: 14 })}</option>
                      ))}
                    </select>
                    <Button
                      onClick={() => updateMethod(methodIndex, { items: (method.items ?? []).filter((_, currentIndex) => currentIndex !== itemIndex) })}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => updateMethod(methodIndex, {
                    items: [...(method.items ?? []), { name: "", maxScore: 100, courseObjectiveId: objectives[0]?.id ?? 0 }],
                  })}
                  type="button"
                  variant="outline"
                >
                  <Plus size={16} />
                  添加细项
                </Button>
              </div>
            </article>
          ))}
          <Button onClick={() => setDraftMethods((current) => [...current, { name: "", weight: 0, items: [] }])} type="button" variant="outline">
            <Plus size={16} />
            添加考核方式
          </Button>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">保存考核配置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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
  const isDirector = activeRole === "DIRECTOR"
  const isCoordinator = activeRole === "COORDINATOR"
  const isTeacher = activeRole === "INSTRUCTOR"
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
  const resources = useCourseStore((state) => state.resources)
  const teachingContents = useCourseStore((state) => state.teachingContents)
  const assessmentStandards = useCourseStore((state) => state.assessmentStandards)
  const loading = useCourseStore((state) => state.loading)
  const error = useCourseStore((state) => state.error)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const fetchCourseDetail = useCourseStore((state) => state.fetchCourseDetail)
  const createObjective = useCourseStore((state) => state.createObjective)
  const updateObjective = useCourseStore((state) => state.updateObjective)
  const deleteObjective = useCourseStore((state) => state.deleteObjective)
  const updateCourse = useCourseStore((state) => state.updateCourse)
  const importCourses = useCourseStore((state) => state.importCourses)
  const fetchObjectives = useCourseStore((state) => state.fetchObjectives)
  const fetchIndicatorMatrix = useCourseStore((state) => state.fetchIndicatorMatrix)
  const fetchAssessmentMethods = useCourseStore((state) => state.fetchAssessmentMethods)
  const saveAssessmentMethods = useCourseStore((state) => state.saveAssessmentMethods)
  const fetchResources = useCourseStore((state) => state.fetchResources)
  const fetchTeachingContents = useCourseStore((state) => state.fetchTeachingContents)
  const fetchAssessmentStandards = useCourseStore((state) => state.fetchAssessmentStandards)
  const clearCourseError = useCourseStore((state) => state.clearError)

  const [keyword, setKeyword] = useState("")
  const [selectedSchemeId, setSelectedSchemeId] = useState<ID | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<ID | null>(null)
  const [studentSyllabi, setStudentSyllabi] = useState<StudentSyllabus[]>([])
  const [roleCourses, setRoleCourses] = useState<Course[]>([])
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSchemeId, setEditSchemeId] = useState<ID>(0)
  const [editCourseCode, setEditCourseCode] = useState("")
  const [editCourseName, setEditCourseName] = useState("")
  const [editCredits, setEditCredits] = useState("")
  const [editHours, setEditHours] = useState("")
  const [editCourseType, setEditCourseType] = useState("")
  const [editSemester, setEditSemester] = useState("")

  const courses = isDirector ? coursesPage?.records ?? [] : roleCourses
  const filteredCourses = useMemo(
    () => courses.filter((course) => {
      const value = keyword.trim().toLowerCase()
      if (!value || isDirector) return true
      return `${course.courseCode} ${course.courseName}`.toLowerCase().includes(value)
    }),
    [courses, isDirector, keyword],
  )
  const selectedCourse = useMemo(
    () => filteredCourses.find((course) => course.id === selectedCourseId) ?? filteredCourses[0] ?? null,
    [filteredCourses, selectedCourseId],
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
  const firstAssessmentItem = displayAssessmentMethods.flatMap((method) => method.items ?? [])[0] ?? null
  const displayResources = resources as CourseResource[]
  const displayTeachingContents = teachingContents as TeachingContentItem[]
  const displayAssessmentStandards = assessmentStandards as AssessmentStandard[]
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
  const objectiveLabelMap = useMemo(
    () => new Map(displayObjectives.map((objective) => [String(objective.id), formatCourseObjectiveLabel(objective, { maxLength: 16 })])),
    [displayObjectives],
  )

  useEffect(() => {
    if (!isDirector) return

    void fetchProgramSchemes()
  }, [fetchProgramSchemes, isDirector])

  useEffect(() => {
    clearBaseError()
    clearCourseError()
    setSelectedSchemeId(null)
    setRoleCourses([])
    setRoleLoading(true)
    setRoleError(null)

    if (isDirector) {
      setRoleLoading(false)
      return
    }

    const request =
      isStudent
        ? Promise.all([getStudentCourseList(), getStudentSyllabusList()]).then(([courseList, syllabusList]) => {
          setStudentSyllabi(syllabusList)
          return courseList.map((course: StudentCourse): Course => {
            const syllabus = syllabusList.find((item) => String(item.courseId) === String(course.courseId))
            return {
              id: course.courseId,
              schemeId: 0,
              courseCode: course.courseCode,
              courseName: course.courseName,
              credits: course.credits,
              hours: syllabus?.hours ?? 0,
              courseType: course.teachingClassName,
              semester: course.semester,
            }
          })
        })
        : isCoordinator
          ? getCoordinatorCourseList().then((courseList) => courseList.map((course: CoordinatorCourse): Course => ({
            id: course.courseId,
            schemeId: 0,
            courseCode: course.courseCode ?? `课程 ${course.courseId}`,
            courseName: course.courseName,
            credits: course.credits ?? 0,
            hours: course.hours ?? 0,
            courseType: "负责课程",
            semester: course.semester,
          })))
          : isTeacher
            ? getTeacherCourseList().then((courseList) => courseList.map((course: TeacherCourse): Course => ({
              id: course.courseId,
              schemeId: 0,
              courseCode: course.courseCode,
              courseName: course.courseName,
              credits: course.credits,
              hours: 0,
              courseType: `${course.teachingClassCount} 个教学班`,
            })))
            : Promise.resolve([])

    void request
      .then(setRoleCourses)
      .catch((error: unknown) => {
        setRoleCourses([])
        setStudentSyllabi([])
        setRoleError(error instanceof Error ? error.message : "课程列表加载失败")
      })
      .finally(() => setRoleLoading(false))
  }, [clearBaseError, clearCourseError, isCoordinator, isDirector, isStudent, isTeacher])

  useEffect(() => {
    if (!isDirector) return
    if (selectedSchemeId || programSchemes.length === 0) return

    setSelectedSchemeId((programSchemes.find((scheme) => scheme.status === 1) ?? programSchemes[0]).id)
  }, [isDirector, programSchemes, selectedSchemeId])

  useEffect(() => {
    if (!isDirector) return

    void fetchCourses({
      pageNum: 1,
      pageSize: 100,
      keyword: keyword.trim() || undefined,
      schemeId: selectedSchemeId ?? undefined,
    })
  }, [fetchCourses, isDirector, keyword, selectedSchemeId])

  useEffect(() => {
    if (!selectedCourse) {
      setSelectedCourseId(null)
      return
    }

    setSelectedCourseId(selectedCourse.id)
  }, [selectedCourse])

  useEffect(() => {
    if (!selectedCourse) return

    void fetchResources(selectedCourse.id)
    void fetchTeachingContents(selectedCourse.id)

    if (isStudent) return

    if (isDirector) {
      void fetchIndicatorTree(selectedCourse.schemeId)
    }

    if (isCoordinator || isDirector || isTeacher) {
      void fetchObjectives(selectedCourse.id)
      void fetchAssessmentMethods(selectedCourse.id)
      void fetchIndicatorMatrix(selectedCourse.id)
    }
  }, [fetchAssessmentMethods, fetchIndicatorMatrix, fetchIndicatorTree, fetchObjectives, fetchResources, fetchTeachingContents, isCoordinator, isDirector, isStudent, isTeacher, selectedCourse])

  useEffect(() => {
    if (!firstAssessmentItem || isStudent) return

    void fetchAssessmentStandards(firstAssessmentItem.id)
  }, [fetchAssessmentStandards, firstAssessmentItem, isStudent])

  const displayError = error ?? roleError
  const displayLoading = isDirector ? loading : roleLoading

  const refreshSelectedCourseConfig = async () => {
    if (!selectedCourse) return
    await Promise.all([
      fetchObjectives(selectedCourse.id),
      fetchAssessmentMethods(selectedCourse.id),
      isDirector ? fetchIndicatorMatrix(selectedCourse.id) : Promise.resolve([]),
    ])
  }

  const handleImportCourses = async (file: File | null) => {
    if (!file) return
    setRoleError(null)
    setActionMessage(null)
    try {
      const result = await importCourses(file)
      await fetchCourses({
        pageNum: 1,
        pageSize: 100,
        keyword: keyword.trim() || undefined,
        schemeId: selectedSchemeId ?? undefined,
      })
      setActionMessage(`课程导入完成：成功 ${result.successRows} 行，失败 ${result.failedRows} 行`)
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : "课程导入失败")
    }
  }

  const handleDeleteObjective = async (objective: CourseObjective) => {
    if (!window.confirm(`确认删除课程目标「${objective.objectiveCode}」吗？`)) return
    setRoleError(null)
    setActionMessage(null)
    try {
      await deleteObjective(objective.id)
      await refreshSelectedCourseConfig()
      setActionMessage("课程目标已删除")
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : "删除课程目标失败")
    }
  }

  const handleOpenEditCourse = async () => {
    if (!selectedCourse) return

    setRoleError(null)
    setActionMessage(null)
    try {
      const detail = await fetchCourseDetail(selectedCourse.id)
      setEditSchemeId(detail.schemeId)
      setEditCourseCode(detail.courseCode ?? "")
      setEditCourseName(detail.courseName ?? "")
      setEditCredits(String(detail.credits ?? ""))
      setEditHours(String(detail.hours ?? ""))
      setEditCourseType(detail.courseType ?? "")
      setEditSemester(detail.semester ?? "")
      setEditDialogOpen(true)
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : "课程详情加载失败")
    }
  }

  const handleSaveCourse = async () => {
    if (!selectedCourse) return

    setRoleError(null)
    setActionMessage(null)
    const credits = Number(editCredits)
    const hours = Number(editHours)

    if (!editCourseCode.trim() || !editCourseName.trim() || !Number.isFinite(credits) || !Number.isFinite(hours)) {
      setRoleError("请完整填写课程代码、课程名称、学分和学时")
      return
    }

    try {
      const updated = await updateCourse(selectedCourse.id, {
        schemeId: editSchemeId,
        courseCode: editCourseCode.trim(),
        courseName: editCourseName.trim(),
        credits,
        hours,
        courseType: editCourseType.trim() || undefined,
        semester: editSemester.trim() || undefined,
      })

      if (isDirector) {
        await fetchCourses({
          pageNum: 1,
          pageSize: 100,
          keyword: keyword.trim() || undefined,
          schemeId: selectedSchemeId ?? undefined,
        })
      } else {
        setRoleCourses((current) => current.map((course) => (course.id === updated.id ? { ...course, ...updated } : course)))
      }

      setSelectedCourseId(updated.id)
      setEditDialogOpen(false)
      setActionMessage("课程信息已保存")
    } catch (requestError) {
      setRoleError(requestError instanceof Error ? requestError.message : "课程信息保存失败")
    }
  }

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <BookOpen size={16} />
          课程质量管理
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            课程主数据
          </h1>
          {isDirector ? (
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">
              <Upload size={16} />
              导入课程
              <input
                accept=".xls,.xlsx"
                className="hidden"
                onChange={(event) => {
                  void handleImportCourses(event.target.files?.[0] ?? null)
                  event.target.value = ""
                }}
                type="file"
              />
            </label>
          ) : null}
        </div>
      </header>

      {displayError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{displayError}</p>
      ) : null}
      {actionMessage ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{actionMessage}</p>
      ) : null}

      {isDirector ? <div className="flex flex-wrap gap-2">
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
          courses={filteredCourses}
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
                  <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={!selectedCourse || loading} onClick={handleOpenEditCourse} type="button">
                    <PencilLine size={16} />
                    编辑课程
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 p-4">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 border-l-4 border-blue-700 pl-2 text-base font-extrabold text-slate-800">
                    课程目标
                  </h3>
                  {canEdit && selectedCourse ? (
                    <ObjectiveDialog
                      onSave={async (payload) => {
                        await createObjective(selectedCourse.id, payload)
                        await refreshSelectedCourseConfig()
                        setActionMessage("课程目标已保存")
                      }}
                      trigger={<Button size="sm" type="button" variant="outline"><Plus size={15} />新增目标</Button>}
                    />
                  ) : null}
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {displayObjectives.map((objective) => (
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={objective.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <strong className="text-blue-700" title={formatCourseObjectiveLabel(objective, { mode: "full" })}>
                          {formatCourseObjectiveLabel(objective, { maxLength: 18 })}
                        </strong>
                        <div className="flex items-center gap-1">
                         <span className="text-xs font-bold text-slate-500">
                            {objective.indicatorPointCodes?.join(", ") ?? "未关联指标点"}
                          </span>
                          {canEdit && !isStudent ? (
                            <>
                              <ObjectiveDialog
                                objective={objective}
                                onSave={async (payload) => {
                                  await updateObjective(objective.id, payload)
                                  await refreshSelectedCourseConfig()
                                  setActionMessage("课程目标已保存")
                                }}
                                trigger={<Button size="icon-sm" type="button" variant="ghost"><PencilLine size={14} /></Button>}
                              />
                              <Button onClick={() => void handleDeleteObjective(objective)} size="icon-sm" type="button" variant="ghost"><Trash2 size={14} /></Button>
                            </>
                          ) : null}
                        </div>
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
                  {canEdit && selectedCourse ? (
                    <AssessmentMethodsDialog
                      methods={displayAssessmentMethods}
                      objectives={displayObjectives}
                      onSave={async (methods) => {
                        await saveAssessmentMethods(selectedCourse.id, { methods })
                        await refreshSelectedCourseConfig()
                        setActionMessage("考核配置已保存")
                      }}
                      trigger={<Button size="sm" type="button" variant="outline"><PencilLine size={15} />配置考核</Button>}
                    />
                  ) : null}
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
                  <Layers3 size={19} className="text-blue-700" />
                  教学内容
                </h2>
                <div className="mt-3 grid max-h-[220px] gap-2 overflow-y-auto pr-1">
                  {displayTeachingContents.map((item) => (
                    <div className="rounded-lg border border-slate-200 p-3" key={item.id ?? `${item.title}-${item.sortOrder}`}>
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm text-slate-900">{item.title}</strong>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">{item.hours} 学时</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        支撑目标 {item.objectiveIds.length > 0 ? item.objectiveIds.map((id) => objectiveLabelMap.get(String(id)) ?? `目标 ${id}`).join("，") : "-"}
                      </p>
                    </div>
                  ))}
                  {displayTeachingContents.length === 0 ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                      暂无教学内容
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <FileText size={19} className="text-blue-700" />
                  课程资源
                </h2>
                <div className="mt-3 grid max-h-[220px] gap-2 overflow-y-auto pr-1">
                  {displayResources.map((item) => {
                    const resourceHref = item.previewUrl || (/^https?:\/\//.test(item.filePath) ? item.filePath : "")
                    const className = "rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-900 no-underline transition hover:border-blue-200 hover:bg-blue-50"
                    const content = (
                      <>
                        <span className="block">{item.fileName}</span>
                        <span className="mt-1 block text-xs text-slate-500">{item.resourceType} / {item.description ?? "无说明"}</span>
                      </>
                    )

                    return resourceHref ? (
                      <a
                        className={className}
                        href={resourceHref}
                        key={item.id}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className={className} key={item.id}>
                        {content}
                      </div>
                    )
                  })}
                  {displayResources.length === 0 ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                      暂无课程资源
                    </p>
                  ) : null}
                </div>
              </section>

              {!isStudent ? <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                            满分 {item.maxScore} / 支撑 {objective ? formatCourseObjectiveLabel(objective, { maxLength: 14 }) : "-"}
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
              </section> : null}

              {!isStudent ? <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <Settings2 size={19} className="text-blue-700" />
                  评分标准
                </h2>
                <div className="mt-3 grid max-h-[260px] gap-2 overflow-y-auto pr-1">
                  {displayAssessmentStandards.map((item) => (
                    <div className="rounded-lg border border-slate-200 p-3" key={item.id ?? `${item.level}-${item.minScore}`}>
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm text-slate-900">{item.level}</strong>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                          {item.minScore}-{item.maxScore}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                    </div>
                  ))}
                  {displayAssessmentStandards.length === 0 ? (
                    <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                      暂无评分标准
                    </p>
                  ) : null}
                </div>
              </section> : null}

              {!isStudent ? <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                          {formatCourseObjectiveLabel(displayObjectives.find((objective) => objective.id === item.courseObjectiveId), { maxLength: 14 })} 支撑 {indicatorNameMap[String(item.indicatorPointId)] ?? "-"}
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
              </section> : null}
            </aside>
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white shadow-2xl sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-950">编辑课程</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">课程代码</span>
              <Input value={editCourseCode} onChange={(event) => setEditCourseCode(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">课程名称</span>
              <Input value={editCourseName} onChange={(event) => setEditCourseName(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">学分</span>
              <Input type="number" value={editCredits} onChange={(event) => setEditCredits(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">学时</span>
              <Input type="number" value={editHours} onChange={(event) => setEditHours(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">课程类型</span>
              <Input value={editCourseType} onChange={(event) => setEditCourseType(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">开课学期</span>
              <Input value={editSemester} onChange={(event) => setEditSemester(event.target.value)} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} type="button">取消</Button>
            <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={loading} onClick={handleSaveCourse} type="button">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
