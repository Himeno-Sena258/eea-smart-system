import type { DateTimeString, ID, PageQuery } from "./common"

export type AttainmentAlgorithm = "WEIGHTED_AVERAGE" | string

export interface AttainmentModel {
  id: ID
  name: string
  threshold: number
  courseObjectiveAlgorithm: AttainmentAlgorithm
  requirementAlgorithm: AttainmentAlgorithm
  isDefault: boolean
}

export type AttainmentModelPayload = Omit<AttainmentModel, "id">

export interface CourseObjectiveAttainmentItem {
  courseObjectiveId: ID
  objectiveCode: string
  attainmentVal: number
  threshold: number
  passed: boolean
}

export interface CourseObjectiveAttainmentResult {
  teachingClassId: ID
  courseId: ID
  calculatedAt: DateTimeString
  items: CourseObjectiveAttainmentItem[]
}

export interface RequirementIndicatorAttainmentItem {
  indicatorPointId: ID
  code: string
  attainmentVal: number
}

export interface RequirementAttainmentItem {
  requirementId: ID
  requirementCode: string
  title: string
  attainmentVal: number
  indicatorItems: RequirementIndicatorAttainmentItem[]
}

export interface RequirementAttainmentResult {
  schemeId: ID
  items: RequirementAttainmentItem[]
}

export interface DashboardQuery extends PageQuery {
  schemeId?: ID
  courseId?: ID
  semester?: string
}

export interface OverviewStats {
  majorCount?: number
  courseCount?: number
  teacherCount?: number
  studentCount?: number
  warningCount?: number
  [key: string]: number | undefined
}

export interface WarningStudent {
  studentId: ID
  studentNo: string
  realName: string
  courseObjectiveId: ID
  objectiveCode: string
  attainmentVal: number
  reason: string
}

export interface WarningStudentResult {
  teachingClassId: ID
  threshold: number
  students: WarningStudent[]
}

export interface GenerateImprovementPayload {
  problemAnalysis: string
  improvementMeasures: string
  createdBy: ID
}

export interface ContinuousImprovement {
  id: ID
  teachingClassId: ID
  problemAnalysis: string
  improvementMeasures: string
  createdBy: ID
  createdAt: DateTimeString
}

export type ContinuousImprovementPayload = GenerateImprovementPayload
