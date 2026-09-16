import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Paperclip,
  CheckCheck,
  Clock,
  User,
  Wrench,
  Shield,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage, RepairRequest } from '../types';

interface ChatComponentProps {
  initialRepairId?: string | null;
  isModal?: boolean;
  onClose?: () => void;
}

export const ChatView: React.FC<ChatComponentProps> = ({
  initialRepairId,
  isModal = false,
  onClose
}) => {
  const {
    repairs,
    messages,
    currentUser,
    sendChatMessage,
    selectedTicketId
  } = useApp();

  const [activeRepairId, setActiveRepairId] = useState<string>(
    initialRepairId || selectedTicketId || repairs[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRepair = repairs.find(
    (r) => r.id === activeRepairId || r.ticketNumber === activeRepairId
  );

  const currentChatMessages = messages.filter(
    (m) =>
      m.repairId === activeRepair?.id ||
      m.repairId === activeRepair?.ticketNumber ||
      m.ticketNumber === activeRepair?.ticketNumber
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const text = inputText;
    const img = attachedImage;
    setInputText('');
    setAttachedImage(null);

    await sendChatMessage(activeRepair?.id || activeRepairId, text, img || undefined);
  };

  const handleQuickResponse = (text: string) => {
    setInputText(text);
  };

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const quickReplies =
    currentUser.role === 'technician'
      ? [
          'กำลังเดินทางเข้าตรวจสอบหน้างานครับ',
          'ตรวจเช็กอาการแล้ว จำเป็นต้องรออะไหล่ครับ',
          'อะไหล่มาถึงแล้ว กำลังเร่งซ่อมให้ครับ',
          'ทดสอบเรียบร้อย สามารถมารับเครื่องได้ครับ'
        ]
      : [
          'ขอสอบถามสถานะเพิ่มเติมครับ',
          'เครื่องมีเสียงดังขึ้นกว่าเดิมครับ',
          'สะดวกให้ช่างเข้ามาหน้างานได้เลยครับ',
          'ขอบคุณมากครับ เครื่องใช้งานได้ปกติแล้ว'
        ];

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col ${
        isModal ? 'h-[80vh] max-h-[700px]' : 'h-[calc(100vh-140px)] min-h-[550px]'
      }`}
    >
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-blue-700">
                {activeRepair?.ticketNumber || 'TICKET'}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {activeRepair?.equipmentName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ห้อง: {activeRepair?.room} • ผู้แจ้ง: {activeRepair?.userName}
            </p>
          </div>
        </div>

        {/* Ticket Selector Dropdown for Desktop View */}
        <div className="flex items-center gap-2">
          {!isModal && (
            <select
              value={activeRepairId}
              onChange={(e) => setActiveRepairId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {repairs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ticketNumber} - {r.equipmentName}
                </option>
              ))}
            </select>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {currentChatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <MessageSquare className="w-12 h-12 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">เริ่มต้นการสนทนา</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              พิมพ์ข้อความเพื่อสอบถามรายละเอียด หรือประสานงานกับช่างผู้ดูแล
            </p>
          </div>
        ) : (
          currentChatMessages.map((msg: ChatMessage) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 self-end">
                    {msg.senderRole === 'technician' ? (
                      <Wrench className="w-4 h-4 text-emerald-600" />
                    ) : msg.senderRole === 'admin' ? (
                      <Shield className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                )}

                <div className={`max-w-[75%] sm:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-700">{msg.senderName}</span>
                    <span>•</span>
                    <span className="capitalize">{msg.senderRole}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.message && <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>}

                    {/* Image Attachment in chat */}
                    {msg.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-black/10 max-w-xs">
                        <img
                          src={msg.imageUrl}
                          alt="แนบรูปภาพ"
                          className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-95"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 ${isMe ? 'justify-end' : ''}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Strip (Section 9 Requirement) */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">ข้อความด่วน:</span>
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickResponse(reply)}
            className="px-2.5 py-1 bg-white hover:bg-slate-200/80 text-slate-700 text-[11px] rounded-lg border border-slate-200 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Attached Image Preview before send */}
      {attachedImage && (
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300">
            <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-slate-500">พร้อมแนบรูปภาพ</span>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <label className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors">
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleAttachImage}
            className="hidden"
          />
        </label>

        <input
          id="input-chat-message"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความที่นี่..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />

        <button
          id="btn-send-chat"
          type="submit"
          disabled={!inputText.trim() && !attachedImage}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
