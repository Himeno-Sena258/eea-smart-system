import { create } from "zustand"
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
import {
  archiveProgramScheme,
  clearGoalRequirementMatrix,
  createClassInfo,
  createEducationGoal,
  createIndicator,
  createMajor,
  createOrganization,
  createProgramScheme,
  createRequirement,
  deleteClassInfo,
  deleteEducationGoal,
  deleteIndicator,
  deleteMajor,
  deleteOrganization,
  deleteProgramScheme,
  deleteRequirement,
  getClassInfoDetail,
  getClassInfoPage,
  getEducationGoalList,
  getGoalRequirementMatrix,
  getIndicatorList,
  getIndicatorTree,
  getMajorDetail,
  getMajorPage,
  getOrganizationDetail,
  getOrganizationPage,
  getOrganizationTree,
  getProgramSchemeDetail,
  getProgramSchemeList,
  getRequirementList,
  initRequirements,
  publishProgramScheme,
  saveGoalRequirementMatrix,
  updateClassInfo,
  updateEducationGoal,
  updateIndicator,
  updateMajor,
  updateOrganization,
  updateProgramScheme,
  updateRequirement,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface BaseStore extends RequestState, RequestActions {
  organizationTree: Organization[]
  organizationsPage: PageResult<Organization> | null
  currentOrganization: Organization | null
  classesPage: PageResult<ClassInfo> | null
  currentClassInfo: ClassInfo | null
  majorsPage: PageResult<Major> | null
  currentMajor: Major | null
  programSchemes: ProgramScheme[]
  currentProgramScheme: ProgramScheme | null
  educationGoals: EducationGoal[]
  requirements: GradRequirement[]
  indicators: GradIndicatorPoint[]
  indicatorTree: IndicatorTreeItem[]
  goalRequirementMatrix: SaveGoalRequirementMatrixPayload | null
  fetchOrganizationTree: () => Promise<Organization[]>
  fetchOrganizations: (query?: PageQuery) => Promise<PageResult<Organization>>
  fetchOrganizationDetail: (id: ID) => Promise<Organization>
  createOrganization: (payload: OrganizationPayload) => Promise<Organization>
  updateOrganization: (id: ID, payload: OrganizationPayload) => Promise<Organization>
  deleteOrganization: (id: ID) => Promise<boolean>
  fetchClasses: (query?: BaseDataQuery) => Promise<PageResult<ClassInfo>>
  fetchClassInfoDetail: (id: ID) => Promise<ClassInfo>
  createClassInfo: (payload: ClassInfoPayload) => Promise<ClassInfo>
  updateClassInfo: (id: ID, payload: ClassInfoPayload) => Promise<ClassInfo>
  deleteClassInfo: (id: ID) => Promise<boolean>
  fetchMajors: (query?: PageQuery) => Promise<PageResult<Major>>
  fetchMajorDetail: (id: ID) => Promise<Major>
  createMajor: (payload: MajorPayload) => Promise<Major>
  updateMajor: (id: ID, payload: MajorPayload) => Promise<Major>
  deleteMajor: (id: ID) => Promise<boolean>
  fetchProgramSchemes: (query?: BaseDataQuery) => Promise<ProgramScheme[]>
  fetchProgramSchemeDetail: (id: ID) => Promise<ProgramScheme>
  createProgramScheme: (payload: ProgramSchemePayload) => Promise<ProgramScheme>
  updateProgramScheme: (id: ID, payload: ProgramSchemePayload) => Promise<ProgramScheme>
  publishProgramScheme: (id: ID) => Promise<ProgramScheme>
  archiveProgramScheme: (id: ID) => Promise<ProgramScheme>
  deleteProgramScheme: (id: ID) => Promise<boolean>
  fetchEducationGoals: (schemeId: ID) => Promise<EducationGoal[]>
  createEducationGoal: (schemeId: ID, payload: EducationGoalPayload) => Promise<EducationGoal>
  updateEducationGoal: (id: ID, payload: EducationGoalPayload) => Promise<EducationGoal>
  deleteEducationGoal: (id: ID) => Promise<boolean>
  fetchRequirements: (schemeId: ID) => Promise<GradRequirement[]>
  createRequirement: (schemeId: ID, payload: GradRequirementPayload) => Promise<GradRequirement>
  initRequirements: (schemeId: ID) => Promise<GradRequirement[]>
  updateRequirement: (id: ID, payload: GradRequirementPayload) => Promise<GradRequirement>
  deleteRequirement: (id: ID) => Promise<boolean>
  fetchIndicators: (requirementId: ID) => Promise<GradIndicatorPoint[]>
  fetchIndicatorTree: (schemeId: ID) => Promise<IndicatorTreeItem[]>
  createIndicator: (requirementId: ID, payload: GradIndicatorPointPayload) => Promise<GradIndicatorPoint>
  updateIndicator: (id: ID, payload: GradIndicatorPointPayload) => Promise<GradIndicatorPoint>
  deleteIndicator: (id: ID) => Promise<boolean>
  fetchGoalRequirementMatrix: (schemeId: ID) => Promise<SaveGoalRequirementMatrixPayload>
  saveGoalRequirementMatrix: (schemeId: ID, payload: SaveGoalRequirementMatrixPayload) => Promise<SaveGoalRequirementMatrixPayload>
  clearGoalRequirementMatrix: (schemeId: ID) => Promise<boolean>
}

export const useBaseStore = create<BaseStore>((set) => ({
  ...createInitialRequestState(),
  organizationTree: [],
  organizationsPage: null,
  currentOrganization: null,
  classesPage: null,
  currentClassInfo: null,
  majorsPage: null,
  currentMajor: null,
  programSchemes: [],
  currentProgramScheme: null,
  educationGoals: [],
  requirements: [],
  indicators: [],
  indicatorTree: [],
  goalRequirementMatrix: null,
  clearError: () => set({ error: null }),
  fetchOrganizationTree: () => runRequest(set, getOrganizationTree, (organizationTree) => ({ organizationTree })),
  fetchOrganizations: (query) => runRequest(set, () => getOrganizationPage(query), (organizationsPage) => ({ organizationsPage })),
  fetchOrganizationDetail: (id) => runRequest(set, () => getOrganizationDetail(id), (currentOrganization) => ({ currentOrganization })),
  createOrganization: (payload) => runRequest(set, () => createOrganization(payload), (currentOrganization) => ({ currentOrganization })),
  updateOrganization: (id, payload) => runRequest(set, () => updateOrganization(id, payload), (currentOrganization) => ({ currentOrganization })),
  deleteOrganization: (id) => runRequest(set, () => deleteOrganization(id)),
  fetchClasses: (query) => runRequest(set, () => getClassInfoPage(query), (classesPage) => ({ classesPage })),
  fetchClassInfoDetail: (id) => runRequest(set, () => getClassInfoDetail(id), (currentClassInfo) => ({ currentClassInfo })),
  createClassInfo: (payload) => runRequest(set, () => createClassInfo(payload), (currentClassInfo) => ({ currentClassInfo })),
  updateClassInfo: (id, payload) => runRequest(set, () => updateClassInfo(id, payload), (currentClassInfo) => ({ currentClassInfo })),
  deleteClassInfo: (id) => runRequest(set, () => deleteClassInfo(id)),
  fetchMajors: (query) => runRequest(set, () => getMajorPage(query), (majorsPage) => ({ majorsPage })),
  fetchMajorDetail: (id) => runRequest(set, () => getMajorDetail(id), (currentMajor) => ({ currentMajor })),
  createMajor: (payload) => runRequest(set, () => createMajor(payload), (currentMajor) => ({ currentMajor })),
  updateMajor: (id, payload) => runRequest(set, () => updateMajor(id, payload), (currentMajor) => ({ currentMajor })),
  deleteMajor: (id) => runRequest(set, () => deleteMajor(id)),
  fetchProgramSchemes: (query) => runRequest(set, () => getProgramSchemeList(query), (programSchemes) => ({ programSchemes })),
  fetchProgramSchemeDetail: (id) => runRequest(set, () => getProgramSchemeDetail(id), (currentProgramScheme) => ({ currentProgramScheme })),
  createProgramScheme: (payload) => runRequest(set, () => createProgramScheme(payload), (currentProgramScheme) => ({ currentProgramScheme })),
  updateProgramScheme: (id, payload) => runRequest(set, () => updateProgramScheme(id, payload), (currentProgramScheme) => ({ currentProgramScheme })),
  publishProgramScheme: (id) => runRequest(set, () => publishProgramScheme(id), (currentProgramScheme) => ({ currentProgramScheme })),
  archiveProgramScheme: (id) => runRequest(set, () => archiveProgramScheme(id), (currentProgramScheme) => ({ currentProgramScheme })),
  deleteProgramScheme: (id) => runRequest(set, () => deleteProgramScheme(id)),
  fetchEducationGoals: (schemeId) => runRequest(set, () => getEducationGoalList(schemeId), (educationGoals) => ({ educationGoals })),
  createEducationGoal: (schemeId, payload) => runRequest(set, () => createEducationGoal(schemeId, payload)),
  updateEducationGoal: (id, payload) => runRequest(set, () => updateEducationGoal(id, payload)),
  deleteEducationGoal: (id) => runRequest(set, () => deleteEducationGoal(id)),
  fetchRequirements: (schemeId) => runRequest(set, () => getRequirementList(schemeId), (requirements) => ({ requirements })),
  createRequirement: (schemeId, payload) => runRequest(set, () => createRequirement(schemeId, payload)),
  initRequirements: (schemeId) => runRequest(set, () => initRequirements(schemeId), (requirements) => ({ requirements })),
  updateRequirement: (id, payload) => runRequest(set, () => updateRequirement(id, payload)),
  deleteRequirement: (id) => runRequest(set, () => deleteRequirement(id)),
  fetchIndicators: (requirementId) => runRequest(set, () => getIndicatorList(requirementId), (indicators) => ({ indicators })),
  fetchIndicatorTree: (schemeId) => runRequest(set, () => getIndicatorTree(schemeId), (indicatorTree) => ({ indicatorTree })),
  createIndicator: (requirementId, payload) => runRequest(set, () => createIndicator(requirementId, payload)),
  updateIndicator: (id, payload) => runRequest(set, () => updateIndicator(id, payload)),
  deleteIndicator: (id) => runRequest(set, () => deleteIndicator(id)),
  fetchGoalRequirementMatrix: (schemeId) => runRequest(set, () => getGoalRequirementMatrix(schemeId), (goalRequirementMatrix) => ({ goalRequirementMatrix })),
  saveGoalRequirementMatrix: (schemeId, payload) => runRequest(set, () => saveGoalRequirementMatrix(schemeId, payload), (goalRequirementMatrix) => ({ goalRequirementMatrix })),
  clearGoalRequirementMatrix: (schemeId) => runRequest(set, () => clearGoalRequirementMatrix(schemeId), () => ({ goalRequirementMatrix: null })),
}))
