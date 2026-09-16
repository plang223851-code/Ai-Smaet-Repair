import React, { useState } from 'react';
import { Users, Plus, Search, Edit3, Trash2, Shield, Wrench, User as UserIcon, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

export const UserManageView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setUsername(`user_${Date.now().toString().slice(-4)}`);
    setRole('user');
    setDepartment('สาขาวิชาวิทยาการคอมพิวเตอร์');
    setPhone('081-xxx-xxxx');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setUsername(u.username);
    setRole(u.role);
    setDepartment(u.department);
    setPhone(u.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateUser(editingId, { name, email, username, role, department, phone });
      setToastMessage(`แก้ไขข้อมูล "${name}" เรียบร้อยแล้ว`);
    } else {
      await addUser({ name, email, username, role, department, phone });
      setToastMessage(`เพิ่มผู้ใช้งาน "${name}" เรียบร้อยแล้ว`);
    }
    setTimeout(() => setToastMessage(null), 3000);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    const uName = deleteConfirmUser.name;
    try {
      await deleteUser(deleteConfirmUser.id);
      setToastMessage(`ลบผู้ใช้งาน "${uName}" เรียบร้อยแล้ว`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage(`เกิดข้อผิดพลาดในการลบผู้ใช้งาน`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmUser(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            การจัดการข้อมูลผู้ใช้งานและกำหนดสิทธิ์ (User & Role Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการบัญชีผู้ใช้ กำหนดบทบาทสิทธิ์ (RBAC) และข้อมูลแผนกสังกัด
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้ หรือ แผนก..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4">ชื่อผู้ใช้ / อีเมล</th>
                <th className="py-3.5 px-4">แผนก / สังกัด</th>
                <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                <th className="py-3.5 px-4">บทบาท (Role)</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-slate-700">{u.username}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{u.department}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.phone || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : u.role === 'technician'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role === 'admin'
                        ? 'ผู้ดูแลระบบ (Admin)'
                        : u.role === 'technician'
                        ? 'ช่างซ่อม (Technician)'
                        : 'ผู้แจ้งซ่อม (User)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      เปิดใช้งาน
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบข้อมูลผู้ใช้งาน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาทสิทธิ์ (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 border rounded-xl bg-white font-semibold"
                  >
                    <option value="user">ผู้แจ้งซ่อม (User)</option>
                    <option value="technician">ช่างซ่อม (Technician)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">อีเมลองค์กร</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">แผนก / สังกัด</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App User Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeleteConfirmUser(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  ยืนยันการลบข้อมูลผู้ใช้งาน
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  คุณต้องการลบบัญชีผู้ใช้งานนี้ออกจากระบบใช่หรือไม่? การกระทำนี้จะส่งผลให้ผู้ใช้รายนี้ไม่สามารถเข้าใช้งานระบบได้อีก
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ชื่อ-นามสกุล:</span>
                <span className="font-semibold text-slate-800">{deleteConfirmUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ชื่อบัญชี (Username):</span>
                <span className="font-mono text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded text-[11px]">
                  {deleteConfirmUser.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">แผนก / สังกัด:</span>
                <span className="text-slate-600">{deleteConfirmUser.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">บทบาทสิทธิ์:</span>
                <span className="font-semibold text-indigo-700">
                  {deleteConfirmUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : deleteConfirmUser.role === 'technician' ? 'ช่างเทคนิค (Technician)' : 'ผู้ใช้งานทั่วไป (User)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>กำลังลบ...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยืนยันลบผู้ใช้งาน</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success/Info Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs backdrop-blur-sm border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
