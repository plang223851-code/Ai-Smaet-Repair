import React from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  Radio,
  Volume2,
  VolumeX,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedTicketId,
    setActiveView,
    sseStatus,
    isSoundEnabled,
    toggleSoundEnabled,
    browserPermission,
    requestBrowserPermission,
    triggerTestNotification
  } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Settings Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">การแจ้งเตือนเรียลไทม์</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                sseStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {sseStatus === 'connected' ? 'เชื่อมต่อเรียลไทม์สด (SSE)' : 'กำลังเชื่อมต่อ...'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">รับการแจ้งเตือนงานซ่อมและแชตทันทีโดยไม่ต้องรีเฟรชหน้าจอ</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSoundEnabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isSoundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title="เปิด/ปิดเสียงแจ้งเตือน (Chime sound)"
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isSoundEnabled ? 'เสียงแจ้งเตือน: เปิด' : 'เสียงแจ้งเตือน: ปิด'}</span>
          </button>

          {/* Test Live Notification Button */}
          <button
            type="button"
            onClick={triggerTestNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ทดสอบแจ้งเตือนสด</span>
          </button>

          {/* Mark All Read */}
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>อ่านทั้งหมดแล้ว</span>
          </button>
        </div>
      </div>

      {/* Browser Push Permission Banner (if not granted yet) */}
      {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-indigo-950">เปิดรับการแจ้งเตือนบนเบราว์เซอร์ (Desktop Push)</h2>
              <p className="text-[11px] text-indigo-800/80">รับการแจ้งเตือนงานด่วนทันทีแม้จะเปิดไปทำงานที่แท็บอื่น</p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestBrowserPermission}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            อนุญาตการแจ้งเตือน
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            ไม่มีประวัติการแจ้งเตือน
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.repairId) {
                  setSelectedTicketId(n.repairId);
                  setActiveView('track_status');
                }
              }}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('th-TH') : ''}
                </p>
              </div>

              {n.ticketNumber && (
                <div className="flex items-center gap-1 text-xs font-bold text-blue-700 font-mono shrink-0">
                  <span>{n.ticketNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
