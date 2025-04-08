// Google App Script
function doPost(e) {
  const authToken = 'OkfnEVNjML'; // Change secret key as needed (TODO: move to separate file and don't commit to repo)
  const data = JSON.parse(e.postData.contents);

  if (data.authToken !== authToken) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  const record = data.record;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1'); // Change sheet name as needed
  sheet.appendRow([
    record['adults'],
    record['members'],
    record['carers'],
    record['blue-light'],
    record['children'],
    record['dogs'],
    record['half-price-voucher'],
    record['full-price-voucher'],
    record['postcode'],
    record['reason-for-visit'],
    record['visit-type'],
    record['first-visit'],
    record['hear-about-us'],
    record['other-hear-about-us'],
    record['gift-aid-adults'],
    record['price'],
    record['timestamp']
  ]);
  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}