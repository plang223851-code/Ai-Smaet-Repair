import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Equipment,
  RepairRequest,
  ChatMessage,
  NotificationItem,
  UserRole,
  RepairStatus,
  SatisfactionRating,
  LiveToastAlert
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EQUIPMENT,
  INITIAL_REPAIRS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  equipmentList: Equipment[];
  repairs: RepairRequest[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  currentRole: UserRole;
  selectedTicketId: string | null;
  activeView: string;
  isLineModalOpen: boolean;
  isDbModalOpen: boolean;
  isGuideModalOpen: boolean;
  isChatModalOpen: boolean;
  activeChatRepairId: string | null;

  // Actions
  switchRole: (role: UserRole) => void;
  loginWithUser: (user: User, redirectView?: string) => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  setActiveView: (view: string) => void;
  setSelectedTicketId: (id: string | null) => void;
  setIsLineModalOpen: (open: boolean) => void;
  setIsDbModalOpen: (open: boolean) => void;
  setIsGuideModalOpen: (open: boolean) => void;
  openChatModal: (repairId: string) => void;
  closeChatModal: () => void;

  // Repair actions
  createRepair: (repairData: Partial<RepairRequest>) => Promise<RepairRequest>;
  claimRepair: (repairId: string) => Promise<void>;
  updateRepairStatus: (
    repairId: string,
    status: RepairStatus,
    notes?: string,
    additionalData?: Partial<RepairRequest>
  ) => Promise<void>;
  submitRating: (repairId: string, rating: Partial<SatisfactionRating>) => Promise<void>;

  // Equipment actions
  addEquipment: (eq: Partial<Equipment>) => Promise<Equipment>;
  updateEquipment: (id: string, eq: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  // User actions
  addUser: (user: Partial<User>) => Promise<User>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Chat & notifications
  sendChatMessage: (repairId: string, message: string, imageUrl?: string) => Promise<ChatMessage>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getRepairById: (id: string) => RepairRequest | undefined;

  // Real-time synchronization & notifications
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncNow: (silent?: boolean) => Promise<void>;
  newTicketAlert: RepairRequest | null;
  dismissNewTicketAlert: () => void;
  sseStatus: 'connected' | 'connecting' | 'disconnected';
  liveToasts: LiveToastAlert[];
  dismissLiveToast: (id: string) => void;
  isSoundEnabled: boolean;
  toggleSoundEnabled: () => void;
  browserPermission: string;
  requestBrowserPermission: () => Promise<boolean>;
  triggerTestNotification: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const GUEST_USER: User = {
  id: 'usr-guest',
  username: 'guest',
  email: '',
  name: 'ผู้แจ้งซ่อมทั่วไป',
  role: 'user',
  department: 'ทั่วไป',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
};

// Notification read persistence helpers
const getReadNotifIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('read_notification_ids');
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return new Set();
};

const saveReadNotifId = (id: string) => {
  try {
    const set = getReadNotifIds();
    set.add(id);
    localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const saveAllReadNotifIds = (ids: string[]) => {
  try {
    const set = getReadNotifIds();
    ids.forEach((id) => set.add(id));
    localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const mergeSseNotification = (rawNotif: NotificationItem, prev: NotificationItem[]): NotificationItem[] => {
  const readIds = getReadNotifIds();
  const isRead = rawNotif.isRead || readIds.has(rawNotif.id);
  const normalized: NotificationItem = { ...rawNotif, isRead };
  const idx = prev.findIndex((item) => item.id === rawNotif.id);
  if (idx !== -1) {
    const copy = [...prev];
    copy[idx] = { ...normalized, isRead: copy[idx].isRead || isRead };
    return copy;
  }
  return [normalized, ...prev];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Restore saved role or default to 'user'
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('online_repair_current_role');
      if (savedRole === 'technician' || savedRole === 'admin' || savedRole === 'user') {
        return savedRole;
      }
    } catch {
      // ignore
    }
    return 'user';
  });

  // Restore saved user or match the role
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedRole = localStorage.getItem('online_repair_current_role');
      if (savedRole === 'technician') {
        const tech = INITIAL_USERS.find((u) => u.role === 'technician');
        if (tech) return tech;
      } else if (savedRole === 'admin') {
        const adm = INITIAL_USERS.find((u) => u.role === 'admin');
        if (adm) return adm;
      }

      const savedUser = localStorage.getItem('online_repair_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.id !== 'usr-1') return parsed;
      }
    } catch {
      // ignore
    }
    return GUEST_USER;
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [repairs, setRepairs] = useState<RepairRequest[]>(INITIAL_REPAIRS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const readIds = getReadNotifIds();
    return INITIAL_NOTIFICATIONS.map((n) =>
      readIds.has(n.id) ? { ...n, isRead: true } : n
    );
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Modals
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatRepairId, setActiveChatRepairId] = useState<string | null>(null);

  // Real-time sync states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [newTicketAlert, setNewTicketAlert] = useState<RepairRequest | null>(null);

  // Real-time Notifications & SSE states
  const [sseStatus, setSseStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [liveToasts, setLiveToasts] = useState<LiveToastAlert[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('online_repair_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const isSoundEnabledRef = useRef<boolean>(isSoundEnabled);
  isSoundEnabledRef.current = isSoundEnabled;

  const toggleSoundEnabled = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('online_repair_sound_enabled', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Web Audio API Pleasant Notification Chimes
  const playAudioChime = useCallback((type: 'ticket' | 'status' | 'chat' | 'test' = 'ticket') => {
    if (!isSoundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'ticket') {
        // Double-bell chime (D5 -> A5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880.00, now + 0.12); // A5

        osc2.frequency.setValueAtTime(1174.66, now);
        osc2.frequency.setValueAtTime(1760.00, now + 0.12);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.55);
        osc2.stop(now + 0.55);
      } else if (type === 'status' || type === 'test') {
        // 3-note ascending cheerful arpeggio (C5 -> E5 -> G5)
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } else {
        // Chat pop bubble chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn('Audio chime could not play:', e);
    }
  }, []);

  // Browser Desktop Push Notification
  const triggerBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'repair-alert-' + Date.now()
        });
      } catch {
        // ignore
      }
    }
  }, []);

  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          triggerBrowserNotification('เปิดใช้งานการแจ้งเตือนสำเร็จ', 'คุณจะได้รับการแจ้งเตือนงานซ่อมแบบเรียลไทม์ทันที');
          return true;
        }
      } catch {
        // ignore
      }
    }
    return false;
  }, [triggerBrowserNotification]);

  // Live Toast Queue
  const dismissLiveToast = useCallback((id: string) => {
    setLiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addLiveToast = useCallback((toast: Omit<LiveToastAlert, 'id' | 'timestamp'>) => {
    const newToast: LiveToastAlert = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setLiveToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto-dismiss after 6.5 seconds
    setTimeout(() => {
      setLiveToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6500);
  }, []);

  const prevRepairsRef = useRef<RepairRequest[]>(repairs);
  prevRepairsRef.current = repairs;

  const currentRoleRef = useRef<UserRole>(currentRole);
  currentRoleRef.current = currentRole;

  const currentUserRef = useRef<User>(currentUser);
  currentUserRef.current = currentUser;

  // Real-time sync function
  const syncNow = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch('/api/sync?t=' + Date.now(), {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.repairs)) {
          setRepairs(data.repairs);
          try {
            localStorage.setItem('online_repair_tickets', JSON.stringify(data.repairs));
          } catch {
            // ignore
          }
        }
        if (Array.isArray(data.equipment)) {
          setEquipmentList(data.equipment);
          try {
            localStorage.setItem('online_repair_equipment', JSON.stringify(data.equipment));
          } catch {
            // ignore
          }
        }
        if (Array.isArray(data.notifications)) {
          const readIds = getReadNotifIds();
          setNotifications(
            data.notifications.map((n: NotificationItem) =>
              readIds.has(n.id) || n.isRead ? { ...n, isRead: true } : n
            )
          );
        }
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        setLastSyncedAt(new Date());
      }
    } catch (e) {
      console.warn('Real-time sync error:', e);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  const dismissNewTicketAlert = useCallback(() => {
    setNewTicketAlert(null);
  }, []);

  // Trigger test real-time notification
  const triggerTestNotification = useCallback(async () => {
    try {
      playAudioChime('test');
      addLiveToast({
        type: 'test',
        title: '🔔 ทดสอบการแจ้งเตือนเรียลไทม์ (Live Alert)',
        message: 'ระบบแจ้งเตือนแบบเรียลไทม์ตอบสนองทันที พร้อมเสียง Chime และ Notification Toast!',
        badgeText: 'ทดสอบสด',
        badgeColor: 'bg-indigo-600 text-white'
      });
      triggerBrowserNotification(
        '🔔 ทดสอบการแจ้งเตือนเรียลไทม์',
        'ระบบแจ้งเตือนแบบเรียลไทม์ทำงานได้อย่างสมบูรณ์แบบ!'
      );

      // Also call server to broadcast across any open tabs/devices
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserRef.current?.id || 'usr-1',
          title: '🔔 ทดสอบแจ้งเตือนเรียลไทม์ (ทุกอุปกรณ์)',
          message: 'การเชื่อมต่อ Server-Sent Events (SSE) ซิงค์ข้อมูลข้ามอุปกรณ์สำเร็จ'
        })
      });
    } catch (e) {
      console.warn('Error sending test notification:', e);
    }
  }, [playAudioChime, addLiveToast, triggerBrowserNotification]);

  // Server-Sent Events (SSE) Real-time listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;

    const setupSSE = () => {
      try {
        setSseStatus('connecting');
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setSseStatus('connected');
        };

        eventSource.onmessage = (event) => {
          try {
            if (!event.data) return;
            const parsed = JSON.parse(event.data);
            const { type, data } = parsed;

            if (type === 'NEW_TICKET' && data?.repair) {
              const r = data.repair as RepairRequest;
              setRepairs((prev) => {
                const idx = prev.findIndex((item) => item.id === r.id);
                if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = r;
                  return copy;
                }
                return [r, ...prev];
              });

              if (data.notification) {
                setNotifications((prev) => mergeSseNotification(data.notification, prev));
              }

              // Technician & Admin alert
              if (currentRoleRef.current === 'technician' || currentRoleRef.current === 'admin') {
                playAudioChime('ticket');
                triggerBrowserNotification(
                  `🚨 มีงานแจ้งซ่อมใหม่: ${r.ticketNumber}`,
                  `${r.equipmentName} (${r.location} ${r.room}) - ${r.symptom}`
                );
                addLiveToast({
                  type: 'new_ticket',
                  title: 'มีงานแจ้งซ่อมใหม่เข้ามา!',
                  message: `${r.ticketNumber}: ${r.equipmentName} • ${r.location} (${r.room})`,
                  ticketId: r.id,
                  ticketNumber: r.ticketNumber,
                  badgeText: 'งานใหม่',
                  badgeColor: 'bg-amber-500 text-slate-950'
                });
                setNewTicketAlert(r);
              }
            } else if (type === 'TICKET_STATUS_UPDATED' || type === 'TICKET_CLAIMED') {
              if (data?.repair) {
                const r = data.repair as RepairRequest;
                setRepairs((prev) => {
                  const idx = prev.findIndex((item) => item.id === r.id);
                  if (idx !== -1) {
                    const copy = [...prev];
                    copy[idx] = r;
                    return copy;
                  }
                  return [r, ...prev];
                });
              }

              if (data?.notification) {
                setNotifications((prev) => mergeSseNotification(data.notification, prev));
              }

              playAudioChime('status');
              const title = data?.title || 'อัปเดตสถานะงานซ่อม';
              const message = data?.message || `งานซ่อม ${data?.repair?.ticketNumber || ''} มีการเปลี่ยนสถานะ`;

              triggerBrowserNotification(title, message);
              addLiveToast({
                type: 'status_changed',
                title,
                message,
                ticketId: data?.repair?.id,
                ticketNumber: data?.repair?.ticketNumber,
                badgeText: 'อัปเดตสด',
                badgeColor: 'bg-blue-600 text-white'
              });
            } else if (type === 'NEW_CHAT_MESSAGE' && data?.message) {
              const msg = data.message as ChatMessage;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });

              if (data.notification) {
                setNotifications((prev) => mergeSseNotification(data.notification, prev));
              }

              // Sound chime & toast if sent by someone else
              if (msg.senderId !== currentUserRef.current?.id) {
                playAudioChime('chat');
                triggerBrowserNotification(
                  `💬 ข้อความใหม่จาก ${msg.senderName}`,
                  msg.message
                );
                addLiveToast({
                  type: 'chat_message',
                  title: `ข้อความใหม่จาก ${msg.senderName}`,
                  message: msg.message,
                  ticketId: data.repairId,
                  ticketNumber: data.ticketNumber,
                  badgeText: 'แชต',
                  badgeColor: 'bg-emerald-600 text-white'
                });
              }
            } else if (type === 'TEST_NOTIFICATION') {
              playAudioChime('test');
              if (data?.notification) {
                setNotifications((prev) => mergeSseNotification(data.notification, prev));
              }
              addLiveToast({
                type: 'test',
                title: data?.title || '🔔 ทดสอบการแจ้งเตือนเรียลไทม์',
                message: data?.message || 'ระบบแจ้งเตือนแบบเรียลไทม์ตอบสนองทันที!',
                ticketId: data?.ticketId,
                ticketNumber: data?.ticketNumber,
                badgeText: 'ทดสอบ',
                badgeColor: 'bg-indigo-600 text-white'
              });
            }
          } catch (err) {
            console.warn('Error handling SSE message:', err);
          }
        };

        eventSource.onerror = () => {
          setSseStatus('connecting');
          eventSource?.close();
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(setupSSE, 3000);
        };
      } catch {
        setSseStatus('disconnected');
        reconnectTimer = setTimeout(setupSSE, 5000);
      }
    };

    setupSSE();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
    };
  }, [playAudioChime, triggerBrowserNotification, addLiveToast]);

  // Sync on mount + background polling as secondary safety net
  useEffect(() => {
    // 1. Initial load from localStorage if present
    try {
      const saved = localStorage.getItem('online_repair_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRepairs(parsed);
        }
      }
      const savedEq = localStorage.getItem('online_repair_equipment');
      if (savedEq) {
        const parsedEq = JSON.parse(savedEq);
        if (Array.isArray(parsedEq) && parsedEq.length > 0) {
          setEquipmentList(parsedEq);
        }
      }
    } catch {
      // ignore
    }

    // 2. Initial fetch from server
    syncNow(true);

    // 3. Fallback polling every 10 seconds for secondary consistency
    const timer = setInterval(() => {
      syncNow(true);
    }, 10000);

    // 4. Also sync whenever the window/tab is focused or visible
    const handleFocus = () => syncNow(true);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [syncNow]);

  // Save repairs to localStorage on change
  useEffect(() => {
    try {
      if (repairs && repairs.length > 0) {
        localStorage.setItem('online_repair_tickets', JSON.stringify(repairs));
      }
    } catch {
      // ignore
    }
  }, [repairs]);

  // Save equipment to localStorage on change
  useEffect(() => {
    try {
      if (equipmentList && equipmentList.length > 0) {
        localStorage.setItem('online_repair_equipment', JSON.stringify(equipmentList));
      }
    } catch {
      // ignore
    }
  }, [equipmentList]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    const targetUser =
      role === 'user'
        ? GUEST_USER
        : users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
    try {
      localStorage.setItem('online_repair_current_role', role);
      localStorage.setItem('online_repair_current_user', JSON.stringify(targetUser));
    } catch {
      // ignore
    }
    setActiveView('dashboard');
  }, [users]);

  const loginWithUser = useCallback((user: User, redirectView?: string) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem('online_repair_current_role', user.role);
      localStorage.setItem('online_repair_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    if (redirectView) {
      setActiveView(redirectView);
    } else {
      setActiveView('dashboard');
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentRole('user');
    setCurrentUser(GUEST_USER);
    try {
      localStorage.setItem('online_repair_current_role', 'user');
      localStorage.setItem('online_repair_current_user', JSON.stringify(GUEST_USER));
    } catch {
      // ignore
    }
    setActiveView('dashboard');
  }, []);

  const openChatModal = useCallback((repairId: string) => {
    setActiveChatRepairId(repairId);
    setIsChatModalOpen(true);
  }, []);

  const closeChatModal = useCallback(() => {
    setIsChatModalOpen(false);
    setActiveChatRepairId(null);
  }, []);

  const createRepair = async (repairData: Partial<RepairRequest>): Promise<RepairRequest> => {
    const currentYear = new Date().getFullYear();
    const count = repairs.length + 1;
    const ticketNumber = `REP-${currentYear}-${String(count).padStart(4, '0')}`;

    const newRepair: RepairRequest = {
      id: `rep-${Date.now()}`,
      ticketNumber,
      userId: repairData.userId || currentUser.id || 'usr-guest',
      userName: repairData.userName || currentUser.name || 'ผู้แจ้งซ่อมทั่วไป',
      userEmail: repairData.userEmail || currentUser.email || '',
      userPhone: repairData.userPhone || currentUser.phone || '',
      userDepartment: repairData.userDepartment || currentUser.department || 'ทั่วไป',
      equipmentId: repairData.equipmentId || '',
      equipmentCode: repairData.equipmentCode || 'EQ-001',
      equipmentName: repairData.equipmentName || 'คอมพิวเตอร์',
      equipmentType: repairData.equipmentType || 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
      equipmentBrand: repairData.equipmentBrand,
      equipmentModel: repairData.equipmentModel,
      location: repairData.location || 'อาคาร 1',
      room: repairData.room || 'ห้อง 101',
      category: repairData.category || 'ฮาร์ดแวร์ / อะไหล่ชำรุด',
      urgency: repairData.urgency || 'medium',
      symptom: repairData.symptom || '',
      aiDiagnosis: repairData.aiDiagnosis,
      attachments: repairData.attachments || [],
      status: 'reported',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'reported',
          label: 'แจ้งซ่อม',
          timestamp: new Date().toISOString(),
          changedBy: repairData.userName || currentUser.name || 'ผู้แจ้งซ่อม',
          role: currentUser.role || 'user',
          notes: 'ผู้แจ้งส่งคำขอแจ้งซ่อมผ่านระบบออนไลน์ (ไม่ต้องล็อกอิน)'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save ticket ID and reporter info to localStorage for guest tracking
    try {
      const storedIds: string[] = JSON.parse(localStorage.getItem('my_submitted_ticket_ids') || '[]');
      if (!storedIds.includes(newRepair.id)) {
        storedIds.unshift(newRepair.id);
        localStorage.setItem('my_submitted_ticket_ids', JSON.stringify(storedIds));
      }
      if (newRepair.userName) localStorage.setItem('repair_reporter_name', newRepair.userName);
      if (newRepair.userPhone) localStorage.setItem('repair_reporter_phone', newRepair.userPhone);
      if (newRepair.userDepartment) localStorage.setItem('repair_reporter_dept', newRepair.userDepartment);
      if (newRepair.userEmail) localStorage.setItem('repair_reporter_email', newRepair.userEmail);
    } catch {
      // ignore
    }

    // Optimistic client update
    setRepairs((prev) => [newRepair, ...prev]);

    // Update equipment health score and status
    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id === newRepair.equipmentId || eq.code === newRepair.equipmentCode) {
          return {
            ...eq,
            status: 'in_repair',
            repairCount: eq.repairCount + 1,
            lastRepairDate: new Date().toISOString().slice(0, 10),
            healthScore: Math.max(20, eq.healthScore - 8)
          };
        }
        return eq;
      })
    );

    // User Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      repairId: newRepair.id,
      ticketNumber: newRepair.ticketNumber,
      title: '📋 แจ้งซ่อมสำเร็จ',
      message: `สร้างงานแจ้งซ่อม ${newRepair.ticketNumber} เรียบร้อยแล้ว`,
      type: 'repair_created',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Technician Notification (Alert all technicians about the new request)
    const techNotif: NotificationItem = {
      id: `notif-tech-${Date.now()}`,
      userId: 'tech-1',
      repairId: newRepair.id,
      ticketNumber: newRepair.ticketNumber,
      title: '🚨 มีงานแจ้งซ่อมใหม่รอช่างรับเรื่อง',
      message: `งาน ${newRepair.ticketNumber}: ${newRepair.equipmentName} (${newRepair.location} ${newRepair.room}) รอช่างเข้าตรวจสอบและกดรับงาน`,
      type: 'repair_created',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [newNotif, techNotif, ...prev]);

    // Server push
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRepair)
      });
      if (res.ok) {
        syncNow(true);
      }
    } catch {
      // Offline mode
    }

    return newRepair;
  };

  const claimRepair = async (repairId: string) => {
    const techUser =
      currentRole === 'technician' && currentUser
        ? currentUser
        : users.find((u) => u.role === 'technician') || {
            id: 'tech-1',
            name: 'ช่างประสิทธิ์ ซ่อมไว',
            role: 'technician' as UserRole
          };

    const now = new Date().toISOString();

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id === repairId || r.ticketNumber === repairId) {
          const newHistory = [
            ...r.statusHistory,
            {
              id: `sh-${Date.now()}`,
              status: 'acknowledged' as RepairStatus,
              label: 'รับเรื่องแล้ว',
              timestamp: now,
              changedBy: techUser.name,
              role: 'technician' as UserRole,
              notes: `ช่างเทคนิค (${techUser.name}) ได้กดรับเรื่องและมอบหมายงานซ่อมให้ตนเองเรียบร้อยแล้ว`
            }
          ];

          return {
            ...r,
            technicianId: techUser.id,
            technicianName: techUser.name,
            status: 'acknowledged' as RepairStatus,
            statusHistory: newHistory,
            updatedAt: now
          };
        }
        return r;
      })
    );

    const targetRepair = repairs.find((r) => r.id === repairId || r.ticketNumber === repairId);
    const ticketNo = targetRepair ? targetRepair.ticketNumber : repairId;

    // Notification for user and technician
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      repairId,
      ticketNumber: ticketNo,
      title: '👨‍🔧 ช่างรับเรื่องแล้ว',
      message: `${techUser.name} ได้กดรับงานซ่อม ${ticketNo} เรียบร้อยแล้ว กำลังเริ่มเข้าตรวจสอบ`,
      type: 'status_changed',
      isRead: false,
      createdAt: now
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await fetch(`/api/repairs/${repairId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: techUser.id,
          technicianName: techUser.name
        })
      });
    } catch {
      // offline
    }
  };

  const updateRepairStatus = async (
    repairId: string,
    status: RepairStatus,
    notes?: string,
    additionalData?: Partial<RepairRequest>
  ) => {
    const now = new Date().toISOString();

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id === repairId || r.ticketNumber === repairId) {
          const newHistory = [
            ...r.statusHistory,
            {
              id: `sh-${Date.now()}`,
              status,
              label: status,
              timestamp: now,
              changedBy: currentUser.name,
              role: currentUser.role,
              notes: notes || ''
            }
          ];

          return {
            ...r,
            ...additionalData,
            status,
            statusHistory: newHistory,
            updatedAt: now,
            completedAt: status === 'completed' ? now : r.completedAt,
            closedAt: status === 'closed' ? now : r.closedAt
          };
        }
        return r;
      })
    );

    // If closed, return equipment to active
    if (status === 'closed') {
      const target = repairs.find((r) => r.id === repairId || r.ticketNumber === repairId);
      if (target) {
        setEquipmentList((prev) =>
          prev.map((e) => (e.id === target.equipmentId ? { ...e, status: 'active' } : e))
        );
      }
    }

    try {
      await fetch(`/api/repairs/${repairId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          statusNotes: notes,
          changedByName: currentUser.name,
          changedByRole: currentUser.role,
          ...additionalData
        })
      });
    } catch {
      // Ignore
    }
  };

  const submitRating = async (repairId: string, ratingData: Partial<SatisfactionRating>) => {
    const newRating: SatisfactionRating = {
      id: `rat-${Date.now()}`,
      repairId,
      userId: currentUser.id,
      userName: currentUser.name,
      overallRating: ratingData.overallRating || 5,
      speedRating: ratingData.speedRating || 5,
      serviceRating: ratingData.serviceRating || 5,
      comments: ratingData.comments || '',
      createdAt: new Date().toISOString()
    };

    setRepairs((prev) =>
      prev.map((r) => (r.id === repairId ? { ...r, rating: newRating } : r))
    );

    try {
      await fetch(`/api/repairs/${repairId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRating)
      });
    } catch {
      // Ignore
    }
  };

  const addEquipment = async (eqData: Partial<Equipment>): Promise<Equipment> => {
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      code: eqData.code || `EQ-${Date.now().toString().slice(-4)}`,
      name: eqData.name || 'อุปกรณ์ใหม่',
      type: eqData.type || 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
      brand: eqData.brand || '-',
      model: eqData.model || '-',
      serialNumber: eqData.serialNumber || `SN-${Date.now()}`,
      location: eqData.location || 'อาคาร 1',
      room: eqData.room || 'ห้อง 101',
      purchaseDate: eqData.purchaseDate || new Date().toISOString().slice(0, 10),
      startDate: eqData.startDate || new Date().toISOString().slice(0, 10),
      status: eqData.status || 'active',
      specifications: eqData.specifications || '',
      healthScore: 100,
      repairCount: 0,
      frequentIssues: [],
      replacedParts: []
    };

    setEquipmentList((prev) => [newEq, ...prev]);

    try {
      await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEq)
      });
    } catch {
      // Ignore
    }

    return newEq;
  };

  const updateEquipment = async (id: string, eqData: Partial<Equipment>) => {
    setEquipmentList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...eqData } : e))
    );

    try {
      await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eqData)
      });
    } catch {
      // Ignore
    }
  };

  const deleteEquipment = async (id: string) => {
    setEquipmentList((prev) => prev.filter((e) => e.id !== id));

    try {
      await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
    } catch {
      // Ignore
    }
  };

  const addUser = async (userData: Partial<User>): Promise<User> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: userData.username || `user_${Date.now()}`,
      email: userData.email || '',
      name: userData.name || 'ผู้ใช้งานใหม่',
      role: userData.role || 'user',
      department: userData.department || 'ทั่วไป',
      phone: userData.phone || '',
      lineUserId: userData.lineUserId || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch {
      // Ignore
    }

    return newUser;
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
    );

    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch {
      // Ignore
    }
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch {
      // Ignore
    }
  };

  const sendChatMessage = async (
    repairId: string,
    messageText: string,
    imageUrl?: string
  ): Promise<ChatMessage> => {
    const targetRepair = repairs.find((r) => r.id === repairId || r.ticketNumber === repairId);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      repairId,
      ticketNumber: targetRepair?.ticketNumber || '',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: messageText,
      imageUrl,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      await fetch(`/api/chat/${repairId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch {
      // Ignore
    }

    return newMsg;
  };

  const markNotificationAsRead = (id: string) => {
    saveReadNotifId(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }).catch((err) => {
      console.warn('Failed to persist notification read to server:', err);
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      saveAllReadNotifIds(prev.map((n) => n.id));
      return prev.map((n) => ({ ...n, isRead: true }));
    });
    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch((err) => {
      console.warn('Failed to persist read-all to server:', err);
    });
  };

  const getRepairById = (id: string) => {
    return repairs.find((r) => r.id === id || r.ticketNumber === id);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        equipmentList,
        repairs,
        messages,
        notifications,
        currentRole,
        selectedTicketId,
        activeView,
        isLineModalOpen,
        isDbModalOpen,
        isGuideModalOpen,
        isChatModalOpen,
        activeChatRepairId,

        switchRole,
        loginWithUser,
        logout,
        setCurrentUser,
        setActiveView,
        setSelectedTicketId,
        setIsLineModalOpen,
        setIsDbModalOpen,
        setIsGuideModalOpen,
        openChatModal,
        closeChatModal,

        createRepair,
        claimRepair,
        updateRepairStatus,
        submitRating,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addUser,
        updateUser,
        deleteUser,
        sendChatMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getRepairById,

        isSyncing,
        lastSyncedAt,
        syncNow,
        newTicketAlert,
        dismissNewTicketAlert,
        sseStatus,
        liveToasts,
        dismissLiveToast,
        isSoundEnabled,
        toggleSoundEnabled,
        browserPermission,
        requestBrowserPermission,
        triggerTestNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
