// Google App Script
const authToken = 'OkfnEVNjML'; // Change secret key as needed (TODO: move to separate file and don't commit to repo)

// Check off token on get
function doGet(e) {
  if (e.parameter.authToken !== authToken) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService.createTextOutput('Authorized').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.authToken !== authToken) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1'); // Change sheet name as needed
  const headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Loop through headings and if included in record, then add to records to append to the sheet
  const recordToAppend = {};
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    if (heading in data.record) {
      if (heading === 'timestamp') {
        // Convert timestamp to date object as Sheets doesn't recognize ISO 8601 format
        recordToAppend[heading] = new Date(data.record[heading]);
      } else {
        recordToAppend[heading] = data.record[heading];
      }
    } else {
      recordToAppend[heading] = ''; // Add empty string if heading is not in record
    } 
  }

  sheet.appendRow(Object.values(recordToAppend));

  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}