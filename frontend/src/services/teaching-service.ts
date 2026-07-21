import { download, request } from "./http"
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
  StudentCourseScore,
  StudentPayload,
  SubmitAcademicTeachingClassImportPayload,
  Teacher,
  TeacherClass,
  TeacherClassStudent,
  TeacherFinalScore,
  TeacherPayload,
  TeacherScoreGrid,
  TeachingClass,
  TeachingClassPayload,
  TeachingQuery,
  TeachingTask,
  TeachingTaskPayload,
} from "@/models"

const multipartHeaders = {
  "Content-Type": "multipart/form-data",
}

const toImportForm = (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

export const getStudentPage = async (query?: PageQuery) => {
  const response = await request<PageResult<Student>>({
    url: "/students",
    method: "GET",
    params: query,
  })
  return response.data
}

export const createStudent = async (payload: StudentPayload) => {
  const response = await request<Student>({
    url: "/students",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateStudent = async (id: ID, payload: StudentPayload) => {
  const response = await request<Student>({
    url: `/students/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteStudent = async (id: ID) => {
  const response = await request<boolean>({
    url: `/students/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeachingClassStudents = async (teachingClassId: ID) => {
  const response = await request<Student[]>({
    url: `/teaching-classes/${teachingClassId}/students`,
    method: "GET",
  })
  return response.data
}

export const importTeachingClassStudents = async (teachingClassId: ID, file: File) => {
  const response = await request<ImportResult>({
    url: `/teaching-classes/${teachingClassId}/students/import`,
    method: "POST",
    data: toImportForm(file),
    headers: multipartHeaders,
  })
  return response.data
}

export const addStudentToTeachingClass = async (teachingClassId: ID, studentId: ID) => {
  const response = await request<boolean>({
    url: `/teaching-classes/${teachingClassId}/students`,
    method: "POST",
    data: { studentId },
  })
  return response.data
}

export const removeStudentFromTeachingClass = async (teachingClassId: ID, studentId: ID) => {
  const response = await request<boolean>({
    url: `/teaching-classes/${teachingClassId}/students/${studentId}`,
    method: "DELETE",
  })
  return response.data
}

export const getScoreTable = async (teachingClassId: ID) => {
  const response = await request<ScoreTable>({
    url: `/teaching-classes/${teachingClassId}/scores`,
    method: "GET",
  })
  return response.data
}

export const saveScores = async (teachingClassId: ID, payload: SaveScoresPayload) => {
  const response = await request<ScoreTable>({
    url: `/teaching-classes/${teachingClassId}/scores`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const importScores = async (teachingClassId: ID, file: File) => {
  const response = await request<ImportResult>({
    url: `/teaching-classes/${teachingClassId}/scores/import`,
    method: "POST",
    data: toImportForm(file),
    headers: multipartHeaders,
  })
  return response.data
}

export const downloadScoreTemplate = async (teachingClassId: ID) => {
  return download(`/teaching-classes/${teachingClassId}/scores/template`)
}

export const getProcessRecordList = async (teachingClassId: ID) => {
  const response = await request<ProcessRecord[]>({
    url: `/teaching-classes/${teachingClassId}/process-records`,
    method: "GET",
  })
  return response.data
}

export const createProcessRecord = async (teachingClassId: ID, payload: ProcessRecordPayload) => {
  const response = await request<ProcessRecord>({
    url: `/teaching-classes/${teachingClassId}/process-records`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateProcessRecord = async (id: ID, payload: ProcessRecordPayload) => {
  const response = await request<ProcessRecord>({
    url: `/process-records/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteProcessRecord = async (id: ID) => {
  const response = await request<boolean>({
    url: `/process-records/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeacherPage = async (query?: PageQuery) => {
  const response = await request<PageResult<Teacher>>({
    url: "/teachers",
    method: "GET",
    params: query,
  })
  return response.data
}

export const createTeacher = async (payload: TeacherPayload) => {
  const response = await request<Teacher>({
    url: "/teachers",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateTeacher = async (id: ID, payload: TeacherPayload) => {
  const response = await request<Teacher>({
    url: `/teachers/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteTeacher = async (id: ID) => {
  const response = await request<boolean>({
    url: `/teachers/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeachingClassPage = async (query?: TeachingQuery) => {
  const response = await request<PageResult<TeachingClass>>({
    url: "/teaching-classes",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getTeacherClassList = async () => {
  const response = await request<TeacherClass[]>({
    url: "/teacher/classes",
    method: "GET",
  })
  return response.data
}

export const getTeacherClassStudents = async (classId: ID) => {
  const response = await request<TeacherClassStudent[]>({
    url: `/teacher/classes/${classId}/students`,
    method: "GET",
  })
  return response.data
}

export const getTeacherScoreGrid = async (classId: ID) => {
  const response = await request<TeacherScoreGrid>({
    url: `/teacher/classes/${classId}/score-grid`,
    method: "GET",
  })
  return response.data
}

export const saveTeacherScores = async (classId: ID, payload: SaveScoresPayload) => {
  const response = await request<string>({
    url: `/teacher/classes/${classId}/scores/batch`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const getTeacherFinalScores = async (classId: ID) => {
  const response = await request<TeacherFinalScore[]>({
    url: `/teacher/classes/${classId}/final-scores`,
    method: "GET",
  })
  return response.data
}

export const getStudentCourseScores = async () => {
  const response = await request<StudentCourseScore[]>({
    url: "/student/scores",
    method: "GET",
  })
  return response.data
}

export const getStudentScoreDetail = async (teachingClassId: ID) => {
  const response = await request<StudentCourseScore>({
    url: `/student/scores/${teachingClassId}/detail`,
    method: "GET",
  })
  return response.data
}

export const getTeachingClassDetail = async (id: ID) => {
  const response = await request<TeachingClass>({
    url: `/teaching-classes/${id}`,
    method: "GET",
  })
  return response.data
}

export const createTeachingClass = async (payload: TeachingClassPayload) => {
  const response = await request<TeachingClass>({
    url: "/teaching-classes",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateTeachingClass = async (id: ID, payload: TeachingClassPayload) => {
  const response = await request<TeachingClass>({
    url: `/teaching-classes/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteTeachingClass = async (id: ID) => {
  const response = await request<boolean>({
    url: `/teaching-classes/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeachingTaskPage = async (query?: TeachingQuery) => {
  const response = await request<PageResult<TeachingTask>>({
    url: "/teaching-tasks",
    method: "GET",
    params: query,
  })
  return response.data
}

export const createTeachingTask = async (payload: TeachingTaskPayload) => {
  const response = await request<TeachingTask>({
    url: "/teaching-tasks",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateTeachingTask = async (id: ID, payload: TeachingTaskPayload) => {
  const response = await request<TeachingTask>({
    url: `/teaching-tasks/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const assignTeachingTask = async (id: ID, teacherId: ID) => {
  const response = await request<TeachingTask>({
    url: `/teaching-tasks/${id}/assign`,
    method: "PUT",
    data: { teacherId },
  })
  return response.data
}

export const deleteTeachingTask = async (id: ID) => {
  const response = await request<boolean>({
    url: `/teaching-tasks/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const previewAcademicTeachingClassImport = async (file: File) => {
  const response = await request<AcademicTeachingClassImportPreviewResult>({
    url: "/academic-imports/teaching-classes/preview",
    method: "POST",
    data: toImportForm(file),
    headers: multipartHeaders,
  })
  return response.data
}

export const submitAcademicTeachingClassImport = async (
  payload: SubmitAcademicTeachingClassImportPayload,
) => {
  const response = await request<ImportResult>({
    url: "/academic-imports/teaching-classes",
    method: "POST",
    data: payload,
  })
  return response.data
}
