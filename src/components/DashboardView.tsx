import React from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Package,
  History,
  Lock,
  UserCheck,
  ChevronRight,
  MapPin,
  Laptop,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, URGENCY_CONFIG } from '../data/mockData';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    repairs,
    equipmentList,
    messages,
    setActiveView,
    setSelectedTicketId
  } = useApp();

  // Filter repairs depending on current user perspective, including guest submitted tickets
  const savedTicketIds: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('my_submitted_ticket_ids') || '[]');
    } catch {
      return [];
    }
  })();
  const savedReporterPhone = typeof window !== 'undefined' ? localStorage.getItem('repair_reporter_phone') || '' : '';

  const userRepairs = repairs.filter((r) => {
    if (currentUser.id !== 'usr-guest' && r.userId === currentUser.id) return true;
    if (savedTicketIds.includes(r.id)) return true;
    if (savedReporterPhone && r.userPhone && r.userPhone === savedReporterPhone) return true;
    return false;
  });
  const userActiveRepairs = userRepairs.filter((r) => !['completed', 'closed'].includes(r.status));
  const userCompletedRepairs = userRepairs.filter((r) => ['completed', 'closed'].includes(r.status));
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  const techAssignedRepairs = repairs.filter((r) => r.technicianId === currentUser.id);
  const techActiveAssignedRepairs = techAssignedRepairs.filter((r) => !['completed', 'closed'].includes(r.status));

  // Status counters for Tech
  const techNew = repairs.filter((r) => ['reported', 'pending'].includes(r.status)).length;
  const techMyTotal = techAssignedRepairs.length;
  const techInProgress = techAssignedRepairs.filter((r) =>
    ['investigating', 'in_progress'].includes(r.status)
  ).length;
  const techWaitingParts = techAssignedRepairs.filter((r) => r.status === 'waiting_parts').length;
  const techDone = techAssignedRepairs.filter((r) => ['completed', 'closed'].includes(r.status)).length;

  // Admin counts
  const adminTotal = repairs.length;
  const adminActive = repairs.filter((r) => !['closed'].includes(r.status)).length;
  const totalRepairExpense = repairs.reduce((acc, curr) => acc + (curr.repairCost || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* อยู่ด้านบนมุมขวานอกแผงแจ้งซ่อมอุปกรณ์ (สำหรับผู้ใช้ทั่วไป) */}
      {currentRole === 'user' && (
        <div className="flex items-center justify-between flex-wrap gap-2 -mb-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ผู้แจ้งซ่อมไม่ต้องล็อกอิน แจ้งซ่อมได้ทันที
            </span>
          </div>
          <button
            id="btn-dash-staff-login-outside"
            onClick={() => setActiveView('login')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-blue-700 font-semibold text-xs border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
            title="เข้าสู่ระบบเฉพาะช่างซ่อมและผู้ดูแลระบบ"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>เข้าสู่ระบบเจ้าหน้าที่ (ช่าง / แอดมิน)</span>
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div
        className={`rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden ${
          currentRole === 'technician'
            ? 'bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900'
            : currentRole === 'admin'
            ? 'bg-gradient-to-r from-indigo-800 via-indigo-700 to-slate-900'
            : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800'
        }`}
      >
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8">
          <Wrench className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-blue-100 mb-2 border border-white/10">
              {currentRole === 'technician' ? (
                <>
                  <Wrench className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-100">แดชบอร์ดช่างซ่อมคอมพิวเตอร์ (IT Support Portal)</span>
                </>
              ) : currentRole === 'admin' ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-indigo-100">แดชบอร์ดผู้ดูแลระบบ IT (Admin Portal)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>ระบบแจ้งซ่อมคอมพิวเตอร์ออนไลน์ • ไม่ต้องเข้าสู่ระบบ</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentRole === 'user' ? 'แจ้งซ่อมอุปกรณ์คอมพิวเตอร์ออนไลน์' : `สวัสดี, ${currentUser.name}`}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              {currentRole === 'technician'
                ? 'ภาพรวมงานซ่อมที่รับผิดชอบ ตรวจสอบคิวงานใหม่ บันทึกผลการซ่อม และจัดการอะไหล่'
                : currentRole === 'admin'
                ? 'แดชบอร์ดบริหารจัดการศูนย์ไอที ควบคุมสถานะงาน ประสิทธิภาพ และสุขภาพอุปกรณ์'
                : 'ผู้แจ้งซ่อมสามารถแจ้งปัญหาอุปกรณ์ ติดตามสถานะงานซ่อมแบบเรียลไทม์ และสื่อสารกับช่างได้ทันที โดยไม่ต้องลงทะเบียนหรือเข้าสู่ระบบ'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentRole === 'user' && (
              <button
                id="btn-dash-new-repair"
                onClick={() => setActiveView('new_repair')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4 text-blue-700" />
                <span>แจ้งซ่อมทันที</span>
              </button>
            )}

            {currentRole === 'technician' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('unassigned_jobs')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>งานใหม่รอรับ ({techNew})</span>
                </button>
                <button
                  onClick={() => setActiveView('tech_jobs')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  <span>โต๊ะทำงานช่าง</span>
                </button>
              </div>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveView('analytics')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-800 hover:bg-indigo-50 active:bg-indigo-100 font-semibold text-xs shadow-lg transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-indigo-700" />
                <span>เปิดกราฟวิเคราะห์</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TECHNICIAN DASHBOARD VIEW ================= */}
      {currentRole === 'technician' && (
        <div className="space-y-5">
          {/* New Unassigned Jobs Alert */}
          {techNew > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>มีงานแจ้งซ่อมใหม่ {techNew} รายการรอช่างรับเรื่อง!</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    มีผู้แจ้งซ่อมคอมพิวเตอร์เข้ามาใหม่และยังไม่มีช่างรับผิดชอบ สามารถกดตรวจสอบและรับงานได้ทันที
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('unassigned_jobs')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
              >
                ดูงานใหม่และกดรับงาน ({techNew})
              </button>
            </div>
          )}

          {/* 5 KPI Metric Cards for Technician */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <div
              onClick={() => setActiveView('unassigned_jobs')}
              className="bg-white p-4 rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold text-amber-900 group-hover:text-amber-600">งานใหม่รอรับ</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{techNew}</p>
              <span className="text-[10px] text-amber-600 font-medium group-hover:underline flex items-center gap-1 mt-1">
                คลิกเปิดดู <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => setActiveView('my_assigned')}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold group-hover:text-blue-600">งานที่รับผิดชอบ</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{techMyTotal}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">งานทั้งหมดของฉัน</span>
            </div>

            <div
              onClick={() => setActiveView('tech_jobs')}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold group-hover:text-indigo-600">กำลังซ่อม</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">{techInProgress}</p>
              <span className="text-[10px] text-indigo-600 mt-1 block">กำลังดำเนินการ</span>
            </div>

            <div
              onClick={() => setActiveView('tech_jobs')}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold group-hover:text-orange-600">รออะไหล่</span>
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{techWaitingParts}</p>
              <span className="text-[10px] text-orange-600 mt-1 block">รอชิ้นส่วนทดแทน</span>
            </div>

            <div
              onClick={() => setActiveView('tech_jobs')}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold group-hover:text-emerald-600">ซ่อมเสร็จแล้ว</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{techDone}</p>
              <span className="text-[10px] text-emerald-600 mt-1 block">เสร็จสิ้นสมบูรณ์</span>
            </div>
          </div>

          {/* Quick Bar to Monthly Expenses for Tech */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 px-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">สรุปค่าใช้จ่ายและอะไหล่ในการซ่อมแต่ละเดือน</h4>
                <p className="text-[11px] text-slate-600">ตรวจสอบยอดเบิกจ่ายอะไหล่ ค่าแรง และประวัติค่าใช้จ่ายงานซ่อมแยกตามเดือน</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('monthly_expenses')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>เปิดดูสรุปค่าใช้จ่าย</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Main Action Panels for Technician */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Action 1: งานใหม่รอช่างรับเรื่อง */}
            <div
              onClick={() => setActiveView('unassigned_jobs')}
              className="rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
            >
              <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <AlertCircle className="w-44 h-44 text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-amber-100 mb-3 border border-white/10">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>คิวงานใหม่รอรับเรื่อง</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-100 transition-colors">
                  1. รับงานแจ้งซ่อมใหม่
                </h2>
                <p className="text-xs sm:text-sm text-amber-50 mt-2 leading-relaxed">
                  ตรวจสอบรายการแจ้งซ่อมคอมพิวเตอร์ที่เพิ่งแจ้งเข้ามา ตรวจสอบระดับความเร่งด่วน และกดรับมอบหมายงานทันที
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <div className="text-xs text-amber-100">
                  <span className="font-semibold text-white">
                    มีงานใหม่ {techNew} รายการ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView('unassigned_jobs');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-800 hover:bg-amber-50 active:bg-amber-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>เปิดดูงานใหม่</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action 2: โต๊ะทำงานช่าง (Workbench) */}
            <div
              onClick={() => setActiveView('tech_jobs')}
              className="rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-800 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
            >
              <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <Wrench className="w-44 h-44 text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-emerald-100 mb-3 border border-white/10">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>ระบบบันทึกผลงานซ่อม</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-100 transition-colors">
                  2. จัดการงานซ่อม (Workbench)
                </h2>
                <p className="text-xs sm:text-sm text-emerald-50 mt-2 leading-relaxed">
                  ปรับเปลี่ยนสถานะงาน 8 ขั้นตอน บันทึกผลการตรวจเช็ค เบิกจ่ายอะไหล่พร้อมคำนวณราคา และปิดงานซ่อม
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <div className="text-xs text-emerald-100">
                  <span className="font-semibold text-white">
                    งานของฉัน {techMyTotal} รายการ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView('tech_jobs');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>เปิดโต๊ะทำงาน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action 3: แชตกับผู้แจ้งซ่อม */}
            <div
              onClick={() => setActiveView('chat')}
              className="rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-600 to-purple-900 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
            >
              <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <MessageSquare className="w-44 h-44 text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-purple-100 mb-3 border border-white/10">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ระบบแชตโต้ตอบสด</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-100 transition-colors">
                  3. แชตกับผู้แจ้งซ่อม
                </h2>
                <p className="text-xs sm:text-sm text-purple-50 mt-2 leading-relaxed">
                  สนทนาสอบถามอาการเพิ่มเติม นัดหมายเวลาเข้าตรวจสอบหน้างาน หรือส่งรูปภาพชี้แจงสถานะการซ่อม
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <div className="text-xs text-purple-100">
                  <span className="font-semibold text-white">
                    {unreadMessagesCount > 0 ? `มี ${unreadMessagesCount} ข้อความใหม่` : 'พร้อมให้บริการ'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView('chat');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-800 hover:bg-purple-50 active:bg-purple-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>เปิดห้องแชต</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Assigned Jobs List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  งานซ่อมที่กำลังดำเนินการ (Active Jobs)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รายการงานแจ้งซ่อมที่คุณกำลังรับผิดชอบดำเนินการอยู่
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('my_assigned')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                ดูทั้งหมด ({techAssignedRepairs.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {techActiveAssignedRepairs.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">ไม่มีงานซ่อมค้างอยู่!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  คุณได้ดำเนินงานซ่อมที่ได้รับมอบหมายเสร็จสิ้นทั้งหมดแล้ว
                </p>
                {techNew > 0 && (
                  <button
                    onClick={() => setActiveView('unassigned_jobs')}
                    className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>กดรับงานใหม่ ({techNew})</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {techActiveAssignedRepairs.slice(0, 4).map((ticket) => {
                  const statusMeta = STATUS_CONFIG[ticket.status] || {
                    label: ticket.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    border: 'border-slate-200'
                  };
                  const urgencyMeta = URGENCY_CONFIG[ticket.urgency] || {
                    label: ticket.urgency,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800'
                  };

                  return (
                    <div
                      key={ticket.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                          <Laptop className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-blue-700">
                              {ticket.ticketNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                              {statusMeta.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${urgencyMeta.bg} ${urgencyMeta.text}`}>
                              {urgencyMeta.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                            {ticket.equipmentName} - {ticket.symptom}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {ticket.location} ({ticket.room})
                            </span>
                            <span>• ผู้แจ้ง: {ticket.userName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setActiveView('tech_jobs');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>บันทึกผลซ่อม</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= USER VIEW (3 MAIN PANELS) ================= */}
      {currentRole === 'user' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Panel 1: ติดตามสถานะ */}
          <div
            id="panel-track-status"
            onClick={() => {
              if (userActiveRepairs.length > 0) {
                setSelectedTicketId(userActiveRepairs[0].id);
              }
              setActiveView('track_status');
            }}
            className="rounded-3xl bg-gradient-to-br from-cyan-600 via-sky-500 to-cyan-800 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
          >
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Clock className="w-44 h-44 text-white" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-cyan-100 mb-3 border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>เช็คความคืบหน้าแบบเรียลไทม์</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-100 transition-colors">
                1. ติดตามสถานะ
              </h2>
              <p className="text-xs sm:text-sm text-cyan-50 mt-2 leading-relaxed">
                ตรวจสอบสถานะงานซ่อมแบบเรียลไทม์ ติดตามขั้นตอนของช่าง ดูบันทึกการแก้ไข และประเมินเวลาแล้วเสร็จ
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
              <div className="text-xs text-cyan-100">
                {userActiveRepairs.length > 0 ? (
                  <span className="font-semibold text-amber-300">
                    กำลังดำเนินการ {userActiveRepairs.length} รายการ
                  </span>
                ) : (
                  <span className="text-cyan-200">ไม่มีงานค้างอยู่ในระบบ</span>
                )}
              </div>
              <button
                id="btn-panel-track-status"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (userActiveRepairs.length > 0) {
                    setSelectedTicketId(userActiveRepairs[0].id);
                  }
                  setActiveView('track_status');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-cyan-800 hover:bg-cyan-50 active:bg-cyan-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                <span>ติดตามสถานะ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel 2: ประวัติการซ่อม */}
          <div
            id="panel-repair-history"
            onClick={() => setActiveView('repair_history')}
            className="rounded-3xl bg-gradient-to-br from-emerald-700 via-green-600 to-emerald-900 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
          >
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <History className="w-44 h-44 text-white" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-emerald-100 mb-3 border border-white/10">
                <History className="w-3.5 h-3.5" />
                <span>บันทึกการซ่อมย้อนหลัง</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-100 transition-colors">
                2. ประวัติการซ่อม
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
                ดูรายการซ่อมที่เสร็จสิ้นสมบูรณ์ บันทึกการเปลี่ยนชิ้นส่วนอะไหล่ เอกสารปิดงาน และผลประเมินความพึงพอใจ
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
              <div className="text-xs text-emerald-100">
                {userCompletedRepairs.length > 0 ? (
                  <span className="font-semibold text-white">
                    ซ่อมเสร็จสิ้น {userCompletedRepairs.length} รายการ
                  </span>
                ) : (
                  <span className="text-emerald-200">พร้อมเรียกดูประวัติ</span>
                )}
              </div>
              <button
                id="btn-panel-repair-history"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('repair_history');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                <span>ดูประวัติการซ่อม</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel 3: แชตคุยกับช่าง */}
          <div
            id="panel-chat-tech"
            onClick={() => setActiveView('chat')}
            className="rounded-3xl bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border border-white/10"
          >
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <MessageSquare className="w-44 h-44 text-white" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-purple-100 mb-3 border border-white/10">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>สนทนาและปรึกษาโดยตรง</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-100 transition-colors">
                3. แชตคุยกับช่าง
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
                สนทนาสอบถามอาการ ปรึกษาข้อขัดข้อง ส่งภาพถ่ายความเสียหายเพิ่มเติม หรือนัดหมายช่างไอทีผู้รับผิดชอบงาน
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
              <div className="text-xs text-purple-100">
                {unreadMessagesCount > 0 ? (
                  <span className="font-semibold text-amber-300">
                    มี {unreadMessagesCount} ข้อความใหม่
                  </span>
                ) : (
                  <span className="text-purple-200">ช่าง IT พร้อมสนทนา</span>
                )}
              </div>
              <button
                id="btn-panel-chat-tech"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('chat');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-800 hover:bg-purple-50 active:bg-purple-100 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                <span>เปิดห้องแชต</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN VIEW ================= */}
      {currentRole === 'admin' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">แจ้งซ่อมทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{adminTotal}</p>
              <p className="text-[11px] text-slate-400 mt-1">รายการสะสมในระบบ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">งานที่กำลังดำเนินการ</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{adminActive}</p>
              <p className="text-[11px] text-blue-600 mt-1">ค้างอยู่ในระบบ</p>
            </div>

            <div
              onClick={() => setActiveView('monthly_expenses')}
              className="bg-white p-5 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold text-blue-900 group-hover:text-blue-600">ค่าซ่อมสะสมรวม</span>
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalRepairExpense.toLocaleString()} ฿</p>
              <span className="text-[10px] text-blue-600 font-medium group-hover:underline flex items-center gap-1 mt-1">
                สรุปค่าใช้จ่ายรายเดือน <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">อุปกรณ์คอมพิวเตอร์</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{equipmentList.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">ครุภัณฑ์ที่ลงทะเบียน</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-medium text-slate-500">คะแนนสุขภาพอุปกรณ์เฉลี่ย</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">82 / 100</p>
              <p className="text-[11px] text-emerald-700 mt-1">เกณฑ์ดี (Healthy)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
