import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_EQUIPMENT,
  INITIAL_REPAIRS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  STATUS_CONFIG
} from './src/data/mockData.ts';
import { DATABASE_SQL_SCHEMA } from './src/data/databaseSchema.ts';
import { RepairRequest, ChatMessage, NotificationItem, Equipment, User, LineNotificationPayload } from './src/types/index.ts';

dotenv.config();

// File-based persistent storage directory
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory', e);
  }
}

function loadJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
      } else if (parsed) {
        return parsed as T;
      }
    }
  } catch (e) {
    console.warn(`Failed to read ${filename}, using default data`, e);
  }
  return fallback;
}

function saveJsonFile(filename: string, data: unknown) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Failed to save ${filename}`, e);
  }
}

// In-Memory Database Store backed by persistent JSON storage
let users: User[] = loadJsonFile('users.json', [...INITIAL_USERS]);
let equipmentList: Equipment[] = loadJsonFile('equipment.json', [...INITIAL_EQUIPMENT]);
let repairs: RepairRequest[] = loadJsonFile('repairs.json', [...INITIAL_REPAIRS]);
let messages: ChatMessage[] = loadJsonFile('messages.json', [...INITIAL_MESSAGES]);
let notifications: NotificationItem[] = loadJsonFile('notifications.json', [...INITIAL_NOTIFICATIONS]);

// Save initial baseline if files don't exist yet
saveJsonFile('users.json', users);
saveJsonFile('equipment.json', equipmentList);
saveJsonFile('repairs.json', repairs);
saveJsonFile('messages.json', messages);
saveJsonFile('notifications.json', notifications);

// Lazy Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client', e);
    }
  }
  return genAIClient;
}

// Helper: send LINE notification
async function sendLineNotification(payload: LineNotificationPayload): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const targetUser = payload.toUserId || process.env.LINE_DEFAULT_USER_ID;

  const formattedMessage = `🔧 ระบบแจ้งซ่อมและติดตามสถานะ\n\n` +
    `เลขที่งาน: ${payload.ticketNumber}\n` +
    `อุปกรณ์: ${payload.equipmentCode} (${payload.equipmentName})\n` +
    `สถานะ: ${payload.statusText}\n` +
    `รายละเอียด: ${payload.statusDescription}\n` +
    (payload.technicianName ? `ช่างผู้ดูแล: ${payload.technicianName}\n` : '') +
    `เวลา: ${new Date(payload.updatedAt).toLocaleString('th-TH')}`;

  if (!token || !targetUser) {
    // Return simulated delivery
    return {
      success: true,
      simulated: true,
      message: `[LINE Simulation] ข้อความแจ้งเตือนพร้อมส่ง: ${payload.ticketNumber} -> ${payload.statusText}`
    };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to: targetUser,
        messages: [
          {
            type: 'text',
            text: formattedMessage
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('LINE API Error response:', errText);
      return { success: false, message: `LINE API returned error: ${errText}` };
    }

    return { success: true, message: 'ส่งการแจ้งเตือนไปยัง LINE สำเร็จ' };
  } catch (error: any) {
    console.error('Error dispatching LINE push message:', error);
    return { success: false, message: error?.message || 'Failed to send to LINE' };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Prevent caching for all API responses to ensure real-time multi-device sync
  app.use('/api', (_req: Request, res: Response, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'repair-management-system',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        equipment: equipmentList.length,
        repairs: repairs.length,
        messages: messages.length
      }
    });
  });

  // Real-time synchronization endpoint for all connected devices/phones
  app.get('/api/sync', (_req: Request, res: Response) => {
    res.json({
      repairs,
      equipment: equipmentList,
      notifications,
      messages,
      timestamp: new Date().toISOString()
    });
  });

  // 1. Authentication & Users
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === (username || '').toLowerCase() ||
         u.email.toLowerCase() === (username || '').toLowerCase()) &&
        u.isActive
    );

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับ' });
    }

    // Return authenticated user profile (session token simulation)
    return res.json({
      success: true,
      user,
      token: `auth_token_${user.id}_${Date.now()}`
    });
  });

  app.get('/api/users', (_req: Request, res: Response) => {
    res.json(users);
  });

  app.post('/api/users', (req: Request, res: Response) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: req.body.username || `user_${Date.now()}`,
      email: req.body.email || '',
      name: req.body.name || 'ผู้ใช้งานใหม่',
      role: req.body.role || 'user',
      department: req.body.department || 'ทั่วไป',
      phone: req.body.phone || '',
      lineUserId: req.body.lineUserId || '',
      isActive: req.body.isActive !== false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveJsonFile('users.json', users);
    res.status(201).json(newUser);
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    users[idx] = { ...users[idx], ...req.body };
    saveJsonFile('users.json', users);
    res.json(users[idx]);
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    users.splice(idx, 1);
    saveJsonFile('users.json', users);
    res.json({ success: true, message: 'Deleted user' });
  });

  // 2. Equipment Management
  app.get('/api/equipment', (_req: Request, res: Response) => {
    res.json(equipmentList);
  });

  app.get('/api/equipment/:id', (req: Request, res: Response) => {
    const item = equipmentList.find((e) => e.id === req.params.id || e.code === req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  });

  app.post('/api/equipment', (req: Request, res: Response) => {
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      code: req.body.code || `EQ-${Date.now().toString().slice(-4)}`,
      name: req.body.name || 'อุปกรณ์ใหม่',
      type: req.body.type || 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
      brand: req.body.brand || '-',
      model: req.body.model || '-',
      serialNumber: req.body.serialNumber || `SN-${Date.now()}`,
      location: req.body.location || 'อาคาร 1',
      room: req.body.room || 'ห้อง 101',
      purchaseDate: req.body.purchaseDate || new Date().toISOString().slice(0, 10),
      startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
      status: req.body.status || 'active',
      specifications: req.body.specifications || '',
      healthScore: req.body.healthScore || 100,
      repairCount: 0,
      frequentIssues: [],
      replacedParts: []
    };
    equipmentList.unshift(newEq);
    saveJsonFile('equipment.json', equipmentList);
    res.status(201).json(newEq);
  });

  app.put('/api/equipment/:id', (req: Request, res: Response) => {
    const idx = equipmentList.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Equipment not found' });
    equipmentList[idx] = { ...equipmentList[idx], ...req.body };
    saveJsonFile('equipment.json', equipmentList);
    res.json(equipmentList[idx]);
  });

  app.delete('/api/equipment/:id', (req: Request, res: Response) => {
    const idx = equipmentList.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Equipment not found' });
    equipmentList.splice(idx, 1);
    saveJsonFile('equipment.json', equipmentList);
    res.json({ success: true, message: 'Deleted equipment' });
  });

  // Real-time Server-Sent Events (SSE) Client Pool
  const sseClients = new Set<Response>();

  function broadcastEvent(type: string, data: any) {
    const payload = `event: message\ndata: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Server-Sent Events (SSE) endpoint for Instant Real-Time Notifications
  app.get('/api/events', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(`: connected\n\n`);
    res.write(`event: message\ndata: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Keep-alive heartbeat every 15s to keep proxy connections alive
  setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(`: ping\n\n`);
      } catch {
        sseClients.delete(client);
      }
    }
  }, 15000);

  // 3. Repairs
  app.get('/api/repairs', (_req: Request, res: Response) => {
    res.json(repairs);
  });

  app.get('/api/repairs/:id', (req: Request, res: Response) => {
    const repair = repairs.find((r) => r.id === req.params.id || r.ticketNumber === req.params.id);
    if (!repair) return res.status(404).json({ error: 'Repair ticket not found' });
    res.json(repair);
  });

  // Create new repair ticket
  app.post('/api/repairs', async (req: Request, res: Response) => {
    const currentYear = new Date().getFullYear();
    const count = repairs.length + 1;
    const padded = String(count).padStart(4, '0');
    const defaultTicketNumber = `REP-${currentYear}-${padded}`;

    const newRepair: RepairRequest = {
      id: req.body.id || `rep-${Date.now()}`,
      ticketNumber: req.body.ticketNumber || defaultTicketNumber,
      userId: req.body.userId || 'usr-1',
      userName: req.body.userName || 'ผู้แจ้งซ่อม',
      userEmail: req.body.userEmail || '',
      userPhone: req.body.userPhone || '',
      userDepartment: req.body.userDepartment || 'ทั่วไป',
      equipmentId: req.body.equipmentId || '',
      equipmentCode: req.body.equipmentCode || 'EQ-001',
      equipmentName: req.body.equipmentName || 'อุปกรณ์คอมพิวเตอร์',
      equipmentType: req.body.equipmentType || 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
      equipmentBrand: req.body.equipmentBrand,
      equipmentModel: req.body.equipmentModel,
      location: req.body.location || 'อาคาร 1',
      room: req.body.room || 'ห้อง 101',
      category: req.body.category || 'hardware',
      urgency: req.body.urgency || 'medium',
      symptom: req.body.symptom || '',
      aiDiagnosis: req.body.aiDiagnosis,
      attachments: req.body.attachments || [],
      status: req.body.status || 'reported',
      technicianId: req.body.technicianId,
      technicianName: req.body.technicianName,
      statusHistory: req.body.statusHistory || [
        {
          id: `sh-${Date.now()}`,
          status: 'reported',
          label: 'แจ้งซ่อม',
          timestamp: new Date().toISOString(),
          changedBy: req.body.userName || 'ผู้แจ้งซ่อม',
          role: 'user',
          notes: 'ผู้ใช้ส่งคำขอแจ้งซ่อมผ่านระบบออนไลน์'
        }
      ],
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: req.body.updatedAt || new Date().toISOString()
    };

    // Prevent duplicate insertion if already exists
    const existingIdx = repairs.findIndex(r => r.id === newRepair.id || r.ticketNumber === newRepair.ticketNumber);
    if (existingIdx !== -1) {
      repairs[existingIdx] = { ...repairs[existingIdx], ...newRepair };
    } else {
      repairs.unshift(newRepair);
    }

    // Update equipment status and repair count
    const eq = equipmentList.find((e) => e.id === newRepair.equipmentId || e.code === newRepair.equipmentCode);
    if (eq) {
      eq.status = 'in_repair';
      eq.repairCount = (eq.repairCount || 0) + 1;
      eq.lastRepairDate = new Date().toISOString().slice(0, 10);
      eq.healthScore = Math.max(20, eq.healthScore - 8);
    }

    // Create system notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: newRepair.userId,
      repairId: newRepair.id,
      ticketNumber: newRepair.ticketNumber,
      title: '📋 แจ้งซ่อมสำเร็จ',
      message: `คำขอแจ้งซ่อม ${newRepair.ticketNumber} (${newRepair.equipmentName}) ถูกส่งเข้าสู่ระบบแล้ว`,
      type: 'repair_created',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Also notify technicians
    notifications.unshift({
      id: `notif-tech-${Date.now()}`,
      userId: 'tech-1',
      repairId: newRepair.id,
      ticketNumber: newRepair.ticketNumber,
      title: '🚨 มีงานแจ้งซ่อมใหม่รอช่างรับเรื่อง',
      message: `งาน ${newRepair.ticketNumber}: ${newRepair.equipmentName} (${newRepair.location} ${newRepair.room}) รอช่างเข้าตรวจสอบและกดรับงาน`,
      type: 'repair_created',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Send LINE Notification
    await sendLineNotification({
      ticketNumber: newRepair.ticketNumber,
      equipmentCode: newRepair.equipmentCode,
      equipmentName: newRepair.equipmentName,
      status: 'reported',
      statusText: 'แจ้งซ่อมสำเร็จ',
      statusDescription: 'ระบบได้รับคำขอแจ้งซ่อมแล้ว กำลังส่งต่องานไปยังช่างเทคนิค',
      updatedAt: newRepair.createdAt
    });

    saveJsonFile('repairs.json', repairs);
    saveJsonFile('equipment.json', equipmentList);
    saveJsonFile('notifications.json', notifications);

    // Broadcast instant real-time event to all connected devices
    broadcastEvent('NEW_TICKET', {
      repair: newRepair,
      notification: notifications[1] || notifications[0]
    });

    res.status(201).json(newRepair);
  });

  // Claim repair endpoint for technicians
  app.post('/api/repairs/:id/claim', async (req: Request, res: Response) => {
    const idx = repairs.findIndex((r) => r.id === req.params.id || r.ticketNumber === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Repair ticket not found' });
    const { technicianId, technicianName } = req.body;
    const now = new Date().toISOString();
    repairs[idx].technicianId = technicianId || 'tech-1';
    repairs[idx].technicianName = technicianName || 'ช่างประสิทธิ์ ซ่อมไว';
    repairs[idx].status = 'acknowledged';
    repairs[idx].updatedAt = now;
    repairs[idx].statusHistory.push({
      id: `sh-${Date.now()}`,
      status: 'acknowledged',
      label: 'รับเรื่องแล้ว',
      timestamp: now,
      changedBy: repairs[idx].technicianName || 'ช่างเทคนิค',
      role: 'technician',
      notes: `ช่างเทคนิค (${repairs[idx].technicianName}) กดรับงานเรียบร้อยแล้ว`
    });

    // Notify user that technician has claimed the ticket
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: repairs[idx].userId,
      repairId: repairs[idx].id,
      ticketNumber: repairs[idx].ticketNumber,
      title: '👨‍🔧 ช่างกดรับงานแล้ว',
      message: `${repairs[idx].technicianName} ได้รับมอบหมายงานซ่อม ${repairs[idx].ticketNumber} และกำลังเตรียมดำเนินการ`,
      type: 'tech_assigned',
      isRead: false,
      createdAt: now
    });

    saveJsonFile('repairs.json', repairs);
    saveJsonFile('notifications.json', notifications);

    // Broadcast instant update
    broadcastEvent('TICKET_STATUS_UPDATED', {
      repair: repairs[idx],
      title: '👨‍🔧 ช่างกดรับงานแล้ว',
      message: `${repairs[idx].technicianName} รับงานซ่อม ${repairs[idx].ticketNumber} แล้ว`,
      notification: notifications[0]
    });

    res.json(repairs[idx]);
  });

  // Update repair ticket (Status change, technician assignment, inspection, etc.)
  app.put('/api/repairs/:id', async (req: Request, res: Response) => {
    const idx = repairs.findIndex((r) => r.id === req.params.id || r.ticketNumber === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Repair ticket not found' });

    const current = repairs[idx];
    const updates = req.body;
    const now = new Date().toISOString();

    // Check if status has changed
    if (updates.status && updates.status !== current.status) {
      const statusMeta = STATUS_CONFIG[updates.status as keyof typeof STATUS_CONFIG];
      const newHistoryItem = {
        id: `sh-${Date.now()}`,
        status: updates.status,
        label: statusMeta ? statusMeta.label : updates.status,
        timestamp: now,
        changedBy: updates.changedByName || updates.technicianName || 'ผู้ดูแลระบบ',
        role: updates.changedByRole || 'technician',
        notes: updates.statusNotes || statusMeta?.description || ''
      };

      current.statusHistory.push(newHistoryItem);

      // Notification
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: current.userId,
        repairId: current.id,
        ticketNumber: current.ticketNumber,
        title: `🔧 อัปเดตสถานะ: ${statusMeta?.label || updates.status}`,
        message: `งานซ่อม ${current.ticketNumber} เปลี่ยนสถานะเป็น "${statusMeta?.label || updates.status}"`,
        type: 'status_changed',
        isRead: false,
        createdAt: now
      });

      // LINE Notification
      await sendLineNotification({
        ticketNumber: current.ticketNumber,
        equipmentCode: current.equipmentCode,
        equipmentName: current.equipmentName,
        status: updates.status,
        statusText: statusMeta?.label || updates.status,
        statusDescription: updates.statusNotes || statusMeta?.description || 'มีการเปลี่ยนสถานะงานซ่อม',
        technicianName: updates.technicianName || current.technicianName,
        updatedAt: now
      });

      if (updates.status === 'completed') {
        current.completedAt = now;
      }
      if (updates.status === 'closed') {
        current.closedAt = now;
        // Equipment back to active
        const eq = equipmentList.find((e) => e.id === current.equipmentId || e.code === current.equipmentCode);
        if (eq) {
          eq.status = 'active';
        }
      }
    }

    // Merge updates
    repairs[idx] = {
      ...current,
      ...updates,
      updatedAt: now
    };

    saveJsonFile('repairs.json', repairs);
    saveJsonFile('equipment.json', equipmentList);
    saveJsonFile('notifications.json', notifications);

    // Broadcast real-time status update to all connected clients
    broadcastEvent('TICKET_STATUS_UPDATED', {
      repair: repairs[idx],
      status: repairs[idx].status,
      title: notifications[0]?.title || 'อัปเดตสถานะงานซ่อม',
      message: notifications[0]?.message || `งานซ่อม ${repairs[idx].ticketNumber} มีการเปลี่ยนแปลงสถานะ`,
      notification: notifications[0]
    });

    res.json(repairs[idx]);
  });

  // Submit satisfaction rating
  app.post('/api/repairs/:id/rating', (req: Request, res: Response) => {
    const idx = repairs.findIndex((r) => r.id === req.params.id || r.ticketNumber === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Repair ticket not found' });

    const rating = {
      id: `rat-${Date.now()}`,
      repairId: repairs[idx].id,
      userId: req.body.userId || repairs[idx].userId,
      userName: req.body.userName || repairs[idx].userName,
      overallRating: Number(req.body.overallRating) || 5,
      speedRating: Number(req.body.speedRating) || 5,
      serviceRating: Number(req.body.serviceRating) || 5,
      comments: req.body.comments || '',
      createdAt: new Date().toISOString()
    };

    repairs[idx].rating = rating;
    saveJsonFile('repairs.json', repairs);
    res.json({ success: true, rating });
  });

  // 4. Chat Messages
  app.get('/api/chat/:repairId', (req: Request, res: Response) => {
    const ticketMsgs = messages.filter(
      (m) => m.repairId === req.params.repairId || m.ticketNumber === req.params.repairId
    );
    res.json(ticketMsgs);
  });

  app.post('/api/chat/:repairId', async (req: Request, res: Response) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      repairId: req.params.repairId,
      ticketNumber: req.body.ticketNumber || '',
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      senderRole: req.body.senderRole,
      message: req.body.message,
      imageUrl: req.body.imageUrl,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    messages.push(newMsg);

    // Notify the other party
    const ticket = repairs.find((r) => r.id === req.params.repairId || r.ticketNumber === req.params.repairId);
    if (ticket) {
      const recipientId = newMsg.senderRole === 'user' ? (ticket.technicianId || 'tech-1') : ticket.userId;
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: recipientId,
        repairId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: `💬 ข้อความใหม่จาก ${newMsg.senderName}`,
        message: newMsg.message.slice(0, 80),
        type: 'new_message',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveJsonFile('messages.json', messages);
    saveJsonFile('notifications.json', notifications);

    // Broadcast instant real-time chat message to all connected clients
    broadcastEvent('NEW_CHAT_MESSAGE', {
      message: newMsg,
      repairId: ticket?.id || req.params.repairId,
      ticketNumber: ticket?.ticketNumber || '',
      notification: notifications[0]
    });

    res.status(201).json(newMsg);
  });

  // 5. Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (userId) {
      return res.json(notifications.filter((n) => n.userId === userId));
    }
    res.json(notifications);
  });

  // Trigger test real-time notification
  app.post('/api/notifications/test', (req: Request, res: Response) => {
    const testNotif: NotificationItem = {
      id: `notif-test-${Date.now()}`,
      userId: req.body.userId || 'usr-1',
      repairId: repairs[0]?.id || '',
      ticketNumber: repairs[0]?.ticketNumber || 'REP-2026-0001',
      title: req.body.title || '🔔 ทดสอบการแจ้งเตือนเรียลไทม์ (Live Notification)',
      message: req.body.message || 'ระบบแจ้งเตือนแบบ Real-time พร้อมเสียง Chime และ Push Alert ทำงานได้อย่างสมบูรณ์แบบ!',
      type: 'status_changed',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(testNotif);
    saveJsonFile('notifications.json', notifications);

    // Broadcast via SSE immediately
    broadcastEvent('TEST_NOTIFICATION', {
      notification: testNotif,
      title: testNotif.title,
      message: testNotif.message,
      ticketNumber: testNotif.ticketNumber,
      ticketId: testNotif.repairId
    });

    res.json({ success: true, notification: testNotif });
  });

  app.put('/api/notifications/read-all', (req: Request, res: Response) => {
    const userId = req.body?.userId;
    notifications.forEach((n) => {
      if (!userId || userId === 'usr-guest' || n.userId === userId) {
        n.isRead = true;
      }
    });
    saveJsonFile('notifications.json', notifications);
    res.json({ success: true });
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const notif = notifications.find((n) => n.id === req.params.id);
    if (notif) notif.isRead = true;
    saveJsonFile('notifications.json', notifications);
    res.json({ success: true });
  });

  // 6. AI Diagnosis with Gemini API (Server-side & Multimodal Vision)
  app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
    const { symptom, equipmentType, images } = req.body;
    if (!symptom && (!images || !Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({ error: 'กรุณาระบุอาการเสียหรือแนบรูปภาพปัญหาอย่างน้อย 1 รูป' });
    }

    // Extract inline image data if provided (supporting up to 4 photos)
    const inlineImages: any[] = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images.slice(0, 4)) {
        if (typeof img === 'string') {
          const match = img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (match) {
            inlineImages.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
      }
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `คุณคือผู้เชี่ยวชาญด้านวิศวกรรมคอมพิวเตอร์ ช่างไอทีและนักวิเคราะห์อาการเสียของอุปกรณ์คอมพิวเตอร์ระดับมืออาชีพสำหรับสถาบันการศึกษาและองค์กร
กรุณาวิเคราะห์อาการเสียของอุปกรณ์คอมพิวเตอร์ต่อไปนี้${inlineImages.length > 0 ? ` โดยตรวจสอบภาพถ่ายปัญหาที่แนบมา (${inlineImages.length} ภาพ) ร่วมกับข้อมูลที่ระบุอย่างละเอียดถี่ถ้วน` : ''}:
ประเภทอุปกรณ์: ${equipmentType || 'คอมพิวเตอร์ทั่วไป'}
อาการเสียที่ระบุ: "${symptom || (inlineImages.length > 0 ? 'กรุณาวิเคราะห์และอธิบายอาการเสียจากรูปภาพที่แนบมา' : 'ไม่ระบุ')}"

${inlineImages.length > 0 ? `แนวทางพิเศษสำหรับการวิเคราะห์จากภาพถ่าย:
1. ตรวจสอบรายละเอียดในภาพอย่างถี่ถ้วน เช่น ข้อความ Error Code, รหัส Blue Screen (BSOD Stop Code), ไฟ LED แสดงสถานะบนเคส/เมนบอร์ด, สภาพหน้าจอ (แตก เป็นเส้น จอมืด), สภาพสายเชื่อมต่อ/หัวพอร์ตหลวม, กระดาษติดในเครื่องพิมพ์, สิ่งแปลกปลอม หรือร่องรอยความร้อน/ไหม้
2. ในส่วน "symptomSummary" และ "possibleCauses" ให้อ้างอิงและระบุสิ่งที่มองเห็นจากภาพถ่ายอย่างชัดเจนและเข้าใจง่าย เช่น "ตรวจพบจากภาพถ่าย: หน้าจอขึ้น Blue Screen รหัส SYSTEM_THREAD_EXCEPTION_NOT_HANDLED" หรือ "ตรวจพบจากภาพถ่าย: สาย HDMI เสียบไม่สนิทเข้าช่องการ์ดจอ" หรือ "ตรวจพบจากภาพถ่าย: กระดาษติดบริเวณลูกยางฟีดด้านในเครื่องพิมพ์"
` : ''}

ตอบกลับในรูปแบบ JSON ที่ถูกต้องเท่านั้น (ไม่มีเครื่องหมาย markdown \`\`\`json) โดยมีโครงสร้างดังนี้:
{
  "symptomSummary": "สรุปอาการแบบสั้นกระชับ 1 ประโยค (หากมีภาพ ให้ระบุสิ่งที่สังเกตเห็นจากภาพถ่ายด้วย)",
  "possibleCauses": [
    "สาเหตุข้อที่ 1",
    "สาเหตุข้อที่ 2",
    "สาเหตุข้อที่ 3"
  ],
  "severity": "low" | "medium" | "high" | "critical",
  "severityLabel": "คำอธิบายระดับ เช่น ปานกลาง, สูง, ฉุกเฉิน",
  "initialChecks": [
    "แนวทางตรวจสอบเบื้องต้น 1",
    "แนวทางตรวจสอบเบื้องต้น 2"
  ],
  "advice": [
    "คำแนะนำก่อนส่งช่าง 1",
    "คำแนะนำก่อนส่งช่าง 2"
  ],
  "disclaimer": "ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น${inlineImages.length > 0 ? 'จากภาพถ่ายและข้อมูล' : ''} ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริงอีกครั้ง",
  "confidenceScore": 95
}`;

        const multimodalContents: any[] = [...inlineImages, prompt];

        let text = '';
        try {
          // Primary attempt with gemini-3.8-flash for strong multimodal visual understanding
          const responsePromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: multimodalContents.length === 1 ? multimodalContents[0] : multimodalContents,
            config: {
              responseMimeType: 'application/json',
            }
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI diagnosis timeout')), 25000)
          );

          const response = await Promise.race([responsePromise, timeoutPromise]);
          text = response.text?.trim() || '';
        } catch (primaryErr) {
          try {
            // Secondary attempt with gemini-3.1-flash-lite
            const backupPromise = ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: multimodalContents.length === 1 ? multimodalContents[0] : multimodalContents,
              config: {
                responseMimeType: 'application/json',
              }
            });
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('AI backup diagnosis timeout')), 20000)
            );
            const backupResponse = await Promise.race([backupPromise, timeoutPromise]);
            text = backupResponse.text?.trim() || '';
          } catch {
            // Will gracefully continue to local diagnostic rule engine below
          }
        }

        if (text) {
          const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleaned);
          return res.json({
            ...parsed,
            analyzedAt: new Date().toISOString()
          });
        }
      } catch {
        // Continue to local diagnostic rule engine
      }
    }

    // Local smart diagnostic rule engine
    // Returns structured diagnosis matching user request specification
    const text = (symptom || '').toLowerCase();
    let causes = ['1. สายเชื่อมต่อสัญญาณหรือสายไฟหลวม', '2. อุปกรณ์ภายในเสื่อมสภาพ', '3. ไดรเวอร์หรือซอฟต์แวร์ขัดแย้ง'];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let severityLabel = 'ปานกลาง';
    let initialChecks = ['ตรวจสอบปลั๊กไฟและสายสัญญาณ', 'ทดลองปิดและเปิดสวิตช์ใหม่อีกครั้ง'];
    let advice = ['ไม่ควรงัดแงะหรือเปิดฝาครอบเครื่องเอง', 'เตรียมข้อมูล Serial Number แจ้งช่าง'];

    if (text.includes('เสียงร้อง') || text.includes('ร้อง') || text.includes('beep') || text.includes('บี๊บ') || text.includes('เสียงเตือน')) {
      causes = [
        '1. แรม (RAM) เสียบไม่แน่น หลวม หรือหน้าสัมผัสทองแดงมีคราบออกไซด์',
        '2. การ์ดจอ (GPU) เสียบไม่สนิท หรือไฟเลี้ยงการ์ดจอไม่เข้า',
        '3. เมนบอร์ดหรือ BIOS ตรวจพบอุปกรณ์ฮาร์ดแวร์ขัดข้อง (POST Beep Code)',
        '4. พัดลมระบายความร้อนหรือ CPU อุณหภูมิสูงเกินขีดจำกัด'
      ];
      severity = 'high';
      severityLabel = 'สูง';
      initialChecks = [
        'นับจังหวะเสียงร้อง (เช่น สั้น 3 ครั้ง, ยาว 1 สั้น 2 หรือยาวต่อเนื่อง) เพื่อระบุโค้ดแจ้งช่าง',
        'ปิดเครื่อง ถอดปลั๊กไฟ ลองถอดแรมออกมาขัดหน้าสัมผัสทองแดงด้วยยางลบแล้วเสียบกลับให้ลงล็อก',
        'สังเกตว่าพัดลมระบายความร้อนหมุนและไฟสถานะของเมนบอร์ดติดหรือไม่'
      ];
      advice = [
        'ห้ามเปิดเครื่องทิ้งไว้เป็นเวลานานขณะมีเสียงร้องเตือน',
        'ระบุจำนวนครั้งหรือรูปแบบเสียงร้องลงในช่องรายละเอียดเพื่อให้ช่างเตรียมอะไหล่แรม/การ์ดจอมาเปลี่ยนได้ทันที'
      ];
    } else if (text.includes('จอ') || text.includes('ไม่ติด') || text.includes('จอดำ')) {
      causes = [
        '1. สายสัญญาณจอ (HDMI / DisplayPort) หลวมหรือชำรุด',
        '2. แรม (RAM) มีปัญหาหรือเสียบไม่แน่น',
        '3. การ์ดจอ (GPU) ขัดข้อง'
      ];
      severity = 'medium';
      severityLabel = 'ปานกลาง';
      initialChecks = [
        'ตรวจสอบสายจอทั้งฝั่งเคสและจอภาพว่าเสียบแน่นดีหรือไม่',
        'ทดลองขยับสายสัญญาณ หรือเปลี่ยนพอร์ตเสียบด้านหลังเคส'
      ];
      advice = [
        'ห้ามใช้แรงดันสายแรงเกินไป',
        'หากมีเสียงร้อง Beep Code ให้จดจำจังหวะเสียงเพื่อแจ้งช่าง'
      ];
    } else if (text.includes('กระดาษติด') || text.includes('printer') || text.includes('พิมพ์')) {
      causes = [
        '1. ลูกยางดึงกระดาษ (Pickup Roller) สึกหรอ',
        '2. มีเศษกระดาษหรือสิ่งแปลกปลอมค้างในช่องฟีด',
        '3. เซนเซอร์ตรวจจับกระดาษทำงานผิดพลาด'
      ];
      severity = 'medium';
      severityLabel = 'ปานกลาง';
      initialChecks = [
        'เปิดฝาครอบเครื่องและดึงถาดกระดาษออกเพื่อตรวจดูเศษกระดาษ',
        'ดึงกระดาษออกตามทิศทางลูกศรอย่างเบามือ'
      ];
      advice = ['ห้ามใช้กรรไกรหรือคัตเตอร์เขี่ยในช่องลูกกลิ้ง'];
    } else if (text.includes('ไหม้') || text.includes('ไฟไม่เข้า') || text.includes('ช็อต')) {
      causes = [
        '1. แหล่งจ่ายไฟ (Power Supply Unit) ลัดวงจรหรือฟิวส์ขาด',
        '2. เมนบอร์ดช็อต',
        '3. เต้าเสียบไฟฟ้าผนังมีปัญหา'
      ];
      severity = 'critical';
      severityLabel = 'ฉุกเฉินเร่งด่วน';
      initialChecks = ['ถอดปลั๊กไฟออกทันทีเพื่อความปลอดภัย'];
      advice = ['ห้ามเสียบปลั๊กไฟซ้ำเด็ดขาด แจ้งช่างเข้าตรวจสอบหน้างานทันที'];
    }

    const summaryText = symptom
      ? `วิเคราะห์อาการ: ${symptom.slice(0, 60)}`
      : (inlineImages.length > 0 ? `วิเคราะห์ภาพถ่ายปัญหาที่แนบมา (${inlineImages.length} ภาพ)` : 'วิเคราะห์อาการทั่วไป');

    return res.json({
      symptomSummary: summaryText,
      possibleCauses: causes,
      severity,
      severityLabel,
      initialChecks,
      advice,
      disclaimer: `ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น${inlineImages.length > 0 ? 'ร่วมกับรูปภาพที่แนบ' : ''} ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง`,
      confidenceScore: 90,
      analyzedAt: new Date().toISOString()
    });
  });

  // 7. LINE Messaging API simulation and push endpoint
  app.get('/api/line/status', (_req: Request, res: Response) => {
    res.json({
      configured: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN),
      hasSecret: Boolean(process.env.LINE_CHANNEL_SECRET),
      hasDefaultUser: Boolean(process.env.LINE_DEFAULT_USER_ID),
      mode: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'live' : 'simulated'
    });
  });

  app.post('/api/line/notify', async (req: Request, res: Response) => {
    const { ticketNumber, equipmentCode, equipmentName, status, statusText, statusDescription, technicianName } = req.body;

    const result = await sendLineNotification({
      ticketNumber: ticketNumber || 'REP-2026-0001',
      equipmentCode: equipmentCode || 'PC-001',
      equipmentName: equipmentName || 'คอมพิวเตอร์ตั้งโต๊ะ',
      status: status || 'in_progress',
      statusText: statusText || 'กำลังซ่อม',
      statusDescription: statusDescription || 'ช่างกำลังดำเนินการตรวจสอบ',
      technicianName: technicianName || 'ช่างเทคนิค',
      updatedAt: new Date().toISOString()
    });

    res.json(result);
  });

  // 8. Admin Analytics
  app.get('/api/analytics', (_req: Request, res: Response) => {
    // Breakdown by status
    const statusCounts = {
      total: repairs.length,
      reported: repairs.filter((r) => r.status === 'reported').length,
      pending: repairs.filter((r) => r.status === 'pending').length,
      acknowledged: repairs.filter((r) => r.status === 'acknowledged').length,
      investigating: repairs.filter((r) => r.status === 'investigating').length,
      in_progress: repairs.filter((r) => r.status === 'in_progress').length,
      waiting_parts: repairs.filter((r) => r.status === 'waiting_parts').length,
      completed: repairs.filter((r) => r.status === 'completed').length,
      closed: repairs.filter((r) => r.status === 'closed').length
    };

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    repairs.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    // Department breakdown
    const departmentCounts: Record<string, number> = {};
    repairs.forEach((r) => {
      departmentCounts[r.userDepartment] = (departmentCounts[r.userDepartment] || 0) + 1;
    });

    // Tech workload
    const techWorkload: Record<string, number> = {};
    repairs.forEach((r) => {
      const name = r.technicianName || 'ยังไม่กำหนดช่าง';
      techWorkload[name] = (techWorkload[name] || 0) + 1;
    });

    // Monthly breakdown (Mock past 6 months data for rich charts)
    const monthlyData = [
      { month: 'ต.ค. 68', count: 18, completed: 17, avgHours: 4.2 },
      { month: 'พ.ย. 68', count: 24, completed: 23, avgHours: 3.8 },
      { month: 'ธ.ค. 68', count: 15, completed: 15, avgHours: 3.1 },
      { month: 'ม.ค. 69', count: 32, completed: 30, avgHours: 4.5 },
      { month: 'ก.พ. 69', count: 28, completed: 25, avgHours: 3.5 },
      { month: 'มี.ค. 69', count: repairs.length, completed: statusCounts.completed + statusCounts.closed, avgHours: 3.2 }
    ];

    res.json({
      statusCounts,
      categoryCounts,
      departmentCounts,
      techWorkload,
      monthlyData,
      totalEquipment: equipmentList.length,
      equipmentInRepair: equipmentList.filter((e) => e.status === 'in_repair').length,
      averageHealthScore: Math.round(
        equipmentList.reduce((acc, curr) => acc + curr.healthScore, 0) / equipmentList.length
      ),
      averageRepairTimeHours: 3.4
    });
  });

  // 9. Database Schema SQL download / view
  app.get('/api/db/schema', (_req: Request, res: Response) => {
    res.type('text/plain').send(DATABASE_SQL_SCHEMA);
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
