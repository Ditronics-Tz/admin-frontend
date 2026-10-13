import { RatingsPanel } from './RatingsPanel'
import { useShipText } from '@/components/common/ship-text'

export default function RatingsPage() {
  const t = useShipText()
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">{t('Ratings')}</h1>
      <RatingsPanel />
    </main>
  )
}
