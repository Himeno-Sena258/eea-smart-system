import { request } from "./http"
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
  CurriculumCourseItem,
  EvidenceMaterial,
  EvidenceMaterialPayload,
  ID,
  ImportResult,
  PageResult,
  ResourceDownloadInfo,
  SaveAssessmentMethodsPayload,
  SaveAssessmentStandardsPayload,
  SaveCourseIndicatorMatrixPayload,
  SaveCurriculumPayload,
  SaveTeachingContentsPayload,
  CoordinatorCourse,
  StudentCourse,
  StudentSyllabus,
  TeachingContentItem,
  TeacherCourse,
} from "@/models"

const multipartHeaders = {
  "Content-Type": "multipart/form-data",
}

const parseObjectiveIds = (value: unknown): ID[] => {
  if (Array.isArray(value)) return value as ID[]
  if (typeof value !== "string" || value.trim() === "") return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed as ID[]
  } catch {
    // Compatible with strings such as "1,2,3" or "[1, 2, 3]".
  }

  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
}

const normalizeTeachingContent = (item: TeachingContentItem): TeachingContentItem => ({
  ...item,
  objectiveIds: parseObjectiveIds(item.objectiveIds),
})

const normalizeAssessmentStandard = (item: AssessmentStandard): AssessmentStandard => ({
  ...item,
  itemId: item.itemId ?? item.assessmentItemId,
})

export const getCoursePage = async (query?: CourseQuery) => {
  const response = await request<PageResult<Course>>({
    url: "/courses",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getCoordinatorCourseList = async () => {
  const response = await request<CoordinatorCourse[]>({
    url: "/coordinator/courses",
    method: "GET",
  })
  return response.data
}

export const getTeacherCourseList = async () => {
  const response = await request<TeacherCourse[]>({
    url: "/teacher/courses",
    method: "GET",
  })
  return response.data
}

export const getStudentCourseList = async () => {
  const response = await request<StudentCourse[]>({
    url: "/student/courses",
    method: "GET",
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
  const [coursesResponse, curriculumResponse] = await Promise.all([
    request<Course[]>({
      url: `/program-schemes/${schemeId}/courses`,
      method: "GET",
    }),
    request<CurriculumCourseItem[]>({
      url: `/program-schemes/${schemeId}/curriculum`,
      method: "GET",
    }),
  ])

  const curriculumMap = new Map(curriculumResponse.data.map((item) => [String(item.courseId), item]))

  return coursesResponse.data.map((course) => {
    const curriculumItem = curriculumMap.get(String(course.id))

    return {
      ...course,
      courseType: curriculumItem?.courseType ?? course.courseType,
      semester: curriculumItem?.semester ?? course.semester,
      sortOrder: curriculumItem?.sortOrder ?? course.sortOrder,
    }
  })
}

interface DirectorObeMatrix {
  rows: Array<{
    courseId: ID
    cells: CourseIndicatorMatrixItem[]
  }>
}

export const getCourseIndicatorMatrix = async (courseId: ID) => {
  const courseResponse = await request<Course>({
    url: `/courses/${courseId}`,
    method: "GET",
  })

  const matrixResponse = await request<DirectorObeMatrix>({
    url: `/director/schemes/${courseResponse.data.schemeId}/matrix`,
    method: "GET",
  })

  return matrixResponse.data.rows.find((row) => String(row.courseId) === String(courseId))?.cells ?? []
}

export const saveCurriculum = async (schemeId: ID, payload: SaveCurriculumPayload) => {
  const response = await request<Course[]>({
    url: `/program-schemes/${schemeId}/curriculum`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const saveCourseIndicatorMatrix = async (
  courseId: ID,
  payload: SaveCourseIndicatorMatrixPayload,
) => {
  const courseResponse = await request<Course>({
    url: `/courses/${courseId}`,
    method: "GET",
  })

  await request<string>({
    url: `/director/schemes/${courseResponse.data.schemeId}/matrix/save`,
    method: "POST",
    data: {
      matrixItems: payload.items,
    },
  })

  return getCourseIndicatorMatrix(courseId)
}

export const clearCourseIndicatorMatrix = async (courseId: ID) => {
  await request<string>({
    url: `/courses/${courseId}/indicator-matrix`,
    method: "DELETE",
  })
  return true
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
    data: payload,
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
  const response = await request<ResourceDownloadInfo>({
    url: `/course-resources/${id}/download`,
    method: "GET",
  })
  return response.data
}

export const getCourseObjectiveList = async (courseId: ID) => {
  const response = await request<CourseObjective[]>({
    url: `/coordinator/courses/${courseId}/objectives`,
    method: "GET",
  })
  return response.data
}

export const createCourseObjective = async (courseId: ID, payload: CourseObjectivePayload) => {
  const response = await request<CourseObjective>({
    url: `/coordinator/courses/${courseId}/objectives`,
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
    url: `/coordinator/objectives/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getTeachingContentList = async (courseId: ID) => {
  const response = await request<TeachingContentItem[]>({
    url: `/courses/${courseId}/teaching-contents`,
    method: "GET",
  })
  return response.data.map(normalizeTeachingContent)
}

export const saveTeachingContents = async (courseId: ID, payload: SaveTeachingContentsPayload) => {
  const response = await request<TeachingContentItem[]>({
    url: `/courses/${courseId}/teaching-contents`,
    method: "PUT",
    data: payload,
  })
  return response.data.map(normalizeTeachingContent)
}

export const getAssessmentMethodList = async (courseId: ID) => {
  const response = await request<AssessmentMethod[]>({
    url: `/coordinator/courses/${courseId}/methods`,
    method: "GET",
  })
  return response.data
}

export const getStudentSyllabusList = async () => {
  const response = await request<StudentSyllabus[]>({
    url: "/student/syllabus",
    method: "GET",
  })
  return response.data
}

export const getStudentSyllabusDetail = async (courseId: ID) => {
  const response = await request<StudentSyllabus>({
    url: `/student/syllabus/${courseId}`,
    method: "GET",
  })
  return response.data
}

export const saveAssessmentMethods = async (courseId: ID, payload: SaveAssessmentMethodsPayload) => {
  await request<string>({
    url: `/coordinator/courses/${courseId}/methods`,
    method: "POST",
    data: payload,
  })

  return getAssessmentMethodList(courseId)
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
  return response.data.map(normalizeAssessmentStandard)
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
  return response.data.map(normalizeAssessmentStandard)
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
    data: payload,
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
  const response = await request<ResourceDownloadInfo>({
    url: `/evidence-materials/${id}/download`,
    method: "GET",
  })
  return response.data
}
