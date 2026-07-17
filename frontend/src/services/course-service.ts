import { download, request } from "./http"
import type {
  AssessmentItem,
  AssessmentItemPayload,
  AssessmentMethod,
  AssessmentStandard,
  Course,
  CourseIndicatorMatrixItem,
  CourseObjective,
  CourseObjectivePayload,
  CoursePayload,
  CourseQuery,
  CourseResource,
  CourseResourcePayload,
  CourseSyllabus,
  CourseSyllabusPayload,
  EvidenceMaterial,
  EvidenceMaterialPayload,
  ID,
  ImportResult,
  PageResult,
  SaveAssessmentMethodsPayload,
  SaveAssessmentStandardsPayload,
  SaveCourseIndicatorMatrixPayload,
  SaveCurriculumPayload,
  SaveTeachingContentsPayload,
  TeachingContentItem,
} from "@/models"

const multipartHeaders = {
  "Content-Type": "multipart/form-data",
}

const toCourseResourceForm = (payload: CourseResourcePayload) => {
  const formData = new FormData()
  formData.append("file", payload.file)
  formData.append("resourceType", payload.resourceType)
  if (payload.description) formData.append("description", payload.description)
  return formData
}

const toEvidenceForm = (payload: EvidenceMaterialPayload) => {
  const formData = new FormData()
  formData.append("file", payload.file)
  formData.append("assessmentMethodId", String(payload.assessmentMethodId))
  formData.append("levelTag", payload.levelTag)
  return formData
}

export const getCoursePage = async (query?: CourseQuery) => {
  const response = await request<PageResult<Course>>({
    url: "/courses",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getCourseDetail = async (id: ID) => {
  const response = await request<Course>({
    url: `/courses/${id}`,
    method: "GET",
  })
  return response.data
}

export const createCourse = async (payload: CoursePayload) => {
  const response = await request<Course>({
    url: "/courses",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateCourse = async (id: ID, payload: CoursePayload) => {
  const response = await request<Course>({
    url: `/courses/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteCourse = async (id: ID) => {
  const response = await request<boolean>({
    url: `/courses/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const importCourses = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await request<ImportResult>({
    url: "/courses/import",
    method: "POST",
    data: formData,
    headers: multipartHeaders,
  })
  return response.data
}

export const getCurriculum = async (schemeId: ID) => {
  const response = await request<Course[]>({
    url: `/program-schemes/${schemeId}/curriculum`,
    method: "GET",
  })
  return response.data
}

export const saveCurriculum = async (schemeId: ID, payload: SaveCurriculumPayload) => {
  const response = await request<Course[]>({
    url: `/program-schemes/${schemeId}/curriculum`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const getCourseIndicatorMatrix = async (courseId: ID) => {
  const response = await request<CourseIndicatorMatrixItem[]>({
    url: `/courses/${courseId}/indicator-matrix`,
    method: "GET",
  })
  return response.data
}

export const saveCourseIndicatorMatrix = async (
  courseId: ID,
  payload: SaveCourseIndicatorMatrixPayload,
) => {
  const response = await request<CourseIndicatorMatrixItem[]>({
    url: `/courses/${courseId}/indicator-matrix`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const clearCourseIndicatorMatrix = async (courseId: ID) => {
  const response = await request<boolean>({
    url: `/courses/${courseId}/indicator-matrix`,
    method: "DELETE",
  })
  return response.data
}

export const getCourseSyllabus = async (courseId: ID) => {
  const response = await request<CourseSyllabus>({
    url: `/courses/${courseId}/syllabus`,
    method: "GET",
  })
  return response.data
}

export const saveCourseSyllabus = async (courseId: ID, payload: CourseSyllabusPayload) => {
  const response = await request<CourseSyllabus>({
    url: `/courses/${courseId}/syllabus`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const getCourseResourceList = async (courseId: ID) => {
  const response = await request<CourseResource[]>({
    url: `/courses/${courseId}/resources`,
    method: "GET",
  })
  return response.data
}

export const uploadCourseResource = async (courseId: ID, payload: CourseResourcePayload) => {
  const response = await request<CourseResource>({
    url: `/courses/${courseId}/resources`,
    method: "POST",
    data: toCourseResourceForm(payload),
    headers: multipartHeaders,
  })
  return response.data
}

export const updateCourseResource = async (
  id: ID,
  payload: Pick<CourseResource, "resourceType" | "description">,
) => {
  const response = await request<CourseResource>({
    url: `/course-resources/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteCourseResource = async (id: ID) => {
  const response = await request<boolean>({
    url: `/course-resources/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const downloadCourseResource = async (id: ID) => {
  return download(`/course-resources/${id}/download`)
}

export const getCourseObjectiveList = async (courseId: ID) => {
  const response = await request<CourseObjective[]>({
    url: `/courses/${courseId}/objectives`,
    method: "GET",
  })
  return response.data
}

export const createCourseObjective = async (courseId: ID, payload: CourseObjectivePayload) => {
  const response = await request<CourseObjective>({
    url: `/courses/${courseId}/objectives`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateCourseObjective = async (id: ID, payload: CourseObjectivePayload) => {
  const response = await request<CourseObjective>({
    url: `/course-objectives/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteCourseObjective = async (id: ID) => {
  const response = await request<boolean>({
    url: `/course-objectives/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeachingContentList = async (courseId: ID) => {
  const response = await request<TeachingContentItem[]>({
    url: `/courses/${courseId}/teaching-contents`,
    method: "GET",
  })
  return response.data
}

export const saveTeachingContents = async (courseId: ID, payload: SaveTeachingContentsPayload) => {
  const response = await request<TeachingContentItem[]>({
    url: `/courses/${courseId}/teaching-contents`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const getAssessmentMethodList = async (courseId: ID) => {
  const response = await request<AssessmentMethod[]>({
    url: `/courses/${courseId}/assessment-methods`,
    method: "GET",
  })
  return response.data
}

export const saveAssessmentMethods = async (courseId: ID, payload: SaveAssessmentMethodsPayload) => {
  const response = await request<AssessmentMethod[]>({
    url: `/courses/${courseId}/assessment-methods`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const createAssessmentItem = async (methodId: ID, payload: AssessmentItemPayload) => {
  const response = await request<AssessmentItem>({
    url: `/assessment-methods/${methodId}/items`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateAssessmentItem = async (id: ID, payload: AssessmentItemPayload) => {
  const response = await request<AssessmentItem>({
    url: `/assessment-items/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteAssessmentItem = async (id: ID) => {
  const response = await request<boolean>({
    url: `/assessment-items/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getAssessmentStandardList = async (itemId: ID) => {
  const response = await request<AssessmentStandard[]>({
    url: `/assessment-items/${itemId}/standards`,
    method: "GET",
  })
  return response.data
}

export const saveAssessmentStandards = async (
  itemId: ID,
  payload: SaveAssessmentStandardsPayload,
) => {
  const response = await request<AssessmentStandard[]>({
    url: `/assessment-items/${itemId}/standards`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const getEvidenceMaterialList = async (teachingClassId: ID) => {
  const response = await request<EvidenceMaterial[]>({
    url: `/teaching-classes/${teachingClassId}/evidence-materials`,
    method: "GET",
  })
  return response.data
}

export const uploadEvidenceMaterial = async (
  teachingClassId: ID,
  payload: EvidenceMaterialPayload,
) => {
  const response = await request<EvidenceMaterial>({
    url: `/teaching-classes/${teachingClassId}/evidence-materials`,
    method: "POST",
    data: toEvidenceForm(payload),
    headers: multipartHeaders,
  })
  return response.data
}

export const deleteEvidenceMaterial = async (id: ID) => {
  const response = await request<boolean>({
    url: `/evidence-materials/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const downloadEvidenceMaterial = async (id: ID) => {
  return download(`/evidence-materials/${id}/download`)
}
