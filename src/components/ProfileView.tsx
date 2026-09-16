import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building, Shield, Send, CheckCircle2, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUser, setIsLineModalOpen } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department);
  const [lineUserId, setLineUserId] = useState(currentUser.lineUserId || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(currentUser.id, { name, phone, department, lineUserId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/20"
          />
          <div>
            <h1 className="text-lg font-bold text-slate-900">{currentUser.name}</h1>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 capitalize">
              {currentUser.role === 'admin'
                ? 'ผู้ดูแลระบบ (Admin)'
                : currentUser.role === 'technician'
                ? 'ช่างซ่อม (Technician)'
                : 'ผู้แจ้งซ่อม (User)'}
            </span>
          </div>
        </div>

        {saved && (
          <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวสำเร็จ</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อ - สกุล</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">แผนก / สาขาวิชา</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          {/* LINE ID Connect */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                เชื่อมต่อบัญชี LINE เพื่อรับการแจ้งเตือนงานซ่อม
              </span>
              <button
                type="button"
                onClick={() => setIsLineModalOpen(true)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                ดูวิธีเชื่อมต่อ
              </button>
            </div>
            <input
              type="text"
              placeholder="LINE User ID (เช่น U1234567890abcdef...)"
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-[11px]"
            />
            <p className="text-[10px] text-emerald-700">
              ข้อความสถานะงานซ่อมจะถูกส่งไปยัง LINE อัตโนมัติเมื่อช่างมีความเคลื่อนไหว
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
