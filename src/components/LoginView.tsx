import React, { useState } from 'react';
import {
  Wrench,
  Shield,
  User as UserIcon,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Laptop,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { switchRole, loginWithUser, setActiveView, users } = useApp();

  // Role Tab: 'technician' or 'admin'
  const [selectedRole, setSelectedRole] = useState<'technician' | 'admin'>('technician');

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Handle Tab Switch
  const handleRoleTabChange = (role: 'technician' | 'admin') => {
    setSelectedRole(role);
    setLoginError('');
  };

  // Quick fill helper for testing
  const handleQuickFill = (uName: string, pass: string, role: 'technician' | 'admin') => {
    setSelectedRole(role);
    setUsername(uName);
    setPassword(pass);
    setLoginError('');
  };

  // 1-Click Simulate Login helper
  const handleSimulateLogin = (role: 'technician' | 'admin' | 'user') => {
    setLoginError('');
    if (role === 'user') {
      switchRole('user');
      setActiveView('dashboard');
      return;
    }
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      loginWithUser(targetUser, role === 'admin' ? 'dashboard' : 'tech_jobs');
    } else {
      switchRole(role);
      setActiveView(role === 'admin' ? 'dashboard' : 'tech_jobs');
    }
  };

  // Keyboard caps lock detection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Handle Submit Form
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const trimmedInput = username.trim().toLowerCase();
      if (!trimmedInput) {
        setLoginError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
        return;
      }
      if (!password) {
        setLoginError('กรุณากรอกรหัสผ่าน');
        return;
      }

      const targetUser = users.find(
        (u) =>
          u.username.toLowerCase() === trimmedInput ||
          u.email.toLowerCase() === trimmedInput
      );

      if (!targetUser) {
        setLoginError('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมลอีกครั้ง');
        return;
      }

      // Check role matching or permit
      if (selectedRole === 'admin' && targetUser.role !== 'admin') {
        setLoginError(`บัญชี "${targetUser.name}" ไม่ใช่บัญชีผู้ดูแลระบบ (Admin)`);
        return;
      }

      if (selectedRole === 'technician' && targetUser.role !== 'technician' && targetUser.role !== 'admin') {
        setLoginError(`บัญชี "${targetUser.name}" ไม่ใช่บัญชีช่างซ่อมคอมพิวเตอร์`);
        return;
      }

      // Simple password validation (for demo environment, any password or password123)
      if (password !== 'password123' && password.length < 4) {
        setLoginError('รหัสผ่านไม่ถูกต้อง (สำหรับทดสอบสามารถใช้: password123)');
        return;
      }

      // Successful login
      loginWithUser(targetUser, 'dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-800 flex flex-col justify-between relative selection:bg-blue-600 selection:text-white">
      {/* Top Bar / Navigation */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              switchRole('user');
              setActiveView('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>Ai Smart Repair</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500">ระบบเข้าสู่ระบบสำหรับเจ้าหน้าที่ (Staff Portal)</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-back-to-home"
            onClick={() => {
              switchRole('user');
              setActiveView('dashboard');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg space-y-4">
          {/* Guest Reporter Banner - แจ้งซ่อมได้ทันทีโดยไม่ต้องล็อกอิน */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-400/80 rounded-3xl p-5 sm:p-6 shadow-lg shadow-emerald-500/10 text-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-900 tracking-wide uppercase">
                    ผู้แจ้งซ่อมไม่ต้องล็อกอิน
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                    แจ้งซ่อมได้ทันที
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                  ต้องการแจ้งซ่อมคอมพิวเตอร์ โน้ตบุ๊ก ปริ้นเตอร์ หรืออุปกรณ์ IT? 
                  <strong className="text-emerald-950 font-bold ml-1">
                    ท่านสามารถแจ้งซ่อมได้ทันทีโดยไม่ต้องมีบัญชีผู้ใช้
                  </strong>
                </p>
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    id="btn-guest-report-now"
                    onClick={() => {
                      switchRole('user');
                      setActiveView('new_repair');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-100" />
                    <span>แจ้งซ่อมทันที</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8">
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25 mb-3">
                {selectedRole === 'technician' ? (
                  <Wrench className="w-7 h-7" />
                ) : (
                  <Shield className="w-7 h-7" />
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                เข้าสู่ระบบสำหรับเจ้าหน้าที่
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                (เฉพาะช่างซ่อมคอมพิวเตอร์และผู้ดูแลระบบ IT เท่านั้น)
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6">
              <button
                type="button"
                id="tab-role-tech"
                onClick={() => handleRoleTabChange('technician')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedRole === 'technician'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>ช่างซ่อมคอมพิวเตอร์</span>
              </button>

              <button
                type="button"
                id="tab-role-admin"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ผู้ดูแลระบบ (Admin)</span>
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="font-medium">{loginError}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อผู้ใช้ หรือ อีเมล (Username / Email)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-staff-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedRole === 'technician'
                        ? 'เช่น prasit_tech หรือ anan_tech'
                        : 'เช่น wichai_admin'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    รหัสผ่าน (Password)
                  </label>
                  {capsLockActive && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      ⚠️ Caps Lock เปิดอยู่
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-staff-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    id="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    id="chk-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(username.includes('@') ? username : '');
                    setShowForgotModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all mt-2 cursor-pointer ${
                  selectedRole === 'technician'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20'
                } ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>
                      เข้าสู่ระบบ{selectedRole === 'technician' ? 'ช่างซ่อม' : 'ผู้ดูแลระบบ'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo / Simulation Login Section */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  จำลองการเข้าสู่ระบบด่วน (Demo Login):
                </span>
                <span className="text-[10px] text-slate-400">คลิกเพื่อเข้าสู่ระบบทันที</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Technician Demo Button */}
                <button
                  type="button"
                  id="btn-demo-login-tech"
                  onClick={() => handleSimulateLogin('technician')}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 hover:border-emerald-300 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950 truncate">
                        ช่างประสิทธิ์ (IT Support)
                      </p>
                      <p className="text-[10px] text-emerald-700 truncate">
                        จำลองสิทธิ์: ช่างซ่อม
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Admin Demo Button */}
                <button
                  type="button"
                  id="btn-demo-login-admin"
                  onClick={() => handleSimulateLogin('admin')}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 hover:border-indigo-300 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-indigo-900 group-hover:text-indigo-950 truncate">
                        ผอ.วิชัย (ผู้ดูแลระบบ)
                      </p>
                      <p className="text-[10px] text-indigo-700 truncate">
                        จำลองสิทธิ์: แอดมิน IT
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>

              {/* Quick Fill credentials options */}
              <div className="mt-2.5 flex items-center justify-center gap-2.5 text-[11px] text-slate-500">
                <span>หรือคลิกกรอกข้อมูลอัตโนมัติ:</span>
                <button
                  type="button"
                  id="btn-fill-tech"
                  onClick={() => handleQuickFill('prasit_tech', 'password123', 'technician')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  ช่างประสิทธิ์
                </button>
                <span>•</span>
                <button
                  type="button"
                  id="btn-fill-admin"
                  onClick={() => handleQuickFill('wichai_admin', 'password123', 'admin')}
                  className="text-indigo-700 hover:text-indigo-800 font-semibold underline cursor-pointer"
                >
                  แอดมินวิชัย
                </button>
              </div>
            </div>
          </div>

          {/* Notice for General Users */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              สำหรับผู้แจ้งซ่อมทั่วไป (นักศึกษา / อาจารย์ / บุคลากร){' '}
              <button
                type="button"
                onClick={() => {
                  switchRole('user');
                  setActiveView('dashboard');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
              >
                คลิกที่นี่เพื่อแจ้งซ่อมโดยไม่ต้องเข้าสู่ระบบ
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        <p>Ai Smart Repair - ระบบแจ้งซ่อมเครื่องคอมพิวเตอร์และระบบเครือข่าย ศูนย์เทคโนโลยีสารสนเทศ</p>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              รีเซ็ตรหัสผ่านเจ้าหน้าที่
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              กรอกอีเมลหน่วยงานเพื่อรับคำแนะนำในการตั้งรหัสผ่านใหม่
            </p>

            {forgotSent ? (
              <div className="my-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-emerald-900">ส่งคำขอรีเซ็ตรหัสผ่านสำเร็จ!</p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  ระบบได้จำลองการส่งลิงก์ไปยัง <span className="font-semibold">{forgotEmail || 'อีเมลของคุณ'}</span> เรียบร้อยแล้ว
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  ตกลง
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลหน่วยงาน (Official Email)
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="เช่น prasit@support.institution.ac.th"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    ส่งคำขอ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
