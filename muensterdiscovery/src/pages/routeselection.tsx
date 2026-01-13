import { useState, useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { Box, VStack, HStack, Heading, Text, Button } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import CompLangHeader from "../components/CompLangHeader";
import { onCurrentLanguageChange } from "../components/languageSelector";
import { getRoutes } from "../services/DatabaseConnection";
import type { Route } from "../types";

const routeColors: Record<string, string> = {
    muenster_history: '#c41e3a',
    muenster_fair: '#ff6b6b',
    muenster_art: '#4ecdc4',
    muenster_architecture: '#45b7d1',
    muenster_kreuzviertel: '#f9ca24',
    muenster_media: '#6c5ce7',
    muenster_hiddengems: '#fdcb6e',
};

export default function RouteSelection() {
    const intl = useIntl();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange(() => {
            // Language changed, intl will handle re-render
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        async function fetchRoutes() {
            try {
                const fetchedRoutes = await getRoutes();
                console.log("Routes fetched from database:", fetchedRoutes);
                setRoutes(fetchedRoutes);
            } catch (error) {
                console.error("Error fetching routes:", error);
            }
        }
        fetchRoutes();
    }, []);

    useEffect(() => {
        console.log("Routes state updated:", routes);
    }, [routes]);

    const munsterCenter: LatLngExpression = [51.9607, 7.6261];

    return (
        <Box w="100%" h="100vh">
            <CompLangHeader />
            <MapContainer
                center={munsterCenter}
                zoom={13}
                style={{ width: '100%', height: 'calc(100vh - 80px)' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {routes.map((route) => {
                    // Get coordinates from geoJSON
                    const coords = route.geoJSON?.geometry?.coordinates || route.geoJSON?.coordinates;
                    
                    if (!coords || !Array.isArray(coords) || coords.length === 0) {
                        console.warn('Route missing coordinates:', route);
                        return null;
                    }
                    
                    // Convert from [lng, lat] to [lat, lng] for Leaflet
                    const coordinates: LatLngExpression[] = coords.map(
                        ([lng, lat]: [number, number]) => [lat, lng] as LatLngExpression
                    );
                    
                    // Get route ID for color
                    const routeId = route.geoJSON?.properties?.id || route.name?.toLowerCase().replace(/\s+/g, '_') || `route_${route.id}`;
                    const color = routeColors[routeId] || '#888888';
                    
                    return (
                        <Polyline
                            key={route.id}
                            positions={coordinates}
                            pathOptions={{
                                color: color,
                                weight: 4,
                                opacity: 0.7,
                            }}
                            eventHandlers={{
                                click: () => setSelectedRoute(route),
                            }}
                        />
                    );
                })}
            </MapContainer>

            {/* Floating Info Panel */}
            {selectedRoute && (
            <Box
                position="absolute"
                top="100px"
                right="20px"
                w="400px"
                maxH="calc(100vh - 140px)"
                bg="white"
                borderRadius="lg"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
                overflowY="auto"
                zIndex={1000}
            >
                <VStack gap={0} align="stretch">
                    {/* Header */}
                    <Box bgGradient="linear(to-r, #c41e3a, #8b1528)" color="white" p={4} borderTopRadius="lg">
                        <Heading size="sm" mb={1}>
                            {intl.formatMessage({ id: 'routeselection.title' })}
                        </Heading>
                        <Text fontSize="xs" opacity={0.9}>
                            {intl.formatMessage({ id: 'routeselection.subtitle' })}
                        </Text>
                    </Box>

                    {/* Routes Content Area */}
                    <Box p={4} flex={1} w="100%">
                            <VStack gap={3} align="stretch">
                                <Box>
                                    <Heading size="md" mb={2}>{selectedRoute.name}</Heading>
                                    {selectedRoute.description && (
                                        <Text fontSize="sm" color="gray.700" mb={3}>
                                            {selectedRoute.description}
                                        </Text>
                                    )}
                                </Box>
                                
                                <VStack gap={2} align="start" fontSize="sm">
                                    {selectedRoute.distance && (
                                        <HStack>
                                            <Text fontWeight="bold" color="gray.600" w="100px">
                                                {intl.formatMessage({ id: 'routeselection.distance' })}
                                            </Text>
                                            <Text>{selectedRoute.distance} km</Text>
                                        </HStack>
                                    )}
                                    {selectedRoute.time_length && (
                                        <HStack>
                                            <Text fontWeight="bold" color="gray.600" w="100px">
                                                {intl.formatMessage({ id: 'routeselection.duration' })}
                                            </Text>
                                            <Text>{selectedRoute.time_length} min</Text>
                                        </HStack>
                                    )}
                                    {selectedRoute.POIs && (
                                        <HStack>
                                            <Text fontWeight="bold" color="gray.600" w="100px">
                                                {intl.formatMessage({ id: 'routeselection.pois' })}
                                            </Text>
                                            <Text>{selectedRoute.POIs.length}</Text>
                                        </HStack>
                                    )}
                                </VStack>

                                <Box pt={2}>
                                    <Button 
                                        w="full" 
                                        bg="#c41e3a" 
                                        color="white" 
                                        size="sm"
                                        onClick={() => setSelectedRoute(null)}
                                    >
                                        {intl.formatMessage({ id: 'routeselection.close' })}
                                    </Button>
                                </Box>
                            </VStack>
                        </Box>
                </VStack>
            </Box>
            )}
        </Box>
    );
}