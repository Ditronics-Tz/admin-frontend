import { WorkQueue } from '../components/WorkQueue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useShipText } from '@/components/common/ship-text'
export default function SupportPage() {
  const t = useShipText()
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customer tickets and complaints.
        </p>
      </div>
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          {['tickets', 'complaints', 'reports'].map((kind) => (
            <TabsTrigger key={kind} value={kind}>
              {t(kind)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tickets">
          <WorkQueue kind="tickets" />
        </TabsContent>
        <TabsContent value="complaints">
          <WorkQueue kind="complaints" />
        </TabsContent>
        <TabsContent value="reports">
          <WorkQueue kind="reports" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
