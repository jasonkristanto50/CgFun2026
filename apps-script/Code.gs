/**
 * CG FUN 2026 — Google Apps Script backend (paste into Extensions → Apps Script of the RSVP sheet).
 *
 * The website never talks to this script from the browser: it goes through the Next.js
 * /api/sheets and /api/teams routes, which POST JSON here using the CG_FUN_AppScript URL.
 *
 * Columns are found by their header text in row 1, so they can be reordered freely.
 * Required headers: Nama, Nomor Telepon, Alamat, Status, Status CG, Team, Timestamp.
 *
 * After editing: Deploy → Manage deployments → (edit) → Version: New version → Deploy.
 * Editing the existing deployment keeps the same URL, so CG_FUN_AppScript doesn't change.
 */

/** Tab holding the RSVPs. Leave empty to use the first tab whose row 1 contains "Nama". */
const RSVP_SHEET_NAME = "";
/** Tab for live game progress (only used while the web game is enabled). Created if missing. */
const GAME_SHEET_NAME = "Game";

const H = {
  nama: "Nama",
  nomorTelepon: "Nomor Telepon",
  alamat: "Alamat",
  status: "Status",
  statusCg: "Status CG",
  team: "Team",
  timestamp: "Timestamp",
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    switch (body.type) {
      case "RSVP":
        return json(appendRsvp(body));
      case "LIST":
        return json(listRsvp());
      case "SAVE_TEAMS":
        return json(saveTeams(body.assignments || []));
      case "GAME":
        return json(appendGame(body));
      default:
        return json({ result: "error", error: "Unknown type: " + body.type });
    }
  } catch (err) {
    return json({ result: "error", error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rsvpSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (RSVP_SHEET_NAME) {
    const named = ss.getSheetByName(RSVP_SHEET_NAME);
    if (!named) throw new Error('Tab "' + RSVP_SHEET_NAME + '" not found');
    return named;
  }
  const found = ss.getSheets().find(function (sh) {
    return sh.getLastColumn() > 0 && sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].indexOf(H.nama) !== -1;
  });
  if (!found) throw new Error('No tab with a "' + H.nama + '" header in row 1');
  return found;
}

/** { headerText: 1-based column } for row 1. Throws if a required header is missing. */
function columns(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
  const map = {};
  Object.keys(H).forEach(function (k) {
    const i = headers.indexOf(H[k]);
    if (i === -1) throw new Error('Missing "' + H[k] + '" header in row 1');
    map[k] = i + 1;
  });
  map.width = headers.length;
  return map;
}

function appendRsvp(b) {
  const sheet = rsvpSheet();
  const col = columns(sheet);
  const row = new Array(col.width).fill("");
  row[col.nama - 1] = b.nama || "";
  row[col.nomorTelepon - 1] = String(b.nomorTelepon || "").replace(/^\+/, "");
  row[col.alamat - 1] = b.alamat || "";
  row[col.status - 1] = b.status || "";
  row[col.statusCg - 1] = b.statusCg || "";
  row[col.timestamp - 1] = new Date();
  sheet.appendRow(row);
  return { result: "success" };
}

function listRsvp() {
  const sheet = rsvpSheet();
  const col = columns(sheet);
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    const nama = String(v[col.nama - 1]).trim();
    if (!nama) continue;
    rows.push({
      row: i + 1,
      nama: nama,
      status: String(v[col.status - 1]).trim(),
      statusCg: String(v[col.statusCg - 1]).trim(),
      team: String(v[col.team - 1]).trim(),
    });
  }
  return { result: "success", rows: rows };
}

/**
 * assignments: [{ row, nama, team }]. Every row's Nama must still match, otherwise nothing is
 * written (the sheet was sorted/edited since the team maker loaded it — reload and try again).
 */
function saveTeams(assignments) {
  const sheet = rsvpSheet();
  const col = columns(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { result: "success", updated: 0 };

  const names = sheet.getRange(2, col.nama, lastRow - 1, 1).getValues();
  const teamRange = sheet.getRange(2, col.team, lastRow - 1, 1);
  const teams = teamRange.getValues();

  const mismatched = [];
  assignments.forEach(function (a) {
    const i = Number(a.row) - 2;
    if (i < 0 || i >= names.length || String(names[i][0]).trim() !== String(a.nama).trim()) {
      mismatched.push(a.nama);
      return;
    }
    teams[i][0] = a.team || "";
  });
  if (mismatched.length) {
    return {
      result: "error",
      error: "Sheet berubah sejak dimuat (" + mismatched.join(", ") + "). Muat ulang lalu simpan lagi.",
    };
  }

  teamRange.setValues(teams);
  return { result: "success", updated: assignments.length };
}

function appendGame(b) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(GAME_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(GAME_SHEET_NAME);
    sheet.appendRow(["Team Name", "Current Mission", "Wrong Attempts", "Score", "Status", "Timestamp"]);
  }
  sheet.appendRow([b.teamName, b.currentMission, b.wrongAttempts, b.score, b.status, new Date()]);
  return { result: "success" };
}
