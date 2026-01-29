// ==========================
// TROLLEY PIV - MAIN APP
// ==========================

const CONFIG = {
  MASTER_SHEET: "MASTER",
  SCANNED_SHEET: "SCANNED",
  REPORT_SHEET: "REPORT",
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Trolley PIV - QR Scan");
}

// Clean trolley id using trim()
function cleanId(id) {
  return String(id || "").trim();
}

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

function saveScan(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scannedSheet = ss.getSheetByName(CONFIG.SCANNED_SHEET);
    if (!scannedSheet) throw new Error("SCANNED sheet not found");

    let trolleyId = cleanId(payload?.trolleyId);
    const remark = String(payload?.remark || "").trim();
    const scannedBy = String(payload?.scannedBy || "").trim();

    // Rule 1: No empty ID
    if (!trolleyId) {
      return { ok: false, message: "❌ Trolley ID cannot be empty." };
    }

    // Rule 2: ID must exist in MASTER
    const masterMap = getMasterMap_();
    if (!masterMap[trolleyId]) {
      return { ok: false, message: "❌ Invalid ID. Not found in MASTER." };
    }

    // Rule 3: No duplicates
    const scannedMap = getScannedMap_();
    if (scannedMap[trolleyId]) {
      return { ok: false, message: "⚠️ Duplicate Scan. Already scanned." };
    }

    // Save
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
      message: `✅ Accepted. Saved: ${trolleyId}`,
      trolleyId,
      date: dateStr,
      time: timeStr,
    };

  } catch (err) {
    return { ok: false, message: "❌ Error: " + err.message };
  } finally {
    lock.releaseLock();
  }
}
