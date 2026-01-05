# Datenportal Münsterland - Integration (HTTP Basic Auth)

POIs von der Datenportal Münsterland API v1 werden live geladen und auf der Leaflet-Karte angezeigt.

## Architektur

- **Edge Function:** Supabase Proxy mit HTTP Basic Auth (keine Credentials im Frontend)
- **Type-Mapping:** IDs statt Namen + In-Memory Cache (1h TTL)
- **Pagination:** Max 2000 POIs über 10 Seiten á 200 POIs
- **Geofence:** Radius-basierter Filter (lat, lng, radiusKm)
- **Filtering:** Nur Münster + 61 erlaubte POI-Typen

## Setup - API-Credentials

**WICHTIG:** Credentials als Supabase Secrets setzen (NICHT in `.env`!):

```bash
npx supabase secrets set DP_API_USER=dein-username
npx supabase secrets set DP_API_PASS=dein-passwort
```

## Deploy

```bash
npx supabase functions deploy datenportal-pois
```

## Testen

```bash
# Dev Server starten
cd muensterdiscovery
npm run dev

# → http://localhost:5173/muensterdiscovery/
# → Gehe zu "Open World"
# → Bewege Karte → POIs laden nach 400ms
```

## Dateien

- `supabase/functions/datenportal-pois/index.ts` - Edge Function (Proxy)
- `src/config/datenportal.ts` - Allowlist + Typen
- `src/api/datenportal.ts` - API-Client
- `src/pages/openworld.tsx` - Karten-Integration

## Credentials-Sicherheit

✅ **Richtig:**
- `npx supabase secrets set DP_API_USER=...`
- Secrets bleiben serverseitig in Supabase

❌ **Falsch:**
- ❌ Credentials in `.env` im Frontend
- ❌ Credentials in Git committen
- ❌ Credentials hardcoden

## API-Details

**Base:** https://www.datenportal-muensterland.de/api/v1
- **Auth:** HTTP Basic Auth (Username + Password)
- **Types:** `GET /types?filter[types.for_poi]=1&page[size]=200`
- **POIs:** `GET /pois?filter[address.city]=Münster&filter[types.id]=1,2,3&filter[geofence]=lat,lng,0,radiusKm&page[size]=200&page[number]=1`

## Performance

- Debounce: 400ms
- Cache: 3min (Browser)
- Type-Cache: 1h (In-Memory)
- Max POIs: 2000 (10 Seiten)
