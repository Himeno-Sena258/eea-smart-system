import type { DateTimeString, ID } from "./common"

export type ReportStatus = 0 | 1 | 2 | 3
export type ReportSectionStatus = 0 | 1 | 2
export type ReportDataSourceType = "ATTAINMENT" | "SURVEY" | "TABLE" | "CHART"

export interface SelfEvaluationReport {
  id: ID
  schemeId: ID
  title: string
  version: string
  status: ReportStatus
  createdBy: ID
  createdAt: DateTimeString
  updatedAt: DateTimeString
}

export interface CreateReportPayload {
  schemeId: ID
  title: string
  version: string
  createdBy?: ID
}

export interface UpdateReportPayload {
  title?: string
  version?: string
  status?: ReportStatus
}

export interface UpdateReportStatusPayload {
  status: ReportStatus
}

export interface ReportSection {
  id: ID
  reportId: ID
  reportTitle?: string
  sectionCode: string
  title: string
  content: string
  status: ReportSectionStatus
  assignedTo?: ID
  assigneeName?: string
  updatedAt?: DateTimeString
}

export interface ReportSectionPayload {
  sectionCode: string
  title: string
  content: string
  assignedTo?: ID
  status?: ReportSectionStatus
}

export interface AssignReportSectionPayload {
  assignedTo: ID
}

export interface UpdateReportSectionStatusPayload {
  status: ReportSectionStatus
}

export interface ReportDataSource {
  id?: ID
  sectionId?: ID
  sourceType: ReportDataSourceType
  sourceKey: string
  autoFillConfig: string
}

export type SaveReportDataSourcesPayload = ReportDataSource[]

export interface AutoFillReportResult {
  reportId: ID
  filledSections: unknown[]
  message: string
}

export interface ExportReportResult {
  report: SelfEvaluationReport | null
  sections: ReportSection[]
  exportFormat: string
}
