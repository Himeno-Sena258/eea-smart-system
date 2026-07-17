import { create } from "zustand"
import type {
  AuditAction,
  AuditLog,
  AuditLogQuery,
  DictOption,
  EvidenceLevelTag,
  ID,
  OrganizationType,
  PageResult,
  ReportDataSourceType,
  RoleCode,
  SurveyType,
} from "@/models"
import {
  getAuditActionDict,
  getAuditLogDetail,
  getAuditLogPage,
  getEvidenceLevelTagDict,
  getOrganizationTypeDict,
  getReportDataSourceTypeDict,
  getReportSectionStatusDict,
  getReportStatusDict,
  getRoleDict,
  getSemesterDict,
  getSurveyTypeDict,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface SystemStore extends RequestState, RequestActions {
  auditLogsPage: PageResult<AuditLog> | null
  currentAuditLog: AuditLog | null
  roleOptions: DictOption<RoleCode | string>[]
  organizationTypeOptions: DictOption<OrganizationType>[]
  evidenceLevelTagOptions: DictOption<EvidenceLevelTag>[]
  surveyTypeOptions: DictOption<SurveyType>[]
  semesterOptions: DictOption<string>[]
  reportStatusOptions: DictOption<number>[]
  reportSectionStatusOptions: DictOption<number>[]
  reportDataSourceTypeOptions: DictOption<ReportDataSourceType>[]
  auditActionOptions: DictOption<AuditAction>[]
  fetchAuditLogs: (query?: AuditLogQuery) => Promise<PageResult<AuditLog>>
  fetchAuditLogDetail: (id: ID) => Promise<AuditLog>
  fetchRoleOptions: () => Promise<DictOption<RoleCode | string>[]>
  fetchOrganizationTypeOptions: () => Promise<DictOption<OrganizationType>[]>
  fetchEvidenceLevelTagOptions: () => Promise<DictOption<EvidenceLevelTag>[]>
  fetchSurveyTypeOptions: () => Promise<DictOption<SurveyType>[]>
  fetchSemesterOptions: () => Promise<DictOption<string>[]>
  fetchReportStatusOptions: () => Promise<DictOption<number>[]>
  fetchReportSectionStatusOptions: () => Promise<DictOption<number>[]>
  fetchReportDataSourceTypeOptions: () => Promise<DictOption<ReportDataSourceType>[]>
  fetchAuditActionOptions: () => Promise<DictOption<AuditAction>[]>
}

export const useSystemStore = create<SystemStore>((set) => ({
  ...createInitialRequestState(),
  auditLogsPage: null,
  currentAuditLog: null,
  roleOptions: [],
  organizationTypeOptions: [],
  evidenceLevelTagOptions: [],
  surveyTypeOptions: [],
  semesterOptions: [],
  reportStatusOptions: [],
  reportSectionStatusOptions: [],
  reportDataSourceTypeOptions: [],
  auditActionOptions: [],
  clearError: () => set({ error: null }),
  fetchAuditLogs: (query) => runRequest(set, () => getAuditLogPage(query), (auditLogsPage) => ({ auditLogsPage })),
  fetchAuditLogDetail: (id) => runRequest(set, () => getAuditLogDetail(id), (currentAuditLog) => ({ currentAuditLog })),
  fetchRoleOptions: () => runRequest(set, getRoleDict, (roleOptions) => ({ roleOptions })),
  fetchOrganizationTypeOptions: () => runRequest(set, getOrganizationTypeDict, (organizationTypeOptions) => ({ organizationTypeOptions })),
  fetchEvidenceLevelTagOptions: () => runRequest(set, getEvidenceLevelTagDict, (evidenceLevelTagOptions) => ({ evidenceLevelTagOptions })),
  fetchSurveyTypeOptions: () => runRequest(set, getSurveyTypeDict, (surveyTypeOptions) => ({ surveyTypeOptions })),
  fetchSemesterOptions: () => runRequest(set, getSemesterDict, (semesterOptions) => ({ semesterOptions })),
  fetchReportStatusOptions: () => runRequest(set, getReportStatusDict, (reportStatusOptions) => ({ reportStatusOptions })),
  fetchReportSectionStatusOptions: () => runRequest(set, getReportSectionStatusDict, (reportSectionStatusOptions) => ({ reportSectionStatusOptions })),
  fetchReportDataSourceTypeOptions: () => runRequest(set, getReportDataSourceTypeDict, (reportDataSourceTypeOptions) => ({ reportDataSourceTypeOptions })),
  fetchAuditActionOptions: () => runRequest(set, getAuditActionDict, (auditActionOptions) => ({ auditActionOptions })),
}))
