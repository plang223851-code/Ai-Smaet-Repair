import React, { useState } from 'react';
import {
  Activity,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wrench,
  Package,
  History,
  Clock,
  Search,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Equipment } from '../types';

export const EquipmentHealthView: React.FC = () => {
  const { equipmentList, repairs, setSelectedTicketId, setActiveView } = useApp();
  const [selectedEqId, setSelectedEqId] = useState<string>(equipmentList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEquipment = equipmentList.find((e) => e.id === selectedEqId) || equipmentList[0];

  const filteredEquipment = equipmentList.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate equipment age
  const calculateAge = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (years === 0) return `${months} เดือน`;
    return `${years} ปี ${months > 0 ? `${months} เดือน` : ''}`;
  };

  // Find all repairs for this equipment
  const equipmentRepairs = repairs.filter(
    (r) =>
      r.equipmentId === selectedEquipment?.id ||
      r.equipmentCode === selectedEquipment?.code
  );

  const getHealthColor = (score: number) => {
    if (score >= 85) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'ดีเยี่ยม (Healthy)' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'ปานกลาง / ควรเฝ้าระวัง' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'เสี่ยงต่อการเสียสูง (At Risk)' };
  };

  if (!selectedEquipment) {
    return <div className="p-8 text-center text-slate-500">ไม่มีข้อมูลอุปกรณ์</div>;
  }

  const healthMeta = getHealthColor(selectedEquipment.healthScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            ประวัติสุขภาพอุปกรณ์ (Equipment Health Score)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจวัดคะแนนสุขภาพ คำนวณอายุการใช้งาน บันทึกอะไหล่ และวิเคราะห์แนวโน้มการชำรุด
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารหัส หรือชื่อเครื่อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Grid: Left List (4 cols), Right Detailed Report (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Selection List */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-500 px-1">
            อุปกรณ์ทั้งหมด ({filteredEquipment.length})
          </span>
          {filteredEquipment.map((eq) => {
            const isSelected = eq.id === selectedEquipment.id;
            const hColor = getHealthColor(eq.healthScore);
            return (
              <div
                key={eq.id}
                onClick={() => setSelectedEqId(eq.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-blue-700">{eq.code}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${hColor.bg} ${hColor.text}`}>
                    {eq.healthScore} / 100
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{eq.name}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{eq.room}</span>
                  <span>ซ่อมไปแล้ว {eq.repairCount} ครั้ง</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Device Detailed Health Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Score & Basic Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {selectedEquipment.code}
                  </span>
                  <span className="text-xs text-slate-500">{selectedEquipment.type}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedEquipment.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  สถานที่: {selectedEquipment.location} • ห้อง: {selectedEquipment.room} • รุ่น: {selectedEquipment.brand} {selectedEquipment.model}
                </p>
              </div>

              {/* Health Score Circular Badge */}
              <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${healthMeta.bg} ${healthMeta.border} min-w-[130px]`}>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  HEALTH SCORE
                </span>
                <span className={`text-3xl font-black ${healthMeta.text} mt-0.5`}>
                  {selectedEquipment.healthScore}
                </span>
                <span className={`text-[10px] font-bold mt-1 ${healthMeta.text}`}>
                  {healthMeta.label}
                </span>
              </div>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">อายุการใช้งาน</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {calculateAge(selectedEquipment.startDate)}
                </span>
                <span className="text-[10px] text-slate-400">เริ่ม {selectedEquipment.startDate}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">จำนวนครั้งที่เสีย</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {selectedEquipment.repairCount} ครั้ง
                </span>
                <span className="text-[10px] text-slate-400">บันทึกในระบบ</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">จำนวนครั้งที่ซ่อม</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {selectedEquipment.repairCount} ครั้ง
                </span>
                <span className="text-[10px] text-emerald-600">สำเร็จทั้งหมด</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">การซ่อมล่าสุด</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {selectedEquipment.lastRepairDate || 'ไม่มีประวัติ'}
                </span>
                <span className="text-[10px] text-slate-400">วันตรวจล่าสุด</span>
              </div>
            </div>

            {/* Frequent Issues & Replaced Parts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                  ปัญหาที่พบบ่อย (Frequent Issues)
                </h4>
                {selectedEquipment.frequentIssues.length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่พบปัญหาซ้ำซ้อน</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                    {selectedEquipment.frequentIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  รายการอะไหล่ที่เคยเปลี่ยน
                </h4>
                {selectedEquipment.replacedParts.length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่มีการเปลี่ยนอะไหล่</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEquipment.replacedParts.map((part, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline ประวัติการซ่อมทั้งหมดของอุปกรณ์ชิ้นนี้ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Timeline ประวัติการแจ้งซ่อมของอุปกรณ์ชิ้นนี้ ({equipmentRepairs.length} รายการ)
            </h3>

            {equipmentRepairs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ไม่มีประวัติการแจ้งซ่อมสำหรับอุปกรณ์นี้</p>
            ) : (
              <div className="space-y-3">
                {equipmentRepairs.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      setSelectedTicketId(rep.id);
                      setActiveView('track_status');
                    }}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700">
                          {rep.ticketNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {rep.symptom.slice(0, 50)}...
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        แจ้งเมื่อ {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('th-TH') : '-'} • ช่างผู้ดูแล: {rep.technicianName || 'ยังไม่ระบุ'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
