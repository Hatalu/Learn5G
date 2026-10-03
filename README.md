# 🌟 Learn5G: สื่อนวัตกรรมการเรียนรู้ดิจิทัลแบบมีปฏิสัมพันธ์ (Digital Interactive Learning Innovation)
### สำหรับนักเรียนระดับประถมศึกษา (ป.1 - ป.6) ตามหลักสูตร สสวท.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://hatalu.github.io/Learn5G/)
[![Grade](https://img.shields.io/badge/Grade-Primary%204%20(ป.4)-orange)]()
[![Subject](https://img.shields.io/badge/Subject-Mathematics-purple)]()

**Learn5G** คือคลังสื่อนวัตกรรมการเรียนรู้ดิจิทัลรูปแบบใหม่ (5G Interactive Educational Innovations) ที่ออกแบบมาเพื่อเสริมสร้างทักษะและเจตคติที่ดีในการเรียนรู้ของเด็กนักเรียนระดับประถมศึกษา โดยเปลี่ยนบทเรียนวิชาการให้กลายเป็นการเรียนรู้ผ่านการทดลองและการเล่น (Game-Based & Experiential Learning)

---

## 📂 โครงสร้างนวัตกรรมภายในโปรเจกต์ (Repository Structure)

```
Learn5G/
│
├── README.md                          # เอกสารภาพรวมโครงการ Learn5G
├── index.html                         # ศูนย์กลางหน้าหลัก (Portal Landing Page)
│
└── Math/                              # 📐 กลุ่มสาระการเรียนรู้คณิตศาสตร์
    └── 4/                             # 🎒 ระดับชั้นประถมศึกษาปีที่ 4
        └── เวลา/                      # ⏰ บทเรียนเรื่องเวลา (สสวท.)
            └── รถไฟอวกาศ/             # 🚀 Chrono-Express Galaxy: รถไฟอวกาศข้ามจักรวาลกาลเวลา
                ├── index.html         # สื่อ Interactive Web App
                ├── server.js          # Local Server (Port 1401)
                ├── README.md          # คู่มือรายละเอียดนวัตกรรมรถไฟอวกาศ
                ├── assets/            # รูปภาพและไอคอนดาราศาสตร์
                ├── css/               # สไตล์และเอฟเฟกต์แอนิเมชัน
                └── js/                # เอนจินคณิตศาสตร์, กราฟิก และระบบเสียง
```

---

## 🚀 สื่อนวัตกรรมปัจจุบัน (Active Innovations)

### 🪐 1. Chrono-Express Galaxy: รถไฟอวกาศข้ามจักรวาลกาลเวลา
- **โฟลเดอร์:** [`Math/4/เวลา/รถไฟอวกาศ/`](Math/4/เวลา/รถไฟอวกาศ/)
- **ระดับชั้น:** ประถมศึกษาปีที่ 4
- **เนื้อหา:** เรื่องเวลา (ระบบ 24 ชั่วโมง, การแปลงหน่วยเวลา, การหาเวลาเริ่มต้น-สิ้นสุด และระยะเวลา)
- **จุดเด่น:**
  - 🕰️ หมุนเข็มนาฬิกาได้อิสระเสมือนจริง อิงกลไกคณิตศาสตร์ฐาน 60
  - 🌌 ท้องฟ้าเปลี่ยนเฉดสีตลอด 24 ชั่วโมงอย่างนุ่มนวล ไร้รอยต่อ (Hermite Smoothstep Sky Interpolation)
  - 🗺️ แผนที่จักรวาล 360 องศา (360° Deep Space Universe Map) ซูมเข้า-ออกได้ ดาว 12 ดวงมีเอกลักษณ์เฉพาะตัว
  - 🦉 กัปตันนกฮูกให้คำใบ้และร่วมเดินทางข้ามมิติเวลา
  - ⚡ ระบบแจ้งเตือนข้อผิดพลาดแบบช็อตไฟฟ้าและสั่นกระตุก 0.5 วินาที
  - 🎮 รองรับการเล่นผ่านคอมพิวเตอร์, iPad และแท็บเล็ตทุกรุ่น (Single-Screen Cockpit)

---

## 💻 วิธีการเปิดใช้งาน (How to Use)

### เล่นออนไลน์ผ่าน GitHub Pages:
เข้าสู่เว็บไซต์: **[https://hatalu.github.io/Learn5G/](https://hatalu.github.io/Learn5G/)**

### รันในเครื่อง (Local Mode):
1. **โคลนคลังโค้ด:**
   ```bash
   git clone https://github.com/Hatalu/Learn5G.git
   cd Learn5G
   ```
2. **เปิดเล่นสื่อรถไฟอวกาศเรื่องเวลา ป.4:**
   - วิธีง่าย: ดับเบิลคลิกเปิดไฟล์ `Math/4/เวลา/รถไฟอวกาศ/index.html` บนเว็บเบราว์เซอร์
   - วิธีรันผ่าน Node.js Server:
     ```bash
     cd Math/4/เวลา/รถไฟอวกาศ
     node server.js
     ```
     แล้วเข้าเว็บที่ `http://localhost:1401/`

---

## 📜 ลิขสิทธิ์และการใช้งาน (License)
โครงการนี้เผยแพร่ภายใต้ใบอนุญาต **MIT License** เพื่อประโยชน์ต่อการศึกษาและพัฒนาการเรียนรู้ของเยาวชนไทย

---
**สร้างสรรค์โดย:** [Hatalu](https://github.com/Hatalu)  
**โครงการ:** สื่อการสอนนวัตกรรมประถม 5G (Learn5G)
