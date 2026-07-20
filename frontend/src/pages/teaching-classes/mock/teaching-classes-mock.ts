import type { EvidenceMaterial, ScoreTable, TeachingClass } from "@/models"

export interface TeachingClassMonitor {
  teachingClass: TeachingClass
  studentCount: number
  averageScore: number
  attainmentAverage: number
  lowObjective: string
}

export const teachingClassMonitors: TeachingClassMonitor[] = [
  {
    teachingClass: {
      id: 1001,
      courseId: 101,
      courseName: "软件工程",
      teacherId: 201,
      teacherName: "张老师",
      semester: "2025-2026-1",
      className: "软件工程 01 班",
    },
    studentCount: 42,
    averageScore: 82.4,
    attainmentAverage: 0.75,
    lowObjective: "CO2",
  },
  {
    teachingClass: {
      id: 1002,
      courseId: 101,
      courseName: "软件工程",
      teacherId: 202,
      teacherName: "陈老师",
      semester: "2025-2026-1",
      className: "软件工程 02 班",
    },
    studentCount: 39,
    averageScore: 78.1,
    attainmentAverage: 0.69,
    lowObjective: "CO2",
  },
  {
    teachingClass: {
      id: 1003,
      courseId: 101,
      courseName: "软件工程",
      teacherId: 203,
      teacherName: "王老师",
      semester: "2025-2026-1",
      className: "软件工程 03 班",
    },
    studentCount: 44,
    averageScore: 85.6,
    attainmentAverage: 0.8,
    lowObjective: "无",
  },
]

export const scoreTableMock: ScoreTable = {
  teachingClassId: 1001,
  assessmentItems: [
    { id: 301, name: "作业 1", maxScore: 100, courseObjectiveId: 1001 },
    { id: 302, name: "需求与设计实验", maxScore: 100, courseObjectiveId: 1002 },
    { id: 303, name: "期末大题 1", maxScore: 40, courseObjectiveId: 1002 },
  ],
  students: [
    {
      id: 1,
      username: "2024001",
      realName: "刘同学",
      studentNo: "2024001",
      classId: 1,
      className: "软件工程 2024 级 1 班",
      scores: { 301: 85, 302: 88, 303: 25 },
    },
    {
      id: 2,
      username: "2024002",
      realName: "王同学",
      studentNo: "2024002",
      classId: 1,
      className: "软件工程 2024 级 1 班",
      scores: { 301: 70, 302: 64, 303: 15 },
    },
    {
      id: 3,
      username: "2024003",
      realName: "赵同学",
      studentNo: "2024003",
      classId: 1,
      className: "软件工程 2024 级 1 班",
      scores: { 301: 92, 302: 86, 303: 31 },
    },
  ],
}

export const evidenceMaterialsMock: EvidenceMaterial[] = [
  {
    id: 501,
    teachingClassId: 1001,
    assessmentMethodId: 203,
    fileName: "中档样卷-M-李四-75分.pdf",
    filePath: "/mock/middle-sample.pdf",
    levelTag: "MEDIUM",
    uploadedBy: 201,
    uploadedAt: "2026-01-01 10:00:00",
  },
  {
    id: 502,
    teachingClassId: 1001,
    assessmentMethodId: 203,
    fileName: "低档样卷-L-王五-58分.pdf",
    filePath: "/mock/low-sample.pdf",
    levelTag: "LOW",
    uploadedBy: 201,
    uploadedAt: "2026-01-01 10:10:00",
  },
]
