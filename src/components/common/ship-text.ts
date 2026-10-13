import { useUiStore } from '@/stores/useUiStore'

const sw: Record<string, string> = {
  'User directory': 'Orodha ya watumiaji',
  Name: 'Jina',
  Email: 'Barua pepe',
  Phone: 'Simu',
  'Security audit trail': 'Historia ya ukaguzi wa usalama',
  'Time (EAT)': 'Muda (EAT)',
  'Action / target': 'Kitendo / lengwa',
  Details: 'Maelezo',
  Search: 'Tafuta',
  All: 'Zote',
  Status: 'Hali',
  Role: 'Jukumu',
  Action: 'Kitendo',
  Actor: 'Mtendaji',
  From: 'Kuanzia',
  To: 'Mpaka',
  'No records found': 'Hakuna rekodi',
  Reveal: 'Onyesha',
  Hide: 'Ficha',
  'Reveal unavailable': 'Kuonyesha hakupatikani',
  'Read-only access': 'Ruhusa ya kusoma tu',
  'The server denied this action. Changes are disabled for this session.':
    'Seva imekataa kitendo hiki. Mabadiliko yamezuiwa kwa kipindi hiki.',
  'Required reason': 'Sababu inahitajika',
  'Review and confirm this action.': 'Kagua na uthibitishe kitendo hiki.',
  'System status': 'Hali ya mfumo',
  Refresh: 'Sasisha',
  Database: 'Hifadhidata',
  Version: 'Toleo',
  Uptime: 'Muda wa kufanya kazi',
  'Development fixtures': 'Rekodi za majaribio',
  'This view uses development fixtures. Server actions are unavailable.':
    'Mwonekano huu unatumia rekodi za majaribio. Vitendo vya seva havipatikani.',
  'Phone not collected': 'Namba ya simu haijakusanywa',
  Cancel: 'Ghairi',
  Confirm: 'Thibitisha',
}
export function useShipText() {
  const locale = useUiStore((state) => state.locale)
  return (text: string) => (locale === 'sw' ? sw[text] || text : text)
}
