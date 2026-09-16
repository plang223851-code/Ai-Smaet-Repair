import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Wrench,
  Search,
  MessageSquare,
  Sparkles,
  Star,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  MapPin,
  Calendar,
  Eye,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, URGENCY_CONFIG, getCategoryLabel } from '../data/mockData';
import { RepairStatus, RepairRequest } from '../types';

export const TrackStatusView: React.FC = () => {
  const { repairs, selectedTicketId, setSelectedTicketId, openChatModal, setActiveView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredTickets = repairs.filter(
    (r) =>
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.reporterPhone && r.reporterPhone.includes(searchQuery))
  );

  // Selected repair ticket (defaults to selectedTicketId or first filtered ticket)
  const currentTicket =
    filteredTickets.find((r) => r.id === selectedTicketId || r.ticketNumber === selectedTicketId) ||
    filteredTickets[0] ||
    repairs.find((r) => r.id === selectedTicketId || r.ticketNumber === selectedTicketId) ||
    repairs[0];

  // Pipeline order definition for step progression
  const statusPipeline: { key: RepairStatus; label: string; stepNo: number }[] = [
    { key: 'reported', label: 'แจ้งซ่อม', stepNo: 1 },
    { key: 'pending', label: 'รอรับเรื่อง', stepNo: 2 },
    { key: 'acknowledged', label: 'รับเรื่องแล้ว', stepNo: 3 },
    { key: 'investigating', label: 'กำลังตรวจสอบ', stepNo: 4 },
    { key: 'in_progress', label: 'กำลังซ่อม', stepNo: 5 },
    { key: 'waiting_parts', label: 'รออะไหล่', stepNo: 6 },
    { key: 'completed', label: 'ซ่อมเสร็จ', stepNo: 7 },
    { key: 'closed', label: 'ปิดงาน', stepNo: 8 }
  ];

  const getCurrentStepIndex = (status: RepairStatus) => {
    const idx = statusPipeline.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (!currentTicket) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700">ไม่มีข้อมูลงานแจ้งซ่อม</h3>
        <p className="text-xs text-slate-400 mt-1">
          สร้างคำขอแจ้งซ่อมเพื่อเริ่มติดตามสถานะงาน
        </p>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(currentTicket.status);
  const statusMeta = STATUS_CONFIG[currentTicket.status];
  const urgencyMeta = URGENCY_CONFIG[currentTicket.urgency];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Search & Ticket Quick Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            ติดตามสถานะงานแจ้งซ่อม (Repair Status Timeline)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบความคืบหน้าแบบ Real-time และขั้นตอนการดำเนินงานของช่าง
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่งาน เช่น REP-2026..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Layout: Left Selector, Right Detailed Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 px-1">
            รายการงานซ่อมทั้งหมด ({filteredTickets.length})
          </div>
          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === currentTicket.id;
              const sMeta = STATUS_CONFIG[ticket.status];
              const uMeta = URGENCY_CONFIG[ticket.urgency];
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sMeta.bg} ${sMeta.text}`}
                    >
                      {sMeta.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {ticket.equipmentName}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{ticket.equipmentCode} • {ticket.room}</span>
                    <span className={`text-[10px] font-medium ${uMeta.text}`}>
                      {uMeta.label.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket Details & Pipeline (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card for Selected Ticket */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-blue-700 text-lg">
                    {currentTicket.ticketNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {currentTicket.equipmentName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg text-[11px] border border-blue-100">
                    <Tag className="w-3 h-3 text-blue-500" />
                    <span>ประเภท: {getCategoryLabel(currentTicket.category)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentTicket.location} - {currentTicket.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {currentTicket.createdAt ? new Date(currentTicket.createdAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-chat-with-tech"
                  onClick={() => openChatModal(currentTicket.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>แชตคุยกับช่าง</span>
                </button>
              </div>
            </div>

            {/* PROGRESS TIMELINE (Section 7 Requirement) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                ขั้นตอนการดำเนินงาน (Progress Steps)
              </h3>

              {/* Horizontal / Wrapped Step Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusPipeline.map((step, idx) => {
                  const isPassed = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : isPassed
                          ? 'border-blue-200 bg-blue-50/70 text-blue-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isPassed ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-blue-600'}`}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold leading-tight">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TIMELINE HISTORY WITH DATE AND TIME (แสดงวันและเวลาที่เปลี่ยนสถานะแต่ละขั้นตอน) */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                ประวัติบันทึกสถานะ (Status Change Log)
              </h3>
              <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                {currentTicket.statusHistory.map((item, hIdx) => (
                  <div key={item.id || hIdx} className="relative pl-4">
                    {/* Dot on line */}
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) + ' น.' : '-'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ดำเนินการโดย: <span className="font-semibold text-slate-700">{item.changedBy}</span> ({item.role})
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-1.5 border border-slate-100">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Symptom & AI Diagnosis Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              อาการที่แจ้งและผลการวิเคราะห์
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">ประเภทปัญหา (Category):</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                  <Tag className="w-3 h-3 text-blue-600" />
                  {getCategoryLabel(currentTicket.category)}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block mb-1">อาการเสียที่ระบุ:</span>
                <p className="text-slate-700 leading-relaxed">{currentTicket.symptom}</p>
              </div>
            </div>

            {/* AI Diagnosis Details */}
            {currentTicket.aiDiagnosis && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    ผลวิเคราะห์อาการเบื้องต้นโดย AI
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    ระดับความรุนแรง: {currentTicket.aiDiagnosis.severityLabel}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">สาเหตุที่เป็นไปได้:</span>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-slate-600">
                    {currentTicket.aiDiagnosis.possibleCauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">แนวทางตรวจสอบ:</span>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-slate-600">
                    {currentTicket.aiDiagnosis.initialChecks.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Attachments Section (รูปภาพปัญหา) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              รูปภาพปัญหาที่แนบ ({currentTicket.attachments.length} รูป)
            </h3>

            {currentTicket.attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ไม่มีรูปภาพแนบในงานแจ้งซ่อมนี้</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentTicket.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedPhoto(att.url)}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video group cursor-pointer"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-medium">
                      <Eye className="w-4 h-4" />
                      <span>ขยายรูป</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspection, Solution, Parts Used & Costs (ช่างบันทึก) */}
          {(currentTicket.inspectionResult || currentTicket.solution || currentTicket.partsUsed) && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                บันทึกผลการซ่อมและอะไหล่ (Technician Notes)
              </h3>

              {currentTicket.inspectionResult && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700">ผลการตรวจสอบของช่าง:</span>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {currentTicket.inspectionResult}
                  </p>
                </div>
              )}

              {currentTicket.solution && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700">วิธีแก้ไข:</span>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {currentTicket.solution}
                  </p>
                </div>
              )}

              {currentTicket.partsUsed && currentTicket.partsUsed.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">อะไหล่ที่ใช้:</span>
                  <div className="space-y-1.5">
                    {currentTicket.partsUsed.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-slate-800">{p.name}</span>
                          {p.partNumber && (
                            <span className="text-[10px] text-slate-400 font-mono">({p.partNumber})</span>
                          )}
                        </div>
                        <span className="font-mono text-slate-700">
                          {p.quantity} ชิ้น • {(p.unitPrice ?? 0).toLocaleString()} บาท
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentTicket.repairCost !== undefined && currentTicket.repairCost !== null && currentTicket.repairCost > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold">
                  <span className="text-slate-600">ค่าใช้จ่ายรวมทั้งสิ้น:</span>
                  <span className="text-emerald-700 font-mono text-sm">
                    {(currentTicket.repairCost ?? 0).toLocaleString()} บาท
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Satisfaction Rating Card (Section 15 Requirement) */}
          {currentTicket.rating ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ผลการประเมินความพึงพอใจ
                </h3>
                <span className="text-xs font-bold text-amber-800">
                  {currentTicket.rating.overallRating} / 5 ดาว
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">ภาพรวม</span>
                  <span className="font-bold text-amber-600">{currentTicket.rating.overallRating} ★</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">ความรวดเร็ว</span>
                  <span className="font-bold text-amber-600">{currentTicket.rating.speedRating} ★</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">การบริการช่าง</span>
                  <span className="font-bold text-amber-600">{currentTicket.rating.serviceRating} ★</span>
                </div>
              </div>
              {currentTicket.rating.comments && (
                <p className="text-xs text-amber-900/90 italic bg-white/60 p-2.5 rounded-xl">
                  "{currentTicket.rating.comments}"
                </p>
              )}
            </div>
          ) : (
            ['completed', 'closed'].includes(currentTicket.status) && (
              <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">งานนี้ซ่อมเสร็จเรียบร้อยแล้ว</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    คุณสามารถช่วยประเมินการให้บริการของช่างเพื่อพัฒนาคุณภาพ
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Open rating modal
                    alert('สามารถประเมินความพึงพอใจได้ในหน้าปิดงาน');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  ประเมิน 1-5 ดาว
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center">
            <img
              src={selectedPhoto}
              alt="Expanded Preview"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
