import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
    Box,
    Heading,
    Text,
    Button,
    HStack
} from "@chakra-ui/react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    LayersControl,
    ZoomControl,
    useMap
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

import {
    getRouteById,
    getPOIsByRoute,
    addVisitedPOI,
    getCurrentUser,
    getCurrentUserProfile,
    addRouteCompletion
} from "../services/DatabaseConnection";
import CompLangHeader from "../components/CompLangHeader";
import type { Route, POI, User } from "../types";
import marker_grau from "../icons/marker_grau.svg";
import marker_rot from "../icons/marker_rot.svg";
import marker_orange from "../icons/marker_orange.svg";

const boxStyles = {
    position: "fixed" as const,
    top: "10px",
    zIndex: 1000,
    bg: "white",
    borderRadius: "full",
    p: 2,
    boxShadow: "md",
    left: "50%",
    transform: "translateX(-50%)",
    height: "50px",
    textAlign: "center",
    px: 4,
};

const markerVisitedPOI = new L.Icon({
    iconUrl: marker_grau,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const markerUnvisitedPOI = new L.Icon({
    iconUrl: marker_rot,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const markerUserLocation = new L.Icon({
    iconUrl: marker_orange,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

function FitRouteBounds({ route }: { route: Route | null }) {
    const map = useMap();

    useEffect(() => {
        if (!route) return;

        const coords =
            route.geoJSON?.geometry?.coordinates ||
            route.geoJSON?.coordinates;

        if (!Array.isArray(coords) || coords.length === 0) return;

        const latLngs = coords.map(
            ([lng, lat]: [number, number]) => L.latLng(lat, lng)
        );

        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [route, map]);

    return null;
}

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
    const [routeCompleted, setRouteCompleted] = useState(false);
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

    useEffect(() => {
        async function completeRouteFinished() {
            if (routeCompleted || !currentUser || !route || visitedPOIs.length !== pois.length) return;

            try {
                await addRouteCompletion(currentUser.id, route.id);
                setRouteCompleted(true);
                console.log(`Route ${route.id} marked as completed for user ${currentUser.id}`);
                setShowSuccess(true);
            } catch (error) {
                console.error("Error marking route as completed:", error);
            }
        }
        completeRouteFinished();
    }, [visitedPOIs, pois, currentUser, route, routeCompleted]);

    if (!route) return <Text>…</Text>;

    const getDistanceToPOI = (poi: POI): number | null => {
        if (!userLocation || poi.lat == null || poi.lon == null) return null;

        return L.latLng(userLocation).distanceTo(
            L.latLng(poi.lat, poi.lon)
        );
    };

    const isNearPOI = (poi: POI) => {
        const distance = getDistanceToPOI(poi);
        return distance !== null && distance <= 50;
    }

    return (
        <Box w="100%" h="100vh" position="relative">
            {/* ===== HEADER ===== */}
            <HStack display={"flex"}>
                <CompLangHeader />
                <Box {...boxStyles}>
                    <Heading size="md" textAlign="center">{route.name}</Heading>
                </Box>
            </HStack>
            {/* ===== MAP ===== */}
            <Box w="100%" h="100vh">
                <MapContainer
                    center={userLocation || [51.9607, 7.6261]}
                    zoom={15}
                    style={{ width: "100%", height: "100%" }}
                    zoomControl={false}
                    
                >
                    <ZoomControl position="bottomright" />
                    <FitRouteBounds route={route} />
                    {/* Karten-Layer Auswahl */}
                    <LayersControl position="bottomleft">
                        <LayersControl.BaseLayer checked name={intl.formatMessage({ id: "zoomcontrols.default" })}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>

                        {/* 2. Option Satellit */}
                        <LayersControl.BaseLayer name={intl.formatMessage({ id: "zoomcontrols.satellite" })}>
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>

                        {/* 3. Option Dark Mode */}
                        <LayersControl.BaseLayer name={intl.formatMessage({ id: "zoomcontrols.darkmode" })}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

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
                                    pathOptions={{ color: "#ffabb9ff", weight: 4, opacity: 0.7 }}
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
                                icon={isVisited ? markerVisitedPOI : markerUnvisitedPOI}
                            >
                                <Popup offset={[0, -20]}>
                                    <Box minW="200px">
                                        {/* Bereits besucht */}
                                        {isVisited && (
                                            <>
                                                <Heading size="sm">{poi.name}</Heading>
                                                <Text fontSize="sm" mt={1}>{poi.info}</Text>
                                                <Text fontSize="sm" color="green.600" mt={2}>
                                                    {intl.formatMessage({ id: "playroute.visited" })}
                                                </Text>
                                            </>
                                        )}

                                        {/* Noch nicht besucht */}
                                        {!isVisited && (
                                            <>
                                                {/* Zu weit weg */}
                                                {!isNearPOI(poi) && (
                                                    <>
                                                        <Heading size="sm">{poi.name}</Heading>
                                                        <Text fontSize="sm" mt={2}>
                                                            {intl.formatMessage({ id: "playroute.get_closer" })}
                                                        </Text>
                                                        {getDistanceToPOI(poi) !== null && (
                                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                                {intl.formatMessage({ id: "playroute.approx_distance" })}{Math.round(getDistanceToPOI(poi)!)} m
                                                            </Text>
                                                        )}
                                                    </>
                                                )}

                                                {/* Nah genug → abhaken */}
                                                {isNearPOI(poi) && (
                                                    <>
                                                        <Heading size="sm">{poi.name}</Heading>
                                                        <Text fontSize="sm" mt={1}>{poi.info}</Text>

                                                        <Button
                                                            mt={3}
                                                            size="sm"
                                                            colorScheme="green"
                                                            w="100%"
                                                            onClick={() => markPOIAsVisited(poi.id)}
                                                        >
                                                            {intl.formatMessage({ id: "playroute.mark_visited" })}
                                                        </Button>
                                                    </>
                                                )}
                                            </>
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
                            icon={markerUserLocation}
                        />
                    )}
                </MapContainer>

            </Box>

            {showSuccess && (
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
                    <Box
                        bg="white"
                        p={6}
                        borderRadius="lg"
                        maxW="sm"
                        w="full"
                        textAlign="center"
                    >
                        <Heading mb={3}>{intl.formatMessage({ id: "playroute.route_completed_header" })}</Heading>

                        <Text mb={5}>
                            {intl.formatMessage({ id: "playroute.route_completed_description" })}
                        </Text>

                        <Button
                            bg={"green"}
                            w="full"
                            onClick={() => navigate("/routeselection")}
                        >
                            {intl.formatMessage({ id: "playroute.back_to_routes" })}
                        </Button>
                    </Box>
                </Box>
            )}

        </Box>
    );

}
