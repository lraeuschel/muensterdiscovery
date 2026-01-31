import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import {
    Box,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    Flex,
    Badge,
    IconButton,
    Card,
    Progress,
    Alert,
    Skeleton,
    useDisclosure,
    // SkeletonText removed to avoid type errors
} from "@chakra-ui/react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    ZoomControl,
    useMap,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

import {
    getRouteById,
    getPOIsByRoute,
    addVisitedPOI,
    getCurrentUser,
    getCurrentUserProfile,
    addRouteCompletion,
    checkAndUnlockPoiAchievements,
    checkAndUnlockRouteAchievements,
} from "../services/DatabaseConnection";
import CompLangHeader from "../components/CompLangHeader";
import AchievementUnlockModal from "../components/AchievementUnlock";
import {
    onCurrentLanguageChange,
    currentLanguage,
    type LanguageType,
} from "../components/languageSelector";
import type { Route, POI, User } from "../types";

import marker_grau from "../icons/marker_grau.svg";
import marker_rot from "../icons/marker_rot.svg";
import marker_orange from "../icons/marker_orange.svg";

// Icons
import {
    IoMdArrowBack,
    IoMdCheckmarkCircle,
    IoMdNavigate,
    IoMdLock,
    IoMdWarning,
    IoMdClose,
} from "react-icons/io";
import { FaMapMarkedAlt, FaSatelliteDish, FaMap } from "react-icons/fa";
import { MdRadar } from "react-icons/md";
import { BsPersonStanding } from "react-icons/bs";
import RideyChat, { type RideyChatRef } from "../components/RideyChat";

// --- OSRM Types & Config ---
const OSRM_BASE = "https://routing.openstreetmap.de/routed-car/route/v1/driving";

type OsrmStep = {
    distance: number;
    duration: number;
    name: string;
    maneuver: {
        type: string;
        modifier?: string;
        location: [number, number]; // [lon, lat]
    };
};

type OsrmRouteResponse = {
    routes: Array<{
        distance: number;
        duration: number;
        geometry: { coordinates: [number, number][] }; // [lon, lat]
        legs: Array<{ steps: OsrmStep[] }>;
    }>;
};

const routeColors: Record<string, string> = {
    muenster_history: "#c41e3a",
    muenster_fair: "#ff6b6b",
    muenster_art: "#4ecdc4",
    muenster_architecture: "#45b7d1",
    muenster_kreuzviertel: "#f9ca24",
    muenster_media: "#6c5ce7",
    muenster_hiddengems: "#fdcb6e",
};

// --- Custom Markers ---
const markerVisitedPOI = new L.Icon({
    iconUrl: marker_grau,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const markerUnvisitedPOI = new L.Icon({
    iconUrl: marker_rot,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// Larger marker for the nearest POI
const markerNearestPOI = new L.Icon({
    iconUrl: marker_rot,
    iconSize: [45, 45], // 50% larger
    iconAnchor: [22, 45],
    popupAnchor: [0, -45],
});

const markerUserLocation = new L.Icon({
    iconUrl: marker_orange,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// --- Helper Components ---

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
};

function FitRouteBounds({ route }: { route: Route | null }) {
    const map = useMap();

    useEffect(() => {
        if (!route) return;

        const rawCoords =
            route.geoJSON?.geometry?.coordinates || route.geoJSON?.coordinates;

        if (!Array.isArray(rawCoords) || rawCoords.length === 0) return;

        const validPoints = rawCoords.filter(
            (pt: any) =>
                Array.isArray(pt) &&
                pt.length >= 2 &&
                typeof pt[0] === "number" &&
                typeof pt[1] === "number"
        );

        if (validPoints.length === 0) return;

        const latLngs = validPoints.map(([lng, lat]: [number, number]) =>
            L.latLng(lat, lng)
        );
        const bounds = L.latLngBounds(latLngs);

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
}

function ZoomToUserOnNavigate({
    navTarget,
    userLocation,
}: {
    navTarget: POI | null;
    userLocation: [number, number] | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!navTarget) return; // nur wenn "Navigieren" aktiv ist
        if (!userLocation) return;

        // Zoom auf Level 17
        map.flyTo(userLocation, 17, {
            animate: true,
            duration: 0.8,
        });
    }, [navTarget, userLocation, map]);

    return null;
}

export default function PlayRoute() {
    const intl = useIntl();
    const navigate = useNavigate();
    const { routeId } = useParams();

    // Achievement Unlocking
    const [newAchievement, setNewAchievement] = useState<any>(null);
    const { open, onOpen, onClose } = useDisclosure();

    // Data State
    const [route, setRoute] = useState<Route | null>(null);
    const [pois, setPOIs] = useState<POI[]>([]);
    const [visitedPOIs, setVisitedPOIs] = useState<number[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [routeCompleted, setRouteCompleted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // New State: Cooldown to prevent double clicking multiple POIs
    const [collectingCooldown, setCollectingCooldown] = useState(false);

    // Error State
    const [geoError, setGeoError] = useState<string | null>(null);

    // UI State
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const rideyChatRef = useRef<RideyChatRef>(null);

    // Navigation State
    const [navTarget, setNavTarget] = useState<POI | null>(null);
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState<string | null>(null);
    const [navSteps, setNavSteps] = useState<OsrmStep[]>([]);
    const [navLine, setNavLine] = useState<LatLngExpression[]>([]);

    const mapRef = useRef<L.Map | null>(null);
    const muensterCenter: LatLngExpression = [51.9607, 7.6261];

    const zoomToUserLocation = () => {
        if (!mapRef.current) return;
        if (userLocation) {
            mapRef.current.flyTo(userLocation, 16);
        }
    };

    const zoomToRouteBounds = () => {
        if (!mapRef.current || !route) return;
        const coords = route.geoJSON?.geometry?.coordinates || route.geoJSON?.coordinates;
        if (!Array.isArray(coords) || coords.length === 0) return;
        const latLngs = coords.map(([lng, lat]: [number, number]) => L.latLng(lat, lng));
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.flyToBounds(bounds, { padding: [50, 50] });
    };

    // --- Logic Helpers ---

    const getDistanceToPOI = (poi: POI): number | null => {
        if (!userLocation || poi.lat == null || poi.lon == null) return null;
        return L.latLng(userLocation).distanceTo(L.latLng(poi.lat, poi.lon));
    };

    const isNearPOI = (poi: POI) => {
        const distance = getDistanceToPOI(poi);
        return distance !== null && distance <= 50;
    };

    // Identify the TWO nearest unvisited POIs
    const nearestTargets = useMemo(() => {
        if (!userLocation || pois.length === 0) return [];

        // Filter unvisited
        const unvisited = pois.filter((p) => !visitedPOIs.includes(p.id));

        if (unvisited.length === 0) return [];

        // Filter valid coordinates
        const validUnvisited = unvisited.filter(
            (p) => typeof p.lat === "number" && typeof p.lon === "number"
        );

        if (validUnvisited.length === 0) return [];

        // Map with distances
        const withDist = validUnvisited.map((p) => ({
            poi: p,
            distance: getDistanceToPOI(p) || Infinity,
        }));

        // Sort by distance (ascending)
        withDist.sort((a, b) => a.distance - b.distance);

        // Return top 2
        return withDist.slice(0, 2);
    }, [userLocation, pois, visitedPOIs]);

    const closestTarget = nearestTargets.length > 0 ? nearestTargets[0] : null;

    const activeColor = useMemo(() => {
        if (!route) return "orange.500";
        const rId =
            route.geoJSON?.properties?.id ||
            route.name.toLowerCase().replace(/\s+/g, "_");
        return routeColors[rId] || "orange.500";
    }, [route]);

    // --- OSRM Navigation Fetcher ---
    async function fetchOsrmRoute(from: [number, number], to: POI) {
        setNavLoading(true);
        setNavError(null);

        try {
            const [fromLat, fromLon] = from;
            const url =
                `${OSRM_BASE}/${fromLon},${fromLat};${to.lon},${to.lat}` +
                `?steps=true&overview=full&geometries=geojson`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Routing failed (${res.status})`);

            const data = (await res.json()) as OsrmRouteResponse;
            const r = data.routes?.[0];

            if (!r) throw new Error("No route returned");

            // line
            const line: LatLngExpression[] = (r.geometry.coordinates || [])
                .filter(
                    (c) =>
                        Array.isArray(c) &&
                        typeof c[0] === "number" &&
                        typeof c[1] === "number"
                )
                .map(([lon, lat]) => [lat, lon] as LatLngExpression);

            setNavLine(line);

            // steps
            const steps = r.legs?.[0]?.steps ?? [];
            setNavSteps(steps);
        } catch (e: any) {
            console.error("OSRM Error:", e);
            setNavError(e?.message ?? "Routing error");
            setNavLine([]);
            setNavSteps([]);
        } finally {
            setNavLoading(false);
        }
    }

    // --- Helper: Format Step Instruction ---
    function formatStep(step: OsrmStep) {
        const mod = step.maneuver.modifier ?? "none";
        const type = step.maneuver.type ?? "unknown";

        // Map to translation keys
        let actionId = "playroute.nav.action.continue";
        if (type === "arrive") actionId = "playroute.nav.action.arrive";
        else if (type === "turn" && mod.includes("left"))
            actionId = "playroute.nav.action.turn_left";
        else if (type === "turn" && mod.includes("right"))
            actionId = "playroute.nav.action.turn_right";

        // We use a fallback if translation key is missing in dev
        const actionText = intl.formatMessage({
            id: actionId,
            defaultMessage: type,
        });
        const streetText =
            step.name ||
            intl.formatMessage({
                id: "playroute.nav.unnamed_road",
                defaultMessage: "Road",
            });
        const distVal = Math.max(1, Math.round(step.distance));

        return intl.formatMessage(
            {
                id: "playroute.nav.instruction",
                defaultMessage: "{action} in {distance}m on {street}",
            },
            {
                action: actionText,
                distance: distVal,
                street: streetText,
            }
        );
    }

    // --- Effects ---

    useEffect(() => {
        return onCurrentLanguageChange((lang) => setCurrentLang(lang));
    }, []);

    useEffect(() => {
        if (!routeId) return;
        async function loadData() {
            try {
                const fetchedRoute = await getRouteById(Number(routeId));
                setRoute(fetchedRoute);
                const fetchedPOIs = await getPOIsByRoute(Number(routeId));
                setPOIs(fetchedPOIs);

                const userId = (await getCurrentUser())?.id;
                if (userId) {
                    const user = await getCurrentUserProfile(userId);
                    setCurrentUser(user);
                }
            } catch (err) {
                console.error("Failed to load route data", err);
            }
        }
        loadData();
    }, [routeId]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoError("Geolocation is not supported by your browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
                setGeoError(null);
            },
            (error) => {
                console.error("Error getting pos:", error);
                if (error.code === 1) {
                    setGeoError(
                        "Location permission denied. Please enable it in browser settings."
                    );
                } else if (error.code === 2) {
                    setGeoError("Location unavailable.");
                } else if (error.code === 3) {
                    setGeoError("Location request timed out.");
                }
            },
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Update Navigation when User Location changes (if navigating)
    useEffect(() => {
        if (!navTarget) return;
        if (!userLocation) return;
        if (typeof navTarget.lat !== "number" || typeof navTarget.lon !== "number")
            return;

        // Simple debounce/throttle could be added here if needed
        fetchOsrmRoute(userLocation, navTarget);
    }, [navTarget, userLocation]);

    useEffect(() => {
        if (
            pois.length > 0 &&
            visitedPOIs.length === pois.length &&
            !routeCompleted
        ) {
            setShowSuccess(true);
        }
    }, [visitedPOIs, pois, routeCompleted]);

    async function markPOIAsVisited(poiId: number) {
        if (visitedPOIs.includes(poiId)) return;
        if (collectingCooldown) return; // Prevent double clicks

        setCollectingCooldown(true); // Start cooldown

        setVisitedPOIs((prev) => [...prev, poiId]);

        // Stop navigation if we just visited the target
        if (navTarget && navTarget.id === poiId) {
            setNavTarget(null);
            setNavLine([]);
            setNavSteps([]);
        }

        try {
            if (currentUser) {
                await addVisitedPOI(currentUser.id, poiId);

                // Check for POI Achievements
                const unlockedList = await checkAndUnlockPoiAchievements(currentUser.id);

                // Wenn die Liste Einträge hat -> Modal öffnen!
                if (unlockedList && unlockedList.length > 0) {
                    // Wir nehmen das erste oder wichtigste Achievement für die Anzeige
                    setNewAchievement(unlockedList[0]);
                    onOpen();
                }
            }
        } catch (error) {
            console.error("Error marking POI:", error);
        } finally {
            // Cooldown: Warte 2 Sekunden, bevor der nächste POI erscheinen darf
            setTimeout(() => {
                setCollectingCooldown(false);
            }, 2000);
        }
    }

    useEffect(() => {
        async function finalizeRoute() {
            if (
                !routeCompleted &&
                pois.length > 0 &&
                visitedPOIs.length === pois.length &&
                currentUser &&
                route
            ) {
                try {
                    await addRouteCompletion(currentUser.id, route.id).catch(e => console.warn("Route completion warn:", e.message));
                    setRouteCompleted(true);
                    setShowSuccess(true);

                    // Check for Route Achievements
                    const unlockedList = await checkAndUnlockRouteAchievements(currentUser.id);
                    console.log("Unlocked Route Achievements:", unlockedList);
                    if (unlockedList && unlockedList.length > 0) {
                        // Wir zeigen das erste gefundene an
                        setNewAchievement(unlockedList[0]);
                        console.log("Opening Achievement Modal for route achievement");
                    }

                } catch (err) {
                    console.error("Error completing route:", err);
                }
            }
        }
        finalizeRoute();
    }, [visitedPOIs, pois, currentUser, route, routeCompleted]);

    if (!route)
        return (
            <Box p={10}>
                {intl.formatMessage({ id: "playroute.loading_mission" })}
            </Box>
        );

    const progressValue =
        pois.length > 0 ? (visitedPOIs.length / pois.length) * 100 : 0;

    // --- MANUAL COORDINATE TRANSFORMATION ---
    const rawCoords =
        route?.geoJSON?.geometry?.coordinates || route?.geoJSON?.coordinates;

    const polylinePositions: LatLngExpression[] = [];

    if (Array.isArray(rawCoords)) {
        for (const coord of rawCoords) {
            if (
                Array.isArray(coord) &&
                coord.length >= 2 &&
                typeof coord[0] === "number" &&
                !isNaN(coord[0]) &&
                typeof coord[1] === "number" &&
                !isNaN(coord[1])
            ) {
                polylinePositions.push([coord[1], coord[0]] as LatLngExpression);
            }
        }
    }

    // Define loading bar styles inline for simplicity
    const loadingBarStyle = {
        width: "35%",
        background: `linear-gradient(90deg, rgba(0,0,0,0.05), ${activeColor}, rgba(0,0,0,0.05))`,
        animation: "navBar 1.5s ease-in-out infinite",
        height: "100%",
        borderRadius: "99px",
    };

    const keyframesStyle = `
    @keyframes navBar {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(350%); }
    }
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .custom-popup .leaflet-popup-content {
      margin: 0;
      width: 300px !important;
    }
    .custom-popup .leaflet-popup-tip {
      background: white;
    }
  `;

    const handleSuccessConfirm = () => {
        // 1. Success Overlay schließen
        setShowSuccess(false);

        // 2. Prüfen: Haben wir ein Achievement in der Warteschlange?
        if (newAchievement) {
            // Ja -> Achievement Modal öffnen
            onOpen();
        } else {
            // Nein -> Direkt zur Auswahl zurück
            navigate("/routeselection");
        }
    };

    const handleAchievementClose = () => {
        // Wenn das Achievement Modal geschlossen wird -> Zurück zur Auswahl
        onClose();

        if (routeCompleted) {
            navigate("/routeselection");
        }
    };

    return (
        <Flex
            direction={{ base: "column", lg: "row" }}
            h="100vh"
            w="100vw"
            overflow="hidden"
            bg="gray.100"
            position="relative"
        >
            <style>{keyframesStyle}</style>

            {/* 🔹 MAP AREA */}
            <Box
                position={{ base: "relative", lg: "absolute" }}
                top={0}
                left={0}
                right={0}
                zIndex={1100}
                bg={{ base: "white", lg: "transparent" }}
                pointerEvents={{ lg: "none" }}
            >
                <Box pointerEvents="auto">
                    <CompLangHeader />
                </Box>
            </Box>

            {geoError && (
                <Box
                    position="absolute"
                    top="80px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={2000}
                    w="90%"
                    maxW="500px"
                >
                    <Alert.Root status="error" variant="solid" borderRadius="md">
                        <Alert.Indicator>
                            <IoMdWarning />
                        </Alert.Indicator>
                        <Alert.Title>
                            {intl.formatMessage({ id: "playroute.gps_error" })}
                        </Alert.Title>
                        <Alert.Description>{geoError}</Alert.Description>
                    </Alert.Root>
                </Box>
            )}

            <Box
                flex={{ base: "none", lg: 1 }}
                h={{ base: "45vh", lg: "100%" }}
                w="100%"
                position={{ lg: "absolute" }}
                inset={{ lg: 0 }}
                zIndex={0}
            >
                <MapContainer
                    center={muensterCenter}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />

                    <Box
                        position="absolute"
                        top="90px"
                        right="12px"
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        zIndex={1000}
                    >
                        <Button
                            size="sm"
                            variant="solid"
                            borderRadius="full"
                            minW="44px"
                            h="44px"
                            p={0}
                            bg={"orange.500"}
                            color="white"
                            boxShadow="md"
                            _hover={{ bg: "orange.500" }}
                            _active={{ bg: "orange.600" }}
                            onClick={zoomToUserLocation}
                        >
                            <BsPersonStanding size={20} />
                        </Button>
                        <Button
                            size="sm"
                            variant="solid"
                            borderRadius="full"
                            minW="44px"
                            h="44px"
                            p={0}
                            bg={"orange.500"}
                            color="white"
                            boxShadow="md"
                            _hover={{ bg: "orange.500" }}
                            _active={{ bg: "orange.600" }}
                            onClick={zoomToRouteBounds}
                        >
                            <FaMap size={18} />
                        </Button>
                    </Box>

                    {/* User Marker */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            icon={markerUserLocation}
                            zIndexOffset={1000}
                        />
                    )}

                    {/* Route Line (Base) */}
                    {polylinePositions.length > 0 && (
                        <Polyline
                            positions={polylinePositions}
                            pathOptions={{
                                color: activeColor,
                                weight: 6,
                                opacity: 0.6,
                            }}
                        />
                    )}

                    {/* Navigation Line (Highlight) */}
                    {navLine.length > 0 && (
                        <Polyline
                            positions={navLine}
                            pathOptions={{
                                color: "#00A3C4",
                                weight: 7,
                                opacity: 0.9,
                            }}
                        />
                    )}

                    {/* POI Markers */}
                    {pois.map((poi) => {
                        if (
                            typeof poi.lat !== "number" ||
                            typeof poi.lon !== "number" ||
                            isNaN(poi.lat) ||
                            isNaN(poi.lon)
                        ) {
                            return null;
                        }

                        const isVisited = visitedPOIs.includes(poi.id);

                        // ⚠️ ÄNDERUNG: Wenn bereits ein POI besucht wurde, kein "Nearest" Highlight mehr auf der Karte
                        const targetIndex =
                            visitedPOIs.length > 0
                                ? -1
                                : nearestTargets.findIndex((t) => t.poi.id === poi.id);

                        const isNearest = targetIndex === 0;
                        const isSecondNearest = targetIndex === 1;

                        // Choose icon
                        let icon = markerUnvisitedPOI;
                        if (isVisited) {
                            icon = markerVisitedPOI;
                        } else if (isNearest) {
                            icon = markerNearestPOI; // Larger icon for nearest
                        }

                        const distance = getDistanceToPOI(poi);

                        return (
                            <Marker
                                key={poi.id}
                                position={[poi.lat, poi.lon]}
                                icon={icon}
                                opacity={isVisited ? 0.6 : 1}
                                zIndexOffset={isNearest ? 500 : isSecondNearest ? 400 : 0}
                            >
                                <Popup
                                    className="custom-popup"
                                    closeButton={false}
                                    minWidth={300}
                                    maxWidth={300}
                                >
                                    <Box bg="white" w="300px">
                                        {/* Header color bar */}
                                        <Box
                                            h="6px"
                                            bg={
                                                isVisited
                                                    ? "green.400"
                                                    : isNearest || isSecondNearest
                                                        ? activeColor
                                                        : "gray.300"
                                            }
                                            w="full"
                                        />
                                        <Box p={3} textAlign="center">
                                            <Text
                                                fontWeight="800"
                                                fontSize="md"
                                                color="gray.700"
                                                mb={1}
                                                lineHeight={1.2}
                                            >
                                                {poi.name}
                                            </Text>

                                            {isVisited ? (
                                                <VStack gap={1} mt={1}>
                                                    <Box w="100%" h="150px">
                                                        <img
                                                            src={getImageUrl(poi.image_path)}
                                                            alt={poi.name}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                                                        />
                                                    </Box>
                                                    <Text textAlign={"left"}>
                                                        {intl.formatMessage({ id: `poi.${poi.id}` })}
                                                    </Text>
                                                    <Badge
                                                        colorScheme="green"
                                                        variant="subtle"
                                                        fontSize="0.7rem"
                                                    >
                                                        {intl.formatMessage({ id: "playroute.visited" })}
                                                    </Badge>
                                                </VStack>
                                            ) : (
                                                <VStack gap={1} mt={1}>
                                                    {(isNearest || isSecondNearest) ? (
                                                        <Badge
                                                            colorScheme="orange"
                                                            variant="solid"
                                                            fontSize="0.7rem"
                                                        >
                                                            {intl.formatMessage({
                                                                id: "playroute.signal_acquired",
                                                            })}
                                                        </Badge>
                                                    ) : null}

                                                    {distance !== null && (
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="bold"
                                                            color="orange.600"
                                                        >
                                                            {Math.round(distance)}m
                                                        </Text>
                                                    )}
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.400"
                                                        fontStyle="italic"
                                                    >
                                                        {intl.formatMessage({
                                                            id: "playroute.signal_locked",
                                                        })}
                                                    </Text>
                                                </VStack>
                                            )}
                                        </Box>
                                    </Box>
                                </Popup>
                            </Marker>
                        );
                    })}

                    <FitRouteBounds route={route} />
                    <ZoomToUserOnNavigate navTarget={navTarget} userLocation={userLocation} />
                </MapContainer>
            </Box>

            {/* 🔹 SIDEBAR */}
            <Box
                position={{ lg: "absolute" }}
                top={{ lg: "80px" }}
                bottom={{ lg: "20px" }}
                left={{ lg: "20px" }}
                w={{ base: "100%", lg: "420px" }}
                flex={{ base: 1, lg: "none" }}
                bg={{ base: "white", lg: "whiteAlpha.95" }}
                backdropFilter={{ lg: "blur(15px)" }}
                boxShadow="xl"
                borderRadius={{ lg: "3xl" }}
                zIndex={1000}
                display="flex"
                flexDirection="column"
                borderTopRadius={{ base: "3xl", lg: "3xl" }}
                mt={{ base: "-25px", lg: 0 }}
                overflow="hidden"
            >
                {/* Sidebar Header */}
                <Box p={6} bg={activeColor} color="white">
                    <Flex justify="space-between" align="center" mb={2}>
                        <Button
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                            onClick={() => navigate("/routeselection")}
                        >
                            <IoMdArrowBack style={{ marginRight: "8px" }} />
                            {intl.formatMessage({ id: "playroute.abort" })}
                        </Button>
                        <Badge bg="whiteAlpha.300" color="white">
                            {intl.formatMessage(
                                { id: "playroute.found_progress" },
                                { visited: visitedPOIs.length, total: pois.length }
                            )}
                        </Badge>
                    </Flex>
                    <Heading size="lg" fontWeight="800" mb={2}>
                        {route.name}
                    </Heading>
                    <Progress.Root
                        value={progressValue}
                        size="sm"
                        bg="white"
                        max={100}
                    >
                        <Progress.Track
                            bg="whiteAlpha.300"
                            borderRadius="full"
                            height="8px"
                        >
                            <Progress.Range borderRadius="full" bg="white" />
                        </Progress.Track>
                    </Progress.Root>
                </Box>

                {/* Sidebar Body */}
                <VStack
                    flex={1}
                    overflowY="auto"
                    p={6}
                    gap={6}
                    bg="gray.50"
                    align="stretch"
                >
                    {/* GPS Error (inline) */}
                    {geoError && (
                        <Box
                            p={4}
                            bg="orange.50"
                            border="1px dashed"
                            borderColor="orange.300"
                            borderRadius="md"
                        >
                            <Text fontSize="sm" color="orange.800" mb={2} fontWeight="bold">
                                {intl.formatMessage({ id: "playroute.gps_signal_lost" })}
                            </Text>
                            <Text fontSize="xs" color="orange.700">
                                {intl.formatMessage({ id: "playroute.gps_signal_lost_desc" })}
                            </Text>
                        </Box>
                    )}

                    {/* 1. LOADING STATE (GPS Searching) */}
                    {!geoError && !closestTarget && !showSuccess && (
                        <Box textAlign="center" py={10}>
                            <VStack gap={4}>
                                <Text color="gray.500" fontSize="sm" fontWeight="bold">
                                    {intl.formatMessage({ id: "playroute.loading_mission" })}
                                </Text>
                                {/* Nice Animated Loading Bar */}
                                <Box
                                    w="60%"
                                    h="6px"
                                    bg="gray.200"
                                    borderRadius="full"
                                    overflow="hidden"
                                    mx="auto"
                                >
                                    <Box style={loadingBarStyle} />
                                </Box>
                                {/* Replaced SkeletonText with manual stack of skeletons */}
                                <VStack gap={4} w="70%" mx="auto" align="stretch">
                                    <Skeleton height="10px" w="100%" />
                                    <Skeleton height="10px" w="80%" />
                                </VStack>
                            </VStack>
                        </Box>
                    )}

                    {/* 2. NAVIGATION MODE (Active) */}
                    {navTarget && (
                        <Box
                            bg="white"
                            borderRadius="xl"
                            boxShadow="md"
                            p={4}
                            border="1px solid"
                            borderColor="gray.100"
                        >
                            <HStack justify="space-between" mb={3}>
                                <HStack>
                                    <IoMdNavigate size={20} color="#00A3C4" />
                                    <Heading size="sm" color="gray.700">
                                        {intl.formatMessage({
                                            id: "playroute.nav.title",
                                            defaultMessage: "Navigation",
                                        })}
                                    </Heading>
                                </HStack>
                                <IconButton
                                    aria-label="Stop Nav"
                                    size="xs"
                                    variant="ghost"
                                    color="red.400"
                                    onClick={() => {
                                        setNavTarget(null);
                                        setNavLine([]);
                                    }}
                                >
                                    <IoMdClose />
                                </IconButton>
                            </HStack>

                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="gray.800"
                                mb={3}
                            >
                                {intl.formatMessage({
                                    id: "playroute.nav.to",
                                    defaultMessage: "To:",
                                })}{" "}
                                {navTarget.name}
                            </Text>

                            {navLoading && (
                                <Box>
                                    <Text fontSize="xs" color="gray.500" mb={2}>
                                        {intl.formatMessage({
                                            id: "playroute.nav.loading",
                                            defaultMessage: "Calculating route...",
                                        })}
                                    </Text>
                                    <Box
                                        h="4px"
                                        w="full"
                                        bg="gray.100"
                                        borderRadius="full"
                                        overflow="hidden"
                                    >
                                        <Box
                                            style={{
                                                ...loadingBarStyle,
                                                background: "#00A3C4",
                                            }}
                                        />
                                    </Box>
                                </Box>
                            )}

                            {navError && (
                                <Text fontSize="xs" color="red.500">
                                    {intl.formatMessage(
                                        { id: "playroute.nav.error", defaultMessage: "Error" },
                                        { message: navError }
                                    )}
                                </Text>
                            )}

                            {!navLoading && !navError && navSteps.length > 0 && (
                                <VStack
                                    align="stretch"
                                    gap={2}
                                    maxH="200px"
                                    overflowY="auto"
                                    pr={1}
                                >
                                    {navSteps.slice(0, 5).map((s, idx) => (
                                        <Box
                                            key={idx}
                                            p={2}
                                            borderRadius="md"
                                            bg={idx === 0 ? "blue.50" : "white"}
                                            borderLeft={
                                                idx === 0 ? "3px solid #00A3C4" : "none"
                                            }
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight={idx === 0 ? "700" : "500"}
                                                color="gray.700"
                                            >
                                                {formatStep(s)}
                                            </Text>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    )}

                    {/* 3. NEAREST POI CARD (Only if not navigating or navigating to something else) */}
                    {/* ⚠️ Card nur anzeigen, wenn NICHT im Cooldown, UND (noch nix besucht ODER nah dran) */}
                    {!showSuccess && closestTarget && !geoError && !navTarget && !collectingCooldown && (visitedPOIs.length === 0 || isNearPOI(closestTarget.poi)) && (
                        <Box>
                            <HStack
                                mb={2}
                                color="gray.500"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="wider"
                            >
                                <MdRadar size={16} />
                                <Text>
                                    {intl.formatMessage({ id: "playroute.nearest_signal" })}
                                </Text>
                            </HStack>

                            <Card.Root
                                borderTop="4px solid"
                                borderColor={
                                    isNearPOI(closestTarget.poi) ? "green.400" : activeColor
                                }
                                boxShadow="lg"
                            >
                                <Card.Body>
                                    <Flex justify="space-between" align="start" mb={4}>
                                        <VStack align="start" gap={0}>
                                            <Heading size="md" color="gray.700">
                                                {closestTarget.poi.name}
                                            </Heading>
                                            <Text
                                                fontSize="sm"
                                                color="gray.500"
                                                fontWeight="bold"
                                            >
                                                {intl.formatMessage(
                                                    { id: "playroute.distance_away" },
                                                    { distance: Math.round(closestTarget.distance) }
                                                )}
                                            </Text>
                                        </VStack>
                                        <Box
                                            p={3}
                                            borderRadius="full"
                                            bg={
                                                isNearPOI(closestTarget.poi)
                                                    ? "green.100"
                                                    : "gray.100"
                                            }
                                            color={
                                                isNearPOI(closestTarget.poi)
                                                    ? "green.500"
                                                    : "gray.400"
                                            }
                                        >
                                            {isNearPOI(closestTarget.poi) ? (
                                                <IoMdCheckmarkCircle size={24} />
                                            ) : (
                                                <FaSatelliteDish size={24} />
                                            )}
                                        </Box>
                                    </Flex>

                                    {isNearPOI(closestTarget.poi) ? (
                                        <VStack align="stretch" gap={3}>
                                            <Badge
                                                colorScheme="green"
                                                alignSelf="start"
                                            >
                                                {intl.formatMessage({
                                                    id: "playroute.signal_acquired",
                                                })}
                                            </Badge>
                                            <Text fontSize="sm" color="gray.600">
                                                {intl.formatMessage({
                                                    id: "playroute.signal_acquired_desc",
                                                })}
                                            </Text>
                                            {/* BUTTON APPEARS ONLY WHEN NEAR (Mark as Visited) */}
                                            <Button
                                                colorScheme="green"
                                                size="lg"
                                                onClick={() => markPOIAsVisited(closestTarget.poi.id)}
                                                w="full"
                                            >
                                                <FaMapMarkedAlt
                                                    style={{ marginRight: "8px" }}
                                                />
                                                {intl.formatMessage({
                                                    id: "playroute.collect_intel",
                                                })}
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <VStack align="stretch" gap={3}>
                                            <Badge colorScheme="orange" alignSelf="start">
                                                {intl.formatMessage({
                                                    id: "playroute.signal_locked",
                                                })}
                                            </Badge>
                                            <Text
                                                fontSize="sm"
                                                color="gray.500"
                                                fontStyle="italic"
                                            >
                                                <IoMdLock
                                                    style={{
                                                        display: "inline",
                                                        marginBottom: "-2px",
                                                        marginRight: "4px",
                                                    }}
                                                />
                                                {intl.formatMessage({
                                                    id: "playroute.signal_locked_desc",
                                                })}
                                            </Text>

                                            {/* NAVIGATE BUTTON: Starts on-page OSRM Routing */}
                                            <Button
                                                variant="outline"
                                                w="full"
                                                onClick={() => setNavTarget(closestTarget.poi)}
                                            >
                                                <IoMdNavigate style={{ marginRight: "8px" }} />
                                                {intl.formatMessage({
                                                    id: "playroute.navigate_signal",
                                                })}
                                            </Button>
                                        </VStack>
                                    )}
                                </Card.Body>
                            </Card.Root>
                        </Box>
                    )}

                    {/* MISSION LOG (Visited POIs) */}
                    {visitedPOIs.length > 0 && (
                        <Box>
                            <HStack
                                mb={4}
                                color="gray.500"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="wider"
                            >
                                <FaMapMarkedAlt size={14} />
                                <Text>
                                    {intl.formatMessage(
                                        { id: "playroute.mission_log" },
                                        { count: visitedPOIs.length }
                                    )}
                                </Text>
                            </HStack>

                            <VStack gap={4} align="stretch">
                                {pois
                                    .filter((p) => visitedPOIs.includes(p.id))
                                    .map((poi) => (
                                        <Flex
                                            key={poi.id}
                                            bg="white"
                                            borderRadius="xl"
                                            boxShadow="sm"
                                            overflow="hidden"
                                            border="1px solid"
                                            borderColor="gray.100"
                                        >
                                            {/* Left: Checkmark Icon Area */}
                                            <Flex
                                                w="80px"
                                                bg="gray.50"
                                                align="center"
                                                justify="center"
                                                borderRight="1px solid"
                                                borderColor="gray.100"
                                            >
                                                <IoMdCheckmarkCircle size={32} color="#48BB78" />
                                            </Flex>

                                            {/* Right: Content */}
                                            <Box p={4} flex={1}>
                                                <Heading
                                                    size="sm"
                                                    color="gray.700"
                                                    mb={1}
                                                    textDecoration="line-through"
                                                    opacity={0.6}
                                                >
                                                    {poi.name}
                                                </Heading>
                                                <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                    lineClamp={2}
                                                >
                                                    {intl.formatMessage({
                                                        id: `poi.${poi.id}`,
                                                        defaultMessage: "Mission completed.",
                                                    })}
                                                </Text>

                                                <HStack mt={2} justify="flex-end">
                                                    <Badge
                                                        colorScheme="green"
                                                        variant="subtle"
                                                        fontSize="0.6rem"
                                                    >
                                                        COMPLETED
                                                    </Badge>
                                                </HStack>
                                            </Box>
                                        </Flex>
                                    ))}
                            </VStack>
                        </Box>
                    )}
                </VStack>
            </Box>

            {/* 🔹 SUCCESS OVERLAY */}
            {showSuccess && (
                <Box
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.800"
                    zIndex={2000}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(8px)"
                >
                    <VStack
                        bg="white"
                        p={8}
                        borderRadius="2xl"
                        textAlign="center"
                        gap={6}
                        maxW="90%"
                        w="400px"
                        boxShadow="2xl"
                    >
                        <Box color="green.500">
                            <IoMdCheckmarkCircle size={80} />
                        </Box>
                        <VStack gap={2}>
                            <Heading size="xl" color="gray.800">
                                {intl.formatMessage({ id: "playroute.mission_complete" })}
                            </Heading>
                            <Text color="gray.600">
                                {intl.formatMessage(
                                    { id: "playroute.mission_complete_desc" },
                                    { route: route.name }
                                )}
                            </Text>
                        </VStack>
                        <Button
                            colorScheme="orange"
                            size="lg"
                            w="full"
                            onClick={() => handleSuccessConfirm()}
                        >
                            {/* Text dynamisch machen: Wenn Achievement wartet, steht da "Belohnung abholen" */}
                            {newAchievement
                                ? intl.formatMessage({ id: "playroute.collect_reward" })
                                : intl.formatMessage({ id: "playroute.return_base" })
                            }
                        </Button>
                    </VStack>
                </Box>
            )}

            {/* Die Modal Achievement Komponente */}
            <AchievementUnlockModal
                isOpen={open}
                onClose={handleAchievementClose}
                achievement={newAchievement}
            />

            {/* AI Chat Buddy */}
            <RideyChat
                ref={rideyChatRef}
                currentLanguage={currentLang}
                intl={intl}
            />
        </Flex>
    );
}
