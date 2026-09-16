import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Building,
  Laptop
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export const AdminAnalyticsView: React.FC = () => {
  const { repairs, equipmentList } = useApp();
  const [timeRange, setTimeRange] = useState('year');

  // Chart 1: Monthly repair trend
  const monthlyData = [
    { month: 'ม.ค.', total: 12, completed: 11, cost: 4200 },
    { month: 'ก.พ.', total: 19, completed: 17, cost: 7800 },
    { month: 'มี.ค.', total: 15, completed: 14, cost: 5600 },
    { month: 'เม.ย.', total: 8, completed: 8, cost: 2400 },
    { month: 'พ.ค.', total: 22, completed: 20, cost: 9500 },
    { month: 'มิ.ย.', total: 28, completed: 25, cost: 12000 },
    { month: 'ก.ค.', total: 24, completed: 22, cost: 8900 },
    { month: 'ส.ค.', total: 18, completed: 16, cost: 6500 },
    { month: 'ก.ย.', total: repairs.length, completed: repairs.filter(r => r.status === 'completed' || r.status === 'closed').length, cost: 4500 }
  ];

  // Chart 2: Category breakdown
  const categoryData = [
    { name: 'ฮาร์ดแวร์ (Hardware)', value: 18, color: '#3b82f6' },
    { name: 'ซอฟต์แวร์ (Software)', value: 12, color: '#10b981' },
    { name: 'เครือข่าย (Network)', value: 8, color: '#6366f1' },
    { name: 'เครื่องพิมพ์ (Printer)', value: 7, color: '#f59e0b' },
    { name: 'ระบบไฟฟ้า (Power)', value: 4, color: '#ef4444' }
  ];

  // Chart 3: Top failing equipment
  const topFailingEquipment = [
    { name: 'PC-001 (ห้อง 301)', count: 4 },
    { name: 'NB-002 (แล็บ 102)', count: 3 },
    { name: 'PRN-001 (ห้องการเงิน)', count: 2 },
    { name: 'PC-003 (ห้องธุรการ)', count: 2 },
    { name: 'PROJ-001 (ห้องประชุม)', count: 1 }
  ];

  // Chart 4: Department ticket distribution
  const departmentData = [
    { department: 'สาขาวิทยาการคอมพิวเตอร์', tickets: 14 },
    { department: 'ฝ่ายการเงินและพัสดุ', tickets: 9 },
    { department: 'งานธุรการกลาง', tickets: 6 },
    { department: 'งานห้องสมุดดิจิทัล', tickets: 4 },
    { department: 'ศูนย์ภาษาและการเรียนรู้', tickets: 3 }
  ];

  const totalCost = monthlyData.reduce((sum, item) => sum + item.cost, 0);

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'เลขที่งาน,อุปกรณ์,สถานที่,ความเร่งด่วน,สถานะ,วันที่แจ้ง\n' +
      repairs
        .map(
          (r) =>
            `${r.ticketNumber},"${r.equipmentName}","${r.room}",${r.urgency},${r.status},${r.createdAt.slice(0, 10)}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `repair_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            รายงานสถิติและการวิเคราะห์เชิงลึก (IT Maintenance Analytics)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ข้อมูลเปรียบเทียบสถิติการซ่อมบำรุง SLA ระยะเวลาเฉลี่ย และการจัดการต้นทุน
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                timeRange === 'quarter' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              ไตรมาสนี้
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                timeRange === 'year' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              ทั้งปี 2569
            </button>
          </div>

          {/* Export Report */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            เวลาเฉลี่ยในการซ่อม (MTTR)
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">1.8 <span className="text-sm font-normal text-slate-500">วัน</span></p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">เร็วขึ้น 18% จากเดือนก่อน</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            อัตราความสำเร็จ SLA
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">94.2%</p>
          <p className="text-[11px] text-slate-400 mt-1">เป้าหมายมาตรฐานองค์กร &gt; 90%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            รวมค่าใช้จ่ายซ่อมบำรุง
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {(totalCost ?? 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">บาท</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">ค่าอะไหล่และอุปกรณ์ทดแทน</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-amber-600" />
            อุปกรณ์ทั้งหมดในระบบ
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{equipmentList.length} <span className="text-sm font-normal text-slate-500">เครื่อง</span></p>
          <p className="text-[11px] text-slate-400 mt-1">ครุภัณฑ์คอมพิวเตอร์และต่อพ่วง</p>
        </div>
      </div>

      {/* Row 1: Monthly Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                สถิติการแจ้งซ่อมและงานที่เสร็จสิ้นรายเดือน
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">เปรียบเทียบยอดแจ้งซ่อมกับงานที่ปิดสมบูรณ์</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                แจ้งซ่อม
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                ซ่อมเสร็จ
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="total" name="แจ้งซ่อม" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="completed" name="ซ่อมเสร็จ" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              สัดส่วนประเภทปัญหาที่พบบ่อย (Problem Categories)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">แบ่งตามหมวดหมู่ของสาเหตุปัญหา</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Equipment with Most Failures & Department Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Failing Equipment */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              อุปกรณ์ที่เสียบ่อยที่สุด (Top Failure Equipment)
            </h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFailingEquipment} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} axisLine={false} tickLine={false} width={130} />
                <Tooltip />
                <Bar dataKey="count" name="จำนวนครั้งที่ซ่อม" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              แผนกที่แจ้งซ่อมมากที่สุด (Department Distribution)
            </h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="tickets" name="จำนวนรายการ" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
