import { request } from "./http"
import type {
  ID,
  PageQuery,
  PageResult,
  SubmitSurveyAnswerPayload,
  SurveyAnswer,
  SurveyPayload,
  SurveyQuestion,
  SurveyQuestionnaire,
  SurveyStatistics,
} from "@/models"

export const getSurveyPage = async (query?: PageQuery) => {
  const response = await request<PageResult<SurveyQuestionnaire>>({
    url: "/surveys",
    method: "GET",
    params: query,
  })
  return response.data
}

export const getSurveyDetail = async (id: ID) => {
  const response = await request<SurveyQuestionnaire>({
    url: `/surveys/${id}`,
    method: "GET",
  })
  return response.data
}

export const createSurvey = async (payload: SurveyPayload) => {
  const response = await request<SurveyQuestionnaire>({
    url: "/surveys",
    method: "POST",
    data: payload,
  })
  return response.data
}

export const updateSurvey = async (id: ID, payload: SurveyPayload) => {
  const response = await request<string>({
    url: `/surveys/${id}`,
    method: "PUT",
    data: payload,
  })
  return response.data
}

export const openSurvey = async (id: ID) => {
  const response = await request<string>({
    url: `/surveys/${id}/open`,
    method: "PUT",
  })
  return response.data
}

export const closeSurvey = async (id: ID) => {
  const response = await request<string>({
    url: `/surveys/${id}/close`,
    method: "PUT",
  })
  return response.data
}

export const deleteSurvey = async (id: ID) => {
  const response = await request<string>({
    url: `/surveys/${id}`,
    method: "DELETE",
  })
  return response.data
}

export const getSurveyQuestions = async (surveyId: ID) => {
  const response = await request<SurveyQuestion[]>({
    url: `/surveys/${surveyId}/questions`,
    method: "GET",
  })
  return response.data
}

export const saveSurveyQuestions = async (surveyId: ID, questions: SurveyQuestion[]) => {
  const response = await request<SurveyQuestion[]>({
    url: `/surveys/${surveyId}/questions`,
    method: "PUT",
    data: questions,
  })
  return response.data
}

export const submitSurveyAnswer = async (surveyId: ID, payload: SubmitSurveyAnswerPayload) => {
  const response = await request<string>({
    url: `/surveys/${surveyId}/answers`,
    method: "POST",
    data: payload,
  })
  return response.data
}

export const getSurveyAnswers = async (surveyId: ID) => {
  const response = await request<SurveyAnswer[]>({
    url: `/surveys/${surveyId}/answers`,
    method: "GET",
  })
  return response.data
}

export const getSurveyStatistics = async (surveyId: ID) => {
  const response = await request<SurveyStatistics>({
    url: `/surveys/${surveyId}/statistics`,
    method: "GET",
  })
  return response.data
}
