import {
  User,
  Equipment,
  RepairRequest,
  ChatMessage,
  NotificationItem,
  RepairStatus,
  ProblemCategory,
  UrgencyLevel
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'somchai',
    email: 'somchai@institution.ac.th',
    name: 'อ.สมชาย ใจดี',
    role: 'user',
    department: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    phone: '081-234-5678',
    lineUserId: 'U1a2b3c4d5e6f7g8h9i0',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr-2',
    username: 'napha',
    email: 'napha@institution.ac.th',
    name: 'คุณนภา มณีวรรณ',
    role: 'user',
    department: 'กองบริหารงานทั่วไป / งานธุรการ',
    phone: '089-876-5432',
    lineUserId: 'U9z8y7x6w5v4u3t2s1r0',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-15T09:30:00Z',
  },
  {
    id: 'tech-1',
    username: 'prasit_tech',
    email: 'prasit@support.institution.ac.th',
    name: 'ช่างประสิทธิ์ ซ่อมไว',
    role: 'technician',
    department: 'ศูนย์เทคโนโลยีสารสนเทศ (IT Support)',
    phone: '082-345-6789',
    lineUserId: 'Utech1122334455667788',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'tech-2',
    username: 'anan_tech',
    email: 'anan@support.institution.ac.th',
    name: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
    role: 'technician',
    department: 'ศูนย์เทคโนโลยีสารสนเทศ (Network & Hardware)',
    phone: '083-456-7890',
    lineUserId: 'Utech9988776655443322',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    id: 'adm-1',
    username: 'wichai_admin',
    email: 'wichai@admin.institution.ac.th',
    name: 'ผอ.วิชัย ผู้ดูแลระบบ IT',
    role: 'admin',
    department: 'ศูนย์บริการเทคโนโลยีสารสนเทศและการสื่อสาร',
    phone: '080-111-2233',
    lineUserId: 'Uadmin99001122334455',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-001',
    code: 'PC-SCI-01',
    name: 'คอมพิวเตอร์ตั้งโต๊ะ All-in-One ห้องปฏิบัติการ 301',
    type: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
    brand: 'Dell',
    model: 'OptiPlex 7090 Tower',
    serialNumber: 'DL-7090-TH-9942',
    location: 'อาคารวิทยาการคอมพิวเตอร์',
    room: 'ห้องแล็บ 301 (ชั้น 3)',
    purchaseDate: '2023-05-10',
    startDate: '2023-06-01',
    status: 'in_repair',
    specifications: 'Intel Core i7-11700, 16GB DDR4, SSD 512GB NVMe, NVIDIA GTX 1660 Super',
    healthScore: 68,
    repairCount: 3,
    lastRepairDate: '2026-02-18',
    frequentIssues: ['หน้าจอไม่ติดหลังเปิดเครื่อง', 'พัดลม CPU มีเสียงดัง'],
    replacedParts: ['RAM DDR4 8GB', 'Power Supply 500W'],
    assignedUserId: 'usr-1'
  },
  {
    id: 'eq-002',
    code: 'NB-ADMIN-04',
    name: 'โน้ตบุ๊กงานธุรการและสารบรรณ',
    type: 'โน้ตบุ๊ก (Notebook)',
    brand: 'Lenovo',
    model: 'ThinkPad E14 Gen 4',
    serialNumber: 'LN-TP-2024-8831',
    location: 'อาคารอำนวยการ',
    room: 'ห้องสำนักงานกลาง 102',
    purchaseDate: '2024-02-20',
    startDate: '2024-03-01',
    status: 'active',
    specifications: 'AMD Ryzen 5 5625U, 16GB RAM, SSD 512GB, 14 inch FHD IPS',
    healthScore: 92,
    repairCount: 1,
    lastRepairDate: '2025-08-12',
    frequentIssues: ['คีย์บอร์ดพิมพ์บางปุ่มไม่ติด'],
    replacedParts: ['ชุดแป้นพิมพ์คีย์บอร์ด'],
    assignedUserId: 'usr-2'
  },
  {
    id: 'eq-003',
    code: 'PRN-OFFICE-02',
    name: 'เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน กองบริหาร',
    type: 'เครื่องพิมพ์ (Printer)',
    brand: 'HP',
    model: 'LaserJet Pro MFP M428fdw',
    serialNumber: 'HP-MFP-428-9012',
    location: 'อาคารอำนวยการ',
    room: 'ห้องถ่ายเอกสารและพิมพ์งาน 105',
    purchaseDate: '2023-11-15',
    startDate: '2023-12-01',
    status: 'in_repair',
    specifications: 'Monochrome Laser Multifunction (Print, Scan, Copy, Fax), Duplex, Network LAN/Wi-Fi',
    healthScore: 64,
    repairCount: 4,
    lastRepairDate: '2026-01-20',
    frequentIssues: ['กระดาษติดบ่อย', 'ลูกยางดึงกระดาษเสื่อมสภาพ', 'หมึกซีด'],
    replacedParts: ['Pickup Roller', 'ชุดดรัม (Drum Cartridge)'],
    assignedUserId: 'usr-2'
  },
  {
    id: 'eq-004',
    code: 'PJ-CONF-01',
    name: 'โปรเจกเตอร์ห้องประชุมใหญ่สภา',
    type: 'โปรเจกเตอร์ (Projector)',
    brand: 'Epson',
    model: 'EB-2250U Full HD',
    serialNumber: 'EP-PJ-5000L-331',
    location: 'อาคารเฉลิมพระเกียรติ',
    room: 'ห้องประชุมใหญ่ ชั้น 4',
    purchaseDate: '2022-08-10',
    startDate: '2022-09-01',
    status: 'active',
    specifications: '5,000 Lumens, WUXGA (1920x1200), HDMI x2, Wireless LAN',
    healthScore: 78,
    repairCount: 2,
    lastRepairDate: '2025-11-05',
    frequentIssues: ['หลอดภาพตัดอัตโนมัติเนื่องจากความร้อนสะสม', 'ภาพเหลือง'],
    replacedParts: ['หลอดภาพโปรเจกเตอร์', 'แผ่นกรองฝุ่น Filter'],
    assignedUserId: 'usr-1'
  },
  {
    id: 'eq-005',
    code: 'SW-NET-CORE-01',
    name: 'สวิตช์เครือข่ายหลัก Core Switch อาคาร 3',
    type: 'อุปกรณ์เครือข่าย (Network)',
    brand: 'Cisco',
    model: 'Catalyst 9200L 48-Port PoE+',
    serialNumber: 'CS-9200L-48P-552',
    location: 'อาคารวิทยาการคอมพิวเตอร์',
    room: 'ห้อง Server/MDF ชั้น 2',
    purchaseDate: '2023-01-15',
    startDate: '2023-02-01',
    status: 'active',
    specifications: '48 ports PoE+, 4x 10G SFP+ Uplinks, Layer 3 Enterprise',
    healthScore: 95,
    repairCount: 0,
    lastRepairDate: undefined,
    frequentIssues: [],
    replacedParts: [],
  },
  {
    id: 'eq-006',
    code: 'UPS-SRV-03',
    name: 'เครื่องสำรองไฟตู้เซิร์ฟเวอร์ระบบสารสนเทศ',
    type: 'เครื่องสำรองไฟ (UPS)',
    brand: 'APC',
    model: 'Smart-UPS RT 3000VA 230V',
    serialNumber: 'APC-SURT3000-112',
    location: 'อาคารเฉลิมพระเกียรติ',
    room: 'ห้อง Data Center ชั้น 1',
    purchaseDate: '2022-03-20',
    startDate: '2022-04-01',
    status: 'active',
    specifications: '3000VA / 2100W, On-line Double Conversion, Rack/Tower',
    healthScore: 71,
    repairCount: 2,
    lastRepairDate: '2025-06-14',
    frequentIssues: ['แบตเตอรี่เสื่อมเก็บไฟได้ไม่ถึง 5 นาที', 'เสียงเตือน Battery Replacement'],
    replacedParts: ['ชุดแบตเตอรี่แห้ง 12V 9Ah x 8 ลูก'],
  },
  {
    id: 'eq-007',
    code: 'PC-LAB-22',
    name: 'คอมพิวเตอร์ปฏิบัติการกราฟิก ห้อง 402',
    type: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
    brand: 'Asus',
    model: 'ExpertCenter D700TD',
    serialNumber: 'AS-D700-TH-4482',
    location: 'อาคารวิทยาการคอมพิวเตอร์',
    room: 'ห้องปฏิบัติการมัลติมีเดีย 402',
    purchaseDate: '2023-08-15',
    startDate: '2023-09-01',
    status: 'active',
    specifications: 'Intel Core i9-12900, 32GB RAM, 1TB SSD, RTX 3070 8GB',
    healthScore: 88,
    repairCount: 1,
    lastRepairDate: '2025-09-04',
    frequentIssues: ['บูตไม่ขึ้นจอฟ้า BSoD'],
    replacedParts: ['สายสัญญาณ DisplayPort'],
    assignedUserId: 'usr-1'
  },
  {
    id: 'eq-008',
    code: 'MN-FAC-09',
    name: 'จอภาพ LED 27 นิ้ว ห้องพักอาจารย์',
    type: 'จอภาพ (Monitor)',
    brand: 'LG',
    model: '27QN600-B 27" QHD IPS',
    serialNumber: 'LG-27Q-88319',
    location: 'อาคารวิทยาการคอมพิวเตอร์',
    room: 'ห้องพักอาจารย์ภาควิชา 205',
    purchaseDate: '2024-01-10',
    startDate: '2024-02-01',
    status: 'active',
    specifications: '27 inch 2560x1440 QHD, IPS 75Hz, HDR10, AMD FreeSync',
    healthScore: 98,
    repairCount: 0,
    lastRepairDate: undefined,
    frequentIssues: [],
    replacedParts: []
  }
];

export const INITIAL_REPAIRS: RepairRequest[] = [
  {
    id: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    userId: 'usr-1',
    userName: 'อ.สมชาย ใจดี',
    userEmail: 'somchai@institution.ac.th',
    userPhone: '081-234-5678',
    userDepartment: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    equipmentId: 'eq-001',
    equipmentCode: 'PC-SCI-01',
    equipmentName: 'คอมพิวเตอร์ตั้งโต๊ะ All-in-One ห้องปฏิบัติการ 301',
    equipmentType: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
    equipmentBrand: 'Dell',
    equipmentModel: 'OptiPlex 7090 Tower',
    location: 'อาคารวิทยาการคอมพิวเตอร์',
    room: 'ห้องแล็บ 301 (ชั้น 3)',
    category: 'hardware',
    urgency: 'high',
    symptom: 'เปิดสวิตช์เครื่องแล้วไฟติด แต่หน้าจอไม่แสดงผล พัดลมหมุนแรงผิดปกติ มีเสียงบี๊บ 3 ครั้งสั้น',
    aiDiagnosis: {
      symptomSummary: 'เปิดเครื่องไฟเข้าแต่จอไม่ติด มีเสียงบี๊บ 3 ครั้ง และพัดลมเร่งความเร็ว',
      possibleCauses: [
        'แรม (RAM) สกปรก หลวม หรือชำรุด',
        'การ์ดจอแยก (GPU) สัญญาณขัดข้องหรือติดตั้งไม่แน่น',
        'สายต่อสัญญาณจอ (HDMI/DisplayPort) เสียหรือต่อไม่สนิท'
      ],
      severity: 'high',
      severityLabel: 'สูง (ต้องการการตรวจสอบโดยช่าง)',
      initialChecks: [
        'ตรวจสอบสายจอทั้งฝั่งเคสและจอภาพว่าเสียบแน่นดีหรือไม่',
        'ทดลองปิดสวิตช์ ปลดปลั๊กไฟ 30 วินาที แล้วเปิดใหม่เพื่อเคลียร์ประจุไฟฟ้า',
        'สังเกตไฟสถานะที่จอภาพว่าขึ้น No Signal หรือไฟส้ม'
      ],
      advice: [
        'ห้ามเปิดฝาเคสเพื่อถอดชิ้นส่วนเองหากยังไม่มีอุปกรณ์ป้องกันไฟฟ้าสถิต',
        'บันทึกรหัสเสียงบี๊บแจ้งช่างเพื่อความรวดเร็วในการจัดเตรียมอะไหล่'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริงเพื่อยืนยันสาเหตุ',
      confidenceScore: 92,
      analyzedAt: '2026-03-10T09:15:00Z'
    },
    attachments: [
      {
        id: 'att-1',
        name: 'pc-screen-nosignal.jpg',
        url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
        size: 1420000,
        type: 'image/jpeg',
        uploadedAt: '2026-03-10T09:12:00Z'
      },
      {
        id: 'att-2',
        name: 'pc-rear-cables.jpg',
        url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
        size: 980000,
        type: 'image/jpeg',
        uploadedAt: '2026-03-10T09:13:00Z'
      }
    ],
    status: 'in_progress',
    statusHistory: [
      {
        id: 'sh-1',
        status: 'reported',
        label: 'แจ้งซ่อม',
        timestamp: '2026-03-10T09:15:00Z',
        changedBy: 'อ.สมชาย ใจดี',
        role: 'user',
        notes: 'ผู้ใช้ส่งคำขอแจ้งซ่อมผ่านระบบออนไลน์'
      },
      {
        id: 'sh-2',
        status: 'pending',
        label: 'รอรับเรื่อง',
        timestamp: '2026-03-10T09:16:00Z',
        changedBy: 'ระบบอัตโนมัติ',
        role: 'admin',
        notes: 'ส่งข้อความแจ้งเตือนผ่าน LINE Notify ถึงทีมช่าง IT'
      },
      {
        id: 'sh-3',
        status: 'acknowledged',
        label: 'รับเรื่องแล้ว',
        timestamp: '2026-03-10T09:40:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'ช่างรับมอบหมายงานและตรวจสอบข้อมูลเบื้องต้น'
      },
      {
        id: 'sh-4',
        status: 'investigating',
        label: 'กำลังตรวจสอบ',
        timestamp: '2026-03-10T10:15:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'เข้าตรวจสอบหน้างานที่ห้องแล็บ 301 พบอาการ RAM ขัดข้องจริง'
      },
      {
        id: 'sh-5',
        status: 'in_progress',
        label: 'กำลังซ่อม',
        timestamp: '2026-03-10T11:00:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'กำลังทำความสะอาด Slot RAM และทดสอบสลับ Slot เพื่อระบุตัวที่เสีย'
      }
    ],
    technicianId: 'tech-1',
    technicianName: 'ช่างประสิทธิ์ ซ่อมไว',
    technicianPhone: '082-345-6789',
    assignedAt: '2026-03-10T09:40:00Z',
    inspectionResult: 'ตรวจพบ RAM DDR4 8GB แถวที่ 2 มีคราบออกไซด์ที่แถบทองแดง และช่องสล็อตมีฝุ่นสะสม ทำให้เมนบอร์ดส่งเสียงเตือน POST Code RAM Error',
    solution: 'ทำความสะอาดหน้าสัมผัส RAM ด้วยน้ำยาล้างหน้าสัมผัสอิเล็กทรอนิกส์ เป่าฝุ่นช่อง Slot และทดสอบด้วย MemTest86',
    partsUsed: [
      {
        id: 'p-1',
        name: 'น้ำยาทำความสะอาด Contact Cleaner',
        quantity: 1,
        unitPrice: 180,
        totalPrice: 180
      }
    ],
    repairCost: 180,
    technicianNotes: 'แนะนำให้ครูผู้ดูแลห้องปิดแอร์และคลุมผ้าคลุมหลังใช้งาน เพื่อป้องกันฝุ่นเกาะ',
    createdAt: '2026-03-10T09:15:00Z',
    updatedAt: '2026-03-10T11:00:00Z'
  },
  {
    id: 'rep-002',
    ticketNumber: 'REP-2026-0002',
    userId: 'usr-2',
    userName: 'คุณนภา มณีวรรณ',
    userEmail: 'napha@institution.ac.th',
    userPhone: '089-876-5432',
    userDepartment: 'กองบริหารงานทั่วไป / งานธุรการ',
    equipmentId: 'eq-003',
    equipmentCode: 'PRN-OFFICE-02',
    equipmentName: 'เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน กองบริหาร',
    equipmentType: 'เครื่องพิมพ์ (Printer)',
    equipmentBrand: 'HP',
    equipmentModel: 'LaserJet Pro MFP M428fdw',
    location: 'อาคารอำนวยการ',
    room: 'ห้องถ่ายเอกสารและพิมพ์งาน 105',
    category: 'printer',
    urgency: 'medium',
    symptom: 'เครื่องพิมพ์ดึงกระดาษซ้อนกัน 2-3 แผ่น แล้วติดขัดในถาดป้อนกระดาษ มีไฟแดงกระพริบเตือน Paper Jam ตลอดเวลา',
    aiDiagnosis: {
      symptomSummary: 'เครื่องพิมพ์ดึงกระดาษซ้อนกันและติดขัด แจ้งเตือน Paper Jam',
      possibleCauses: [
        'ลูกยางดึงกระดาษ (Pickup Roller / Separation Pad) สึกหรอหรือมีคราบแป้งกระดาษสะสม',
        'กระดาษมีความชื้นสูงทำให้แผ่นติดกัน',
        'เซนเซอร์ตรวจจับแนวกระดาษมีสิ่งแปลกปลอมขวาง'
      ],
      severity: 'medium',
      severityLabel: 'ปานกลาง',
      initialChecks: [
        'คลี่และดัดกระดาษใหม่ก่อนใส่ลงถาด',
        'ตรวจดูภายในช่องเปิดด้านหลังว่ามีเศษกระดาษฉีกขาดค้างอยู่หรือไม่',
        'ปิดสวิตช์เครื่องแล้วค่อยดึงกระดาษออกตามทิศทางลูกศรอย่างเบามือ'
      ],
      advice: [
        'ไม่ควรใช้ของมีคม เช่น คัตเตอร์หรือกรรไกร เขี่ยกระดาษ เพราะจะทำให้ลูกยางเป็นรอย'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริง',
      confidenceScore: 88,
      analyzedAt: '2026-03-09T14:20:00Z'
    },
    attachments: [
      {
        id: 'att-3',
        name: 'printer-jam-error.jpg',
        url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80',
        size: 1150000,
        type: 'image/jpeg',
        uploadedAt: '2026-03-09T14:18:00Z'
      }
    ],
    status: 'waiting_parts',
    statusHistory: [
      {
        id: 'sh-201',
        status: 'reported',
        label: 'แจ้งซ่อม',
        timestamp: '2026-03-09T14:20:00Z',
        changedBy: 'คุณนภา มณีวรรณ',
        role: 'user',
        notes: 'แจ้งซ่อมเครื่องพิมพ์งานด่วน'
      },
      {
        id: 'sh-202',
        status: 'acknowledged',
        label: 'รับเรื่องแล้ว',
        timestamp: '2026-03-09T14:50:00Z',
        changedBy: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
        role: 'technician',
        notes: 'ช่างอนันต์รับเรื่อง'
      },
      {
        id: 'sh-203',
        status: 'investigating',
        label: 'กำลังตรวจสอบ',
        timestamp: '2026-03-09T15:30:00Z',
        changedBy: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
        role: 'technician',
        notes: 'รื้อตรวจชุดฟีด พบ Separation Pad แบนราบหมดสภาพ'
      },
      {
        id: 'sh-204',
        status: 'waiting_parts',
        label: 'รออะไหล่',
        timestamp: '2026-03-09T16:30:00Z',
        changedBy: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
        role: 'technician',
        notes: 'ทำเรื่องเบิกชุด Roller & Separation Pad ของ HP จากคลังพัสดุกลาง คาดว่าจะได้ของภายใน 1-2 วัน'
      }
    ],
    technicianId: 'tech-2',
    technicianName: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
    technicianPhone: '083-456-7890',
    assignedAt: '2026-03-09T14:50:00Z',
    inspectionResult: 'ลูกยางดึงกระดาษและแผ่น Separation Pad สึกหรอเนื่องจากพิมพ์เอกสารเกิน 80,000 แผ่น',
    solution: 'รอเปลี่ยนชุดลูกยาง HP Tray 2 Roller Assembly ใหม่ทั้งชุด',
    partsUsed: [
      {
        id: 'p-201',
        name: 'HP Tray 2 Roller & Pad Kit',
        partNumber: 'RM2-5452-000CN',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650
      }
    ],
    repairCost: 650,
    technicianNotes: 'ระหว่างรออะไหล่ ได้แนะนำให้ใช้เครื่องพิมพ์ตัวสำรองห้อง 108 ชั่วคราว',
    createdAt: '2026-03-09T14:20:00Z',
    updatedAt: '2026-03-09T16:30:00Z'
  },
  {
    id: 'rep-003',
    ticketNumber: 'REP-2026-0003',
    userId: 'usr-1',
    userName: 'อ.สมชาย ใจดี',
    userEmail: 'somchai@institution.ac.th',
    userPhone: '081-234-5678',
    userDepartment: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    equipmentId: 'eq-004',
    equipmentCode: 'PJ-CONF-01',
    equipmentName: 'โปรเจกเตอร์ห้องประชุมใหญ่สภา',
    equipmentType: 'โปรเจกเตอร์ (Projector)',
    equipmentBrand: 'Epson',
    equipmentModel: 'EB-2250U Full HD',
    location: 'อาคารเฉลิมพระเกียรติ',
    room: 'ห้องประชุมใหญ่ ชั้น 4',
    category: 'peripheral',
    urgency: 'critical',
    symptom: 'เปิดฉายงานได้ประมาณ 10 นาทีแล้วดับเอง ไฟเตือน Lamp และ Temp กระพริบสีส้ม มีเสียงพัดลมดังผิดปกติ',
    aiDiagnosis: {
      symptomSummary: 'โปรเจกเตอร์ตัดการทำงานหลังฉาย 10 นาที ไฟ Lamp & Temp กระพริบเตือน',
      possibleCauses: [
        'ความร้อนสะสมสูงเกินพิกัด (Overheating) เนื่องจากแผ่นกรองฝุ่นตัน',
        'พัดลมระบายความร้อนหมุนช้าหรือเสีย',
        'หลอดภาพใกล้หมดอายุการใช้งาน (Lamp Life Exceeded)'
      ],
      severity: 'critical',
      severityLabel: 'ฉุกเฉินเร่งด่วน',
      initialChecks: [
        'ตรวจสอบช่องระบายลมว่ามีสิ่งของบังหรือไม่',
        'ห้ามดึงปลั๊กออกทันทีขณะเครื่องยังร้อน รอพัดลม Cool-down หยุดสนิทก่อน'
      ],
      advice: [
        'ต้องถอดทำความสะอาดฟิลเตอร์ด่วน และเช็คชั่วโมงหลอดภาพในหน้าเมนู Service'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริง',
      confidenceScore: 95,
      analyzedAt: '2026-03-05T08:30:00Z'
    },
    attachments: [
      {
        id: 'att-4',
        name: 'projector-warning-led.jpg',
        url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        size: 1320000,
        type: 'image/jpeg',
        uploadedAt: '2026-03-05T08:28:00Z'
      }
    ],
    status: 'closed',
    statusHistory: [
      {
        id: 'sh-301',
        status: 'reported',
        label: 'แจ้งซ่อม',
        timestamp: '2026-03-05T08:30:00Z',
        changedBy: 'อ.สมชาย ใจดี',
        role: 'user',
        notes: 'แจ้งด่วน มีประชุมคณะบดีบ่ายนี้'
      },
      {
        id: 'sh-302',
        status: 'acknowledged',
        label: 'รับเรื่องแล้ว',
        timestamp: '2026-03-05T08:35:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'ทีมช่างเข้าตรวจสอบทันที'
      },
      {
        id: 'sh-303',
        status: 'in_progress',
        label: 'กำลังซ่อม',
        timestamp: '2026-03-05T09:00:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'ถอดแผ่นกรองฝุ่น เป่าทำความสะอาด และเปลี่ยนฟิลเตอร์ใหม่'
      },
      {
        id: 'sh-304',
        status: 'completed',
        label: 'ซ่อมเสร็จ',
        timestamp: '2026-03-05T10:30:00Z',
        changedBy: 'ช่างประสิทธิ์ ซ่อมไว',
        role: 'technician',
        notes: 'ทดสอบฉายต่อเนื่อง 1 ชั่วโมง อุณหภูมิปกติ ภาพคมชัด พร้อมใช้งาน'
      },
      {
        id: 'sh-305',
        status: 'closed',
        label: 'ปิดงาน',
        timestamp: '2026-03-05T11:00:00Z',
        changedBy: 'อ.สมชาย ใจดี',
        role: 'user',
        notes: 'ผู้แจ้งซ่อมตรวจสอบการใช้งานและปิดงานเรียบร้อย'
      }
    ],
    technicianId: 'tech-1',
    technicianName: 'ช่างประสิทธิ์ ซ่อมไว',
    technicianPhone: '082-345-6789',
    assignedAt: '2026-03-05T08:35:00Z',
    inspectionResult: 'แผ่นกรองอากาศฝุ่นหนาตัน 100% ทำให้เซนเซอร์ Thermal Cut-off ทำงานตัดไฟอัตโนมัติเพื่อป้องกันหลอดภาพระเบิด',
    solution: 'เป่าทำความสะอาดภายในด้วยเครื่องเป่าลมแรงดันต่ำ ล้างและเปลี่ยนแผ่นกรอง Air Filter และรีเซ็ตชั่วโมงเตือนฟิลเตอร์',
    partsUsed: [
      {
        id: 'p-301',
        name: 'Epson ELPAF41 Air Filter',
        quantity: 1,
        unitPrice: 420,
        totalPrice: 420
      }
    ],
    repairCost: 420,
    technicianNotes: 'งานเสร็จทันเวลาการประชุม ใช้งานได้ตามปกติ',
    createdAt: '2026-03-05T08:30:00Z',
    updatedAt: '2026-03-05T11:00:00Z',
    completedAt: '2026-03-05T10:30:00Z',
    closedAt: '2026-03-05T11:00:00Z',
    rating: {
      id: 'rat-01',
      repairId: 'rep-003',
      userId: 'usr-1',
      userName: 'อ.สมชาย ใจดี',
      overallRating: 5,
      speedRating: 5,
      serviceRating: 5,
      comments: 'ช่างประสิทธิ์มาไวมาก ซ่อมเร็วทันการประชุมใหญ่ ขอบคุณมากครับ',
      createdAt: '2026-03-05T11:05:00Z'
    }
  },
  {
    id: 'rep-004',
    ticketNumber: 'REP-2026-0004',
    userId: 'usr-2',
    userName: 'คุณนภา มณีวรรณ',
    userEmail: 'napha@institution.ac.th',
    userPhone: '089-876-5432',
    userDepartment: 'กองบริหารงานทั่วไป / งานธุรการ',
    equipmentId: 'eq-002',
    equipmentCode: 'NB-ADMIN-04',
    equipmentName: 'โน้ตบุ๊กงานธุรการและสารบรรณ',
    equipmentType: 'โน้ตบุ๊ก (Notebook)',
    equipmentBrand: 'Lenovo',
    equipmentModel: 'ThinkPad E14 Gen 4',
    location: 'อาคารอำนวยการ',
    room: 'ห้องสำนักงานกลาง 102',
    category: 'software',
    urgency: 'low',
    symptom: 'ระบบแจ้งเตือน Windows License กำลังหมดอายุ และโปรแกรมสารบรรณอิเล็กทรอนิกส์เปิดแล้วเด้งออก',
    aiDiagnosis: {
      symptomSummary: 'Windows License ใกล้หมดอายุ และโปรแกรมเฉพาะทางขัดข้อง',
      possibleCauses: [
        'เครื่องหลุดจากการเชื่อมต่อกับเซิร์ฟเวอร์ KMS ของสถาบัน',
        'แคชของโปรแกรมสารบรรณหรือไฟล์ Java Runtime เสียหาย'
      ],
      severity: 'low',
      severityLabel: 'ต่ำ',
      initialChecks: [
        'เชื่อมต่อ VPN ของสถาบัน หรือเสียบสาย LAN ตรงกับเครือข่ายภายใน',
        'รันคำสั่ง slmgr /ato เพื่อต่ออายุ License อัตโนมัติ'
      ],
      advice: [
        'สามารถติดต่อช่างผ่านรีโมต AnyDesk โดยไม่ต้องยกเครื่องมาที่ศูนย์ IT'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริง',
      confidenceScore: 90,
      analyzedAt: '2026-03-12T10:00:00Z'
    },
    attachments: [],
    status: 'pending',
    statusHistory: [
      {
        id: 'sh-401',
        status: 'reported',
        label: 'แจ้งซ่อม',
        timestamp: '2026-03-12T10:00:00Z',
        changedBy: 'คุณนภา มณีวรรณ',
        role: 'user',
        notes: 'แจ้งปรับปรุงซอฟต์แวร์และ License'
      },
      {
        id: 'sh-402',
        status: 'pending',
        label: 'รอรับเรื่อง',
        timestamp: '2026-03-12T10:01:00Z',
        changedBy: 'ระบบอัตโนมัติ',
        role: 'admin',
        notes: 'รอช่างว่างเข้ามารับมอบหมายงาน'
      }
    ],
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-12T10:01:00Z'
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    repairId: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    senderId: 'usr-1',
    senderName: 'อ.สมชาย ใจดี',
    senderRole: 'user',
    message: 'สวัสดีครับช่างประสิทธิ์ ตอนนี้ผมต้องใช้เครื่องเตรียมสอน มีโอกาสเสร็จก่อนเที่ยงไหมครับ',
    timestamp: '2026-03-10T10:20:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    repairId: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    senderId: 'tech-1',
    senderName: 'ช่างประสิทธิ์ ซ่อมไว',
    senderRole: 'technician',
    message: 'สวัสดีครับอาจารย์ กำลังทำความสะอาด Slot RAM และล้างคราบออกไซด์อยู่ครับ หากไม่มีชิ้นส่วนไหนเสีย คาดว่าเสร็จก่อน 11:30 น. แน่นอนครับ',
    timestamp: '2026-03-10T10:25:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    repairId: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    senderId: 'usr-1',
    senderName: 'อ.สมชาย ใจดี',
    senderRole: 'user',
    message: 'ขอบคุณมากครับ ถ้าเทสเสร็จแล้วแจ้งในระบบได้เลยครับ เดี๋ยวผมแวะไปรับที่ห้องแล็บครับ',
    timestamp: '2026-03-10T10:30:00Z',
    isRead: true
  },
  {
    id: 'msg-4',
    repairId: 'rep-002',
    ticketNumber: 'REP-2026-0002',
    senderId: 'tech-2',
    senderName: 'ช่างอนันต์ ฮาร์ดแวร์โปร',
    senderRole: 'technician',
    message: 'เรียนคุณนภา แจ้งความคืบหน้าครับ ตอนนี้ตรวจพบว่าลูกยางดึงกระดาษสึกหรอ ผมได้ทำเรื่องเบิกอะไหล่ชุดใหม่เรียบร้อยแล้ว คาดว่าของจะเข้าช่วงบ่ายวันพุธครับ',
    timestamp: '2026-03-09T16:35:00Z',
    isRead: true
  },
  {
    id: 'msg-5',
    repairId: 'rep-002',
    ticketNumber: 'REP-2026-0002',
    senderId: 'usr-2',
    senderName: 'คุณนภา มณีวรรณ',
    senderRole: 'user',
    message: 'รับทราบค่ะช่างอนันต์ เดี๋ยวช่วงนี้ไปใช้ห้อง 108 พลางๆ ก่อน ขอบคุณนะคะ',
    timestamp: '2026-03-09T16:40:00Z',
    isRead: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    repairId: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    title: '🔧 อัปเดตสถานะงานซ่อม',
    message: 'งานซ่อม REP-2026-0001 เปลี่ยนสถานะเป็น "กำลังซ่อม" โดย ช่างประสิทธิ์ ซ่อมไว',
    type: 'status_changed',
    isRead: false,
    createdAt: '2026-03-10T11:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-1',
    repairId: 'rep-001',
    ticketNumber: 'REP-2026-0001',
    title: '💬 ข้อความใหม่จากช่างซ่อม',
    message: 'ช่างประสิทธิ์ ซ่อมไว ได้ตอบกลับข้อความในงานซ่อม REP-2026-0001',
    type: 'new_message',
    isRead: false,
    createdAt: '2026-03-10T10:25:00Z'
  },
  {
    id: 'notif-3',
    userId: 'usr-2',
    repairId: 'rep-002',
    ticketNumber: 'REP-2026-0002',
    title: '📦 รออะไหล่ชิ้นส่วน',
    message: 'งานซ่อมเครื่องพิมพ์ REP-2026-0002 อยู่ระหว่างรอเบิกอะไหล่ HP Tray 2 Roller Kit',
    type: 'waiting_parts',
    isRead: true,
    createdAt: '2026-03-09T16:30:00Z'
  },
  {
    id: 'notif-4',
    userId: 'usr-1',
    repairId: 'rep-003',
    ticketNumber: 'REP-2026-0003',
    title: '✅ งานซ่อมเสร็จสมบูรณ์',
    message: 'งานซ่อมโปรเจกเตอร์ REP-2026-0003 ซ่อมเสร็จแล้ว ขอเชิญประเมินความพึงพอใจการให้บริการ',
    type: 'completed',
    isRead: true,
    createdAt: '2026-03-05T10:30:00Z'
  }
];

export const STATUS_CONFIG: Record<
  RepairStatus,
  { label: string; bg: string; text: string; border: string; stepOrder: number; description: string }
> = {
  reported: {
    label: 'แจ้งซ่อม',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    stepOrder: 1,
    description: 'ผู้ใช้งานส่งคำขอแจ้งซ่อมเข้าสู่ระบบ'
  },
  pending: {
    label: 'รอรับเรื่อง',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    stepOrder: 2,
    description: 'ระบบกำลังส่งต่องานไปยังทีมช่างประจำพื้นที่'
  },
  acknowledged: {
    label: 'รับเรื่องแล้ว',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    stepOrder: 3,
    description: 'ช่างเทคนิคได้กดรับมอบหมายงานซ่อม'
  },
  investigating: {
    label: 'กำลังตรวจสอบ',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    stepOrder: 4,
    description: 'ช่างกำลังตรวจวิเคราะห์หาสาเหตุของอาการเสีย'
  },
  in_progress: {
    label: 'กำลังซ่อม',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    stepOrder: 5,
    description: 'ช่างกำลังดำเนินการซ่อมแซม ปรับแต่ง หรือแก้ไข'
  },
  waiting_parts: {
    label: 'รออะไหล่',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    stepOrder: 6,
    description: 'อยู่ระหว่างสั่งซื้อหรือรอเบิกอะไหล่จากคลัง'
  },
  completed: {
    label: 'ซ่อมเสร็จ',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    stepOrder: 7,
    description: 'อุปกรณ์ซ่อมแซมและทดสอบการทำงานเรียบร้อยแล้ว'
  },
  closed: {
    label: 'ปิดงาน',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    stepOrder: 8,
    description: 'ผู้แจ้งรับอุปกรณ์คืนและประเมินความพึงพอใจแล้ว'
  }
};

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  hardware: { label: 'ฮาร์ดแวร์ / อะไหล่ชำรุด', icon: 'Cpu' },
  software: { label: 'ซอฟต์แวร์ / ระบบปฏิบัติการ', icon: 'Code' },
  network: { label: 'ระบบเครือข่าย / อินเทอร์เน็ต', icon: 'Wifi' },
  peripheral: { label: 'อุปกรณ์ต่อพ่วง / จอภาพ / สายสัญญาณ', icon: 'Monitor' },
  printer: { label: 'เครื่องพิมพ์ / หมึก / กระดาษติด', icon: 'Printer' },
  power: { label: 'ระบบไฟฟ้า / แบตเตอรี่ / UPS', icon: 'Zap' },
  other: { label: 'ปัญหาอื่นๆ', icon: 'HelpCircle' }
};

export const getCategoryLabel = (category?: string): string => {
  if (!category || !category.trim()) return 'ทั่วไป';
  return CATEGORY_LABELS[category]?.label || category;
};

export const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { label: string; bg: string; text: string; dotColor: string }
> = {
  low: {
    label: 'ต่ำ (รอได้ 3-5 วัน)',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dotColor: 'bg-slate-400'
  },
  medium: {
    label: 'ปานกลาง (ภายใน 1-2 วัน)',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dotColor: 'bg-blue-500'
  },
  high: {
    label: 'สูง (ภายในวันนี้)',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dotColor: 'bg-orange-500'
  },
  critical: {
    label: 'ฉุกเฉินเร่งด่วน (ทันที / ระบบล่ม)',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dotColor: 'bg-rose-500 animate-pulse'
  }
};
