import { create } from "zustand"
import type {
  AcademicTeachingClassImportPreviewResult,
  ID,
  ImportResult,
  PageQuery,
  PageResult,
  ProcessRecord,
  ProcessRecordPayload,
  SaveScoresPayload,
  ScoreTable,
  Student,
  StudentPayload,
  SubmitAcademicTeachingClassImportPayload,
  Teacher,
  TeacherPayload,
  TeachingClass,
  TeachingClassPayload,
  TeachingQuery,
  TeachingTask,
  TeachingTaskPayload,
} from "@/models"
import {
  addStudentToTeachingClass,
  assignTeachingTask,
  createProcessRecord,
  createStudent,
  createTeacher,
  createTeachingClass,
  createTeachingTask,
  deleteProcessRecord,
  deleteStudent,
  deleteTeacher,
  deleteTeachingClass,
  deleteTeachingTask,
  downloadScoreTemplate,
  getProcessRecordList,
  getScoreTable,
  getStudentPage,
  getTeacherPage,
  getTeachingClassDetail,
  getTeachingClassPage,
  getTeachingClassStudents,
  getTeachingTaskPage,
  importScores,
  importTeachingClassStudents,
  previewAcademicTeachingClassImport,
  removeStudentFromTeachingClass,
  saveScores,
  submitAcademicTeachingClassImport,
  updateProcessRecord,
  updateStudent,
  updateTeacher,
  updateTeachingClass,
  updateTeachingTask,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface TeachingStore extends RequestState, RequestActions {
  studentsPage: PageResult<Student> | null
  teachingClassStudents: Student[]
  scoreTable: ScoreTable | null
  processRecords: ProcessRecord[]
  teachersPage: PageResult<Teacher> | null
  teachingClassesPage: PageResult<TeachingClass> | null
  currentTeachingClass: TeachingClass | null
  teachingTasksPage: PageResult<TeachingTask> | null
  academicTeachingClassImportPreview: AcademicTeachingClassImportPreviewResult | null
  academicTeachingClassImportResult: ImportResult | null
  fetchStudents: (query?: PageQuery) => Promise<PageResult<Student>>
  createStudent: (payload: StudentPayload) => Promise<Student>
  updateStudent: (id: ID, payload: StudentPayload) => Promise<Student>
  deleteStudent: (id: ID) => Promise<boolean>
  fetchTeachingClassStudents: (teachingClassId: ID) => Promise<Student[]>
  importTeachingClassStudents: (teachingClassId: ID, file: File) => Promise<ImportResult>
  addStudentToTeachingClass: (teachingClassId: ID, studentId: ID) => Promise<boolean>
  removeStudentFromTeachingClass: (teachingClassId: ID, studentId: ID) => Promise<boolean>
  fetchScoreTable: (teachingClassId: ID) => Promise<ScoreTable>
  saveScores: (teachingClassId: ID, payload: SaveScoresPayload) => Promise<ScoreTable>
  importScores: (teachingClassId: ID, file: File) => Promise<ImportResult>
  downloadScoreTemplate: (teachingClassId: ID) => Promise<Blob>
  fetchProcessRecords: (teachingClassId: ID) => Promise<ProcessRecord[]>
  createProcessRecord: (teachingClassId: ID, payload: ProcessRecordPayload) => Promise<ProcessRecord>
  updateProcessRecord: (id: ID, payload: ProcessRecordPayload) => Promise<ProcessRecord>
  deleteProcessRecord: (id: ID) => Promise<boolean>
  fetchTeachers: (query?: PageQuery) => Promise<PageResult<Teacher>>
  createTeacher: (payload: TeacherPayload) => Promise<Teacher>
  updateTeacher: (id: ID, payload: TeacherPayload) => Promise<Teacher>
  deleteTeacher: (id: ID) => Promise<boolean>
  fetchTeachingClasses: (query?: TeachingQuery) => Promise<PageResult<TeachingClass>>
  fetchTeachingClassDetail: (id: ID) => Promise<TeachingClass>
  createTeachingClass: (payload: TeachingClassPayload) => Promise<TeachingClass>
  updateTeachingClass: (id: ID, payload: TeachingClassPayload) => Promise<TeachingClass>
  deleteTeachingClass: (id: ID) => Promise<boolean>
  fetchTeachingTasks: (query?: TeachingQuery) => Promise<PageResult<TeachingTask>>
  createTeachingTask: (payload: TeachingTaskPayload) => Promise<TeachingTask>
  updateTeachingTask: (id: ID, payload: TeachingTaskPayload) => Promise<TeachingTask>
  assignTeachingTask: (id: ID, teacherId: ID) => Promise<TeachingTask>
  deleteTeachingTask: (id: ID) => Promise<boolean>
  previewAcademicTeachingClassImport: (file: File) => Promise<AcademicTeachingClassImportPreviewResult>
  submitAcademicTeachingClassImport: (payload: SubmitAcademicTeachingClassImportPayload) => Promise<ImportResult>
}

export const useTeachingStore = create<TeachingStore>((set, get) => ({
  ...createInitialRequestState(),
  studentsPage: null,
  teachingClassStudents: [],
  scoreTable: null,
  processRecords: [],
  teachersPage: null,
  teachingClassesPage: null,
  currentTeachingClass: null,
  teachingTasksPage: null,
  academicTeachingClassImportPreview: null,
  academicTeachingClassImportResult: null,
  clearError: () => set({ error: null }),
  fetchStudents: (query) => runRequest(set, () => getStudentPage(query), (studentsPage) => ({ studentsPage })),
  createStudent: (payload) => runRequest(set, () => createStudent(payload)),
  updateStudent: (id, payload) => runRequest(set, () => updateStudent(id, payload)),
  deleteStudent: (id) => runRequest(set, () => deleteStudent(id)),
  fetchTeachingClassStudents: (teachingClassId) => runRequest(set, () => getTeachingClassStudents(teachingClassId), (teachingClassStudents) => ({ teachingClassStudents })),
  importTeachingClassStudents: (teachingClassId, file) => runRequest(set, () => importTeachingClassStudents(teachingClassId, file)),
  addStudentToTeachingClass: (teachingClassId, studentId) => runRequest(set, () => addStudentToTeachingClass(teachingClassId, studentId)),
  removeStudentFromTeachingClass: (teachingClassId, studentId) => runRequest(set, () => removeStudentFromTeachingClass(teachingClassId, studentId), () => ({ teachingClassStudents: get().teachingClassStudents.filter((item) => item.id !== studentId) })),
  fetchScoreTable: (teachingClassId) => runRequest(set, () => getScoreTable(teachingClassId), (scoreTable) => ({ scoreTable })),
  saveScores: (teachingClassId, payload) => runRequest(set, () => saveScores(teachingClassId, payload), (scoreTable) => ({ scoreTable })),
  importScores: (teachingClassId, file) => runRequest(set, () => importScores(teachingClassId, file)),
  downloadScoreTemplate: (teachingClassId) => runRequest(set, () => downloadScoreTemplate(teachingClassId)),
  fetchProcessRecords: (teachingClassId) => runRequest(set, () => getProcessRecordList(teachingClassId), (processRecords) => ({ processRecords })),
  createProcessRecord: (teachingClassId, payload) => runRequest(set, () => createProcessRecord(teachingClassId, payload), (record) => ({ processRecords: [...get().processRecords, record] })),
  updateProcessRecord: (id, payload) => runRequest(set, () => updateProcessRecord(id, payload), (record) => ({ processRecords: get().processRecords.map((item) => (item.id === id ? record : item)) })),
  deleteProcessRecord: (id) => runRequest(set, () => deleteProcessRecord(id), () => ({ processRecords: get().processRecords.filter((item) => item.id !== id) })),
  fetchTeachers: (query) => runRequest(set, () => getTeacherPage(query), (teachersPage) => ({ teachersPage })),
  createTeacher: (payload) => runRequest(set, () => createTeacher(payload)),
  updateTeacher: (id, payload) => runRequest(set, () => updateTeacher(id, payload)),
  deleteTeacher: (id) => runRequest(set, () => deleteTeacher(id)),
  fetchTeachingClasses: (query) => runRequest(set, () => getTeachingClassPage(query), (teachingClassesPage) => ({ teachingClassesPage })),
  fetchTeachingClassDetail: (id) => runRequest(set, () => getTeachingClassDetail(id), (currentTeachingClass) => ({ currentTeachingClass })),
  createTeachingClass: (payload) => runRequest(set, () => createTeachingClass(payload), (currentTeachingClass) => ({ currentTeachingClass })),
  updateTeachingClass: (id, payload) => runRequest(set, () => updateTeachingClass(id, payload), (currentTeachingClass) => ({ currentTeachingClass })),
  deleteTeachingClass: (id) => runRequest(set, () => deleteTeachingClass(id)),
  fetchTeachingTasks: (query) => runRequest(set, () => getTeachingTaskPage(query), (teachingTasksPage) => ({ teachingTasksPage })),
  createTeachingTask: (payload) => runRequest(set, () => createTeachingTask(payload)),
  updateTeachingTask: (id, payload) => runRequest(set, () => updateTeachingTask(id, payload)),
  assignTeachingTask: (id, teacherId) => runRequest(set, () => assignTeachingTask(id, teacherId)),
  deleteTeachingTask: (id) => runRequest(set, () => deleteTeachingTask(id)),
  previewAcademicTeachingClassImport: (file) =>
    runRequest(set, () => previewAcademicTeachingClassImport(file), (academicTeachingClassImportPreview) => ({
      academicTeachingClassImportPreview,
    })),
  submitAcademicTeachingClassImport: (payload) =>
    runRequest(set, () => submitAcademicTeachingClassImport(payload), (academicTeachingClassImportResult) => ({
      academicTeachingClassImportResult,
      academicTeachingClassImportPreview: null,
    })),
}))
