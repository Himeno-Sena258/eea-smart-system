import { create } from "zustand"
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
  getReportPage,
  getReportSectionList,
  saveReportDataSources,
  updateReport,
  updateReportSection,
  updateReportSectionStatus,
  updateReportStatus,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface ReportStore extends RequestState, RequestActions {
  reportsPage: PageResult<SelfEvaluationReport> | null
  currentReport: SelfEvaluationReport | null
  sections: ReportSection[]
  dataSources: ReportDataSource[]
  fetchReports: (query?: PageQuery) => Promise<PageResult<SelfEvaluationReport>>
  createReport: (payload: CreateReportPayload) => Promise<SelfEvaluationReport>
  fetchReportDetail: (id: ID) => Promise<SelfEvaluationReport>
  updateReport: (id: ID, payload: UpdateReportPayload) => Promise<SelfEvaluationReport>
  updateReportStatus: (id: ID, payload: UpdateReportStatusPayload) => Promise<SelfEvaluationReport>
  deleteReport: (id: ID) => Promise<boolean>
  autoFillReport: (id: ID) => Promise<SelfEvaluationReport>
  exportReport: (id: ID) => Promise<Blob>
  fetchSections: (reportId: ID) => Promise<ReportSection[]>
  createSection: (reportId: ID, payload: ReportSectionPayload) => Promise<ReportSection>
  updateSection: (sectionId: ID, payload: ReportSectionPayload) => Promise<ReportSection>
  assignSection: (sectionId: ID, payload: AssignReportSectionPayload) => Promise<ReportSection>
  updateSectionStatus: (sectionId: ID, payload: UpdateReportSectionStatusPayload) => Promise<ReportSection>
  deleteSection: (sectionId: ID) => Promise<boolean>
  fetchDataSources: (sectionId: ID) => Promise<ReportDataSource[]>
  saveDataSources: (sectionId: ID, payload: SaveReportDataSourcesPayload) => Promise<ReportDataSource[]>
}

export const useReportStore = create<ReportStore>((set, get) => ({
  ...createInitialRequestState(),
  reportsPage: null,
  currentReport: null,
  sections: [],
  dataSources: [],
  clearError: () => set({ error: null }),
  fetchReports: (query) => runRequest(set, () => getReportPage(query), (reportsPage) => ({ reportsPage })),
  createReport: (payload) => runRequest(set, () => createReport(payload), (currentReport) => ({ currentReport })),
  fetchReportDetail: (id) => runRequest(set, () => getReportDetail(id), (currentReport) => ({ currentReport })),
  updateReport: (id, payload) => runRequest(set, () => updateReport(id, payload), (currentReport) => ({ currentReport })),
  updateReportStatus: (id, payload) => runRequest(set, () => updateReportStatus(id, payload), (currentReport) => ({ currentReport })),
  deleteReport: (id) => runRequest(set, () => deleteReport(id), () => ({ currentReport: get().currentReport?.id === id ? null : get().currentReport })),
  autoFillReport: (id) => runRequest(set, () => autoFillReport(id), (currentReport) => ({ currentReport })),
  exportReport: (id) => runRequest(set, () => exportReport(id)),
  fetchSections: (reportId) => runRequest(set, () => getReportSectionList(reportId), (sections) => ({ sections })),
  createSection: (reportId, payload) => runRequest(set, () => createReportSection(reportId, payload), (section) => ({ sections: [...get().sections, section] })),
  updateSection: (sectionId, payload) => runRequest(set, () => updateReportSection(sectionId, payload), (section) => ({ sections: get().sections.map((item) => (item.id === sectionId ? section : item)) })),
  assignSection: (sectionId, payload) => runRequest(set, () => assignReportSection(sectionId, payload), (section) => ({ sections: get().sections.map((item) => (item.id === sectionId ? section : item)) })),
  updateSectionStatus: (sectionId, payload) => runRequest(set, () => updateReportSectionStatus(sectionId, payload), (section) => ({ sections: get().sections.map((item) => (item.id === sectionId ? section : item)) })),
  deleteSection: (sectionId) => runRequest(set, () => deleteReportSection(sectionId), () => ({ sections: get().sections.filter((item) => item.id !== sectionId) })),
  fetchDataSources: (sectionId) => runRequest(set, () => getReportDataSourceList(sectionId), (dataSources) => ({ dataSources })),
  saveDataSources: (sectionId, payload) => runRequest(set, () => saveReportDataSources(sectionId, payload), (dataSources) => ({ dataSources })),
}))
