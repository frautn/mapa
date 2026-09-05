/***********************
 * CONFIG
 ***********************/
const SHEET_INBOX   = "INBOX";
const SHEET_CASOS   = "CASOS";
const SHEET_ARCHIVO = "ARCHIVO";
const SHEET_SEEN    = "_SEEN";

// Lista ordenada global de la estructura base de encabezados para INBOX, CASOS y ARCHIVO
const HEADERS_BASE = [
  "Fecha detección",  // 1 (A)
  "Medio",            // 2 (B)
  "Título",           // 3 (C)
  "Link",             // 4 (D)
  "Keyword detectada",// 5 (E)
  "Fuente",           // 6 (F)
  "Revisado",         // 7 (G)
  "Validado",         // 8 (H)
  "Observaciones",    // 9 (I)
  "Estado IA",        // 10 (J)
  "Palabras detectadas",// 11 (K)
  "Puntaje"           // 12 (L)
];

/**
 * Obtiene un objeto con los índices (1-based) de las columnas según sus encabezados.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 
 * @returns {Object<string, number>} Ej: { "Fecha detección": 1, "Link": 4, ... }
 */
function getColumnIndexes_(sheet) {
  if (!sheet || sheet.getLastColumn() === 0) return {};
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const indexes = {};
  headers.forEach((header, i) => {
    if (header) {
      indexes[String(header).trim()] = i + 1; // Ajuste a base 1 para las APIs de Range
    }
  });
  return indexes;
}

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

// Categorías y Reglas
const POLICIA = ["prefecto", "bastones largos", "policia", "efectivo", "uniformado", "comisaria", "comisario", "policial", "GNA", "gendarmeria", "SPF", "penitenciario", "DIR", "direccion de despliegue de intervenciones rapidas", "SPB", "seguridad privada", "fuerzas de seguridad", "fuerzas federales"];
const VIOLENCIA_POLICIAL = ["megaoperativo", "desalojo", "gas", "gases", "lacrimogeno", "gatillo facil", "uso desmedido de la fuerza", "ejecucion reglamentaria", "tiro a matar", "fusilamiento", "violencia institucional", "violencia estatal", "reprimio", "represion", "reprimieron", "redujo", "redujeron", "fusilo", "fusilamiento", "aprehendio", "aprehendieron", "arresto", "gatillo", "bastones largos", "operativo", "antipiquete"];
const CABA = ["caba", "ciudad de buenos aires", "capital federal", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Monserrat", "Montevideo", "Nuñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", "Vélez Sarsfield", "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza", "plaza de mayo", "congreso", "casa rosada", "legislatura porteña", "jefatura de gobierno porteño", "gobierno de la ciudad", "gobierno porteño", "ministerio de trabajo", "obelisco", "hospital argerich", "hospital fernández", "hospital pirovano", "hospital durand", "hospital ramos mejía", "hospital bonaparte", "hospital italiano", "microcentro", "centro porteño", "once", "tribunales", "retiro", "puerto madero", "costanera", "costanera sur", "costanera norte", "parque centenario", "parque lezama", "parque 3 de febrero", "bosques de palermo", "villa 31", "villa 21-24", "villa 1-11-14", "villa 15", "ciudad oculta", "barrio 31", "barrios populares", "barrio popular", "villa porteña", "villas porteñas"];
const VIOLENCIA_GENERAL = ["incidente", "disturbio", "golpe", "golpeo", "golpiza", "remato", "asesino", "abandono", "caceria", "violento", "abuso", "agredio", "baleo", "refriega", "bala", "molotov", "violencia", "quemarropa", "disparo", "disparado", "ejecuto", "mato"];
const POSIBLE_VICTIMA = ["docente", "universitario", "cientifico", "cientifica", "jubilado", "jubiladas", "protesta", "movilizacion", "gremial", "gremio", "militante", "grupo violento", "rostros ocultos", "anarquista", "trosko", "troskista", "rostros ocultos", "rostro oculto", "sindicalista", "piquetero", "mantero", "manifestante", "vendedor", "ambulante", "terrorista"];
const VICTIMA = ["arrestado", "arrestada", "demorado", "demorada", "detenido", "detenida", "desarmado", "desarmada", "aprehendido", "aprehendida", "golpeado", "golpeada", "victima", "situacion de calle", "resistencia a la autoridad", "indigente", "indigencia"];

const RULES = [
  { name: "POLICIA + VICTIMA + VIOLENCIA POLICIAL + CABA", groups: [POLICIA, VICTIMA, VIOLENCIA_POLICIAL, CABA] },
  { name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA POLICIAL + CABA", groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_POLICIAL, CABA] },
  { name: "POLICIA + VICTIMA + VIOLENCIA GENERAL + CABA", groups: [POLICIA, VICTIMA, VIOLENCIA_GENERAL, CABA] },
  { name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA GENERAL + CABA", groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_GENERAL, CABA] },
  { name: "POLICIA + VICTIMA + CABA", groups: [POLICIA, VICTIMA, CABA] },
  { name: "POLICIA + POSIBLE VICTIMA + CABA", groups: [POLICIA, POSIBLE_VICTIMA, CABA] },
  { name: "POLICIA + VIOLENCIA POLICIAL + CABA", groups: [POLICIA, VIOLENCIA_POLICIAL, CABA] },
  { name: "POLICIA + VIOLENCIA GENERAL + CABA", groups: [POLICIA, VIOLENCIA_GENERAL, CABA] },
  { name: "POLICIA + VICTIMA + VIOLENCIA POLICIAL", groups: [POLICIA, VICTIMA, VIOLENCIA_POLICIAL] },
  { name: "POLICIA + VICTIMA + VIOLENCIA GENERAL", groups: [POLICIA, VICTIMA, VIOLENCIA_GENERAL] },
  { name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA POLICIAL", groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_POLICIAL] },
  { name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA GENERAL", groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_GENERAL] },
  { name: "POLICIA + VICTIMA", groups: [POLICIA, VICTIMA] },
  { name: "POLICIA + POSIBLE VICTIMA", groups: [POLICIA, POSIBLE_VICTIMA] },
  { name: "POLICIA + VIOLENCIA POLICIAL", groups: [POLICIA, VIOLENCIA_POLICIAL] },
  { name: "POLICIA + VIOLENCIA GENERAL", groups: [POLICIA, VIOLENCIA_GENERAL] }
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

    const cols = getColumnIndexes_(sh);
    if (cols["Validado"]) {
      const ruleValidado = SpreadsheetApp.newDataValidation()
        .requireValueInList(LISTA_VALIDADO, true)
        .setAllowInvalid(false)
        .build();
      sh.getRange(2, cols["Validado"], sh.getMaxRows() - 1, 1).setDataValidation(ruleValidado);
    }

    if (cols["Revisado"]) {
      sh.getRange(2, cols["Revisado"], sh.getMaxRows() - 1, 1).insertCheckboxes();
    }

    setConditionalFormattingValidado_(sh);
  });

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

  const colsInbox = getColumnIndexes_(inbox);
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

      const titleNorm = normalizeText(title);
      const detectedData = detectKeyword_(titleNorm);
      const palabrasDetectadas = detectarTodasLasPalabras_(titleNorm);
      
      if (!detectedData) {
        skippedNoKeyword++;
        return;
      }

      // Se construye el array asignando cada valor dinámicamente según la columna correspondiente
      const row = new Array(HEADERS_BASE.length).fill("");
      if (colsInbox["Fecha detección"]) row[colsInbox["Fecha detección"] - 1] = new Date();
      if (colsInbox["Medio"])           row[colsInbox["Medio"] - 1]           = "Google News";
      if (colsInbox["Título"])          row[colsInbox["Título"] - 1]          = title;
      if (colsInbox["Link"])            row[colsInbox["Link"] - 1]            = link;
      if (colsInbox["Keyword detectada"]) row[colsInbox["Keyword detectada"] - 1] = detectedData.regla;
      if (colsInbox["Fuente"])          row[colsInbox["Fuente"] - 1]         = feedUrl;
      if (colsInbox["Revisado"])        row[colsInbox["Revisado"] - 1]       = false;
      if (colsInbox["Validado"])        row[colsInbox["Validado"] - 1]       = EST_PENDIENTE;
      if (colsInbox["Palabras detectadas"]) row[colsInbox["Palabras detectadas"] - 1] = palabrasDetectadas;

      rowsToInsert.push(row);
      seenGuids.add(guid);
      existingLinks.add(link);
      seenToAppend.push([guid, new Date(), link]);
      inserted++;
    });
  });

  if (rowsToInsert.length > 0) {
    const colFechaIndex = colsInbox["Fecha detección"] || 1;
    const startRow = getLastDataRow_(inbox, colFechaIndex) + 1;
    
    inbox.getRange(startRow, 1, rowsToInsert.length, HEADERS_BASE.length).setValues(rowsToInsert);

    if (colsInbox["Revisado"]) {
      inbox.getRange(startRow, colsInbox["Revisado"], rowsToInsert.length, 1).insertCheckboxes();
    }

    if (colsInbox["Validado"]) {
      const ruleValidado = SpreadsheetApp.newDataValidation()
        .requireValueInList(LISTA_VALIDADO, true)
        .setAllowInvalid(false)
        .build();
      inbox.getRange(startRow, colsInbox["Validado"], rowsToInsert.length, 1).setDataValidation(ruleValidado);
    }

    setConditionalFormattingValidado_(inbox);
  }

  if (seenToAppend.length > 0) {
    const seenStart = getLastDataRow_(seen, 1) + 1;
    seen.getRange(seenStart, 1, seenToAppend.length, 3).setValues(seenToAppend);
  }

  if (DEBUG) Logger.log(`RESULTADO: totalItems=${totalItems}, inserted=${inserted}, skippedSeenGuid=${skippedSeenGuid}, skippedSeenLink=${skippedSeenLink}, skippedNoKeyword=${skippedNoKeyword}`);
}

/***********************
 * HANDLER DE EDICIÓN
 ***********************/
function onEdit(e) { handleEdit_(e); }
function handleEdit(e) { handleEdit_(e); }

function handleEdit_(e) {
  try {
    if (!e || !e.range) return;

    const range = e.range;
    const sheet = range.getSheet();
    if (sheet.getName() !== SHEET_INBOX) return;

    const colsInbox = getColumnIndexes_(sheet);
    if (!colsInbox["Validado"] || !colsInbox["Link"]) return;

    const row = range.getRow();
    const col = range.getColumn();
    if (row === 1) return;
    if (col !== colsInbox["Validado"]) return;

    const estado = String(range.getValue() || "").trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inbox = ss.getSheetByName(SHEET_INBOX);
    const casos = ss.getSheetByName(SHEET_CASOS) || getOrCreateSheet_(ss, SHEET_CASOS, true);
    const colsCasos = getColumnIndexes_(casos);

    const link = normalizeLink_(String(inbox.getRange(row, colsInbox["Link"]).getValue() || ""));
    if (!link) return;

    const casosRow = findRowByLink_(casos, link);

    if (estado === EST_VALIDO) {
      if (casosRow === 0) {
        // Lee la fila hasta la última columna dinámica
        const lastCol = inbox.getLastColumn();
        const rowValues = inbox.getRange(row, 1, 1, lastCol).getValues()[0];

        casos.insertRowBefore(2);
        casos.getRange(2, 1, 1, lastCol).setValues([rowValues]);

        if (colsCasos["Revisado"]) {
          casos.getRange(2, colsCasos["Revisado"], 1, 1).insertCheckboxes();
        }

        if (colsCasos["Validado"]) {
          const ruleValidado = SpreadsheetApp.newDataValidation()
            .requireValueInList(LISTA_VALIDADO, true)
            .setAllowInvalid(false)
            .build();
          casos.getRange(2, colsCasos["Validado"], 1, 1).setDataValidation(ruleValidado);
        }

        setConditionalFormattingValidado_(casos);
        casos.setFrozenRows(1);
        boldHeaders_(casos);
      } else {
        if (colsCasos["Validado"]) {
          casos.getRange(casosRow, colsCasos["Validado"]).setValue(EST_VALIDO);
        }
      }
    } else {
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

  const colsInbox = getColumnIndexes_(inbox);
  const colFechaIndex = colsInbox["Fecha detección"] || 1;

  const dataLast = getLastDataRow_(inbox, colFechaIndex);
  if (dataLast < 2) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - diasRetencion);

  const dates = inbox.getRange(2, colFechaIndex, dataLast - 1, 1).getValues();

  const rowsToArchive = [];
  const rowIndexes = [];
  const lastCol = inbox.getLastColumn();

  dates.forEach((d, idx) => {
    const val = d[0];
    if (val instanceof Date && val < cutoff) {
      const rowNumber = idx + 2;
      rowsToArchive.push(inbox.getRange(rowNumber, 1, 1, lastCol).getValues()[0]);
      rowIndexes.push(rowNumber);
    }
  });

  if (rowsToArchive.length === 0) return;

  const colsArchivo = getColumnIndexes_(archivo);
  const colFechaArchIndex = colsArchivo["Fecha detección"] || 1;

  const archStart = getLastDataRow_(archivo, colFechaArchIndex) + 1;
  archivo.getRange(archStart, 1, rowsToArchive.length, lastCol).setValues(rowsToArchive);
  boldHeaders_(archivo);
  archivo.setFrozenRows(1);

  rowIndexes.sort((a,b) => b - a).forEach(r => inbox.deleteRow(r));
}

/***********************
 * RSS Y PROCESAMIENTO TEXTO
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
    const palabrasDetectadas = [];

    for (const category of rule.groups) {
      const encontradas = category.filter(word =>
        lowerTitle.includes(normalizeText(word))
      );

      if (encontradas.length === 0) {
        ok = false;
        break;
      }

      palabrasDetectadas.push(
        encontradas.map(w => normalizeText(w)).join(", ")
      );
    }

    if (ok) {
      return {
        regla: rule.name,
        palabras: palabrasDetectadas.join(" | ")
      };
    }
  }

  return null;
}

function detectarTodasLasPalabras_(texto) {
  const grupos = [
    { nombre: "POLICIA", palabras: POLICIA },
    { nombre: "VICTIMA", palabras: VICTIMA },
    { nombre: "POSIBLE_VICTIMA", palabras: POSIBLE_VICTIMA },
    { nombre: "VIOLENCIA_POLICIAL", palabras: VIOLENCIA_POLICIAL },
    { nombre: "VIOLENCIA_GENERAL", palabras: VIOLENCIA_GENERAL },
    { nombre: "CABA", palabras: CABA }
  ];

  const resultado = [];

  for (const grupo of grupos) {
    const encontradas = grupo.palabras.filter(palabra =>
      texto.includes(normalizeText(palabra))
    );

    if (encontradas.length > 0) {
      resultado.push(`${grupo.nombre}: ${encontradas.join(", ")}`);
    }
  }

  return resultado.join(" | ");
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
  const cols = getColumnIndexes_(sheet);
  if (!cols["Link"]) return;

  const lastRow = getLastDataRow_(sheet, cols["Link"]);
  if (lastRow < 2) return;

  sheet.getRange(2, cols["Link"], lastRow - 1, 1).getValues()
    .forEach(r => { const v = normalizeLink_(String(r[0]||"")); if (v) set.add(v); });
}

function findRowByLink_(sheet, link) {
  const cols = getColumnIndexes_(sheet);
  if (!cols["Link"]) return 0;

  const lastRow = getLastDataRow_(sheet, cols["Link"]);
  if (lastRow < 2) return 0;

  const links = sheet.getRange(2, cols["Link"], lastRow - 1, 1).getValues();
  for (let i = 0; i < links.length; i++) {
    if (normalizeLink_(String(links[i][0] || "")) === link) return i + 2;
  }
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
    sh.appendRow(HEADERS_BASE);
    boldHeaders_(sh);
    sh.setFrozenRows(1);
  }
  return sh;
}

function boldHeaders_(sheet) {
  const lastCol = sheet.getLastColumn() || 1;
  sheet.getRange(1, 1, 1, lastCol).setFontWeight("bold");
}

function setConditionalFormattingValidado_(sheet) {
  const cols = getColumnIndexes_(sheet);
  if (!cols["Validado"]) return;

  const range = sheet.getRange(2, cols["Validado"], sheet.getMaxRows() - 1, 1);
  const existing = sheet.getConditionalFormatRules() || [];
  const kept = existing.filter(r => !r.getRanges().some(rr => rr.getColumn() === cols["Validado"]));

  const r1 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_PENDIENTE).setBackground(COLOR_PENDIENTE).setRanges([range]).build();
  const r2 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_VALIDO).setBackground(COLOR_VALIDO).setRanges([range]).build();
  const r3 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(EST_NO_RELEVANTE).setBackground(COLOR_NO_RELEVANTE).setRanges([range]).build();

  sheet.setConditionalFormatRules([...kept, r1, r2, r3]);
}

/***********************
 * CÁLCULO DE PUNTAJE
 ***********************/
function calcularPuntaje_(texto) {
  const textoNorm = normalizeText(texto);
  let puntaje = 0;

  if (containsAny(textoNorm, POLICIA)) puntaje += 3;
  if (containsAny(textoNorm, VIOLENCIA_POLICIAL)) puntaje += 3;
  if (containsAny(textoNorm, CABA)) puntaje += 4;
  if (containsAny(textoNorm, VICTIMA)) puntaje += 2;
  if (containsAny(textoNorm, POSIBLE_VICTIMA)) puntaje += 1;
  if (containsAny(textoNorm, VIOLENCIA_GENERAL)) puntaje += 1;


  return puntaje;
}

/***********************
 * CONFIGURACIÓN DEL AGENTE IA
 ***********************/
const SHEET_IA = "IA";
const DIFFBOT_TOKEN = 
const GEMINI_API_KEY = 

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
      "Keyword detectada", "Fuente", "Revisado", "Validado", "Observaciones", "Palabras detectadas", 
      "Ubicación", "¿Es CABA?", "Fecha del artículo", "Fecha del hecho", 
      "Fuerzas de seguridad", "Nombres de personas", "Autor", "Texto artículo"
    ];
    hojaIA.appendRow(encabezados);
    hojaIA.getRange(1, 1, 1, encabezados.length).setFontWeight("bold");
    hojaIA.setFrozenRows(1);
    
    const colsIA = getColumnIndexes_(hojaIA);
    if (colsIA["Revisado"]) {
      hojaIA.getRange(2, colsIA["Revisado"], hojaIA.getMaxRows() - 1, 1).insertCheckboxes();
    }
    if (colsIA["Validado"]) {
      const ruleValidado = SpreadsheetApp.newDataValidation()
        .requireValueInList(["PENDIENTE", "VALIDO", "NO RELEVANTE"], true)
        .setAllowInvalid(false).build();
      hojaIA.getRange(2, colsIA["Validado"], hojaIA.getMaxRows() - 1, 1).setDataValidation(ruleValidado);
    }
  }
  return hojaIA;
}

/***********************
 * PROCESADOR PRINCIPAL (El Agente)
 ***********************/
function procesarNoticiasPendientes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inbox = ss.getSheetByName(SHEET_INBOX);
  const hojaIA = ss.getSheetByName(SHEET_IA) || setupIA();
  
  if (!inbox)
  { Logger.log("Error: No se encontró la hoja INBOX");
    return;
  }
  const colsInbox = getColumnIndexes_(inbox);

  const colEstadoIA = colsInbox["Estado IA"];
  const colLink     = colsInbox["Link"];
  Logger.log("Columna Estado IA index: " + colEstadoIA);
  Logger.log("Columna Link index: " + colLink);

  const colPalabras = colsInbox["Palabras detectadas"];
  const colPuntaje  = colsInbox["Puntaje"];

  if (!colEstadoIA || !colLink) {
    Logger.log("ERROR: No se encontraron los encabezados 'Estado IA' o 'Link' en INBOX");
    return;
    }

  const lastRow = inbox.getLastRow();
  Logger.log("Última fila encontrada en INBOX: " + lastRow);
  if (lastRow < 2) return;

  for (let i = 2; i <= lastRow; i++) {
    const estadoIA = inbox.getRange(i, colEstadoIA).getValue();
    const linkGoogle = inbox.getRange(i, colLink).getValue();
    Logger.log(`Fila ${i}: Link='${linkGoogle}', EstadoIA='${estadoIA}'`);
    
    if (linkGoogle && estadoIA !== "PROCESADO") {
      Logger.log(`--> Procesando fila ${i}...`);
      
      const fechaDet  = colsInbox["Fecha detección"]  ? inbox.getRange(i, colsInbox["Fecha detección"]).getValue()  : "";
      const medioIn   = colsInbox["Medio"]            ? inbox.getRange(i, colsInbox["Medio"]).getValue()            : "";
      const tituloIn  = colsInbox["Título"]           ? inbox.getRange(i, colsInbox["Título"]).getValue()           : "";
      const linkIn    = colsInbox["Link"]             ? inbox.getRange(i, colsInbox["Link"]).getValue()             : "";
      const keywordIn = colsInbox["Keyword detectada"]? inbox.getRange(i, colsInbox["Keyword detectada"]).getValue(): "";
      const fuenteIn  = colsInbox["Fuente"]           ? inbox.getRange(i, colsInbox["Fuente"]).getValue()           : "";
      const obsIn     = colsInbox["Observaciones"]    ? inbox.getRange(i, colsInbox["Observaciones"]).getValue()    : "";

      const diffbotData = extraerConDiffbot_(linkGoogle);
      Logger.log("Diffbot data: " + JSON.stringify(diffbotData));
      
      let nuevaFila = [];
      const idArt = Utilities.getUuid();
      
      if (diffbotData && diffbotData.texto) {
        const textoCompletoNorm = normalizeText(diffbotData.texto);
        const puntajeTexto = calcularPuntaje_(textoCompletoNorm);
        const palabrasDetectadasTexto = detectarTodasLasPalabras_(textoCompletoNorm);

        if (colPalabras) inbox.getRange(i, colPalabras).setValue(palabrasDetectadasTexto);
        if (colPuntaje)  inbox.getRange(i, colPuntaje).setValue(puntajeTexto);
        
        const iaData = analizarConGemini_(diffbotData.texto);
        
        nuevaFila = [
          idArt,
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
          palabrasDetectadasTexto,
          iaData ? iaData.ubicacion : "Error IA",
          iaData ? iaData.es_caba : "Error IA",
          diffbotData.fecha_articulo || "No detectada",
          iaData ? iaData.fecha_hecho : "Error IA",
          iaData ? iaData.fuerzas_seguridad : "Error IA",
          iaData ? iaData.nombres_personas : "Error IA",
          diffbotData.autor,
          diffbotData.texto
        ];
      } else {
        nuevaFila = [
          idArt, fechaDet, medioIn, tituloIn, "Fallo Diffbot", linkIn, keywordIn, fuenteIn, 
          false, "PENDIENTE", "Error extracción texto", "",
          "", "", "", "", "", "", "", ""
        ];
      }

      hojaIA.appendRow(nuevaFila);
      inbox.getRange(i, colEstadoIA).setValue("PROCESADO");
      SpreadsheetApp.flush(); // Forzar visualización e inserción en la hoja en tiempo real
      Utilities.sleep(2500);
    }
  }
}

/***********************
 * CONEXIONES API (Diffbot & Gemini)
 ***********************/
function extraerConDiffbot_(url) {
  try {
    const endpoint = `https://api.diffbot.com/v3/article?token=${DIFFBOT_TOKEN}&url=${encodeURIComponent(url)}`;
    const response = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    const json = JSON.parse(response.getContentText());
    
    if (json.objects && json.objects.length > 0) {
      const obj = json.objects[0];
      return {
        texto: obj.text || "",
        autor: obj.author || "Sin firma",
        sitio: obj.siteName || "",
        link_real: obj.pageUrl || obj.resolvedPageUrl || url,
        fecha_articulo: obj.date || obj.estimatedDate || ""
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}
/*
function analizarConGemini_(texto) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
*/

/*
function analizarConGemini_(texto) {
  try {
    // Usamos la versión estable del endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode !== 200) {
      Logger.log(`Error HTTP Gemini [Status ${statusCode}]: ${responseText}`);
      return null;
    }

    const jsonResult = JSON.parse(responseText);
    
    if (!jsonResult.candidates || !jsonResult.candidates[0]) {
      Logger.log("Gemini no devolvió ningún candidato válido. Respuesta: " + responseText);
      return null;
    }

    const textoRespuesta = jsonResult.candidates[0].content.parts[0].text;
    Logger.log("Respuesta raw de Gemini: " + textoRespuesta);
    
    return JSON.parse(textoRespuesta);
    
  } catch (e) {
    Logger.log("Excepción en analizarConGemini_: " + e.toString());
    return null;
  }
}
*/

function analizarConGemini_(texto) {
  try {
    // Endpoint actualizado a modelo estable
    const MODEL_NAME = "gemini-2.5-flash"; 
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    
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
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode !== 200) {
      Logger.log(`Error HTTP Gemini [Status ${statusCode}]: ${responseText}`);
      return null;
    }

    const jsonResult = JSON.parse(responseText);
    if (!jsonResult.candidates || !jsonResult.candidates[0]) {
      return null;
    }

    const textoRespuesta = jsonResult.candidates[0].content.parts[0].text;
    return JSON.parse(textoRespuesta);
    
  } catch (e) {
    Logger.log("Excepción en analizarConGemini_: " + e.toString());
    return null;
  }
}