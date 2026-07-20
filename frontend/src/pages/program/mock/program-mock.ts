import type { Course, CourseIndicatorMatrixItem, GradIndicatorPoint, IndicatorTreeItem, ProgramScheme } from "@/models"

export const programSchemesMock: ProgramScheme[] = [
  {
    id: 1,
    majorId: 1,
    majorName: "软件工程",
    versionName: "2024版软件工程人才培养方案",
    grade: 2024,
    status: 1,
    createdBy: 2,
    createdAt: "2026-01-01 09:00:00",
  },
  {
    id: 2,
    majorId: 1,
    majorName: "软件工程",
    versionName: "2023版软件工程人才培养方案",
    grade: 2023,
    status: 2,
    createdBy: 2,
    createdAt: "2025-01-01 09:00:00",
  },
  {
    id: 3,
    majorId: 1,
    majorName: "软件工程",
    versionName: "2025版软件工程方案草稿",
    grade: 2025,
    status: 0,
    createdBy: 2,
    createdAt: "2026-01-10 14:00:00",
  },
]

export const indicatorTreeMock: IndicatorTreeItem[] = [
  {
    id: 1,
    schemeId: 1,
    code: "GR1",
    title: "工程知识",
    content: "能够将数学、自然科学、工程基础和专业知识用于解决复杂工程问题。",
    indicators: [
      { id: 11, reqId: 1, requirementId: 1, code: "1.1", content: "掌握数学、自然科学与工程基础知识。" },
      { id: 12, reqId: 1, requirementId: 1, code: "1.2", content: "能够应用专业基础知识完成建模与求解。" },
    ],
  },
  {
    id: 2,
    schemeId: 1,
    code: "GR2",
    title: "问题分析",
    content: "能够应用数学、自然科学和工程科学基本原理识别、表达并分析复杂工程问题。",
    indicators: [
      { id: 21, reqId: 2, requirementId: 2, code: "2.1", content: "能够识别并表达复杂软件工程问题。" },
      { id: 22, reqId: 2, requirementId: 2, code: "2.2", content: "能够通过文献研究分析复杂工程问题。" },
    ],
  },
  {
    id: 3,
    schemeId: 1,
    code: "GR3",
    title: "设计/开发解决方案",
    content: "能够设计针对复杂工程问题的解决方案，并体现创新意识。",
    indicators: [
      { id: 31, reqId: 3, requirementId: 3, code: "3.1", content: "能够设计满足特定需求的软件系统方案。" },
      { id: 32, reqId: 3, requirementId: 3, code: "3.2", content: "能够在设计中考虑社会、健康、安全、法律等因素。" },
    ],
  },
]

export const curriculumCoursesMock: Course[] = [
  {
    id: 101,
    schemeId: 1,
    courseCode: "SE-302",
    courseName: "软件工程",
    credits: 4,
    hours: 64,
    courseType: "专业核心课",
    semester: "第5学期",
    sortOrder: 1,
  },
  {
    id: 102,
    schemeId: 1,
    courseCode: "CS-210",
    courseName: "数据结构",
    credits: 3,
    hours: 56,
    courseType: "专业基础课",
    semester: "第3学期",
    sortOrder: 2,
  },
  {
    id: 103,
    schemeId: 1,
    courseCode: "MA-101",
    courseName: "高等数学",
    credits: 5,
    hours: 80,
    courseType: "公共基础课",
    semester: "第1学期",
    sortOrder: 3,
  },
]

export interface ProgramMatrixCell extends CourseIndicatorMatrixItem {
  courseId: number
  display: string
}

export const programMatrixMock: ProgramMatrixCell[] = [
  { courseId: 103, courseObjectiveId: 9001, indicatorPointId: 11, weight: 0.3, display: "H" },
  { courseId: 103, courseObjectiveId: 9002, indicatorPointId: 12, weight: 0.2, display: "M" },
  { courseId: 102, courseObjectiveId: 9101, indicatorPointId: 12, weight: 0.35, display: "H" },
  { courseId: 102, courseObjectiveId: 9102, indicatorPointId: 22, weight: 0.3, display: "M" },
  { courseId: 101, courseObjectiveId: 9201, indicatorPointId: 21, weight: 0.4, display: "H" },
  { courseId: 101, courseObjectiveId: 9202, indicatorPointId: 32, weight: 0.25, display: "M" },
]

export const flattenIndicators = (tree: IndicatorTreeItem[]): GradIndicatorPoint[] =>
  tree.flatMap((requirement) => requirement.indicators)
