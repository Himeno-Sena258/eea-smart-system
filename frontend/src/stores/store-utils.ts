export interface RequestState {
  loading: boolean
  error: string | null
}

export interface RequestActions {
  clearError: () => void
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "请求失败"
}

export const createInitialRequestState = (): RequestState => ({
  loading: false,
  error: null,
})

export async function runRequest<TState, TResult>(
  set: (partial: Partial<TState>) => void,
  request: () => Promise<TResult>,
  onSuccess?: (data: TResult) => Partial<TState>,
) {
  set({ loading: true, error: null } as unknown as Partial<TState>)

  try {
    const data = await request()
    set({
      ...(onSuccess?.(data) ?? {}),
      loading: false,
      error: null,
    } as unknown as Partial<TState>)
    return data
  } catch (error) {
    set({
      loading: false,
      error: getErrorMessage(error),
    } as unknown as Partial<TState>)
    throw error
  }
}
