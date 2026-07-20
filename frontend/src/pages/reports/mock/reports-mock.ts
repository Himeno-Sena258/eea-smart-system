import type { ReportDataSource, ReportSection, SelfEvaluationReport } from "@/models"

export const reportMock: SelfEvaluationReport = {
  id: 1,
  schemeId: 1,
  title: "软件工程专业认证自评报告",
  version: "2026版",
  status: 1,
  createdBy: 2,
  createdAt: "2026-01-01 09:00:00",
  updatedAt: "2026-01-08 16:30:00",
}

export interface ReportSectionMock extends ReportSection {
  assigneeName?: string
}

export const reportSectionsMock: ReportSectionMock[] = [
  {
    id: 101,
    reportId: 1,
    sectionCode: "1",
    title: "学生",
    content: "本专业生源稳定，学生培养过程数据完整。",
    status: 2,
    assignedTo: 2,
    assigneeName: "李主任",
    updatedAt: "2026-01-04 10:00:00",
  },
  {
    id: 102,
    reportId: 1,
    sectionCode: "1.1",
    title: "生源分析",
    content: "近三年招生规模稳定，第一志愿录取比例保持在较高水平。",
    status: 2,
    assignedTo: 2,
    assigneeName: "李主任",
    updatedAt: "2026-01-04 11:20:00",
  },
  {
    id: 103,
    reportId: 1,
    sectionCode: "3",
    title: "毕业要求",
    content: "本专业依据工程教育认证标准，建立了毕业要求达成度评价机制。评价结果显示，各项毕业要求总体达成情况稳定，低达成指标点已进入持续改进闭环。",
    status: 1,
    assignedTo: 3,
    assigneeName: "张老师",
    updatedAt: "2026-01-08 16:30:00",
  },
  {
    id: 104,
    reportId: 1,
    sectionCode: "3.1",
    title: "达成度评价结果",
    content: "系统自动汇总课程目标达成度、毕业要求达成度和问卷间接评价结果，用于支撑本章节论证。",
    status: 1,
    assignedTo: 3,
    assigneeName: "张老师",
    updatedAt: "2026-01-08 15:00:00",
  },
  {
    id: 105,
    reportId: 1,
    sectionCode: "7",
    title: "持续改进",
    content: "持续改进部分待汇总各课程改进记录。",
    status: 0,
    assignedTo: 4,
    assigneeName: "王老师",
    updatedAt: "2026-01-06 09:40:00",
  },
]

export const reportDataSourcesMock: ReportDataSource[] = [
  {
    id: 1,
    sectionId: 103,
    sourceType: "ATTAINMENT",
    sourceKey: "scheme:1",
    autoFillConfig: { chartType: "radar", title: "毕业要求达成度雷达图" },
  },
  {
    id: 2,
    sectionId: 103,
    sourceType: "SURVEY",
    sourceKey: "survey:1",
    autoFillConfig: { title: "毕业生达成度自评统计" },
  },
  {
    id: 3,
    sectionId: 104,
    sourceType: "TABLE",
    sourceKey: "attainment:course-objectives",
    autoFillConfig: { title: "课程目标达成度汇总表" },
  },
]
