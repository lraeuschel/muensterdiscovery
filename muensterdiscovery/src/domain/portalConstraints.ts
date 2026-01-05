/**
 * Datenportal Münsterland - POI Constraints
 * Single Source of Truth für Filterkriterien
 */

// Erlaubter Ort
export const ALLOWED_PLACE = "Münster";

// Whitelist der erlaubten POI-Typen
export const ALLOWED_POI_TYPES = new Set([
  "Museum",
  "Theater",
  "Schloss",
  "Park",
  "Garten",
  "Kloster",
  "Kulturstätte",
  "Tourist-Info",
  "Galerie",
  "Freilichtbühne",
  "Freizeitpark",
  "Veranstaltungsort",
  "Naturraum",
  "Picknick",
  "Schwimmbad",
  "Biergarten",
  "Restaurant",
  "Café",
  "Imbiss",
  "Wirtshaus",
  "Eisdiele",
  "Gaststätte",
  "Schankwirtschaft",
  "Fahrradverleih",
  "Hofladen",
  "Schlosscafé",
  "Gastronomie",
  "Sehenswürdigkeit",
  "Kirche",
  "Marktplatz",
  "Bahnhof",
  "See",
  "Erlebnisbad",
  "Zoo",
  "Kino",
  "Picknickplatz",
  "Einkaufszentrum",
  "Rathaus",
  "Tierpark",
  "Bibliothek",
  "Kanueinsatzstellen",
  "Aussichtspunkt/ Aussichtsturm",
  "Historisches Gebäude",
  "Beachclub",
  "Brauerei/Brennerei",
  "Mühle",
  "Hofcafe",
  "Eventschiff",
  "Spielplatz",
  "Heimathaus",
  "Radservicestation",
  "Picknickstation",
  "Schutzhütte/Hütte",
  "Busbahnhof",
]);

/**
 * POI-Typ aus Datenportal API
 */
export interface DatenportalPOI {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  ort: string;
  typen: string | string[];
  beschreibung?: string;
  strasse?: string;
  hausnr?: string;
  plz?: string;
  website?: string;
  lizenzTyp?: string;
  copyright?: string;
  quelle?: string;
}

/**
 * Client-seitige Validierung: Prüft, ob POI den Constraints entspricht
 * (Defensive Prüfung, da serverseitig bereits gefiltert)
 */
export function matchesPoiConstraints(poi: DatenportalPOI): boolean {
  // Ort-Check (case-insensitive, trim)
  const ort = (poi.ort || "").toString().trim().toLowerCase();
  if (ort !== ALLOWED_PLACE.toLowerCase()) {
    return false;
  }

  // Typen-Check (mind. ein Typ aus Whitelist)
  const types = Array.isArray(poi.typen) ? poi.typen : [poi.typen];
  
  return types.some((type) => {
    const typeStr = type.toString().trim();
    return ALLOWED_POI_TYPES.has(typeStr);
  });
}

/**
 * Formatiert POI-Typen für Anzeige (Array → String mit Komma-Trennung)
 */
export function formatPoiTypes(typen: string | string[]): string {
  const types = Array.isArray(typen) ? typen : [typen];
  return types.join(", ");
}
