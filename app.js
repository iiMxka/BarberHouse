const SHEET_NAME = "Citas Barberia";

function doGet(e) {
  try {
    console.log("🚀 doGet ejecutándose...");
    
    // Obtener la hoja de cálculo ACTIVA (donde está el script)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    console.log("📊 Spreadsheet:", ss.getName());
    
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.error("❌ HOJA NO ENCONTRADA:", SHEET_NAME);
      // Listar todas las hojas disponibles para debug
      const allSheets = ss.getSheets().map(s => s.getName());
      console.log("📋 Hojas disponibles:", allSheets);
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📅 Fecha solicitada:", e.parameter.fecha);
    
    const horasOcupadas = [];
    const fecha = e.parameter.fecha;

    if (fecha && sheet.getLastRow() > 0) {
      const data = sheet.getDataRange().getValues();
      console.log("📋 Filas de datos:", data.length);
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][3] && data[i][3].toString() === fecha) {
          if (data[i][4]) {
            horasOcupadas.push(data[i][4].toString());
          }
        }
      }
    }

    console.log("⏰ Horas ocupadas:", horasOcupadas);
    const output = JSON.stringify(horasOcupadas);

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("💥 ERROR en doGet:", error.toString());
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    console.log("📤 doPost ejecutándose...");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error("No se encuentra la hoja: " + SHEET_NAME);
    }
    
    const data = JSON.parse(e.postData.contents);
    console.log("📝 Nueva cita:", data);
    
    // Agregar encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([["Nombre", "Teléfono", "Servicio", "Fecha", "Hora"]]);
      console.log("📝 Encabezados agregados");
    }
    
    sheet.appendRow([
      data.nombre,
      data.telefono, 
      data.servicio,
      data.fecha,
      data.hora
    ]);
    
    console.log("✅ Cita guardada exitosamente");
    return ContentService.createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error("💥 ERROR en doPost:", error.toString());
    return ContentService.createTextOutput("ERROR: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Función de utilidad para debug
function debugSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log("🔍 DEBUG - Nombre del Spreadsheet:", ss.getName());
  console.log("🔍 DEBUG - URL del Spreadsheet:", ss.getUrl());
  
  const sheets = ss.getSheets();
  console.log("🔍 DEBUG - Hojas disponibles:");
  sheets.forEach((sheet, index) => {
    console.log(`  ${index + 1}. "${sheet.getName()}" - Filas: ${sheet.getLastRow()}`);
  });
  
  return "Debug completado - Revisa los logs";
}
