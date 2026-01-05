# Datenportal Münsterland POI Proxy - Edge Function

Diese Supabase Edge Function lädt POIs von der Datenportal Münsterland API und filtert sie serverseitig.

## Features

- ✅ Authentifizierung gegen Datenportal API
- ✅ In-Memory Token Caching
- ✅ Serverseitiges Filtering (Ort + Typen-Whitelist)
- ✅ Bbox-basierte räumliche Filterung
- ✅ CORS-Support
- ✅ Cache-Control Headers

## Environment Variables

Setze diese Secrets über Supabase CLI:

```bash
supabase secrets set DATENPORTAL_BASE_URL=https://api.datenportal-muensterland.de
supabase secrets set DATENPORTAL_EMAIL=deine-email@example.com
supabase secrets set DATENPORTAL_PASSWORD=dein-passwort
```

## API Endpoints

### GET /datenportal-pois

**Query Parameters:**
- `bbox` (optional): Format `minLng,minLat,maxLng,maxLat` (z.B. `7.5,51.9,7.7,52.0`)

**Response:**
```json
[
  {
    "id": 123,
    "name": "Museum für Lackkunst",
    "lat": 51.9607,
    "lng": 7.6261,
    "ort": "Münster",
    "typen": ["Museum", "Sehenswürdigkeit"],
    "beschreibung": "...",
    "strasse": "Windthorststraße",
    "hausnr": "26",
    "plz": "48143",
    "website": "https://...",
    "lizenzTyp": "CC BY 4.0",
    "copyright": "Datenportal Münsterland",
    "quelle": "..."
  }
]
```

## Deployment

```bash
# Lokal testen
supabase functions serve datenportal-pois

# Deployen
supabase functions deploy datenportal-pois

# Logs anschauen
supabase functions logs datenportal-pois
```

## Testing

```bash
# Lokal (nach serve)
curl "http://localhost:54321/functions/v1/datenportal-pois?bbox=7.5,51.9,7.7,52.0"

# Production
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/datenportal-pois?bbox=7.5,51.9,7.7,52.0"
```

## API-Anpassungen

⚠️ Die Datenportal API-Endpoints sind Platzhalter! Anpassen nach offizieller Doku:

1. **Login-Endpoint** (Zeile ~82): `/auth/login`
2. **POI-Endpoint** (Zeile ~131): `/api/pois`
3. **Response-Format** (Zeile ~145): `data.data` vs. `data.pois` vs. direkt `data`
4. **Feldnamen** (Zeile ~176, 189-203): z.B. `ort` vs. `city`, `typen` vs. `types`

## Filterlogik

**Ort:** Nur `"Münster"` (case-insensitive, trimmed)

**Typen:** 61 erlaubte Typen (Museum, Theater, Schloss, Park, Restaurant, etc.)

POIs müssen **beide** Kriterien erfüllen.
