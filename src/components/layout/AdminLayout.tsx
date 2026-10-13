import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNavDrawer } from './MobileNavDrawer'
import { SafetyMonitor } from '@/features/operations/safety.live'

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F7F8]">
      <SafetyMonitor />
      {/* Persistent Desktop Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Navigation */}
        <Topbar />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer />
    </div>
  )
}

export default AdminLayout
