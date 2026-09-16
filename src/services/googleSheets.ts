import { User, RepairRequest, Equipment } from '../types';

// OAuth Client ID from Google Cloud Console / Firebase configuration
export const GOOGLE_OAUTH_CLIENT_ID =
  '899797332883-blvsktjb8padr7v4e2b527k9t9p6pmnp.apps.googleusercontent.com';

export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

export interface GoogleSheetsSyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  counts: {
    repairs: number;
    reporters: number;
    technicians: number;
    users: number;
    equipment: number;
  };
  syncedAt: string;
  error?: string;
}

export interface GoogleSheetsMeta {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncTime: string | null;
  autoSync: boolean;
  lastRecordCount: number;
}

const STORAGE_KEYS = {
  TOKEN: 'google_sheets_access_token',
  TOKEN_EXPIRY: 'google_sheets_token_expiry',
  SPREADSHEET_ID: 'google_sheets_spreadsheet_id',
  SPREADSHEET_URL: 'google_sheets_spreadsheet_url',
  LAST_SYNC: 'google_sheets_last_sync',
  AUTO_SYNC: 'google_sheets_auto_sync'
};

/**
 * Get current Google Sheets connection metadata
 */
export function getGoogleSheetsMeta(): GoogleSheetsMeta {
  const spreadsheetId = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
  const spreadsheetUrl = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_URL);
  const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const autoSync = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) === 'true';

  return {
    spreadsheetId,
    spreadsheetUrl:
      spreadsheetUrl ||
      (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : null),
    lastSyncTime,
    autoSync,
    lastRecordCount: 0
  };
}

/**
 * Save Google Sheets metadata
 */
export function saveGoogleSheetsMeta(updates: Partial<GoogleSheetsMeta>) {
  if (updates.spreadsheetId !== undefined) {
    if (updates.spreadsheetId) {
      localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, updates.spreadsheetId);
      localStorage.setItem(
        STORAGE_KEYS.SPREADSHEET_URL,
        `https://docs.google.com/spreadsheets/d/${updates.spreadsheetId}/edit`
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_ID);
      localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_URL);
    }
  }
  if (updates.lastSyncTime !== undefined) {
    if (updates.lastSyncTime) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, updates.lastSyncTime);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    }
  }
  if (updates.autoSync !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, String(updates.autoSync));
  }
}

/**
 * Check if valid Google access token exists in storage
 */
export function getValidGoogleToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!token || !expiry) return null;

  const expiryTime = parseInt(expiry, 10);
  if (Date.now() >= expiryTime - 60000) {
    // expired or expiring within 1 min
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    return null;
  }

  return token;
}

/**
 * Store access token with expiration
 */
export function storeGoogleToken(accessToken: string, expiresInSeconds = 3599) {
  const expiryTime = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
}

/**
 * Disconnect Google Sheets account
 */
export function disconnectGoogleAccount() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token && (window as any).google?.accounts?.oauth2?.revoke) {
    try {
      (window as any).google.accounts.oauth2.revoke(token, () => {});
    } catch {
      // ignore
    }
  }
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
}

/**
 * Request OAuth 2.0 Access Token via Google Identity Services
 */
export async function requestGoogleAccessToken(): Promise<string> {
  // Check if token already exists and is valid
  const existingToken = getValidGoogleToken();
  if (existingToken) {
    return existingToken;
  }

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      reject(
        new Error(
          'Google Identity Services ยังโหลดไม่เสร็จสมบูรณ์ โปรดลองใหม่อีกครั้งใน 2-3 วินาที หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
        )
      );
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        scope: GOOGLE_SHEETS_SCOPES,
        prompt: '',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error || 'การเชื่อมต่อ Google ถูกปฏิเสธ'));
            return;
          }
          if (response.access_token) {
            storeGoogleToken(response.access_token, response.expires_in || 3599);
            resolve(response.access_token);
          } else {
            reject(new Error('ไม่ได้รับ Access Token จาก Google'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth'));
        }
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

// Thai status label helper
const STATUS_LABELS: Record<string, string> = {
  reported: 'แจ้งซ่อมใหม่',
  pending: 'รอรับเรื่อง',
  acknowledged: 'รับเรื่องแล้ว',
  investigating: 'กำลังตรวจสอบ',
  in_progress: 'กำลังซ่อม',
  waiting_parts: 'รออะไหล่',
  completed: 'ซ่อมเสร็จสมบูรณ์',
  closed: 'ปิดงานเรียบร้อย'
};

const URGENCY_LABELS: Record<string, string> = {
  low: 'ต่ำ (รอได้)',
  medium: 'ปานกลาง',
  high: 'สูง (ด่วน)',
  critical: 'วิกฤต (ด่วนที่สุด)'
};

const ROLE_LABELS: Record<string, string> = {
  user: 'ผู้แจ้งซ่อม (User)',
  technician: 'ช่างเทคนิค (Technician)',
  admin: 'ผู้ดูแลระบบ (Admin)'
};

/**
 * Format ISO date string to human readable Thai date
 */
function formatThaiDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Creates a brand new Google Spreadsheet configured with tabs and formatting
 */
async function createNewRepairSpreadsheet(token: string): Promise<string> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `ระบบแจ้งซ่อมและจัดการอุปกรณ์ IT (Ai Smart Repair) - ฐานข้อมูลกลาง`
      },
      sheets: [
        { properties: { title: 'รายการแจ้งซ่อม' } },
        { properties: { title: 'ข้อมูลผู้แจ้งซ่อม' } },
        { properties: { title: 'ข้อมูลช่างซ่อม' } },
        { properties: { title: 'ข้อมูลแอดมินและผู้ใช้' } },
        { properties: { title: 'ข้อมูลอุปกรณ์คอมพิวเตอร์' } }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'ไม่สามารถสร้าง Google Sheet ใหม่ได้');
  }

  const data = await response.json();
  return data.spreadsheetId;
}

/**
 * Verify if an existing spreadsheet exists and is accessible
 */
async function verifySpreadsheetExists(token: string, spreadsheetId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Ensure required sheets exist in spreadsheet
 */
async function ensureSheetsExist(token: string, spreadsheetId: string): Promise<void> {
  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!metaRes.ok) return;

    const meta = await metaRes.json();
    const existingTitles: string[] = meta?.sheets?.map((s: any) => s.properties?.title) || [];

    const requiredSheets = [
      'รายการแจ้งซ่อม',
      'ข้อมูลผู้แจ้งซ่อม',
      'ข้อมูลช่างซ่อม',
      'ข้อมูลแอดมินและผู้ใช้',
      'ข้อมูลอุปกรณ์คอมพิวเตอร์'
    ];

    const missingSheets = requiredSheets.filter((title) => !existingTitles.includes(title));
    if (missingSheets.length > 0) {
      const requests = missingSheets.map((title) => ({
        addSheet: { properties: { title } }
      }));

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });
    }
  } catch (err) {
    console.warn('Failed to ensure all sheets exist:', err);
  }
}

/**
 * Sync / Export all system data (Repairs, Reporters, Technicians, Admins, Users, Equipment) to Google Sheets
 */
export async function exportAllDataToGoogleSheets(
  token: string,
  data: {
    users: User[];
    repairs: RepairRequest[];
    equipmentList: Equipment[];
  }
): Promise<GoogleSheetsSyncResult> {
  const { users, repairs, equipmentList } = data;

  // 1. Get or create spreadsheet
  let spreadsheetId = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
  if (!spreadsheetId || !(await verifySpreadsheetExists(token, spreadsheetId))) {
    spreadsheetId = await createNewRepairSpreadsheet(token);
    saveGoogleSheetsMeta({ spreadsheetId });
  } else {
    await ensureSheetsExist(token, spreadsheetId);
  }

  // 2. Prepare Tab 1: รายการแจ้งซ่อม (Repairs)
  const repairHeaders = [
    'รหัสใบแจ้งซ่อม',
    'วันที่แจ้งซ่อม',
    'สถานะปัจจุบัน',
    'ระดับความเร่งด่วน',
    'ชื่อผู้แจ้งซ่อม',
    'เบอร์โทรผู้แจ้ง',
    'แผนก/ฝ่าย',
    'อีเมลผู้แจ้ง',
    'รหัสอุปกรณ์',
    'ชื่ออุปกรณ์',
    'ประเภทอุปกรณ์',
    'ยี่ห้อ/รุ่น',
    'สถานที่/ห้อง',
    'หมวดหมู่อาการ',
    'รายละเอียดอาการเสีย',
    'ช่างผู้รับผิดชอบ',
    'เบอร์โทรช่าง',
    'วันที่มอบหมายช่าง',
    'ผลตรวจเช็คของช่าง',
    'แนวทางการซ่อม/แก้ไข',
    'ค่าใช้จ่ายรวม (บาท)',
    'การวิเคราะห์ AI (สรุปสาเหตุ)',
    'อัปเดตล่าสุด'
  ];

  const repairRows = repairs.map((r) => [
    r.ticketNumber,
    formatThaiDateTime(r.createdAt),
    STATUS_LABELS[r.status] || r.status,
    URGENCY_LABELS[r.urgency] || r.urgency,
    r.userName,
    r.userPhone || '-',
    r.userDepartment || '-',
    r.userEmail || '-',
    r.equipmentCode || '-',
    r.equipmentName || '-',
    r.equipmentType || '-',
    `${r.equipmentBrand || ''} ${r.equipmentModel || ''}`.trim() || '-',
    `${r.location || ''} ${r.room ? `(${r.room})` : ''}`.trim() || '-',
    r.category || '-',
    r.symptom || '-',
    r.technicianName || 'ยังไม่กำหนดช่าง',
    r.technicianPhone || '-',
    formatThaiDateTime(r.assignedAt),
    r.inspectionResult || '-',
    r.solution || '-',
    r.repairCost ? r.repairCost.toLocaleString('th-TH') : '0',
    r.aiDiagnosis?.symptomSummary || '-',
    formatThaiDateTime(r.updatedAt)
  ]);

  // 3. Prepare Tab 2: ข้อมูลผู้แจ้งซ่อม (Reporters)
  // Aggregate unique reporters from both repair requests and user accounts
  const reporterMap = new Map<
    string,
    {
      name: string;
      phone: string;
      department: string;
      email: string;
      ticketCount: number;
      lastTicketNumber: string;
      lastTicketStatus: string;
      lastDate: string;
    }
  >();

  // Add from repairs
  repairs.forEach((r) => {
    const key = (r.userName || '').trim().toLowerCase();
    if (!key) return;
    const existing = reporterMap.get(key);
    if (existing) {
      existing.ticketCount += 1;
      if (new Date(r.createdAt) > new Date(existing.lastDate)) {
        existing.lastDate = r.createdAt;
        existing.lastTicketNumber = r.ticketNumber;
        existing.lastTicketStatus = STATUS_LABELS[r.status] || r.status;
        if (r.userPhone) existing.phone = r.userPhone;
        if (r.userDepartment) existing.department = r.userDepartment;
        if (r.userEmail) existing.email = r.userEmail;
      }
    } else {
      reporterMap.set(key, {
        name: r.userName,
        phone: r.userPhone || '-',
        department: r.userDepartment || '-',
        email: r.userEmail || '-',
        ticketCount: 1,
        lastTicketNumber: r.ticketNumber,
        lastTicketStatus: STATUS_LABELS[r.status] || r.status,
        lastDate: r.createdAt
      });
    }
  });

  // Add registered users with role 'user'
  users
    .filter((u) => u.role === 'user')
    .forEach((u) => {
      const key = (u.name || '').trim().toLowerCase();
      if (!reporterMap.has(key)) {
        reporterMap.set(key, {
          name: u.name,
          phone: u.phone || '-',
          department: u.department || '-',
          email: u.email || '-',
          ticketCount: 0,
          lastTicketNumber: '-',
          lastTicketStatus: '-',
          lastDate: u.createdAt
        });
      }
    });

  const reporterHeaders = [
    'ชื่อ-นามสกุล ผู้แจ้งซ่อม',
    'แผนก/ฝ่าย',
    'เบอร์โทรศัพท์ติดต่อ',
    'อีเมล',
    'จำนวนงานที่แจ้งซ่อม (งาน)',
    'รหัสงานล่าสุด',
    'สถานะงานล่าสุด',
    'วันที่แจ้งล่าสุด'
  ];

  const reporterRows = Array.from(reporterMap.values()).map((rep) => [
    rep.name,
    rep.department,
    rep.phone,
    rep.email,
    rep.ticketCount,
    rep.lastTicketNumber,
    rep.lastTicketStatus,
    formatThaiDateTime(rep.lastDate)
  ]);

  // 4. Prepare Tab 3: ข้อมูลช่างซ่อม (Technicians)
  const techUsers = users.filter((u) => u.role === 'technician');
  const techHeaders = [
    'รหัสช่าง',
    'ชื่อ-นามสกุล ช่างซ่อม',
    'อีเมล',
    'เบอร์โทรศัพท์',
    'แผนก/สังกัด',
    'สถานะบัญชี',
    'งานที่กำลังดำเนินการ (งาน)',
    'งานที่ซ่อมเสร็จแล้ว (งาน)',
    'รวมงานที่ได้รับมอบหมาย (งาน)'
  ];

  const techRows = techUsers.map((tech) => {
    const assignedRepairs = repairs.filter(
      (r) => r.technicianId === tech.id || r.technicianName === tech.name
    );
    const inProgress = assignedRepairs.filter((r) =>
      ['acknowledged', 'investigating', 'in_progress', 'waiting_parts'].includes(r.status)
    ).length;
    const completed = assignedRepairs.filter((r) =>
      ['completed', 'closed'].includes(r.status)
    ).length;

    return [
      tech.id,
      tech.name,
      tech.email,
      tech.phone || '-',
      tech.department || 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
      tech.isActive ? 'เปิดใช้งาน (พร้อมปฏิบัติงาน)' : 'ปิดใช้งานชั่วคราว',
      inProgress,
      completed,
      assignedRepairs.length
    ];
  });

  // 5. Prepare Tab 4: ข้อมูลแอดมินและผู้ใช้งานทั้งหมด (Users & Admins)
  const userHeaders = [
    'รหัสผู้ใช้',
    'ชื่อบัญชีผู้ใช้ (Username)',
    'ชื่อ-นามสกุล',
    'บทบาทหน้าที่ (Role)',
    'แผนก/ฝ่าย',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'LINE User ID',
    'สถานะบัญชี',
    'วันที่ลงทะเบียน'
  ];

  const userRows = users.map((u) => [
    u.id,
    u.username || '-',
    u.name,
    ROLE_LABELS[u.role] || u.role,
    u.department || '-',
    u.phone || '-',
    u.email,
    u.lineUserId || '-',
    u.isActive ? 'เปิดใช้งานปกติ' : 'ระงับการใช้งาน',
    formatThaiDateTime(u.createdAt)
  ]);

  // 6. Prepare Tab 5: ข้อมูลอุปกรณ์คอมพิวเตอร์ (Equipment)
  const equipHeaders = [
    'รหัสอุปกรณ์',
    'ชื่ออุปกรณ์',
    'ประเภทอุปกรณ์',
    'ยี่ห้อ',
    'รุ่น',
    'หมายเลขเครื่อง (Serial Number)',
    'สถานที่ตั้ง/ห้อง',
    'วันที่เริ่มใช้งาน',
    'สถานะอุปกรณ์',
    'คะแนนสุขภาพ (%)',
    'จำนวนครั้งที่เคยซ่อม (ครั้ง)',
    'ซ่อมล่าสุดเมื่อ'
  ];

  const equipRows = equipmentList.map((eq) => [
    eq.code,
    eq.name,
    eq.type,
    eq.brand || '-',
    eq.model || '-',
    eq.serialNumber || '-',
    `${eq.location || ''} ${eq.room ? `(${eq.room})` : ''}`.trim() || '-',
    formatThaiDateTime(eq.startDate),
    eq.status === 'active' ? 'พร้อมใช้งาน' : eq.status === 'in_repair' ? 'กำลังส่งซ่อม' : 'ปลดระวาง',
    `${eq.healthScore}%`,
    eq.repairCount || 0,
    formatThaiDateTime(eq.lastRepairDate)
  ]);

  // 7. Push all data in a single BatchUpdate to Google Sheets
  const updateData = [
    {
      range: "'รายการแจ้งซ่อม'!A1",
      values: [repairHeaders, ...repairRows]
    },
    {
      range: "'ข้อมูลผู้แจ้งซ่อม'!A1",
      values: [reporterHeaders, ...reporterRows]
    },
    {
      range: "'ข้อมูลช่างซ่อม'!A1",
      values: [techHeaders, ...techRows]
    },
    {
      range: "'ข้อมูลแอดมินและผู้ใช้'!A1",
      values: [userHeaders, ...userRows]
    },
    {
      range: "'ข้อมูลอุปกรณ์คอมพิวเตอร์'!A1",
      values: [equipHeaders, ...equipRows]
    }
  ];

  const batchWriteRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: updateData
      })
    }
  );

  if (!batchWriteRes.ok) {
    const err = await batchWriteRes.json();
    throw new Error(err?.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Google Sheets');
  }

  const syncedAt = new Date().toISOString();
  saveGoogleSheetsMeta({
    spreadsheetId,
    lastSyncTime: syncedAt
  });

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    counts: {
      repairs: repairRows.length,
      reporters: reporterRows.length,
      technicians: techRows.length,
      users: userRows.length,
      equipment: equipRows.length
    },
    syncedAt
  };
}
