type CourseObjectiveLike = {
  objectiveCode?: string
  coCode?: string
  code?: string
  content?: string
  objectiveContent?: string
}

const normalizeText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? ""

export const getCourseObjectiveCode = (objective?: CourseObjectiveLike | null) =>
  normalizeText(objective?.objectiveCode ?? objective?.coCode ?? objective?.code) || "课程目标"

export const getCourseObjectiveContent = (objective?: CourseObjectiveLike | null) =>
  normalizeText(objective?.content ?? objective?.objectiveContent)

export const summarizeCourseObjective = (content?: string | null, maxLength = 18) => {
  const value = normalizeText(content)
  if (!value) return ""
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

export const formatCourseObjectiveLabel = (
  objective?: CourseObjectiveLike | null,
  options?: { mode?: "compact" | "short" | "full"; maxLength?: number },
) => {
  const mode = options?.mode ?? "short"
  const code = getCourseObjectiveCode(objective)
  const content = getCourseObjectiveContent(objective)

  if (mode === "compact" || !content) return code
  if (mode === "full") return `${code} · ${content}`
  return `${code} · ${summarizeCourseObjective(content, options?.maxLength ?? 18)}`
}
