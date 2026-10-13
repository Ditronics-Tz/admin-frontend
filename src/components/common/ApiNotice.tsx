import { API_CONFIG } from '@/lib/api/config'
import { useApiAccess } from '@/lib/api/access'
import { useShipText } from './ship-text'

export function ApiNotice() {
  const readOnly = useApiAccess((state) => state.readOnly),
    t = useShipText()
  return (
    <>
      {API_CONFIG.mockMode && (
        <aside role="status" className="border bg-amber-50 p-3 text-sm">
          <strong>{t('Development fixtures')}. </strong>
          {t('This view uses development fixtures. Server actions are unavailable.')}
        </aside>
      )}
      {readOnly && (
        <aside role="status" className="border bg-amber-50 p-3 text-sm">
          <strong>{t('Read-only access')}. </strong>
          {t('The server denied this action. Changes are disabled for this session.')}
        </aside>
      )}
    </>
  )
}
