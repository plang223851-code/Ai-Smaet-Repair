import React, { useState } from 'react';
import { Laptop, Plus, Search, Trash2, Edit3, CheckCircle2, AlertTriangle, Save, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Equipment } from '../types';

export const EquipmentManageView: React.FC = () => {
  const { equipmentList, addEquipment, updateEquipment, deleteEquipment } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  const [brand, setBrand] = useState('DELL');
  const [model, setModel] = useState('OptiPlex 7090');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('อาคาร 1');
  const [room, setRoom] = useState('ห้อง 101');
  const [status, setStatus] = useState<'active' | 'in_repair' | 'retired'>('active');

  const filtered = equipmentList.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.room.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`EQ-${Date.now().toString().slice(-4)}`);
    setName('');
    setType('คอมพิวเตอร์ตั้งโต๊ะ (PC)');
    setBrand('');
    setModel('');
    setSerialNumber(`SN-${Date.now().toString().slice(-6)}`);
    setLocation('อาคาร 1');
    setRoom('ห้อง 101');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setCode(eq.code);
    setName(eq.name);
    setType(eq.type);
    setBrand(eq.brand || '');
    setModel(eq.model || '');
    setSerialNumber(eq.serialNumber || '');
    setLocation(eq.location);
    setRoom(eq.room);
    setStatus(eq.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateEquipment(editingId, {
        code,
        name,
        type,
        brand,
        model,
        serialNumber,
        location,
        room,
        status
      });
      setToastMessage(`แก้ไขข้อมูล "${name}" เรียบร้อยแล้ว`);
    } else {
      await addEquipment({
        code,
        name,
        type,
        brand,
        model,
        serialNumber,
        location,
        room,
        status
      });
      setToastMessage(`เพิ่มอุปกรณ์ "${name}" เรียบร้อยแล้ว`);
    }
    setTimeout(() => setToastMessage(null), 3000);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    const itemName = deleteConfirmItem.name;
    try {
      await deleteEquipment(deleteConfirmItem.id);
      setToastMessage(`ลบอุปกรณ์ "${itemName}" ออกจากระบบเรียบร้อยแล้ว`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage(`เกิดข้อผิดพลาดในการลบอุปกรณ์`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-600" />
            การจัดการข้อมูลอุปกรณ์และครุภัณฑ์ (Equipment Inventory)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ลงทะเบียนอุปกรณ์ เพิ่ม แก้ไข ตรวจสอบสถานะการใช้งาน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาอุปกรณ์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ลงทะเบียนอุปกรณ์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">รหัสอุปกรณ์</th>
                <th className="py-3.5 px-4">ชื่ออุปกรณ์</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">สถานที่ / ห้อง</th>
                <th className="py-3.5 px-4">คะแนนสุขภาพ</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{eq.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{eq.name}</div>
                    <div className="text-[10px] text-slate-400">{eq.brand} {eq.model}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{eq.type}</td>
                  <td className="py-3.5 px-4 text-slate-600">{eq.location} - {eq.room}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-600">{eq.healthScore}/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        eq.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : eq.status === 'in_repair'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {eq.status === 'active' ? 'พร้อมใช้งาน' : eq.status === 'in_repair' ? 'กำลังซ่อม' : 'ปลดประจำการ'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(eq)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบข้อมูลอุปกรณ์"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'แก้ไขข้อมูลอุปกรณ์' : 'ลงทะเบียนอุปกรณ์ใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสอุปกรณ์</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภท</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    <option value="คอมพิวเตอร์ตั้งโต๊ะ (PC)">คอมพิวเตอร์ตั้งโต๊ะ (PC)</option>
                    <option value="โน้ตบุ๊ก (Notebook)">โน้ตบุ๊ก (Notebook)</option>
                    <option value="เครื่องพิมพ์ (Printer)">เครื่องพิมพ์ (Printer)</option>
                    <option value="โปรเจกเตอร์ (Projector)">โปรเจกเตอร์ (Projector)</option>
                    <option value="อุปกรณ์เครือข่าย (Network)">อุปกรณ์เครือข่าย (Network)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่ออุปกรณ์</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รุ่น (Model)</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานที่/อาคาร</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                    required
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Works reliably in iframe without browser confirm) */}
      {deleteConfirmItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeleteConfirmItem(null)}
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
                  ยืนยันการลบข้อมูลอุปกรณ์
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  คุณต้องการลบอุปกรณ์นี้ออกจากระบบใช่หรือไม่? ข้อมูลประวัติและรายการที่เกี่ยวข้องจะถูกนำออกจากรายการอุปกรณ์
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">รหัสอุปกรณ์:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {deleteConfirmItem.code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ชื่ออุปกรณ์:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={deleteConfirmItem.name}>
                  {deleteConfirmItem.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">สถานที่ / ห้อง:</span>
                <span className="text-slate-600">{deleteConfirmItem.location} - {deleteConfirmItem.room}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmItem(null)}
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
                    <span>ยืนยันลบข้อมูล</span>
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
