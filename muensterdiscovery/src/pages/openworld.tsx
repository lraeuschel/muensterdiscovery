import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DivIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Header from '../components/Header';

// Custom Christmas Market Icon
const christmasIcon = new DivIcon({
    html: `<div style="
        background-color: #c41e3a;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <span style="
            transform: rotate(45deg);
            font-size: 18px;
        ">🎄</span>
    </div>`,
    className: 'custom-christmas-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

interface MarketProperties {
    NAME: string;
    LINK1_TXT: string;
    LINK1: string;
    RECHTSWERT: number;
    HOCHWERT: number;
}

interface MarketFeature {
    type: string;
    properties: MarketProperties;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}

interface GeoJSONFeatureCollection {
    type: string;
    features: MarketFeature[];
}

export default function OpenWorld() {
    const intl = useIntl();
    
    // Münster Koordinaten
    const munsterCenter: LatLngExpression = [51.9607, 7.6261];
    const zoom = 14;

    const [markets, setMarkets] = useState<MarketFeature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkets = async () => {
            console.log('🔄 Starte Laden der Weihnachtsmärkte vom WFS...');
            try {
                const url = 'https://www.stadt-muenster.de/ows/mapserv706/poiserv?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=weihnachtsmaerkte&OUTPUTFORMAT=GEOJSON&SRSNAME=EPSG:4326';
                console.log('📡 WFS-URL:', url);
                
                const response = await fetch(url);
                console.log('📥 Response Status:', response.status, response.statusText);
                console.log('📋 Content-Type:', response.headers.get('content-type'));
                
                if (response.ok) {
                    const text = await response.text();
                    console.log('📄 Response (erste 200 Zeichen):', text.substring(0, 200));
                    
                    const data: GeoJSONFeatureCollection = JSON.parse(text);
                    if (data.features && data.features.length > 0) {
                        setMarkets(data.features);
                        console.log('✅ ERFOLG: Dynamische Daten vom WFS geladen!');
                        console.log('📍 Anzahl Weihnachtsmärkte:', data.features.length);
                        console.log('🎄 Erster Markt:', data.features[0].properties.NAME);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.error('❌ Fehler beim Laden der Daten:', err);
            } finally {
                console.log('🏁 Lade-Vorgang abgeschlossen');
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                width: '100%', 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '18px',
                color: '#c41e3a'
            }}>
                🎄 {intl.formatMessage({ id: 'openworld.loading' })}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Header />
            <MapContainer 
                center={munsterCenter} 
                zoom={zoom} 
                style={{ width: '100%', height: '100%' }}
            >
                {/* OpenStreetMap Basemap */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* GeoJSON Markers für Weihnachtsmärkte */}
                {markets.map((market, index) => {
                    const position: LatLngExpression = [
                        market.geometry.coordinates[1],
                        market.geometry.coordinates[0]
                    ];
                    
                    return (
                        <Marker 
                            key={index} 
                            position={position}
                            icon={christmasIcon}
                        >
                            <Popup>
                                <div style={{
                                    fontFamily: 'Arial, sans-serif',
                                    minWidth: '200px'
                                }}>
                                    <h3 style={{
                                        color: '#c41e3a',
                                        marginTop: '0',
                                        marginBottom: '10px',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}>
                                        🎅 {market.properties.NAME}
                                    </h3>
                                    <a 
                                        href={market.properties.LINK1} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            backgroundColor: '#c41e3a',
                                            color: '#fff',
                                            padding: '8px 16px',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            transition: 'background-color 0.3s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a01830'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c41e3a'}
                                    >
                                        {intl.formatMessage({ id: 'openworld.more_info' })} →
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    )
}