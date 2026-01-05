/**
 * Service für Datenportal Münsterland POI API
 * Kommuniziert mit der Supabase Edge Function (Proxy)
 */

import type { DatenportalPOI } from "../domain/portalConstraints";

// Supabase Edge Function URL (anpassen an dein Projekt)
// Format: https://<project-ref>.supabase.co/functions/v1/datenportal-pois
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datenportal-pois`;

/**
 * Bounding Box für Leaflet
 */
export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

/**
 * Lädt POIs vom Datenportal über die Supabase Edge Function
 * @param bbox Bounding Box der Kartenansicht
 * @param signal AbortSignal für Request-Cancellation
 * @returns Array von gefilterten POIs (nur Münster + Whitelist-Typen)
 */
export async function fetchDatenportalPois(
  bbox: BoundingBox,
  signal?: AbortSignal
): Promise<DatenportalPOI[]> {
  try {
    // bbox als Query-Parameter
    const bboxParam = `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`;
    const url = `${EDGE_FUNCTION_URL}?bbox=${encodeURIComponent(bboxParam)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const pois: DatenportalPOI[] = await response.json();
    return pois;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request aborted");
      return [];
    }
    console.error("Error fetching Datenportal POIs:", error);
    throw error;
  }
}

/**
 * Hilfsfunktion: Konvertiert Leaflet Bounds zu BoundingBox
 */
export function leafletBoundsToBbox(bounds: L.LatLngBounds): BoundingBox {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  return {
    minLng: sw.lng,
    minLat: sw.lat,
    maxLng: ne.lng,
    maxLat: ne.lat,
  };
}
