import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
    Box,
    Heading,
    Text,
    Button
} from "@chakra-ui/react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    Polyline,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

import {
    getRouteById,
    getPOIsByRoute,
    addVisitedPOI,
    getCurrentUser,
    getCurrentUserProfile,
} from "../services/DatabaseConnection";

import type { Route, POI, User } from "../types";

// Leaflet Icons für POIs
const redIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
const greenIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function PlayRoute() {
    const intl = useIntl();
    const navigate = useNavigate();

    const { routeId } = useParams();
    const [route, setRoute] = useState<Route | null>(null);
    const [pois, setPOIs] = useState<POI[]>([]);
    const [visitedPOIs, setVisitedPOIs] = useState<number[]>([]);
    const [userLocation, setUserLocation] = useState<LatLngExpression | null>(
        null
    );
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Lade Route, POIs & User
    useEffect(() => {
        if (!routeId) return;

        async function loadData() {
            const fetchedRoute = await getRouteById(Number(routeId));
            setRoute(fetchedRoute);

            const fetchedPOIs = await getPOIsByRoute(Number(routeId));
            setPOIs(fetchedPOIs);

            const userId = (await getCurrentUser())?.id;
            if (!userId) return;
            const user = await getCurrentUserProfile(userId);
            setCurrentUser(user);
        }

        loadData();
    }, [routeId]);

    // Geolocation
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                console.log("Got user position:", position.coords.latitude, position.coords.longitude);
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.error("Error getting user position:", error);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // POI als besucht markieren
    async function markPOIAsVisited(poiId: number) {
        if (visitedPOIs.includes(poiId)) return;

        setVisitedPOIs((prev) => [...prev, poiId]);

        try {
            if (currentUser) await addVisitedPOI(currentUser.id, poiId);
            console.log(`POI ${poiId} marked as visited for user ${currentUser?.id}`);
        } catch (error) {
            console.error("Error marking POI as visited:", error);
        }
    }

    // Prüfen, ob Route abgeschlossen ist
    useEffect(() => {
        if (pois.length && visitedPOIs.length === pois.length) {
            setShowSuccess(true);
        }
    }, [visitedPOIs, pois]);

    if (!route) return <Text>Lade Route…</Text>;

    // Helfer: Prüfen, ob User nah genug am POI ist
    const isNearPOI = (poi: POI) => {
        if (!userLocation) return false;
        const distance = L.latLng(userLocation).distanceTo(
            L.latLng(poi.lat, poi.lon)
        );
        return distance < 50; // 50 Meter Reichweite
    };

    return (
        <Box w="100%" h="100vh" position="relative">
            {/* ===== HEADER ===== */}
            <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                <Heading size="md">{route.name}</Heading>
                <Text>{route.description}</Text>
            </Box>

            {/* ===== MAP ===== */}
            <Box w="100%" h="calc(100vh - 100px)">
                <MapContainer
                    center={userLocation || [51.9607, 7.6261]}
                    zoom={15}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route als Polyline */}
                    {route?.geoJSON &&
                        (() => {
                            const coords =
                                route.geoJSON.geometry?.coordinates ||
                                route.geoJSON.coordinates ||
                                [];
                            if (!coords.length) return null;
                            const latLngs: LatLngExpression[] = coords.map(
                                ([lng, lat]: [number, number]) => [lat, lng]
                            );
                            return (
                                <Polyline
                                    positions={latLngs}
                                    pathOptions={{ color: "#c41e3a", weight: 4, opacity: 0.7 }}
                                />
                            );
                        })()}

                    {/* POIs als Marker */}
                    {pois.map((poi) => {
                        const isVisited = visitedPOIs.includes(poi.id);
                        // Fallback für Dummy-POIs
                        const lat = poi.lat ?? 51.9607 + Math.random() * 0.01;
                        const lng = poi.lon ?? 7.6261 + Math.random() * 0.01;

                        return (
                            <Marker
                                key={poi.id}
                                position={[lat, lng]}
                                icon={new L.Icon({
                                    iconUrl: isVisited
                                        ? "/icons/poi-visited.svg"
                                        : "/icons/poi-unvisited.svg",
                                    iconSize: [30, 30],
                                    iconAnchor: [15, 30],
                                })}
                                eventHandlers={{
                                    click: () => {
                                        if (!isVisited && userLocation) {
                                            markPOIAsVisited(poi.id);
                                        }
                                    },
                                }}
                            >
                                <Popup>
                                    <Box>
                                        <Heading size="sm">{poi.name}</Heading>
                                        <Text fontSize="sm">{poi.info}</Text>
                                        {isVisited && (
                                            <Text fontSize="sm" color="green.600" mt={1}>
                                                ✅ Bereits besucht
                                            </Text>
                                        )}
                                    </Box>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Live User Location */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            icon={new L.Icon({
                                iconUrl: "/icons/user-location.svg",
                                iconSize: [30, 30],
                                iconAnchor: [15, 30],
                            })}
                        />
                    )}
                </MapContainer>

            </Box>

            {/* ===== SUCCESS OVERLAY ===== */}
            {visitedPOIs.length === pois.length && pois.length > 0 && (
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="100vw"
                    h="100vh"
                    bg="rgba(0,0,0,0.4)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={2000}
                >
                    <Box bg="white" p={6} borderRadius="lg" maxW="sm" w="full">
                        <Heading mb={4}>🎉 Geschafft!</Heading>
                        <Text mb={4}>Toll, du hast alle POIs dieser Route entdeckt!</Text>
                        <Button colorScheme="green" w="full" onClick={() => setVisitedPOIs([])}>
                            Schließen
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );

}
