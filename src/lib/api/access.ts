import { create } from 'zustand'

export const useApiAccess = create<{ readOnly: boolean }>(() => ({ readOnly: false }))
