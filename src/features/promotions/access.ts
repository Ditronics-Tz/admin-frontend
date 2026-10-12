import { create } from 'zustand'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatApiError } from '@/lib/api/errors'

export const usePromotionAccess = create<{ deniedFor: string | null; deny: () => void }>(
  (set) => ({
    deniedFor: null,
    deny: () => set({ deniedFor: useAuthStore.getState().user?.id || null }),
  })
)
// A denial belongs to the current staff session, not a later sign-in or role change.
const unsubscribe = useAuthStore.subscribe((state, previous) => {
  if (
    state.user?.id !== previous.user?.id ||
    state.user?.role !== previous.user?.role ||
    state.user?.totpEnabled !== previous.user?.totpEnabled
  ) {
    usePromotionAccess.setState({ deniedFor: null })
  }
})
if (import.meta.hot) import.meta.hot.dispose(unsubscribe)
export function canWritePromotions(role?: string, denied = false) {
  return role === 'admin' && !denied
}
export function usePromoWriteAccess() {
  const user = useAuthStore((s) => s.user)
  const deniedFor = usePromotionAccess((s) => s.deniedFor)
  return canWritePromotions(user?.role, !!user && deniedFor === user.id)
}
export async function promoRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    return (await request).data
  } catch (error) {
    const detail = formatApiError(error)
    if (detail.status === 403) usePromotionAccess.getState().deny()
    throw detail
  }
}
