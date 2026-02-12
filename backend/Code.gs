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

// ============================================
// RESPUESTAS ESTANDARIZADAS (Socorro Pattern)
// ============================================

/**
 * Genera una respuesta exitosa estandarizada
 * @param {Object} data - Datos a devolver
 * @param {String} message - Mensaje opcional
 * @returns {Object} Respuesta estandarizada
 */
function successResponse(data, message) {
  return {
    success: true,
    data: data || {},
    message: message || '',
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera una respuesta de error estandarizada
 * @param {String} error - Mensaje de error
 * @param {String} code - Código de error
 * @returns {Object} Respuesta estandarizada
 */
function errorResponse(error, code) {
  const errorCode = code || 'UNKNOWN_ERROR';
  Logger.log('❌ Error [' + errorCode + ']: ' + error);
  return {
    success: false,
    error: error,
    code: errorCode,
    timestamp: new Date().toISOString()
  };
}





/**
 * Maneja peticiones GET
 * Soporta JSONP para permitir lectura cross-origin
 */
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback; // Para JSONP
  
  try {
    let result;
    
    switch (action) {
      case 'version':
        // Endpoint de diagnóstico
        result = {
          version: '2.1-JSONP-APPROVAL-FIX',
          timestamp: new Date().toISOString(),
          features: ['JSONP', 'Approval Filter', 'String ID Matching']
        };
        break;
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
      case 'getTransportesPendientes':
        result = getTransportesPendientes();
        break;
      default:
        result = errorResponse('Acción no válida: ' + action, 'INVALID_ACTION');
    }
    
    // Si hay callback (JSONP), devolver JavaScript
    if (callback) {
      const jsonpResponse = callback + '(' + JSON.stringify(result) + ');';
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Si no hay callback, devolver JSON normal
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResult = errorResponse(error.toString(), 'GET_ERROR');
    
    // Si hay callback (JSONP), devolver error como JavaScript
    if (callback) {
      const jsonpResponse = callback + '(' + JSON.stringify(errorResult) + ');';
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Si no hay callback, devolver error como JSON
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja peticiones POST
 * Acepta tanto JSON como parámetros de formulario
 */
function doPost(e) {
  try {
    let action, dataParam, id, estado;
    
    // Intentar parsear como JSON primero
    try {
      const jsonData = JSON.parse(e.postData.contents);
      action = jsonData.action;
      dataParam = jsonData.data;
      id = jsonData.id;
      estado = jsonData.estado;
    } catch (jsonError) {
      // Si falla, intentar leer como parámetros de formulario
      action = e.parameter.action;
      id = e.parameter.id;
      estado = e.parameter.estado;
      
      // Para datos complejos que vienen como JSON string en el parámetro 'data'
      if (e.parameter.data) {
        try {
          dataParam = JSON.parse(e.parameter.data);
        } catch {
          dataParam = e.parameter.data;
        }
      } else {
        // Si no hay parámetro 'data', construir objeto desde parámetros individuales
        // Esto es para cuando se envían todos los campos por separado
        dataParam = {};
        for (let key in e.parameter) {
          if (key !== 'action') {
            try {
              // Intentar parsear como JSON por si es un objeto
              dataParam[key] = JSON.parse(e.parameter[key]);
            } catch {
              // Si no es JSON, usar el valor directo
              dataParam[key] = e.parameter[key];
            }
          }
        }
      }
    }
    
    let result;
    
    switch (action) {
      case 'crearSolicitud':
        result = crearSolicitud(dataParam);
        break;
      case 'crearOferta':
        result = crearOferta(dataParam);
        break;
      case 'gestionarAlbergue':
        result = gestionarAlbergue(dataParam);
        break;
      // Admin actions
      case 'aprobarSolicitud':
        result = aprobarSolicitud(id);
        break;
      case 'rechazarSolicitud':
        result = rechazarSolicitud(id);
        break;
      case 'aprobarOferta':
        result = aprobarOferta(id);
        break;
      case 'rechazarOferta':
        result = rechazarOferta(id);
        break;
      case 'aprobarAlbergue':
        result = aprobarAlbergue(id);
        break;
      case 'registrarInventario':
        result = registrarInventario(dataParam);
        break;
      case 'registrarTransporte':
        result = registrarTransporte(dataParam);
        break;
      case 'aprobarTransporte':
        result = aprobarTransporte(id);
        break;
      case 'rechazarTransporte':
        result = rechazarTransporte(id);
        break;
      case 'actualizarEstadoTransporte':
        result = actualizarEstadoTransporte(dataParam.id, dataParam.estado);
        break;
      case 'registrarFeedback':
        result = registrarFeedback(dataParam.data || dataParam);
        break;
      default:
        result = errorResponse('Acción no válida: ' + action, 'INVALID_ACTION');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse(error.toString(), 'POST_ERROR')))
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
    
    return successResponse(solicitudes);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_SOLICITUDES_ERROR');
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
    
    return successResponse(solicitudes);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_SOLICITUDES_PENDIENTES_ERROR');
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
    
    return successResponse(ofertas);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_OFERTAS_ERROR');
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
    
    return successResponse(ofertas);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_OFERTAS_PENDIENTES_ERROR');
  }
}

/**
 * Obtiene todos los albergues APROBADOS (para mapa público)
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
      
      const estadoAprobacion = data[i][10] || 'pendiente_aprobacion';
      
      // Solo mostrar albergues aprobados en el mapa público
      if (estadoAprobacion !== 'activo') continue;
      
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
        estadoAprobacion: estadoAprobacion
      });
    }
    
    return successResponse(albergues);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_ALBERGUES_ERROR');
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
    
    return successResponse({ id: datos.id }, 'Solicitud creada correctamente');
  } catch (error) {
    return errorResponse(error.toString(), 'CREATE_SOLICITUD_ERROR');
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
    
    return successResponse({ id: datos.id }, 'Oferta creada correctamente');
  } catch (error) {
    return errorResponse(error.toString(), 'CREATE_OFERTA_ERROR');
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
    
    return successResponse({ id: datos.id }, 'Albergue registrado correctamente');
  } catch (error) {
    return errorResponse(error.toString(), 'GESTIONAR_ALBERGUE_ERROR');
  }
}

/**
 * Obtiene estadísticas
 */


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
    
    return successResponse(albergues);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_ALBERGUES_PENDIENTES_ERROR');
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
        return successResponse({ id: id }, 'Solicitud aprobada');
      }
    }
    
    return errorResponse('Solicitud no encontrada', 'NOT_FOUND');
  } catch (error) {
    return errorResponse(error.toString(), 'APPROVE_SOLICITUD_ERROR');
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
        return successResponse({ id: id }, 'Solicitud rechazada');
      }
    }
    
    return errorResponse('Solicitud no encontrada', 'NOT_FOUND');
  } catch (error) {
    return errorResponse(error.toString(), 'REJECT_SOLICITUD_ERROR');
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
        return successResponse({ id: id }, 'Oferta aprobada');
      }
    }
    
    return errorResponse('Oferta no encontrada', 'NOT_FOUND');
  } catch (error) {
    return errorResponse(error.toString(), 'APPROVE_OFERTA_ERROR');
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
        return successResponse({ id: id }, 'Oferta rechazada');
      }
    }
    
    return errorResponse('Oferta no encontrada', 'NOT_FOUND');
  } catch (error) {
    return errorResponse(error.toString(), 'REJECT_OFERTA_ERROR');
  }
}

/**
 * Aprueba un albergue
 */
function aprobarAlbergue(data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Albergues');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    // El ID puede venir en data.id o directamente como parámetro
    const id = data.id || data;
    
    const sheetData = sheet.getDataRange().getValues();
    
    // LOG: Ver qué ID estamos buscando
    Logger.log('🔍 Buscando albergue con ID: ' + id + ' (tipo: ' + typeof id + ')');
    
    for (let i = 1; i < sheetData.length; i++) {
      // Convertir ambos a string para comparar
      const sheetId = String(sheetData[i][0]);
      const searchId = String(id);
      
      // LOG: Ver todos los IDs en la hoja
      Logger.log('Fila ' + i + ': ID = ' + sheetId + ' vs ' + searchId);
      
      if (sheetId === searchId) {
        Logger.log('✅ ENCONTRADO! Actualizando fila ' + (i + 1) + ', columna 11');
        
        // Actualizar columna K (11) = EstadoAprobacion
        sheet.getRange(i + 1, 11).setValue('activo');
        
        // Verificar que se guardó
        const valorGuardado = sheet.getRange(i + 1, 11).getValue();
        Logger.log('✅ Valor guardado: ' + valorGuardado);
        
        return successResponse({ id: sheetId }, 'Albergue aprobado');
      }
    }
    
    return errorResponse('Albergue no encontrada', 'NOT_FOUND');
  } catch (error) {
    return errorResponse(error.toString(), 'APPROVE_ALBERGUE_ERROR');
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
    
    return successResponse({ id: id }, 'Inventario registrado correctamente');
  } catch (error) {
    return errorResponse(error.toString(), 'REGISTER_INVENTARIO_ERROR');
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
    
    return successResponse(inventario);
  } catch (error) {
    return errorResponse(error.toString(), 'GET_INVENTARIO_ERROR');
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
  
  return successResponse({ id: row[0] }, 'Transporte registrado correctamente');
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
  
  return successResponse(transportes);
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
  
  return successResponse(transportes);
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
      return successResponse({ id: id }, 'Transporte aprobado');
    }
  }
  
  return errorResponse('Transporte no encontrado', 'NOT_FOUND');
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
      return successResponse({ id: id }, 'Transporte rechazado');
    }
  }
  
  return errorResponse('Transporte no encontrado', 'NOT_FOUND');
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
      return successResponse({ id: id, nuevoEstado: nuevoEstado }, 'Estado actualizado');
    }
  }
  
  return errorResponse('Transporte no encontrado', 'NOT_FOUND');
}

/**
 * Registra feedback de usuarios
 */
function registrarFeedback(datos) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Feedback');
    
    if (!sheet) {
      sheet = ss.insertSheet('Feedback');
      sheet.appendRow(['ID', 'Timestamp', 'Mensaje', 'Email', 'UserAgent']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2E8F0');
    }
    
    const id = 'FB-' + Date.now();
    const timestamp = new Date().toISOString();
    
    sheet.appendRow([
      id,
      timestamp,
      datos.feedback || datos.mensaje || '',
      datos.email || '',
      datos.user_agent || datos.userAgent || ''
    ]);
    
    return successResponse({ id: id }, 'Feedback recibido. ¡Gracias!');
  } catch (error) {
    return errorResponse(error.toString(), 'FEEDBACK_ERROR');
  }
}

/**
 * Helper privado para leer datos crudos de una hoja
 */
function _getDataFromSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  // Remover header y filtrar filas vacías
  return data.slice(1).filter(row => row[0]);
}
