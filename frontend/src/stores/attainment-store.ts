import { create } from "zustand"
import type {
  ContinuousImprovement,
  ContinuousImprovementPayload,
  DirectorAttainment,
  DirectorProgramScheme,
  ID,
  OverviewStats,
  StudentAttainment,
  TeacherCoAttainment,
  WarningStudentResult,
} from "@/models"
import {
  calculateDirectorAttainment,
  calculateTeacherCoAttainment,
  createImprovement,
  deleteImprovement,
  generateImprovement,
  getDirectorAttainmentList,
  getDirectorProgramSchemeList,
  getImprovementList,
  getOverviewStats,
  getStudentAttainmentList,
  getTeacherCoAttainmentList,
  getWarningStudents,
  scanWarningStudents,
  updateImprovement,
} from "@/services"
import { createInitialRequestState, type RequestActions, type RequestState, runRequest } from "./store-utils"

interface AttainmentStore extends RequestState, RequestActions {
  directorSchemes: DirectorProgramScheme[]
  directorAttainments: DirectorAttainment[]
  teacherCoAttainments: TeacherCoAttainment[]
  studentAttainments: StudentAttainment[]
  overviewStats: OverviewStats | null
  warningStudents: WarningStudentResult | null
  improvements: ContinuousImprovement[]
  fetchDirectorSchemes: () => Promise<DirectorProgramScheme[]>
  fetchDirectorAttainments: (schemeId: ID, grade?: number) => Promise<DirectorAttainment[]>
  calculateDirectorAttainments: (schemeId: ID, grade?: number) => Promise<DirectorAttainment[]>
  fetchTeacherCoAttainments: (classId: ID) => Promise<TeacherCoAttainment[]>
  calculateTeacherCoAttainments: (classId: ID) => Promise<TeacherCoAttainment[]>
  fetchStudentAttainments: () => Promise<StudentAttainment[]>
  fetchOverviewStats: (query?: { schemeId?: ID; courseId?: ID; semester?: string }) => Promise<OverviewStats>
  scanWarnings: (teachingClassId: ID) => Promise<WarningStudentResult>
  fetchWarnings: (teachingClassId: ID) => Promise<WarningStudentResult>
  fetchImprovements: (teachingClassId: ID) => Promise<ContinuousImprovement[]>
  createImprovement: (teachingClassId: ID, payload: ContinuousImprovementPayload) => Promise<ContinuousImprovement>
  updateImprovement: (id: ID, payload: ContinuousImprovementPayload) => Promise<ContinuousImprovement>
  deleteImprovement: (id: ID) => Promise<boolean>
  generateImprovement: (teachingClassId: ID) => Promise<ContinuousImprovement>
}

export const useAttainmentStore = create<AttainmentStore>((set, get) => ({
  ...createInitialRequestState(),
  directorSchemes: [],
  directorAttainments: [],
  teacherCoAttainments: [],
  studentAttainments: [],
  overviewStats: null,
  warningStudents: null,
  improvements: [],
  clearError: () => set({ error: null }),
  fetchDirectorSchemes: () => runRequest(set, getDirectorProgramSchemeList, (directorSchemes) => ({ directorSchemes })),
  fetchDirectorAttainments: (schemeId, grade) => runRequest(
    set,
    () => getDirectorAttainmentList(schemeId, grade),
    (directorAttainments) => ({ directorAttainments }),
  ),
  calculateDirectorAttainments: (schemeId, grade) => runRequest(
    set,
    () => calculateDirectorAttainment(schemeId, grade),
    (directorAttainments) => ({ directorAttainments }),
  ),
  fetchTeacherCoAttainments: (classId) => runRequest(
    set,
    () => getTeacherCoAttainmentList(classId),
    (teacherCoAttainments) => ({ teacherCoAttainments }),
  ),
  calculateTeacherCoAttainments: (classId) => runRequest(
    set,
    () => calculateTeacherCoAttainment(classId),
    (teacherCoAttainments) => ({ teacherCoAttainments }),
  ),
  fetchStudentAttainments: () => runRequest(set, getStudentAttainmentList, (studentAttainments) => ({ studentAttainments })),
  fetchOverviewStats: (query) => runRequest(set, () => getOverviewStats(query), (overviewStats) => ({ overviewStats })),
  scanWarnings: (teachingClassId) => runRequest(set, () => scanWarningStudents(teachingClassId), (warningStudents) => ({ warningStudents })),
  fetchWarnings: (teachingClassId) => runRequest(set, () => getWarningStudents(teachingClassId), (warningStudents) => ({ warningStudents })),
  fetchImprovements: (teachingClassId) => runRequest(set, () => getImprovementList(teachingClassId), (improvements) => ({ improvements })),
  createImprovement: (teachingClassId, payload) => runRequest(
    set,
    () => createImprovement(teachingClassId, payload),
    (improvement) => ({ improvements: [...get().improvements, improvement] }),
  ),
  updateImprovement: (id, payload) => runRequest(
    set,
    () => updateImprovement(id, payload),
    (improvement) => ({ improvements: get().improvements.map((item) => (item.id === id ? improvement : item)) }),
  ),
  deleteImprovement: (id) => runRequest(
    set,
    () => deleteImprovement(id),
    () => ({ improvements: get().improvements.filter((item) => item.id !== id) }),
  ),
  generateImprovement: (teachingClassId) => runRequest(
    set,
    () => generateImprovement(teachingClassId),
    (improvement) => ({ improvements: [...get().improvements, improvement] }),
  ),
}))
