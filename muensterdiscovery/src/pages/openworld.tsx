import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Alert } from '@chakra-ui/react';
import Header from '../components/Header';
import pois from '../../data/POIs_Muenster_Discovery.json';
import stern from '../assets/supermario_stern.webp';
import { fetchDatenportalPois } from '../api/datenportal';
import type { DatenportalPOI } from '../config/datenportal';


type POIProperties = {
    id: number;
    name: string;
    Info?: string | null;
};

type POIFeature = {
    type: 'Feature';
    properties: POIProperties;
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
};

type CRS = {
    type: 'name';
    properties: {
        name: string;
    };
}

type POICollection = {
    type: 'FeatureCollection';
    name: string;
    crs: CRS;
    features: POIFeature[];
}

const starIcon = new L.Icon({
    iconUrl: stern,
    iconSize: [35, 35],      
    iconAnchor: [20, 20],    // Mitte des Bildes
    popupAnchor: [0, -20],   // Popup über dem Icon
    className: 'star-icon',
});

// Event Calendar Icon (SVG-based)
const calendarIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#FFF5F5"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
  <text x="12" y="18" text-anchor="middle" font-size="8" fill="#E53E3E" font-weight="bold">📅</text>
</svg>
`;

const eventIcon = new L.DivIcon({
    html: calendarIconSVG,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'event-icon',
});

// Bike Rental Icon (Emoji-based)
const bikeIconSVG = `
<div style="font-size: 28px; line-height: 1; text-align: center;">🚲</div>
`;

const bikeIcon = new L.DivIcon({
    html: bikeIconSVG,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'bike-icon',
});

// Custom Hook: Lädt ALLE Datenportal POIs einmalig beim Mount
function useDatenportalPOIs() {
    const [datenportalPOIs, setDatenportalPOIs] = useState<DatenportalPOI[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        // Nur einmal beim Mount laden
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadAllPOIs = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Lade ALLE POIs und Events für Münster (ohne Geofence)
                const pois = await fetchDatenportalPois({
                    center: { lat: 51.9607, lng: 7.6261 }, // Münster Center
                    radiusKm: 50, // Großer Radius um ganz Münster abzudecken
                    signal: undefined,
                });
                setDatenportalPOIs(pois);
                console.log(`Loaded ${pois.length} POIs/Events from Datenportal`);
            } catch (err) {
                console.error('Error loading Datenportal POIs:', err);
                setError('Datenportal POIs konnten nicht geladen werden.');
            } finally {
                setIsLoading(false);
            }
        };

        loadAllPOIs();
    }, []);

    return { datenportalPOIs, isLoading, error };
}

export default function OpenWorld() {
    const intl = useIntl();
    
    // Münster Koordinaten
    const munsterCenter: LatLngExpression = [51.9607, 7.6261];
    const zoom = 14;

    // Statische POIs aus JSON
    const features = useMemo(() => {
        const collection = pois as POICollection;
        return collection.features?.filter((f) => f.geometry?.type === 'Point') ?? [];
    }, []);

    const staticMarkers = useMemo(
        () =>
            features.map((feature, index) => {
                const [lon, lat] = feature.geometry.coordinates;
                return {
                    id: `static-${feature.properties.id ?? index}`,
                    name: feature.properties.name,
                    note: feature.properties.Info,
                    position: [lat, lon] as LatLngExpression,
                    source: 'static' as const,
                };
            }),
        [features]
    );

    // Datenportal POIs (einmalig beim Mount geladen) - enthält auch Events
    const { datenportalPOIs, isLoading, error } = useDatenportalPOIs();

    // Datenportal Marker - separiere Events von normalen POIs
    const datenportalMarkers = useMemo(() => {
        const markers: any[] = [];
        
        datenportalPOIs.forEach((poi) => {
            // Prüfe ob POI ein Event ist: Nur wenn Datum vorhanden
            const hasEventDates = !!(poi.startDate || poi.endDate || poi.eventTime);
            const isEvent = hasEventDates;
            
            // Prüfe ob POI ein Fahrradverleih ist
            const isBikeRental = poi.types?.some(t => t.toLowerCase().includes('fahrradverleih'));
            
            // FILTER: Nur Events und Fahrradverleih behalten, normale POIs ausblenden
            if (!isEvent && !isBikeRental) {
                return; // Normale POIs überspringen
            }
            
            // Bestimme Source-Typ
            let source: 'event' | 'bike' | 'datenportal' = 'datenportal';
            if (isEvent) source = 'event';
            else if (isBikeRental) source = 'bike';
            
            markers.push({
                id: `datenportal-${poi.id}`,
                name: poi.name,
                position: [poi.lat, poi.lng] as LatLngExpression,
                source,
                poi, // Vollständiges POI-Objekt für Details
                isEvent,
                isBikeRental,
            });
        });
        
        return markers;
    }, [datenportalPOIs]);

    // Kombinierte Marker-Liste
    const allMarkers = useMemo(
        () => [...staticMarkers, ...datenportalMarkers],
        [staticMarkers, datenportalMarkers]
    );

    const hasData = allMarkers.length > 0;

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Header />

            {/* Error Message */}
            {error && (
                <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: '400px' }}>
                    <Alert.Root status="warning" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div style={{ position: 'absolute', top: '80px', right: '20px', zIndex: 1000, background: 'white', padding: '8px 16px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    Lade POIs...
                </div>
            )}

            {!hasData ? (
                <div
                    style={{
                        width: '100%',
                        height: 'calc(100vh - 80px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: '#c41e3a',
                    }}
                >
                    {intl.formatMessage({ id: 'openworld.loading' })}
                </div>
            ) : (
                <MapContainer
                    center={munsterCenter}
                    zoom={zoom}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <ZoomControl position="bottomright" />
                    {/* MapEventsHandler entfernt - POIs werden einmalig beim Mount geladen */}

                    {/* 1. Option Stadtplan */}
                    <LayersControl position="bottomleft">
                        <LayersControl.BaseLayer checked name="Stadtplan">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>

                        {/* 2. Option Satellit */}
                        <LayersControl.BaseLayer name="Satellit">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>

                        {/* 3. Option Dark Mode */}
                        <LayersControl.BaseLayer name="Dark Mode">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    {allMarkers.map((marker) => {
                        // Icon-Auswahl: Event -> Bike -> Standard
                        let icon: L.Icon | L.DivIcon = starIcon;
                        if (marker.source === 'event') icon = eventIcon;
                        else if (marker.source === 'bike') icon = bikeIcon;
                        
                        return (
                            <Marker key={marker.id} position={marker.position} icon={icon}>
                                <Popup>
                                    <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 'bold' }}>
                                            {marker.name}
                                        </h3>
                                        
                                        {marker.source === 'static' && marker.note ? (
                                            <p style={{ margin: '0 0 8px', fontSize: '14px' }}>{marker.note}</p>
                                        ) : null}

                                        {marker.source === 'event' && marker.poi ? (
                                            <div style={{ fontSize: '13px', color: '#555' }}>
                                                <p style={{ margin: '4px 0', fontWeight: '600', color: '#E53E3E' }}>
                                                    Veranstaltung
                                                </p>
                                                {marker.poi.types && marker.poi.types.length > 0 && (
                                                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                                                        {marker.poi.types.join(', ')}
                                                    </p>
                                                )}
                                                {(marker.poi.startDate || marker.poi.eventTime) && (
                                                    <div style={{ margin: '6px 0', padding: '8px', background: '#FFF5F5', borderRadius: '4px', borderLeft: '3px solid #E53E3E' }}>
                                                        {marker.poi.eventType && (
                                                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#E53E3E', fontSize: '13px' }}>
                                                                {marker.poi.eventType}
                                                            </p>
                                                        )}
                                                        {marker.poi.startDate && (
                                                            <p style={{ margin: '2px 0', fontWeight: '500', color: '#E53E3E' }}>
                                                                🕒 {new Date(marker.poi.startDate).toLocaleString('de-DE', {
                                                                    weekday: 'short',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })} Uhr
                                                            </p>
                                                        )}
                                                        {marker.poi.endDate && (
                                                            <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                                                                bis {new Date(marker.poi.endDate).toLocaleString('de-DE', {
                                                                    weekday: 'short',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })} Uhr
                                                            </p>
                                                        )}
                                                        {marker.poi.eventTime && !marker.poi.startDate && (
                                                            <p style={{ margin: '2px 0', fontWeight: '500', color: '#E53E3E' }}>
                                                                🕒 {marker.poi.eventTime}
                                                            </p>
                                                        )}
                                                        {marker.poi.eventDescription && (
                                                            <p style={{ margin: '6px 0 0 0', fontSize: '11px', lineHeight: '1.4', color: '#555', borderTop: '1px solid #FFE5E5', paddingTop: '6px' }}>
                                                                {marker.poi.eventDescription}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {marker.poi.description && (
                                                    <p style={{ margin: '8px 0', fontSize: '12px', lineHeight: '1.4', color: '#666' }}>
                                                        {marker.poi.description}
                                                    </p>
                                                )}
                                                {(marker.poi.street || marker.poi.postalCode) && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        📍 {marker.poi.street} {marker.poi.houseNumber}, {marker.poi.postalCode} {marker.poi.city}
                                                    </p>
                                                )}
                                                {marker.poi.website && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        🔗 <a href={marker.poi.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                                                            Website
                                                        </a>
                                                    </p>
                                                )}
                                                {(marker.poi.licenseType || marker.poi.copyright || marker.poi.source) && (
                                                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                                                        Datenportal Münsterland ({marker.poi.licenseType || 'Unbekannte Lizenz'})
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}

                                        {marker.source === 'bike' && marker.poi ? (
                                            <div style={{ fontSize: '13px', color: '#555' }}>
                                                {marker.poi.types && marker.poi.types.length > 0 && (
                                                    <p style={{ margin: '4px 0', fontWeight: '500' }}>
                                                        {marker.poi.types.join(', ')}
                                                    </p>
                                                )}
                                                {marker.poi.description && (
                                                    <p style={{ margin: '8px 0', fontSize: '12px', lineHeight: '1.4', color: '#666' }}>
                                                        {marker.poi.description}
                                                    </p>
                                                )}
                                                {(marker.poi.street || marker.poi.postalCode) && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        📍 {marker.poi.street} {marker.poi.houseNumber}, {marker.poi.postalCode} {marker.poi.city}
                                                    </p>
                                                )}
                                                {marker.poi.website && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        🔗 <a href={marker.poi.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                                                            Website
                                                        </a>
                                                    </p>
                                                )}
                                                {(marker.poi.licenseType || marker.poi.copyright || marker.poi.source) && (
                                                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                                                        Datenportal Münsterland ({marker.poi.licenseType || 'Unbekannte Lizenz'})
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}

                                        {marker.source === 'datenportal' && marker.poi ? (
                                            <div style={{ fontSize: '13px', color: '#555' }}>
                                                {marker.poi.types && marker.poi.types.length > 0 && (
                                                    <p style={{ margin: '4px 0', fontWeight: '500' }}>
                                                        {marker.poi.types.join(', ')}
                                                    </p>
                                                )}
                                                {marker.poi.description && (
                                                    <p style={{ margin: '8px 0', fontSize: '12px', lineHeight: '1.4', color: '#666' }}>
                                                        {marker.poi.description}
                                                    </p>
                                                )}
                                                {(marker.poi.street || marker.poi.postalCode) && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        📍 {marker.poi.street} {marker.poi.houseNumber}, {marker.poi.postalCode} {marker.poi.city}
                                                    </p>
                                                )}
                                                {marker.poi.website && (
                                                    <p style={{ margin: '4px 0' }}>
                                                        🔗 <a href={marker.poi.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                                                            Website
                                                        </a>
                                                    </p>
                                                )}
                                                {(marker.poi.licenseType || marker.poi.copyright || marker.poi.source) && (
                                                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                                                        Datenportal Münsterland ({marker.poi.licenseType || 'Unbekannte Lizenz'})
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}

                                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#999' }}>
                                        {marker.source === 'event' ? 'Veranstaltung (Datenportal)' : 
                                         marker.source === 'bike' ? 'Fahrradverleih (Datenportal)' :
                                         marker.source === 'datenportal' ? 'Datenportal Münsterland' : 
                                         'Lokale Daten'}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                    })}
                </MapContainer>
            )}
        </div>
    );
}