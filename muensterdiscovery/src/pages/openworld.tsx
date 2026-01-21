import { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
//import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, VStack, Text, Heading, Spinner, Button } from "@chakra-ui/react";

import Header from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { getPOIs, getVisitedPOIs, getCurrentUser, addVisitedPOI } from "../services/DatabaseConnection";
import { fetchDatenportalPois } from "../api/datenportal";
import type { POI } from "../types";
import type { DatenportalPOI } from "../config/datenportal";

import marker_grau from "../icons/marker_grau.svg";
import marker_rot from "../icons/marker_rot.svg";
import marker_orange from "../icons/marker_orange.svg";

import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// --------------------------- ICONS ---------------------------
const markerVisitedPOI = L.icon({ iconUrl: marker_grau, iconSize: [30, 30], iconAnchor: [15, 30] });
const markerUnvisitedPOI = L.icon({ iconUrl: marker_rot, iconSize: [30, 30], iconAnchor: [15, 30] });
const markerUserLocation = L.icon({ iconUrl: marker_orange, iconSize: [30, 30], iconAnchor: [15, 30] });

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
};

const redClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();

  // Dark → brighter red
  let bgColor = "rgb(220, 40, 40)";       // small clusters
  if (count >= 10) bgColor = "rgb(245, 85, 85)"; // medium clusters
  if (count >= 30) bgColor = "rgb(255, 150, 150)"; // large clusters

  return L.divIcon({
    html: `
      <div style="
        background:${bgColor};
        color:white;
        width:42px;
        height:42px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
        font-size:14px;
      ">
        ${count}
      </div>
    `,
    className: "red-cluster",
    iconSize: L.point(42, 42),
    iconAnchor: [21, 21],
  });
};




// Event Icon (SVG)
const eventIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#FFF5F5"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <text x="12" y="18" text-anchor="middle" font-size="8" fill="#E53E3E" font-weight="bold">📅</text>
        </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: "event-icon",
});

// Bike Icon
// const bikeIcon = new L.DivIcon({
//     html: `<div style="font-size:28px;text-align:center;">🚲</div>`,
//     iconSize: [32, 32],
//     iconAnchor: [16, 32],
//     popupAnchor: [0, -32],
//     className: "bike-icon",
// });

// --------------------------- HOOK: Datenportal POIs ---------------------------
function useDatenportalPOIs() {
    const [datenportalPOIs, setDatenportalPOIs] = useState<DatenportalPOI[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const pois = await fetchDatenportalPois({ center: { lat: 51.9607, lng: 7.6261 }, radiusKm: 50, signal: undefined });
                if (mounted) setDatenportalPOIs(pois);
            } catch (err) {
                console.error(err);
                setError("Datenportal POIs konnten nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    return { datenportalPOIs, isLoading, error };
}

// --------------------------- FLY TO USER ---------------------------
// function FlyToUser({ position }: { position: LatLngExpression }) {
//     const map = useMap();
//     map.flyTo(position, 16);
//     return null;
// }

// --------------------------- MAIN COMPONENT ---------------------------
export default function OpenWorld() {
    const intl = useIntl();
    //const navigate = useNavigate();
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    <Box data-lang={currentLang}></Box>
    const [pois, setPois] = useState<POI[]>([]);
    const [visitedPOIs, setVisitedPOIs] = useState<number[]>([]);
    const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
    const [user, setUser] = useState<any>(null);

    const { datenportalPOIs, isLoading } = useDatenportalPOIs();

    useEffect(() => onCurrentLanguageChange((lang) => setCurrentLang(lang)), []);
    useEffect(() => { getPOIs().then(setPois).catch(console.error); }, []);
    useEffect(() => { getCurrentUser().then(u => setUser(u)); }, []);
    useEffect(() => {
        if (user) getVisitedPOIs(user.id).then(v => setVisitedPOIs(v.map(p => p.id)));
    }, [user]);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watcher = navigator.geolocation.watchPosition(
            pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            err => console.error(err),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const munsterCenter: LatLngExpression = [51.9607, 7.6261];
    const zoom = 14;

    // POI als besucht markieren
    async function markPOIAsVisited(poiId: number) {
        if (!user || visitedPOIs.includes(poiId)) return;
        try {
            console.log("Marking POI as visited:", poiId);
            await addVisitedPOI(user.id, poiId);
            setVisitedPOIs(prev => [...prev, poiId]);
        } catch (err) {
            console.error(err);
        }
    }

    const getDistanceToPOI = (poi: POI) => {
        if (!userLocation) return null;
        return L.latLng(userLocation).distanceTo(L.latLng(poi.lat, poi.lon));
    };

    const isNearPOI = (poi: POI) => {
        const dist = getDistanceToPOI(poi);
        return dist !== null && dist <= 50;
    };
    const markers = useMemo(() => {
        const standardMarkers = pois.map(poi => ({
            id: `poi-${poi.id}`,
            poi,
            name: poi.name,
            info: intl.formatMessage({ id: `poi.${poi.id}` }),
            position: [poi.lat, poi.lon] as LatLngExpression,
            icon: visitedPOIs.includes(poi.id) ? markerVisitedPOI : markerUnvisitedPOI,
            type: "poi",
            image: poi.image_path
        }));

        console.log(intl.messages["poi.94"]);


        const datenportalMarkers = datenportalPOIs.map(poi => {
            let icon = eventIcon;
            let type: "event" | "bike" | "datenportal" = "datenportal";
            if (poi.startDate || poi.endDate || poi.eventTime) type = "event";
            else if (poi.types?.some(t => t.toLowerCase().includes("fahrradverleih"))) type = "bike";

            return {
                id: `dp-${poi.id}`,
                poi,
                name: poi.name,
                position: [poi.lat, poi.lng] as LatLngExpression,
                icon,
                type
            };
        });

        return [...standardMarkers, ...datenportalMarkers];
    }, [pois, visitedPOIs, datenportalPOIs, intl]);

    return (
        <Box w="100%" h="100vh" position="relative">
            <Header />

            {isLoading && <Box position="absolute" top="80px" right="20px" zIndex={1000} bg="white" p={2} borderRadius="md" shadow="sm"><Spinner size="sm" mr={2} /> Lade Events...</Box>}

            {!markers.length ? (
                <Box w="100%" h="calc(100vh - 80px)" display="flex" justifyContent="center" alignItems="center">
                    <Text color="red.500">{intl.formatMessage({ id: "openworld.loading" })}</Text>
                </Box>
            ) : (
                <MapContainer center={munsterCenter} zoom={zoom} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                    <ZoomControl position="bottomright" />

                    <LayersControl position="bottomleft">
                        <LayersControl.BaseLayer checked name={intl.formatMessage({ id: "zoomcontrols.default" })}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name={intl.formatMessage({ id: "zoomcontrols.satellite" })}>
                            <TileLayer
                                attribution='&copy; Esri'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name={intl.formatMessage({ id: "zoomcontrols.darkmode" })}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    {userLocation && <Marker position={userLocation} icon={markerUserLocation}><Popup offset={[0, -20]}>{intl.formatMessage({ id: "openworld.user_location" })}</Popup></Marker>}

                    <MarkerClusterGroup
                        iconCreateFunction={redClusterIcon}
                        chunkedLoading
                        spiderfyOnMaxZoom
                        showCoverageOnHover={false}
                        zoomToBoundsOnClick
                        maxClusterRadius={50}
                    >
                        {markers.map(marker => (
                            <Marker key={marker.id} position={marker.position} icon={marker.icon}>
                                <Popup offset={[0, -20]}>
                                    <VStack align="start" gap={2} minW="200px" maxW="300px">
                                        <Heading size="sm">{marker.name}</Heading>

                                        {marker.type === "poi" && marker.image && (
                                            <Box w="100%" h="150px">
                                                <img src={getImageUrl(marker.image)} alt={marker.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                                            </Box>
                                        )}

                                        {marker.type === "poi" && marker.info && <Text fontSize="sm">{marker.info}</Text>}

                                        {marker.type === "poi" && marker.poi && (
                                            <>
                                                {visitedPOIs.includes(marker.poi.id) ? (
                                                    <Text fontSize="sm" color="green.600">{intl.formatMessage({ id: "openworld.visited" })}</Text>
                                                ) : isNearPOI(marker.poi) ? (
                                                    <Button mt={2} colorScheme="green" w="100%" size="sm" onClick={() => markPOIAsVisited(marker.poi.id)}>
                                                        {intl.formatMessage({ id: "openworld.mark_visited" })}
                                                    </Button>
                                                ) : (
                                                    getDistanceToPOI(marker.poi) !== null && <Text fontSize="xs" color="gray.500">
                                                        {intl.formatMessage({ id: "openworld.approx_distance" })}{Math.round(getDistanceToPOI(marker.poi)!)} m
                                                    </Text>
                                                )}
                                            </>
                                        )}

                                        {marker.type === "event" && marker.poi && (
                                            <VStack align="start" gap={1}>
                                                <Text fontSize="sm" color="red.500" fontWeight="bold">Veranstaltung</Text>
                                                {"startDate" in marker.poi && marker.poi.startDate && (
                                                    <Text fontSize="xs">Start: {new Date(marker.poi.startDate).toLocaleString()}</Text>
                                                )}

                                                {"endDate" in marker.poi && marker.poi.endDate && (
                                                    <Text fontSize="xs">Ende: {new Date(marker.poi.endDate).toLocaleString()}</Text>
                                                )}
                                            </VStack>
                                        )}

                                        {marker.type === "bike" && marker.poi && (
                                            <Text fontSize="sm">Fahrradverleih</Text>
                                        )}

                                    </VStack>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            )}
        </Box>
    );
}
