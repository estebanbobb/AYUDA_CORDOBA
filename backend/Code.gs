// ============================================
// SOCORRO CÓRDOBA - GOOGLE APPS SCRIPT BACKEND
// ============================================

// ID de tu Google Spreadsheet
// IMPORTANTE: Reemplaza esto con el ID de tu hoja de cálculo
const SHEET_ID = '1awrjvEUNrktosSZqa9gRj2bz4P8Gg-sX5GUXnWRzTCA';

/**
 * Obtiene la hoja de cálculo
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

/**
 * Maneja peticiones GET
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    let result;
    
    switch (action) {
      case 'getSolicitudes':
        result = getSolicitudes();
        break;
      case 'getOfertas':
        result = getOfertas();
        break;
      case 'getAlbergues':
        result = getAlbergues();
        break;
      case 'getEstadisticas':
        result = getEstadisticas();
        break;
      // Admin endpoints
      case 'getSolicitudesPendientes':
        result = getSolicitudesPendientes();
        break;
      case 'getOfertasPendientes':
        result = getOfertasPendientes();
        break;
      case 'getAlberguesPendientes':
        result = getAlberguesPendientes();
        break;
      case 'getInventario':
        result = getInventario(e.parameter.albergueId);
        break;
      case 'getTransportes':
        result = getTransportes();
        break;
      case 'getTransportesPendientes':
        result = getTransportesPendientes();
        break;
      default:
        result = { error: 'Acción no válida' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja peticiones POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'crearSolicitud':
        result = crearSolicitud(data.data);
        break;
      case 'crearOferta':
        result = crearOferta(data.data);
        break;
      case 'gestionarAlbergue':
        result = gestionarAlbergue(data.data);
        break;
      // Admin actions
      case 'aprobarSolicitud':
        result = aprobarSolicitud(data.id);
        break;
      case 'rechazarSolicitud':
        result = rechazarSolicitud(data.id);
        break;
      case 'aprobarOferta':
        result = aprobarOferta(data.id);
        break;
      case 'rechazarOferta':
        result = rechazarOferta(data.id);
        break;
      case 'aprobarAlbergue':
        result = aprobarAlbergue(data.id);
        break;
      case 'registrarInventario':
        result = registrarInventario(data.data);
        break;
      case 'registrarTransporte':
        result = registrarTransporte(data.data);
        break;
      case 'aprobarTransporte':
        result = aprobarTransporte(data.id);
        break;
      case 'rechazarTransporte':
        result = rechazarTransporte(data.id);
        break;
      case 'actualizarEstadoTransporte':
        result = actualizarEstadoTransporte(data.id, data.estado);
        break;
      default:
        result = { error: 'Acción no válida' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene todas las solicitudes de ayuda ACTIVAS (para mapa público)
 */
function getSolicitudes() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Solicitudes');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const solicitudes = [];
    
    // Saltar header (fila 0)
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue; // Saltar filas vacías
      
      const estadoAprobacion = data[i][12] || 'pendiente_aprobacion';
      
      // Solo mostrar solicitudes activas en el mapa público
      if (estadoAprobacion !== 'activo') continue;
      
      solicitudes.push({
        id: data[i][0],
        timestamp: data[i][1],
        nombre: data[i][2],
        telefono: data[i][3],
        lat: data[i][4],
        lng: data[i][5],
        barrio: data[i][6],
        direccion: data[i][7],
        tipoAyuda: data[i][8],
        personas: data[i][9],
        notas: data[i][10],
        estado: data[i][11] || 'pendiente',
        estadoAprobacion: estadoAprobacion
      });
    }
    
    return solicitudes;
  } catch (error) {
    Logger.log('Error en getSolicitudes: ' + error);
    return [];
  }
}

/**
 * Obtiene solicitudes PENDIENTES de aprobación (para admin)
 */
function getSolicitudesPendientes() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Solicitudes');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const solicitudes = [];
    
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      
      const estadoAprobacion = data[i][12] || 'pendiente_aprobacion';
      
      // Solo solicitudes pendientes
      if (estadoAprobacion !== 'pendiente_aprobacion') continue;
      
      solicitudes.push({
        id: data[i][0],
        timestamp: data[i][1],
        nombre: data[i][2],
        telefono: data[i][3],
        lat: data[i][4],
        lng: data[i][5],
        barrio: data[i][6],
        direccion: data[i][7],
        tipoAyuda: data[i][8],
        personas: data[i][9],
        notas: data[i][10],
        estado: data[i][11] || 'pendiente',
        estadoAprobacion: estadoAprobacion,
        fila: i + 1 // Para actualizar después
      });
    }
    
    return solicitudes;
  } catch (error) {
    Logger.log('Error en getSolicitudesPendientes: ' + error);
    return [];
  }
}

/**
 * Obtiene todas las ofertas de ayuda ACTIVAS (para mapa público)
 */
function getOfertas() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Ofertas');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const ofertas = [];
    
    // Saltar header (fila 0)
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue; // Saltar filas vacías
      
      const estadoAprobacion = data[i][10] || 'pendiente_aprobacion';
      
      // Solo mostrar ofertas activas
      if (estadoAprobacion !== 'activo') continue;
      
      ofertas.push({
        id: data[i][0],
        timestamp: data[i][1],
        nombre: data[i][2],
        telefono: data[i][3],
        tipoAyuda: data[i][4],
        cantidad: data[i][5],
        lat: data[i][6],
        lng: data[i][7],
        barrio: data[i][8],
        estado: data[i][9] || 'activo',
        estadoAprobacion: estadoAprobacion
      });
    }
    
    return ofertas;
  } catch (error) {
    Logger.log('Error en getOfertas: ' + error);
    return [];
  }
}

/**
 * Obtiene ofertas PENDIENTES de aprobación (para admin)
 */
function getOfertasPendientes() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Ofertas');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const ofertas = [];
    
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      
      const estadoAprobacion = data[i][10] || 'pendiente_aprobacion';
      
      // Solo ofertas pendientes
      if (estadoAprobacion !== 'pendiente_aprobacion') continue;
      
      ofertas.push({
        id: data[i][0],
        timestamp: data[i][1],
        nombre: data[i][2],
        telefono: data[i][3],
        tipoAyuda: data[i][4],
        cantidad: data[i][5],
        lat: data[i][6],
        lng: data[i][7],
        barrio: data[i][8],
        estado: data[i][9] || 'activo',
        estadoAprobacion: estadoAprobacion,
        fila: i + 1
      });
    }
    
    return ofertas;
  } catch (error) {
    Logger.log('Error en getOfertasPendientes: ' + error);
    return [];
  }
}

/**
 * Obtiene todos los albergues
 */
function getAlbergues() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Albergues');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const albergues = [];
    
    // Saltar header (fila 0)
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue; // Saltar filas vacías
      
      albergues.push({
        id: data[i][0],
        nombre: data[i][1],
        lat: data[i][2],
        lng: data[i][3],
        direccion: data[i][4],
        capacidadTotal: data[i][5],
        ocupacionActual: data[i][6],
        recursos: data[i][7],
        contacto: data[i][8],
        estado: data[i][9] || 'activo'
      });
    }
    
    return albergues;
  } catch (error) {
    Logger.log('Error en getAlbergues: ' + error);
    return [];
  }
}

/**
 * Crea una nueva solicitud de ayuda
 */
function crearSolicitud(datos) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Solicitudes');
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('Solicitudes');
      sheet.appendRow([
        'ID', 'Timestamp', 'Nombre', 'Telefono', 'Lat', 'Lng', 
        'Barrio', 'Direccion', 'TipoAyuda', 'Personas', 'Notas', 'Estado', 'EstadoAprobacion'
      ]);
    }
    
    // Agregar nueva fila con estado pendiente_aprobacion
    sheet.appendRow([
      datos.id,
      datos.timestamp,
      datos.nombre,
      datos.telefono,
      datos.lat,
      datos.lng,
      datos.barrio || '',
      datos.direccion || '',
      datos.tipoAyuda || '',
      datos.personas || 1,
      datos.notas || '',
      datos.estado || 'pendiente',
      'pendiente_aprobacion' // Nueva columna
    ]);
    
    return { success: true, id: datos.id };
  } catch (error) {
    Logger.log('Error en crearSolicitud: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Crea una nueva oferta de ayuda
 */
function crearOferta(datos) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Ofertas');
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('Ofertas');
      sheet.appendRow([
        'ID', 'Timestamp', 'Nombre', 'Telefono', 'TipoAyuda', 
        'Cantidad', 'Lat', 'Lng', 'Barrio', 'Estado', 'EstadoAprobacion'
      ]);
    }
    
    // Agregar nueva fila con estado pendiente_aprobacion
    sheet.appendRow([
      datos.id,
      datos.timestamp,
      datos.nombre,
      datos.telefono,
      datos.tipoAyuda || '',
      datos.cantidad || '',
      datos.lat || '',
      datos.lng || '',
      datos.barrio || '',
      datos.estado || 'activo',
      'pendiente_aprobacion' // Nueva columna
    ]);
    
    return { success: true, id: datos.id };
  } catch (error) {
    Logger.log('Error en crearOferta: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Crea o actualiza un albergue
 */
function gestionarAlbergue(datos) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Albergues');
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('Albergues');
      sheet.appendRow([
        'ID', 'Nombre', 'Lat', 'Lng', 'Direccion', 
        'CapacidadTotal', 'OcupacionActual', 'Recursos', 'Contacto', 'Estado', 'EstadoAprobacion'
      ]);
    }
    
    // Agregar nueva fila con estado pendiente_aprobacion
    sheet.appendRow([
      datos.id,
      datos.nombre,
      datos.lat || '',
      datos.lng || '',
      datos.direccion || '',
      datos.capacidadTotal || 0,
      datos.ocupacionActual || 0,
      datos.recursos || '',
      datos.contacto || '',
      datos.estado || 'activo',
      'pendiente_aprobacion' // Nueva columna
    ]);
    
    return { success: true, id: datos.id };
  } catch (error) {
    Logger.log('Error en gestionarAlbergue: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene estadísticas
 */
function getEstadisticas() {
  try {
    const solicitudes = getSolicitudes();
    const ofertas = getOfertas();
    const albergues = getAlbergues();
    
    const atendidos = solicitudes.filter(s => s.estado === 'atendido').length;
    
    return {
      totalSolicitudes: solicitudes.length,
      totalOfertas: ofertas.length,
      totalAlbergues: albergues.length,
      atendidos: atendidos,
      pendientes: solicitudes.length - atendidos
    };
  } catch (error) {
    Logger.log('Error en getEstadisticas: ' + error);
    return {
      totalSolicitudes: 0,
      totalOfertas: 0,
      totalAlbergues: 0,
      atendidos: 0,
      pendientes: 0
    };
  }
}

/**
 * Inicializa las hojas necesarias
 */
function inicializarHojas() {
  const ss = getSpreadsheet();
  
  // Crear hoja Solicitudes
  let sheetSolicitudes = ss.getSheetByName('Solicitudes');
  if (!sheetSolicitudes) {
    sheetSolicitudes = ss.insertSheet('Solicitudes');
    sheetSolicitudes.appendRow([
      'ID', 'Timestamp', 'Nombre', 'Telefono', 'Lat', 'Lng', 
      'Barrio', 'Direccion', 'TipoAyuda', 'Personas', 'Notas', 'Estado'
    ]);
    sheetSolicitudes.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#E53E3E').setFontColor('#FFFFFF');
  }
  
  // Crear hoja Ofertas
  let sheetOfertas = ss.getSheetByName('Ofertas');
  if (!sheetOfertas) {
    sheetOfertas = ss.insertSheet('Ofertas');
    sheetOfertas.appendRow([
      'ID', 'Timestamp', 'Nombre', 'Telefono', 'TipoAyuda', 
      'Cantidad', 'Lat', 'Lng', 'Barrio', 'Estado'
    ]);
    sheetOfertas.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#38A169').setFontColor('#FFFFFF');
  }
  
  // Crear hoja Albergues
  let sheetAlbergues = ss.getSheetByName('Albergues');
  if (!sheetAlbergues) {
    sheetAlbergues = ss.insertSheet('Albergues');
    sheetAlbergues.appendRow([
      'ID', 'Nombre', 'Lat', 'Lng', 'Direccion', 
      'CapacidadTotal', 'OcupacionActual', 'Recursos', 'Contacto', 'Estado'
    ]);
    sheetAlbergues.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#DD6B20').setFontColor('#FFFFFF');
  }
  
  // Crear hoja Inventario
  let sheetInventario = ss.getSheetByName('Inventario');
  if (!sheetInventario) {
    sheetInventario = ss.insertSheet('Inventario');
    sheetInventario.appendRow([
      'ID', 'AlbergueID', 'AlbergueNombre', 'Fecha', 'Agua (L)', 'Comida (raciones)', 
      'Medicinas', 'Ropa', 'Notas', 'RegistradoPor'
    ]);
    sheetInventario.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#3182CE').setFontColor('#FFFFFF');
  }
  
  // Crear hoja Transporte
  let sheetTransporte = ss.getSheetByName('Transporte');
  if (!sheetTransporte) {
    sheetTransporte = ss.insertSheet('Transporte');
    sheetTransporte.appendRow([
      'ID', 'Timestamp', 'Conductor', 'Telefono', 'TipoVehiculo', 'Placa',
      'CapacidadPasajeros', 'CapacidadCarga', 'Lat', 'Lng', 'Direccion',
      'ZonaCobertura', 'RadioKm', 'Horario', 'Estado', 'EstadoAprobacion'
    ]);
    sheetTransporte.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#805AD5').setFontColor('#FFFFFF');
  }
  
  // Agregar columnas de aprobación si no existen
  if (sheetSolicitudes && sheetSolicitudes.getLastColumn() < 13) {
    sheetSolicitudes.getRange(1, 13).setValue('EstadoAprobacion');
    sheetSolicitudes.getRange(1, 13).setFontWeight('bold').setBackground('#E53E3E').setFontColor('#FFFFFF');
  }
  
  if (sheetOfertas && sheetOfertas.getLastColumn() < 11) {
    sheetOfertas.getRange(1, 11).setValue('EstadoAprobacion');
    sheetOfertas.getRange(1, 11).setFontWeight('bold').setBackground('#38A169').setFontColor('#FFFFFF');
  }
  
  if (sheetAlbergues && sheetAlbergues.getLastColumn() < 11) {
    sheetAlbergues.getRange(1, 11).setValue('EstadoAprobacion');
    sheetAlbergues.getRange(1, 11).setFontWeight('bold').setBackground('#DD6B20').setFontColor('#FFFFFF');
  }
  
  Logger.log('✅ Hojas inicializadas correctamente');
  return '✅ Sistema inicializado. Hojas creadas: Solicitudes, Ofertas, Albergues, Inventario, Transporte';
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN
// ============================================

/**
 * Obtiene albergues pendientes de aprobación
 */
function getAlberguesPendientes() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Albergues');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const albergues = [];
    
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      
      const estadoAprobacion = data[i][10] || 'pendiente_aprobacion';
      
      if (estadoAprobacion !== 'pendiente_aprobacion') continue;
      
      albergues.push({
        id: data[i][0],
        nombre: data[i][1],
        lat: data[i][2],
        lng: data[i][3],
        direccion: data[i][4],
        capacidadTotal: data[i][5],
        ocupacionActual: data[i][6],
        recursos: data[i][7],
        contacto: data[i][8],
        estado: data[i][9] || 'activo',
        estadoAprobacion: estadoAprobacion,
        fila: i + 1
      });
    }
    
    return albergues;
  } catch (error) {
    Logger.log('Error en getAlberguesPendientes: ' + error);
    return [];
  }
}

/**
 * Aprueba una solicitud de ayuda
 */
function aprobarSolicitud(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Solicitudes');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 13).setValue('activo');
        return { success: true, message: 'Solicitud aprobada' };
      }
    }
    
    return { success: false, error: 'Solicitud no encontrada' };
  } catch (error) {
    Logger.log('Error en aprobarSolicitud: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Rechaza una solicitud de ayuda
 */
function rechazarSolicitud(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Solicitudes');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 13).setValue('rechazado');
        return { success: true, message: 'Solicitud rechazada' };
      }
    }
    
    return { success: false, error: 'Solicitud no encontrada' };
  } catch (error) {
    Logger.log('Error en rechazarSolicitud: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Aprueba una oferta de ayuda
 */
function aprobarOferta(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Ofertas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 11).setValue('activo');
        return { success: true, message: 'Oferta aprobada' };
      }
    }
    
    return { success: false, error: 'Oferta no encontrada' };
  } catch (error) {
    Logger.log('Error en aprobarOferta: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Rechaza una oferta de ayuda
 */
function rechazarOferta(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Ofertas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 11).setValue('rechazado');
        return { success: true, message: 'Oferta rechazada' };
      }
    }
    
    return { success: false, error: 'Oferta no encontrada' };
  } catch (error) {
    Logger.log('Error en rechazarOferta: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Aprueba un albergue
 */
function aprobarAlbergue(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Albergues');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 11).setValue('activo');
        return { success: true, message: 'Albergue aprobado' };
      }
    }
    
    return { success: false, error: 'Albergue no encontrado' };
  } catch (error) {
    Logger.log('Error en aprobarAlbergue: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Registra inventario de un albergue
 */
function registrarInventario(datos) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Inventario');
    
    if (!sheet) {
      sheet = ss.insertSheet('Inventario');
      sheet.appendRow([
        'ID', 'AlbergueID', 'AlbergueNombre', 'Fecha', 'Agua (L)', 'Comida (raciones)', 
        'Medicinas', 'Ropa', 'Notas', 'RegistradoPor'
      ]);
    }
    
    const id = 'INV' + Date.now();
    const fecha = new Date().toISOString();
    
    sheet.appendRow([
      id,
      datos.albergueId,
      datos.albergueNombre || '',
      fecha,
      datos.agua || 0,
      datos.comida || 0,
      datos.medicinas || '',
      datos.ropa || '',
      datos.notas || '',
      datos.registradoPor || 'Admin'
    ]);
    
    return { success: true, id: id };
  } catch (error) {
    Logger.log('Error en registrarInventario: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene el inventario de un albergue
 */
function getInventario(albergueId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Inventario');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const inventario = [];
    
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      
      // Si se especifica albergueId, filtrar por ese albergue
      if (albergueId && data[i][1] !== albergueId) continue;
      
      inventario.push({
        id: data[i][0],
        albergueId: data[i][1],
        albergueNombre: data[i][2],
        fecha: data[i][3],
        agua: data[i][4],
        comida: data[i][5],
        medicinas: data[i][6],
        ropa: data[i][7],
        notas: data[i][8],
        registradoPor: data[i][9]
      });
    }
    
    // Ordenar por fecha descendente (más reciente primero)
    inventario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    return inventario;
  } catch (error) {
    Logger.log('Error en getInventario: ' + error);
    return [];
  }
}

// ============================================
// TRANSPORTE - FUNCIONES
// ============================================

/**
 * Registra un nuevo transporte
 */
function registrarTransporte(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return { success: false, error: 'Hoja Transporte no encontrada' };
  }
  
  const timestamp = new Date();
  const row = [
    data.id || Utilities.getUuid(),
    timestamp,
    data.conductor || '',
    data.telefono || '',
    data.tipoVehiculo || '',
    data.placa || '',
    data.capacidadPasajeros || 0,
    data.capacidadCarga || 0,
    data.lat || '',
    data.lng || '',
    data.direccion || '',
    data.zonaCobertura || '',
    data.radioKm || 5,
    data.horario || '',
    'disponible', // Estado inicial
    'pendiente' // EstadoAprobacion
  ];
  
  sheet.appendRow(row);
  
  return { 
    success: true, 
    message: 'Transporte registrado correctamente',
    id: row[0]
  };
}

/**
 * Obtiene todos los transportes activos (aprobados)
 */
function getTransportes() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const transportes = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const estadoAprobacion = row[15]; // EstadoAprobacion column
    
    // Solo retornar transportes activos (aprobados)
    if (estadoAprobacion === 'activo') {
      transportes.push({
        id: row[0],
        timestamp: row[1],
        conductor: row[2],
        telefono: row[3],
        tipoVehiculo: row[4],
        placa: row[5],
        capacidadPasajeros: row[6],
        capacidadCarga: row[7],
        lat: row[8],
        lng: row[9],
        direccion: row[10],
        zonaCobertura: row[11],
        radioKm: row[12],
        horario: row[13],
        estado: row[14],
        estadoAprobacion: row[15]
      });
    }
  }
  
  return transportes;
}

/**
 * Obtiene transportes pendientes de aprobación
 */
function getTransportesPendientes() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const transportes = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const estadoAprobacion = row[15];
    
    if (estadoAprobacion === 'pendiente') {
      transportes.push({
        id: row[0],
        timestamp: row[1],
        conductor: row[2],
        telefono: row[3],
        tipoVehiculo: row[4],
        placa: row[5],
        capacidadPasajeros: row[6],
        capacidadCarga: row[7],
        lat: row[8],
        lng: row[9],
        direccion: row[10],
        zonaCobertura: row[11],
        radioKm: row[12],
        horario: row[13],
        estado: row[14],
        estadoAprobacion: row[15]
      });
    }
  }
  
  return transportes;
}

/**
 * Aprueba un transporte
 */
function aprobarTransporte(id) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 16).setValue('activo'); // EstadoAprobacion
      return { success: true, message: 'Transporte aprobado' };
    }
  }
  
  return { success: false, error: 'Transporte no encontrado' };
}

/**
 * Rechaza un transporte
 */
function rechazarTransporte(id) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 16).setValue('rechazado'); // EstadoAprobacion
      return { success: true, message: 'Transporte rechazado' };
    }
  }
  
  return { success: false, error: 'Transporte no encontrado' };
}

/**
 * Actualiza el estado de un transporte (disponible, en_servicio, no_disponible)
 */
function actualizarEstadoTransporte(id, nuevoEstado) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Transporte');
  
  if (!sheet) {
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 15).setValue(nuevoEstado); // Estado
      return { success: true, message: 'Estado actualizado' };
    }
  }
  
  return { success: false, error: 'Transporte no encontrado' };
}
