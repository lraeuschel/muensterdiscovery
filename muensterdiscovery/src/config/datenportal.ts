/**
 * Datenportal Münsterland - Konfiguration
 */

export const DATENPORTAL_CITY = "Münster";

export const ALLOWED_POI_TYPES = [
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
  // Event-Typen (werden mit Calendar-Icon angezeigt)
  "Veranstaltung",
  "Event",
  "Festival",
  "Konzert",
  "Markt",
  "Ausstellung",
] as const;

// Typen, die als Events behandelt werden (Calendar-Icon)
export const EVENT_TYPES = [
  "Veranstaltung",
  "Event",
  "Festival",
  "Konzert",
  "Markt",
  "Ausstellung",
];

/**
 * POI-Typ aus Datenportal API (normalisiert)
 */
export interface DatenportalPOI {
  id: string | number;
  name: string;
  name2?: string | null;
  description?: string | null;
  lat: number;
  lng: number;
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  types: string[];
  website?: string | null;
  licenseType?: string | null;
  copyright?: string | null;
  source?: string | null;
  media?: any[];
  // Event-spezifische Felder
  startDate?: string | null; // ISO 8601 datetime
  endDate?: string | null;   // ISO 8601 datetime
  eventTime?: string | null; // Freitext-Zeit (falls vorhanden)
  eventType?: string | null; // Typ der Veranstaltung
  eventDescription?: string | null; // Beschreibung der Veranstaltung
}
