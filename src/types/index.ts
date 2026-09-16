export type UserRole = 'user' | 'technician' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  lineUserId?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export type EquipmentStatus = 'active' | 'in_repair' | 'decommissioned';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  room: string;
  purchaseDate: string;
  startDate: string;
  status: EquipmentStatus;
  specifications?: string;
  healthScore: number; // 0 - 100
  repairCount: number;
  lastRepairDate?: string;
  frequentIssues?: string[];
  replacedParts?: string[];
  assignedUserId?: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RepairStatus =
  | 'reported'        // แจ้งซ่อม
  | 'pending'         // รอรับเรื่อง
  | 'acknowledged'    // รับเรื่องแล้ว
  | 'investigating'   // กำลังตรวจสอบ
  | 'in_progress'     // กำลังซ่อม
  | 'waiting_parts'   // รออะไหล่
  | 'completed'       // ซ่อมเสร็จ
  | 'closed';         // ปิดงาน

export type ProblemCategory = string;

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface PartUsed {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface StatusHistoryItem {
  id: string;
  status: RepairStatus;
  label: string;
  timestamp: string;
  changedBy: string;
  role: UserRole;
  notes?: string;
}

export interface AIDiagnosisResult {
  symptomSummary: string;
  possibleCauses: string[];
  severity: UrgencyLevel;
  severityLabel: string;
  initialChecks: string[];
  advice: string[];
  disclaimer: string;
  confidenceScore?: number;
  analyzedAt: string;
}

export interface SatisfactionRating {
  id: string;
  repairId: string;
  userId: string;
  userName: string;
  overallRating: number; // 1-5
  speedRating: number; // 1-5
  serviceRating: number; // 1-5
  comments: string;
  createdAt: string;
}

export interface RepairRequest {
  id: string;
  ticketNumber: string; // e.g. REP-2026-0001
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userDepartment: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentType: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  location: string;
  room: string;
  category: ProblemCategory;
  urgency: UrgencyLevel;
  symptom: string;
  aiDiagnosis?: AIDiagnosisResult;
  attachments: Attachment[];
  status: RepairStatus;
  statusHistory: StatusHistoryItem[];
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  assignedAt?: string;
  inspectionResult?: string;
  solution?: string;
  partsUsed?: PartUsed[];
  repairCost?: number;
  technicianNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  closedAt?: string;
  rating?: SatisfactionRating;
}

export interface ChatMessage {
  id: string;
  repairId: string;
  ticketNumber: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  repairId: string;
  ticketNumber: string;
  title: string;
  message: string;
  type:
    | 'repair_created'
    | 'tech_assigned'
    | 'status_changed'
    | 'new_message'
    | 'waiting_parts'
    | 'completed'
    | 'closed';
  isRead: boolean;
  createdAt: string;
}

export interface LineNotificationPayload {
  toUserId?: string;
  ticketNumber: string;
  equipmentCode: string;
  equipmentName: string;
  status: RepairStatus;
  statusText: string;
  statusDescription: string;
  technicianName?: string;
  updatedAt: string;
}

export interface LiveToastAlert {
  id: string;
  type: 'new_ticket' | 'status_changed' | 'chat_message' | 'system' | 'test';
  title: string;
  message: string;
  ticketId?: string;
  ticketNumber?: string;
  timestamp: string;
  badgeText?: string;
  badgeColor?: string;
}
