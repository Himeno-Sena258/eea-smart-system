import { BookOpen, CheckCircle2, FileText, Layers3, PencilLine, Search, Settings2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { roleLabels } from "@/constants/role-options"
import { useUiStore } from "@/stores"
import { courseQualityMocks, type CourseQualityMock } from "./mock/courses-mock"

const editableRoles = ["DIRECTOR", "COORDINATOR"]

const percent = (value: number) => `${Math.round(value * 100)}%`

function CourseList({
  courses,
  selectedCourseId,
  onSelect,
}: {
  courses: CourseQualityMock[]
  selectedCourseId: number
  onSelect: (courseId: number) => void
}) {
  return (
    <aside className="h-full rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
          <Input className="h-10 bg-slate-50 pl-9" placeholder="搜索课程" readOnly />
        </label>
      </div>
      <div className="grid max-h-[442px] gap-1 overflow-y-auto p-2">
        {courses.map(({ course }) => {
          const isActive = course.id === selectedCourseId

          return (
            <button
              className={[
                "grid gap-1 rounded-lg p-2.5 text-left transition",
                isActive ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50",
              ].join(" ")}
              key={course.id}
              onClick={() => onSelect(Number(course.id))}
              type="button"
            >
              <span className="text-sm font-extrabold">{course.courseCode} {course.courseName}</span>
              <span className={isActive ? "text-xs font-bold text-blue-600" : "text-xs text-slate-500"}>
                {course.courseType} / {course.credits} 学分 / {course.hours} 学时
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export function CoursesPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [selectedCourseId, setSelectedCourseId] = useState(Number(courseQualityMocks[0].course.id))
  const selectedCourse = useMemo(
    () => courseQualityMocks.find((item) => item.course.id === selectedCourseId) ?? courseQualityMocks[0],
    [selectedCourseId],
  )
  const canEdit = editableRoles.includes(activeRole)
  const objectiveEditable = activeRole === "COORDINATOR"
  const totalWeight = selectedCourse.assessmentMethods.reduce((sum, method) => sum + method.weight, 0)

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <BookOpen size={16} />
          课程质量管理
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            课程质量体系
          </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
            维护课程大纲、课程目标 CO 及其对应的考核方式权重。
          </p>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <CourseList courses={courseQualityMocks} selectedCourseId={selectedCourseId} onSelect={setSelectedCourseId} />

        <div className="grid gap-5">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-3.5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">
                  {selectedCourse.course.courseCode} {selectedCourse.course.courseName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCourse.course.courseType} / {selectedCourse.course.semester} / {selectedCourse.course.credits} 学分
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                  {roleLabels[activeRole]}
                </span>
                {canEdit ? (
                  <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
                    <PencilLine size={16} />
                    修改大纲与考核
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 p-4">
              <section>
                <h3 className="m-0 border-l-4 border-blue-700 pl-2 text-base font-extrabold text-slate-800">
                  课程目标 (Course Objectives)
                </h3>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {selectedCourse.objectives.map((objective) => (
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={objective.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <strong className="text-blue-700">{objective.objectiveCode}</strong>
                        <span className="text-xs font-bold text-slate-500">
                          支撑指标点: {selectedCourse.indicatorCodes[Number(objective.id)]?.join(", ")}
                        </span>
                      </div>
                      {objectiveEditable ? (
                        <textarea
                          className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                          defaultValue={objective.content}
                        />
                      ) : (
                        <p className="m-0 text-sm leading-6 text-slate-700">{objective.content}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="m-0 border-l-4 border-emerald-600 pl-2 text-base font-extrabold text-slate-800">
                    考核比例
                  </h3>
                  <span className={totalWeight === 1 ? "text-sm font-extrabold text-emerald-600" : "text-sm font-extrabold text-red-600"}>
                    合计 {percent(totalWeight)}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                  {selectedCourse.assessmentMethods.map((method) => (
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
                课程大纲摘要
              </h2>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-3 2xl:grid-cols-1">
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">课程简介</p>
                  <p className="m-0 mt-1">{selectedCourse.syllabus.courseIntroduction}</p>
                </div>
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">教学方式</p>
                  <p className="m-0 mt-1">{selectedCourse.syllabus.teachingMethod}</p>
                </div>
                <div>
                  <p className="m-0 text-xs font-extrabold text-slate-400">主要内容</p>
                  <p className="m-0 mt-1">{selectedCourse.syllabus.content}</p>
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
                  {selectedCourse.assessmentMethods.flatMap((method) =>
                    (method.items ?? []).map((item) => {
                      const objective = selectedCourse.objectives.find((target) => target.id === item.courseObjectiveId)

                      return (
                        <div className="rounded-lg border border-slate-200 p-3" key={item.id}>
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-sm text-slate-900">{item.name}</strong>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                              {method.name}
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            满分 {item.maxScore} / 支撑 {objective?.objectiveCode}
                          </p>
                        </div>
                      )
                    }),
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <Layers3 size={19} className="text-blue-700" />
                  课程资源
                </h2>
                <div className="mt-3 grid max-h-[260px] gap-3 overflow-y-auto pr-1">
                  {selectedCourse.resources.map((resource) => (
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3" key={resource.id}>
                      <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
                      <div>
                        <p className="m-0 text-sm font-extrabold text-slate-900">{resource.fileName}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
