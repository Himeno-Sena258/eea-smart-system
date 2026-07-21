import type { DateTimeString, ID, PageQuery } from "./common"
import type { ImportValidationStatus } from "./auth"

export interface Student {
  id: ID
  username: string
  realName: string
  studentNo: string
  classId: ID
  className?: string
  email?: string
  phone?: string
  status?: number
}

export interface StudentPayload {
  username: string
  realName: string
  studentNo: string
  classId: ID
  email?: string
  phone?: string
}

export interface Teacher {
  id: ID
  username: string
  realName: string
  email?: string
  phone?: string
  orgId?: ID
  orgName?: string
  status?: number
}

export interface TeacherPayload {
  username: string
  realName: string
  email?: string
  phone?: string
  orgId?: ID
}

export interface TeachingClass {
  id: ID
  courseId: ID
  courseName?: string
  teacherId: ID
  teacherName?: string
  semester: string
  className: string
}

export interface TeacherClass {
  classId: ID
  className: string
  courseId: ID
  courseName: string
  semester: string
  studentCount: number
}

export interface TeacherClassStudent {
  studentId: ID
  studentNo: string
  studentName: string
  adminClassName?: string
  courseName?: string
  semester?: string
  selectStatus?: number
}

export interface TeachingClassPayload {
  courseId: ID
  teacherId: ID
  semester: string
  className: string
}

export interface TeachingTask extends TeachingClass {
  studentClassIds?: ID[]
  status?: number | string
}

export interface TeachingTaskPayload extends TeachingClassPayload {
  studentClassIds?: ID[]
}

export interface AssignTeachingTaskPayload {
  teacherId: ID
}

export interface StudentScore {
  id?: ID
  studentId: ID
  assessmentItemId: ID
  actualScore: number
}

export interface SaveScoresPayload {
  scores: StudentScore[]
}

export interface ScoreTableStudent extends Student {
  scores: Record<ID, number | null>
}

export interface ScoreTable {
  teachingClassId: ID
  assessmentItems: Array<{
    id: ID
    name: string
    maxScore: number
    courseObjectiveId: ID
  }>
  students: ScoreTableStudent[]
}

export interface TeacherScoreGridHeader {
  itemId: ID
  itemName: string
  maxScore: number
  coId: ID
  coCode: string
  methodName: string
  methodWeight: number
}

export interface TeacherScoreGridRow {
  studentId: ID
  studentNo: string
  studentName: string
  itemScores: Record<ID, number | null>
}

export interface TeacherScoreGrid {
  classId: ID
  headers: TeacherScoreGridHeader[]
  rows: TeacherScoreGridRow[]
}

export interface TeacherFinalScore {
  studentId: ID
  studentNo: string
  studentName: string
  homeworkScore: number | null
  experimentScore: number | null
  examScore: number | null
  totalScore: number | null
  isPassed: number
}

export interface StudentScoreItemDetail {
  itemId: ID
  itemName: string
  score: number | null
  maxScore: number | null
  objectiveCode: string
  methodName: string
}

export interface StudentCourseScore {
  courseId: ID
  courseName: string
  teachingClassId: ID
  teachingClassName: string
  semester: string
  homeworkScore: number | null
  experimentScore: number | null
  examScore: number | null
  totalScore: number | null
  passed: boolean
  items?: StudentScoreItemDetail[] | null
}

export type ProcessRecordType = "ATTENDANCE" | "PERFORMANCE" | "HOMEWORK" | string

export interface ProcessRecord {
  id: ID
  teachingClassId: ID
  studentId: ID
  recordType: ProcessRecordType
  score: number
  remark?: string
  createdAt?: DateTimeString
}

export interface ProcessRecordPayload {
  studentId: ID
  recordType: ProcessRecordType
  score: number
  remark?: string
}

export interface TeachingQuery extends PageQuery {
  courseId?: ID
  teacherId?: ID
  semester?: string
  classId?: ID
}

export interface AcademicTeachingClassImportPreviewRow {
  rowIndex: number
  semester: string
  courseCode: string
  courseName: string
  teacherUsername: string
  teacherName: string
  teachingClassName: string
  studentNo: string
  studentName: string
  studentClassName: string
  validation: ImportValidationStatus
  message: string
}

export interface AcademicTeachingClassImportPreviewResult {
  batchId: string
  totalRows: number
  validRows: number
  invalidRows: number
  teachingClassCount: number
  studentRelationCount: number
  rows: AcademicTeachingClassImportPreviewRow[]
}

export interface SubmitAcademicTeachingClassImportPayload {
  batchId: string
}
