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

export interface TeacherCoAttainment {
  coId: ID
  coCode: string
  coDescription: string
  indicatorPointCode: string
  targetMaxScore: number
  classAvgScore: number
  attainmentVal: number
  warningThreshold: number
  isQualified: 0 | 1
}

export interface DirectorCourseAttainmentContribution {
  courseId: ID
  courseName: string
  coCode: string
  weight: number
  coAttainmentVal: number
  weightedContribution: number
}

export interface DirectorAttainment {
  indicatorPointId: ID
  indicatorPointCode: string
  indicatorPointContent: string
  weightSum: number
  courseContributions: DirectorCourseAttainmentContribution[]
  attainmentVal: number
  warningThreshold: number
  isQualified: 0 | 1
}

export interface StudentAttainment {
  indicatorCode: string
  indicatorContent: string
  threshold: number
  attainmentValue: number | null
  passed: boolean
  gradRequirementTitle: string
}

export interface DirectorProgramScheme {
  id: ID
  majorId: ID
  majorName?: string
  grade?: number
  name: string
  totalCredits?: number
  status?: number
  statusDesc?: string
  reqCount?: number
  indicatorPointCount?: number
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
