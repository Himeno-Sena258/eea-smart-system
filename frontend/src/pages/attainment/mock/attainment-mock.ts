import type { CourseObjectiveAttainmentResult, RequirementAttainmentResult, RoleCode } from "@/models"

export interface AttainmentRadarMock {
  title: string
  subtitle: string
  scopeName: string
  updatedAt: string
  requirementResult: RequirementAttainmentResult
  courseObjectiveTitle: string
  primaryCourseObjectiveLabel: string
  comparisonCourseObjectiveLabel?: string
  primaryCourseObjectiveResult: CourseObjectiveAttainmentResult
  comparisonCourseObjectiveResult?: CourseObjectiveAttainmentResult
}

const requirementTitles = [
  "工程知识",
  "问题分析",
  "设计/开发",
  "研究",
  "现代工具",
  "沟通",
]

const createRequirementResult = (
  schemeId: number,
  values: number[],
): RequirementAttainmentResult => ({
  schemeId,
  items: values.map((attainmentVal, index) => ({
    requirementId: index + 1,
    requirementCode: `GR${index + 1}`,
    title: requirementTitles[index],
    attainmentVal,
    indicatorItems: [
      {
        indicatorPointId: (index + 1) * 10 + 1,
        code: `${index + 1}.1`,
        attainmentVal: Math.max(attainmentVal - 0.02, 0),
      },
      {
        indicatorPointId: (index + 1) * 10 + 2,
        code: `${index + 1}.2`,
        attainmentVal: Math.min(attainmentVal + 0.02, 1),
      },
    ],
  })),
})

const createCourseObjectiveResult = (
  teachingClassId: number,
  courseId: number,
  values: number[],
): CourseObjectiveAttainmentResult => ({
  teachingClassId,
  courseId,
  calculatedAt: "2026-01-01 10:00:00",
  items: values.map((attainmentVal, index) => ({
    courseObjectiveId: index + 1,
    objectiveCode: `CO${index + 1}`,
    attainmentVal,
    threshold: 0.68,
    passed: attainmentVal >= 0.68,
  })),
})

export const attainmentRadarMockMap: Partial<Record<RoleCode, AttainmentRadarMock>> = {
  DIRECTOR: {
    title: "专业宏观毕业要求达成画像",
    subtitle: "面向专业负责人的年级级毕业要求达成度汇总。",
    scopeName: "软件工程专业 / 2024 届",
    updatedAt: "2026-01-01 09:30",
    requirementResult: createRequirementResult(1, [0.75, 0.72, 0.78, 0.7, 0.82, 0.86]),
    courseObjectiveTitle: "专业核心课程 CO 达成度对比",
    primaryCourseObjectiveLabel: "专业均值",
    comparisonCourseObjectiveLabel: "底线参考",
    primaryCourseObjectiveResult: createCourseObjectiveResult(1001, 101, [0.82, 0.65, 0.78, 0.74]),
    comparisonCourseObjectiveResult: createCourseObjectiveResult(1001, 101, [0.68, 0.68, 0.68, 0.68]),
  },
  COORDINATOR: {
    title: "负责课程支撑毕业要求画像",
    subtitle: "汇总负责课程对毕业要求的支撑达成表现。",
    scopeName: "软件工程课程组 / 2025-2026-1",
    updatedAt: "2026-01-01 10:10",
    requirementResult: createRequirementResult(1, [0.78, 0.69, 0.81, 0.73, 0.8, 0.76]),
    courseObjectiveTitle: "负责课程 CO 达成度汇总",
    primaryCourseObjectiveLabel: "达成度计算值",
    comparisonCourseObjectiveLabel: "平行班均值",
    primaryCourseObjectiveResult: createCourseObjectiveResult(1002, 101, [0.84, 0.7, 0.79, 0.76]),
    comparisonCourseObjectiveResult: createCourseObjectiveResult(1003, 101, [0.8, 0.67, 0.75, 0.74]),
  },
  INSTRUCTOR: {
    title: "教学班毕业要求达成画像",
    subtitle: "面向授课教师查看本人教学班相关毕业要求达成情况。",
    scopeName: "SE-302 / 01 班",
    updatedAt: "2026-01-01 10:30",
    requirementResult: createRequirementResult(1, [0.8, 0.65, 0.77, 0.71, 0.76, 0.74]),
    courseObjectiveTitle: "教学班 CO 达成度汇总",
    primaryCourseObjectiveLabel: "达成度计算值",
    comparisonCourseObjectiveLabel: "课程均值",
    primaryCourseObjectiveResult: createCourseObjectiveResult(1004, 101, [0.82, 0.65, 0.78]),
    comparisonCourseObjectiveResult: createCourseObjectiveResult(1005, 101, [0.8, 0.7, 0.76]),
  },
  STUDENT: {
    title: "我的毕业要求达成雷达图",
    subtitle: "展示本人在各毕业要求维度上的达成情况。",
    scopeName: "刘同学 / 2024 级",
    updatedAt: "2026-01-01 11:00",
    requirementResult: createRequirementResult(1, [0.85, 0.76, 0.7, 0.72, 0.88, 0.86]),
    courseObjectiveTitle: "我的课程目标达成度对比",
    primaryCourseObjectiveLabel: "我的达成度",
    comparisonCourseObjectiveLabel: "班级均值",
    primaryCourseObjectiveResult: createCourseObjectiveResult(1006, 101, [0.85, 0.55]),
    comparisonCourseObjectiveResult: createCourseObjectiveResult(1006, 101, [0.82, 0.65]),
  },
}
