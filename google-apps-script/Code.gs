/* ===============================
ALC Website Tracking Receiver V1.0
Google Apps Script / Bound to Google Sheets
=============================== */

const SHEET_NAME = 'Raw_Log';

const HEADERS = [
  'Time',
  'Action',
  'Customer Action',
  'Website',
  'Country',
  'Page Title',
  'Page URL',
  'Page Type',
  'File Name',
  'File URL',
  'Source',
  'IP Address',
  'Visit Path',
  'Stay Time (sec)',
  'User Type',
  'Device',
  'Screen Size',
  'Viewport Size',
  'Language',
  'Session ID',
  'Scroll Depth',
  'User Agent'
];

function setupAlcTrackingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, HEADERS.length);

  return 'ALC tracking sheet is ready.';
}

function doGet() {
  return ContentService
    .createTextOutput('ALC tracking endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(3000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setupAlcTrackingSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const rawAction = data.action || '';
    const friendlyAction = getFriendlyAction(rawAction);

    sheet.appendRow([
      new Date(),
      rawAction,
      friendlyAction,
      data.website || 'alcledlight.com',
      data.country || '',
      data.page_title || '',
      data.page_url || '',
      data.page_type || '',
      data.file_name || '',
      data.file_url || '',
      data.source || '',
      data.ip || '',
      data.path || '',
      data.stay_time || '',
      data.user_type || '',
      data.device || '',
      data.screen_size || '',
      data.viewport_size || '',
      data.language || '',
      data.session_id || '',
      data.scroll || '',
      data.user_agent || ''
    ]);

    return ContentService
      .createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService
      .createTextOutput('Error: ' + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {}
  }
}

function getFriendlyAction(action) {
  const map = {
    page_view: 'Page View',
    page_stay: 'Stay Time Log',
    whatsapp_click: 'High Intent Inquiry - WhatsApp',
    email_click: 'High Intent Inquiry - Email',
    download: 'Download Record'
  };

  return map[action] || action;
}
