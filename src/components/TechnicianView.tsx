import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Save,
  Filter,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, URGENCY_CONFIG, getCategoryLabel } from '../data/mockData';
import { RepairStatus, RepairRequest, PartUsed } from '../types';

export const TechnicianView: React.FC = () => {
  const { repairs, currentUser, updateRepairStatus, claimRepair, openChatModal, setSelectedTicketId, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unassigned' | 'my_jobs' | 'waiting_parts'>('all');
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);

  // Form edit states for modal
  const [newStatus, setNewStatus] = useState<RepairStatus>('in_progress');
  const [inspectionResult, setInspectionResult] = useState('');
  const [solution, setSolution] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [parts, setParts] = useState<PartUsed[]>([]);
  const [repairCost, setRepairCost] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // New part input row state
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);

  // Unassigned jobs count
  const unassignedRepairs = repairs.filter(
    (r) => !r.technicianId || ['reported', 'pending'].includes(r.status)
  );
  const myAssignedRepairs = repairs.filter((r) => r.technicianId === currentUser.id);
  const waitingPartsRepairs = repairs.filter((r) => r.status === 'waiting_parts');

  // Filter repairs
  const displayedRepairs = repairs.filter((r) => {
    if (activeTab === 'unassigned') return !r.technicianId || ['reported', 'pending'].includes(r.status);
    if (activeTab === 'my_jobs') return r.technicianId === currentUser.id;
    if (activeTab === 'waiting_parts') return r.status === 'waiting_parts';
    return true;
  });

  const handleOpenActionModal = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setNewStatus(repair.status);
    setInspectionResult(repair.inspectionResult || '');
    setSolution(repair.solution || '');
    setTechnicianNotes(repair.technicianNotes || '');
    const initialParts = (repair.partsUsed || []).map((p) => ({
      ...p,
      totalPrice: p.totalPrice ?? (Number(p.quantity || 1) * Number(p.unitPrice || 0))
    }));
    setParts(initialParts);
    setRepairCost(repair.repairCost || 0);
  };

  const handleAddPart = () => {
    if (!partName.trim()) return;
    const qty = Number(partQty) || 1;
    const price = Number(partPrice) || 0;
    const newPart: PartUsed = {
      id: `part-${Date.now()}`,
      name: partName,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price
    };
    const updated = [...parts, newPart];
    setParts(updated);
    const sum = updated.reduce((acc, p) => acc + (p.totalPrice ?? (Number(p.quantity || 1) * Number(p.unitPrice || 0))), 0);
    setRepairCost(sum);
    setPartName('');
    setPartQty(1);
    setPartPrice(0);
  };

  const handleRemovePart = (id: string) => {
    const updated = parts.filter((p) => p.id !== id);
    setParts(updated);
    const sum = updated.reduce((acc, p) => acc + (p.totalPrice ?? (Number(p.quantity || 1) * Number(p.unitPrice || 0))), 0);
    setRepairCost(sum);
  };

  const handleSaveRepairAction = async () => {
    if (!selectedRepair) return;
    setIsSaving(true);
    try {
      await updateRepairStatus(
        selectedRepair.id,
        newStatus,
        technicianNotes || `อัปเดตสถานะเป็น ${STATUS_CONFIG[newStatus].label}`,
        {
          technicianId: currentUser.id,
          technicianName: currentUser.name,
          inspectionResult,
          solution,
          technicianNotes,
          partsUsed: parts,
          repairCost
        }
      );
      setSelectedRepair(null);
    } catch {
      alert('บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            พื้นที่ปฏิบัติงานช่างซ่อม (Technician Operations)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการรับงาน เปลี่ยนขั้นตอนการซ่อม บันทึกอาการ และจัดการรายการอะไหล่
          </p>
        </div>

        {/* Filters Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unassigned'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>งานใหม่รอรับเรื่อง</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'unassigned' ? 'bg-amber-700 text-white' : 'bg-amber-200/80 text-amber-900'
              }`}
            >
              {unassignedRepairs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my_jobs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my_jobs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>งานที่ฉันรับ</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'my_jobs' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {myAssignedRepairs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('waiting_parts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'waiting_parts'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>รออะไหล่</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'waiting_parts' ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-800'
              }`}
            >
              {waitingPartsRepairs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>งานทั้งหมด</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {repairs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Unassigned Banner */}
      {unassignedRepairs.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>มีงานแจ้งซ่อมใหม่ {unassignedRepairs.length} รายการรอช่างรับเรื่อง!</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              </h4>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                มีคำขอแจ้งซ่อมที่เพิ่งส่งเข้ามาใหม่ ท่านสามารถกดปุ่ม "กดรับงานนี้" เพื่อเริ่มดำเนินการได้ทันที
              </p>
            </div>
          </div>
          {activeTab !== 'unassigned' && (
            <button
              onClick={() => setActiveTab('unassigned')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
            >
              เปิดดูงานใหม่ ({unassignedRepairs.length})
            </button>
          )}
        </div>
      )}

      {/* Repairs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">เลขที่งาน</th>
                <th className="py-3.5 px-4">อุปกรณ์ & สถานที่</th>
                <th className="py-3.5 px-4">อาการเสียที่ระบุ</th>
                <th className="py-3.5 px-4">ความเร่งด่วน</th>
                <th className="py-3.5 px-4">สถานะปัจจุบัน</th>
                <th className="py-3.5 px-4">ช่างผู้รับผิดชอบ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRepairs.map((repair) => {
                const statusMeta = STATUS_CONFIG[repair.status];
                const urgencyMeta = URGENCY_CONFIG[repair.urgency];
                const isAssignedToMe = repair.technicianId === currentUser.id;

                return (
                  <tr key={repair.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {repair.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{repair.equipmentName}</div>
                      <div className="text-[11px] text-slate-400">
                        {repair.equipmentCode} • {repair.location} ({repair.room})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/60">
                          <Tag className="w-2.5 h-2.5 text-blue-500" />
                          <span className="truncate max-w-[140px]">{getCategoryLabel(repair.category)}</span>
                        </span>
                      </div>
                      <div className="text-slate-700 line-clamp-2">{repair.symptom}</div>
                      {repair.aiDiagnosis && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-medium mt-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>AI: {repair.aiDiagnosis.symptomSummary}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${urgencyMeta.bg} ${urgencyMeta.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${urgencyMeta.dotColor}`} />
                        {urgencyMeta.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {repair.technicianName ? (
                        <span className={isAssignedToMe ? 'font-bold text-emerald-700' : 'text-slate-600'}>
                          {repair.technicianName} {isAssignedToMe && '(ฉัน)'}
                        </span>
                      ) : (
                        <span className="text-amber-600 italic">ยังไม่ระบุช่าง</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => openChatModal(repair.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="แชตกับผู้แจ้ง"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {!repair.technicianId && (
                          <button
                            id={`btn-claim-${repair.ticketNumber}`}
                            onClick={() => claimRepair(repair.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                            title="กดรับมอบหมายงานซ่อมนี้"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>กดรับงานนี้</span>
                          </button>
                        )}

                        <button
                          id={`btn-manage-repair-${repair.ticketNumber}`}
                          onClick={() => handleOpenActionModal(repair)}
                          className={`px-3 py-1.5 rounded-xl text-white font-medium text-[11px] shadow-xs cursor-pointer transition-colors ${
                            isAssignedToMe
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-slate-800 hover:bg-slate-900'
                          }`}
                        >
                          จัดการงาน
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TECH ACTION MODAL (Section 8 Requirement) */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {selectedRepair.ticketNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/60">
                    <Tag className="w-2.5 h-2.5 text-blue-500" />
                    <span>ประเภท: {getCategoryLabel(selectedRepair.category)}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  บันทึกการซ่อม & อัปเดตสถานะ ({selectedRepair.equipmentName})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRepair(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* 1. เปลี่ยนสถานะงานซ่อมตามขั้นตอน */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                เปลี่ยนสถานะงานซ่อม (Status Workflow)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'acknowledged', label: 'รับเรื่องแล้ว' },
                  { key: 'investigating', label: 'กำลังตรวจสอบ' },
                  { key: 'in_progress', label: 'กำลังซ่อม' },
                  { key: 'waiting_parts', label: 'รออะไหล่' },
                  { key: 'completed', label: 'ซ่อมเสร็จ' },
                  { key: 'closed', label: 'ปิดงาน' }
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setNewStatus(s.key as RepairStatus)}
                    className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                      newStatus === s.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. บันทึกผลการตรวจสอบ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                บันทึกผลการตรวจสอบ (Inspection Result)
              </label>
              <textarea
                value={inspectionResult}
                onChange={(e) => setInspectionResult(e.target.value)}
                placeholder="เช่น ตรวจสอบพบว่า RAM Slot 2 สกปรก ขาหน้าสัมผัสมีออกไซด์เกาะ..."
                rows={2}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* 3. บันทึกวิธีแก้ไข */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                บันทึกวิธีแก้ไข (Solution / Repair Action)
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="เช่น ทำความสะอาดหน้าสัมผัส RAM ด้วยยางลบและสเปรย์ Contact Cleaner ทดสอบ Boot 3 ครั้งผ่าน..."
                rows={2}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* 4. บันทึกอะไหล่ที่ใช้ (ชื่ออะไหล่, จำนวน, ราคาต่อหน่วย) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                บันทึกอะไหล่ที่ใช้ (Parts & Consumables)
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="ชื่ออะไหล่ เช่น RAM DDR4 8GB"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="flex-1 min-w-[160px] p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="จำนวน"
                  min="1"
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  className="w-20 p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="ราคา/หน่วย"
                  min="0"
                  value={partPrice}
                  onChange={(e) => setPartPrice(Number(e.target.value))}
                  className="w-24 p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มอะไหล่</span>
                </button>
              </div>

              {/* Parts list */}
              {parts.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {parts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-500 ml-2">
                          ({p.quantity} x {(p.unitPrice ?? 0).toLocaleString()} บาท)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          {((p.totalPrice ?? (Number(p.quantity || 1) * Number(p.unitPrice || 0))) ?? 0).toLocaleString()} บาท
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePart(p.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. บันทึกค่าใช้จ่าย & หมายเหตุ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  รวมค่าใช้จ่าย (บาท)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  หมายเหตุเพิ่มเติมของช่าง
                </label>
                <input
                  type="text"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="เช่น ทดสอบให้ผู้ใช้งานรับเครื่องแล้ว"
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRepair(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                id="btn-save-repair-action"
                onClick={handleSaveRepairAction}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลการซ่อม'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
