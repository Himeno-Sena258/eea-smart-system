import { create } from "zustand"
import type {
  AssignReportSectionPayload,
  AutoFillReportResult,
  CreateReportPayload,
  ExportReportResult,
  ID,
  ReportDataSource,
  ReportSection,
  ReportSectionPayload,
  SaveReportDataSourcesPayload,
  SelfEvaluationReport,
  UpdateReportPayload,
  UpdateReportSectionStatusPayload,
  UpdateReportStatusPayload,
} from "@/models"
import {
  assignReportSection,
  autoFillReport,
  createReport,
  createReportSection,
  deleteReport,
  deleteReportSection,
  exportReport,
  getReportDataSourceList,
  getReportDetail,
  getReportList,
  getReportSectionList,
  saveReportDataSources,
  updateReport,
  updateReportSection,
  updateReportSectionStatus,
  updateReportStatus,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface ReportStore extends RequestState, RequestActions {
  reports: SelfEvaluationReport[]
  currentReport: SelfEvaluationReport | null
  sections: ReportSection[]
  dataSources: ReportDataSource[]
  fetchReports: (query?: { schemeId?: ID }) => Promise<SelfEvaluationReport[]>
  createReport: (payload: CreateReportPayload) => Promise<SelfEvaluationReport>
  fetchReportDetail: (id: ID) => Promise<SelfEvaluationReport>
  updateReport: (id: ID, payload: UpdateReportPayload) => Promise<string>
  updateReportStatus: (id: ID, payload: UpdateReportStatusPayload) => Promise<string>
  deleteReport: (id: ID) => Promise<string>
  autoFillReport: (id: ID) => Promise<AutoFillReportResult>
  exportReport: (id: ID) => Promise<ExportReportResult>
  fetchSections: (reportId: ID) => Promise<ReportSection[]>
  createSection: (reportId: ID, payload: ReportSectionPayload) => Promise<ReportSection>
  updateSection: (sectionId: ID, payload: ReportSectionPayload) => Promise<string>
  assignSection: (sectionId: ID, payload: AssignReportSectionPayload) => Promise<string>
  updateSectionStatus: (sectionId: ID, payload: UpdateReportSectionStatusPayload) => Promise<string>
  deleteSection: (sectionId: ID) => Promise<string>
  fetchDataSources: (sectionId: ID) => Promise<ReportDataSource[]>
  saveDataSources: (sectionId: ID, payload: SaveReportDataSourcesPayload) => Promise<string>
}

export const useReportStore = create<ReportStore>((set, get) => ({
  ...createInitialRequestState(),
  reports: [],
  currentReport: null,
  sections: [],
  dataSources: [],
  clearError: () => set({ error: null }),
  fetchReports: (query) => runRequest(set, () => getReportList(query), (reports) => ({ reports })),
  createReport: (payload) => runRequest(set, () => createReport(payload), (currentReport) => ({ currentReport })),
  fetchReportDetail: (id) => runRequest(set, () => getReportDetail(id), (currentReport) => ({ currentReport })),
  updateReport: (id, payload) => runRequest(set, () => updateReport(id, payload)),
  updateReportStatus: (id, payload) => runRequest(set, () => updateReportStatus(id, payload)),
  deleteReport: (id) => runRequest(set, () => deleteReport(id), () => ({ currentReport: get().currentReport?.id === id ? null : get().currentReport })),
  autoFillReport: (id) => runRequest(set, () => autoFillReport(id)),
  exportReport: (id) => runRequest(set, () => exportReport(id)),
  fetchSections: (reportId) => runRequest(set, () => getReportSectionList(reportId), (sections) => ({ sections })),
  createSection: (reportId, payload) => runRequest(set, () => createReportSection(reportId, payload), (section) => ({ sections: [...get().sections, section] })),
  updateSection: (sectionId, payload) => runRequest(set, () => updateReportSection(sectionId, payload)),
  assignSection: (sectionId, payload) => runRequest(set, () => assignReportSection(sectionId, payload)),
  updateSectionStatus: (sectionId, payload) => runRequest(set, () => updateReportSectionStatus(sectionId, payload)),
  deleteSection: (sectionId) => runRequest(set, () => deleteReportSection(sectionId), () => ({ sections: get().sections.filter((item) => item.id !== sectionId) })),
  fetchDataSources: (sectionId) => runRequest(set, () => getReportDataSourceList(sectionId), (dataSources) => ({ dataSources })),
  saveDataSources: (sectionId, payload) => runRequest(set, () => saveReportDataSources(sectionId, payload)),
}))
