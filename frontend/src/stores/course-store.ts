import { create } from "zustand"
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
import {
  clearCourseIndicatorMatrix,
  createAssessmentItem,
  createCourse,
  createCourseObjective,
  deleteAssessmentItem,
  deleteCourse,
  deleteCourseObjective,
  deleteCourseResource,
  deleteEvidenceMaterial,
  downloadCourseResource,
  downloadEvidenceMaterial,
  getAssessmentMethodList,
  getAssessmentStandardList,
  getCourseDetail,
  getCourseIndicatorMatrix,
  getCourseObjectiveList,
  getCoursePage,
  getCourseResourceList,
  getCourseSyllabus,
  getCurriculum,
  getEvidenceMaterialList,
  getTeachingContentList,
  importCourses,
  saveAssessmentMethods,
  saveAssessmentStandards,
  saveCourseIndicatorMatrix,
  saveCourseSyllabus,
  saveCurriculum,
  saveTeachingContents,
  updateAssessmentItem,
  updateCourse,
  updateCourseObjective,
  updateCourseResource,
  uploadCourseResource,
  uploadEvidenceMaterial,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface CourseStore extends RequestState, RequestActions {
  coursesPage: PageResult<Course> | null
  currentCourse: Course | null
  curriculum: Course[]
  indicatorMatrix: CourseIndicatorMatrixItem[]
  syllabus: CourseSyllabus | null
  resources: CourseResource[]
  objectives: CourseObjective[]
  teachingContents: TeachingContentItem[]
  assessmentMethods: AssessmentMethod[]
  assessmentStandards: AssessmentStandard[]
  evidenceMaterials: EvidenceMaterial[]
  fetchCourses: (query?: CourseQuery) => Promise<PageResult<Course>>
  fetchCourseDetail: (id: ID) => Promise<Course>
  createCourse: (payload: CoursePayload) => Promise<Course>
  updateCourse: (id: ID, payload: CoursePayload) => Promise<Course>
  deleteCourse: (id: ID) => Promise<boolean>
  importCourses: (file: File) => Promise<ImportResult>
  fetchCurriculum: (schemeId: ID) => Promise<Course[]>
  saveCurriculum: (schemeId: ID, payload: SaveCurriculumPayload) => Promise<Course[]>
  fetchIndicatorMatrix: (courseId: ID) => Promise<CourseIndicatorMatrixItem[]>
  saveIndicatorMatrix: (courseId: ID, payload: SaveCourseIndicatorMatrixPayload) => Promise<CourseIndicatorMatrixItem[]>
  clearIndicatorMatrix: (courseId: ID) => Promise<boolean>
  fetchSyllabus: (courseId: ID) => Promise<CourseSyllabus>
  saveSyllabus: (courseId: ID, payload: CourseSyllabusPayload) => Promise<CourseSyllabus>
  fetchResources: (courseId: ID) => Promise<CourseResource[]>
  uploadResource: (courseId: ID, payload: CourseResourcePayload) => Promise<CourseResource>
  updateResource: (id: ID, payload: Pick<CourseResource, "resourceType" | "description">) => Promise<CourseResource>
  deleteResource: (id: ID) => Promise<boolean>
  downloadResource: (id: ID) => Promise<Blob>
  fetchObjectives: (courseId: ID) => Promise<CourseObjective[]>
  createObjective: (courseId: ID, payload: CourseObjectivePayload) => Promise<CourseObjective>
  updateObjective: (id: ID, payload: CourseObjectivePayload) => Promise<CourseObjective>
  deleteObjective: (id: ID) => Promise<boolean>
  fetchTeachingContents: (courseId: ID) => Promise<TeachingContentItem[]>
  saveTeachingContents: (courseId: ID, payload: SaveTeachingContentsPayload) => Promise<TeachingContentItem[]>
  fetchAssessmentMethods: (courseId: ID) => Promise<AssessmentMethod[]>
  saveAssessmentMethods: (courseId: ID, payload: SaveAssessmentMethodsPayload) => Promise<AssessmentMethod[]>
  createAssessmentItem: (methodId: ID, payload: AssessmentItemPayload) => Promise<AssessmentItem>
  updateAssessmentItem: (id: ID, payload: AssessmentItemPayload) => Promise<AssessmentItem>
  deleteAssessmentItem: (id: ID) => Promise<boolean>
  fetchAssessmentStandards: (itemId: ID) => Promise<AssessmentStandard[]>
  saveAssessmentStandards: (itemId: ID, payload: SaveAssessmentStandardsPayload) => Promise<AssessmentStandard[]>
  fetchEvidenceMaterials: (teachingClassId: ID) => Promise<EvidenceMaterial[]>
  uploadEvidenceMaterial: (teachingClassId: ID, payload: EvidenceMaterialPayload) => Promise<EvidenceMaterial>
  deleteEvidenceMaterial: (id: ID) => Promise<boolean>
  downloadEvidenceMaterial: (id: ID) => Promise<Blob>
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  ...createInitialRequestState(),
  coursesPage: null,
  currentCourse: null,
  curriculum: [],
  indicatorMatrix: [],
  syllabus: null,
  resources: [],
  objectives: [],
  teachingContents: [],
  assessmentMethods: [],
  assessmentStandards: [],
  evidenceMaterials: [],
  clearError: () => set({ error: null }),
  fetchCourses: (query) => runRequest(set, () => getCoursePage(query), (coursesPage) => ({ coursesPage })),
  fetchCourseDetail: (id) => runRequest(set, () => getCourseDetail(id), (currentCourse) => ({ currentCourse })),
  createCourse: (payload) => runRequest(set, () => createCourse(payload), (currentCourse) => ({ currentCourse })),
  updateCourse: (id, payload) => runRequest(set, () => updateCourse(id, payload), (currentCourse) => ({ currentCourse })),
  deleteCourse: (id) => runRequest(set, () => deleteCourse(id)),
  importCourses: (file) => runRequest(set, () => importCourses(file)),
  fetchCurriculum: (schemeId) => runRequest(set, () => getCurriculum(schemeId), (curriculum) => ({ curriculum })),
  saveCurriculum: (schemeId, payload) => runRequest(set, () => saveCurriculum(schemeId, payload), (curriculum) => ({ curriculum })),
  fetchIndicatorMatrix: (courseId) => runRequest(set, () => getCourseIndicatorMatrix(courseId), (indicatorMatrix) => ({ indicatorMatrix })),
  saveIndicatorMatrix: (courseId, payload) => runRequest(set, () => saveCourseIndicatorMatrix(courseId, payload), (indicatorMatrix) => ({ indicatorMatrix })),
  clearIndicatorMatrix: (courseId) => runRequest(set, () => clearCourseIndicatorMatrix(courseId), () => ({ indicatorMatrix: [] })),
  fetchSyllabus: (courseId) => runRequest(set, () => getCourseSyllabus(courseId), (syllabus) => ({ syllabus })),
  saveSyllabus: (courseId, payload) => runRequest(set, () => saveCourseSyllabus(courseId, payload), (syllabus) => ({ syllabus })),
  fetchResources: (courseId) => runRequest(set, () => getCourseResourceList(courseId), (resources) => ({ resources })),
  uploadResource: (courseId, payload) => runRequest(set, () => uploadCourseResource(courseId, payload), (resource) => ({ resources: [...get().resources, resource] })),
  updateResource: (id, payload) => runRequest(set, () => updateCourseResource(id, payload), (resource) => ({ resources: get().resources.map((item) => (item.id === id ? resource : item)) })),
  deleteResource: (id) => runRequest(set, () => deleteCourseResource(id), () => ({ resources: get().resources.filter((item) => item.id !== id) })),
  downloadResource: (id) => runRequest(set, () => downloadCourseResource(id)),
  fetchObjectives: (courseId) => runRequest(set, () => getCourseObjectiveList(courseId), (objectives) => ({ objectives })),
  createObjective: (courseId, payload) => runRequest(set, () => createCourseObjective(courseId, payload), (objective) => ({ objectives: [...get().objectives, objective] })),
  updateObjective: (id, payload) => runRequest(set, () => updateCourseObjective(id, payload), (objective) => ({ objectives: get().objectives.map((item) => (item.id === id ? objective : item)) })),
  deleteObjective: (id) => runRequest(set, () => deleteCourseObjective(id), () => ({ objectives: get().objectives.filter((item) => item.id !== id) })),
  fetchTeachingContents: (courseId) => runRequest(set, () => getTeachingContentList(courseId), (teachingContents) => ({ teachingContents })),
  saveTeachingContents: (courseId, payload) => runRequest(set, () => saveTeachingContents(courseId, payload), (teachingContents) => ({ teachingContents })),
  fetchAssessmentMethods: (courseId) => runRequest(set, () => getAssessmentMethodList(courseId), (assessmentMethods) => ({ assessmentMethods })),
  saveAssessmentMethods: (courseId, payload) => runRequest(set, () => saveAssessmentMethods(courseId, payload), (assessmentMethods) => ({ assessmentMethods })),
  createAssessmentItem: (methodId, payload) => runRequest(set, () => createAssessmentItem(methodId, payload)),
  updateAssessmentItem: (id, payload) => runRequest(set, () => updateAssessmentItem(id, payload)),
  deleteAssessmentItem: (id) => runRequest(set, () => deleteAssessmentItem(id)),
  fetchAssessmentStandards: (itemId) => runRequest(set, () => getAssessmentStandardList(itemId), (assessmentStandards) => ({ assessmentStandards })),
  saveAssessmentStandards: (itemId, payload) => runRequest(set, () => saveAssessmentStandards(itemId, payload), (assessmentStandards) => ({ assessmentStandards })),
  fetchEvidenceMaterials: (teachingClassId) => runRequest(set, () => getEvidenceMaterialList(teachingClassId), (evidenceMaterials) => ({ evidenceMaterials })),
  uploadEvidenceMaterial: (teachingClassId, payload) => runRequest(set, () => uploadEvidenceMaterial(teachingClassId, payload), (material) => ({ evidenceMaterials: [...get().evidenceMaterials, material] })),
  deleteEvidenceMaterial: (id) => runRequest(set, () => deleteEvidenceMaterial(id), () => ({ evidenceMaterials: get().evidenceMaterials.filter((item) => item.id !== id) })),
  downloadEvidenceMaterial: (id) => runRequest(set, () => downloadEvidenceMaterial(id)),
}))
