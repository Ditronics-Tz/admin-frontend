import React from 'react'
import { DevPlaceholderPage } from '@/components/layout/DevPlaceholderPage'

export const PaymentsPage: React.FC = () => {
  return (
    <DevPlaceholderPage
      moduleTitle="Payments & Financial Transactions"
      moduleDescription="Mobile money integrations (M-Pesa, Tigo Pesa, Airtel Money, Halopesa), commission settlements, driver payouts in TZS, and transaction logs."
      plannedPhase="Phase 7"
    />
  )
}
export default PaymentsPage
