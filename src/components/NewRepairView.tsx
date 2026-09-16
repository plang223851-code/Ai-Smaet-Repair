import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Laptop,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Tag,
  Edit3,
  Plus,
  Trash2,
  User,
  Phone,
  Building2,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS, URGENCY_CONFIG } from '../data/mockData';
import { ProblemCategory, UrgencyLevel, Attachment, AIDiagnosisResult } from '../types';
import { requestAIDiagnosis, getLocalDiagnosticRule } from '../utils/aiDiagnostic';

export const NewRepairView: React.FC = () => {
  const {
    equipmentList,
    currentUser,
    currentRole,
    addEquipment,
    deleteEquipment,
    createRepair,
    setActiveView,
    setSelectedTicketId,
    setIsLineModalOpen
  } = useApp();
  const aiResultRef = useRef<HTMLDivElement>(null);

  // Reporter State (ข้อมูลผู้แจ้งซ่อม - กรอกชื่อและเบอร์โทรได้ทันทีโดยไม่ต้องล็อกอิน)
  const [reporterName, setReporterName] = useState(() => {
    const saved = localStorage.getItem('repair_reporter_name');
    if (saved) return saved;
    if (currentUser?.id && currentUser.id !== 'usr-guest' && currentUser.id !== 'usr-1') {
      return currentUser.name;
    }
    return '';
  });
  const [reporterPhone, setReporterPhone] = useState(() => {
    const saved = localStorage.getItem('repair_reporter_phone');
    if (saved) return saved;
    if (currentUser?.phone && currentUser.id !== 'usr-guest' && currentUser.id !== 'usr-1') {
      return currentUser.phone;
    }
    return '';
  });
  const [reporterDepartment, setReporterDepartment] = useState(() => {
    const saved = localStorage.getItem('repair_reporter_dept');
    if (saved) return saved;
    if (currentUser?.department && currentUser.id !== 'usr-guest' && currentUser.id !== 'usr-1') {
      return currentUser.department;
    }
    return 'หน่วยงานทั่วไป';
  });
  const [reporterEmail, setReporterEmail] = useState(() => {
    const saved = localStorage.getItem('repair_reporter_email');
    if (saved) return saved;
    if (currentUser?.email && currentUser.id !== 'usr-guest' && currentUser.id !== 'usr-1') {
      return currentUser.email;
    }
    return '';
  });

  // Form State
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentList[0]?.id || '');
  const [equipmentCode, setEquipmentCode] = useState(equipmentList[0]?.code || '');
  const [equipmentName, setEquipmentName] = useState(equipmentList[0]?.name || '');
  const [equipmentType, setEquipmentType] = useState(equipmentList[0]?.type || 'คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  const [equipmentBrand, setEquipmentBrand] = useState(equipmentList[0]?.brand || '');
  const [equipmentModel, setEquipmentModel] = useState(equipmentList[0]?.model || '');
  const [location, setLocation] = useState(equipmentList[0]?.location || 'อาคารวิทยาการคอมพิวเตอร์');
  const [room, setRoom] = useState(equipmentList[0]?.room || 'ห้องแล็บ 301');

  // Quick Add Equipment Modal for Admin
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [newEqCode, setNewEqCode] = useState('');
  const [newEqName, setNewEqName] = useState('');
  const [newEqType, setNewEqType] = useState('คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  const [newEqBrand, setNewEqBrand] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqLocation, setNewEqLocation] = useState('อาคารวิทยาการคอมพิวเตอร์');
  const [newEqRoom, setNewEqRoom] = useState('ห้องแล็บ 301');
  const [isAddingEq, setIsAddingEq] = useState(false);

  // Sync selectedEquipmentId when equipmentList changes
  useEffect(() => {
    if (equipmentList.length > 0) {
      const current = equipmentList.find((e) => e.id === selectedEquipmentId);
      if (!current) {
        const first = equipmentList[0];
        setSelectedEquipmentId(first.id);
        setEquipmentCode(first.code);
        setEquipmentName(first.name);
        setEquipmentType(first.type);
        setEquipmentBrand(first.brand || '');
        setEquipmentModel(first.model || '');
        setLocation(first.location);
        setRoom(first.room);
      }
    } else {
      setSelectedEquipmentId('');
      setEquipmentCode('');
      setEquipmentName('');
      setLocation('');
      setRoom('');
    }
  }, [equipmentList, selectedEquipmentId]);

  const [category, setCategory] = useState<string>('ฮาร์ดแวร์ / อะไหล่ชำรุด');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [symptom, setSymptom] = useState('');
  const [notificationDate, setNotificationDate] = useState(new Date().toISOString().slice(0, 10));

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // AI Diagnosis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosisResult | null>(null);

  // Submission Status Modal
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Equipment Selection Change
  const handleEquipmentChange = (id: string) => {
    setSelectedEquipmentId(id);
    const eq = equipmentList.find((e) => e.id === id);
    if (eq) {
      setEquipmentCode(eq.code);
      setEquipmentName(eq.name);
      setEquipmentType(eq.type);
      setEquipmentBrand(eq.brand || '');
      setEquipmentModel(eq.model || '');
      setLocation(eq.location);
      setRoom(eq.room);
    }
  };

  const handleOpenAddEquipment = () => {
    setNewEqCode(`EQ-${Date.now().toString().slice(-4)}`);
    setNewEqName('');
    setNewEqType('คอมพิวเตอร์ตั้งโต๊ะ (PC)');
    setNewEqBrand('DELL');
    setNewEqModel('OptiPlex 7090');
    setNewEqLocation('อาคารวิทยาการคอมพิวเตอร์');
    setNewEqRoom('ห้องแล็บ 301');
    setIsAddEquipmentModalOpen(true);
  };

  const handleSaveQuickEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName.trim() || !newEqCode.trim()) {
      alert('กรุณากรอกรหัสและชื่ออุปกรณ์');
      return;
    }
    setIsAddingEq(true);
    try {
      const created = await addEquipment({
        code: newEqCode.trim(),
        name: newEqName.trim(),
        type: newEqType,
        brand: newEqBrand.trim(),
        model: newEqModel.trim(),
        location: newEqLocation.trim(),
        room: newEqRoom.trim(),
        status: 'active'
      });
      setSelectedEquipmentId(created.id);
      setEquipmentCode(created.code);
      setEquipmentName(created.name);
      setEquipmentType(created.type);
      setEquipmentBrand(created.brand || '');
      setEquipmentModel(created.model || '');
      setLocation(created.location);
      setRoom(created.room);
      setIsAddEquipmentModalOpen(false);
    } finally {
      setIsAddingEq(false);
    }
  };

  const handleDeleteCurrentEquipment = async () => {
    if (!selectedEquipmentId) return;
    const current = equipmentList.find((e) => e.id === selectedEquipmentId);
    if (!current) return;
    if (confirm(`คุณต้องการลบอุปกรณ์ "${current.name}" (${current.code}) ออกจากระบบใช่หรือไม่?`)) {
      await deleteEquipment(selectedEquipmentId);
    }
  };

  // Image Upload Handlers
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    Array.from(fileList).forEach((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WEBP เท่านั้น');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: file.name,
          url: e.target?.result as string,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Trigger AI Symptom Diagnosis (Text & Multimodal Images)
  const handleTriggerAIDiagnosis = async () => {
    if (!symptom.trim() && attachments.length === 0) {
      alert('กรุณากรอกรายละเอียดอาการเสีย หรือแนบรูปภาพปัญหาอย่างน้อย 1 รูป เพื่อให้ AI เริ่มการวิเคราะห์');
      return;
    }

    setIsAnalyzing(true);
    try {
      const imageUrls = attachments.map((att) => att.url);
      const result = await requestAIDiagnosis(symptom.trim(), equipmentType, imageUrls);
      setAiDiagnosis(result);
      // If user hasn't typed a symptom, auto-fill it with AI's diagnosis summary
      if (!symptom.trim() && result.symptomSummary) {
        setSymptom(result.symptomSummary);
      }
      setTimeout(() => {
        aiResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.warn('AI diagnosis request failed, using instant smart rule fallback:', err);
      const fallback = getLocalDiagnosticRule(symptom.trim() || 'ตรวจวิเคราะห์จากภาพถ่ายปัญหาที่แนบมา', equipmentType);
      setAiDiagnosis(fallback);
      if (!symptom.trim() && fallback.symptomSummary) {
        setSymptom(fallback.symptomSummary);
      }
      setTimeout(() => {
        aiResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุลผู้แจ้งซ่อม');
      return;
    }
    if (!reporterPhone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (!category.trim()) {
      alert('กรุณากรอกประเภทปัญหา (Category)');
      return;
    }
    if (!symptom.trim()) {
      alert('กรุณากรอกรายละเอียดอาการเสีย');
      return;
    }

    setIsSubmitting(true);
    try {
      try {
        localStorage.setItem('repair_reporter_name', reporterName.trim());
        localStorage.setItem('repair_reporter_phone', reporterPhone.trim());
        localStorage.setItem('repair_reporter_dept', reporterDepartment.trim());
        localStorage.setItem('repair_reporter_email', reporterEmail.trim());
      } catch {
        // ignore localStorage errors
      }

      const newRep = await createRepair({
        userName: reporterName.trim(),
        userPhone: reporterPhone.trim(),
        userDepartment: reporterDepartment.trim() || 'ทั่วไป',
        userEmail: reporterEmail.trim(),
        equipmentId: selectedEquipmentId,
        equipmentCode,
        equipmentName,
        equipmentType,
        equipmentBrand,
        equipmentModel,
        location,
        room,
        category,
        urgency,
        symptom,
        aiDiagnosis: aiDiagnosis || undefined,
        attachments
      });

      setCreatedTicket(newRep);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งแจ้งซ่อม');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                แบบฟอร์มแจ้งซ่อมอุปกรณ์คอมพิวเตอร์
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ไม่ต้องเข้าสู่ระบบ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              กรอกข้อมูลเพื่อส่งเรื่องถึงช่างเทคนิคได้ทันที พร้อมระบบวิเคราะห์อาการเสียอัจฉริยะ AI
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>กลับหน้าหลัก</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: ข้อมูลผู้แจ้งซ่อม (ไม่ต้องล็อกอิน) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              1. ข้อมูลผู้แจ้งซ่อม (Reporter Information)
            </h2>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200 inline-flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ไม่ต้องเข้าสู่ระบบ กรอกชื่อและเบอร์โทรเพื่อส่งแจ้งซ่อมได้ทันที
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ชื่อผู้แจ้งซ่อม */}
            <div>
              <label htmlFor="input-reporter-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อ-นามสกุล ผู้แจ้งซ่อม <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-reporter-name"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="เช่น นายสมชาย ใจดี หรือ อาจารย์สมชาย"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label htmlFor="input-reporter-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-reporter-phone"
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* แผนก / หน่วยงาน */}
            <div>
              <label htmlFor="input-reporter-dept" className="block text-xs font-semibold text-slate-700 mb-1.5">
                หน่วยงาน / แผนก / สาขาวิชา
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-reporter-dept"
                  type="text"
                  value={reporterDepartment}
                  onChange={(e) => setReporterDepartment(e.target.value)}
                  placeholder="เช่น สาขาวิทยาการคอมพิวเตอร์ หรือ สำนักงานคณบดี"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* อีเมลติดต่อ */}
            <div>
              <label htmlFor="input-reporter-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมลติดต่อ (ทางเลือก)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-reporter-email"
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="เช่น user@institution.ac.th"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: ข้อมูลอุปกรณ์และสถานที่ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Laptop className="w-4 h-4 text-blue-600" />
            2. ข้อมูลอุปกรณ์และสถานที่
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* เลือกอุปกรณ์ */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลือกอุปกรณ์ที่ลงทะเบียนในระบบ
              </label>
              <select
                id="select-equipment"
                value={selectedEquipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.room})
                  </option>
                ))}
              </select>
            </div>

            {/* ชื่ออุปกรณ์ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่ออุปกรณ์
              </label>
              <input
                type="text"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                required
              />
            </div>

            {/* ประเภทอุปกรณ์ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ประเภทอุปกรณ์
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="คอมพิวเตอร์ตั้งโต๊ะ (PC)">คอมพิวเตอร์ตั้งโต๊ะ (PC)</option>
                <option value="โน้ตบุ๊ก (Notebook)">โน้ตบุ๊ก (Notebook)</option>
                <option value="เครื่องพิมพ์ (Printer)">เครื่องพิมพ์ (Printer)</option>
                <option value="โปรเจกเตอร์ (Projector)">โปรเจกเตอร์ (Projector)</option>
                <option value="อุปกรณ์เครือข่าย (Network)">อุปกรณ์เครือข่าย (Network)</option>
                <option value="เครื่องสำรองไฟ (UPS)">เครื่องสำรองไฟ (UPS)</option>
                <option value="จอภาพ (Monitor)">จอภาพ (Monitor)</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            {/* สถานที่ / อาคาร */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                สถานที่ / อาคาร
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                  required
                />
              </div>
            </div>

            {/* ห้อง */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ห้อง / แผนก
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: ปัญหาและความเร่งด่วน */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            3. ประเภทปัญหาและระดับความเร่งด่วน
          </h2>

          {/* Problem Category Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-problem-category" className="block text-xs font-semibold text-slate-700">
                ประเภทปัญหา (Category) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                สามารถพิมพ์ข้อมูลได้เอง หรือคลิกเลือกตัวเลือกแนะนำ
              </span>
            </div>

            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-problem-category"
                type="text"
                list="category-suggestions-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="พิมพ์ประเภทปัญหา เช่น ฮาร์ดแวร์, จอฟ้า, ระบบเครือข่าย, ปริ้นเตอร์ไม่ออก, ติดไวรัส..."
                className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                required
              />
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  title="ล้างข้อความเพื่อพิมพ์ใหม่"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Datalist for autocomplete suggestions */}
            <datalist id="category-suggestions-list">
              <option value="ฮาร์ดแวร์ (Hardware) / อะไหล่ชำรุด" />
              <option value="ซอฟต์แวร์ (Software) / ระบบปฏิบัติการ" />
              <option value="ระบบเครือข่าย (Network) / อินเทอร์เน็ต / Wi-Fi" />
              <option value="อุปกรณ์ต่อพ่วง (Peripheral) / จอภาพ / สายสัญญาณ" />
              <option value="เครื่องพิมพ์ (Printer) / สแกนเนอร์ / หมึกพิมพ์" />
              <option value="ระบบไฟฟ้า (Power) / แบตเตอรี่ / สายชาร์จ / UPS" />
              <option value="เปิดเครื่องไม่ติด / เครื่องดับเอง" />
              <option value="จอฟ้า (Blue Screen of Death / BSOD)" />
              <option value="ไวรัส / มัลแวร์ / ความปลอดภัย" />
              <option value="เครื่องช้ามาก / ค้างบ่อย" />
              <option value="ความร้อนสูง / พัดลมเสียงดังผิดปกติ" />
            </datalist>

            {/* Quick Suggestion Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-slate-400" />
                ตัวเลือกแนะนำ:
              </span>
              {[
                'ฮาร์ดแวร์ / อะไหล่ชำรุด',
                'ซอฟต์แวร์ / Windows',
                'ระบบเครือข่าย / Wi-Fi',
                'จอภาพ / อุปกรณ์ต่อพ่วง',
                'เครื่องพิมพ์ / หมึก',
                'เปิดเครื่องไม่ติด / ดับเอง',
                'จอฟ้า (BSOD)',
                'ไวรัส / ความปลอดภัย'
              ].map((suggestion) => {
                const isSelected = category.trim() === suggestion;
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setCategory(suggestion)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    + {suggestion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ระดับความเร่งด่วน (Urgency Level)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(URGENCY_CONFIG) as UrgencyLevel[]).map((urgKey) => {
                const isSelected = urgency === urgKey;
                const meta = URGENCY_CONFIG[urgKey];
                return (
                  <button
                    key={urgKey}
                    type="button"
                    onClick={() => setUrgency(urgKey)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: แนบรูปภาพปัญหา (Multiple Photo Attachments) - อยู่ด้านบนเพื่อนำไปวิเคราะห์ด้วย AI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              4. แนบรูปภาพปัญหา (Multiple Photo Attachments)
            </h2>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              AI สามารถวิเคราะห์อาการจากรูปภาพได้
            </span>
          </div>

          <p className="text-xs text-slate-500">
            แนบภาพถ่ายหน้าจอแสดงผล รหัส Error, สายสัญญาณ, สภาพเครื่อง หรือชิ้นส่วนที่ชำรุด เพื่อให้ระบบ AI ตรวจวินิจฉัยอาการเบื้องต้นและให้ช่างเตรียมอะไหล่ได้ตรงจุด
          </p>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">
              ลากรูปภาพมาวางที่นี่ หรือ{' '}
              <label className="text-blue-600 hover:underline cursor-pointer font-bold">
                เลือกไฟล์จากเครื่อง
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              รองรับไฟล์ JPG, PNG, WEBP (แนบได้หลายรูป ขนาดไม่เกิน 10MB ต่อรูป)
            </p>
          </div>

          {/* Image Previews */}
          {attachments.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>รูปภาพที่แนบแล้ว ({attachments.length} รูป)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    พร้อมส่งให้ AI วิเคราะห์
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">คลิกที่กากบาทเพื่อลบรูป</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs aspect-video">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
                        title="ลบรูปภาพ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded truncate">
                      {att.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: รายละเอียดอาการเสียและระบบวิเคราะห์ด้วย AI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              5. รายละเอียดอาการเสีย (Symptom Details) & ระบบ AI วิเคราะห์อาการ
            </h2>
            {attachments.length > 0 && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                📸 วิเคราะห์ร่วมกับ {attachments.length} รูป
              </span>
            )}
          </div>

          {/* Symptom Details & AI Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label htmlFor="textarea-symptom" className="text-xs font-semibold text-slate-700">
                รายละเอียดอาการเสีย (Symptom Details) *
              </label>
              <button
                type="button"
                id="btn-ai-diagnose"
                onClick={handleTriggerAIDiagnosis}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isAnalyzing
                    ? 'กำลังวิเคราะห์รูปภาพและข้อความ...'
                    : attachments.length > 0
                    ? `วิเคราะห์อาการด้วย AI (จากรูป ${attachments.length} ใบ & ข้อความ)`
                    : 'วิเคราะห์อาการด้วย AI'}
                </span>
              </button>
            </div>
            <textarea
              id="textarea-symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={4}
              placeholder={
                attachments.length > 0
                  ? "อธิบายอาการเพิ่มเติม หรือกดปุ่ม 'วิเคราะห์อาการด้วย AI' ด้านบน เพื่อให้ AI ตรวจดูรูปภาพที่แนบแล้วสรุปอาการให้อัตโนมัติ..."
                  : "ตัวอย่าง: เปิดเครื่องแล้วหน้าจอไม่ติด พัดลมหมุนแรง มีเสียงเตือน Beep 3 ครั้งสั้น หรือเครื่องพิมพ์ดึงกระดาษซ้อนกันแล้วติดขัด..."
              }
              className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
              required
            />
          </div>

          {/* Quick preset symptom buttons for quick testing */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">ลองข้อความตัวอย่าง:</span>
            {[
              'คอมเปิดไม่ติดมีเสียงร้อง',
              'เปิดเครื่องแล้วหน้าจอไม่ติด ไฟเคสเข้าแต่จอดำ',
              'เครื่องพิมพ์ดึงกระดาษซ้อนกันและติดขัดตลอดเวลา',
              'เปิดติดแล้วดับเอง มีกลิ่นไหม้อ่อนๆ ที่ปลั๊ก'
            ].map((txt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSymptom(txt);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors cursor-pointer"
              >
                {txt}
              </button>
            ))}
          </div>

          {/* AI ANALYZING SPINNER / BANNER */}
          {isAnalyzing && (
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50/80 p-4 shadow-xs flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900">
                  กำลังให้ AI ตรวจสอบ{attachments.length > 0 ? `ภาพถ่ายปัญหา (${attachments.length} รูป) และ` : ''}ข้อความอาการเสีย...
                </p>
                <p className="text-[11px] text-blue-700">
                  กำลังวิเคราะห์ภาพและข้อความ ประเมินสาเหตุที่เป็นไปได้ ระดับความเร่งด่วน และคำแนะนำเบื้องต้น
                </p>
              </div>
            </div>
          )}

          {/* AI DIAGNOSIS CARD (Section 5 Requirement) */}
          {aiDiagnosis && (
            <div
              ref={aiResultRef}
              className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-blue-100 pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <span>ผลการวิเคราะห์อาการเสียอัตโนมัติ (AI Diagnostic)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-semibold">
                        สำเร็จ
                      </span>
                    </h3>
                    <p className="text-[10px] text-blue-700 font-medium">
                      อาการ: {aiDiagnosis.symptomSummary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    ระดับความรุนแรง: {aiDiagnosis.severityLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiDiagnosis(null)}
                    title="ปิดผลการวิเคราะห์"
                    className="p-1 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Causes */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  สาเหตุที่เป็นไปได้:
                </p>
                <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700">
                  {aiDiagnosis.possibleCauses.map((cause, cIdx) => (
                    <li key={cIdx}>{cause}</li>
                  ))}
                </ul>
              </div>

              {/* Initial Checks */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  แนวทางตรวจสอบเบื้องต้น:
                </p>
                <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700">
                  {aiDiagnosis.initialChecks.map((chk, kIdx) => (
                    <li key={kIdx}>{chk}</li>
                  ))}
                </ul>
              </div>

              {/* Advice */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  คำแนะนำก่อนส่งช่าง:
                </p>
                <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700">
                  {aiDiagnosis.advice.map((adv, aIdx) => (
                    <li key={aIdx}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Action: Apply AI recommended urgency */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-100/60 border border-blue-200">
                <span className="text-[11px] text-blue-900 font-medium">
                  แนะนำความเร่งด่วน: <strong className="text-blue-950">{aiDiagnosis.severityLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (aiDiagnosis.severity && ['low', 'medium', 'high', 'critical'].includes(aiDiagnosis.severity)) {
                      setUrgency(aiDiagnosis.severity as UrgencyLevel);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  ปรับความเร่งด่วนในฟอร์มเป็น "{aiDiagnosis.severityLabel}" ทันที
                </button>
              </div>

              {/* Notice */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                <span className="font-semibold">หมายเหตุ: </span>
                {aiDiagnosis.disclaimer}
              </div>
            </div>
          )}

          {/* Date of Report */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วันที่แจ้งซ่อม
            </label>
            <div className="relative max-w-xs">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={notificationDate}
                onChange={(e) => setNotificationDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            id="btn-submit-repair"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม'}</span>
          </button>
        </div>
      </form>

      {/* SUCCESS CONFIRMATION MODAL */}
      {createdTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">แจ้งซ่อมสำเร็จเรียบร้อย!</h3>
              <p className="text-xs text-slate-500 mt-1">
                ระบบได้สร้างเลขที่งานซ่อมและส่งการแจ้งเตือนไปยังทีมช่างแล้ว
              </p>
            </div>

            {/* Ticket Summary Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                <span className="text-slate-500">เลขที่งาน (Ticket No.):</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{createdTicket.ticketNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ผู้แจ้งซ่อม:</span>
                <span className="font-semibold text-slate-800">{createdTicket.userName} ({createdTicket.userPhone})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">อุปกรณ์:</span>
                <span className="font-semibold text-slate-800">{createdTicket.equipmentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">สถานที่:</span>
                <span className="text-slate-800">{createdTicket.location} - {createdTicket.room}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ประเภทปัญหา:</span>
                <span className="font-semibold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md text-[11px]">{createdTicket.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">สถานะปัจจุบัน:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  รอรับเรื่อง (Pending)
                </span>
              </div>
            </div>

            {/* LINE Notice */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ส่งข้อความแจ้งเตือนผ่าน LINE Notify แล้ว
              </span>
              <button
                type="button"
                onClick={() => setIsLineModalOpen(true)}
                className="text-emerald-700 underline font-semibold hover:text-emerald-900"
              >
                ดูตัวอย่าง LINE
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedTicket(null);
                  setActiveView('dashboard');
                }}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                กลับแดชบอร์ด
              </button>
              <button
                type="button"
                id="btn-goto-track-ticket"
                onClick={() => {
                  const id = createdTicket.id;
                  setCreatedTicket(null);
                  setSelectedTicketId(id);
                  setActiveView('track_status');
                }}
                className="flex items-center gap-1.5 px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/25"
              >
                <span>ติดตามสถานะงานนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
