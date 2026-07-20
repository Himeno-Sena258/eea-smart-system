import type { ContinuousImprovement } from "@/models"

export type ImprovementStatus = "DRAFT" | "SUBMITTED" | "REVIEWED"

export interface ImprovementRecord extends ContinuousImprovement {
  courseName: string
  className: string
  teacherName: string
  objectiveCode: string
  attainmentVal: number
  threshold: number
  status: ImprovementStatus
  reviewerComment?: string
}

export const improvementRecordsMock: ImprovementRecord[] = [
  {
    id: 1,
    teachingClassId: 1001,
    courseName: "软件工程",
    className: "软件工程 01 班",
    teacherName: "张老师",
    objectiveCode: "CO2",
    attainmentVal: 0.65,
    threshold: 0.68,
    problemAnalysis: "部分学生在 UML 时序图设计环节表达能力欠佳，需求模型到设计模型的转换不够稳定。",
    improvementMeasures: "增加 2 学时案例协同实操演练，并在实验项目中加入阶段性模型评审。",
    createdBy: 201,
    createdAt: "2026-01-01 11:00:00",
    status: "SUBMITTED",
    reviewerComment: "建议补充对低分样本的分项分析。",
  },
  {
    id: 2,
    teachingClassId: 1002,
    courseName: "软件工程",
    className: "软件工程 02 班",
    teacherName: "陈老师",
    objectiveCode: "CO2",
    attainmentVal: 0.67,
    threshold: 0.68,
    problemAnalysis: "学生需求分析题目中边界条件识别不足，导致后续设计说明不完整。",
    improvementMeasures: "在作业反馈中增加需求边界识别清单，并安排一次课堂讲评。",
    createdBy: 202,
    createdAt: "2026-01-02 09:30:00",
    status: "DRAFT",
  },
  {
    id: 3,
    teachingClassId: 1003,
    courseName: "数据结构",
    className: "数据结构 03 班",
    teacherName: "王老师",
    objectiveCode: "CO1",
    attainmentVal: 0.72,
    threshold: 0.68,
    problemAnalysis: "树和图相关题目区分度较高，少数学生算法复杂度分析不熟练。",
    improvementMeasures: "下轮增加复杂度分析专题训练，并补充可视化演示材料。",
    createdBy: 203,
    createdAt: "2026-01-03 14:20:00",
    status: "REVIEWED",
    reviewerComment: "措施可落地，建议下轮对比同类题得分。",
  },
]

export const statusMetaMap: Record<ImprovementStatus, { label: string; className: string }> = {
  DRAFT: { label: "草稿", className: "bg-amber-100 text-amber-700" },
  SUBMITTED: { label: "已提交", className: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "已审阅", className: "bg-emerald-100 text-emerald-700" },
}
