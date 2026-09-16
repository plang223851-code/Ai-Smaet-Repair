import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  History,
  Laptop,
  MessageSquare,
  Bell,
  User,
  Wrench,
  BarChart3,
  Users,
  Activity,
  ListTodo,
  AlertCircle,
  Lock,
  LogOut,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    currentRole,
    currentUser,
    activeView,
    setActiveView,
    repairs,
    notifications,
    messages
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = messages.filter((m) => !m.isRead).length;
  const unassignedRepairsCount = repairs.filter(
    (r) => !r.technicianId || ['reported', 'pending'].includes(r.status)
  ).length;
  const myAssignedCount = repairs.filter((r) => r.technicianId === currentUser.id).length;

  // Menu items for User (ผู้แจ้งซ่อม)
  const userMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'new_repair', label: 'แจ้งซ่อมทันที', icon: PlusCircle, highlight: true },
    { id: 'my_repairs', label: 'งานที่แจ้งไว้ (ของฉัน)', icon: ListTodo },
    { id: 'track_status', label: 'ติดตามสถานะงาน', icon: Clock },
    { id: 'repair_history', label: 'ประวัติการซ่อม', icon: History },
    { id: 'my_equipment', label: 'อุปกรณ์ในระบบ', icon: Laptop },
    { id: 'chat', label: 'แชตคุยกับช่าง', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { id: 'profile', label: 'ข้อมูลผู้แจ้ง', icon: User }
  ];

  // Menu items for Technician (ช่างซ่อม)
  const techMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'แดชบอร์ดช่าง', icon: LayoutDashboard },
    {
      id: 'unassigned_jobs',
      label: 'งานใหม่รอรับเรื่อง',
      icon: AlertCircle,
      badge: unassignedRepairsCount > 0 ? unassignedRepairsCount : undefined,
      highlight: unassignedRepairsCount > 0
    },
    {
      id: 'my_assigned',
      label: 'งานที่รับผิดชอบ',
      icon: Wrench,
      badge: myAssignedCount > 0 ? myAssignedCount : undefined
    },
    { id: 'tech_jobs', label: 'จัดการงานซ่อม (ช่าง)', icon: ListTodo },
    { id: 'monthly_expenses', label: 'สรุปค่าใช้จ่ายรายเดือน', icon: Receipt, highlight: true },
    { id: 'chat', label: 'แชตกับผู้แจ้ง', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: 'equipment_health', label: 'สุขภาพอุปกรณ์', icon: Activity },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { id: 'profile', label: 'โปรไฟล์', icon: User }
  ];

  // Menu items for Admin (ผู้ดูแลระบบ)
  const adminMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard },
    { id: 'analytics', label: 'วิเคราะห์ปัญหา (กราฟ)', icon: BarChart3 },
    { id: 'monthly_expenses', label: 'สรุปค่าใช้จ่ายรายเดือน', icon: Receipt, highlight: true },
    { id: 'all_repairs', label: 'จัดการงานแจ้งซ่อม', icon: ListTodo },
    { id: 'equipment_manage', label: 'จัดการอุปกรณ์', icon: Laptop },
    { id: 'user_manage', label: 'จัดการผู้ใช้งาน', icon: Users },
    { id: 'chat', label: 'แชตระบบ', icon: MessageSquare },
    { id: 'equipment_health', label: 'ประวัติสุขภาพอุปกรณ์', icon: Activity }
  ];

  const currentMenu =
    currentRole === 'technician'
      ? techMenuItems
      : currentRole === 'admin'
      ? adminMenuItems
      : userMenuItems;

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role identifier badge in sidebar */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            มุมมองปัจจุบัน (Active Role)
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentRole === 'admin'
                  ? 'bg-indigo-400'
                  : currentRole === 'technician'
                  ? 'bg-emerald-400'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                {currentRole === 'admin'
                  ? 'ผู้ดูแลระบบ (Admin)'
                  : currentRole === 'technician'
                  ? 'ช่างซ่อมคอมพิวเตอร์'
                  : 'ผู้แจ้งซ่อมทั่วไป'}
              </span>
              {currentRole === 'user' && (
                <span className="text-[10px] text-emerald-400 block font-normal">
                  ไม่ต้องเข้าสู่ระบบ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : item.highlight
                    ? 'bg-slate-800/70 text-blue-400 hover:bg-slate-800 hover:text-blue-300'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Staff Login / Account Switcher Footer */}
        {currentRole === 'user' ? (
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <button
              id="sidebar-btn-staff-login"
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>เข้าสู่ระบบเจ้าหน้าที่ (ช่าง / แอดมิน)</span>
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentRole === 'technician' ? 'ช่างเทคนิคคอมพิวเตอร์' : 'ผู้ดูแลระบบ IT'}
                </p>
              </div>
            </div>
            <button
              id="sidebar-btn-logout-switch"
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>สลับบัญชี / หน้าล็อกอิน</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
