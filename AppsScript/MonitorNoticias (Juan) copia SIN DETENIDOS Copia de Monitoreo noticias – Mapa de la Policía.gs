/***********************
 * CONFIG
 ***********************/
const SHEET_INBOX   = "INBOX";
const SHEET_CASOS   = "CASOS";
const SHEET_ARCHIVO = "ARCHIVO";
const SHEET_SEEN    = "_SEEN";

// Columnas (1-indexed)
const COL_FECHA     = 1; // A
const COL_MEDIO     = 2; // B
const COL_TITULO    = 3; // C
const COL_LINK      = 4; // D
const COL_KEYWORD   = 5; // E
const COL_FUENTE    = 6; // F
const COL_REVISADO  = 7; // G
const COL_VALIDADO  = 8; // H
const COL_OBS       = 9; // I

const EST_PENDIENTE     = "PENDIENTE";
const EST_VALIDO        = "VALIDO";
const EST_NO_RELEVANTE  = "NO RELEVANTE";
const LISTA_VALIDADO    = [EST_PENDIENTE, EST_VALIDO, EST_NO_RELEVANTE];

const COLOR_PENDIENTE    = "#fff2cc";
const COLOR_VALIDO       = "#d9ead3";
const COLOR_NO_RELEVANTE = "#f4cccc";

const RETENCION_DIAS = 30;
const DEBUG = true;

/***********************
 * RSS búsquedas seguras
 ***********************/
const SEARCH_QUERIES = [
  'detenido CABA',
  'detenida CABA',
  'detuvieron CABA',
  'demorado CABA',
  'represion policial CABA',
  'represión policial CABA',
  'detenido "Capital Federal"',
  'represion policial "Capital Federal"',
  'detenido "Ciudad de Buenos Aires"',
  'represion policial "Ciudad de Buenos Aires"',
  'violencia policial "Ciudad de Buenos Aires"',
  'gatillo facil "Ciudad de Buenos Aires"',
  'abuso policial"Ciudad de Buenos Aires"',
  'violencia institucional "Ciudad de Buenos Aires"',
];

function buildNewsRssUrl_(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR:es-419`;
}


//probamos agregar categorias y reglas
const POLICIA = [
  "bastones largos",
  "policia",
  "efectivo",
  "uniformado",
  "comisaria",
  "comisario",
  "policial",
  "division unidad tactica de pacificacion",
  "camion hidrante",
  "accionar policial",
  "infiltrado",
  "PFA",
  "GNA",
  "gendarmeria",
  "SPF",
  "penitenciario",
  "DIR",
  "direccion de despliegue de intervenciones rapidas",
  "SPB",
  "seguridad privada",
]
const VIOLENCIA = [
"gatillo facil",
"uso desmedido de la fuerza",
"ejecucion reglamentaria",
"tiro a matar",
"fusilamiento",
"violencia institucional",
"violencia estatal",
"golpe",
"golpeo",
"golpiza",
"reprimio",
"represion",
"reprimieron",
"redujo",
"redujeron",
"fusilo",
"fusilamiento",
"aprehendio",
"aprehendieron",
"remato",
"asesino",
"abandono",
"caceria",
"violento",
"gatillo",
"abuso",
"arresto",
"agredio",
"baleo",
"refriega",
"operativo",
"bala",
"molotov",
"violencia",
"quemarropa",
"bastones largos",
"disparo",
"disparado",
"ejecuto"]

const VICTIMA = [
"arrestado",
"arrestada",
"demorado",
"demorada",
"detenido",
"detenida",
"desarmado",
"desarmada",
"aprehendido",
"aprehendida",
"golpeado",
"golpeada",
"victima",
"militante",
"grupo violento", 
"rostros ocultos",
"anarquista",
"trosko",
"troskista",
"rostros ocultos",
"sindicalista",
"piquetero",
"mantero",
"manifestante",
"vendedor",
"ambulante",
"situacion de calle",
"resistencia a la autoridad",
"indigente",
"indigencia"]

const RULES = [
  {
    name: "POLICIA + VIOLENCIA",
    groups: [POLICIA, VIOLENCIA]
  },
  {
    name: "POLICIA + VICTIMA + VIOLENCIA",
    groups: [POLICIA, VICTIMA, VIOLENCIA]
  },
  {
    name: "POLICIA + VICTIMA",
    groups: [POLICIA, VICTIMA]
  }
];


/***********************
 * SETUP (correr 1 vez)
 ***********************/
function setupSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inbox   = getOrCreateSheet_(ss, SHEET_INBOX, true);
  const casos   = getOrCreateSheet_(ss, SHEET_CASOS, true);
  const archivo = getOrCreateSheet_(ss, SHEET_ARCHIVO, true);
  const seen    = getOrCreateSheet_(ss, SHEET_SEEN, false);

  if (seen.getLastRow() === 0) seen.appendRow(["guid", "firstSeenAt", "link"]);
  try { seen.hideSheet(); } catch (e) {}

  [inbox, casos, archivo].forEach(sh => {
    boldHeaders_(sh);
    sh.setFrozenRows(1);
  });

  const ruleValidado = SpreadsheetApp.newDataValidation()
    .requireValueInList(LISTA_VALIDADO, true)
    .setAllowInvalid(false)
    .build();

  inbox.getRange(2, COL_VALIDADO, inbox.getMaxRows()-1, 1).setDataValidation(ruleValidado);
  casos.getRange(2, COL_VALIDADO, casos.getMaxRows()-1, 1).setDataValidation(ruleValidado);

  inbox.getRange(2, COL_REVISADO, inbox.getMaxRows()-1, 1).insertCheckboxes();
  casos.getRange(2, COL_REVISADO, casos.getMaxRows()-1, 1).insertCheckboxes();

  setConditionalFormattingValidado_(inbox);
  setConditionalFormattingValidado_(casos);

  if (DEBUG) Logger.log("setupSistema(): OK");
}

/***********************
 * EJECUCIÓN PRINCIPAL
 ***********************/
function monitorearNoticias() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inbox = ss.getSheetByName(SHEET_INBOX);
  const seen  = ss.getSheetByName(SHEET_SEEN);
  const casos = ss.getSheetByName(SHEET_CASOS);

  if (!inbox || !seen) throw new Error("Falta correr setupSistema() primero.");

  const seenGuids = loadSeenGuids_(seen);

  const existingLinks = new Set();
  loadExistingLinks_(inbox, existingLinks);
  if (casos) loadExistingLinks_(casos, existingLinks);

  const rowsToInsert = [];
  const seenToAppend = [];

  let totalItems = 0, inserted = 0, skippedSeenGuid = 0, skippedSeenLink = 0, skippedNoKeyword = 0;

  const feedUrls = SEARCH_QUERIES.map(buildNewsRssUrl_);

  feedUrls.forEach(feedUrl => {
    const items = fetchRssItemsWithGuid_(feedUrl);
    if (DEBUG) Logger.log(`Feed: ${feedUrl} -> items: ${items.length}`);

    items.forEach(it => {
      totalItems++;

      const title = (it.title || "").trim();
      const link  = normalizeLink_(it.link || "");
      const guid  = (it.guid || "").trim() || `LINK:${link}`;

      if (!title || !link) return;

      if (seenGuids.has(guid)) { skippedSeenGuid++; return; }

      if (existingLinks.has(link)) {
        skippedSeenLink++;
        seenGuids.add(guid);
        seenToAppend.push([guid, new Date(), link]);
        return;
      }

      const detected = detectKeyword_(normalizeText(title));
      if (!detected) { skippedNoKeyword++; return; }

      rowsToInsert.push([ new Date(), "Google News", title, link, detected, feedUrl, false, EST_PENDIENTE, "" ]);

      seenGuids.add(guid);
      existingLinks.add(link);
      seenToAppend.push([guid, new Date(), link]);
      inserted++;
    });
  });

  if (rowsToInsert.length > 0) {
    const startRow = getLastDataRow_(inbox, COL_FECHA) + 1;
    inbox.getRange(startRow, 1, rowsToInsert.length, COL_OBS).setValues(rowsToInsert);

    inbox.getRange(startRow, COL_REVISADO, rowsToInsert.length, 1).insertCheckboxes();

    const ruleValidado = SpreadsheetApp.newDataValidation()
      .requireValueInList(LISTA_VALIDADO, true)
      .setAllowInvalid(false)
      .build();
    inbox.getRange(startRow, COL_VALIDADO, rowsToInsert.length, 1).setDataValidation(ruleValidado);

    setConditionalFormattingValidado_(inbox);
  }

  if (seenToAppend.length > 0) {
    const seenStart = getLastDataRow_(seen, 1) + 1;
    seen.getRange(seenStart, 1, seenToAppend.length, 3).setValues(seenToAppend);
  }

  if (DEBUG) Logger.log(`RESULTADO: totalItems=${totalItems}, inserted=${inserted}, skippedSeenGuid=${skippedSeenGuid}, skippedSeenLink=${skippedSeenLink}, skippedNoKeyword=${skippedNoKeyword}`);
}

/***********************
 * onEdit wrapper + handler (usar trigger instalable apuntando a handleEdit)
 ***********************/
function onEdit(e) { handleEdit_(e); }
function handleEdit(e) { handleEdit_(e); }

function handleEdit_(e) {
  try {
    if (!e || !e.range) return;

    const range = e.range;
    const sheet = range.getSheet();
    if (sheet.getName() !== SHEET_INBOX) return;

    const row = range.getRow();
    const col = range.getColumn();
    if (row === 1) return;
    if (col !== COL_VALIDADO) return;

    const estado = String(range.getValue() || "").trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inbox = ss.getSheetByName(SHEET_INBOX);
    const casos = ss.getSheetByName(SHEET_CASOS) || getOrCreateSheet_(ss, SHEET_CASOS, true);

    const link = normalizeLink_(String(inbox.getRange(row, COL_LINK).getValue() || ""));
    if (!link) return;

    const casosRow = findRowByLink_(casos, link);

    if (estado === EST_VALIDO) {
      if (casosRow === 0) {
        const rowValues = inbox.getRange(row, 1, 1, COL_OBS).getValues()[0];

        // Insertar arriba (fila 2)
        casos.insertRowBefore(2);
        casos.getRange(2, 1, 1, COL_OBS).setValues([rowValues]);

        // Checkbox + validación en la nueva fila 2
        casos.getRange(2, COL_REVISADO, 1, 1).insertCheckboxes();

        const ruleValidado = SpreadsheetApp.newDataValidation()
          .requireValueInList(LISTA_VALIDADO, true)
          .setAllowInvalid(false)
          .build();
        casos.getRange(2, COL_VALIDADO, 1, 1).setDataValidation(ruleValidado);

        setConditionalFormattingValidado_(casos);
        casos.setFrozenRows(1);
        boldHeaders_(casos);
      } else {
        // Ya existe en CASOS: asegurar estado
        casos.getRange(casosRow, COL_VALIDADO).setValue(EST_VALIDO);
      }
    } else {
      // ✅ CAMBIO: si ya no es VALIDO, eliminar de CASOS
      if (casosRow !== 0) {
        casos.deleteRow(casosRow);
      }
    }
  } catch (err) {
    console.error("handleEdit error:", err);
    if (DEBUG) Logger.log("handleEdit error: " + err);
  }
}

/***********************
 * ARCHIVADO
 ***********************/
function archivarAntiguos() { archivarConRetencion_(RETENCION_DIAS); }
function archivarTest(dias) { archivarConRetencion_(dias); }

function archivarConRetencion_(diasRetencion) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inbox   = ss.getSheetByName(SHEET_INBOX);
  const archivo = ss.getSheetByName(SHEET_ARCHIVO) || getOrCreateSheet_(ss, SHEET_ARCHIVO, true);
  if (!inbox) return;

  const dataLast = getLastDataRow_(inbox, COL_FECHA);
  if (dataLast < 2) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - diasRetencion);

  const dates = inbox.getRange(2, COL_FECHA, dataLast - 1, 1).getValues();

  const rowsToArchive = [];
  const rowIndexes = [];

  dates.forEach((d, idx) => {
    const val = d[0];
    if (val instanceof Date && val < cutoff) {
      const rowNumber = idx + 2;
      rowsToArchive.push(inbox.getRange(rowNumber, 1, 1, COL_OBS).getValues()[0]);
      rowIndexes.push(rowNumber);
    }
  });

  if (rowsToArchive.length === 0) return;

  const archStart = getLastDataRow_(archivo, COL_FECHA) + 1;
  archivo.getRange(archStart, 1, rowsToArchive.length, COL_OBS).setValues(rowsToArchive);
  boldHeaders_(archivo);
  archivo.setFrozenRows(1);

  rowIndexes.sort((a,b)=>b-a).forEach(r => inbox.deleteRow(r));
}

/***********************
 * RSS
 ***********************/
function fetchRssItemsWithGuid_(url) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() >= 400) return [];

  const doc = XmlService.parse(res.getContentText());
  const channel = doc.getRootElement().getChild("channel");
  if (!channel) return [];

  return channel.getChildren("item").map(item => ({
    title: item.getChildText("title"),
    link: item.getChildText("link"),
    guid: item.getChildText("guid")
  }));
}
function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function containsAny(text, words) {
  return words.some(word => text.includes(normalizeText(word)));
}
function detectKeyword_(lowerTitle) {

  for (const rule of RULES) {

    let ok = true;

    for (const category of rule.groups) {
      if (!containsAny(lowerTitle, category)) {
        ok = false;
        break;
      }
    }

    if (ok) {
      return rule.name;
    }
  }

  return "";
}
/***********************
 * Helpers
 ***********************/
function loadSeenGuids_(seenSheet) {
  const set = new Set();
  const lastRow = getLastDataRow_(seenSheet, 1);
  if (lastRow < 2) return set;

  seenSheet.getRange(2, 1, lastRow - 1, 1).getValues()
    .forEach(r => { const v = String(r[0]||"").trim(); if (v) set.add(v); });

  return set;
}

function loadExistingLinks_(sheet, set) {
  const lastRow = getLastDataRow_(sheet, COL_LINK);
  if (lastRow < 2) return;

  sheet.getRange(2, COL_LINK, lastRow - 1, 1).getValues()
    .forEach(r => { const v = normalizeLink_(String(r[0]||"")); if (v) set.add(v); });
}

function findRowByLink_(sheet, link) {
  const lastRow = getLastDataRow_(sheet, COL_LINK);
  if (lastRow < 2) return 0;

  const links = sheet.getRange(2, COL_LINK, lastRow - 1, 1).getValues();
  for (let i=0;i<links.length;i++) if (normalizeLink_(String(links[i][0]||"")) === link) return i+2;
  return 0;
}

function normalizeLink_(link) {
  return String(link || "").trim();
}

function getLastDataRow_(sheet, col) {
  const last = sheet.getLastRow();
  if (last < 1) return 0;
  const values = sheet.getRange(1, col, last, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "" && values[i][0] !== null) return i + 1;
  }
  return 0;
}

function getOrCreateSheet_(ss, name, withHeaders) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  if (withHeaders && sh.getLastRow() === 0) {
    sh.appendRow(["Fecha detección","Medio","Título","Link","Keyword detectada","Fuente","Revisado","Validado","Observaciones"]);
    boldHeaders_(sh);
    sh.setFrozenRows(1);
  }
  return sh;
}

function boldHeaders_(sheet) {
  sheet.getRange(1, 1, 1, COL_OBS).setFontWeight("bold");
}

function setConditionalFormattingValidado_(sheet) {
  const range = sheet.getRange(2, COL_VALIDADO, sheet.getMaxRows()-1, 1);
  const existing = sheet.getConditionalFormatRules() || [];
  const kept = existing.filter(r => !r.getRanges().some(rr => rr.getColumn() === COL_VALIDADO));

  const r1 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_PENDIENTE).setBackground(COLOR_PENDIENTE).setRanges([range]).build();
  const r2 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_VALIDO).setBackground(COLOR_VALIDO).setRanges([range]).build();
  const r3 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_NO_RELEVANTE).setBackground(COLOR_NO_RELEVANTE).setRanges([range]).build();

  sheet.setConditionalFormatRules([...kept, r1, r2, r3]);
}

// IA 

/***********************
 * CONFIGURACIÓN DEL AGENTE IA
 ***********************/
const SHEET_IA = "IA";
// Diffbot token and Gemini API removed.

const COL_ESTADO_IA = 10; // Columna J en INBOX
const COL_ID_INBOX = 11;  // Columna K en INBOX (Nueva: guardará el ID)

/***********************
 * INICIALIZAR LA HOJA IA
 ***********************/
function setupIA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hojaIA = ss.getSheetByName(SHEET_IA);
  
  if (!hojaIA) {
    hojaIA = ss.insertSheet(SHEET_IA);
    const encabezados = [
      "id_art", "Fecha detección", "Medio", "Título", "link_real", "Link", 
      "Keyword detectada", "Fuente", "Revisado", "Validado", "Observaciones", 
      "Ubicación", "¿Es CABA?", "Fecha del artículo", "Fecha del hecho", 
      "Fuerzas de seguridad", "Nombres de personas", "Autor", "Texto artículo", "Link Drive"
    ];
    hojaIA.appendRow(encabezados);
    hojaIA.getRange(1, 1, 1, encabezados.length).setFontWeight("bold");
    hojaIA.setFrozenRows(1);
    
    // Eliminamos las 1000 filas vacías sobrantes para mantener la hoja limpia
    if (hojaIA.getMaxRows() > 2) {
      hojaIA.deleteRows(3, hojaIA.getMaxRows() - 2);
    }
  }
}

/***********************
 * PROCESADOR PRINCIPAL (El Agente)
 ***********************/
function procesarNoticiasPendientes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inbox = ss.getSheetByName(SHEET_INBOX);
  const hojaIA = ss.getSheetByName(SHEET_IA) || setupIA();
  
  const lastRow = inbox.getLastRow();
  if (lastRow < 2) return;

  for (let i = 2; i <= lastRow; i++) {
    const estadoIA = inbox.getRange(i, COL_ESTADO_IA).getValue();
    const linkGoogle = inbox.getRange(i, COL_LINK).getValue();
    let idInbox = inbox.getRange(i, COL_ID_INBOX).getValue();
    
    if (linkGoogle && estadoIA !== "PROCESADO") {
      
      // 1. Generar ID combinando Fecha y Número de Fila (Ej: ID-260806-F5)
      if (!idInbox) {
        const d = new Date();
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        
        // 'i' representa el número de fila exacto que se está procesando
        idInbox = `ID-${yy}${mm}${dd}-F${i}`;
        
        inbox.getRange(i, COL_ID_INBOX).setValue(idInbox);
      }
      
      const filaInbox = inbox.getRange(i, 1, 1, 9).getValues()[0];
      const [fechaDet, medioIn, tituloIn, linkIn, keywordIn, fuenteIn, revIn, valIn, obsIn] = filaInbox;
      
      // 2. Extraer con Diffbot
      const diffbotData = extraerConDiffbot_(linkIn);
      
      let nuevaFila = [];
      
      // Chequeamos la nueva propiedad "exito" que creamos
      if (diffbotData && diffbotData.exito && diffbotData.texto) {
        
        // 3. Analizar con Gemini (versión 3.1-flash-lite)
        const iaData = analizarConGemini_(diffbotData.texto);

        // --- NUEVO: Guardar en Drive ---
        const linkDrive = guardarRespaldoEnDrive_(
          idInbox, 
          tituloIn, 
          diffbotData.link_real, 
          diffbotData.html_limpio, 
          diffbotData.json_crudo
        );
        
        nuevaFila = [
          idInbox, 
          fechaDet,
          diffbotData.sitio || medioIn, 
          tituloIn,
          diffbotData.link_real, 
          linkIn, 
          keywordIn,
          fuenteIn,
          false, 
          "PENDIENTE", 
          obsIn,
          iaData ? iaData.ubicacion : "Error IA",
          iaData ? iaData.es_caba : "Error IA",
          diffbotData.fecha_articulo || "No detectada",
          iaData ? iaData.fecha_hecho : "Error IA",
          iaData ? iaData.fuerzas_seguridad : "Error IA",
          iaData ? iaData.nombres_personas : "Error IA",
          diffbotData.autor,
          diffbotData.texto,
          linkDrive // <--- NUEVA COLUMNA CON EL LINK AL DOCUMENTO
        ];
      } else {
        // 4. Si Diffbot falla, AHORA SABEMOS POR QUÉ gracias al EDA.
        // Lo anotamos en la columna Observaciones (ej: "Fallo extracción: Bloqueo por Anti-Bot")
        const motivoError = diffbotData ? diffbotData.motivo : "Error desconocido";
        const linkRecuperado = (diffbotData && diffbotData.link_real) ? diffbotData.link_real : linkIn;

        nuevaFila = [
          idInbox, fechaDet, medioIn, tituloIn, linkRecuperado, linkIn, keywordIn, fuenteIn, 
          false, "PENDIENTE", "Fallo extracción: " + motivoError, 
          "", "", "", "", "", "", "", "",""
        ];
      }
      
      // 5. Insertar buscando el final REAL de la hoja (evita el bug de la fila 1000)
      const iaLastRow = getLastDataRow_(hojaIA, 1) + 1;
      hojaIA.getRange(iaLastRow, 1, 1, nuevaFila.length).setValues([nuevaFila]);
      
      // 6. Aplicar formato (Checkbox y Lista Desplegable) SOLO a la fila nueva
      hojaIA.getRange(iaLastRow, 9).insertCheckboxes(); // Columna I: Revisado
      const ruleValidado = SpreadsheetApp.newDataValidation()
        .requireValueInList(["PENDIENTE", "VALIDO", "NO RELEVANTE"], true)
        .setAllowInvalid(false).build();
      hojaIA.getRange(iaLastRow, 10).setDataValidation(ruleValidado); // Columna J: Validado
      
      // 7. Marcar en INBOX como procesado
      inbox.getRange(i, COL_ESTADO_IA).setValue("PROCESADO");
      
      Utilities.sleep(2500); // Pausa API
    }
  }
}

/***********************
 * CONEXIÓN API DIFFBOT (Mejorada según EDA)
 ***********************/
function extraerConDiffbot_(url) {
  try {
    // 1. AÑADIDO: Parámetro &timeout=45000 (45 segundos) para evitar errores 500 por lentitud del diario
    const endpoint = `https://api.diffbot.com/v3/article?token=${DIFFBOT_TOKEN}&url=${encodeURIComponent(url)}&timeout=45000`;
    const response = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    const json = JSON.parse(response.getContentText());
    
    // 2. AÑADIDO: Manejo del errorCode 500 (Timeouts o Contenido Vacío)
    if (json.errorCode) {
      return { 
        exito: false, 
        motivo: json.error || `Error ${json.errorCode} de Diffbot`
      };
    }
    
    if (json.objects && json.objects.length > 0) {
      const obj = json.objects[0];
      
      // 3. AÑADIDO: Detección de muros Anti-Bot (Cloudflare) analizando el HTML crudo
      const htmlCrudo = obj.html || "";
      if (htmlCrudo.includes("Performing security verification") || htmlCrudo.includes("This website uses a security service")) {
        return { 
          exito: false, 
          motivo: "Bloqueo por Anti-Bot/Cloudflare", 
          link_real: obj.pageUrl || url 
        };
      }
      
      // (Dentro de extraerConDiffbot_, en el bloque de éxito)
      return {
        exito: true,
        texto: obj.text || "",
        autor: obj.author || "Sin firma",
        sitio: obj.siteName || "",
        link_real: obj.pageUrl || obj.resolvedPageUrl || url, //link_real:  obj.resolvedPageUrl || url || obj.pageUrl , intento nuscar el link real 
        fecha_articulo: obj.date || obj.estimatedDate || "",
        html_limpio: obj.html || "<p>No se pudo extraer el HTML visual.</p>", // <--- NUEVO
        json_crudo: json // <--- NUEVO: Pasamos el paquete completo
      };
    }
    
    return { exito: false, motivo: "No se encontraron objetos en la página" };
  } catch (e) {
    return { exito: false, motivo: "Fallo de conexión: " + e.toString() };
  }
}

function analizarConGemini_(texto) {
  try {
    // ACTUALIZADO A GEMINI 3.1 FLASH LITE
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
      Eres un analista de datos especializado en monitoreo de medios. Lee la siguiente noticia y extrae la información requerida.
      Devuelve ÚNICAMENTE un objeto JSON válido con las siguientes claves:
      {
        "ubicacion": "Barrio, calle, localidad o cruce de calles exacto. Si no especifica, pon 'No especifica'",
        "es_caba": "Responde 'Sí' o 'No' dependiendo de si el evento ocurrió en la Ciudad Autónoma de Buenos Aires.",
        "fecha_hecho": "La fecha o momento en que ocurrió el hecho policial (ej: 'Ayer por la noche', 'Viernes 14'). Si no dice, pon 'No especifica'",
        "fuerzas_seguridad": "Policía de la Ciudad, Federal, Gendarmería, etc. Si no dice, pon 'No especifica'",
        "nombres_personas": "Nombres de víctimas, detenidos o autoridades mencionadas. Si no hay, pon 'Ninguno'"
      }
      
      Texto de la noticia:
      ${texto}
    `;

    const payload = {
      "contents": [{"parts": [{"text": prompt}]}],
      "generationConfig": { "responseMimeType": "application/json" }
    };

    const response = UrlFetchApp.fetch(endpoint, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    });
    
    const jsonResult = JSON.parse(response.getContentText());
    const textoRespuesta = jsonResult.candidates[0].content.parts[0].text;
    return JSON.parse(textoRespuesta);
    
  } catch (e) {
    return null;
  }
}

/***********************
 * HELPER: ENCONTRAR ÚLTIMA FILA REAL
 ***********************/
function getLastDataRow_(sheet, col) {
  const last = sheet.getLastRow();
  if (last < 1) return 0;
  const values = sheet.getRange(1, col, last, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "" && values[i][0] !== null) return i + 1;
  }
  return 0;
}


/***********************
 * GUARDAR RESPALDO EN DRIVE
 ***********************/
function guardarRespaldoEnDrive_(idNoticia, titulo, linkOriginal, htmlLimpio, jsonCrudo) {
  const NOMBRE_CARPETA = "Respaldo_Noticias_IA";
  
  // 1. Buscar o crear la carpeta principal
  let carpetas = DriveApp.getFoldersByName(NOMBRE_CARPETA);
  let carpetaDestino = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(NOMBRE_CARPETA);
  
  // Limpiamos el título para que sea un nombre de archivo válido (sin símbolos raros)
  const tituloSeguro = titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, "").substring(0, 50).trim();
  const nombreBase = `${idNoticia} - ${tituloSeguro}`;
  
  // 2. Guardar el archivo JSON (Para las máquinas/EDA)
  const jsonBlob = Utilities.newBlob(JSON.stringify(jsonCrudo, null, 2), "application/json", `${nombreBase}.json`);
  carpetaDestino.createFile(jsonBlob);
  
  // 3. Guardar el archivo HTML (Para lectura humana)
  // Le agregamos un poco de diseño CSS (estilos) para que parezca un diario elegante
  const plantillaHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; background-color: #f9f9f9; }
        .contenedor { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #1a1a1a; margin-bottom: 10px; }
        .metadata { background: #eef2f5; padding: 15px; border-radius: 5px; margin-bottom: 30px; font-size: 0.9em; border-left: 4px solid #2c7fb8; }
        .metadata a { color: #2c7fb8; text-decoration: none; }
        img { max-width: 100%; height: auto; border-radius: 5px; margin: 15px 0; }
        figure { margin: 0; text-align: center; font-style: italic; color: #666; font-size: 0.85em; }
        p { margin-bottom: 15px; font-size: 1.05em; }
      </style>
    </head>
    <body>
      <div class="contenedor">
        <h1>${titulo}</h1>
        <div class="metadata">
          <strong>ID Sistema:</strong> ${idNoticia} <br>
          <strong>Enlace Original:</strong> <a href="${linkOriginal}" target="_blank">${linkOriginal}</a>
        </div>
        <div class="contenido-noticia">
          ${htmlLimpio}
        </div>
      </div>
    </body>
    </html>
  `;
  
  const htmlBlob = Utilities.newBlob(plantillaHtml, "text/html", `${nombreBase}.html`);
  const archivoHtml = carpetaDestino.createFile(htmlBlob);
  
  // Devolvemos el link del archivo HTML para pegarlo en la planilla
  return archivoHtml.getUrl(); 
}
