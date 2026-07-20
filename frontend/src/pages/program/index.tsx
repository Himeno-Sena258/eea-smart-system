import { CheckCircle2, ClipboardList, FilePlus2, GitBranch, Layers3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  curriculumCoursesMock,
  flattenIndicators,
  indicatorTreeMock,
  programMatrixMock,
  programSchemesMock,
} from "./mock/program-mock"

const statusMap = {
  0: { label: "草稿", className: "bg-amber-100 text-amber-700" },
  1: { label: "已生效", className: "bg-emerald-100 text-emerald-700" },
  2: { label: "已归档", className: "bg-slate-100 text-slate-600" },
} as const

const activeScheme = programSchemesMock.find((scheme) => scheme.status === 1) ?? programSchemesMock[0]
const indicators = flattenIndicators(indicatorTreeMock)

const getMatrixCell = (courseId: number, indicatorPointId: number) =>
  programMatrixMock.find((item) => item.courseId === courseId && item.indicatorPointId === indicatorPointId)

export function ProgramPage() {
  const indicatorCount = indicatorTreeMock.reduce((sum, requirement) => sum + requirement.indicators.length, 0)

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <ClipboardList size={16} />
            培养方案管理
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              培养方案与矩阵管理
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              定义毕业要求 GR 及指标点拆解，构建课程对指标点的支撑矩阵。
            </p>
          </div>
        </div>
        <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
          <FilePlus2 size={16} />
          新建版本
        </Button>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">方案版本</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">{programSchemesMock.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="m-0 text-sm font-bold text-emerald-700">毕业要求</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-emerald-800">{indicatorTreeMock.length}</strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="m-0 text-sm font-bold text-amber-700">指标点</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-amber-800">{indicatorCount}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="m-0 text-sm font-bold text-slate-500">课程数量</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-slate-950">{curriculumCoursesMock.length}</strong>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="grid content-start gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <Layers3 size={19} className="text-blue-700" />
              方案版本
            </h2>
            <div className="mt-4 grid gap-3">
              {programSchemesMock.map((scheme) => {
                const status = statusMap[scheme.status]

                return (
                  <article
                    className={scheme.id === activeScheme.id ? "rounded-lg border border-blue-200 bg-blue-50 p-3" : "rounded-lg border border-slate-200 p-3"}
                    key={scheme.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="m-0 text-sm font-extrabold text-slate-950">{scheme.versionName}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{scheme.majorName} / {scheme.grade} 级</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <ShieldCheck size={19} className="text-blue-700" />
              发布检查
            </h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              {["毕业要求已初始化", "指标点已拆解", "课程体系已维护", "支撑矩阵权重已校验"].map((item) => (
                <div className="flex items-center gap-2" key={item}>
                  <CheckCircle2 className="text-emerald-600" size={16} />
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="grid gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">当前生效: {activeScheme.versionName}</h2>
                <p className="mt-1 text-sm text-slate-500">{activeScheme.majorName} / {activeScheme.grade} 级</p>
              </div>
              <Button variant="outline" type="button">
                编辑基础信息
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {indicatorTreeMock.map((requirement) => (
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={requirement.id}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-blue-700">{requirement.code}</strong>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
                      {requirement.indicators.length} 个指标点
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-extrabold text-slate-950">{requirement.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.content}</p>
                  <div className="mt-3 grid gap-2">
                    {requirement.indicators.map((indicator) => (
                      <div className="rounded-md bg-white p-2 text-xs leading-5 text-slate-600" key={indicator.id}>
                        <span className="font-extrabold text-slate-800">{indicator.code}</span> {indicator.content}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <GitBranch size={19} className="text-blue-700" />
                课程-指标点支撑矩阵
              </h2>
              <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
                保存矩阵
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[860px] border-collapse text-center text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="w-48 border-r border-b border-slate-200 p-3 text-left">课程 \ 指标点</th>
                    {indicators.map((indicator) => (
                      <th className="border-r border-b border-slate-200 bg-blue-50/60 p-3" key={indicator.id}>
                        {indicator.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {curriculumCoursesMock.map((course) => (
                    <tr className="border-b border-slate-100" key={course.id}>
                      <td className="border-r border-slate-200 p-3 text-left">
                        <p className="m-0 font-extrabold text-slate-900">{course.courseName}</p>
                        <p className="mt-1 text-xs text-slate-500">{course.courseCode} / {course.courseType}</p>
                      </td>
                      {indicators.map((indicator) => {
                        const cell = getMatrixCell(Number(course.id), Number(indicator.id))

                        return (
                          <td className="border-r border-slate-100 p-3" key={indicator.id}>
                            {cell ? (
                              <span className="inline-flex min-w-16 justify-center rounded-md bg-blue-50 px-2 py-1 font-extrabold text-blue-700">
                                {cell.display} ({cell.weight.toFixed(2)})
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
