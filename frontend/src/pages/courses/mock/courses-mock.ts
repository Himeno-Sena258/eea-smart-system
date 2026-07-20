import type {
  AssessmentMethod,
  Course,
  CourseObjective,
  CourseResource,
  CourseSyllabus,
} from "@/models"

export interface CourseQualityMock {
  course: Course
  objectives: CourseObjective[]
  syllabus: CourseSyllabus
  assessmentMethods: AssessmentMethod[]
  resources: CourseResource[]
  indicatorCodes: Record<number, string[]>
}

export const courseQualityMocks: CourseQualityMock[] = [
  {
    course: {
      id: 101,
      schemeId: 1,
      courseCode: "SE-302",
      courseName: "软件工程",
      credits: 4,
      hours: 64,
      courseType: "专业核心课",
      semester: "2025-2026-1",
      sortOrder: 1,
    },
    objectives: [
      {
        id: 1001,
        courseId: 101,
        objectiveCode: "CO1",
        content: "掌握软件工程的基本概念、开发过程模型与项目管理方法。",
      },
      {
        id: 1002,
        courseId: 101,
        objectiveCode: "CO2",
        content: "能够运用 UML 等建模方法完成需求分析与系统设计。",
      },
      {
        id: 1003,
        courseId: 101,
        objectiveCode: "CO3",
        content: "能够基于团队协作完成软件设计、实现、测试与文档归档。",
      },
    ],
    syllabus: {
      id: 501,
      courseId: 101,
      courseIntroduction: "本课程面向软件工程专业核心能力培养，覆盖需求、设计、实现、测试与项目管理。",
      teachingMethod: "案例教学、项目驱动、课堂讨论、阶段性评审。",
      content: "软件过程模型、需求建模、系统设计、软件测试、项目管理与质量保障。",
      updatedAt: "2026-01-01 09:20:00",
    },
    assessmentMethods: [
      {
        id: 201,
        courseId: 101,
        name: "平时作业",
        weight: 0.2,
        items: [
          { id: 301, methodId: 201, name: "作业 1", maxScore: 100, courseObjectiveId: 1001 },
        ],
      },
      {
        id: 202,
        courseId: 101,
        name: "实验项目",
        weight: 0.3,
        items: [
          { id: 302, methodId: 202, name: "需求与设计实验", maxScore: 100, courseObjectiveId: 1002 },
        ],
      },
      {
        id: 203,
        courseId: 101,
        name: "期末考试",
        weight: 0.5,
        items: [
          { id: 303, methodId: 203, name: "综合设计题", maxScore: 40, courseObjectiveId: 1002 },
          { id: 304, methodId: 203, name: "工程实践题", maxScore: 30, courseObjectiveId: 1003 },
        ],
      },
    ],
    resources: [
      {
        id: 401,
        courseId: 101,
        resourceType: "SYLLABUS",
        fileName: "软件工程课程大纲.pdf",
        filePath: "/mock/software-engineering-syllabus.pdf",
        description: "2024 版课程大纲",
        uploadedBy: 2,
        uploadedAt: "2026-01-01 09:30:00",
      },
      {
        id: 402,
        courseId: 101,
        resourceType: "CASE",
        fileName: "需求建模案例.zip",
        filePath: "/mock/requirement-modeling-case.zip",
        description: "课堂案例与实验模板",
        uploadedBy: 3,
        uploadedAt: "2026-01-01 09:40:00",
      },
    ],
    indicatorCodes: {
      1001: ["1.2"],
      1002: ["2.1", "3.2"],
      1003: ["3.3", "5.1"],
    },
  },
  {
    course: {
      id: 102,
      schemeId: 1,
      courseCode: "CS-210",
      courseName: "数据结构",
      credits: 3,
      hours: 56,
      courseType: "专业基础课",
      semester: "2025-2026-1",
      sortOrder: 2,
    },
    objectives: [
      {
        id: 1101,
        courseId: 102,
        objectiveCode: "CO1",
        content: "理解线性表、树、图等数据结构的逻辑特性与存储表示。",
      },
      {
        id: 1102,
        courseId: 102,
        objectiveCode: "CO2",
        content: "能够分析算法复杂度，并选择合适的数据结构解决工程问题。",
      },
    ],
    syllabus: {
      id: 502,
      courseId: 102,
      courseIntroduction: "本课程支撑程序设计与复杂工程问题分析能力培养。",
      teachingMethod: "讲授、代码演示、习题训练、实验实践。",
      content: "线性结构、树与二叉树、图、查找、排序、算法复杂度。",
      updatedAt: "2026-01-02 10:20:00",
    },
    assessmentMethods: [
      {
        id: 211,
        courseId: 102,
        name: "实验",
        weight: 0.4,
        items: [
          { id: 311, methodId: 211, name: "实验报告", maxScore: 100, courseObjectiveId: 1102 },
        ],
      },
      {
        id: 212,
        courseId: 102,
        name: "期末考试",
        weight: 0.6,
        items: [
          { id: 312, methodId: 212, name: "算法设计题", maxScore: 60, courseObjectiveId: 1102 },
        ],
      },
    ],
    resources: [
      {
        id: 411,
        courseId: 102,
        resourceType: "REFERENCE",
        fileName: "数据结构实验指导书.pdf",
        filePath: "/mock/data-structure-lab.pdf",
        description: "实验任务说明",
        uploadedBy: 3,
        uploadedAt: "2026-01-02 10:30:00",
      },
    ],
    indicatorCodes: {
      1101: ["1.1"],
      1102: ["2.2", "5.1"],
    },
  },
]
