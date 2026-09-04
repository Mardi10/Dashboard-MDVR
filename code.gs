/**
 * BACKEND GOOGLE APPS SCRIPT
 * Update: Fitur duplikasi otomatis saat menambah rentang waktu pada mode Edit
 */

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Sistem Monitoring MDVR PRO')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function convertToDirectLink(driveUrl) {
  if (!driveUrl || typeof driveUrl !== 'string') return "";
  const fileId = driveUrl.match(/[-\w]{25,}/);
  if (fileId) {
    return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
  }
  return driveUrl;
}

function uploadToDrive(base64Data, fileName) {
  if (!base64Data || !base64Data.includes("base64,")) return "";
  try {
    const folderId = "1kSz7mP7d-qzZAk5PvQDJUtayzxVmvJWC"; 
    let folder;
    try {
      if (folderId && folderId !== "1kSz7mP7d-qzZAk5PvQDJUtayzxVmvJWC") {
        folder = DriveApp.getFolderById(folderId);
      } else {
        const folders = DriveApp.getFoldersByName("MDVR_Uploads_Final");
        folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("MDVR_Uploads_Final");
      }
    } catch (err) {
      const folders = DriveApp.getFoldersByName("MDVR_Uploads_Final");
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("MDVR_Uploads_Final");
    }
    
    const splitData = base64Data.split(",");
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const byteCharacters = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(byteCharacters, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return "";
  }
}

function getDataFromSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; 
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return [];
    
    const values = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();  
    const headers = values[0];
    
    const data = values.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, i) => {
        let val = row[i];
        if (header === "Foto Sebelum" || header === "Foto Sesudah") {
           obj[header + "_Thumb"] = convertToDirectLink(val);
        }
        obj[header] = val;
      });
      return obj;
    });
    return data.reverse(); 
  } catch (err) {
    return [];
  }
}

function processForm(formData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; 
    const headers = [
      "ID", "Nama", "NRP", "Jabatan", "No Lambung", 
      "Tanggal", "Waktu", "Masalah", "Shift", "PIT", 
      "Sanksi", "Foto Sebelum", "Foto Sesudah", "PIC", "Keterangan",
      "Link Studio Sebelum", "Link Studio Sesudah"
    ];
    
    let sheetData = sheet.getDataRange().getValues();
    if (sheetData.length === 0 || sheetData[0][0] !== "ID") {
      sheet.clear();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Penanganan Foto
    let urlSblm = formData.fotoSebelumExisting || "";
    let urlSsdh = formData.fotoSesudahExisting || "";

    if (formData.fotoSebelumBase64 && formData.fotoSebelumBase64.startsWith("data:image")) {
      urlSblm = uploadToDrive(formData.fotoSebelumBase64, "Sblm_" + (formData.noLambung || "Unit") + "_" + Date.now());
    }
    if (formData.fotoSesudahBase64 && formData.fotoSesudahBase64.startsWith("data:image")) {
      urlSsdh = uploadToDrive(formData.fotoSesudahBase64, "Ssdh_" + (formData.noLambung || "Unit") + "_" + Date.now());
    }

    const studioSblm = convertToDirectLink(urlSblm);
    const studioSsdh = convertToDirectLink(urlSsdh);
    const listWaktu = formData.waktu ? formData.waktu.split(", ") : ["--:--"];
    const tglFix = formData.tanggal || "";

    // LOGIKA UPDATE ATAU DUPLIKASI JIKA ADA WAKTU TAMBAHAN
    if (formData.id) {
      let dataRange = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] == formData.id) { 
          rowIndex = i + 1; 
          break; 
        }
      }
      
      if (rowIndex !== -1) {
        const oldRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
        const finalUrlSblm = urlSblm || oldRow[11];
        const finalUrlSsdh = urlSsdh || oldRow[12];
        
        // 1. Update baris asli dengan data baru dan waktu pertama dari list
        const rowUpdate = [
          formData.id, 
          formData.nama || oldRow[1], 
          formData.nrp || oldRow[2], 
          formData.jabatan || oldRow[3], 
          formData.noLambung || oldRow[4],
          tglFix || oldRow[5], 
          listWaktu[0], // Waktu pertama digunakan untuk update data yang sedang diedit
          formData.masalah || oldRow[7], 
          formData.shift || oldRow[8], 
          formData.pit || oldRow[9], 
          formData.sanksi || oldRow[10], 
          finalUrlSblm, 
          finalUrlSsdh, 
          formData.pic || oldRow[13], 
          formData.keterangan || oldRow[14],
          convertToDirectLink(finalUrlSblm), 
          convertToDirectLink(finalUrlSsdh)
        ];
        sheet.getRange(rowIndex, 1, 1, rowUpdate.length).setValues([rowUpdate]);

        // 2. JIKA ADA WAKTU LEBIH DARI SATU, BUAT BARIS BARU UNTUK SISANYA
        if (listWaktu.length > 1) {
          for (let j = 1; j < listWaktu.length; j++) {
            const newId = "MDVR-" + Math.random().toString(36).substr(2, 6).toUpperCase();
            sheet.appendRow([
              newId, 
              formData.nama || oldRow[1], 
              formData.nrp || oldRow[2], 
              formData.jabatan || oldRow[3], 
              formData.noLambung || oldRow[4],
              tglFix || oldRow[5], 
              listWaktu[j], // Gunakan waktu tambahan
              formData.masalah || oldRow[7], 
              formData.shift || oldRow[8], 
              formData.pit || oldRow[9], 
              formData.sanksi || oldRow[10], 
              finalUrlSblm, 
              finalUrlSsdh, 
              formData.pic || oldRow[13], 
              formData.keterangan || oldRow[14],
              convertToDirectLink(finalUrlSblm), 
              convertToDirectLink(finalUrlSsdh)
            ]);
          }
          return "Data Diperbarui & Waktu Baru Ditambahkan";
        }
        return "Berhasil Diperbarui";
      }
    } 
    
    // LOGIKA INSERT DATA BARU (Normal)
    listWaktu.forEach(wkt => {
      const uniqueId = "MDVR-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      sheet.appendRow([
        uniqueId, formData.nama, formData.nrp, formData.jabatan, formData.noLambung,
        tglFix, wkt, formData.masalah, formData.shift, formData.pit, 
        formData.sanksi, urlSblm, urlSsdh, formData.pic, formData.keterangan,
        studioSblm, studioSsdh
      ]);
    });
    
    return "Berhasil Disimpan";
  } catch (err) {
    return "Terjadi Kesalahan: " + err.toString();
  }
}
