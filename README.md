# 🚛 Trolley PIV (QR Scan Verification) - Google Apps Script Web App

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Web App](https://img.shields.io/badge/Web%20App-111827?style=for-the-badge&logo=googlechrome&logoColor=white)
![QR](https://img.shields.io/badge/QR%20Scan-000000?style=for-the-badge&logo=qrcode&logoColor=white)
![Made With Love](https://img.shields.io/badge/Made%20for-Plant%20Verification-orange?style=for-the-badge)

A simple **QR-based Physical Inventory Verification (PIV)** system for tracking and verifying **trolleys** using a mobile-friendly Google Apps Script Web App + Google Sheets.

Operators scan trolley QR stickers using a phone camera (or manually enter the ID), add optional remarks, and save the verification record.  
Management gets a live **missing trolley report** automatically.

---

## ✅ Key Features

### 📷 QR Scan + Manual Entry
- Scan trolley QR stickers using the **phone camera**
- Automatically fills the **Trolley ID**
- Manual typing supported if camera scan fails

### ✅ Strict Validations (Before Saving)
- **No empty trolley ID**
- **ID must exist in MASTER list**
- **Duplicate scans rejected** (same trolley cannot be scanned twice)

### 🧾 Scan Log Capture
Each accepted scan is recorded into `SCANNED` sheet with:
- Date (dd/MM/yyyy)
- Time (HH:mm)
- Trolley ID
- Remark (optional)
- Scanned By

### 📊 Live Auto-Updated Reporting
REPORT sheet updates automatically using formulas to show:
- Total Expected
- Total Scanned
- Total Missing
- Missing trolley list (ID + Name + Not Scanned)

### 🔎 Quick Search in REPORT (Optional)
A search section lets management type a trolley ID and instantly see:
- Scanned / Not Scanned status
- Date / Time scanned
- Remark
- Scanned By

### 🔒 Safe Multi-User Scanning
Uses **LockService** to prevent duplicate entries during simultaneous usage.

### 📳 Feedback on Success
- Beep sound
- Phone vibration  
- Success/Error message auto hides after a few seconds

---

## 🗂️ Google Sheet Structure

### ✅ Sheet 1: `MASTER`
Ground truth list (uploaded from Excel).  
**Never modified during scanning.**

| Column | Name |
|--------|------|
| A | Trolley_ID |
| B | Trolley_Name |

---

### ✅ Sheet 2: `SCANNED`
Stores accepted QR verification scans.

| Column | Name |
|--------|------|
| A | Date |
| B | Time |
| C | Trolley_ID |
| D | Remark |
| E | Scanned_By |

---

### ✅ Sheet 3: `REPORT`
Auto-generated report using formulas:
- Summary (Expected / Scanned / Missing)
- Missing trolley list

---

## ⚙️ Setup Instructions

### 1) Create Google Spreadsheet
Create a new spreadsheet and add 3 sheets:
- `MASTER`
- `SCANNED`
- `REPORT`

Add headers exactly as defined above.

### 2) Open Apps Script
Go to:
**Extensions → Apps Script**

Create these files:
- `Code.gs`
- `index.html`

Paste the project code.

### 3) Deploy as Web App
- Deploy → New deployment
- Type: **Web app**
- Execute as: **Me**
- Access: **Anyone with the link**

✅ Use the generated link on mobile for scanning.

---

## 📌 REPORT Formulas (Copy Paste)

### ✅ Summary
**Total Expected**
```excel
=COUNTA(MASTER!A2:A)

**Total Scanned**
```excel
=COUNTA(SCANNED!C2:C)

**Total Missing**
```excel
=B2-B3

### ✅ Missing Trolleys List 
**List (ID + Name)**
```excel
=FILTER(MASTER!A2:B, ISNA(MATCH(MASTER!A2:A, SCANNED!C2:C, 0)))


**Status Column**
```excel
=ARRAYFORMULA(IF(A7:A="","", "Not Scanned"))

---

# ✅ .gitignore 

Since this is Google Apps Script + HTML, there’s usually no build output.  

```gitignore
# OS junk
.DS_Store
Thumbs.db

# Editor folders
.vscode/
.idea/

# Logs
*.log
