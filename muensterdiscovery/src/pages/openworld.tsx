import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Header from '../components/Header';
import pois from '../../data/POIs_Muenster_Discovery.json';
import stern from '../assets/supermario_stern.webp';

type POIProperties = {
    id: number;
    name: string;
    note?: string | null;
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
};

const starIcon = new L.Icon({
    iconUrl: stern,
    iconSize: [35, 35],      
    iconAnchor: [20, 20],    // Mitte des Bildes
    popupAnchor: [0, -20],   // Popup über dem Icon
    className: 'star-icon',
});

export default function OpenWorld() {
    const intl = useIntl();
    
    // Münster Koordinaten
    const munsterCenter: LatLngExpression = [51.9607, 7.6261];
    const zoom = 14;

    const features = useMemo(() => {
        const collection = pois as POICollection;
        return collection.features?.filter((f) => f.geometry?.type === 'Point') ?? [];
    }, []);

    const markers = useMemo(
        () =>
            features.map((feature, index) => {
                const [lon, lat] = feature.geometry.coordinates;
                return {
                    id: feature.properties.id ?? index,
                    name: feature.properties.name,
                    note: feature.properties.note,
                    position: [lat, lon] as LatLngExpression,
                };
            }),
        [features]
    );

    const hasData = markers.length > 0;

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Header />

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
                    zoomControl={false} // Zoom manuell hinzugefügt
                >
                    <ZoomControl position="bottomright" />

                    /* 1. Option Stadtplan */
                    <LayersControl position="bottomleft">
                        <LayersControl.BaseLayer checked name="Stadtplan">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>

                        // 2. Option Satellit
                        <LayersControl.BaseLayer name="Satellit">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>

                        // 3. Option Dark Mode
                        <LayersControl.BaseLayer name="Dark Mode">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>



                    </LayersControl>

                    {markers.map((poi) => (
                        <Marker key={poi.id} position={poi.position} icon={starIcon}>
                            <Popup>
                                <div style={{ minWidth: '180px' }}>
                                    <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>{poi.name}</h3>
                                    {poi.note ? (
                                        <p style={{ margin: 0, fontSize: '14px' }}>{poi.note}</p>
                                    ) : null}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}