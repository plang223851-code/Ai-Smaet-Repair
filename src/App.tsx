import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { NewRepairView } from './components/NewRepairView';
import { TrackStatusView } from './components/TrackStatusView';
import { TechnicianView } from './components/TechnicianView';
import { ChatView } from './components/ChatView';
import { ChatModal } from './components/ChatModal';
import { EquipmentHealthView } from './components/EquipmentHealthView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { MonthlyExpenseView } from './components/MonthlyExpenseView';
import { EquipmentManageView } from './components/EquipmentManageView';
import { UserManageView } from './components/UserManageView';
import { TicketListView } from './components/TicketListView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { LineNotifyModal } from './components/LineNotifyModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { InstallationGuideModal } from './components/InstallationGuideModal';
import { LiveNotificationToast } from './components/LiveNotificationToast';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedTicketId,
    newTicketAlert,
    dismissNewTicketAlert
  } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (activeView === 'login') {
    return <LoginView />;
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'new_repair':
        return <NewRepairView />;
      case 'my_repairs':
        return (
          <TicketListView
            title="งานแจ้งซ่อมของฉัน (My Tickets)"
            subtitle="รายการงานซ่อมที่คุณได้แจ้งไว้ในระบบ"
            filterMode="my_created"
          />
        );
      case 'track_status':
        return <TrackStatusView />;
      case 'repair_history':
        return (
          <TicketListView
            title="ประวัติการซ่อม (Repair History)"
            subtitle="รายการงานซ่อมที่เสร็จสิ้นสมบูรณ์และปิดงานแล้ว"
            filterMode="history"
          />
        );
      case 'my_equipment':
        return <EquipmentManageView />;
      case 'tech_jobs':
        return <TechnicianView />;
      case 'unassigned_jobs':
        return (
          <TicketListView
            title="งานแจ้งซ่อมใหม่รอช่างรับเรื่อง (New & Unassigned Jobs)"
            subtitle="รายการงานซ่อมที่ผู้ใช้เพิ่งส่งเข้ามาและยังไม่มีช่างรับผิดชอบ สามารถกดรับงานได้ทันที"
            filterMode="unassigned"
          />
        );
      case 'my_assigned':
        return (
          <TicketListView
            title="งานที่ได้รับมอบหมาย (Assigned Jobs)"
            subtitle="รายการงานซ่อมที่คุณเป็นผู้รับผิดชอบดำเนินการ"
            filterMode="assigned_to_me"
          />
        );
      case 'all_repairs':
        return (
          <TicketListView
            title="จัดการงานแจ้งซ่อมทั้งหมด (All Repairs)"
            subtitle="ภาพรวมงานแจ้งซ่อมทั้งหมดของทุกแผนกในระบบ"
            filterMode="all"
          />
        );
      case 'chat':
        return <ChatView />;
      case 'equipment_health':
        return <EquipmentHealthView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'monthly_expenses':
        return <MonthlyExpenseView />;
      case 'equipment_manage':
        return <EquipmentManageView />;
      case 'user_manage':
        return <UserManageView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 transition-all duration-200">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-16">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ChatModal />
      <LineNotifyModal />
      <DatabaseSchemaModal />
      <InstallationGuideModal />

      {/* Floating Real-time Notification Toasts */}
      <LiveNotificationToast />

      {/* Real-time New Ticket Alert Toast for Technician / Admin */}
      {newTicketAlert && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/50 flex flex-col gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                มีงานแจ้งซ่อมใหม่เข้ามา!
              </span>
            </div>
            <button
              onClick={dismissNewTicketAlert}
              className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {newTicketAlert.ticketNumber}: {newTicketAlert.equipmentName}
            </p>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {newTicketAlert.location} ({newTicketAlert.room}) • {newTicketAlert.symptom}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                setSelectedTicketId(newTicketAlert.id);
                setActiveView('track_status');
                dismissNewTicketAlert();
              }}
              className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
            >
              เปิดดูงานทันที
            </button>
            <button
              onClick={dismissNewTicketAlert}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs rounded-xl transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
