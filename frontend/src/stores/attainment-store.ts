import { create } from "zustand"
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
import {
  calculateCourseObjectiveAttainment,
  calculateRequirementAttainment,
  createAttainmentModel,
  createImprovement,
  deleteAttainmentModel,
  deleteImprovement,
  generateImprovement,
  getAttainmentModelDetail,
  getAttainmentModelList,
  getCourseObjectiveAttainment,
  getCourseObjectiveAttainmentDashboard,
  getImprovementList,
  getOverviewStats,
  getRequirementAttainment,
  getRequirementAttainmentDashboard,
  getWarningStudents,
  scanWarningStudents,
  setDefaultAttainmentModel,
  updateAttainmentModel,
  updateImprovement,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface AttainmentStore extends RequestState, RequestActions {
  models: AttainmentModel[]
  currentModel: AttainmentModel | null
  courseObjectiveAttainment: CourseObjectiveAttainmentResult | null
  requirementAttainment: RequirementAttainmentResult | null
  courseObjectiveDashboard: CourseObjectiveAttainmentResult[]
  requirementDashboard: RequirementAttainmentResult[]
  overviewStats: OverviewStats | null
  warningStudents: WarningStudentResult | null
  improvements: ContinuousImprovement[]
  fetchModels: () => Promise<AttainmentModel[]>
  fetchModelDetail: (id: ID) => Promise<AttainmentModel>
  createModel: (payload: AttainmentModelPayload) => Promise<AttainmentModel>
  updateModel: (id: ID, payload: AttainmentModelPayload) => Promise<AttainmentModel>
  setDefaultModel: (id: ID) => Promise<AttainmentModel>
  deleteModel: (id: ID) => Promise<boolean>
  calculateCourseObjective: (teachingClassId: ID, modelId?: ID) => Promise<CourseObjectiveAttainmentResult>
  fetchCourseObjective: (teachingClassId: ID) => Promise<CourseObjectiveAttainmentResult>
  calculateRequirement: (schemeId: ID, modelId?: ID) => Promise<RequirementAttainmentResult>
  fetchRequirement: (schemeId: ID) => Promise<RequirementAttainmentResult>
  fetchCourseObjectiveDashboard: (query?: DashboardQuery) => Promise<CourseObjectiveAttainmentResult[]>
  fetchRequirementDashboard: (query?: DashboardQuery) => Promise<RequirementAttainmentResult[]>
  fetchOverviewStats: (query?: DashboardQuery) => Promise<OverviewStats>
  scanWarnings: (teachingClassId: ID) => Promise<WarningStudentResult>
  fetchWarnings: (teachingClassId: ID) => Promise<WarningStudentResult>
  fetchImprovements: (teachingClassId: ID) => Promise<ContinuousImprovement[]>
  createImprovement: (teachingClassId: ID, payload: ContinuousImprovementPayload) => Promise<ContinuousImprovement>
  updateImprovement: (id: ID, payload: ContinuousImprovementPayload) => Promise<ContinuousImprovement>
  deleteImprovement: (id: ID) => Promise<boolean>
  generateImprovement: (teachingClassId: ID) => Promise<ContinuousImprovement>
}

export const useAttainmentStore = create<AttainmentStore>((set, get) => ({
  ...createInitialRequestState(),
  models: [],
  currentModel: null,
  courseObjectiveAttainment: null,
  requirementAttainment: null,
  courseObjectiveDashboard: [],
  requirementDashboard: [],
  overviewStats: null,
  warningStudents: null,
  improvements: [],
  clearError: () => set({ error: null }),
  fetchModels: () => runRequest(set, getAttainmentModelList, (models) => ({ models })),
  fetchModelDetail: (id) => runRequest(set, () => getAttainmentModelDetail(id), (currentModel) => ({ currentModel })),
  createModel: (payload) => runRequest(set, () => createAttainmentModel(payload), (currentModel) => ({ currentModel })),
  updateModel: (id, payload) => runRequest(set, () => updateAttainmentModel(id, payload), (currentModel) => ({ currentModel })),
  setDefaultModel: (id) => runRequest(set, () => setDefaultAttainmentModel(id), (currentModel) => ({ currentModel })),
  deleteModel: (id) => runRequest(set, () => deleteAttainmentModel(id), () => ({ models: get().models.filter((item) => item.id !== id) })),
  calculateCourseObjective: (teachingClassId, modelId) => runRequest(set, () => calculateCourseObjectiveAttainment(teachingClassId, modelId), (courseObjectiveAttainment) => ({ courseObjectiveAttainment })),
  fetchCourseObjective: (teachingClassId) => runRequest(set, () => getCourseObjectiveAttainment(teachingClassId), (courseObjectiveAttainment) => ({ courseObjectiveAttainment })),
  calculateRequirement: (schemeId, modelId) => runRequest(set, () => calculateRequirementAttainment(schemeId, modelId), (requirementAttainment) => ({ requirementAttainment })),
  fetchRequirement: (schemeId) => runRequest(set, () => getRequirementAttainment(schemeId), (requirementAttainment) => ({ requirementAttainment })),
  fetchCourseObjectiveDashboard: (query) => runRequest(set, () => getCourseObjectiveAttainmentDashboard(query), (courseObjectiveDashboard) => ({ courseObjectiveDashboard })),
  fetchRequirementDashboard: (query) => runRequest(set, () => getRequirementAttainmentDashboard(query), (requirementDashboard) => ({ requirementDashboard })),
  fetchOverviewStats: (query) => runRequest(set, () => getOverviewStats(query), (overviewStats) => ({ overviewStats })),
  scanWarnings: (teachingClassId) => runRequest(set, () => scanWarningStudents(teachingClassId), (warningStudents) => ({ warningStudents })),
  fetchWarnings: (teachingClassId) => runRequest(set, () => getWarningStudents(teachingClassId), (warningStudents) => ({ warningStudents })),
  fetchImprovements: (teachingClassId) => runRequest(set, () => getImprovementList(teachingClassId), (improvements) => ({ improvements })),
  createImprovement: (teachingClassId, payload) => runRequest(set, () => createImprovement(teachingClassId, payload), (improvement) => ({ improvements: [...get().improvements, improvement] })),
  updateImprovement: (id, payload) => runRequest(set, () => updateImprovement(id, payload), (improvement) => ({ improvements: get().improvements.map((item) => (item.id === id ? improvement : item)) })),
  deleteImprovement: (id) => runRequest(set, () => deleteImprovement(id), () => ({ improvements: get().improvements.filter((item) => item.id !== id) })),
  generateImprovement: (teachingClassId) => runRequest(set, () => generateImprovement(teachingClassId), (improvement) => ({ improvements: [...get().improvements, improvement] })),
}))
