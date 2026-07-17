import type { DateTimeString, ID, JsonValue, PageQuery } from "./common"

export type CourseResourceType = "SYLLABUS" | "PPT" | "CASE" | "REFERENCE" | string
export type EvidenceLevelTag = "HIGH" | "MEDIUM" | "LOW"

export interface Course {
  id: ID
  schemeId: ID
  courseCode: string
  courseName: string
  credits: number
  hours: number
  courseType?: string
  semester?: string
  sortOrder?: number
}

export interface CourseQuery extends PageQuery {
  schemeId?: ID
}

export interface CoursePayload {
  schemeId: ID
  courseCode: string
  courseName: string
  credits: number
  hours: number
  courseType?: string
  semester?: string
}

export interface CurriculumCourseItem {
  courseId: ID
  courseType: string
  semester: string
  sortOrder: number
}

export interface SaveCurriculumPayload {
  courses: CurriculumCourseItem[]
}

export interface CourseObjective {
  id: ID
  courseId: ID
  objectiveCode: string
  content: string
}

export interface CourseObjectivePayload {
  objectiveCode: string
  content: string
}

export interface CourseIndicatorMatrixItem {
  id?: ID
  courseObjectiveId: ID
  indicatorPointId: ID
  weight: number
}

export interface SaveCourseIndicatorMatrixPayload {
  items: CourseIndicatorMatrixItem[]
}

export interface CourseSyllabus {
  id?: ID
  courseId: ID
  courseIntroduction: string
  teachingMethod: string
  content: string
  updatedAt?: DateTimeString
}

export type CourseSyllabusPayload = Omit<
  CourseSyllabus,
  "id" | "courseId" | "updatedAt"
>

export interface CourseResource {
  id: ID
  courseId: ID
  resourceType: CourseResourceType
  description?: string
  fileName: string
  filePath: string
  uploadedBy?: ID
  uploadedAt?: DateTimeString
}

export interface CourseResourcePayload {
  file: File
  resourceType: CourseResourceType
  description?: string
}

export interface TeachingContentItem {
  id?: ID
  title: string
  hours: number
  objectiveIds: ID[]
  sortOrder: number
}

export interface SaveTeachingContentsPayload {
  items: TeachingContentItem[]
}

export interface AssessmentItem {
  id: ID
  methodId: ID
  name: string
  maxScore: number
  courseObjectiveId: ID
}

export interface AssessmentItemPayload {
  name: string
  maxScore: number
  courseObjectiveId: ID
}

export interface AssessmentMethod {
  id: ID
  courseId: ID
  name: string
  weight: number
  items?: AssessmentItem[]
}

export interface AssessmentMethodPayload {
  name: string
  weight: number
  items?: AssessmentItemPayload[]
}

export interface SaveAssessmentMethodsPayload {
  methods: AssessmentMethodPayload[]
}

export interface AssessmentStandard {
  id?: ID
  itemId?: ID
  level: string
  minScore: number
  maxScore: number
  description: string
}

export interface SaveAssessmentStandardsPayload {
  standards: AssessmentStandard[]
}

export interface EvidenceMaterial {
  id: ID
  teachingClassId: ID
  assessmentMethodId: ID
  fileName: string
  filePath: string
  levelTag: EvidenceLevelTag
  uploadedBy: ID
  uploadedAt: DateTimeString
}

export interface EvidenceMaterialPayload {
  file: File
  assessmentMethodId: ID
  levelTag: EvidenceLevelTag
}

export type AutoFillConfig = Record<string, JsonValue>
