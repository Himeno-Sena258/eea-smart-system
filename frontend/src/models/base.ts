import type { DateTimeString, ID, Nullable, PageQuery } from "./common"

export type OrganizationType = "COLLEGE" | "MAJOR" | "CLASS" | string
export type ProgramSchemeStatus = 0 | 1 | 2
export type SupportLevel = "H" | "M" | "L" | string

export interface Organization {
  id: ID
  name: string
  parentId?: Nullable<ID>
  type: OrganizationType
  createdAt?: DateTimeString
  children?: Organization[]
}

export interface OrganizationPayload {
  name: string
  parentId?: Nullable<ID>
  type: OrganizationType
}

export interface ClassInfo {
  id: ID
  className: string
  majorId: ID
  majorName?: string
  grade: number
}

export interface ClassInfoPayload {
  className: string
  majorId: ID
  grade: number
}

export interface Major {
  id: ID
  name: string
  collegeId: ID
  collegeName?: string
  schoolSystem?: string
  degree?: string
  createdAt?: DateTimeString
}

export interface MajorPayload {
  name: string
  collegeId: ID
  schoolSystem?: string
  degree?: string
}

export interface ProgramScheme {
  id: ID
  majorId: ID
  majorName?: string
  versionName: string
  grade?: number
  status: ProgramSchemeStatus
  createdBy?: ID
  createdAt?: DateTimeString
}

export interface ProgramSchemePayload {
  majorId: ID
  versionName: string
  grade?: number
  status?: ProgramSchemeStatus
}

export interface EducationGoal {
  id: ID
  schemeId: ID
  code: string
  content: string
  sortOrder?: number
  createdAt?: DateTimeString
}

export interface EducationGoalPayload {
  code: string
  content: string
  sortOrder?: number
}

export interface GradRequirement {
  id: ID
  schemeId: ID
  code: string
  title: string
  content: string
}

export interface GradRequirementPayload {
  code: string
  title: string
  content: string
}

export interface GradIndicatorPoint {
  id: ID
  reqId: ID
  requirementId?: ID
  code: string
  content: string
}

export interface GradIndicatorPointPayload {
  code: string
  content: string
}

export interface IndicatorTreeItem extends GradRequirement {
  indicators: GradIndicatorPoint[]
}

export interface GoalRequirementMatrixItem {
  educationGoalId: ID
  requirementId: ID
  supportLevel: SupportLevel
}

export interface SaveGoalRequirementMatrixPayload {
  items: GoalRequirementMatrixItem[]
}

export interface BaseDataQuery extends PageQuery {
  majorId?: ID
  schemeId?: ID
  status?: number
}
