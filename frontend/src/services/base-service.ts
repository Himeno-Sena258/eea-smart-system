import { request } from "./http"
import type {
  BaseDataQuery,
  ClassInfo,
  ClassInfoPayload,
  EducationGoal,
  EducationGoalPayload,
  GradIndicatorPoint,
  GradIndicatorPointPayload,
  GradRequirement,
  GradRequirementPayload,
  ID,
  IndicatorTreeItem,
  Major,
  MajorPayload,
  Organization,
  OrganizationPayload,
  PageQuery,
  PageResult,
  ProgramScheme,
  ProgramSchemePayload,
  SaveGoalRequirementMatrixPayload,
} from "@/models"

export const getOrganizationTree = async () => {
  const response = await request<Organization[]>({
    url: "/organizations/tree",
    method: "GET",
  })
  return response.data
}

export const getOrganizationPage = async (query?: PageQuery) => {
  const response = await request<PageResult<Organization>>({
    url: "/organizations",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getOrganizationDetail = async (id: ID) => {
  const response = await request<Organization>({
    url: `/organizations/${id}`,
    method: "GET",
  })
  return response.data
}

export const createOrganization = async (payload: OrganizationPayload) => {
  const response = await request<Organization>({
    url: "/organizations",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateOrganization = async (id: ID, payload: OrganizationPayload) => {
  const response = await request<Organization>({
    url: `/organizations/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteOrganization = async (id: ID) => {
  const response = await request<boolean>({
    url: `/organizations/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getClassInfoPage = async (query?: BaseDataQuery) => {
  const response = await request<PageResult<ClassInfo>>({
    url: "/classes",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getClassInfoDetail = async (id: ID) => {
  const response = await request<ClassInfo>({
    url: `/classes/${id}`,
    method: "GET",
  })
  return response.data
}

export const createClassInfo = async (payload: ClassInfoPayload) => {
  const response = await request<ClassInfo>({
    url: "/classes",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateClassInfo = async (id: ID, payload: ClassInfoPayload) => {
  const response = await request<ClassInfo>({
    url: `/classes/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteClassInfo = async (id: ID) => {
  const response = await request<boolean>({
    url: `/classes/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getMajorPage = async (query?: PageQuery) => {
  const response = await request<PageResult<Major>>({
    url: "/majors",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getMajorDetail = async (id: ID) => {
  const response = await request<Major>({
    url: `/majors/${id}`,
    method: "GET",
  })
  return response.data
}

export const createMajor = async (payload: MajorPayload) => {
  const response = await request<Major>({
    url: "/majors",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateMajor = async (id: ID, payload: MajorPayload) => {
  const response = await request<Major>({
    url: `/majors/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteMajor = async (id: ID) => {
  const response = await request<boolean>({
    url: `/majors/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getProgramSchemeList = async (query?: BaseDataQuery) => {
  const response = await request<ProgramScheme[]>({
    url: "/program-schemes",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getProgramSchemeDetail = async (id: ID) => {
  const response = await request<ProgramScheme>({
    url: `/program-schemes/${id}`,
    method: "GET",
  })
  return response.data
}

export const createProgramScheme = async (payload: ProgramSchemePayload) => {
  const response = await request<ProgramScheme>({
    url: "/program-schemes",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateProgramScheme = async (id: ID, payload: ProgramSchemePayload) => {
  const response = await request<ProgramScheme>({
    url: `/program-schemes/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const publishProgramScheme = async (id: ID) => {
  const response = await request<ProgramScheme>({
    url: `/program-schemes/${id}/publish`,
    method: "PUT",
  })
  return response.data
}

export const archiveProgramScheme = async (id: ID) => {
  const response = await request<ProgramScheme>({
    url: `/program-schemes/${id}/archive`,
    method: "PUT",
  })
  return response.data
}

export const deleteProgramScheme = async (id: ID) => {
  const response = await request<boolean>({
    url: `/program-schemes/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getEducationGoalList = async (schemeId: ID) => {
  const response = await request<EducationGoal[]>({
    url: `/program-schemes/${schemeId}/education-goals`,
    method: "GET",
  })
  return response.data
}

export const createEducationGoal = async (schemeId: ID, payload: EducationGoalPayload) => {
  const response = await request<EducationGoal>({
    url: `/program-schemes/${schemeId}/education-goals`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateEducationGoal = async (id: ID, payload: EducationGoalPayload) => {
  const response = await request<EducationGoal>({
    url: `/education-goals/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteEducationGoal = async (id: ID) => {
  const response = await request<boolean>({
    url: `/education-goals/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getRequirementList = async (schemeId: ID) => {
  const response = await request<GradRequirement[]>({
    url: `/program-schemes/${schemeId}/requirements`,
    method: "GET",
  })
  return response.data
}

export const createRequirement = async (schemeId: ID, payload: GradRequirementPayload) => {
  const response = await request<GradRequirement>({
    url: `/program-schemes/${schemeId}/requirements`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const initRequirements = async (schemeId: ID) => {
  const response = await request<GradRequirement[]>({
    url: `/program-schemes/${schemeId}/requirements/init`,
    method: "POST",
  })
  return response.data
}

export const updateRequirement = async (id: ID, payload: GradRequirementPayload) => {
  const response = await request<GradRequirement>({
    url: `/requirements/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteRequirement = async (id: ID) => {
  const response = await request<boolean>({
    url: `/requirements/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getIndicatorList = async (requirementId: ID) => {
  const response = await request<GradIndicatorPoint[]>({
    url: `/requirements/${requirementId}/indicators`,
    method: "GET",
  })
  return response.data
}

export const getIndicatorTree = async (schemeId: ID) => {
  const response = await request<IndicatorTreeItem[]>({
    url: `/program-schemes/${schemeId}/indicators/tree`,
    method: "GET",
  })
  return response.data
}

export const createIndicator = async (requirementId: ID, payload: GradIndicatorPointPayload) => {
  const response = await request<GradIndicatorPoint>({
    url: `/requirements/${requirementId}/indicators`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateIndicator = async (id: ID, payload: GradIndicatorPointPayload) => {
  const response = await request<GradIndicatorPoint>({
    url: `/indicators/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteIndicator = async (id: ID) => {
  const response = await request<boolean>({
    url: `/indicators/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getGoalRequirementMatrix = async (schemeId: ID) => {
  const response = await request<SaveGoalRequirementMatrixPayload>({
    url: `/program-schemes/${schemeId}/goal-requirement-matrix`,
    method: "GET",
  })
  return response.data
}

export const saveGoalRequirementMatrix = async (
  schemeId: ID,
  payload: SaveGoalRequirementMatrixPayload,
) => {
  const response = await request<SaveGoalRequirementMatrixPayload>({
    url: `/program-schemes/${schemeId}/goal-requirement-matrix`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const clearGoalRequirementMatrix = async (schemeId: ID) => {
  const response = await request<boolean>({
    url: `/program-schemes/${schemeId}/goal-requirement-matrix`,
    method: "DELETE",
  })
  return response.data
}
