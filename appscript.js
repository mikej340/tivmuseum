// Google App Script
function doPost(e) {
  const authToken = 'OkfnEVNjML'; // Change secret key as needed (TODO: move to separate file and don't commit to repo)
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
      recordToAppend[heading] = data.record[heading];
    } else {
      recordToAppend[heading] = ''; // Add empty string if heading is not in record
    } 
  }

  sheet.appendRow(Object.values(recordToAppend));

  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}