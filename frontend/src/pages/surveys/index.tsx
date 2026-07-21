import { BarChart3, ClipboardCheck, Eye, Send, ToggleLeft, ToggleRight } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ID, JsonValue, SurveyQuestionnaire, SurveyStatistics } from "@/models"
import {
  closeSurvey,
  getSurveyPage,
  getSurveyStatistics,
  openSurvey,
  submitSurveyAnswer,
} from "@/services"
import { useUiStore } from "@/stores"

const statusMap = {
  0: { label: "已关闭", className: "bg-slate-100 text-slate-600" },
  1: { label: "开放中", className: "bg-emerald-100 text-emerald-700" },
  2: { label: "已归档", className: "bg-slate-100 text-slate-600" },
} as const

const typeLabelMap: Record<string, string> = {
  COURSE: "课程评价",
  STU_CO: "学生课程目标达成问卷",
  GRADUATE: "毕业生评价",
  EMPLOYER: "用人单位评价",
}

const formatDate = (value?: string) => value?.slice(0, 10) ?? "-"

function SurveyStatsDialog({
  statistics,
  trigger,
}: {
  statistics: SurveyStatistics | null
  trigger: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="!flex !flex-col overflow-hidden bg-white p-0 shadow-2xl ring-1 ring-slate-200"
        style={{ width: "680px", maxWidth: "calc(100vw - 48px)", height: "520px", maxHeight: "calc(100vh - 160px)" }}
      >
        <DialogHeader className="shrink-0 border-b border-slate-200 p-4 pr-12">
          <DialogTitle className="text-xl font-extrabold text-slate-950">
            {statistics?.title ?? "问卷统计"}
          </DialogTitle>
          <DialogDescription>
            当前后端返回总答卷数与原始答卷 JSON，暂未提供题目分布和均分统计。
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4">
          <section className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="m-0 text-sm font-bold text-blue-700">答卷总数</p>
              <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">
                {statistics?.totalAnswers ?? 0}
              </strong>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="m-0 text-sm font-bold text-slate-500">问卷ID</p>
              <strong className="mt-2 block text-2xl leading-none font-extrabold text-slate-950">
                {statistics?.questionnaireId ?? "-"}
              </strong>
            </article>
          </section>

          {(statistics?.answers ?? []).map((answer) => (
            <article className="rounded-lg border border-slate-200 p-3" key={answer.id}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="m-0 text-sm font-extrabold text-slate-950">答卷 #{answer.id}</h3>
                <p className="m-0 text-xs font-semibold text-slate-500">
                  用户 {answer.userId} / {formatDate(answer.submittedAt)}
                </p>
              </div>
              <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                {answer.rawAnswersJson}
              </pre>
            </article>
          ))}

          {(statistics?.answers ?? []).length === 0 ? (
            <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-400">
              暂无答卷
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SurveyCard({
  survey,
  active,
  onSelect,
}: {
  survey: SurveyQuestionnaire
  active: boolean
  onSelect: () => void
}) {
  const status = statusMap[survey.status]

  return (
    <button
      className={active ? "rounded-lg border border-blue-200 bg-blue-50 p-3 text-left" : "rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-extrabold text-slate-950">{survey.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{typeLabelMap[survey.type] ?? survey.type}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${status.className}`}>{status.label}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">发布 {formatDate(survey.createdAt)}</p>
    </button>
  )
}

function AnswerDialog({
  survey,
  onSubmitted,
  trigger,
}: {
  survey: SurveyQuestionnaire
  onSubmitted: () => void
  trigger: ReactNode
}) {
  const [rawAnswer, setRawAnswer] = useState('{\n  "feedback": "课程目标达成情况良好"\n}')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setMessage(null)

    try {
      const payload = JSON.parse(rawAnswer) as Record<string, JsonValue>
      setSubmitting(true)
      await submitSurveyAnswer(survey.id, payload)
      setMessage("提交成功")
      onSubmitted()
    } catch (requestError) {
      if (requestError instanceof SyntaxError) {
        setError("答案必须是合法 JSON")
      } else {
        setError(requestError instanceof Error ? requestError.message : "提交失败")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{survey.title}</DialogTitle>
          <DialogDescription>
            后端当前以原始 JSON 保存答卷，暂未提供题目明细结构。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <textarea
            className="min-h-48 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            onChange={(event) => setRawAnswer(event.target.value)}
            value={rawAnswer}
          />
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
          {message ? <p className="m-0 text-sm font-bold text-emerald-600">{message}</p> : null}
          <div className="flex justify-end">
            <Button className="bg-orange-500 text-white hover:bg-orange-600" disabled={submitting} onClick={handleSubmit} type="button">
              <Send size={16} />
              提交答卷
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SurveysPage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const [surveys, setSurveys] = useState<SurveyQuestionnaire[]>([])
  const [selectedId, setSelectedId] = useState<ID | null>(null)
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManage = activeRole === "ADMIN" || activeRole === "DIRECTOR"
  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedId) ?? surveys[0] ?? null,
    [selectedId, surveys],
  )
  const openSurveys = surveys.filter((survey) => survey.status === 1)

  const refreshSurveys = async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await getSurveyPage({ pageNum: 1, pageSize: 100 })
      setSurveys(page.records)
      setSelectedId((current) => current ?? page.records[0]?.id ?? null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "加载问卷失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshSurveys()
  }, [])

  useEffect(() => {
    if (!canManage || !selectedSurvey) {
      setStatistics(null)
      return
    }

    void getSurveyStatistics(selectedSurvey.id)
      .then(setStatistics)
      .catch((requestError: Error) => setError(requestError.message))
  }, [canManage, selectedSurvey])

  const handleToggleStatus = async () => {
    if (!selectedSurvey) return

    setLoading(true)
    setError(null)
    try {
      if (selectedSurvey.status === 1) {
        await closeSurvey(selectedSurvey.id)
      } else {
        await openSurvey(selectedSurvey.id)
      }
      await refreshSurveys()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "状态更新失败")
    } finally {
      setLoading(false)
    }
  }

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
          </div>
        </div>
      </header>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">问卷总数</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{surveys.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">开放中</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">{openSurveys.length}</strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="m-0 text-sm font-bold text-amber-700">当前答卷</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-amber-800">{statistics?.totalAnswers ?? "-"}</strong>
        </article>
      </section>

      {canManage ? (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="grid max-h-[560px] content-start gap-2 overflow-y-auto pr-1">
            {surveys.map((survey) => (
              <SurveyCard
                active={survey.id === selectedSurvey?.id}
                key={survey.id}
                onSelect={() => setSelectedId(survey.id)}
                survey={survey}
              />
            ))}
            {surveys.length === 0 ? (
              <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-400">
                {loading ? "正在加载问卷..." : "暂无问卷"}
              </p>
            ) : null}
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                  <BarChart3 size={19} className="text-blue-700" />
                  统计报表
                </h2>
                <p className="mt-1 text-sm text-slate-500">{selectedSurvey?.title ?? "未选择问卷"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSurvey ? (
                  <Button disabled={loading} onClick={handleToggleStatus} variant="outline" type="button">
                    {selectedSurvey.status === 1 ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    {selectedSurvey.status === 1 ? "关闭问卷" : "开放问卷"}
                  </Button>
                ) : null}
                <SurveyStatsDialog
                  statistics={statistics}
                  trigger={<Button variant="outline" type="button"><Eye size={16} />查看答卷</Button>}
                />
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="m-0 text-sm font-bold text-blue-700">答卷数</p>
                <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{statistics?.totalAnswers ?? 0}</strong>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="m-0 text-sm font-bold text-slate-500">问卷类型</p>
                <strong className="mt-2 block text-lg font-extrabold text-slate-950">
                  {selectedSurvey ? typeLabelMap[selectedSurvey.type] ?? selectedSurvey.type : "-"}
                </strong>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="m-0 text-sm font-bold text-slate-500">发布时间</p>
                <strong className="mt-2 block text-lg font-extrabold text-slate-950">{formatDate(selectedSurvey?.createdAt)}</strong>
              </article>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="m-0 text-sm leading-6 font-semibold text-amber-800">
                后端当前没有问卷题目明细表，统计接口也没有提供按题目的均分、分布和文本聚合；这里仅展示真实返回的答卷数量与原始答卷。
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {activeRole === "STUDENT" ? (
        <section className="grid content-start gap-3">
          {openSurveys.map((survey) => (
            <article className="rounded-lg border border-l-4 border-orange-400 bg-white p-3.5 shadow-sm" key={survey.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="m-0 text-lg font-extrabold text-orange-800">{survey.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    发布时间: {formatDate(survey.createdAt)} / {typeLabelMap[survey.type] ?? survey.type}
                  </p>
                </div>
                <AnswerDialog
                  onSubmitted={() => void refreshSurveys()}
                  survey={survey}
                  trigger={<Button className="bg-orange-500 text-white hover:bg-orange-600" type="button"><Send size={16} />填写答卷</Button>}
                />
              </div>
            </article>
          ))}
          {openSurveys.length === 0 ? (
            <p className="m-0 rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-400">
              暂无开放问卷
            </p>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
