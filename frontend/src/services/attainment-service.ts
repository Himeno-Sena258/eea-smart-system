import { request } from "./http"
import type {
  ContinuousImprovement,
  ContinuousImprovementPayload,
  DirectorAttainment,
  DirectorProgramScheme,
  DashboardQuery,
  ID,
  ImprovementDraft,
  OverviewStats,
  StudentAttainment,
  TeacherCoAttainment,
  TeacherImprovementPayload,
  TeachingImprovement,
  WarningStudentResult,
} from "@/models"

export const getOverviewStats = async (query?: DashboardQuery) => {
  const response = await request<OverviewStats>({
    url: "/dashboard/overview",
    method: "GET",
    params: query,
  })
  return response.data
}

export const scanWarningStudents = async (teachingClassId: ID) => {
  const response = await request<WarningStudentResult>({
    url: `/teaching-classes/${teachingClassId}/warnings/scan`,
    method: "POST",
  })
  return response.data
}

export const getWarningStudents = async (teachingClassId: ID) => {
  const response = await request<WarningStudentResult>({
    url: `/teaching-classes/${teachingClassId}/warnings/students`,
    method: "GET",
  })
  return response.data
}

export const getImprovementList = async (teachingClassId: ID) => {
  const response = await request<ContinuousImprovement[]>({
    url: `/teaching-classes/${teachingClassId}/improvements`,
    method: "GET",
  })
  return response.data
}

export const getDirectorImprovementList = async (schemeId?: ID) => {
  const response = await request<ContinuousImprovement[]>({
    url: "/director/improvements",
    method: "GET",
    params: schemeId ? { schemeId } : undefined,
  })
  return response.data
}

export const getCoordinatorImprovementList = async (courseId?: ID) => {
  const response = await request<ContinuousImprovement[]>({
    url: "/coordinator/improvements",
    method: "GET",
    params: courseId ? { courseId } : undefined,
  })
  return response.data
}

export const createImprovement = async (
  teachingClassId: ID,
  payload: ContinuousImprovementPayload,
) => {
  const response = await request<ContinuousImprovement>({
    url: `/teaching-classes/${teachingClassId}/improvements`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateImprovement = async (id: ID, payload: ContinuousImprovementPayload) => {
  const response = await request<string>({
    url: `/improvements/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteImprovement = async (id: ID) => {
  const response = await request<string>({
    url: `/improvements/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const generateImprovement = async (teachingClassId: ID) => {
  const response = await request<ImprovementDraft>({
    url: `/teaching-classes/${teachingClassId}/improvements/generate`,
    method: "POST",
  })
  return response.data
}

export const getTeacherImprovementList = async (classId: ID) => {
  const response = await request<TeachingImprovement[]>({
    url: `/teacher/classes/${classId}/improvements`,
    method: "GET",
  })
  return response.data
}

export const saveTeacherImprovement = async (
  classId: ID,
  payload: TeacherImprovementPayload,
) => {
  const response = await request<string>({
    url: `/teacher/classes/${classId}/improvements`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const getTeacherCoAttainmentList = async (classId: ID) => {
  const response = await request<TeacherCoAttainment[]>({
    url: `/teacher/classes/${classId}/attainment`,
    method: "GET",
  })
  return response.data
}

export const calculateTeacherCoAttainment = async (classId: ID) => {
  const response = await request<TeacherCoAttainment[]>({
    url: `/teacher/classes/${classId}/attainment/calculate`,
    method: "POST",
  })
  return response.data
}

export const getDirectorProgramSchemeList = async () => {
  const response = await request<DirectorProgramScheme[]>({
    url: "/director/schemes",
    method: "GET",
  })
  return response.data
}

export const getDirectorAttainmentList = async (schemeId: ID, grade?: number) => {
  const response = await request<DirectorAttainment[]>({
    url: `/director/schemes/${schemeId}/attainment`,
    method: "GET",
    params: grade ? { grade } : undefined,
  })
  return response.data
}

export const calculateDirectorAttainment = async (schemeId: ID, grade?: number) => {
  const response = await request<DirectorAttainment[]>({
    url: `/director/schemes/${schemeId}/attainment/calculate`,
    method: "POST",
    params: grade ? { grade } : undefined,
  })
  return response.data
}

export const getStudentAttainmentList = async () => {
  const response = await request<StudentAttainment[]>({
    url: "/student/attainment",
    method: "GET",
  })
  return response.data
}
