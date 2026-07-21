import type { DateTimeString, ID, JsonValue } from "./common"

export type SurveyType = "COURSE" | "GRADUATE" | "EMPLOYER" | string
export type SurveyStatus = 0 | 1 | 2

export interface SurveyQuestionnaire {
  id: ID
  title: string
  type: SurveyType
  status: SurveyStatus
  createdAt: DateTimeString
}

export interface SurveyQuestion {
  id?: ID
  questionnaireId?: ID
  questionCode: string
  title: string
  questionType: string
  options?: JsonValue | string
  sortOrder?: number
  score?: number
  text?: string
  [key: string]: JsonValue | undefined
}

export interface SurveyPayload {
  title: string
  type: SurveyType
  status?: SurveyStatus
  questions?: SurveyQuestion[]
}

export interface SurveyAnswerItem {
  questionCode: string
  score?: number
  text?: string
}

export type SubmitSurveyAnswerPayload = Record<string, JsonValue>

export interface SurveyAnswer {
  id: ID
  questionnaireId: ID
  userId: ID
  rawAnswersJson: string
  submittedAt: DateTimeString
}

export interface MySurveyAnswer {
  id: ID
  questionnaireId: ID
  submittedAt: DateTimeString
}

export interface SurveyStatistics {
  questionnaireId: ID
  title: string
  totalAnswers: number
  answers: SurveyAnswer[]
}
