import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    ZoomControl,
    Polyline,
    useMap,
    Pane,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
} from "@chakra-ui/react";
import { useIntl } from "react-intl";
import CompLangHeader from "../components/CompLangHeader";
import { onCurrentLanguageChange } from "../components/languageSelector";
import { getRoutes } from "../services/DatabaseConnection";
import type { Route } from "../types";

const routeColors: Record<string, string> = {
    muenster_history: "#c41e3a",
    muenster_fair: "#ff6b6b",
    muenster_art: "#4ecdc4",
    muenster_architecture: "#45b7d1",
    muenster_kreuzviertel: "#f9ca24",
    muenster_media: "#6c5ce7",
    muenster_hiddengems: "#fdcb6e",
};

/* 🔹 Zoom helper */
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

export default function RouteSelection() {
    const intl = useIntl();
    const navigate = useNavigate();

    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange(() => { });
        return unsubscribe;
    }, []);

    useEffect(() => {
        async function fetchRoutes() {
            try {
                const fetchedRoutes = await getRoutes();
                setRoutes(fetchedRoutes);
            } catch (error) {
                console.error("Error fetching routes:", error);
            }
        }
        fetchRoutes();
    }, []);

    const munsterCenter: LatLngExpression = [51.9607, 7.6261];

    return (
        <Box w="100%" h="100vh" position="relative">
            <CompLangHeader />

            {/* ================= ROUTES OVERVIEW ================= */}
            <Box
                position="absolute"
                top="100px"
                left="20px"
                w="300px"
                maxH="calc(100vh - 140px)"
                bg="white"
                borderRadius="lg"
                boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                overflowY="auto"
                zIndex={1000}
            >
                <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                    <Heading size="sm">
                        {intl.formatMessage({ id: "routeselection.overview" })}
                    </Heading>
                </Box>

                <VStack spacing={0} align="stretch">
                    {routes.map((route) => {
                        const routeId =
                            route.geoJSON?.properties?.id ||
                            route.name.toLowerCase().replace(/\s+/g, "_");

                        const color = routeColors[routeId] || "#888";
                        const isActive = selectedRoute?.id === route.id;

                        return (
                            <Box
                                key={route.id}
                                px={4}
                                py={3}
                                cursor="pointer"
                                borderLeft="6px solid"
                                borderLeftColor={isActive ? color : "transparent"}
                                bg={isActive ? `${color}10` : "transparent"}
                                _hover={{ bg: isActive ? `${color}15` : "gray.50" }}
                                transition="all 0.15s ease"
                                onClick={() => setSelectedRoute(route)}
                            >
                                <HStack spacing={3}>
                                    {/* Optionaler Punkt */}
                                    <Box
                                        w="10px"
                                        h="10px"
                                        borderRadius="full"
                                        bg={color}
                                        opacity={isActive ? 1 : 0.4}
                                    />

                                    <Text
                                        fontWeight={isActive ? "bold" : "semibold"}
                                        color={isActive ? "gray.800" : "gray.700"}
                                    >
                                        {route.name}
                                    </Text>
                                </HStack>
                            </Box>
                        );
                    })}
                </VStack>
            </Box>

            {/* ================= MAP ================= */}
            <MapContainer
                center={munsterCenter}
                zoom={13}
                style={{ width: "100%", height: "calc(100vh - 80px)" }}
                zoomControl={false}
            >
                <Pane name="routesPane" style={{ zIndex: 400 }} />
                <Pane name="activeRoutePane" style={{ zIndex: 450 }} />
                <ZoomControl position="bottomright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRouteBounds route={selectedRoute} />

                {routes.map((route) => {
                    const isActive = selectedRoute?.id === route.id;
                    const coords =
                        route.geoJSON?.geometry?.coordinates ||
                        route.geoJSON?.coordinates;

                    if (!Array.isArray(coords)) return null;

                    const coordinates: LatLngExpression[] = coords.map(
                        ([lng, lat]: [number, number]) => [lat, lng]
                    );

                    const routeId =
                        route.geoJSON?.properties?.id ||
                        route.name.toLowerCase().replace(/\s+/g, "_");

                    return (
                        <Polyline
                            key={`${route.id}-${isActive ? 'active' : 'normal'}`}
                            pane={isActive ? "activeRoutePane" : "routesPane"}
                            positions={coordinates}
                            pathOptions={{
                                color: routeColors[routeId] || "#888",
                                weight: isActive ? 6 : 4,
                                opacity: isActive ? 1 : 0.6,
                            }}
                            eventHandlers={{
                                click: () => setSelectedRoute(route),
                            }}
                        />
                    );
                })}
            </MapContainer>

            {/* ================= DETAIL PANEL ================= */}
            {selectedRoute && (
                <Box
                    position="absolute"
                    top="100px"
                    right="20px"
                    w="400px"
                    maxH="calc(100vh - 140px)"
                    bg="white"
                    borderRadius="lg"
                    boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                    overflowY="auto"
                    zIndex={1000}
                >
                    <VStack align="stretch" spacing={0}>
                        <Box
                            bgGradient="linear(to-r, #c41e3a, #8b1528)"
                            color="white"
                            p={4}
                            borderTopRadius="lg"
                        >
                            <Heading size="sm">{selectedRoute.name}</Heading>
                        </Box>

                        <Box p={4}>
                            <Text mb={3}>{selectedRoute.description}</Text>

                            <VStack align="start" spacing={2} fontSize="sm">
                                <Text>
                                    <strong>{intl.formatMessage({ id: "routeselection.distance" })}:</strong>{" "}
                                    {Math.round(selectedRoute.distance / 1000)} km
                                </Text>
                                <Text>
                                    <strong>{intl.formatMessage({ id: "routeselection.duration" })}:</strong> {selectedRoute.time_length} min
                                </Text>
                                <Text>
                                    <strong>{intl.formatMessage({ id: "routeselection.pois" })}:</strong> {selectedRoute.POIs.length}
                                </Text>
                            </VStack>
                            <Button
                                mt={4}
                                w="full"
                                bg="green.500"
                                color="white"
                                size={"sm"}
                                onClick={() => navigate(`/playroute/${selectedRoute.id}`)}
                            >
                                {intl.formatMessage({ id: "routeselection.start" })}
                            </Button>
                            <Button
                                mt={4}
                                w="full"
                                bg="#c41e3a"
                                color="white"
                                size="sm"
                                onClick={() => setSelectedRoute(null)}
                            >
                                {intl.formatMessage({ id: "routeselection.close" })}
                            </Button>
                        </Box>
                    </VStack>
                </Box>
            )}
        </Box>
    );
}
