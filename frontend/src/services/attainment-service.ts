import { request } from "./http"
import type {
  AttainmentModel,
  AttainmentModelPayload,
  ContinuousImprovement,
  ContinuousImprovementPayload,
  CourseObjectiveAttainmentResult,
  DashboardQuery,
  ID,
  OverviewStats,
  RequirementAttainmentResult,
  WarningStudentResult,
} from "@/models"

export const getAttainmentModelList = async () => {
  const response = await request<AttainmentModel[]>({
    url: "/attainment-models",
    method: "GET",
  })
  return response.data
}

export const getAttainmentModelDetail = async (id: ID) => {
  const response = await request<AttainmentModel>({
    url: `/attainment-models/${id}`,
    method: "GET",
  })
  return response.data
}

export const createAttainmentModel = async (payload: AttainmentModelPayload) => {
  const response = await request<AttainmentModel>({
    url: "/attainment-models",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateAttainmentModel = async (id: ID, payload: AttainmentModelPayload) => {
  const response = await request<AttainmentModel>({
    url: `/attainment-models/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const setDefaultAttainmentModel = async (id: ID) => {
  const response = await request<AttainmentModel>({
    url: `/attainment-models/${id}/default`,
    method: "PUT",
  })
  return response.data
}

export const deleteAttainmentModel = async (id: ID) => {
  const response = await request<boolean>({
    url: `/attainment-models/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const calculateCourseObjectiveAttainment = async (teachingClassId: ID, modelId?: ID) => {
  const response = await request<CourseObjectiveAttainmentResult>({
    url: `/teaching-classes/${teachingClassId}/attainment/course-objectives/calculate`,
    method: "POST",
    data: modelId ? { modelId } : undefined,
  })
  return response.data
}

export const getCourseObjectiveAttainment = async (teachingClassId: ID) => {
  const response = await request<CourseObjectiveAttainmentResult>({
    url: `/teaching-classes/${teachingClassId}/attainment/course-objectives`,
    method: "GET",
  })
  return response.data
}

export const calculateRequirementAttainment = async (schemeId: ID, modelId?: ID) => {
  const response = await request<RequirementAttainmentResult>({
    url: `/program-schemes/${schemeId}/attainment/requirements/calculate`,
    method: "POST",
    data: modelId ? { modelId } : undefined,
  })
  return response.data
}

export const getRequirementAttainment = async (schemeId: ID) => {
  const response = await request<RequirementAttainmentResult>({
    url: `/program-schemes/${schemeId}/attainment/requirements`,
    method: "GET",
  })
  return response.data
}

export const getCourseObjectiveAttainmentDashboard = async (query?: DashboardQuery) => {
  const response = await request<CourseObjectiveAttainmentResult[]>({
    url: "/dashboard/attainment/course-objectives",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getRequirementAttainmentDashboard = async (query?: DashboardQuery) => {
  const response = await request<RequirementAttainmentResult[]>({
    url: "/dashboard/attainment/requirements",
    method: "GET",
    params: query,
  })
  return response.data
}

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
  const response = await request<ContinuousImprovement>({
    url: `/improvements/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteImprovement = async (id: ID) => {
  const response = await request<boolean>({
    url: `/improvements/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const generateImprovement = async (teachingClassId: ID) => {
  const response = await request<ContinuousImprovement>({
    url: `/teaching-classes/${teachingClassId}/improvements/generate`,
    method: "POST",
  })
  return response.data
}
