import { apiClient } from '@/lib/api/client'
import type { BackendVerificationDetail } from '@/lib/api/types'

const base = (id: string) => `/admin/drivers/${id}`
export const verificationService = {
  async get(id: string) {
    return (await apiClient.get<BackendVerificationDetail>(`${base(id)}/verification`))
      .data
  },
  async claim(id: string) {
    return (
      await apiClient.post<BackendVerificationDetail>(`/admin/verifications/${id}/claim`)
    ).data
  },
  async release(id: string) {
    return (
      await apiClient.post<BackendVerificationDetail>(`${base(id)}/verification/release`)
    ).data
  },
  async review(
    _id: string,
    documentId: string,
    decision: 'approved' | 'rejected',
    reasonCode: string,
    note: string
  ) {
    return (
      await apiClient.patch<BackendVerificationDetail>(
        `/admin/documents/${documentId}/review`,
        { decision, reason_code: reasonCode, note }
      )
    ).data
  },
  async approve(id: string) {
    return (await apiClient.post<BackendVerificationDetail>(`${base(id)}/approve`)).data
  },
  async suspend(id: string, suspended: boolean, note: string) {
    return (
      await apiClient.patch<BackendVerificationDetail>(`${base(id)}/suspension`, {
        suspended,
        note,
      })
    ).data
  },
}
