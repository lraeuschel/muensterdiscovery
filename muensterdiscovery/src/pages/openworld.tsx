import { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    LayersControl
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    Box,
    VStack,
    Text,
    Heading,
    Spinner,
    Button
} from "@chakra-ui/react";

import Header from "../components/CompLangHeader";
import {
    currentLanguage,
    onCurrentLanguageChange
} from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";

import {
    getPOIs,
    getVisitedPOIs,
    getCurrentUser,
    addVisitedPOI
} from "../services/DatabaseConnection";
import { fetchDatenportalPois } from "../api/datenportal";

import type { POI } from "../types";
import type { DatenportalPOI } from "../config/datenportal";

import marker_grau from "../icons/marker_grau.svg";
import marker_rot from "../icons/marker_rot.svg";
import marker_orange from "../icons/marker_orange.svg";

import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// ---------------- ICONS ----------------
const markerVisitedPOI = L.icon({
    iconUrl: marker_grau,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
const markerUnvisitedPOI = L.icon({
    iconUrl: marker_rot,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
const markerUserLocation = L.icon({
    iconUrl: marker_orange,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// ---------------- IMAGES FROM SUPABASE ---------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
};

// ---------------- CLUSTER ICONS ----------------

const createClusterIcon =
    (variant: "red" | "gray") =>
        (cluster: any) => {
            const count = cluster.getChildCount();

            let bgColor =
                variant === "red"
                    ? "rgb(197, 48, 48)"
                    : "rgb(160, 174, 192)";

            if (count >= 10) {
                bgColor =
                    variant === "red"
                        ? "rgb(229, 62, 62)"
                        : "rgb(203, 213, 224)";
            }

            if (count >= 30) {
                bgColor =
                    variant === "red"
                        ? "rgb(254, 178, 178)"
                        : "rgb(226, 232, 240)";
            }

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
                className: "custom-cluster",
                iconSize: [42, 42],
                iconAnchor: [21, 21]
            });
        };


// ---------------- EVENT ICON ----------------
const eventIcon = new L.DivIcon({
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#FFF5F5" stroke="#E53E3E" stroke-width="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="#E53E3E"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="#E53E3E"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="#E53E3E"/>
        <text x="12" y="18" text-anchor="middle" font-size="8" fill="#E53E3E">📅</text>
    </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// ---------------- DATENPORTAL HOOK ----------------
function useDatenportalPOIs() {
    const [datenportalPOIs, setDatenportalPOIs] = useState<DatenportalPOI[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const pois = await fetchDatenportalPois({
                    center: { lat: 51.9607, lng: 7.6261 },
                    radiusKm: 50,
                    signal: undefined
                });
                if (mounted) setDatenportalPOIs(pois);
            } finally {
                setIsLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    return { datenportalPOIs, isLoading };
}

// ---------------- MAIN ----------------
export default function OpenWorld() {
    const intl = useIntl();
    const [currentLang, setCurrentLang] =
        useState<LanguageType>(currentLanguage);

    const [pois, setPois] = useState<POI[]>([]);
    const [visitedPOIsIDs, setVisitedPOIsIDs] = useState<{id: number, visited: Date}[]>([]);
    const [userLocation, setUserLocation] =
        useState<LatLngExpression | null>(null);
    const [user, setUser] = useState<any>(null);

    const { datenportalPOIs, isLoading } = useDatenportalPOIs();

    useEffect(() => onCurrentLanguageChange(setCurrentLang), []);
    useEffect(() => {
        getPOIs().then(setPois);
    }, []);
    useEffect(() => {
        getCurrentUser().then(setUser);
    }, []);
    useEffect(() => {
        if (user)
            getVisitedPOIs(user.id).then(v =>
                setVisitedPOIsIDs(v.map(p => ({id: p.id, visited: new Date(p.visited)})))
            );
    }, [user]);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watcher = navigator.geolocation.watchPosition(pos =>
            setUserLocation([pos.coords.latitude, pos.coords.longitude])
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const munsterCenter: LatLngExpression = [51.9607, 7.6261];

    async function markPOIAsVisited(poiId: number) {
        if (!user || visitedPOIsIDs.some(v => v.id === poiId)) return;
        await addVisitedPOI(user.id, poiId);
        setVisitedPOIsIDs(prev => [...prev, {id: poiId, visited: new Date()}]);
    }

    const getDistanceToPOI = (poi: POI) =>
        userLocation
            ? L.latLng(userLocation).distanceTo(
                L.latLng(poi.lat, poi.lon)
            )
            : null;

    const isNearPOI = (poi: POI) =>
        getDistanceToPOI(poi) !== null &&
        getDistanceToPOI(poi)! <= 50;

    // ---------------- MARKERS ----------------
    const { visitedMarkers, unvisitedMarkers, datenportalMarkers } =
        useMemo(() => {
            const visited: any[] = [];
            const unvisited: any[] = [];
            const datenportal: any[] = [];

            pois.forEach(poi => {
                const base = {
                    id: `poi-${poi.id}`,
                    poi,
                    name: poi.name,
                    info: intl.formatMessage({ id: `poi.${poi.id}` }),
                    position: [poi.lat, poi.lon] as LatLngExpression,
                    image: poi.image_path
                };


                if (visitedPOIsIDs.some(v => v.id === poi.id))
                    visited.push({
                        ...base,
                        icon: markerVisitedPOI
                    });
                else
                    unvisited.push({
                        ...base,
                        icon: markerUnvisitedPOI
                    });
            });

            datenportalPOIs.forEach(poi =>
                datenportal.push({
                    id: `dp-${poi.id}`,
                    poi,
                    name: poi.name,
                    position: [poi.lat, poi.lng] as LatLngExpression,
                    icon: eventIcon,
                    type: "event"
                })
            );

            return {
                visitedMarkers: visited,
                unvisitedMarkers: unvisited,
                datenportalMarkers: datenportal
            };
        }, [pois, visitedPOIsIDs, datenportalPOIs, intl]);

    // ---------------- RENDER ----------------
    return (
        <Box w="100%" h="100vh">
            <Header />

            {isLoading && (
                <Box
                    position="absolute"
                    top="80px"
                    right="20px"
                    bg="white"
                    p={2}
                    borderRadius="md"
                >
                    <Spinner size="sm" mr={2} />
                    Lade Events…
                </Box>
            )}

            <MapContainer
                center={munsterCenter}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />

                <LayersControl position="bottomleft" key={currentLang}>
                    <LayersControl.BaseLayer
                        checked
                        name={intl.formatMessage({
                            id: "zoomcontrols.default"
                        })}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer
                        name={intl.formatMessage({
                            id: "zoomcontrols.satellite"
                        })}
                    >
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer
                        name={intl.formatMessage({
                            id: "zoomcontrols.darkmode"
                        })}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={markerUserLocation}
                    >
                        <Popup>
                            {intl.formatMessage({
                                id: "openworld.user_location"
                            })}
                        </Popup>
                    </Marker>
                )}

                {/* VISITED */}
                <MarkerClusterGroup iconCreateFunction={createClusterIcon("gray")}>
                    {visitedMarkers.map(m => (
                        <Marker key={m.id} position={m.position} icon={m.icon}>
                            <Popup>
                                <VStack align="start" gap={2} minW="200px" maxW="300px">
                                    <Heading size="sm">{m.name}</Heading>

                                    {m.image && (
                                        <Box w="100%" h="150px">
                                            <img
                                                src={getImageUrl(m.image)}
                                                alt={m.name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                            />
                                        </Box>
                                    )}

                                    {m.info && <Text fontSize="sm">{m.info}</Text>}

                                    <Text fontSize="sm" color="green.600">
                                        {intl.formatMessage({ id: "openworld.visited_at" })} {visitedPOIsIDs.find(v => v.id === m.poi.id)?.visited.toLocaleDateString()},
                                        {" "}{visitedPOIsIDs.find(v => v.id === m.poi.id)?.visited.toLocaleTimeString()}
                                    </Text>
                                </VStack>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>


                {/* UNVISITED */}
                <MarkerClusterGroup
                    iconCreateFunction={createClusterIcon("red")}
                >
                    {unvisitedMarkers.map(m => (
                        <Marker
                            key={m.id}
                            position={m.position}
                            icon={m.icon}
                        >
                            <Popup>
                                <Heading size="md">{m.name}</Heading>
                                {m.image && (
                                    <Box w="100%" h="150px" mb={2}>
                                        <img
                                            src={getImageUrl(m.image)}
                                            alt={m.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                        />
                                    </Box>
                                )}
                                {m.info && <Text fontSize="sm">{m.info}</Text>}
                                {isNearPOI(m.poi) ? (
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() =>
                                            markPOIAsVisited(m.poi.id)
                                        }
                                    >
                                        {intl.formatMessage({
                                            id: "openworld.mark_visited"
                                        })}
                                    </Button>
                                ) : (
                                    getDistanceToPOI(m.poi) && (
                                        <Text fontSize="xs" color="gray.500">
                                            {intl.formatMessage({ id: "openworld.approx_distance" })}{" "}
                                            {Math.round(
                                                getDistanceToPOI(m.poi)!
                                            )}{" "}
                                            m
                                        </Text>
                                    )
                                )}
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>

                {/* EVENTS */}
                <MarkerClusterGroup>
                    {datenportalMarkers.map(m => (
                        <Marker
                            key={m.id}
                            position={m.position}
                            icon={m.icon}
                        >
                            <Popup>
                                <Heading size="sm">{m.name}</Heading>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </Box>
    );
}
