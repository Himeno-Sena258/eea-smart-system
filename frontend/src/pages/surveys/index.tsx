import { BarChart3, ClipboardCheck, FilePlus2, Send } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUiStore } from "@/stores"
import { surveyMocks, type SurveyMock } from "./mock/surveys-mock"

const statusMap = {
  0: { label: "草稿", className: "bg-amber-100 text-amber-700" },
  1: { label: "开放中", className: "bg-emerald-100 text-emerald-700" },
  2: { label: "已关闭", className: "bg-slate-100 text-slate-600" },
} as const

const typeLabelMap: Record<string, string> = {
  COURSE: "课程评价",
  GRADUATE: "毕业生评价",
  EMPLOYER: "用人单位评价",
}

const responseRate = (survey: SurveyMock) => Math.round((survey.answeredCount / survey.totalCount) * 100)

function SurveyDetailDialog({
  survey,
  trigger,
}: {
  survey: SurveyMock
  trigger: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="!flex !flex-col overflow-hidden bg-white p-0 shadow-2xl ring-1 ring-slate-200"
        style={{
          width: "560px",
          maxWidth: "calc(100vw - 48px)",
          height: "520px",
          maxHeight: "calc(100vh - 180px)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-slate-200 p-4 pr-12">
          <DialogTitle className="text-xl font-extrabold text-slate-950">{survey.questionnaire.title}</DialogTitle>
          <DialogDescription>
            {typeLabelMap[survey.questionnaire.type]} / {survey.target} / 截止 {survey.deadline}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4">
          {survey.questions.map((question) => {
            const stat = survey.statistics.items.find((item) => item.questionCode === question.questionCode)

            return (
              <article className="rounded-lg border border-slate-200 p-4" key={question.questionCode}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="m-0 text-base font-extrabold text-slate-950">
                      {question.questionCode}. {question.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {typeof question.score === "number" ? "评分题" : "文本题"}
                    </p>
                  </div>
                  {typeof stat?.averageScore === "number" ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                      均分 {stat.averageScore.toFixed(2)}
                    </span>
                  ) : null}
                </div>

                {stat?.distribution ? (
                  <div className="mt-4 grid gap-2">
                    {Object.entries(stat.distribution).reverse().map(([score, count]) => (
                      <div className="grid grid-cols-[36px_minmax(0,1fr)_40px] items-center gap-2 text-xs font-bold text-slate-600" key={score}>
                        <span>{score}分</span>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-blue-700" style={{ width: `${(count / Math.max(survey.answeredCount, 1)) * 100}%` }} />
                        </div>
                        <span className="text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {stat?.texts ? (
                  <div className="mt-4 grid gap-2">
                    {stat.texts.map((text) => (
                      <p className="m-0 rounded-md bg-slate-50 p-2 text-sm text-slate-600" key={text}>{text}</p>
                    ))}
                  </div>
                ) : null}

                {!stat ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    待作答内容将在提交后进入统计。
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DirectorSurveyCard({
  survey,
  active,
  onSelect,
}: {
  survey: SurveyMock
  active: boolean
  onSelect: () => void
}) {
  const status = statusMap[survey.questionnaire.status]

  return (
    <button
      className={active ? "rounded-lg border border-blue-200 bg-blue-50 p-3 text-left" : "rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-extrabold text-slate-950">{survey.questionnaire.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{typeLabelMap[survey.questionnaire.type]} / {survey.target}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${status.className}`}>{status.label}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-blue-700" style={{ width: `${responseRate(survey)}%` }} />
        </div>
        <span className="text-sm font-extrabold text-blue-700">{responseRate(survey)}%</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        回收 {survey.answeredCount}/{survey.totalCount} / 截止 {survey.deadline}
      </p>
    </button>
  )
}

function DirectorView() {
  const [selectedId, setSelectedId] = useState(Number(surveyMocks[0].questionnaire.id))
  const selectedSurvey = useMemo(
    () => surveyMocks.find((survey) => survey.questionnaire.id === selectedId) ?? surveyMocks[0],
    [selectedId],
  )

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="grid max-h-[560px] content-start gap-2 overflow-y-auto pr-1">
        {surveyMocks.map((survey) => (
          <DirectorSurveyCard
            active={survey.questionnaire.id === selectedId}
            key={survey.questionnaire.id}
            onSelect={() => setSelectedId(Number(survey.questionnaire.id))}
            survey={survey}
          />
        ))}
      </aside>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <BarChart3 size={19} className="text-blue-700" />
              统计报表
            </h2>
            <p className="mt-1 text-sm text-slate-500">{selectedSurvey.questionnaire.title}</p>
          </div>
          <SurveyDetailDialog
            survey={selectedSurvey}
            trigger={<Button variant="outline" type="button">查看问卷</Button>}
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="m-0 text-sm font-bold text-blue-700">回收率</p>
            <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{responseRate(selectedSurvey)}%</strong>
          </article>
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="m-0 text-sm font-bold text-emerald-700">已提交</p>
            <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">{selectedSurvey.answeredCount}</strong>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="m-0 text-sm font-bold text-slate-500">题目数量</p>
            <strong className="mt-2 block text-2xl leading-none font-extrabold text-slate-950">{selectedSurvey.questions.length}</strong>
          </article>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedSurvey.statistics.items.slice(0, 2).map((item) => (
              <div className="rounded-lg bg-white p-3" key={item.questionCode}>
                <p className="m-0 text-xs font-extrabold text-slate-400">{item.questionCode}</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {typeof item.averageScore === "number" ? `均分 ${item.averageScore.toFixed(2)}` : "文本反馈已收集"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            具体题目、分布和文本反馈已收起，可通过“查看问卷”打开弹窗查看。
          </p>
        </div>
      </section>
    </div>
  )
}

function StudentView() {
  const openSurveys = surveyMocks.filter((survey) => survey.questionnaire.status === 1)

  return (
    <div className="grid gap-5">
      <section className="grid content-start gap-3">
        {openSurveys.map((survey) => (
          <article className="rounded-lg border border-l-4 border-orange-400 bg-white p-3.5 shadow-sm" key={survey.questionnaire.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-orange-800">{survey.questionnaire.title}</h2>
                <p className="mt-1 text-sm text-slate-500">截止日期: {survey.deadline} / {typeLabelMap[survey.questionnaire.type]}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SurveyDetailDialog
                  survey={survey}
                  trigger={<Button variant="outline" type="button">查看问卷</Button>}
                />
                <Button className="bg-orange-500 text-white hover:bg-orange-600" type="button">
                  <Send size={16} />
                  立即填写
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export function SurveysPage() {
  const activeRole = useUiStore((state) => state.activeRole)

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <ClipboardCheck size={16} />
            问卷与评价
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              问卷调查与间接评价
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              面向毕业生、在校生和用人单位收集课程体系与毕业要求达成评价。
            </p>
          </div>
        </div>
        {activeRole === "DIRECTOR" ? (
          <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
            <FilePlus2 size={16} />
            发布新问卷
          </Button>
        ) : null}
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">问卷总数</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{surveyMocks.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">开放中</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">
            {surveyMocks.filter((survey) => survey.questionnaire.status === 1).length}
          </strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="m-0 text-sm font-bold text-amber-700">累计回收</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-amber-800">
            {surveyMocks.reduce((sum, survey) => sum + survey.answeredCount, 0)}
          </strong>
        </article>
      </section>

      {activeRole === "DIRECTOR" ? <DirectorView /> : null}
      {activeRole === "STUDENT" ? <StudentView /> : null}
    </section>
  )
}
