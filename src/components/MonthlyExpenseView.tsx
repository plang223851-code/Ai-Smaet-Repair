import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Printer,
  Plus,
  Edit3,
  Search,
  Wrench,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  FileText,
  Building,
  User,
  Trash2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { RepairRequest, PartUsed } from '../types';

const MONTH_NAMES_TH = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
];

const MONTH_SHORT_TH = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.'
];

const PIE_COLORS = ['#2563eb', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const MonthlyExpenseView: React.FC = () => {
  const {
    repairs,
    currentRole,
    currentUser,
    switchRole,
    setActiveView,
    setSelectedTicketId,
    updateRepairStatus
  } = useApp();

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or '0'..'11'
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [editingRepair, setEditingRepair] = useState<RepairRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Form state for edit expense modal
  const [modalLaborCost, setModalLaborCost] = useState<number>(0);
  const [modalParts, setModalParts] = useState<PartUsed[]>([]);
  const [modalNotes, setModalNotes] = useState<string>('');

  // Role Gate: Only Admin and Technician
  if (currentRole === 'user') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) และช่างซ่อม (Technician)
        </h2>
        <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
          หน้ารายงานสรุปค่าใช้จ่ายในการซ่อมแต่ละเดือนเป็นส่วนงานบริหารจัดการงบประมาณและข้อมูลการเบิกจ่ายอะไหล่
          หากคุณเป็นเจ้าหน้าที่ กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            กลับสู่แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveView('login')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition cursor-pointer shadow-sm shadow-blue-200"
          >
            เข้าสู่ระบบเจ้าหน้าที่
          </button>
        </div>
      </div>
    );
  }

  // Parse helper: calculate parts total and labor total for any repair
  const calculateRepairFinance = (repair: RepairRequest) => {
    const partsTotal =
      repair.partsUsed?.reduce(
        (sum, p) => sum + (p.totalPrice !== undefined ? p.totalPrice : p.quantity * p.unitPrice),
        0
      ) || 0;

    const totalCost = repair.repairCost !== undefined ? repair.repairCost : partsTotal;
    const laborCost = Math.max(0, totalCost - partsTotal);

    const date = new Date(repair.completedAt || repair.updatedAt || repair.createdAt);
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();

    return {
      totalCost,
      partsTotal,
      laborCost,
      partsCount: repair.partsUsed?.length || 0,
      month,
      year
    };
  };

  // Distinct list of categories, technicians, and departments
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    repairs.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats);
  }, [repairs]);

  const availableTechnicians = useMemo(() => {
    const techs = new Set<string>();
    repairs.forEach((r) => {
      if (r.technicianName) techs.add(r.technicianName);
    });
    return Array.from(techs);
  }, [repairs]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    repairs.forEach((r) => {
      if (r.userDepartment) depts.add(r.userDepartment);
    });
    return Array.from(depts);
  }, [repairs]);

  // Filtered repairs based on user selection
  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const finance = calculateRepairFinance(repair);

      // Match year
      if (finance.year !== selectedYear) return false;

      // Match month if not 'all'
      if (selectedMonth !== 'all' && finance.month !== parseInt(selectedMonth, 10)) {
        return false;
      }

      // Match category
      if (selectedCategory !== 'all' && repair.category !== selectedCategory) {
        return false;
      }

      // Match technician
      if (selectedTechnician !== 'all' && repair.technicianName !== selectedTechnician) {
        return false;
      }

      // Match department
      if (selectedDepartment !== 'all' && repair.userDepartment !== selectedDepartment) {
        return false;
      }

      // Match search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTicket = repair.ticketNumber?.toLowerCase().includes(q);
        const matchEqName = repair.equipmentName?.toLowerCase().includes(q);
        const matchEqCode = repair.equipmentCode?.toLowerCase().includes(q);
        const matchDept = repair.userDepartment?.toLowerCase().includes(q);
        const matchTech = repair.technicianName?.toLowerCase().includes(q);
        const matchParts = repair.partsUsed?.some((p) => p.name.toLowerCase().includes(q));
        if (!matchTicket && !matchEqName && !matchEqCode && !matchDept && !matchTech && !matchParts) {
          return false;
        }
      }

      return true;
    });
  }, [
    repairs,
    selectedYear,
    selectedMonth,
    selectedCategory,
    selectedTechnician,
    selectedDepartment,
    searchQuery
  ]);

  // Financial aggregates for currently filtered repairs
  const aggregates = useMemo(() => {
    let totalCost = 0;
    let totalPartsCost = 0;
    let totalLaborCost = 0;
    let totalPartsCount = 0;
    let repairsWithCostCount = 0;

    filteredRepairs.forEach((r) => {
      const f = calculateRepairFinance(r);
      totalCost += f.totalCost;
      totalPartsCost += f.partsTotal;
      totalLaborCost += f.laborCost;
      totalPartsCount += f.partsCount;
      if (f.totalCost > 0) repairsWithCostCount += 1;
    });

    const averageCost = repairsWithCostCount > 0 ? Math.round(totalCost / repairsWithCostCount) : 0;

    return {
      totalCost,
      totalPartsCost,
      totalLaborCost,
      totalPartsCount,
      repairsWithCostCount,
      averageCost
    };
  }, [filteredRepairs]);

  // Monthly 12-month data for charts and overview table (for selected year)
  const monthlyBreakdown = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES_TH[i],
      shortName: MONTH_SHORT_TH[i],
      ticketCount: 0,
      completedCount: 0,
      partsCost: 0,
      laborCost: 0,
      totalCost: 0
    }));

    repairs.forEach((r) => {
      const f = calculateRepairFinance(r);
      if (f.year === selectedYear && f.month >= 0 && f.month < 12) {
        months[f.month].ticketCount += 1;
        if (r.status === 'completed' || r.status === 'closed') {
          months[f.month].completedCount += 1;
        }
        months[f.month].partsCost += f.partsTotal;
        months[f.month].laborCost += f.laborCost;
        months[f.month].totalCost += f.totalCost;
      }
    });

    return months;
  }, [repairs, selectedYear]);

  // Category breakdown for Pie Chart
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();

    filteredRepairs.forEach((r) => {
      const f = calculateRepairFinance(r);
      const cat = r.equipmentType || r.category || 'อื่นๆ';
      const currentVal = map.get(cat) || 0;
      map.set(cat, currentVal + f.totalCost);
    });

    const data = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // If empty or all 0, provide clean placeholder data
    if (data.length === 0) {
      return [
        { name: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)', value: 1250 },
        { name: 'เครื่องพิมพ์ (Printer)', value: 650 },
        { name: 'โปรเจกเตอร์ (Projector)', value: 420 },
        { name: 'โน้ตบุ๊ก (Notebook)', value: 1850 }
      ];
    }

    return data;
  }, [filteredRepairs]);

  // Top spending departments
  const departmentBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredRepairs.forEach((r) => {
      const f = calculateRepairFinance(r);
      const dept = r.userDepartment || 'ทั่วไป';
      const curr = map.get(dept) || 0;
      map.set(dept, curr + f.totalCost);
    });

    return Array.from(map.entries())
      .map(([department, total]) => ({ department, total }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredRepairs]);

  // Open Edit Expense Modal
  const handleOpenEditModal = (repair: RepairRequest) => {
    setEditingRepair(repair);
    const finance = calculateRepairFinance(repair);
    setModalLaborCost(finance.laborCost);
    setModalParts(
      repair.partsUsed && repair.partsUsed.length > 0
        ? [...repair.partsUsed]
        : []
    );
    setModalNotes(repair.technicianNotes || '');
    setIsEditModalOpen(true);
  };

  // Add new part row in modal
  const handleAddPartRow = () => {
    const newPart: PartUsed = {
      id: `p-${Date.now()}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setModalParts([...modalParts, newPart]);
  };

  // Update part row in modal
  const handleUpdatePartRow = (index: number, field: keyof PartUsed, val: any) => {
    const updated = [...modalParts];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(val) : updated[index].quantity;
      const u = field === 'unitPrice' ? Number(val) : updated[index].unitPrice;
      updated[index].totalPrice = q * u;
    }
    setModalParts(updated);
  };

  // Remove part row
  const handleRemovePartRow = (index: number) => {
    setModalParts(modalParts.filter((_, i) => i !== index));
  };

  // Save Expense Changes
  const handleSaveExpenses = async () => {
    if (!editingRepair) return;

    const partsTotal = modalParts.reduce(
      (sum, p) => sum + (p.totalPrice !== undefined ? p.totalPrice : p.quantity * p.unitPrice),
      0
    );
    const totalRepairCost = partsTotal + Number(modalLaborCost || 0);

    try {
      await updateRepairStatus(editingRepair.id, editingRepair.status, 'อัปเดตข้อมูลค่าใช้จ่ายและอะไหล่', {
        partsUsed: modalParts,
        repairCost: totalRepairCost,
        technicianNotes: modalNotes
      });

      setSaveSuccessMsg(`บันทึกค่าใช้จ่ายงาน ${editingRepair.ticketNumber} สำเร็จ (${totalRepairCost.toLocaleString()} บาท)`);
      setIsEditModalOpen(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Failed to update repair cost', e);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'เลขที่งาน',
      'วันที่',
      'อุปกรณ์',
      'รหัสครุภัณฑ์',
      'แผนก/หน่วยงาน',
      'ผู้แจ้ง',
      'ช่างผู้ดูแล',
      'สถานะ',
      'รายการอะไหล่',
      'ค่าอะไหล่ (บาท)',
      'ค่าบริการ/แรง (บาท)',
      'ค่าใช้จ่ายรวม (บาท)'
    ];

    const rows = filteredRepairs.map((r) => {
      const f = calculateRepairFinance(r);
      const partsNames = r.partsUsed?.map((p) => `${p.name} (${p.quantity}x${p.unitPrice})`).join('; ') || '-';
      const dateStr = new Date(r.completedAt || r.updatedAt || r.createdAt).toLocaleDateString('th-TH');

      return [
        `"${r.ticketNumber}"`,
        `"${dateStr}"`,
        `"${r.equipmentName || ''}"`,
        `"${r.equipmentCode || ''}"`,
        `"${r.userDepartment || ''}"`,
        `"${r.userName || ''}"`,
        `"${r.technicianName || 'ยังไม่กำหนด'}"`,
        `"${r.status}"`,
        `"${partsNames}"`,
        f.partsTotal,
        f.laborCost,
        f.totalCost
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานค่าใช้จ่ายซ่อม_${selectedYear}_${selectedMonth === 'all' ? 'ทั้งปี' : MONTH_NAMES_TH[parseInt(selectedMonth)]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl text-white p-5 sm:p-6 shadow-md border border-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/30 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/30">
              <Receipt className="w-3.5 h-3.5 text-blue-300" />
              <span>ระบบบัญชีและงบประมาณการซ่อมแซม</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>สรุปค่าใช้จ่ายในการซ่อมแต่ละเดือน</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
              รายงานสถิติงบประมาณ ค่าอะไหล่ ค่าบริการซ่อม และแนวโน้มค่าใช้จ่ายประจำเดือน
              สำหรับผู้ดูแลระบบและทีมช่างซ่อม
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-xs"
              title="ส่งออกรายงานเป็นไฟล์ Excel / CSV"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 active:bg-blue-100 text-xs font-semibold transition-all cursor-pointer shadow-md"
              title="พิมพ์ใบรายงานสรุปค่าใช้จ่ายประจำเดือน"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>พิมพ์รายงานสรุป</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Cost */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">ค่าใช้จ่ายรวมทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {aggregates.totalCost.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {selectedMonth === 'all'
                ? `ทั้งปี ${selectedYear}`
                : `${MONTH_NAMES_TH[parseInt(selectedMonth, 10)]} ${selectedYear}`}
            </span>
          </div>
        </div>

        {/* Parts Cost */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">ค่าอะไหล่และอุปกรณ์</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight">
            {aggregates.totalPartsCost.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>คิดเป็น {aggregates.totalCost > 0 ? Math.round((aggregates.totalPartsCost / aggregates.totalCost) * 100) : 0}% ของยอดรวม</span>
            <span className="text-indigo-700 font-medium">{aggregates.totalPartsCount} ชิ้นส่วน</span>
          </div>
        </div>

        {/* Labor / Service Cost */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">ค่าบริการและแรงช่าง</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
            {aggregates.totalLaborCost.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>คิดเป็น {aggregates.totalCost > 0 ? Math.round((aggregates.totalLaborCost / aggregates.totalCost) * 100) : 0}% ของยอดรวม</span>
            <span className="text-emerald-700 font-medium">ค่าแรงบริการ</span>
          </div>
        </div>

        {/* Average Cost per Ticket */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">เฉลี่ยต่องานซ่อม</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
            {aggregates.averageCost.toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท/งาน</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>จากงานซ่อมที่มีค่าใช้จ่าย</span>
            <span className="font-semibold text-slate-800">{aggregates.repairsWithCostCount} งาน</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>ตัวกรองข้อมูลสรุปค่าใช้จ่าย</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ปีงบประมาณ</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={2026}>ปี 2026 (พ.ศ. 2569)</option>
              <option value={2025}>ปี 2025 (พ.ศ. 2568)</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ประจำเดือน</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">ทุกเดือน (ภาพรวมทั้งปี)</option>
              {MONTH_NAMES_TH.map((m, idx) => (
                <option key={idx} value={String(idx)}>
                  {m} ({monthlyBreakdown[idx].totalCost > 0 ? `${monthlyBreakdown[idx].totalCost.toLocaleString()} บ.` : '0 บ.'})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ประเภทงาน/อุปกรณ์</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">ทุกประเภท</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Technician Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ช่างผู้รับผิดชอบ</label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">ช่างทุกคน</option>
              {availableTechnicians.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ค้นหา</label>
            <div className="relative">
              <input
                type="text"
                placeholder="เลขที่งาน, อุปกรณ์, อะไหล่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active filter tags */}
        {(selectedMonth !== 'all' || selectedCategory !== 'all' || selectedTechnician !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            <span className="text-[11px] text-slate-500">กรองข้อมูลอยู่:</span>
            {selectedMonth !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                เดือน: {MONTH_NAMES_TH[parseInt(selectedMonth, 10)]}
                <button onClick={() => setSelectedMonth('all')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
                หมวด: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTechnician !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                ช่าง: {selectedTechnician}
                <button onClick={() => setSelectedTechnician('all')} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                ค้นหา: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedCategory('all');
                setSelectedTechnician('all');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-red-600 underline ml-auto cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Cost Trend (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>แนวโน้มค่าใช้จ่ายในการซ่อมรายเดือน (ปี {selectedYear})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบสัดส่วนระหว่างค่าอะไหล่และค่าบริการ/ค่าแรงในแต่ละเดือน
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              หน่วย: บาท
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${Number(val).toLocaleString()} บาท`,
                    name === 'partsCost' ? 'ค่าอะไหล่' : name === 'laborCost' ? 'ค่าบริการ/แรง' : 'รวม'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload && payload[0] ? payload[0].payload : null;
                    return item ? `เดือน ${item.monthName} ${selectedYear}` : label;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) =>
                    value === 'partsCost' ? 'ค่าอะไหล่' : value === 'laborCost' ? 'ค่าบริการ/แรง' : value
                  }
                />
                <Bar dataKey="partsCost" name="partsCost" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="laborCost" name="laborCost" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense by Equipment Category (Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>สัดส่วนค่าใช้จ่ายตามประเภทอุปกรณ์</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              หมวดหมู่อุปกรณ์ที่ใช้งบประมาณซ่อมบำรุงสูงสุด
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} บาท`, 'ค่าใช้จ่าย']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
            {categoryBreakdown.slice(0, 4).map((item, idx) => {
              const pct = aggregates.totalCost > 0 ? Math.round((item.value / aggregates.totalCost) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="font-semibold text-slate-900 shrink-0 ml-2">
                    {item.value.toLocaleString()} บ. <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table (12 Months Breakdown) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>ตารางสรุปงบประมาณค่าใช้จ่ายรายเดือน (ปี {selectedYear})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงยอดสรุปจำนวนงานซ่อม ค่าอะไหล่ และค่าบริการในแต่ละเดือน สามารถคลิกดูรายการเฉพาะเดือนได้
            </p>
          </div>
          <span className="text-xs text-slate-500">
            แสดงทั้งหมด 12 เดือน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">เดือน</th>
                <th className="py-3 px-3 text-center">จำนวนงานซ่อม</th>
                <th className="py-3 px-3 text-center">ซ่อมเสร็จแล้ว</th>
                <th className="py-3 px-4 text-right">ค่าอะไหล่ (บาท)</th>
                <th className="py-3 px-4 text-right">ค่าบริการ/แรง (บาท)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">รวมค่าใช้จ่าย (บาท)</th>
                <th className="py-3 px-3 text-center">สัดส่วนทั้งปี</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map((m) => {
                const yearTotal = monthlyBreakdown.reduce((sum, item) => sum + item.totalCost, 0);
                const percentOfYear = yearTotal > 0 ? ((m.totalCost / yearTotal) * 100).toFixed(1) : '0.0';
                const isSelected = selectedMonth === String(m.monthIndex);

                return (
                  <tr
                    key={m.monthIndex}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isSelected ? 'bg-blue-50/70 font-semibold text-blue-900' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {m.monthIndex + 1}
                      </span>
                      <span>{m.monthName}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{m.ticketCount} งาน</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                        {m.completedCount} งาน
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {m.partsCost > 0 ? m.partsCost.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {m.laborCost > 0 ? m.laborCost.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {m.totalCost > 0 ? `${m.totalCost.toLocaleString()} ฿` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, Number(percentOfYear))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{percentOfYear}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedMonth(isSelected ? 'all' : String(m.monthIndex))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'กำลังดู' : 'ดูรายการ'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="py-3.5 px-4 text-sm font-bold">รวมทั้งสิ้น (Grand Total)</td>
                <td className="py-3.5 px-3 text-center font-bold">
                  {monthlyBreakdown.reduce((sum, item) => sum + item.ticketCount, 0)} งาน
                </td>
                <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                  {monthlyBreakdown.reduce((sum, item) => sum + item.completedCount, 0)} งาน
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                  {monthlyBreakdown.reduce((sum, item) => sum + item.partsCost, 0).toLocaleString()} ฿
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                  {monthlyBreakdown.reduce((sum, item) => sum + item.laborCost, 0).toLocaleString()} ฿
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700 text-base">
                  {monthlyBreakdown.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()} ฿
                </td>
                <td className="py-3.5 px-3 text-center text-xs text-slate-600">100%</td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => setSelectedMonth('all')}
                    className="text-xs text-blue-700 hover:underline cursor-pointer"
                  >
                    ดูทุกเดือน
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Detailed Repair Tickets & Parts Expense List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>
                รายละเอียดรายการงานแจ้งซ่อมและค่าใช้จ่าย (
                {selectedMonth === 'all'
                  ? `ทั้งปี ${selectedYear}`
                  : `เดือน ${MONTH_NAMES_TH[parseInt(selectedMonth, 10)]}`}
                )
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              พบ {filteredRepairs.length} รายการงานซ่อม (ช่างซ่อมและผู้ดูแลระบบสามารถคลิกปุ่มแก้ไขเพื่อบันทึกอะไหล่และค่าใช้จ่าย)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              ยอดรวมตารางนี้:{' '}
              <strong className="text-blue-700 text-sm">
                {aggregates.totalCost.toLocaleString()} บาท
              </strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">เลขที่งาน / วันที่</th>
                <th className="py-3 px-4">อุปกรณ์ & สถานที่</th>
                <th className="py-3 px-4">ผู้แจ้ง / แผนก</th>
                <th className="py-3 px-4">ช่างซ่อม</th>
                <th className="py-3 px-4">รายการอะไหล่ที่เปลี่ยน</th>
                <th className="py-3 px-3 text-right">ค่าอะไหล่</th>
                <th className="py-3 px-3 text-right">ค่าบริการ</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">รวมค่าใช้จ่าย</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">ไม่พบรายการงานซ่อมตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนเดือนหรือล้างตัวกรองเพื่อดูข้อมูลทั้งหมด</p>
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((r) => {
                  const finance = calculateRepairFinance(r);
                  const dateStr = new Date(r.completedAt || r.updatedAt || r.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket & Date */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 block text-xs">
                          {r.ticketNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </td>

                      {/* Equipment & Location */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.equipmentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.equipmentCode} • {r.location} {r.room}
                        </div>
                      </td>

                      {/* User & Department */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{r.userName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{r.userDepartment}</div>
                      </td>

                      {/* Technician */}
                      <td className="py-3 px-4">
                        {r.technicianName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-800 font-medium">{r.technicianName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">ยังไม่มอบหมาย</span>
                        )}
                      </td>

                      {/* Parts Used */}
                      <td className="py-3 px-4">
                        {r.partsUsed && r.partsUsed.length > 0 ? (
                          <div className="space-y-1">
                            {r.partsUsed.map((p, pIdx) => (
                              <div key={pIdx} className="text-[11px] text-slate-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="font-medium truncate max-w-[160px]">{p.name}</span>
                                <span className="text-slate-400">
                                  ({p.quantity} x {p.unitPrice.toLocaleString()})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ไม่มีการเปลี่ยนอะไหล่ -</span>
                        )}
                      </td>

                      {/* Parts Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {finance.partsTotal > 0 ? `${finance.partsTotal.toLocaleString()} ฿` : '-'}
                      </td>

                      {/* Labor Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {finance.laborCost > 0 ? `${finance.laborCost.toLocaleString()} ฿` : '-'}
                      </td>

                      {/* Total Cost */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-blue-800 text-sm">
                          {finance.totalCost > 0 ? `${finance.totalCost.toLocaleString()} ฿` : '-'}
                        </div>
                        {finance.totalCost === 0 && (
                          <span className="text-[10px] text-slate-400 font-normal">ไม่มีค่าใช้จ่าย</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer border border-blue-200"
                            title="บันทึกหรือแก้ไขค่าอะไหล่และค่าใช้จ่าย"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>บันทึกค่าใช้จ่าย</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTicketId(r.id);
                              setActiveView('track_status');
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="ดูรายละเอียดใบงานแจ้งซ่อม"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Record Repair Expense Modal */}
      {isEditModalOpen && editingRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                  บันทึกค่าใช้จ่าย
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  แก้ไขค่าใช้จ่ายและอะไหล่: {editingRepair.ticketNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingRepair.equipmentName} ({editingRepair.equipmentCode})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Parts Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>รายการอะไหล่และชิ้นส่วนที่เปลี่ยน</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPartRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มอะไหล่</span>
                  </button>
                </div>

                {modalParts.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    ยังไม่มีรายการอะไหล่ คลิก "เพิ่มอะไหล่" หากมีการเบิกใช้อุปกรณ์ทดแทน
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modalParts.map((part, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <input
                          type="text"
                          placeholder="ชื่ออะไหล่ (เช่น RAM DDR4 8GB)"
                          value={part.name}
                          onChange={(e) => handleUpdatePartRow(index, 'name', e.target.value)}
                          className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <input
                              type="number"
                              min="1"
                              placeholder="จำนวน"
                              value={part.quantity}
                              onChange={(e) => handleUpdatePartRow(index, 'quantity', Number(e.target.value))}
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                              title="จำนวนชิ้น"
                            />
                          </div>
                          <div className="w-28">
                            <input
                              type="number"
                              min="0"
                              placeholder="ราคา/หน่วย"
                              value={part.unitPrice}
                              onChange={(e) => handleUpdatePartRow(index, 'unitPrice', Number(e.target.value))}
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              title="ราคาต่อหน่วย (บาท)"
                            />
                          </div>
                          <span className="text-xs font-mono font-semibold text-slate-700 w-20 text-right">
                            {((part.totalPrice ?? part.quantity * part.unitPrice) || 0).toLocaleString()} ฿
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePartRow(index)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labor / Service Cost */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ค่าบริการและแรงช่าง (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  value={modalLaborCost}
                  onChange={(e) => setModalLaborCost(Number(e.target.value))}
                  placeholder="เช่น 200, 350"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  หมายเหตุช่าง / รายละเอียดการเบิกจ่าย
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="เช่น เบิกจากคลังพัสดุกลาง หรือ ใบเสร็จเลขที่..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-900">ยอดรวมค่าใช้จ่ายทั้งหมดของงานนี้:</span>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    ค่าอะไหล่{' '}
                    {modalParts
                      .reduce((sum, p) => sum + (p.totalPrice ?? p.quantity * p.unitPrice), 0)
                      .toLocaleString()}{' '}
                    บ. + ค่าบริการ {Number(modalLaborCost || 0).toLocaleString()} บ.
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-blue-950">
                  {(
                    modalParts.reduce((sum, p) => sum + (p.totalPrice ?? p.quantity * p.unitPrice), 0) +
                    Number(modalLaborCost || 0)
                  ).toLocaleString()}{' '}
                  บาท
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveExpenses}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-sm shadow-blue-300"
              >
                บันทึกค่าใช้จ่าย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 max-h-[92vh] overflow-y-auto print:p-0">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  พิมพ์รายงานสรุปค่าใช้จ่ายในการซ่อมแซม
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์เอกสาร</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6">
              {/* Document Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  ใบสรุปรายงานค่าใช้จ่ายในการซ่อมบำรุงอุปกรณ์คอมพิวเตอร์
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  ศูนย์เทคโนโลยีสารสนเทศ • ระบบ Ai Smart Repair
                </p>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-4">
                  <span>
                    <strong>ประจำงวด:</strong>{' '}
                    {selectedMonth === 'all'
                      ? `ภาพรวมทั้งปี ${selectedYear}`
                      : `${MONTH_NAMES_TH[parseInt(selectedMonth, 10)]} ${selectedYear}`}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>วันที่พิมพ์เอกสาร:</strong>{' '}
                    {new Date().toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Financial summary metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-500 block">จำนวนงานซ่อมทั้งหมด</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {filteredRepairs.length} งาน
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">ค่าอะไหล่และชิ้นส่วน</span>
                  <span className="text-base font-bold text-indigo-700 mt-0.5 block">
                    {aggregates.totalPartsCost.toLocaleString()} บาท
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">งบประมาณรวมทั้งสิ้น</span>
                  <span className="text-base font-bold text-blue-800 mt-0.5 block">
                    {aggregates.totalCost.toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* Printable Table */}
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                    <th className="p-2 border border-slate-300">ลำดับ</th>
                    <th className="p-2 border border-slate-300">เลขที่งาน</th>
                    <th className="p-2 border border-slate-300">อุปกรณ์</th>
                    <th className="p-2 border border-slate-300">แผนก</th>
                    <th className="p-2 border border-slate-300">อะไหล่ที่เปลี่ยน</th>
                    <th className="p-2 border border-slate-300 text-right">ค่าอะไหล่</th>
                    <th className="p-2 border border-slate-300 text-right">ค่าบริการ</th>
                    <th className="p-2 border border-slate-300 text-right">รวมเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepairs.map((r, idx) => {
                    const f = calculateRepairFinance(r);
                    const partsStr = r.partsUsed?.map((p) => `${p.name} (${p.quantity}x${p.unitPrice})`).join(', ') || '-';
                    return (
                      <tr key={r.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold text-slate-800">
                          {r.ticketNumber}
                        </td>
                        <td className="p-2 border border-slate-300">{r.equipmentName}</td>
                        <td className="p-2 border border-slate-300">{r.userDepartment}</td>
                        <td className="p-2 border border-slate-300 text-[11px]">{partsStr}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono">
                          {f.partsTotal > 0 ? f.partsTotal.toLocaleString() : '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono">
                          {f.laborCost > 0 ? f.laborCost.toLocaleString() : '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                          {f.totalCost > 0 ? f.totalCost.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={5} className="p-2 border border-slate-300 text-right">
                      รวมค่าใช้จ่ายทั้งหมดสุทธิ
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-indigo-800">
                      {aggregates.totalPartsCost.toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-emerald-800">
                      {aggregates.totalLaborCost.toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-blue-900 text-sm">
                      {aggregates.totalCost.toLocaleString()} ฿
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs text-slate-700">
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-2 pb-8" />
                  <p className="font-semibold">ลงชื่อ ......................................................</p>
                  <p className="text-slate-500 mt-1">(ช่างประสิทธิ์ ซ่อมไว / ตัวแทนช่างซ่อม)</p>
                  <p className="text-slate-400 text-[10px]">ผู้บันทึกข้อมูลการซ่อมบำรุง</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-2 pb-8" />
                  <p className="font-semibold">ลงชื่อ ......................................................</p>
                  <p className="text-slate-500 mt-1">(ผอ.วิชัย ผู้ดูแลระบบ IT / ผู้มีอำนาจอนุมัติ)</p>
                  <p className="text-slate-400 text-[10px]">ผู้อนุมัติรายงานสรุปค่าใช้จ่าย</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
