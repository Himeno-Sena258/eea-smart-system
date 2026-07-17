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
  getSurveyAnswerPage,
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
  answersPage: PageResult<SurveyAnswer> | null
  statistics: SurveyStatistics | null
  fetchSurveys: (query?: PageQuery) => Promise<PageResult<SurveyQuestionnaire>>
  fetchSurveyDetail: (id: ID) => Promise<SurveyQuestionnaire>
  createSurvey: (payload: SurveyPayload) => Promise<SurveyQuestionnaire>
  updateSurvey: (id: ID, payload: SurveyPayload) => Promise<SurveyQuestionnaire>
  openSurvey: (id: ID) => Promise<SurveyQuestionnaire>
  closeSurvey: (id: ID) => Promise<SurveyQuestionnaire>
  deleteSurvey: (id: ID) => Promise<boolean>
  submitAnswer: (surveyId: ID, payload: SubmitSurveyAnswerPayload) => Promise<SurveyAnswer>
  fetchAnswers: (surveyId: ID, query?: PageQuery) => Promise<PageResult<SurveyAnswer>>
  fetchStatistics: (surveyId: ID) => Promise<SurveyStatistics>
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  ...createInitialRequestState(),
  surveysPage: null,
  currentSurvey: null,
  answersPage: null,
  statistics: null,
  clearError: () => set({ error: null }),
  fetchSurveys: (query) => runRequest(set, () => getSurveyPage(query), (surveysPage) => ({ surveysPage })),
  fetchSurveyDetail: (id) => runRequest(set, () => getSurveyDetail(id), (currentSurvey) => ({ currentSurvey })),
  createSurvey: (payload) => runRequest(set, () => createSurvey(payload), (currentSurvey) => ({ currentSurvey })),
  updateSurvey: (id, payload) => runRequest(set, () => updateSurvey(id, payload), (currentSurvey) => ({ currentSurvey })),
  openSurvey: (id) => runRequest(set, () => openSurvey(id), (currentSurvey) => ({ currentSurvey })),
  closeSurvey: (id) => runRequest(set, () => closeSurvey(id), (currentSurvey) => ({ currentSurvey })),
  deleteSurvey: (id) => runRequest(set, () => deleteSurvey(id), () => ({ currentSurvey: get().currentSurvey?.id === id ? null : get().currentSurvey })),
  submitAnswer: (surveyId, payload) => runRequest(set, () => submitSurveyAnswer(surveyId, payload)),
  fetchAnswers: (surveyId, query) => runRequest(set, () => getSurveyAnswerPage(surveyId, query), (answersPage) => ({ answersPage })),
  fetchStatistics: (surveyId) => runRequest(set, () => getSurveyStatistics(surveyId), (statistics) => ({ statistics })),
}))
