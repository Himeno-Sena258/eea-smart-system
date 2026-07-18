import { create } from "zustand"
import type { RoleCode } from "@/models"

interface UiStore {
  activeRole: RoleCode
  setActiveRole: (role: RoleCode) => void
}

export const useUiStore = create<UiStore>((set) => ({
  activeRole: "INSTRUCTOR",
  setActiveRole: (activeRole) => set({ activeRole }),
}))
