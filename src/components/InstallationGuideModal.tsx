import React from 'react';
import { BookOpen, X, Terminal, Server, Shield, CheckCircle2, Cpu, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InstallationGuideModal: React.FC = () => {
  const { isGuideModalOpen, setIsGuideModalOpen } = useApp();

  if (!isGuideModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 text-xs text-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                คู่มือการติดตั้งและการนำไประบบไปใช้งานจริง (Production Deployment Guide)
              </h2>
              <p className="text-[11px] text-slate-500">
                ขั้นตอนการติดตั้ง เซิร์ฟเวอร์ ฐานข้อมูล และการเชื่อมต่อ LINE Messaging API
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGuideModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. System Requirements */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Cpu className="w-4 h-4 text-blue-600" />
            1. ข้อกำหนดของระบบ (System Requirements)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">ฮาร์ดแวร์เซิร์ฟเวอร์ขั้นต่ำ:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                <li>CPU: 2 vCPU หรือสูงกว่า</li>
                <li>RAM: 2 GB (แนะนำ 4 GB สำหรับโหลดสูง)</li>
                <li>Storage: 20 GB SSD</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">ซอฟต์แวร์ที่ต้องติดตั้ง:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                <li>Node.js v20.x หรือ v22.x LTS</li>
                <li>PostgreSQL 15+ หรือ MySQL 8.0+ หรือ SQLite</li>
                <li>Nginx (Reverse Proxy + SSL HTTPS)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Step by Step Installation */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Terminal className="w-4 h-4 text-blue-600" />
            2. ขั้นตอนการติดตั้ง (Installation Steps)
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2">
              <p className="text-slate-400"># 1. โคลนโปรเจกต์และเข้าสู่โฟลเดอร์</p>
              <p className="text-emerald-400">git clone https://github.com/institution/it-repair-system.git</p>
              <p className="text-emerald-400">cd it-repair-system</p>

              <p className="text-slate-400 mt-2"># 2. ติดตั้ง Dependencies</p>
              <p className="text-emerald-400">npm install</p>

              <p className="text-slate-400 mt-2"># 3. คัดลอกและตั้งค่า Environment Variables</p>
              <p className="text-emerald-400">cp .env.example .env</p>

              <p className="text-slate-400 mt-2"># 4. ทดสอบรันในโหมด Development</p>
              <p className="text-emerald-400">npm run dev</p>

              <p className="text-slate-400 mt-2"># 5. Build สำหรับ Production</p>
              <p className="text-emerald-400">npm run build</p>
              <p className="text-emerald-400">npm start</p>
            </div>
          </div>
        </div>

        {/* 3. Docker Deployment */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Server className="w-4 h-4 text-emerald-600" />
            3. การนำขึ้นใช้งานด้วย Docker & Cloud Run (Container Deployment)
          </h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-800">
              ตัวอย่าง Dockerfile สำหรับรันแบบ Production Container:
            </p>
            <pre className="p-3 bg-slate-900 text-blue-300 rounded-xl font-mono text-[10px] overflow-x-auto">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]`}
            </pre>
          </div>
        </div>

        {/* 4. Security & Best Practices */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
          <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" />
            ข้อแนะนำด้านความปลอดภัย (Security Best Practices)
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-700">
            <li>เก็บ LINE Channel Access Token และรหัสผ่านฐานข้อมูลใน Environment Secrets เสมอ</li>
            <li>เข้ารหัสผ่านผู้ใช้ด้วย bcrypt (Salt rounds 10+)</li>
            <li>ตั้งค่า CORS ให้อนุญาตเฉพาะโดเมนขององค์กร</li>
            <li>เปิดใช้งาน HTTPS SSL Certificate (เช่น Let's Encrypt ฟรี)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
