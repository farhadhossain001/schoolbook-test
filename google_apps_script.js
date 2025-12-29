/**
 * Google Apps Script for SchoolBooks Connect
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/home
 * 2. Open your existing project or create a new one.
 * 3. Replace all code in Code.gs with the code below.
 * 4. IMPORTANT: In your Google Sheet, ensure your columns match exactly:
 *    [id, title, subject, classLevel, subCategory, thumbnailUrl, pdfUrl, description, publishYear, createdAt]
 *    (Insert a new column 'subCategory' after 'classLevel' if it doesn't exist).
 * 5. Deploy as Web App:
 *    - Click 'Deploy' > 'New deployment' (or 'Manage deployments' > Edit existing > New version)
 *    - Select type: 'Web app'
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone'
 * 6. Save and use the Deployment URL in your app.
 */

const SHEET_NAME = 'Books';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  // Wait for up to 30 seconds for bulk operations
  lock.tryLock(30000);
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Auto-create sheet if missing
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Initialize Headers
      sheet.appendRow(['id', 'title', 'subject', 'classLevel', 'subCategory', 'thumbnailUrl', 'pdfUrl', 'description', 'publishYear', 'createdAt']);
    }

    const params = e.parameter || {};
    const postData = e.postData ? JSON.parse(e.postData.contents) : {};
    
    // Merge query params and post body
    const data = { ...params, ...postData };
    const action = data.action || 'read';

    // --- READ ACTION ---
    if (action === 'read') {
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0]; // Assumes first row is headers
      const books = [];
      
      // Iterate rows skipping header
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue; // Skip empty IDs
        
        const book = {};
        // Dynamic mapping based on headers, but we expect standard columns
        // We explicitly map critical fields to ensure frontend receives correct keys
        // Order: 0:id, 1:title, 2:subject, 3:classLevel, 4:subCategory, 5:thumbnailUrl, 6:pdfUrl, 7:description
        book.id = row[0];
        book.title = row[1];
        book.subject = row[2];
        book.classLevel = row[3];
        book.subCategory = row[4];
        book.thumbnailUrl = row[5];
        book.pdfUrl = row[6];
        book.description = row[7];
        book.publishYear = row[8];
        
        books.push(book);
      }
      
      return createJSONOutput(books);
    }
    
    // --- CREATE ACTION ---
    if (action === 'create') {
      const newRow = [
        data.id || Utilities.getUuid(),
        data.title || '',
        data.subject || '',
        data.classLevel || '',
        data.subCategory || '', // New field for Admission
        data.thumbnailUrl || '',
        data.pdfUrl || '',
        data.description || '',
        data.publishYear || '',
        new Date().toISOString()
      ];
      sheet.appendRow(newRow);
      return createJSONOutput({ status: 'success', id: newRow[0] });
    }

    // --- RESET AND SEED ACTION (Fixes Database Structure) ---
    if (action === 'reset_and_seed') {
      const booksToSeed = data.books || [];
      
      // 1. Clear everything
      sheet.clear();
      
      // 2. Set Correct Headers
      sheet.appendRow(['id', 'title', 'subject', 'classLevel', 'subCategory', 'thumbnailUrl', 'pdfUrl', 'description', 'publishYear', 'createdAt']);
      
      // 3. Batch insert new data
      if (booksToSeed.length > 0) {
        const rowsToAdd = booksToSeed.map(b => [
           b.id || Utilities.getUuid(),
           b.title || '',
           b.subject || '',
           b.classLevel || '',
           b.subCategory || '',
           b.thumbnailUrl || '',
           b.pdfUrl || '',
           b.description || '',
           b.publishYear || '',
           new Date().toISOString()
        ]);
        
        // Write in bulk for performance
        sheet.getRange(2, 1, rowsToAdd.length, 10).setValues(rowsToAdd);
      }
      
      return createJSONOutput({ status: 'success', count: booksToSeed.length });
    }
    
    // --- UPDATE ACTION ---
    if (action === 'update') {
      const id = data.id;
      if (!id) throw new Error('ID required for update');
      
      const rows = sheet.getDataRange().getValues();
      let found = false;
      
      // Find row by ID (index 0)
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == id) {
          const rowIndex = i + 1; // 1-based index
          
          // Update specific columns if data is provided
          // Column Indices (1-based):
          // 1:id, 2:title, 3:subject, 4:classLevel, 5:subCategory, 6:thumbnailUrl, 7:pdfUrl, 8:description
          
          if (data.title !== undefined) sheet.getRange(rowIndex, 2).setValue(data.title);
          if (data.subject !== undefined) sheet.getRange(rowIndex, 3).setValue(data.subject);
          if (data.classLevel !== undefined) sheet.getRange(rowIndex, 4).setValue(data.classLevel);
          if (data.subCategory !== undefined) sheet.getRange(rowIndex, 5).setValue(data.subCategory);
          if (data.thumbnailUrl !== undefined) sheet.getRange(rowIndex, 6).setValue(data.thumbnailUrl);
          if (data.pdfUrl !== undefined) sheet.getRange(rowIndex, 7).setValue(data.pdfUrl);
          if (data.description !== undefined) sheet.getRange(rowIndex, 8).setValue(data.description);
          
          found = true;
          break;
        }
      }
      
      return createJSONOutput({ status: found ? 'success' : 'not_found' });
    }
    
    // --- DELETE ACTION ---
    if (action === 'delete') {
      const id = data.id;
      const rows = sheet.getDataRange().getValues();
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == id) {
          sheet.deleteRow(i + 1);
          return createJSONOutput({ status: 'success' });
        }
      }
      return createJSONOutput({ status: 'not_found' });
    }

  } catch (err) {
    return createJSONOutput({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Utility to run manually once to reset/init headers if starting fresh
function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // WARNING: This clears the first row
  const headerRow = sheet.getRange(1, 1, 1, 10);
  headerRow.setValues([['id', 'title', 'subject', 'classLevel', 'subCategory', 'thumbnailUrl', 'pdfUrl', 'description', 'publishYear', 'createdAt']]);
}