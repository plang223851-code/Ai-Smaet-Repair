import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Wrench, MessageSquare, Sparkles, X, ArrowRight, Volume2, VolumeX } from 'lucide-react';

export const LiveNotificationToast: React.FC = () => {
  const {
    liveToasts,
    dismissLiveToast,
    setSelectedTicketId,
    setActiveView,
    openChatModal,
    isSoundEnabled,
    toggleSoundEnabled
  } = useApp();

  if (liveToasts.length === 0) return null;

  return (
    <div
      id="live-toast-container"
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
    >
      {liveToasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'new_ticket':
              return <Wrench className="w-4 h-4 text-amber-500" />;
            case 'status_changed':
              return <Bell className="w-4 h-4 text-blue-500" />;
            case 'chat_message':
              return <MessageSquare className="w-4 h-4 text-emerald-500" />;
            default:
              return <Sparkles className="w-4 h-4 text-indigo-500" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'new_ticket':
              return 'border-amber-400/50 shadow-amber-500/10';
            case 'status_changed':
              return 'border-blue-400/50 shadow-blue-500/10';
            case 'chat_message':
              return 'border-emerald-400/50 shadow-emerald-500/10';
            default:
              return 'border-indigo-400/50 shadow-indigo-500/10';
          }
        };

        return (
          <div
            key={toast.id}
            id={`live-toast-${toast.id}`}
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border ${getBorderColor()} transition-all duration-300 animate-in slide-in-from-top-4 fade-in`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800/90 flex items-center justify-center shrink-0 border border-slate-700/50">
                  {getIcon()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {toast.title}
                  </span>
                  {toast.badgeText && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${toast.badgeColor || 'bg-blue-600 text-white'}`}>
                      {toast.badgeText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleSoundEnabled}
                  title={isSoundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => dismissLiveToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 pl-9">
              {toast.message}
            </p>

            {(toast.ticketId || toast.ticketNumber) && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between pl-9">
                <span className="text-[11px] font-mono text-slate-400">
                  {toast.ticketNumber}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    dismissLiveToast(toast.id);
                    if (toast.type === 'chat_message') {
                      openChatModal(toast.ticketId || toast.ticketNumber || '');
                    } else if (toast.ticketId) {
                      setSelectedTicketId(toast.ticketId);
                      setActiveView('track_status');
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>{toast.type === 'chat_message' ? 'ตอบกลับแชต' : 'ดูรายละเอียด'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
