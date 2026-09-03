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
const COL_PUNTAJE   = 12;// L
const COL_PALABRAS  = 11; // K

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
  "prefecto",
  "bastones largos",
  "policia",
  "efectivo",
  "uniformado",
  "comisaria",
  "comisario",
  "policial",
  "division unidad tactica de pacificacion",
  "hidrante",
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
  "fuerzas de seguridad",
  "fuerzas federales"
]
const VIOLENCIA_POLICIAL = [
"megaoperativo",
"desalojo",
"gas",
"gases",
"lacrimogeno",
"gatillo facil",
"uso desmedido de la fuerza",
"ejecucion reglamentaria",
"tiro a matar",
"fusilamiento",
"violencia institucional",
"violencia estatal",
"reprimio",
"represion",
"reprimieron",
"redujo",
"redujeron",
"fusilo",
"fusilamiento",
"aprehendio",
"aprehendieron",
"arresto",
"gatillo",
"bastones largos",
"operativo",
"antipiquete"
]

const CABA = [   "caba",   "ciudad de buenos aires",   "capital federal",   "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Monserrat", "Montevideo", "Nuñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", "Vélez Sarsfield", "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza",   "plaza de mayo",   "congreso",  "casa rosada", "legislatura porteña",
"jefatura de gobierno porteño",
"gobierno de la ciudad",
"gobierno porteño","ministerio de trabajo",  "obelisco","hospital argerich",
"hospital fernández",
"hospital pirovano",
"hospital durand",
"hospital ramos mejía",
"hospital bonaparte",
"hospital italiano",
"microcentro",
"centro porteño",
"once",
"tribunales",
"retiro",
"puerto madero",
"costanera",
"costanera sur",
"costanera norte",
"parque centenario",
"parque lezama",
"parque 3 de febrero",
"bosques de palermo",
"villa 31",
"villa 21-24",
"villa 1-11-14",
"villa 15",
"ciudad oculta",
"barrio 31", 
"barrios populares",
"barrio popular",
"villa porteña",
"villas porteñas"
]

const VIOLENCIA_GENERAL = [
"incidente",
"disturbio",
"golpe",
"golpeo",
"golpiza",
"remato",
"asesino",
"abandono",
"caceria",
"violento",
"abuso",
"agredio",
"baleo",
"refriega",
"bala",
"molotov",
"violencia",
"quemarropa",
"disparo",
"disparado",
"ejecuto"
]

const POSIBLE_VICTIMA = [
"docente",
"universitario",
"cientifico",
"cientifica",
"jubilado",
"jubiladas",
"protesta",
"movilizacion",
"gremial",
"gremio",
"militante",
"grupo violento", 
"rostros ocultos",
"anarquista",
"trosko",
"troskista",
"rostros ocultos",
"rostro oculto",
"sindicalista",
"piquetero",
"mantero",
"manifestante",
"vendedor",
"ambulante",
"terrorista",
]

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
"situacion de calle",
"resistencia a la autoridad",
"indigente",
"indigencia"]

const RULES = [
  {
    name: "POLICIA + VICTIMA + VIOLENCIA POLICIAL + CABA",
    groups: [POLICIA, VICTIMA, VIOLENCIA_POLICIAL, CABA]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA POLICIAL + CABA",
    groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_POLICIAL, CABA]
  },
  {
    name: "POLICIA + VICTIMA + VIOLENCIA GENERAL + CABA",
    groups: [POLICIA, VICTIMA, VIOLENCIA_GENERAL, CABA]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA GENERAL + CABA",
    groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_GENERAL, CABA]
  },
  {
    name: "POLICIA + VICTIMA + CABA",
    groups: [POLICIA, VICTIMA, CABA]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA + CABA",
    groups: [POLICIA, POSIBLE_VICTIMA, CABA]
  },
  {
    name: "POLICIA + VIOLENCIA POLICIAL + CABA",
    groups: [POLICIA, VIOLENCIA_POLICIAL, CABA]
  },
  {
    name: "POLICIA + VIOLENCIA GENERAL + CABA",
    groups: [POLICIA, VIOLENCIA_GENERAL, CABA]
  },
  {
    name: "POLICIA + VICTIMA + VIOLENCIA POLICIAL",
    groups: [POLICIA, VICTIMA, VIOLENCIA_POLICIAL]
  },
  {
    name: "POLICIA + VICTIMA + VIOLENCIA GENERAL",
    groups: [POLICIA, VICTIMA, VIOLENCIA_GENERAL]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA POLICIAL",
    groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_POLICIAL]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA + VIOLENCIA GENERAL",
    groups: [POLICIA, POSIBLE_VICTIMA, VIOLENCIA_GENERAL]
  },
  {
    name: "POLICIA + VICTIMA",
    groups: [POLICIA, VICTIMA]
  },
  {
    name: "POLICIA + POSIBLE VICTIMA",
    groups: [POLICIA, POSIBLE_VICTIMA]
  },
  {
    name: "POLICIA + VIOLENCIA POLICIAL",
    groups: [POLICIA, VIOLENCIA_POLICIAL]
  },
  {
    name: "POLICIA + VIOLENCIA GENERAL",
    groups: [POLICIA, VIOLENCIA_GENERAL]
  }
];

/** **/


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

      const titleNorm = normalizeText(title);
      const detectedData = detectKeyword_(titleNorm);

      const palabrasDetectadas = detectarTodasLasPalabras_(titleNorm);
      
      if (!detectedData) {
        skippedNoKeyword++;
        return;
      }

      const detected = detectedData.regla;

      rowsToInsert.push([
        new Date(),
        "Google News",
        title,
        link,
        detected,
        feedUrl,
        false,
        EST_PENDIENTE,
        "",
        "",
        palabrasDetectadas
      ]);
      seenGuids.add(guid);
      existingLinks.add(link);
      seenToAppend.push([guid, new Date(), link]);
      inserted++;
    });
  });

  if (rowsToInsert.length > 0) {
    const startRow = getLastDataRow_(inbox, COL_FECHA) + 1;
    inbox.getRange(startRow, 1, rowsToInsert.length, 12).setValues(rowsToInsert);

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
      rowsToArchive.push(inbox.getRange(rowNumber, 1, 1, 11).getValues()[0]);
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
//function detectKeyword_(lowerTitle) {

  //for (const rule of RULES) {

    //let ok = true;

    //for (const category of rule.groups) {
     // if (!containsAny(lowerTitle, category)) {
      //  ok = false;
        //break;
      //}
   // }

   // if (ok) {
    //  return rule.name;
   // }
 // }
//
  //return "";
//}
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
//funcion nueva del chat
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
      resultado.push(
        `${grupo.nombre}: ${encontradas.join(", ")}`
      );
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
    sh.appendRow(["Fecha detección","Medio","Título","Link","Keyword detectada","Fuente","Revisado","Validado","Observaciones", "Estado IA","Palabras detectadas","Puntaje"]);
    //agrego estado ia y palabras detectadas
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

/***********************
 * CÁLCULO DE PUNTAJE
 ***********************/
function calcularPuntaje_(texto) {
  const textoNorm = normalizeText(texto);
  let puntaje = 0;

  if (containsAny(textoNorm, POLICIA)) {
    puntaje += 3;
  }
  if (containsAny(textoNorm, VIOLENCIA_POLICIAL)) {
    puntaje += 3;
  }
  if (containsAny(textoNorm, CABA)) {
    puntaje += 4;
  }
  if (containsAny(textoNorm, VICTIMA)) {
    puntaje += 2;
  }
  if (containsAny(textoNorm, POSIBLE_VICTIMA)) {
    puntaje += 1;
  }

  return puntaje;
}

// IA 

/***********************
 * CONFIGURACIÓN DEL AGENTE IA
 ***********************/
const SHEET_IA = "IA";
// Toke and key removed.


// Agregamos una columna virtual en INBOX para saber si ya fue procesada
const COL_ESTADO_IA = 10; // Columna J en INBOX

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
      "Keyword detectada", "Fuente", "Revisado", "Validado", "Observaciones","Palabras detectadas", 
      "Ubicación", "¿Es CABA?", "Fecha del artículo", "Fecha del hecho", 
      "Fuerzas de seguridad", "Nombres de personas", "Autor", "Texto artículo"
    ];
    hojaIA.appendRow(encabezados);
    hojaIA.getRange(1, 1, 1, encabezados.length).setFontWeight("bold");
    hojaIA.setFrozenRows(1);
    
    // Checkboxes y Validaciones igual que en INBOX
    hojaIA.getRange(2, 9, hojaIA.getMaxRows()-1, 1).insertCheckboxes(); // Revisado
    const ruleValidado = SpreadsheetApp.newDataValidation()
      .requireValueInList(["PENDIENTE", "VALIDO", "NO RELEVANTE"], true)
      .setAllowInvalid(false).build();
    hojaIA.getRange(2, 10, hojaIA.getMaxRows()-1, 1).setDataValidation(ruleValidado);
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
    const linkGoogle = inbox.getRange(i, COL_LINK).getValue(); // Columna 4 (D)
    
    // Si hay link y aún no fue procesado por la IA
    if (linkGoogle && estadoIA !== "PROCESADO") {
      
      // 1. Obtener datos de INBOX para copiarlos
      const filaInbox = inbox.getRange(i, 1, 1, 9).getValues()[0];
      const [fechaDet, medioIn, tituloIn, linkIn, keywordIn, fuenteIn, revIn, valIn, obsIn] = filaInbox;
      
      // 2. Extraer con Diffbot
      const diffbotData = extraerConDiffbot_(linkGoogle);
      
      let nuevaFila = [];
      const idArt = Utilities.getUuid(); // Genera un ID único alfanumérico
      
      if (diffbotData && diffbotData.texto) {
        // 3. Normalizar el texto completo y calcular puntaje + palabras sobre el CUERPO
        
        const textoCompletoNorm = normalizeText(diffbotData.texto);
        const puntajeTexto = calcularPuntaje_(textoCompletoNorm);
        const palabrasDetectadasTexto = detectarTodasLasPalabras_(textoCompletoNorm);

        inbox.getRange(i, COL_PALABRAS).setValue(palabrasDetectadasTexto); // Columna 11 (K)
        inbox.getRange(i, COL_PUNTAJE).setValue(puntajeTexto);             // Columna 12 (L)
        
        //Analizar con Gemini
        const iaData = analizarConGemini_(diffbotData.texto);
        
        // 4. Armar la fila con el formato exacto solicitado
        nuevaFila = [
          idArt,
          fechaDet,
          diffbotData.sitio || medioIn, // Si diffbot saca el sitio real, lo usamos
          tituloIn,
          diffbotData.link_real,
          linkIn, // link original de google news
          keywordIn,
          fuenteIn,
          false, // Revisado por defecto
          "PENDIENTE", // Validado por defecto
          obsIn,
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
        // Falló Diffbot (Paywall, link roto, etc)
        nuevaFila = [
          idArt, fechaDet, medioIn, tituloIn, "Fallo Diffbot", linkIn, keywordIn, fuenteIn, 
          false, "PENDIENTE", "Error extracción texto", 
          "", "", "", "", "", "", "", ""
        ];
      }


      // 5. Insertar en la hoja IA
      ss.getSheetByName(SHEET_IA).appendRow(nuevaFila);
      
      // 6. Marcar en INBOX como procesado
      inbox.getRange(i, COL_ESTADO_IA).setValue("PROCESADO");
      
      // Pausa obligatoria para no saturar las APIs (cuota gratuita)
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
        link_real: obj.pageUrl || obj.resolvedPageUrl || url, // Resuelve la redirección de Google
        fecha_articulo: obj.date || obj.estimatedDate || ""
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

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