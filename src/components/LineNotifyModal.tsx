import React, { useState } from 'react';
import {
  Send,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Key,
  Globe,
  Settings,
  X,
  Loader2,
  Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LineNotifyModal: React.FC = () => {
  const { isLineModalOpen, setIsLineModalOpen, repairs } = useApp();

  const [activeTab, setActiveTab] = useState<'simulator' | 'config'>('simulator');
  const [selectedTicketNumber, setSelectedTicketNumber] = useState(
    repairs[0]?.ticketNumber || 'REP-2026-0001'
  );
  const [selectedStatus, setSelectedStatus] = useState('กำลังซ่อม');
  const [customRemark, setCustomRemark] = useState('ช่างกำลังดำเนินการตรวจสอบและเปลี่ยนอะไหล่');
  const [isSending, setIsSending] = useState(false);
  const [sentLogs, setSentLogs] = useState<
    { id: string; time: string; text: string; success: boolean }[]
  >([
    {
      id: '1',
      time: '10:15 น.',
      text: `🔧 ระบบแจ้งซ่อม\nเลขที่งาน: ${repairs[0]?.ticketNumber || 'REP-2026-0001'}\nอุปกรณ์: ${repairs[0]?.equipmentName || 'PC-001'}\nสถานะ: รับเรื่องแล้ว\nช่างประสิทธิ์รับเรื่องเพื่อเข้าดำเนินการแล้ว`,
      success: true
    }
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isLineModalOpen) return null;

  const currentRepair = repairs.find((r) => r.ticketNumber === selectedTicketNumber) || repairs[0];

  const handleTestSend = async () => {
    setIsSending(true);
    const messageBody = `🔧 ระบบแจ้งซ่อม\nเลขที่งาน: ${currentRepair?.ticketNumber || 'REP-2026-0001'}\nอุปกรณ์: ${currentRepair?.equipmentCode || 'EQ-001'} (${currentRepair?.equipmentName || 'คอมพิวเตอร์'})\nสถานะ: ${selectedStatus}\n${customRemark}`;

    try {
      const res = await fetch('/api/line/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairId: currentRepair?.id,
          ticketNumber: currentRepair?.ticketNumber,
          status: selectedStatus,
          message: messageBody,
          recipientLineId: 'U1234567890abcdef'
        })
      });
      const data = await res.json();

      setSentLogs((prev) => [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          text: messageBody,
          success: true
        },
        ...prev
      ]);
    } catch {
      // Offline simulation fallback
      setSentLogs((prev) => [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          text: messageBody,
          success: true
        },
        ...prev
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#06C755] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ระบบแจ้งเตือนผ่าน LINE Messaging API
              </h2>
              <p className="text-xs text-slate-500">
                จำลองการส่งการแจ้งเตือน Real-time Status ไปยัง LINE ของผู้แจ้งซ่อมและช่าง
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLineModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#06C755]" />
            <span>จำลองการส่งข้อความ (Simulator)</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>การตั้งค่า LINE Developers (API Config)</span>
          </button>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Controls (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลือกงานแจ้งซ่อม
                </label>
                <select
                  value={selectedTicketNumber}
                  onChange={(e) => setSelectedTicketNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  {repairs.map((r) => (
                    <option key={r.id} value={r.ticketNumber}>
                      {r.ticketNumber} - {r.equipmentName} ({r.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สถานะที่ต้องการแจ้งเตือน
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'ผู้ใช้แจ้งซ่อมสำเร็จ',
                    'ช่างรับเรื่องแล้ว',
                    'กำลังตรวจสอบ',
                    'กำลังซ่อม',
                    'รออะไหล่',
                    'ซ่อมเสร็จเรียบร้อย',
                    'ปิดงานสมบูรณ์'
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`p-2 rounded-xl border text-left font-medium transition-all ${
                        selectedStatus === st
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความเพิ่มเติม / ความคืบหน้า
                </label>
                <input
                  type="text"
                  value={customRemark}
                  onChange={(e) => setCustomRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <button
                type="button"
                id="btn-test-send-line"
                onClick={handleTestSend}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSending ? 'กำลังส่ง API...' : 'ส่งข้อความทดสอบเข้า LINE'}</span>
              </button>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">เงื่อนไขการส่งแจ้งเตือนอัตโนมัติ:</span>
                <p className="mt-0.5">
                  เมื่อระบบมีการเปลี่ยนสถานะงานซ่อมในขั้นตอนใดก็ตาม ระบบจะยิง Webhook Push Message ผ่าน LINE Messaging API ส่งตรงถึง LINE User ID ของผู้แจ้งและทีมช่างทันที
                </p>
              </div>
            </div>

            {/* Right: Realistic Smartphone Mockup Preview (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-[280px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800">
                {/* Speaker notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-900" />
                </div>

                {/* Screen */}
                <div className="bg-[#8cabd9] rounded-[26px] h-[380px] flex flex-col overflow-hidden text-xs">
                  {/* LINE Chat Room Header */}
                  <div className="bg-[#20324d] text-white px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold text-[10px]">
                        IT
                      </div>
                      <span className="font-bold text-[11px]">ระบบแจ้งซ่อม IT</span>
                    </div>
                    <span className="text-[10px] text-slate-300">Official</span>
                  </div>

                  {/* LINE Chat Messages Area */}
                  <div className="flex-1 p-2.5 overflow-y-auto space-y-3">
                    <div className="text-center">
                      <span className="bg-black/20 text-white text-[9px] px-2 py-0.5 rounded-full">
                        วันนี้
                      </span>
                    </div>

                    {sentLogs.map((log) => (
                      <div key={log.id} className="flex flex-col items-start space-y-1">
                        <div className="bg-white text-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-md max-w-[90%] border border-emerald-100">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#06C755] border-b border-slate-100 pb-1 mb-1.5">
                            <Wrench className="w-3 h-3" />
                            <span>ระบบแจ้งซ่อม IT Online</span>
                          </div>
                          <p className="whitespace-pre-line text-[11px] leading-relaxed font-sans text-slate-800">
                            {log.text}
                          </p>
                        </div>
                        <span className="text-[9px] text-white/90 pl-1">{log.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* LINE Footer Input Mock */}
                  <div className="bg-white p-2 flex items-center gap-1.5">
                    <div className="flex-1 bg-slate-100 rounded-full px-3 py-1 text-[10px] text-slate-400">
                      ส่งข้อความตอบกลับ...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: LINE Developers API Configuration */}
        {activeTab === 'config' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                การเชื่อมต่อ LINE Messaging API ระดับสถานศึกษา / องค์กร
              </h4>
              <p className="text-emerald-800 mt-1">
                สร้าง Messaging API Channel ใน{' '}
                <a
                  href="https://developers.line.biz"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold"
                >
                  LINE Developers Console
                </a>{' '}
                จากนั้นนำค่าคอนฟิกมาใส่ในไฟล์ <code className="bg-white px-1.5 py-0.5 rounded font-mono">.env</code> ของระบบ
              </p>
            </div>

            {/* Config Keys */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Channel Access Token (Long-lived)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="eyJhbGciOiJIUzI1NiJ9.demo_token_channel_access_key_placeholder"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-700"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'eyJhbGciOiJIUzI1NiJ9.demo_token_channel_access_key_placeholder',
                        'token'
                      )
                    }
                    className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                  >
                    {copiedKey === 'token' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>คัดลอก</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Channel Secret
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-700"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'secret')
                    }
                    className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                  >
                    {copiedKey === 'secret' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>คัดลอก</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Webhook URL (สำหรับรับข้อความโต้ตอบกลับจากผู้ใช้)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://your-domain.ac.th/api/line/webhook"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-700"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard('https://your-domain.ac.th/api/line/webhook', 'webhook')
                    }
                    className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                  >
                    {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>คัดลอก</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800">ตัวอย่าง .env:</span>
              <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`LINE_CHANNEL_ACCESS_TOKEN=your_token_here
LINE_CHANNEL_SECRET=your_secret_here
PORT=3000`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
