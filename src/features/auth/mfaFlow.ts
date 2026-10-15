export interface PendingMfaChallenge {
  challengeToken: string
  expiresIn: number
  enrollmentRequired: boolean
  receivedAt: number
}

let pending: PendingMfaChallenge | null = null

export const mfaFlow = {
  save(challenge: Omit<PendingMfaChallenge, 'receivedAt'>) {
    pending = { ...challenge, receivedAt: Date.now() }
  },
  read() {
    if (!pending) return null
    if (Date.now() >= pending.receivedAt + pending.expiresIn * 1000) return pending
    return pending
  },
  clear() {
    pending = null
  },
  expired() {
    return !pending || Date.now() >= pending.receivedAt + pending.expiresIn * 1000
  },
}
