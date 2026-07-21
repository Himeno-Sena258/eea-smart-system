import { BarChart3, CheckCircle2, ClipboardCheck, Eye, Send, ToggleLeft, ToggleRight } from "lucide-react"
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
import type { ID, JsonValue, MySurveyAnswer, SurveyQuestion, SurveyQuestionnaire, SurveyStatistics } from "@/models"
import {
  closeSurvey,
  getMySurveyAnswers,
  getSurveyPage,
  getSurveyQuestions,
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

const parseOptions = (options?: JsonValue | string) => {
  if (!options) return []
  if (Array.isArray(options)) return options.map(String)
  if (typeof options !== "string") return []

  try {
    const parsed = JSON.parse(options) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const parseAnswerJson = (value?: string) => {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, JsonValue>
      : {}
  } catch {
    return {}
  }
}

function SurveyStatsDialog({
  questions,
  statistics,
  trigger,
}: {
  questions: SurveyQuestion[]
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
          <DialogDescription>按问卷题目查看已提交答卷。</DialogDescription>
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

          {(statistics?.answers ?? []).map((answer) => {
            const parsedAnswer = parseAnswerJson(answer.rawAnswersJson)
            const entries = questions.length > 0
              ? questions.map((question) => ({
                  label: `${question.questionCode}. ${question.title}`,
                  value: parsedAnswer[question.questionCode],
                }))
              : Object.entries(parsedAnswer).map(([key, value]) => ({ label: key, value }))

            return (
              <article className="rounded-lg border border-slate-200 p-3" key={answer.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="m-0 text-sm font-extrabold text-slate-950">答卷 #{answer.id}</h3>
                  <p className="m-0 text-xs font-semibold text-slate-500">
                    用户 {answer.userId} / {formatDate(answer.submittedAt)}
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  {entries.map((entry) => (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm" key={entry.label}>
                      <p className="m-0 font-bold text-slate-500">{entry.label}</p>
                      <p className="mt-1 font-extrabold text-slate-950">{String(entry.value ?? "未填写")}</p>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}

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
  onSubmitted: (surveyId: ID) => void | Promise<void>
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [dialogQuestions, setDialogQuestions] = useState<SurveyQuestion[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setLoadingQuestions(true)
    setError(null)
    setMessage(null)
    setAnswers({})
    void getSurveyQuestions(survey.id)
      .then(setDialogQuestions)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoadingQuestions(false))
  }, [open, survey.id])

  const handleSubmit = async () => {
    setError(null)
    setMessage(null)

    try {
      if (dialogQuestions.length === 0) {
        setError("当前问卷还没有配置题目")
        return
      }

      const payload = Object.fromEntries(dialogQuestions.map((question) => [
        question.questionCode,
        answers[question.questionCode] ?? "",
      ])) as Record<string, JsonValue>
      setSubmitting(true)
      await submitSurveyAnswer(survey.id, payload)
      setMessage("提交成功")
      window.alert("问卷提交成功")
      await onSubmitted(survey.id)
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{survey.title}</DialogTitle>
          <DialogDescription>请按题目填写本次问卷。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {loadingQuestions ? (
            <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-400">
              正在加载题目...
            </p>
          ) : dialogQuestions.length > 0 ? (
            <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
              {dialogQuestions.map((question) => {
                const options = parseOptions(question.options)
                const value = answers[question.questionCode] ?? ""

                return (
                  <article className="grid gap-2 rounded-lg border border-slate-200 p-3" key={question.id ?? question.questionCode}>
                    <span className="text-sm font-extrabold text-slate-950">
                      {question.questionCode}. {question.title}
                    </span>
                    {question.questionType === "TEXT" ? (
                      <textarea
                        className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                        onChange={(event) => setAnswers((current) => ({ ...current, [question.questionCode]: event.target.value }))}
                        placeholder="请输入文字反馈"
                        value={value}
                      />
                    ) : question.questionType === "SCORE" ? (
                      <div className="flex flex-wrap gap-2">
                        {(options.length > 0 ? options : ["1", "2", "3", "4", "5"]).map((option) => {
                          const checked = value === option

                          return (
                            <button
                              className={
                                checked
                                  ? "grid size-10 place-items-center rounded-full border border-blue-600 bg-blue-600 text-sm font-extrabold text-white shadow-sm"
                                  : "grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-sm font-extrabold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              }
                              key={option}
                              onClick={() => setAnswers((current) => ({ ...current, [question.questionCode]: option }))}
                              type="button"
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    ) : options.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {options.map((option) => (
                          <button
                            className={
                              value === option
                                ? "rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm"
                                : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            }
                            key={option}
                            onClick={() => setAnswers((current) => ({ ...current, [question.questionCode]: option }))}
                            type="button"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                        onChange={(event) => setAnswers((current) => ({ ...current, [question.questionCode]: event.target.value }))}
                        placeholder={question.questionType === "SCORE" ? "请输入评分" : "请输入答案"}
                        value={value}
                      />
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-400">
              当前问卷还没有配置题目
            </p>
          )}
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
          {message ? <p className="m-0 text-sm font-bold text-emerald-600">{message}</p> : null}
          <div className="flex justify-end">
            <Button className="bg-orange-500 text-white hover:bg-orange-600" disabled={submitting || loadingQuestions || dialogQuestions.length === 0} onClick={handleSubmit} type="button">
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
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null)
  const [myAnswers, setMyAnswers] = useState<MySurveyAnswer[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManage = activeRole === "ADMIN" || activeRole === "DIRECTOR"
  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedId) ?? surveys[0] ?? null,
    [selectedId, surveys],
  )
  const openSurveys = surveys.filter((survey) => survey.status === 1)
  const submittedAnswerMap = useMemo(
    () => new Map(myAnswers.map((answer) => [String(answer.questionnaireId), answer])),
    [myAnswers],
  )

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

  const refreshMyAnswers = async () => {
    try {
      const answers = await getMySurveyAnswers()
      setMyAnswers(answers)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "加载提交状态失败")
    }
  }

  useEffect(() => {
    void refreshSurveys()
  }, [])

  useEffect(() => {
    if (activeRole !== "STUDENT") {
      setMyAnswers([])
      setSuccessMessage(null)
      return
    }

    void refreshMyAnswers()
  }, [activeRole])

  useEffect(() => {
    if (!selectedSurvey) {
      setQuestions([])
      return
    }

    void getSurveyQuestions(selectedSurvey.id)
      .then(setQuestions)
      .catch((requestError: Error) => setError(requestError.message))
  }, [selectedSurvey])

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

  const handleSurveySubmitted = async (surveyId: ID) => {
    setSuccessMessage("问卷已提交")
    setMyAnswers((current) => {
      const withoutCurrent = current.filter((answer) => String(answer.questionnaireId) !== String(surveyId))
      return [{ id: surveyId, questionnaireId: surveyId, submittedAt: new Date().toISOString() }, ...withoutCurrent]
    })
    await refreshMyAnswers()
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
      {successMessage ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </p>
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
                  questions={questions}
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

            {questions.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {questions.map((question) => (
                  <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={question.id ?? question.questionCode}>
                    <p className="m-0 text-sm font-extrabold text-slate-950">
                      {question.questionCode}. {question.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{question.questionType}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-400">
                当前问卷还没有配置题目
              </p>
            )}
          </section>
        </div>
      ) : null}

      {activeRole === "STUDENT" ? (
        <section className="grid content-start gap-3">
          {openSurveys.map((survey) => {
            const submittedAnswer = submittedAnswerMap.get(String(survey.id))

            return (
              <article
                className={
                  submittedAnswer
                    ? "rounded-lg border border-l-4 border-emerald-400 bg-white p-3.5 shadow-sm"
                    : "rounded-lg border border-l-4 border-orange-400 bg-white p-3.5 shadow-sm"
                }
                key={survey.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2
                      className={
                        submittedAnswer
                          ? "m-0 text-lg font-extrabold text-emerald-800"
                          : "m-0 text-lg font-extrabold text-orange-800"
                      }
                    >
                      {survey.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      发布时间: {formatDate(survey.createdAt)} / {typeLabelMap[survey.type] ?? survey.type}
                    </p>
                    {submittedAnswer ? (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 size={14} />
                        已提交 / {formatDate(submittedAnswer.submittedAt)}
                      </p>
                    ) : null}
                  </div>
                  {submittedAnswer ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-700">
                      <CheckCircle2 size={14} />
                      已完成
                    </span>
                  ) : (
                    <AnswerDialog
                      onSubmitted={handleSurveySubmitted}
                      survey={survey}
                      trigger={<Button className="bg-orange-500 text-white hover:bg-orange-600" type="button"><Send size={16} />填写答卷</Button>}
                    />
                  )}
                </div>
              </article>
            )
          })}
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
