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
