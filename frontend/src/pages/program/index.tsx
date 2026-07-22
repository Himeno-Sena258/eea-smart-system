import { type ReactNode, useEffect, useMemo, useState } from "react"
import { CheckCircle2, ClipboardList, GitBranch, Layers3, PencilLine, Plus, ShieldCheck, Trash2 } from "lucide-react"
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
import type { CourseIndicatorMatrixItem, EducationGoal, GradIndicatorPoint, GradRequirement, ID, IndicatorTreeItem, ProgramScheme } from "@/models"
import { getCourseIndicatorMatrix } from "@/services"
import { useBaseStore, useCourseStore } from "@/stores"

const statusMap = {
  0: { label: "草稿", className: "bg-amber-100 text-amber-700" },
  1: { label: "已生效", className: "bg-emerald-100 text-emerald-700" },
  2: { label: "已归档", className: "bg-slate-100 text-slate-600" },
} as const

const flattenIndicators = (tree: IndicatorTreeItem[]) =>
  tree.flatMap((requirement) => requirement.indicators)

function SchemeDialog({
  scheme,
  trigger,
  onSaved,
}: {
  scheme?: ProgramScheme | null
  trigger: ReactNode
  onSaved: (schemeId?: ID) => Promise<void> | void
}) {
  const createProgramScheme = useBaseStore((state) => state.createProgramScheme)
  const updateProgramScheme = useBaseStore((state) => state.updateProgramScheme)
  const [open, setOpen] = useState(false)
  const [majorId, setMajorId] = useState("")
  const [versionName, setVersionName] = useState("")
  const [grade, setGrade] = useState("")
  const [status, setStatus] = useState<0 | 1 | 2>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setMajorId(scheme?.majorId ? String(scheme.majorId) : "")
    setVersionName(scheme?.versionName ?? "")
    setGrade(scheme?.grade ? String(scheme.grade) : "")
    setStatus((scheme?.status ?? 0) as 0 | 1 | 2)
  }, [open, scheme])

  const handleSave = async () => {
    const normalizedMajorId = Number(majorId)
    if (!Number.isFinite(normalizedMajorId) || normalizedMajorId <= 0 || !versionName.trim()) {
      setError("请填写专业ID和方案版本名称")
      return
    }

    const payload = {
      majorId: normalizedMajorId,
      versionName: versionName.trim(),
      grade: grade.trim() ? Number(grade) : undefined,
      status,
    }

    try {
      const saved = scheme
        ? await updateProgramScheme(scheme.id, payload)
        : await createProgramScheme(payload)
      await onSaved(saved.id)
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存方案失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{scheme ? "编辑方案" : "新建方案"}</DialogTitle>
          <DialogDescription>维护培养方案版本信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">专业ID</span>
            <Input type="number" value={majorId} onChange={(event) => setMajorId(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">版本名称</span>
            <Input value={versionName} onChange={(event) => setVersionName(event.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">年级</span>
              <Input type="number" value={grade} onChange={(event) => setGrade(event.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">状态</span>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400"
                onChange={(event) => setStatus(Number(event.target.value) as 0 | 1 | 2)}
                value={status}
              >
                <option value={0}>草稿</option>
                <option value={1}>已生效</option>
                <option value={2}>已归档</option>
              </select>
            </label>
          </div>
          {error ? <p className="m-0 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="outline">取消</Button>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">保存方案</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TextItemDialog({
  mode,
  item,
  requirementId,
  schemeId,
  trigger,
  onSaved,
}: {
  mode: "goal" | "requirement" | "indicator"
  item?: EducationGoal | GradRequirement | GradIndicatorPoint | null
  requirementId?: ID
  schemeId?: ID
  trigger: ReactNode
  onSaved: () => Promise<void> | void
}) {
  const createEducationGoal = useBaseStore((state) => state.createEducationGoal)
  const updateEducationGoal = useBaseStore((state) => state.updateEducationGoal)
  const createRequirement = useBaseStore((state) => state.createRequirement)
  const updateRequirement = useBaseStore((state) => state.updateRequirement)
  const createIndicator = useBaseStore((state) => state.createIndicator)
  const updateIndicator = useBaseStore((state) => state.updateIndicator)
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const isRequirement = mode === "requirement"

  useEffect(() => {
    if (!open) return
    setError(null)
    setCode(item && "code" in item ? item.code : "")
    setTitle(item && "title" in item ? item.title : "")
    setContent(item && "content" in item ? item.content : "")
  }, [item, open])

  const handleSave = async () => {
    if (!code.trim() || !content.trim() || (isRequirement && !title.trim())) {
      setError("请完整填写编码和内容")
      return
    }

    try {
      if (mode === "goal") {
        if (!schemeId) throw new Error("请先选择方案")
        const payload = { code: code.trim(), content: content.trim() }
        item ? await updateEducationGoal(item.id, payload) : await createEducationGoal(schemeId, payload)
      } else if (mode === "requirement") {
        if (!schemeId) throw new Error("请先选择方案")
        const payload = { code: code.trim(), title: title.trim(), content: content.trim() }
        item ? await updateRequirement(item.id, payload) : await createRequirement(schemeId, payload)
      } else {
        if (!requirementId) throw new Error("请先选择毕业要求")
        const payload = { code: code.trim(), content: content.trim() }
        item ? await updateIndicator(item.id, payload) : await createIndicator(requirementId, payload)
      }
      await onSaved()
      setOpen(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败")
    }
  }

  const titleText = mode === "goal" ? "培养目标" : mode === "requirement" ? "毕业要求" : "指标点"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-950">{item ? `编辑${titleText}` : `新增${titleText}`}</DialogTitle>
          <DialogDescription>维护编码和描述文本。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">编码</span>
            <Input value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          {isRequirement ? (
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">标题</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
          ) : null}
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">内容</span>
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
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProgramPage() {
  const programSchemes = useBaseStore((state) => state.programSchemes)
  const fetchProgramSchemes = useBaseStore((state) => state.fetchProgramSchemes)
  const fetchIndicatorTree = useBaseStore((state) => state.fetchIndicatorTree)
  const fetchEducationGoals = useBaseStore((state) => state.fetchEducationGoals)
  const initRequirements = useBaseStore((state) => state.initRequirements)
  const publishProgramScheme = useBaseStore((state) => state.publishProgramScheme)
  const archiveProgramScheme = useBaseStore((state) => state.archiveProgramScheme)
  const deleteProgramScheme = useBaseStore((state) => state.deleteProgramScheme)
  const deleteEducationGoal = useBaseStore((state) => state.deleteEducationGoal)
  const deleteRequirement = useBaseStore((state) => state.deleteRequirement)
  const deleteIndicator = useBaseStore((state) => state.deleteIndicator)
  const indicatorTree = useBaseStore((state) => state.indicatorTree)
  const educationGoals = useBaseStore((state) => state.educationGoals)
  const baseLoading = useBaseStore((state) => state.loading)
  const baseError = useBaseStore((state) => state.error)

  const curriculum = useCourseStore((state) => state.curriculum)
  const fetchCurriculum = useCourseStore((state) => state.fetchCurriculum)
  const courseError = useCourseStore((state) => state.error)

  const [selectedSchemeId, setSelectedSchemeId] = useState<ID | null>(null)
  const [courseMatrices, setCourseMatrices] = useState<Record<string, CourseIndicatorMatrixItem[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const activeScheme = useMemo<ProgramScheme | null>(() => {
    if (selectedSchemeId) return programSchemes.find((scheme) => scheme.id === selectedSchemeId) ?? null
    return programSchemes.find((scheme) => scheme.status === 1) ?? programSchemes[0] ?? null
  }, [programSchemes, selectedSchemeId])

  const indicators = useMemo(() => flattenIndicators(indicatorTree), [indicatorTree])
  const indicatorCount = indicatorTree.reduce((sum, requirement) => sum + requirement.indicators.length, 0)

  useEffect(() => {
    void fetchProgramSchemes()
  }, [fetchProgramSchemes])

  useEffect(() => {
    if (!activeScheme) return

    setSelectedSchemeId(activeScheme.id)
    void fetchEducationGoals(activeScheme.id)
    void fetchIndicatorTree(activeScheme.id)
    void fetchCurriculum(activeScheme.id)
  }, [activeScheme, fetchCurriculum, fetchEducationGoals, fetchIndicatorTree])

  useEffect(() => {
    if (curriculum.length === 0) {
      setCourseMatrices({})
      return
    }

    void Promise.allSettled(
      curriculum.map(async (course) => {
        const matrix = await getCourseIndicatorMatrix(course.id)
        return [String(course.id), matrix] as const
      }),
    ).then((results) => {
      const entries = results
        .filter((result): result is PromiseFulfilledResult<readonly [string, CourseIndicatorMatrixItem[]]> => result.status === "fulfilled")
        .map((result) => result.value)

      setCourseMatrices(Object.fromEntries(entries))
    })
  }, [curriculum])

  const getCourseIndicatorWeight = (courseId: ID, indicatorPointId: ID) => {
    const courseMatrix = courseMatrices[String(courseId)] ?? []
    const matchedItems = courseMatrix.filter((item) => item.indicatorPointId === indicatorPointId)
    const objectiveIds = new Set(matchedItems.map((item) => item.courseObjectiveId))
    const weight = matchedItems.reduce((sum, item) => sum + item.weight, 0)

    return { objectiveCount: objectiveIds.size, weight }
  }

  const refreshActiveSchemeData = async (schemeId = activeScheme?.id) => {
    if (!schemeId) return
    await Promise.all([
      fetchProgramSchemes(),
      fetchEducationGoals(schemeId),
      fetchIndicatorTree(schemeId),
      fetchCurriculum(schemeId),
    ])
  }

  const handleSchemeAction = async (action: "publish" | "archive" | "delete") => {
    if (!activeScheme) return

    setLocalError(null)
    setMessage(null)
    try {
      if (action === "publish") {
        await publishProgramScheme(activeScheme.id)
        setMessage("方案已发布")
      } else if (action === "archive") {
        await archiveProgramScheme(activeScheme.id)
        setMessage("方案已归档")
      } else {
        if (!window.confirm(`确认删除方案「${activeScheme.versionName}」吗？`)) return
        await deleteProgramScheme(activeScheme.id)
        setSelectedSchemeId(null)
        setMessage("方案已删除")
      }
      await fetchProgramSchemes()
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : "方案操作失败")
    }
  }

  const handleInitRequirements = async () => {
    if (!activeScheme) return
    setLocalError(null)
    setMessage(null)
    try {
      await initRequirements(activeScheme.id)
      await refreshActiveSchemeData(activeScheme.id)
      setMessage("毕业要求已初始化")
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : "初始化失败")
    }
  }

  const handleDeleteGoal = async (goal: EducationGoal) => {
    if (!window.confirm(`确认删除培养目标「${goal.code}」吗？`)) return
    await deleteEducationGoal(goal.id)
    await refreshActiveSchemeData()
    setMessage("培养目标已删除")
  }

  const handleDeleteRequirement = async (requirement: IndicatorTreeItem) => {
    if (!window.confirm(`确认删除毕业要求「${requirement.code}」吗？`)) return
    await deleteRequirement(requirement.id)
    await refreshActiveSchemeData()
    setMessage("毕业要求已删除")
  }

  const handleDeleteIndicator = async (indicator: GradIndicatorPoint) => {
    if (!window.confirm(`确认删除指标点「${indicator.code}」吗？`)) return
    await deleteIndicator(indicator.id)
    await refreshActiveSchemeData()
    setMessage("指标点已删除")
  }

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <ClipboardList size={16} />
            培养方案管理
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              培养方案与课程体系
            </h1>
          </div>
        </div>
      </header>

      {baseError || courseError || localError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {localError ?? baseError ?? courseError}
        </p>
      ) : null}
      {message ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">方案版本</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">{programSchemes.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="m-0 text-sm font-bold text-emerald-700">毕业要求</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-emerald-800">{indicatorTree.length}</strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="m-0 text-sm font-bold text-amber-700">指标点</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-amber-800">{indicatorCount}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="m-0 text-sm font-bold text-slate-500">课程数量</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-slate-950">{curriculum.length}</strong>
        </article>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="grid content-start gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <Layers3 size={19} className="text-blue-700" />
                方案版本
              </h2>
              <SchemeDialog
                onSaved={async (schemeId) => {
                  setSelectedSchemeId(schemeId ?? null)
                  await refreshActiveSchemeData(schemeId)
                  setMessage("方案已保存")
                }}
                trigger={<Button size="sm" type="button"><Plus size={15} />新增</Button>}
              />
            </div>
            <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
              {programSchemes.map((scheme) => {
                const status = statusMap[scheme.status]
                const isActive = scheme.id === activeScheme?.id

                return (
                  <button
                    className={isActive ? "rounded-lg border border-blue-200 bg-blue-50 p-3 text-left" : "rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"}
                    key={scheme.id}
                    onClick={() => setSelectedSchemeId(scheme.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="m-0 text-sm font-extrabold text-slate-950">{scheme.versionName}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {scheme.majorName ?? "未关联专业"} / {scheme.grade ?? "-"} 级
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </button>
                )
              })}
              {programSchemes.length === 0 ? (
                <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                  {baseLoading ? "正在加载方案..." : "暂无方案版本"}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <ShieldCheck size={19} className="text-blue-700" />
              发布检查
            </h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              {[
                { label: "毕业要求已初始化", ok: indicatorTree.length > 0 },
                { label: "指标点已拆解", ok: indicatorCount > 0 },
                { label: "课程体系已维护", ok: curriculum.length > 0 },
                { label: "支撑矩阵已维护", ok: Object.values(courseMatrices).some((items) => items.length > 0) },
              ].map((item) => (
                <div className="flex items-center gap-2" key={item.label}>
                  <CheckCircle2 className={item.ok ? "text-emerald-600" : "text-slate-300"} size={16} />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <Button disabled={!activeScheme} onClick={handleInitRequirements} type="button" variant="outline">
                初始化毕业要求
              </Button>
              <Button disabled={!activeScheme} onClick={() => void handleSchemeAction("publish")} type="button" variant="outline">
                发布方案
              </Button>
              <Button disabled={!activeScheme} onClick={() => void handleSchemeAction("archive")} type="button" variant="outline">
                归档方案
              </Button>
              <Button disabled={!activeScheme} onClick={() => void handleSchemeAction("delete")} type="button" variant="outline">
                删除方案
              </Button>
            </div>
          </section>
        </aside>

        <div className="grid min-w-0 gap-6">
          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 border-b border-slate-200 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">
                  当前方案: {activeScheme?.versionName ?? "未选择"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeScheme?.majorName ?? "未关联专业"} / {activeScheme?.grade ?? "-"} 级
                </p>
                </div>
                {activeScheme ? (
                  <SchemeDialog
                    onSaved={async (schemeId) => {
                      setSelectedSchemeId(schemeId ?? activeScheme.id)
                      await refreshActiveSchemeData(schemeId ?? activeScheme.id)
                      setMessage("方案已保存")
                    }}
                    scheme={activeScheme}
                    trigger={<Button variant="outline" type="button"><PencilLine size={16} />编辑方案</Button>}
                  />
                ) : null}
              </div>
            </div>

            <section className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 text-base font-extrabold text-slate-950">培养目标</h3>
                <TextItemDialog
                  mode="goal"
                  onSaved={() => refreshActiveSchemeData()}
                  schemeId={activeScheme?.id}
                  trigger={<Button disabled={!activeScheme} size="sm" type="button" variant="outline"><Plus size={15} />新增目标</Button>}
                />
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {educationGoals.map((goal) => (
                  <article className="rounded-lg border border-slate-200 bg-white p-3" key={goal.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="text-blue-700">{goal.code}</strong>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{goal.content}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <TextItemDialog
                          item={goal}
                          mode="goal"
                          onSaved={() => refreshActiveSchemeData()}
                          schemeId={activeScheme?.id}
                          trigger={<Button size="icon-sm" type="button" variant="ghost"><PencilLine size={15} /></Button>}
                        />
                        <Button onClick={() => void handleDeleteGoal(goal)} size="icon-sm" type="button" variant="ghost"><Trash2 size={15} /></Button>
                      </div>
                    </div>
                  </article>
                ))}
                {educationGoals.length === 0 ? (
                  <p className="m-0 rounded-lg border border-dashed border-slate-200 bg-white p-3 text-sm font-bold text-slate-400">暂无培养目标</p>
                ) : null}
              </div>
            </section>

            <div className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {indicatorTree.map((requirement) => (
                <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4" key={requirement.id}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="min-w-0 text-blue-700">{requirement.code}</strong>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
                        {requirement.indicators.length} 个指标点
                      </span>
                      <TextItemDialog
                        item={requirement}
                        mode="requirement"
                        onSaved={() => refreshActiveSchemeData()}
                        schemeId={activeScheme?.id}
                        trigger={<Button size="icon-sm" type="button" variant="ghost"><PencilLine size={15} /></Button>}
                      />
                      <Button onClick={() => void handleDeleteRequirement(requirement)} size="icon-sm" type="button" variant="ghost"><Trash2 size={15} /></Button>
                    </div>
                  </div>
                  <h3 className="mt-2 break-words text-base font-extrabold text-slate-950">{requirement.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.content}</p>
                  <div className="mt-3">
                    <TextItemDialog
                      mode="indicator"
                      onSaved={() => refreshActiveSchemeData()}
                      requirementId={requirement.id}
                      trigger={<Button size="sm" type="button" variant="outline"><Plus size={15} />新增指标点</Button>}
                    />
                  </div>
                  <div className="mt-3 grid gap-2">
                    {requirement.indicators.map((indicator) => (
                      <div className="rounded-md bg-white p-2 text-xs leading-5 text-slate-600" key={indicator.id}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="m-0 min-w-0 break-words"><span className="font-extrabold text-slate-800">{indicator.code}</span> {indicator.content}</p>
                          <div className="flex shrink-0 gap-1">
                            <TextItemDialog
                              item={indicator}
                              mode="indicator"
                              onSaved={() => refreshActiveSchemeData()}
                              requirementId={requirement.id}
                              trigger={<Button size="icon-sm" type="button" variant="ghost"><PencilLine size={14} /></Button>}
                            />
                            <Button onClick={() => void handleDeleteIndicator(indicator)} size="icon-sm" type="button" variant="ghost"><Trash2 size={14} /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <GitBranch size={19} className="text-blue-700" />
                课程-指标点支撑矩阵
              </h2>
            </div>
            <div className="max-w-full overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[720px] border-collapse text-center text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="w-44 border-r border-b border-slate-200 p-3 text-left">课程 / 指标点</th>
                    {indicators.map((indicator) => (
                      <th className="border-r border-b border-slate-200 bg-blue-50/60 p-2" key={indicator.id}>
                        {indicator.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {curriculum.map((course) => (
                    <tr className="border-b border-slate-100" key={course.id}>
                      <td className="border-r border-slate-200 p-3 text-left">
                        <p className="m-0 font-extrabold text-slate-900">{course.courseName}</p>
                        <p className="mt-1 text-xs text-slate-500">{course.courseCode} / {course.credits} 学分</p>
                      </td>
                      {indicators.map((indicator) => {
                        const cell = getCourseIndicatorWeight(course.id, indicator.id)

                        return (
                          <td className="border-r border-slate-100 p-2" key={indicator.id}>
                            {cell.objectiveCount > 0 ? (
                              <span className="inline-flex min-w-14 justify-center rounded-md bg-blue-50 px-1.5 py-1 text-xs font-extrabold text-blue-700">
                                {cell.objectiveCount} CO / {cell.weight.toFixed(2)}
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
              {curriculum.length === 0 ? (
                <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">暂无课程体系数据</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
