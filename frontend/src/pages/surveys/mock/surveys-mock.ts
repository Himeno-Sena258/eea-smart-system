import type { SurveyQuestion, SurveyQuestionnaire, SurveyStatistics } from "@/models"

export interface SurveyMock {
  questionnaire: SurveyQuestionnaire
  deadline: string
  target: string
  answeredCount: number
  totalCount: number
  questions: SurveyQuestion[]
  statistics: SurveyStatistics
}

export const surveyMocks: SurveyMock[] = [
  {
    questionnaire: {
      id: 1,
      title: "2024届毕业生达成度自评问卷",
      type: "GRADUATE",
      status: 1,
      createdAt: "2026-01-01 09:00:00",
    },
    deadline: "2026-01-20",
    target: "2024届毕业生",
    answeredCount: 170,
    totalCount: 200,
    questions: [
      { questionCode: "Q1", title: "工程知识达成自评", score: 5 },
      { questionCode: "Q2", title: "问题分析能力自评", score: 4 },
      { questionCode: "Q3", title: "对课程体系的建议", text: "" },
    ],
    statistics: {
      surveyId: 1,
      totalAnswers: 170,
      items: [
        { questionCode: "Q1", averageScore: 4.42, distribution: { "5": 96, "4": 54, "3": 17, "2": 3 } },
        { questionCode: "Q2", averageScore: 4.18, distribution: { "5": 78, "4": 63, "3": 24, "2": 5 } },
        { questionCode: "Q3", texts: ["希望增加工程案例实践。", "建议加强团队项目过程指导。"] },
      ],
    },
  },
  {
    questionnaire: {
      id: 2,
      title: "在校生课程体系满意度调查",
      type: "COURSE",
      status: 1,
      createdAt: "2026-01-03 10:30:00",
    },
    deadline: "本周五",
    target: "软件工程2024级",
    answeredCount: 82,
    totalCount: 126,
    questions: [
      { questionCode: "Q1", title: "课程安排是否支撑能力递进", score: 4 },
      { questionCode: "Q2", title: "实验项目是否有助于理解课程目标", score: 5 },
      { questionCode: "Q3", title: "你希望增加哪些教学支持", text: "" },
    ],
    statistics: {
      surveyId: 2,
      totalAnswers: 82,
      items: [
        { questionCode: "Q1", averageScore: 4.05, distribution: { "5": 32, "4": 33, "3": 14, "2": 3 } },
        { questionCode: "Q2", averageScore: 4.36, distribution: { "5": 45, "4": 25, "3": 10, "2": 2 } },
        { questionCode: "Q3", texts: ["希望提供更多样例项目。"] },
      ],
    },
  },
  {
    questionnaire: {
      id: 3,
      title: "用人单位毕业要求评价问卷",
      type: "EMPLOYER",
      status: 0,
      createdAt: "2026-01-05 15:00:00",
    },
    deadline: "未开放",
    target: "合作企业导师",
    answeredCount: 0,
    totalCount: 35,
    questions: [
      { questionCode: "Q1", title: "毕业生工程实践能力评价", score: 0 },
      { questionCode: "Q2", title: "毕业生沟通协作能力评价", score: 0 },
    ],
    statistics: {
      surveyId: 3,
      totalAnswers: 0,
      items: [],
    },
  },
]
