import type { RequirementAttainmentResult, RoleCode } from "@/models"

export interface AttainmentRadarMock {
  title: string
  subtitle: string
  scopeName: string
  updatedAt: string
  requirementResult: RequirementAttainmentResult
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

export const attainmentRadarMockMap: Partial<Record<RoleCode, AttainmentRadarMock>> = {
  DIRECTOR: {
    title: "专业宏观毕业要求达成画像",
    subtitle: "面向专业负责人的年级级毕业要求达成度汇总。",
    scopeName: "软件工程专业 / 2024 届",
    updatedAt: "2026-01-01 09:30",
    requirementResult: createRequirementResult(1, [0.75, 0.72, 0.78, 0.7, 0.82, 0.86]),
  },
  COORDINATOR: {
    title: "负责课程支撑毕业要求画像",
    subtitle: "汇总负责课程对毕业要求的支撑达成表现。",
    scopeName: "软件工程课程组 / 2025-2026-1",
    updatedAt: "2026-01-01 10:10",
    requirementResult: createRequirementResult(1, [0.78, 0.69, 0.81, 0.73, 0.8, 0.76]),
  },
  INSTRUCTOR: {
    title: "教学班毕业要求达成画像",
    subtitle: "面向授课教师查看本人教学班相关毕业要求达成情况。",
    scopeName: "SE-302 / 01 班",
    updatedAt: "2026-01-01 10:30",
    requirementResult: createRequirementResult(1, [0.8, 0.65, 0.77, 0.71, 0.76, 0.74]),
  },
  STUDENT: {
    title: "我的毕业要求达成雷达图",
    subtitle: "展示本人在各毕业要求维度上的达成情况。",
    scopeName: "刘同学 / 2024 级",
    updatedAt: "2026-01-01 11:00",
    requirementResult: createRequirementResult(1, [0.85, 0.76, 0.7, 0.72, 0.88, 0.86]),
  },
}
