import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { SecuritySettings } from '../components/SecuritySettings'
import { StaffManagement } from '../components/StaffManagement'
import { AuditLogPanel } from '../components/AuditLogPanel'

export default function SettingsPage() {
  const { isAdmin } = usePermission()
  const [params, setParams] = useSearchParams()
  const selected = params.get('tab') || 'security'
  const tab = ['security', 'staff', 'audit'].includes(selected) ? selected : 'security'
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account security, staff access, and administrative activity.
        </p>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => setParams({ tab: value })}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="security">My security</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="staff">Staff accounts</TabsTrigger>
              <TabsTrigger value="audit">Audit trail</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="staff">
          {isAdmin ? <StaffManagement /> : <p>Administrator access required.</p>}
        </TabsContent>
        <TabsContent value="audit">
          {isAdmin ? <AuditLogPanel /> : <p>Administrator access required.</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
