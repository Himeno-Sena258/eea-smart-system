import { download, request } from "./http"
import type {
  AssignReportSectionPayload,
  CreateReportPayload,
  ID,
  PageQuery,
  PageResult,
  ReportDataSource,
  ReportSection,
  ReportSectionPayload,
  SaveReportDataSourcesPayload,
  SelfEvaluationReport,
  UpdateReportPayload,
  UpdateReportSectionStatusPayload,
  UpdateReportStatusPayload,
} from "@/models"

export const getReportPage = async (query?: PageQuery) => {
  const response = await request<PageResult<SelfEvaluationReport>>({
    url: "/self-evaluation/reports",
    method: "GET",
    params: query,
  })
  return response.data
}

export const createReport = async (payload: CreateReportPayload) => {
  const response = await request<SelfEvaluationReport>({
    url: "/self-evaluation/reports",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const getReportDetail = async (id: ID) => {
  const response = await request<SelfEvaluationReport>({
    url: `/self-evaluation/reports/${id}`,
    method: "GET",
  })
  return response.data
}

export const updateReport = async (id: ID, payload: UpdateReportPayload) => {
  const response = await request<SelfEvaluationReport>({
    url: `/self-evaluation/reports/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const updateReportStatus = async (id: ID, payload: UpdateReportStatusPayload) => {
  const response = await request<SelfEvaluationReport>({
    url: `/self-evaluation/reports/${id}/status`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteReport = async (id: ID) => {
  const response = await request<boolean>({
    url: `/self-evaluation/reports/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const autoFillReport = async (id: ID) => {
  const response = await request<SelfEvaluationReport>({
    url: `/self-evaluation/reports/${id}/auto-fill`,
    method: "POST",
  })
  return response.data
}

export const exportReport = async (id: ID) => {
  return download(`/self-evaluation/reports/${id}/export`)
}

export const getReportSectionList = async (reportId: ID) => {
  const response = await request<ReportSection[]>({
    url: `/self-evaluation/reports/${reportId}/sections`,
    method: "GET",
  })
  return response.data
}

export const createReportSection = async (reportId: ID, payload: ReportSectionPayload) => {
  const response = await request<ReportSection>({
    url: `/self-evaluation/reports/${reportId}/sections`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateReportSection = async (sectionId: ID, payload: ReportSectionPayload) => {
  const response = await request<ReportSection>({
    url: `/self-evaluation/sections/${sectionId}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const assignReportSection = async (
  sectionId: ID,
  payload: AssignReportSectionPayload,
) => {
  const response = await request<ReportSection>({
    url: `/self-evaluation/sections/${sectionId}/assign`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const updateReportSectionStatus = async (
  sectionId: ID,
  payload: UpdateReportSectionStatusPayload,
) => {
  const response = await request<ReportSection>({
    url: `/self-evaluation/sections/${sectionId}/status`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const deleteReportSection = async (sectionId: ID) => {
  const response = await request<boolean>({
    url: `/self-evaluation/sections/${sectionId}`,
    method: "DELETE",
  })
  return response.data
}

export const getReportDataSourceList = async (sectionId: ID) => {
  const response = await request<ReportDataSource[]>({
    url: `/self-evaluation/sections/${sectionId}/data-sources`,
    method: "GET",
  })
  return response.data
}

export const saveReportDataSources = async (
  sectionId: ID,
  payload: SaveReportDataSourcesPayload,
) => {
  const response = await request<ReportDataSource[]>({
    url: `/self-evaluation/sections/${sectionId}/data-sources`,
    method: "PUT",
    data: payload,
  })
  return response.data
}
