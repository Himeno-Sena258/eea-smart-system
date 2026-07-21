import { create } from "zustand"
import type {
  ID,
  PageQuery,
  PageResult,
  SubmitSurveyAnswerPayload,
  SurveyAnswer,
  SurveyPayload,
  SurveyQuestionnaire,
  SurveyStatistics,
} from "@/models"
import {
  closeSurvey,
  createSurvey,
  deleteSurvey,
  getSurveyAnswers,
  getSurveyDetail,
  getSurveyPage,
  getSurveyStatistics,
  openSurvey,
  submitSurveyAnswer,
  updateSurvey,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface SurveyStore extends RequestState, RequestActions {
  surveysPage: PageResult<SurveyQuestionnaire> | null
  currentSurvey: SurveyQuestionnaire | null
  answers: SurveyAnswer[]
  statistics: SurveyStatistics | null
  fetchSurveys: (query?: PageQuery) => Promise<PageResult<SurveyQuestionnaire>>
  fetchSurveyDetail: (id: ID) => Promise<SurveyQuestionnaire>
  createSurvey: (payload: SurveyPayload) => Promise<SurveyQuestionnaire>
  updateSurvey: (id: ID, payload: SurveyPayload) => Promise<string>
  openSurvey: (id: ID) => Promise<string>
  closeSurvey: (id: ID) => Promise<string>
  deleteSurvey: (id: ID) => Promise<string>
  submitAnswer: (surveyId: ID, payload: SubmitSurveyAnswerPayload) => Promise<string>
  fetchAnswers: (surveyId: ID) => Promise<SurveyAnswer[]>
  fetchStatistics: (surveyId: ID) => Promise<SurveyStatistics>
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  ...createInitialRequestState(),
  surveysPage: null,
  currentSurvey: null,
  answers: [],
  statistics: null,
  clearError: () => set({ error: null }),
  fetchSurveys: (query) => runRequest(set, () => getSurveyPage(query), (surveysPage) => ({ surveysPage })),
  fetchSurveyDetail: (id) => runRequest(set, () => getSurveyDetail(id), (currentSurvey) => ({ currentSurvey })),
  createSurvey: (payload) => runRequest(set, () => createSurvey(payload), (currentSurvey) => ({ currentSurvey })),
  updateSurvey: (id, payload) => runRequest(set, () => updateSurvey(id, payload)),
  openSurvey: (id) => runRequest(set, () => openSurvey(id)),
  closeSurvey: (id) => runRequest(set, () => closeSurvey(id)),
  deleteSurvey: (id) => runRequest(set, () => deleteSurvey(id), () => ({ currentSurvey: get().currentSurvey?.id === id ? null : get().currentSurvey })),
  submitAnswer: (surveyId, payload) => runRequest(set, () => submitSurveyAnswer(surveyId, payload)),
  fetchAnswers: (surveyId) => runRequest(set, () => getSurveyAnswers(surveyId), (answers) => ({ answers })),
  fetchStatistics: (surveyId) => runRequest(set, () => getSurveyStatistics(surveyId), (statistics) => ({ statistics })),
}))
