/**
 * API-Client für Datenportal Münsterland
 * Kommuniziert mit der Supabase Edge Function (Proxy)
 */

import type { DatenportalPOI } from "../config/datenportal";

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datenportal-pois`;

export interface FetchPOIsParams {
  center: { lat: number; lng: number };
  radiusKm: number;
  includeMedia?: boolean;
  signal?: AbortSignal;
}

/**
 * Lädt POIs vom Datenportal über die Supabase Edge Function
 */
export async function fetchDatenportalPois(
  params: FetchPOIsParams
): Promise<DatenportalPOI[]> {
  try {
    const url = new URL(EDGE_FUNCTION_URL);
    url.searchParams.set("lat", params.center.lat.toString());
    url.searchParams.set("lng", params.center.lng.toString());
    url.searchParams.set("radiusKm", params.radiusKm.toString());
    if (params.includeMedia) {
      url.searchParams.set("includeMedia", "true");
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      signal: params.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const pois: DatenportalPOI[] = await response.json();
    
    if (import.meta.env.DEV) {
      console.log(`[Datenportal] Loaded ${pois.length} POIs`);
    }
    
    return pois;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (import.meta.env.DEV) {
        console.log("[Datenportal] Request aborted");
      }
      return [];
    }
    console.error("[Datenportal] Error fetching POIs:", error);
    throw error;
  }
}
