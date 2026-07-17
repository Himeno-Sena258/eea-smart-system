import { request } from "./http"
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

export const getAuditLogPage = async (query?: AuditLogQuery) => {
  const response = await request<PageResult<AuditLog>>({
    url: "/audit-logs",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getAuditLogDetail = async (id: ID) => {
  const response = await request<AuditLog>({
    url: `/audit-logs/${id}`,
    method: "GET",
  })
  return response.data
}

export const getRoleDict = async () => {
  const response = await request<DictOption<RoleCode | string>[]>({
    url: "/dicts/roles",
    method: "GET",
  })
  return response.data
}

export const getOrganizationTypeDict = async () => {
  const response = await request<DictOption<OrganizationType>[]>({
    url: "/dicts/organization-types",
    method: "GET",
  })
  return response.data
}

export const getEvidenceLevelTagDict = async () => {
  const response = await request<DictOption<EvidenceLevelTag>[]>({
    url: "/dicts/evidence-level-tags",
    method: "GET",
  })
  return response.data
}

export const getSurveyTypeDict = async () => {
  const response = await request<DictOption<SurveyType>[]>({
    url: "/dicts/survey-types",
    method: "GET",
  })
  return response.data
}

export const getSemesterDict = async () => {
  const response = await request<DictOption<string>[]>({
    url: "/dicts/semesters",
    method: "GET",
  })
  return response.data
}

export const getReportStatusDict = async () => {
  const response = await request<DictOption<number>[]>({
    url: "/dicts/report-statuses",
    method: "GET",
  })
  return response.data
}

export const getReportSectionStatusDict = async () => {
  const response = await request<DictOption<number>[]>({
    url: "/dicts/report-section-statuses",
    method: "GET",
  })
  return response.data
}

export const getReportDataSourceTypeDict = async () => {
  const response = await request<DictOption<ReportDataSourceType>[]>({
    url: "/dicts/report-data-source-types",
    method: "GET",
  })
  return response.data
}

export const getAuditActionDict = async () => {
  const response = await request<DictOption<AuditAction>[]>({
    url: "/dicts/audit-actions",
    method: "GET",
  })
  return response.data
}
