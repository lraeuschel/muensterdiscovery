import { getPOIs } from "./DatabaseConnection";
import type { POI } from "../types";

let cachedPOIs: POI[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache POIs for 5 minutes

export async function getRandomPOI(): Promise<POI | null> {
  try {
    const now = Date.now();
    if (!cachedPOIs || now - lastFetchTime > CACHE_DURATION) {
      cachedPOIs = await getPOIs();
      lastFetchTime = now;
      console.log("Fetched POIs from database:", cachedPOIs);
    }

    if (!cachedPOIs || cachedPOIs.length === 0) {
      console.warn("No POIs available");
      return null;
    }

    const timeBucket = Math.floor(Date.now() / (90 * 1000));
    const pseudoRandom = Math.abs(timeBucket * 9301 + 49297) % 233280;
    const selectedIndex = pseudoRandom % cachedPOIs.length;
    
    const selectedPOI = cachedPOIs[selectedIndex];
    console.log(
      `Time bucket: ${timeBucket}, Selected POI index: ${selectedIndex}, POI: ${selectedPOI?.name}`
    );
    
    return selectedPOI || null;
  } catch (error) {
    console.error("Error getting random POI:", error);
    return null;
  }
}

export function invalidatePOICache() {
  cachedPOIs = null;
  lastFetchTime = 0;
}