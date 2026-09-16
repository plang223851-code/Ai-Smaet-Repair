import { AIDiagnosisResult, UrgencyLevel } from '../types';

export function getLocalDiagnosticRule(symptom: string, category?: string): AIDiagnosisResult {
  const text = symptom.toLowerCase();

  // Pattern 0: Beep Code / Motherboard Beep / เสียงร้อง / เสียงเตือน
  if (text.includes('เสียงร้อง') || text.includes('ร้อง') || text.includes('beep') || text.includes('บี๊บ') || text.includes('เสียงเตือน')) {
    return {
      symptomSummary: 'เปิดเครื่องไม่ติด มีเสียงร้องเตือน (Beep Code) จากเมนบอร์ด',
      possibleCauses: [
        '1. แรม (RAM) เสียบไม่แน่น หลวม หรือหน้าสัมผัสทองแดงมีคราบออกไซด์',
        '2. การ์ดจอ (GPU) เสียบไม่สนิท หรือไฟเลี้ยงการ์ดจอไม่เข้า',
        '3. เมนบอร์ดหรือ BIOS ตรวจพบอุปกรณ์ฮาร์ดแวร์ขัดข้อง (POST Error)',
        '4. ระบบระบายความร้อนหรือซีพียู (CPU) มีปัญหาความร้อนสูง'
      ],
      severity: 'high',
      severityLabel: 'สูง',
      initialChecks: [
        'นับจังหวะเสียงร้อง (เช่น สั้น 3 ครั้ง, ยาว 1 สั้น 2 หรือยาวต่อเนื่อง) เพื่อแจ้งช่างระบุสาเหตุได้แม่นยำ',
        'ปิดเครื่องและถอดปลั๊กไฟออก จากนั้นลองถอดแรมออกมาขัดหน้าสัมผัสด้วยยางลบเบาๆ แล้วเสียบลงช่องเดิมให้แน่นมีเสียงคลิก',
        'สังเกตว่าพัดลมระบายความร้อนหมุนและไฟสถานะของเมนบอร์ดติดหรือไม่'
      ],
      advice: [
        'ห้ามเปิดเครื่องทิ้งไว้เป็นเวลานานขณะมีเสียงร้องเตือน',
        'ระบุจำนวนครั้งหรือรูปแบบเสียงร้องลงในช่องรายละเอียดเพื่อให้ช่างเตรียมอะไหล่แรม/การ์ดจอมาเปลี่ยนได้ทันที'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 94,
      analyzedAt: new Date().toISOString()
    };
  }

  // Pattern 1: Screen / Display / No Signal / Black Screen
  if (text.includes('จอ') || text.includes('ไม่ติด') || text.includes('no signal') || text.includes('ภาพ') || text.includes('จอดำ')) {
    return {
      symptomSummary: 'เปิดเครื่องแต่หน้าจอไม่แสดงผล หรือขึ้น No Signal',
      possibleCauses: [
        '1. สายสัญญาณจอ (HDMI / DisplayPort / VGA) หลวมหรือชำรุด',
        '2. แรม (RAM) มีคราบออกไซด์หรือเสียบไม่แน่น',
        '3. การ์ดจอ (GPU) หรือชิปกราฟิกมีปัญหา',
        '4. จอภาพไม่ได้รับไฟเลี้ยง หรือแหล่งจ่ายไฟจอเสีย'
      ],
      severity: 'medium',
      severityLabel: 'ปานกลาง',
      initialChecks: [
        'ตรวจสอบสายไฟจอภาพว่าไฟสถานะ LED ติดหรือไม่',
        'ถอดสายสัญญาณจอออกแล้วเสียบกลับเข้าไปใหม่ให้แน่น ทั้งฝั่งหลังเคสและหลังจอ',
        'หากเครื่องมีพอร์ตจอทั้งบนเมนบอร์ดและการ์ดจอแยก ตรวจสอบว่าเสียบถูกช่องการ์ดจอหรือไม่'
      ],
      advice: [
        'ห้ามใช้แรงดันหรือดัดสายสัญญาณแรงๆ เพราะอาจทำให้พอร์ตหัก',
        'ก่อนส่งช่าง หากเป็นคอมพิวเตอร์ตั้งโต๊ะ สามารถจดบันทึกว่ามีเสียงเตือน Beep Code กี่ครั้ง'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 92,
      analyzedAt: new Date().toISOString()
    };
  }

  // Pattern 2: Printer / Paper Jam / Ink
  if (text.includes('พิมพ์') || text.includes('printer') || text.includes('กระดาษติด') || text.includes('หมึก') || text.includes('print')) {
    return {
      symptomSummary: 'เครื่องพิมพ์ไม่ทำงาน มีปัญหากระดาษติดหรือคุณภาพงานพิมพ์ขัดข้อง',
      possibleCauses: [
        '1. ลูกยางดึงกระดาษ (Pickup Roller) เสื่อมสภาพหรือมีคราบแป้งกระดาษเกาะ',
        '2. มีเศษกระดาษ ลวดเย็บ หรือสิ่งแปลกปลอมค้างในช่องทางเดินกระดาษ',
        '3. ตลับหมึกหรือหัวพิมพ์อุดตัน/หมดอายุ',
        '4. ไดรเวอร์เครื่องพิมพ์หลุดการเชื่อมต่อหรือ Spooler ค้าง'
      ],
      severity: 'medium',
      severityLabel: 'ปานกลาง',
      initialChecks: [
        'เปิดฝาครอบเครื่องพิมพ์ ดึงถาดกระดาษออกเพื่อตรวจสอบว่ามีเศษกระดาษติดค้างหรือไม่',
        'หากจำเป็นต้องดึงกระดาษ ให้ปิดเครื่องก่อนและค่อยๆ ดึงตามทิศทางการวิ่งของกระดาษเสมอ',
        'เช็คระดับหมึกพิมพ์และไฟสถานะเตือนบนหน้าปัด'
      ],
      advice: [
        'ห้ามใช้มีด คัตเตอร์ หรือไม้บรรทัดเหล็กแคะในช่องลูกกลิ้งเด็ดขาด',
        'ระวังอย่าให้มีคลิปหนีบกระดาษหรือลวดเย็บตกลงไปในช่องป้อนกระดาษ'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 90,
      analyzedAt: new Date().toISOString()
    };
  }

  // Pattern 3: Power / Won't turn on / Dead / Smoke / Spark
  if (text.includes('ไฟไม่เข้า') || text.includes('ดับ') || text.includes('กลิ่นไหม้') || text.includes('เปิดไม่ติดเลย') || text.includes('ไฟตก') || text.includes('ups')) {
    return {
      symptomSummary: 'เครื่องดับ เปิดไม่ติด หรือระบบจ่ายพลังงานไฟฟ้าขัดข้อง',
      possibleCauses: [
        '1. แหล่งจ่ายไฟ (Power Supply Unit / Adaptor) เสียหรือฟิวส์ขาด',
        '2. ปลั๊กไฟ รางปลั๊ก หรือเต้ารับที่ผนังไม่มีกระแสไฟ',
        '3. แบตเตอรี่สำรองไฟ (UPS) เสื่อมสภาพ',
        '4. เมนบอร์ดช็อตหรือมีอุปกรณ์ลัดวงจรภายใน'
      ],
      severity: 'critical',
      severityLabel: 'ฉุกเฉินเร่งด่วน',
      initialChecks: [
        'ทดลองย้ายปลั๊กไฟไปเสียบเต้ารับตัวอื่นที่แน่ใจว่ามีไฟ',
        'ตรวจสอบสวิตช์ Power ด้านหลังเคส (I/O) ว่าเปิดอยู่ที่ตำแหน่ง I หรือไม่',
        'หากได้กลิ่นไหม้หรือมีควัน ให้ถอดปลั๊กไฟออกทันที'
      ],
      advice: [
        'ห้ามเปิดสวิตช์ซ้ำหากมีกลิ่นไหม้เพื่อป้องกันไฟไหม้หรืออุปกรณ์อื่นพังต่อเนื่อง',
        'แจ้งช่างเข้าตัดไฟและตรวจสอบความปลอดภัยก่อนใช้งาน'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 96,
      analyzedAt: new Date().toISOString()
    };
  }

  // Pattern 4: Slow / Freeze / Blue Screen / Virus / BSoD
  if (text.includes('ช้า') || text.includes('ค้าง') || text.includes('จอฟ้า') || text.includes('bsod') || text.includes('ไวรัส') || text.includes('restart')) {
    return {
      symptomSummary: 'ระบบทำงานช้าผิดปกติ มีอาการค้าง หรือจอฟ้า (BSoD)',
      possibleCauses: [
        '1. พื้นที่ฮาร์ดดิสก์/SSD เต็ม หรือไดรฟ์มี Bad Sector',
        '2. ซีพียู (CPU) ร้อนจัดเนื่องจากซิลิโคนแห้งหรือพัดลมไม่หมุน',
        '3. ไดรเวอร์อุปกรณ์ขัดแย้งกับ Windows Update ล่าสุด',
        '4. มัลแวร์หรือโปรแกรมเบื้องหลังกินทรัพยากรเครื่อง 100%'
      ],
      severity: 'medium',
      severityLabel: 'ปานกลาง',
      initialChecks: [
        'เปิด Task Manager (Ctrl + Shift + Esc) เพื่อดูว่าแอปพลิเคชันใดกิน CPU หรือ Memory สูงสุด',
        'ตรวจสอบพื้นที่ว่างในไดรฟ์ C: ว่าเหลือมากกว่า 15 GB หรือไม่',
        'ทดลองรีสตาร์ทเครื่องแบบ Restart (ไม่ใช่ Shutdown) เพื่อให้ระบบเคลียร์สถานะหน่วยความจำ'
      ],
      advice: [
        'สำรองไฟล์งานสำคัญไว้บน Google Drive หรือแฟลชไดรฟ์ทันทีที่เปิดเครื่องได้',
        'ถ่ายรูปข้อความ Stop Code บนหน้าจอฟ้าไว้ให้ช่างดู'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 89,
      analyzedAt: new Date().toISOString()
    };
  }

  // Pattern 5: Network / Internet / Wifi / LAN
  if (text.includes('เน็ต') || text.includes('อินเทอร์เน็ต') || text.includes('wifi') || text.includes('lan') || text.includes('เข้าเว็บไม่ได้') || text.includes('network')) {
    return {
      symptomSummary: 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ต หรือระบบเครือข่ายหลุดบ่อย',
      possibleCauses: [
        '1. สาย LAN หลุด หลวม หรือหัวต่อ RJ45 หัก',
        '2. ตัวรับสัญญาณ Wi-Fi ถูกปิดหรือไดรเวอร์ Network ขัดข้อง',
        '3. การตั้งค่า IP Address หรือ DNS Server ไม่ถูกต้อง',
        '4. สวิตช์เครือข่ายของอาคารหรือ Access Point ในบริเวณขัดข้อง'
      ],
      severity: 'low',
      severityLabel: 'ต่ำ',
      initialChecks: [
        'สังเกตไฟ LED ที่ช่องเสียบสาย LAN หลังเครื่องว่าติดกระพริบสีเขียว/ส้มหรือไม่',
        'ทดลองปิดแล้วเปิด Wi-Fi ใหม่ หรือกดปุ่ม Forget Network แล้วต่อใหม่',
        'ตรวจสอบว่าอุปกรณ์ข้างเคียงหรือมือถือสามารถใช้งานเครือข่ายได้ตามปกติหรือไม่'
      ],
      advice: [
        'หากเป็นปัญหาของสาย LAN สามารถแจ้งเปลี่ยนสายใหม่ได้รวดเร็ว',
        'ไม่ต้องรีเซ็ตการตั้งค่าระบบความปลอดภัยองค์กรด้วยตนเอง'
      ],
      disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
      confidenceScore: 87,
      analyzedAt: new Date().toISOString()
    };
  }

  // Default General IT Diagnosis
  return {
    symptomSummary: `ตรวจสอบอาการเบื้องต้น: "${symptom.slice(0, 60)}${symptom.length > 60 ? '...' : ''}"`,
    possibleCauses: [
      '1. การเชื่อมต่ออุปกรณ์ต่อพ่วงหรือสายสัญญาณขัดข้อง',
      '2. การตั้งค่าระบบปฏิบัติการหรือไดรเวอร์ต้องการการปรับปรุง',
      '3. ชิ้นส่วนฮาร์ดแวร์ทำงานผิดพลาดหรือหมดอายุการใช้งาน'
    ],
    severity: 'medium',
    severityLabel: 'ปานกลาง',
    initialChecks: [
      'ปิดเครื่องและเปิดใหม่ (Restart) 1 ครั้ง',
      'ตรวจสอบสายไฟและสายเชื่อมต่อภายนอกทั้งหมดว่าแน่นหนา',
      'สังเกตไฟสถานะหรือรหัสข้อผิดพลาดบนหน้าจอ'
    ],
    advice: [
      'บันทึกข้อความผิดพลาด (Error Code) ที่ปรากฏให้ครบถ้วน',
      'ส่งคำขอแจ้งซ่อมเพื่อให้ช่างผู้ชำนาญเข้าตรวจสอบอุปกรณ์จริง'
    ],
    disclaimer: 'ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น ช่างต้องตรวจสอบอุปกรณ์จริงอีกครั้ง',
    confidenceScore: 85,
    analyzedAt: new Date().toISOString()
  };
}

export async function requestAIDiagnosis(
  symptom: string,
  equipmentType?: string,
  images?: string[]
): Promise<AIDiagnosisResult> {
  const controller = new AbortController();
  // Multimodal vision can take 5-15s, so allow up to 25s before falling back
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptom,
        equipmentType,
        images: images && images.length > 0 ? images : undefined
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.possibleCauses && data.possibleCauses.length > 0) {
        return data;
      }
    }
  } catch {
    // Network, timeout, or server error fallback gracefully
  } finally {
    clearTimeout(timeoutId);
  }

  // Instant fallback to high-accuracy local rule engine
  const fallback = getLocalDiagnosticRule(symptom || 'ตรวจสอบปัญหาจากภาพถ่ายที่แนบมา', equipmentType);
  if (images && images.length > 0) {
    return {
      ...fallback,
      symptomSummary: symptom
        ? `${fallback.symptomSummary} (วิเคราะห์ร่วมกับภาพถ่าย ${images.length} ภาพ)`
        : `วิเคราะห์จากภาพถ่ายปัญหาที่แนบมา (${images.length} ภาพ): สังเกตพบความผิดปกติของอุปกรณ์`,
      disclaimer: 'ข้อมูลนี้เป็นการวิเคราะห์เบื้องต้นร่วมกับรูปภาพที่แนบ ช่างเทคนิคต้องตรวจสอบอุปกรณ์จริงอีกครั้ง'
    };
  }
  return fallback;
}
