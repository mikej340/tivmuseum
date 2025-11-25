// Google Apps Script

// Using ContentService.MimeType.TEXT allows cross-origin requests without CORS issues
// This works because text/plain responses are considered "simple" by browsers
// and don't trigger preflight requests, unlike application/json

const authToken = 'AUTHTOKEN'; // Change secret key as needed (TODO: move to separate file and don't commit to repo)

// Get
function doGet(e) {
  if (e.parameter.authToken !== authToken) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  const action = e.parameter.action || 'checkCredentials';

  switch (action) {
    case 'checkCredentials':
      return ContentService.createTextOutput('Authorized').setMimeType(ContentService.MimeType.TEXT);
    
    case 'getVisitorTypes':
      const visitorTypesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Visitor Types');
      const visitorTypesData = visitorTypesSheet.getDataRange().getValues();

      // Skip header row
      visitorTypesData.shift();
      
      return ContentService.createTextOutput(JSON.stringify(visitorTypesData))
        .setMimeType(ContentService.MimeType.TEXT);

    case 'getReasonsForVisit':
      const reasonsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reason For Visit');
      const reasonsData = reasonsSheet.getDataRange().getValues();

      // Skip header row
      reasonsData.shift();

      const reasons = reasonsData.map(row => ({
        value: row[0],
        default: row[1] // Yes or blank
      }));
      
      return ContentService.createTextOutput(JSON.stringify(reasonsData))
        .setMimeType(ContentService.MimeType.TEXT);

    case 'getHeardAboutUs':
      const heardSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('How Did You Hear About Us');
      const heardData = heardSheet.getDataRange().getValues();

      // Skip header row
      heardData.shift();
      
      return ContentService.createTextOutput(JSON.stringify(heardData))
        .setMimeType(ContentService.MimeType.TEXT);
    
    case 'getTodayTotals':
      const todayTotals = getTotalsForDate(new Date());
      return ContentService.createTextOutput(JSON.stringify(todayTotals || {}))
        .setMimeType(ContentService.MimeType.TEXT);
    
    default:
      return ContentService.createTextOutput('Invalid action')
        .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Post
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.authToken !== authToken) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Visitors'); // Change sheet name as needed
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
    } else if (!heading.startsWith('#')) { // ignore computed columns
      recordToAppend[heading] = ''; // Add empty string if heading is not in record
    }
  }

  // ensure no entries in data.record are missing from the sheet
  for (const key in data.record) {
    if (!headings.includes(key)) {
      return ContentService.createTextOutput(`"${key}" not found in sheet headings.`).setMimeType(ContentService.MimeType.TEXT);
    }
  }

  sheet.appendRow(Object.values(recordToAppend));

  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}

function getTotalsForDate(targetDate) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Visitors');  // source data
  
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  const header = values.shift();

  // Adjust these names to match your actual headers
  const dateColIndex      = header.indexOf('# Date');
  const totalVisColIndex  = header.indexOf('# Total visitors');
  const priceColIndex     = header.indexOf('price');
  const donationColIndex  = header.indexOf('donation');

  if (dateColIndex === -1 || totalVisColIndex === -1 ||
      priceColIndex === -1 || donationColIndex === -1) {
    throw new Error('Required columns not found.');
  }

  // Normalise target date
  const t = new Date(targetDate);
  t.setHours(0,0,0,0);

  let totalVisitors = 0;
  let totalPrice = 0;
  let totalDonation = 0;

  for (const row of values) {
    const rd = row[dateColIndex];
    rd.setHours(0,0,0,0);

    if (rd.getTime() === t.getTime()) {
      totalVisitors += Number(row[totalVisColIndex]) || 0;
      totalPrice    += Number(row[priceColIndex])    || 0;
      totalDonation += Number(row[donationColIndex]) || 0;
    }
  }

  return {
    date: t,
    totalVisitors,
    totalPrice,
    totalDonation
  };
}


/**
 * Manual test helper: simulates an HTTP GET to fetch today's totals.
 * Check the execution logs for the returned body.
 */
function testGetTodayTotals() {
  const fakeEvent = {
    parameter: {
      authToken: authToken,
      action: 'getTodayTotals'
    }
  };
  const result = doGet(fakeEvent);
  const body = result.getContent ? result.getContent() : result.getResponseText();
  Logger.log(body);
}
