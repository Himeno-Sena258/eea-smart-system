import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileUp,
  GraduationCap,
  Save,
  Table2,
  UsersRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUiStore } from "@/stores"
import { evidenceMaterialsMock, scoreTableMock, teachingClassMonitors } from "./mock/teaching-classes-mock"

const threshold = 0.68

const objectiveCodeMap: Record<number, string> = {
  1001: "CO1",
  1002: "CO2",
}

const levelLabelMap = {
  HIGH: "高档样卷",
  MEDIUM: "中档样卷",
  LOW: "低档样卷",
} as const

function CoordinatorView() {
  const maxAverage = Math.max(...teachingClassMonitors.map((item) => item.averageScore))

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">教学班数量</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">{teachingClassMonitors.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="m-0 text-sm font-bold text-emerald-700">学生总数</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-emerald-800">
            {teachingClassMonitors.reduce((sum, item) => sum + item.studentCount, 0)}
          </strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="m-0 text-sm font-bold text-amber-700">均分极差</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-amber-800">7.5</strong>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <BarChart3 size={19} className="text-blue-700" />
          教学班横向监控
        </h2>
        <div className="mt-5 grid gap-4">
          {teachingClassMonitors.map((item) => {
            const isLow = item.attainmentAverage < threshold

            return (
              <article className="grid gap-3 rounded-lg border border-slate-200 p-4 lg:grid-cols-[220px_minmax(0,1fr)_120px]" key={item.teachingClass.id}>
                <div>
                  <h3 className="m-0 text-base font-extrabold text-slate-950">{item.teachingClass.className}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.teachingClass.teacherName} / {item.studentCount} 人</p>
                </div>
                <div className="grid content-center gap-2">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                    <span>班级均分 {item.averageScore}</span>
                    <span>达成均值 {item.attainmentAverage.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={isLow ? "h-2 rounded-full bg-red-600" : "h-2 rounded-full bg-blue-700"}
                      style={{ width: `${(item.averageScore / maxAverage) * 100}%` }}
                    />
                  </div>
                </div>
                <div className={isLow ? "text-right text-sm font-extrabold text-red-700" : "text-right text-sm font-extrabold text-emerald-600"}>
                  {isLow ? `${item.lowObjective} 预警` : "整体稳定"}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function InstructorView() {
  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <Table2 size={19} className="text-blue-700" />
              分项成绩单
            </h2>
            <p className="mt-1 text-sm text-slate-500">SE-302 软件工程 01 班</p>
          </div>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
            <Save size={16} />
            保存成绩
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-center text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="border-b border-r border-slate-200 p-3 text-left">学号</th>
                <th className="border-b border-r border-slate-200 p-3 text-left">姓名</th>
                {scoreTableMock.assessmentItems.map((item) => (
                  <th className="border-b border-r border-slate-200 bg-blue-50 p-3" key={item.id}>
                    {item.name} [{objectiveCodeMap[Number(item.courseObjectiveId)]}] ({item.maxScore})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoreTableMock.students.map((student) => (
                <tr className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60" key={student.id}>
                  <td className="border-r border-slate-100 p-3 text-left font-mono text-slate-600">{student.studentNo}</td>
                  <td className="border-r border-slate-100 p-3 text-left font-bold text-slate-900">{student.realName}</td>
                  {scoreTableMock.assessmentItems.map((item) => {
                    const value = student.scores[item.id]
                    const isLow = typeof value === "number" && value / item.maxScore < threshold

                    return (
                      <td className="border-r border-slate-100 p-3" key={item.id}>
                        <input
                          className={isLow ? "h-8 w-20 rounded-md border border-red-200 bg-red-50 text-center font-bold text-red-700" : "h-8 w-20 rounded-md border border-slate-200 bg-white text-center font-bold text-slate-800"}
                          defaultValue={value ?? ""}
                          type="number"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <FileUp size={19} className="text-blue-700" />
          佐证材料归档
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500">
            <FileUp size={24} />
            <p className="mt-2 text-sm font-bold">上传高档样卷</p>
            <p className="mt-1 text-xs text-red-500">未上传</p>
          </div>
          {evidenceMaterialsMock.map((material) => (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5" key={material.id}>
              <CheckCircle2 className="text-emerald-600" size={22} />
              <p className="mt-3 text-sm font-extrabold text-emerald-900">{levelLabelMap[material.levelTag]}</p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">{material.fileName}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StudentView() {
  const student = scoreTableMock.students[0]

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <GraduationCap size={19} className="text-blue-700" />
          我的成绩明细
        </h2>
        <p className="mt-1 text-sm text-slate-500">仅展示本人在 SE-302 软件工程中的各项考核实际得分。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 p-4">考核项</th>
              <th className="border-b border-slate-200 p-4">满分</th>
              <th className="border-b border-slate-200 p-4 text-blue-700">我的得分</th>
              <th className="border-b border-slate-200 p-4">支撑目标</th>
              <th className="border-b border-slate-200 p-4">状态</th>
            </tr>
          </thead>
          <tbody>
            {scoreTableMock.assessmentItems.map((item) => {
              const value = student.scores[item.id] ?? 0
              const isLow = value / item.maxScore < threshold

              return (
                <tr className={isLow ? "border-b border-slate-100 bg-red-50/50" : "border-b border-slate-100"} key={item.id}>
                  <td className="p-4 font-bold text-slate-900">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.maxScore}</td>
                  <td className={isLow ? "p-4 text-lg font-extrabold text-red-700" : "p-4 text-lg font-extrabold text-slate-950"}>
                    {value}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      {objectiveCodeMap[Number(item.courseObjectiveId)]}
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
      </div>
    </section>
  )
}

export function TeachingClassesPage() {
  const activeRole = useUiStore((state) => state.activeRole)

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <UsersRound size={16} />
          教学班与成绩
        </p>
        <div>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              教学班质量工作台
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              围绕教学班聚合名单、成绩、材料和班级层面质量数据。
            </p>
          </div>
        </div>
      </header>

      {activeRole === "COORDINATOR" ? <CoordinatorView /> : null}
      {activeRole === "INSTRUCTOR" ? <InstructorView /> : null}
      {activeRole === "STUDENT" ? <StudentView /> : null}
      {activeRole !== "COORDINATOR" && activeRole !== "INSTRUCTOR" && activeRole !== "STUDENT" ? (
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
