/**
 * Google Apps Script: receive CSV POST and append to Sheet
 * Deploy as Web App (Execute as: Me, Who has access: Anyone with link)
 *
 * Expected: POST body = CSV text. Query param 'sheet' optional (sheet name)
 */
function doPost(e) {
  try {
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
