// Supabase Edge Function: Datenportal Münsterland POI Proxy
// Vereinfachte Version - direkt filter[types.name] ohne Type-Mapping

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Env/Secrets
const DP_BASE_URL = Deno.env.get("DP_BASE_URL") || "https://www.datenportal-muensterland.de/api/v1";
const DP_API_USER = Deno.env.get("DP_API_USER") || "";
const DP_API_PASS = Deno.env.get("DP_API_PASS") || "";

// Allowlist der erlaubten POI-Typen (exakt wie vom Client spezifiziert)
const ALLOWED_POI_TYPES = [
  "Museum", "Theater", "Schloss", "Park", "Garten", "Kloster", "Kulturstätte",
  "Tourist-Info", "Galerie", "Freilichtbühne", "Freizeitpark",
  "Naturraum", "Picknick", "Schwimmbad", "Biergarten", "Restaurant", "Café", "Imbiss",
  "Wirtshaus", "Eisdiele", "Gaststätte", "Schankwirtschaft", "Fahrradverleih",
  "Hofladen", "Schlosscafé", "Gastronomie", "Sehenswürdigkeit", "Kirche", "Marktplatz",
  "Bahnhof", "See", "Erlebnisbad", "Zoo", "Kino", "Picknickplatz", "Einkaufszentrum",
  "Rathaus", "Tierpark", "Bibliothek", "Kanueinsatzstellen", "Aussichtspunkt/ Aussichtsturm",
  "Historisches Gebäude", "Beachclub", "Brauerei/Brennerei", "Mühle", "Hofcafe",
  "Eventschiff", "Spielplatz", "Heimathaus", "Radservicestation", "Picknickstation",
  "Schutzhütte/Hütte", "Busbahnhof",
];

const ALLOWED_CITY = "Münster";

// In-Memory Cache (optional)
let cache: { key: string; data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 120000; // 2 Minuten

// HTTP Basic Auth Header with UTF-8 support for special characters (§, %, etc.)
function getAuthHeader(): string {
  const credentials = `${DP_API_USER}:${DP_API_PASS}`;
  // Encode to UTF-8 bytes, then to base64
  const encoder = new TextEncoder();
  const data = encoder.encode(credentials);
  const base64 = btoa(String.fromCharCode(...data));
  return `Basic ${base64}`;
}

// Events vom Datenportal laden
async function fetchEventsFromDatenportal(
  lat?: number,
  lng?: number,
  radiusKm?: number
): Promise<any[]> {
  console.log("🎉 START: Fetching Events from Datenportal...");
  let allEvents: any[] = [];
  let pageNumber = 1;
  let hasMore = true;

  while (hasMore && pageNumber <= 5) { // Max 5 Seiten für Events
    const url = new URL(`${DP_BASE_URL}/events`);
    url.searchParams.set("filter[poi.address.city]", ALLOWED_CITY);
    url.searchParams.set("filter[in_future_or_current]", "true");
    url.searchParams.set("page[size]", "200");
    url.searchParams.set("page[number]", String(pageNumber));
    
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined && radiusKm > 0) {
      url.searchParams.set("filter[geofence]", `${lat},${lng},0,${radiusKm}`);
    }

    console.log(`🎉 Fetching Events page ${pageNumber}: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": getAuthHeader(),
          "Accept": "application/json",
        },
      });

      console.log(`🎉 Events API response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.warn(`Events API returned ${response.status}, body:`, text);
        return [];
      }

      const json = await response.json();
      const events = json.data || [];
      
      console.log(`🎉 Loaded ${events.length} events on page ${pageNumber}`);
      
      // Log ersten Event zur Struktur-Analyse
      if (pageNumber === 1 && events.length > 0) {
        const sample = events[0];
        console.log("=== Sample Event Structure ===");
        console.log("Available keys:", Object.keys(sample));
        console.log("Has poi?", !!sample.poi);
        console.log("POI ID:", sample.poi?.id);
        console.log("Event fields:", {
          id: sample.id,
          name: sample.name,
          start_datetime: sample.start_datetime,
          end_datetime: sample.end_datetime,
          start_datetime_is_approximately: sample.start_datetime_is_approximately,
          end_datetime_is_approximately: sample.end_datetime_is_approximately,
        });
        console.log("===========================");
      } else if (pageNumber === 1) {
        console.log("🎉 No events found!");
      }
      
      allEvents = allEvents.concat(events);
      hasMore = events.length === 200;
      pageNumber++;
    } catch (error) {
      console.error("🎉 Error fetching events:", error);
      return [];
    }
  }

  console.log(`🎉 DONE: Total ${allEvents.length} events loaded`);
  return allEvents;
}

// POIs vom Datenportal laden (mit Pagination)
async function fetchPOIsFromDatenportal(
  lat?: number,
  lng?: number,
  radiusKm?: number,
  includeMedia?: boolean
): Promise<any[]> {
  let allPois: any[] = [];
  let pageNumber = 1;
  let hasMore = true;

  while (hasMore && pageNumber <= 10) {
    // URL mit URLSearchParams bauen (korrekte Encoding für Umlaute/Sonderzeichen!)
    const url = new URL(`${DP_BASE_URL}/pois`);
    url.searchParams.set("filter[address.city]", ALLOWED_CITY);
    url.searchParams.set("filter[types.name]", ALLOWED_POI_TYPES.join(","));
    url.searchParams.set("page[size]", "200");
    url.searchParams.set("page[number]", String(pageNumber));
    
    // Teste verschiedene append-Werte
    // Starte mit dem Basis-Set das vorher funktioniert hat
    if (includeMedia) {
      url.searchParams.set("append", "public_media,all_translations_grouped");
    }
    
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined && radiusKm > 0) {
      url.searchParams.set("filter[geofence]", `${lat},${lng},0,${radiusKm}`);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": getAuthHeader(),
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Datenportal API error (${response.status}):`, errorText);
      console.error(`Request URL:`, url.toString());
      throw new Error(`POI fetch failed: ${response.status}`);
    }

    const json = await response.json();
    const pois = json.data || [];
    
    // Log ersten POI zur Struktur-Analyse (nur einmal pro Request)
    if (pageNumber === 1 && pois.length > 0) {
      const sample = pois[0];
      console.log("=== Sample POI Structure ===");
      console.log("Available keys:", Object.keys(sample));
      console.log("Types:", sample.types);
      console.log("Has events?", !!sample.events);
      console.log("Has veranstaltungen?", !!sample.veranstaltungen);
      console.log("Direct date fields:", {
        start_date: sample.start_date,
        end_date: sample.end_date,
        beginn: sample.beginn,
        ende: sample.ende,
        from_date: sample.from_date,
        to_date: sample.to_date,
      });
      console.log("===========================");
    }
    
    allPois = allPois.concat(pois);

    // Pagination: stop wenn weniger als 200 oder kein next link
    hasMore = pois.length === 200 && !!json.links?.next;
    pageNumber++;
  }

  return allPois;
}

// Defensive serverseitige Filterung (falls API-Filter nicht exakt matcht)
function filterPOI(poi: any): boolean {
  // City-Check
  const city = (poi.address?.city || poi.city || "").toString().trim().toLowerCase();
  if (city !== ALLOWED_CITY.toLowerCase()) {
    return false;
  }

  // Types-Check
  const types = poi.types || [];
  if (!Array.isArray(types) || types.length === 0) {
    return false;
  }

  const typeNames = types.map((t: any) => (t.name || t).toString().trim());
  const hasAllowedType = typeNames.some((name: string) =>
    ALLOWED_POI_TYPES.some((allowed) => allowed.toLowerCase() === name.toLowerCase())
  );

  return hasAllowedType;
}

// POI normalisieren für Frontend
function normalizePOI(poi: any): any {
  const address = poi.address || {};
  const lat = address.latitude || poi.latitude || poi.lat;
  const lng = address.longitude || poi.longitude || poi.lng;

  // Types extrahieren
  let types: string[] = [];
  if (poi.types && Array.isArray(poi.types)) {
    types = poi.types.map((t: any) => t.name || t).filter(Boolean);
  }

  // Description: HTML-Tags entfernen für sauberen Text
  let description = poi.description_text || poi.description || null;
  if (description) {
    // Entferne HTML-Tags und dekodiere Entities
    description = description
      .replace(/<[^>]*>/g, ' ')  // Entferne HTML-Tags
      .replace(/&nbsp;/g, ' ')   // Ersetze &nbsp;
      .replace(/\s+/g, ' ')      // Multiple Leerzeichen zu einem
      .trim();
    // Kürze auf 300 Zeichen für Popup
    if (description.length > 300) {
      description = description.substring(0, 297) + '...';
    }
  }

  // Event-Daten extrahieren (falls vorhanden)
  let startDate = null;
  let endDate = null;
  let eventTime = null;
  
  // Prüfe auf verknüpfte Events/Veranstaltungen
  if (poi.events && Array.isArray(poi.events) && poi.events.length > 0) {
    // Nimm das erste Event (oder neueste)
    const event = poi.events[0];
    console.log(`POI ${poi.id} has events:`, JSON.stringify(event, null, 2));
    startDate = event.start || event.begin || event.start_date || event.from_date || null;
    endDate = event.end || event.end_date || event.to_date || null;
    eventTime = event.time || event.event_time || null;
    
    // Füge Event-Beschreibung hinzu, falls vorhanden und POI hat keine eigene
    if (!description && event.description) {
      description = event.description;
    }
  } else if (poi.veranstaltungen && Array.isArray(poi.veranstaltungen) && poi.veranstaltungen.length > 0) {
    const veranstaltung = poi.veranstaltungen[0];
    console.log(`POI ${poi.id} has veranstaltungen:`, JSON.stringify(veranstaltung, null, 2));
    startDate = veranstaltung.beginn || veranstaltung.start || veranstaltung.start_date || null;
    endDate = veranstaltung.ende || veranstaltung.end || veranstaltung.end_date || null;
    eventTime = veranstaltung.zeit || veranstaltung.time || null;
  }
  // Fallback auf direkte POI-Felder
  else {
    startDate = poi.start_date || poi.event_start || poi.from_date || poi.start || poi.beginn || null;
    endDate = poi.end_date || poi.event_end || poi.to_date || poi.end || poi.ende || null;
    eventTime = poi.event_time || poi.time || poi.zeit || null;
    
    // Log wenn direkte Felder gefunden wurden
    if (startDate || endDate || eventTime) {
      console.log(`POI ${poi.id} has direct date fields:`, { startDate, endDate, eventTime });
    }
  }

  return {
    id: poi.id,
    name: poi.name || "",
    name2: poi.name2 || null,
    description: description,
    lat: lat ? parseFloat(lat) : 0,
    lng: lng ? parseFloat(lng) : 0,
    city: address.city || null,
    postalCode: address.postal_code || null,
    street: address.street || null,
    houseNumber: address.house_number || null,
    types,
    website: poi.website || null,
    licenseType: poi.license_type || null,
    copyright: poi.copyright || null,
    source: poi.source || null,
    media: poi.public_media || poi.media || [],
    // Event-spezifische Felder (wenn vorhanden)
    startDate: startDate,
    endDate: endDate,
    eventTime: eventTime,
  };
}

// Main Handler
serve(async (req: Request) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "public, max-age=120",
  };

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Nur GET erlaubt
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Query-Parameter extrahieren
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    const radiusKm = url.searchParams.get("radiusKm");
    const includeMedia = url.searchParams.get("includeMedia") === "true";

    // Validierung
    if (!DP_API_USER || !DP_API_PASS) {
      throw new Error("Missing API credentials (DP_API_USER, DP_API_PASS)");
    }

    // Cache-Key
    const cacheKey = `${lat || "all"},${lng || "all"},${radiusKm || "all"},${includeMedia}`;
    
    // Check Cache
    if (cache && cache.key === cacheKey && (Date.now() - cache.timestamp) < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    // POIs vom Datenportal holen
    const pois = await fetchPOIsFromDatenportal(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radiusKm ? parseFloat(radiusKm) : undefined,
      includeMedia
    );

    // Events vom Datenportal holen (parallel zu POIs)
    const events = await fetchEventsFromDatenportal(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radiusKm ? parseFloat(radiusKm) : undefined
    );

    // Event-Map erstellen (poi.id -> events)
    const eventsByPoiId = new Map<number, any[]>();
    events.forEach(event => {
      const poiId = event.poi?.id;
      if (poiId) {
        if (!eventsByPoiId.has(poiId)) {
          eventsByPoiId.set(poiId, []);
        }
        eventsByPoiId.get(poiId)!.push(event);
      }
    });

    console.log(`🎉 Mapped ${eventsByPoiId.size} POIs with events`);

    // Filtern und normalisieren - Events mit POIs verknüpfen
    const filtered = pois.filter(filterPOI).map(poi => {
      const normalized = normalizePOI(poi);
      
      // Verknüpfte Events hinzufügen
      const poiEvents = eventsByPoiId.get(poi.id);
      if (poiEvents && poiEvents.length > 0) {
        const firstEvent = poiEvents[0]; // Nimm das erste Event
        normalized.startDate = firstEvent.start_datetime || null;
        normalized.endDate = firstEvent.end_datetime || null;
        
        // Formatiere eventTime aus start_datetime
        if (firstEvent.start_datetime) {
          const date = new Date(firstEvent.start_datetime);
          normalized.eventTime = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Event-Typ hinzufügen
        if (firstEvent.types && firstEvent.types.length > 0) {
          normalized.eventType = firstEvent.types[0].name;
        }
        
        // Event-Beschreibung hinzufügen (HTML entfernen)
        if (firstEvent.description_text) {
          normalized.eventDescription = firstEvent.description_text
            .replace(/<[^>]*>/g, '')
            .trim();
        }
      }
      
      return normalized;
    }).filter((p) => p.lat && p.lng);

    // Cache speichern
    cache = { key: cacheKey, data: filtered, timestamp: Date.now() };

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
