import React, { useState } from 'react';
import {
  ListTodo,
  Search,
  Filter,
  PlusCircle,
  Eye,
  MessageSquare,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, URGENCY_CONFIG, getCategoryLabel } from '../data/mockData';
import { RepairStatus, RepairRequest } from '../types';

interface TicketListViewProps {
  title: string;
  subtitle: string;
  filterMode?: 'all' | 'my_created' | 'assigned_to_me' | 'history' | 'unassigned';
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  title,
  subtitle,
  filterMode = 'all'
}) => {
  const {
    repairs,
    currentUser,
    setSelectedTicketId,
    setActiveView,
    openChatModal,
    claimRepair
  } = useApp();

  const [techTab, setTechTab] = useState<'assigned' | 'unassigned' | 'all'>(
    filterMode === 'unassigned' ? 'unassigned' : 'assigned'
  );

  React.useEffect(() => {
    if (filterMode === 'unassigned') {
      setTechTab('unassigned');
    } else if (filterMode === 'assigned_to_me') {
      setTechTab('assigned');
    }
  }, [filterMode]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  const unassignedRepairs = repairs.filter(
    (r) => !r.technicianId || ['reported', 'pending'].includes(r.status)
  );
  const myAssignedRepairs = repairs.filter((r) => r.technicianId === currentUser.id);

  // Filter repairs
  const filtered = repairs.filter((r) => {
    // Technician view sub-tab filter if on assigned_to_me or unassigned
    if (currentUser.role === 'technician' && (filterMode === 'assigned_to_me' || filterMode === 'unassigned')) {
      if (techTab === 'assigned' && r.technicianId !== currentUser.id) return false;
      if (techTab === 'unassigned' && (r.technicianId && !['reported', 'pending'].includes(r.status))) return false;
      // techTab === 'all' shows everything
    } else {
      // Mode filter
      if (filterMode === 'my_created' && r.userId !== currentUser.id) return false;
      if (filterMode === 'assigned_to_me' && r.technicianId !== currentUser.id) return false;
      if (filterMode === 'unassigned' && (r.technicianId && !['reported', 'pending'].includes(r.status))) return false;
      if (filterMode === 'history' && !['completed', 'closed'].includes(r.status)) return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

    // Urgency filter
    if (selectedUrgency !== 'all' && r.urgency !== selectedUrgency) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTicket = r.ticketNumber.toLowerCase().includes(q);
      const matchEq = r.equipmentName.toLowerCase().includes(q);
      const matchCode = r.equipmentCode.toLowerCase().includes(q);
      const matchRoom = r.room.toLowerCase().includes(q);
      const matchSymptom = r.symptom.toLowerCase().includes(q);
      const matchCategory = (r.category || '').toLowerCase().includes(q);
      return matchTicket || matchEq || matchCode || matchRoom || matchSymptom || matchCategory;
    }

    return true;
  });

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveView('track_status');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {currentUser.role === 'user' && (
          <button
            onClick={() => setActiveView('new_repair')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แจ้งซ่อมใหม่</span>
          </button>
        )}

        {currentUser.role === 'technician' && (filterMode === 'assigned_to_me' || filterMode === 'unassigned') && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl flex-wrap">
            <button
              onClick={() => setTechTab('assigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                techTab === 'assigned'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              งานของฉัน ({myAssignedRepairs.length})
            </button>
            <button
              onClick={() => setTechTab('unassigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                techTab === 'unassigned'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>งานใหม่รอรับเรื่อง</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${techTab === 'unassigned' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {unassignedRepairs.length}
              </span>
            </button>
            <button
              onClick={() => setTechTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                techTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({repairs.length})
            </button>
          </div>
        )}
      </div>

      {/* Unassigned Notification Banner for Technician */}
      {currentUser.role === 'technician' && unassignedRepairs.length > 0 && techTab !== 'unassigned' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>มีงานแจ้งซ่อมใหม่ {unassignedRepairs.length} รายการที่ยังไม่มีช่างรับผิดชอบ!</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                คลิกเพื่อดูรายการงานใหม่และกดรับงานเพื่อเข้าดำเนินการซ่อม
              </p>
            </div>
          </div>
          <button
            onClick={() => setTechTab('unassigned')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            ดูงานใหม่ ({unassignedRepairs.length})
          </button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่งาน, อุปกรณ์, อาการเสีย หรือห้อง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">สถานะ:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทั้งหมด</option>
            <option value="reported">แจ้งซ่อม</option>
            <option value="pending">รอรับเรื่อง</option>
            <option value="acknowledged">รับเรื่องแล้ว</option>
            <option value="investigating">กำลังตรวจสอบ</option>
            <option value="in_progress">กำลังซ่อม</option>
            <option value="waiting_parts">รออะไหล่</option>
            <option value="completed">ซ่อมเสร็จ</option>
            <option value="closed">ปิดงาน</option>
          </select>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">ความเร่งด่วน:</span>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทั้งหมด</option>
            <option value="low">ปกติ</option>
            <option value="medium">ปานกลาง</option>
            <option value="high">สูง</option>
            <option value="critical">ฉุกเฉิน</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            ไม่พบรายการแจ้งซ่อมที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3.5 px-4">เลขที่งาน</th>
                  <th className="py-3.5 px-4">อุปกรณ์ / สถานที่</th>
                  <th className="py-3.5 px-4">อาการเสีย</th>
                  <th className="py-3.5 px-4">ผู้แจ้ง</th>
                  <th className="py-3.5 px-4">ความเร่งด่วน</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">วันที่แจ้ง</th>
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ticket: RepairRequest) => {
                  const statusMeta = STATUS_CONFIG[ticket.status];
                  const urgencyMeta = URGENCY_CONFIG[ticket.urgency];
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ticket.equipmentName}</div>
                        <div className="text-[10px] text-slate-400">
                          {ticket.equipmentCode} • {ticket.room}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/60">
                            <Tag className="w-2.5 h-2.5 text-blue-500" />
                            <span className="truncate max-w-[140px]">{getCategoryLabel(ticket.category)}</span>
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-700 text-xs">{ticket.symptom}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{ticket.userName}</div>
                        <div className="text-[10px] text-slate-400">{ticket.userDepartment}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${urgencyMeta.bg} ${urgencyMeta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgencyMeta.dotColor}`} />
                          {urgencyMeta.label.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {currentUser.role === 'technician' && !ticket.technicianId && (
                            <button
                              id={`btn-claim-list-${ticket.ticketNumber}`}
                              onClick={() => claimRepair(ticket.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs shrink-0"
                              title="กดรับมอบหมายงานซ่อมนี้"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>กดรับงาน</span>
                            </button>
                          )}
                          <button
                            onClick={() => openChatModal(ticket.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="แชตกับช่าง"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSelectTicket(ticket.id)}
                            className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                          >
                            ติดตาม
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
