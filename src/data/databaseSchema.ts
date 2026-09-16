export const FULL_DATABASE_SCHEMA_SQL = `-- ==========================================================
-- แอปพลิเคชันแจ้งซ่อมเครื่องคอมพิวเตอร์
-- Database Schema (PostgreSQL / MySQL / SQLite Compatible)
-- Generated for Enterprise & Educational Institutions
-- ==========================================================

-- 1. ตารางประเภทผู้ใช้งานและบัญชีผู้ใช้ (Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'technician', 'admin')),
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    line_user_id VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางหมวดหมู่สถานะงานซ่อม (Repair Status Master)
CREATE TABLE IF NOT EXISTS repair_status (
    id VARCHAR(20) PRIMARY KEY,
    name_th VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    badge_color VARCHAR(30),
    description TEXT
);

-- 3. ตารางข้อมูลครุภัณฑ์/อุปกรณ์คอมพิวเตอร์ (Equipment)
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- เช่น PC-SCI-01
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,        -- เช่น PC, Notebook, Printer
    brand VARCHAR(50),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    location VARCHAR(100) NOT NULL,   -- อาคาร
    room VARCHAR(50) NOT NULL,       -- ห้อง
    start_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_repair', 'decommissioned')),
    health_score INT DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    repair_count INT DEFAULT 0,
    last_repair_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางงานแจ้งซ่อมหลัก (Repair Requests)
CREATE TABLE IF NOT EXISTS repair_requests (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(30) UNIQUE NOT NULL, -- เช่น REP-2026-0001
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_id VARCHAR(36) NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    symptom TEXT NOT NULL,
    ai_diagnosis_json JSONB,                   -- ผลวิเคราะห์อาการจาก AI
    status VARCHAR(20) NOT NULL DEFAULT 'reported',
    technician_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    inspection_result TEXT,
    solution TEXT,
    repair_cost NUMERIC(10, 2) DEFAULT 0.00,
    technician_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 5. ตารางประวัติการเปลี่ยนสถานะ (Repair Status History)
CREATE TABLE IF NOT EXISTS repair_status_history (
    id VARCHAR(36) PRIMARY KEY,
    repair_id VARCHAR(36) NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(36) NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางรายการอะไหล่ที่ใช้ในการซ่อม (Repair Parts)
CREATE TABLE IF NOT EXISTS repair_parts (
    id VARCHAR(36) PRIMARY KEY,
    repair_id VARCHAR(36) NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    part_name VARCHAR(150) NOT NULL,
    part_number VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ตารางข้อความแชตระหว่างช่างกับผู้แจ้ง (Chat Messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    repair_id VARCHAR(36) NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ตารางประเมินความพึงพอใจ (Satisfaction Ratings)
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
    id VARCHAR(36) PRIMARY KEY,
    repair_id VARCHAR(36) UNIQUE NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    speed_rating INT NOT NULL CHECK (speed_rating BETWEEN 1 AND 5),
    service_rating INT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_repairs_user ON repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repairs_equipment ON repair_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_repairs_tech ON repair_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_chat_repair ON chat_messages(repair_id);
`;

export const DATABASE_SQL_SCHEMA = FULL_DATABASE_SCHEMA_SQL;

export interface TableColumnSchema {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface TableSchemaMeta {
  tableName: string;
  description: string;
  columns: TableColumnSchema[];
}

export const SCHEMA_TABLES: TableSchemaMeta[] = [
  {
    tableName: 'users',
    description: 'จัดเก็บบัญชีผู้ใช้ สิทธิ์การเข้าถึง และการเชื่อมต่อ LINE User ID',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', constraints: 'PRIMARY KEY', description: 'รหัสผู้ใช้งาน (UUID)' },
      { name: 'username', type: 'VARCHAR(50)', constraints: 'UNIQUE, NOT NULL', description: 'ชื่อสำหรับเข้าสู่ระบบ' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'รหัสผ่านเข้ารหัสด้วย bcrypt' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'ชื่อ-นามสกุล' },
      { name: 'role', type: 'VARCHAR(20)', constraints: "CHECK ('user','technician','admin')", description: 'ระดับสิทธิ์' },
      { name: 'department', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'แผนก/สาขาวิชา' },
      { name: 'line_user_id', type: 'VARCHAR(50)', constraints: 'NULL', description: 'รหัส LINE Messaging API' }
    ]
  },
  {
    tableName: 'equipment',
    description: 'จัดเก็บครุภัณฑ์คอมพิวเตอร์ อาคาร ห้อง และคะแนนสุขภาพ (Health Score)',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', constraints: 'PRIMARY KEY', description: 'รหัสอุปกรณ์ในระบบ (UUID)' },
      { name: 'code', type: 'VARCHAR(50)', constraints: 'UNIQUE, NOT NULL', description: 'รหัสครุภัณฑ์ เช่น PC-SCI-01' },
      { name: 'name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'ชื่ออุปกรณ์' },
      { name: 'type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'ประเภท (PC, Laptop, Printer)' },
      { name: 'location', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'อาคารที่ติดตั้ง' },
      { name: 'room', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'ห้องที่ติดตั้ง' },
      { name: 'health_score', type: 'INT', constraints: 'DEFAULT 100, 0-100', description: 'คะแนนสุขภาพคำนวณจากประวัติการซ่อม' },
      { name: 'repair_count', type: 'INT', constraints: 'DEFAULT 0', description: 'จำนวนครั้งที่เคยซ่อม' }
    ]
  },
  {
    tableName: 'repair_requests',
    description: 'จัดเก็บใบแจ้งซ่อม รายละเอียดอาการ ผลวิเคราะห์ AI และความเร่งด่วน',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', constraints: 'PRIMARY KEY', description: 'UUID ของใบแจ้งซ่อม' },
      { name: 'ticket_number', type: 'VARCHAR(30)', constraints: 'UNIQUE, NOT NULL', description: 'เลขที่งาน เช่น REP-2026-0001' },
      { name: 'user_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> users', description: 'ผู้แจ้งซ่อม' },
      { name: 'equipment_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> equipment', description: 'อุปกรณ์ที่ชำรุด' },
      { name: 'urgency', type: 'VARCHAR(20)', constraints: "CHECK ('low','medium','high','critical')", description: 'ระดับความเร่งด่วน' },
      { name: 'symptom', type: 'TEXT', constraints: 'NOT NULL', description: 'อาการเสียที่ผู้ใช้ระบุ' },
      { name: 'ai_diagnosis_json', type: 'JSONB', constraints: 'NULL', description: 'การวิเคราะห์เบื้องต้นและสาเหตุจาก AI' },
      { name: 'status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'สถานะ 8 ขั้นตอน' },
      { name: 'technician_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> users', description: 'ช่างผู้รับผิดชอบ' },
      { name: 'repair_cost', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'รวมค่าใช้จ่ายการซ่อม' }
    ]
  },
  {
    tableName: 'repair_parts',
    description: 'จัดเก็บรายการอะไหล่ที่เบิกใช้ในงานซ่อมชิ้นนั้นๆ',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', constraints: 'PRIMARY KEY', description: 'UUID อะไหล่' },
      { name: 'repair_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> repair_requests', description: 'เชื่อมต่อใบงาน' },
      { name: 'part_name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'ชื่ออะไหล่ เช่น RAM DDR4 16GB' },
      { name: 'quantity', type: 'INT', constraints: 'NOT NULL DEFAULT 1', description: 'จำนวนชิ้น' },
      { name: 'unit_price', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'ราคาต่อหน่วย (บาท)' }
    ]
  },
  {
    tableName: 'chat_messages',
    description: 'จัดเก็บบันทึกข้อความแชตสื่อสารระหว่างผู้แจ้งซ่อมและช่างซ่อม',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', constraints: 'PRIMARY KEY', description: 'UUID ข้อความ' },
      { name: 'repair_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> repair_requests', description: 'เลขที่งาน' },
      { name: 'sender_id', type: 'VARCHAR(36)', constraints: 'FOREIGN KEY -> users', description: 'ผู้ส่งข้อความ' },
      { name: 'message', type: 'TEXT', constraints: 'NOT NULL', description: 'เนื้อหาข้อความ' },
      { name: 'image_url', type: 'TEXT', constraints: 'NULL', description: 'รูปภาพประกอบ' },
      { name: 'is_read', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'สถานะเปิดอ่าน' }
    ]
  }
];
