/**
 * Google Apps Script: receive CSV POST and append to Sheet
 * Deploy as Web App (Execute as: Me, Who has access: Anyone)
 *
 * Expected: POST body = CSV text
 * Header: Authorization: Bearer <TOKEN> (set via setGASToken)
 */
function doPost(e) {
  try {
    // Check Bearer token
    var token = PropertiesService.getScriptProperties().getProperty('GAS_TOKEN')
    var auth = e.parameter && e.parameter.auth ? e.parameter.auth : ''
    if (e.postData && e.postData.headers && e.postData.headers.Authorization) {
      auth = (e.postData.headers.Authorization || '').replace(/^Bearer\s+/i, '')
    }
    if (!token || auth !== token) {
      var resp = ContentService.createTextOutput('unauthorized')
      resp.setMimeType(ContentService.MimeType.TEXT)
      return resp
    }

    var csv = e.postData && e.postData.contents ? e.postData.contents : ''
    if (!csv) return ContentService.createTextOutput('no csv')

    var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('TARGET_SHEET_ID'))
    var sheetName = (e.parameter && e.parameter.sheet) ? e.parameter.sheet : 'Sheet1'
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0]

    var rows = Utilities.parseCsv(csv)
    // Append rows
    sheet.getRange(sheet.getLastRow()+1, 1, rows.length, rows[0].length).setValues(rows)

    return ContentService.createTextOutput('ok')
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err.message)
  }
}

/**
 * Helper to set TARGET_SHEET_ID property once deployed
 */
function setTargetSheetId(id) {
  PropertiesService.getScriptProperties().setProperty('TARGET_SHEET_ID', id)
}

/**
 * Helper to set GAS_TOKEN for bearer auth
 */
function setGASToken(token) {
  if (!token || token.length < 16) throw new Error('Token must be at least 16 chars')
  PropertiesService.getScriptProperties().setProperty('GAS_TOKEN', token)
}
