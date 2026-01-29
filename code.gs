// ==========================
// TROLLEY PIV - MAIN APP
// ==========================

const CONFIG = {
  MASTER_SHEET: "MASTER",
  SCANNED_SHEET: "SCANNED",
};

// Serve UI
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Trolley PIV - QR Scan")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Utility: Clean trolley id using trim()
function cleanId(id) {
  return String(id || "").trim();
}

// Load MASTER IDs into a Set-like object for quick lookup
function getMasterMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.MASTER_SHEET);
  if (!sh) throw new Error("MASTER sheet not found");

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  const values = sh.getRange(2, 1, lastRow - 1, 1).getValues(); // col A only
  const masterMap = {};

  for (let i = 0; i < values.length; i++) {
    const id = cleanId(values[i][0]);
    if (id) masterMap[id] = true;
  }

  return masterMap;
}

// Load scanned IDs into map for quick duplicate check
function getScannedMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SCANNED_SHEET);
  if (!sh) throw new Error("SCANNED sheet not found");

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  const values = sh.getRange(2, 3, lastRow - 1, 1).getValues(); // col C = Trolley_ID
  const scannedMap = {};

  for (let i = 0; i < values.length; i++) {
    const id = cleanId(values[i][0]);
    if (id) scannedMap[id] = true;
  }

  return scannedMap;
}

// MAIN SAVE FUNCTION
function saveScan(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 10 seconds max wait

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scannedSheet = ss.getSheetByName(CONFIG.SCANNED_SHEET);
    if (!scannedSheet) throw new Error("SCANNED sheet not found");

    // Read + clean
    let trolleyId = cleanId(payload?.trolleyId);
    const remark = String(payload?.remark || "").trim();
    const scannedBy = String(payload?.scannedBy || "").trim();

    // Rule 1: No empty ID
    if (!trolleyId) {
      return { ok: false, message: "❌ Trolley ID cannot be empty." };
    }

    // Load MASTER + SCANNED maps
    const masterMap = getMasterMap_();

    // Rule 2: ID must exist in MASTER
    if (!masterMap[trolleyId]) {
      return { ok: false, message: "❌ Invalid ID. Not found in MASTER." };
    }

    // Rule 3: No duplicate scans
    const scannedMap = getScannedMap_();
    if (scannedMap[trolleyId]) {
      return { ok: false, message: "⚠️ Duplicate Scan. This trolley is already scanned." };
    }

    // Save scan
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy");
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm");

    scannedSheet.appendRow([
      dateStr,
      timeStr,
      trolleyId,
      remark,
      scannedBy,
    ]);

    return {
      ok: true,
      message: "✅ Accepted. Scan saved successfully.",
      trolleyId: trolleyId,
      date: dateStr,
      time: timeStr,
    };

  } catch (err) {
    return { ok: false, message: "❌ Error: " + err.message };
  } finally {
    lock.releaseLock();
  }
}
