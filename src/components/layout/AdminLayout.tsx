import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNavDrawer } from './MobileNavDrawer'

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F7F8]">
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
