import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
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
  Image,
  IconButton,
  Badge,
  Flex,
  type ImageProps,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useIntl } from "react-intl";
import CompLangHeader from "../components/CompLangHeader";
import { 
  onCurrentLanguageChange, 
  currentLanguage, 
  type LanguageType 
} from "../components/languageSelector";
import {
  getRoutes,
  getPOIsByRoute,
  getPOIs,
} from "../services/DatabaseConnection";
import type { Route, POI } from "../types";
import { IoMdClose, IoMdArrowBack } from "react-icons/io";
import { MdOutlineAccessTime, MdOutlinePlace } from "react-icons/md";
import { TbRulerMeasure } from "react-icons/tb";
import { FaMapMarkedAlt } from "react-icons/fa";

// 🔹 Import RideyChat
import RideyChat, { type RideyChatRef } from "../components/RideyChat";

const routeColors: Record<string, string> = {
  muenster_history: "#c41e3a",
  muenster_fair: "#ff6b6b",
  muenster_art: "#4ecdc4",
  muenster_architecture: "#45b7d1",
  muenster_kreuzviertel: "#f9ca24",
  muenster_media: "#6c5ce7",
  muenster_hiddengems: "#fdcb6e",
};

/* 🔹 Helper Component: Image with Fallback for Chakra v3 */
function FallbackImage(
  props: Omit<ImageProps, "src"> & {
    src?: string;
    fallbackSrc: string;
  }
) {
  const { src, fallbackSrc, onError, ...rest } = props;
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    src || fallbackSrc
  );

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={currentSrc}
      onError={(e) => {
        setCurrentSrc(fallbackSrc);
        if (onError) onError(e);
      }}
    />
  );
}

/* 🔹 Zoom helper */
function FitRouteBounds({ route }: { route: Route | null }) {
  const map = useMap();
  useEffect(() => {
    if (!route) return;
    const coords =
      route.geoJSON?.geometry?.coordinates || route.geoJSON?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) return;
    const latLngs = coords.map(([lng, lat]: [number, number]) =>
      L.latLng(lat, lng)
    );
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [route, map]);
  return null;
}

export default function RouteSelection() {
  const intl = useIntl();
  const navigate = useNavigate();
  
  // Data State
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allPOIs, setAllPOIs] = useState<POI[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routePOIs, setRoutePOIs] = useState<POI[]>([]);
  const [loadingPOIs, setLoadingPOIs] = useState(false);

  // Chat & Language State
  const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
  const rideyChatRef = useRef<RideyChatRef>(null);

  // Responsive check
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
  };

  // Handle Language Changes
  useEffect(() => {
    const unsubscribe = onCurrentLanguageChange((lang) => {
      setCurrentLang(lang);
    });
    return unsubscribe;
  }, []);

  // Fetch Routes AND all POIs (for image lookup)
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedRoutes, fetchedPOIs] = await Promise.all([
          getRoutes(),
          getPOIs(),
        ]);
        setRoutes(fetchedRoutes);
        setAllPOIs(fetchedPOIs);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // Helper to get the first available image for a route from its POIs
  const getRouteImage = (route: Route) => {
    if (!route.POIs || route.POIs.length === 0) return null;
    
    // Find the first POI in this route that has an image
    for (const poiId of route.POIs) {
      const poi = allPOIs.find((p) => p.id === poiId);
      if (poi && poi.image_path) {
        return getImageUrl(poi.image_path);
      }
    }
    return null;
  };

  // Fetch POIs when route is selected (for Detail View)
  useEffect(() => {
    async function fetchRoutePOIs() {
      if (!selectedRoute) {
        setRoutePOIs([]);
        return;
      }
      setLoadingPOIs(true);
      try {
        const pois = await getPOIsByRoute(selectedRoute.id);
        setRoutePOIs(pois);
      } catch (error) {
        console.error("Error fetching route POIs:", error);
        setRoutePOIs([]);
      } finally {
        setLoadingPOIs(false);
      }
    }
    fetchRoutePOIs();
  }, [selectedRoute]);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleCloseDetail = () => {
    setSelectedRoute(null);
    setRoutePOIs([]);
  };

  const munsterCenter: LatLngExpression = [51.9607, 7.6261];

  // Helper to get color for current selected route
  const getSelectedRouteColor = () => {
    if (!selectedRoute) return "orange.500";
    const routeId =
      selectedRoute.geoJSON?.properties?.id ||
      selectedRoute.name.toLowerCase().replace(/\s+/g, "_");
    return routeColors[routeId] || "orange.500";
  };

  const activeColor = getSelectedRouteColor();

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      h="100vh"
      w="100vw"
      overflow="hidden"
      bg="orange.50"
      position="relative"
    >
      {/* 🔹 HEADER - Absolute on Desktop, Stacked on Mobile */}
      <Box
        position={{ base: "relative", lg: "absolute" }}
        top={{ lg: 0 }}
        left={{ lg: 0 }}
        right={{ lg: 0 }}
        zIndex={1100}
        bg={{ base: "white", lg: "transparent" }}
        pointerEvents={{ lg: "none" }}
      >
        <Box pointerEvents="auto">
          <CompLangHeader />
        </Box>
      </Box>

      {/* 🔹 MAP BACKGROUND (Desktop) / MAP SECTION (Mobile) */}
      <Box
        flex={{ base: "none", lg: "1" }}
        h={{ base: "40vh", lg: "100%" }}
        w={{ base: "100%", lg: "100%" }}
        position={{ lg: "absolute" }}
        inset={{ lg: 0 }}
        zIndex={0}
      >
        <MapContainer
          center={munsterCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <Pane name="routes" style={{ zIndex: 400 }}>
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
                  key={route.id}
                  positions={coordinates}
                  pathOptions={{
                    color: routeColors[routeId] || "#888",
                    weight: isActive ? 6 : 4,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  eventHandlers={{
                    click: () => handleRouteSelect(route),
                  }}
                />
              );
            })}
          </Pane>
          <FitRouteBounds route={selectedRoute} />
        </MapContainer>
      </Box>

      {/* 🔹 SIDEBAR CONTENT (Desktop: Floating Left; Mobile: Bottom Scroll) */}
      <Box
        position={{ lg: "absolute" }}
        top={{ lg: "80px" }}
        bottom={{ lg: "20px" }}
        left={{ lg: "20px" }}
        w={{ base: "100%", lg: "450px" }}
        flex={{ base: "1", lg: "none" }}
        bg={{ base: "orange.50", lg: "whiteAlpha.95" }}
        backdropFilter={{ lg: "blur(10px)" }}
        boxShadow={{ lg: "xl" }}
        borderRadius={{ lg: "2xl" }}
        zIndex={1000}
        overflowY="auto"
        display="flex"
        flexDirection="column"
        borderTopRadius={{ base: "2xl", lg: "2xl" }}
        mt={{ base: "-20px", lg: 0 }}
        pt={{ base: 6, lg: 0 }}
      >
        {/* === HEADER SECTION OF SIDEBAR === */}
        {!selectedRoute ? (
          <VStack
            p={6}
            gap={2}
            align="start"
            borderBottom="1px solid"
            borderColor="orange.100"
            bg={{ lg: "white" }}
          >
            <Flex align="center" gap={3}>
              <Box p={2} bg="orange.100" borderRadius="lg" color="orange.500">
                <FaMapMarkedAlt size={24} />
              </Box>
              <Heading
                as="h1"
                fontSize="2xl"
                fontWeight="800"
                color="orange.600"
              >
                {intl.formatMessage({ id: "routeselection.overview" })}
              </Heading>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              {intl.formatMessage({ id: "routeselection.description" }) ||
                "Select a route to explore Münster"}
            </Text>
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="orange"
                onClick={() => navigate("/start")}
                mt={2}
              >
                <IoMdArrowBack style={{ marginRight: "8px" }} />
                {intl.formatMessage({ id: "common.back" }) || "Back"}
              </Button>
            )}
          </VStack>
        ) : (
          <Box
            p={6}
            bg={activeColor}
            color="white"
            position="relative"
            borderTopRadius={{ lg: "2xl" }}
            transition="background-color 0.3s"
          >
            <IconButton
              aria-label="Back to list"
              onClick={handleCloseDetail}
              position="absolute"
              top={4}
              right={4}
              bg="whiteAlpha.300"
              color="white"
              _hover={{ bg: "whiteAlpha.400" }}
              size="sm"
              borderRadius="full"
            >
              <IoMdClose size={20} />
            </IconButton>

            <Badge
              bg="blackAlpha.300"
              color="white"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="xs"
              mb={2}
            >
              Selected
            </Badge>
            <Heading as="h2" fontSize="2xl" fontWeight="800" mb={1}>
              {selectedRoute.name}
            </Heading>
            <HStack gap={4} fontSize="sm" opacity={0.9}>
              <HStack gap={1}>
                <TbRulerMeasure />
                <Text>{Math.round(selectedRoute.distance / 1000)} km</Text>
              </HStack>
              <HStack gap={1}>
                <MdOutlineAccessTime />
                <Text>{selectedRoute.time_length} min</Text>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* === SCROLLABLE CONTENT === */}
        <Box p={6} flex="1" overflowY="auto">
          {/* LIST VIEW */}
          {!selectedRoute && (
            <VStack gap={4} align="stretch">
              {routes.map((route) => {
                const routeId =
                  route.geoJSON?.properties?.id ||
                  route.name.toLowerCase().replace(/\s+/g, "_");
                const routeColor = routeColors[routeId] || "orange.500";
                
                // Get image for this route
                const routeImage = getRouteImage(route);

                return (
                  <Box
                    key={route.id}
                    bg="white"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="sm"
                    cursor="pointer"
                    onClick={() => handleRouteSelect(route)}
                    transition="all 0.2s"
                    border="1px solid"
                    borderColor="transparent"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                      borderColor: routeColor,
                    }}
                  >
                    {/* START PICTURE: First POI image or generic fallback */}
                    <Box h="140px" bg="gray.100" position="relative">
                      {routeImage ? (
                        <Image
                          src={routeImage}
                          alt={route.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      ) : (
                        <Flex
                          h="100%"
                          w="100%"
                          bg={`${routeColor}20`}
                          align="center"
                          justify="center"
                        >
                          <FaMapMarkedAlt
                            size={40}
                            color={routeColor}
                            opacity={0.5}
                          />
                        </Flex>
                      )}

                      {/* Overlay Title */}
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        bg="linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
                        p={4}
                        pt={10}
                      >
                        <Heading
                          as="h3"
                          fontSize="lg"
                          fontWeight="700"
                          color="white"
                        >
                          {route.name}
                        </Heading>
                      </Box>
                    </Box>

                    <Box p={4}>
                      <Text
                        fontSize="sm"
                        color="gray.500"
                        lineClamp={2}
                        mb={3}
                      >
                        {route.description}
                      </Text>
                      <HStack gap={3} fontSize="xs" color="gray.400">
                        <Flex align="center" gap={1}>
                          <MdOutlinePlace /> {route.POIs.length} POIs
                        </Flex>
                        <Flex align="center" gap={1}>
                          <MdOutlineAccessTime /> {route.time_length} min
                        </Flex>
                      </HStack>
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* DETAIL VIEW */}
          {selectedRoute && (
            <VStack gap={6} align="stretch">
              <Box>
                <Heading
                  as="h4"
                  fontSize="md"
                  fontWeight="700"
                  color={activeColor}
                  mb={2}
                >
                  {intl.formatMessage({ id: "routeselection.about" }) ||
                    "About this route"}
                </Heading>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {selectedRoute.description}
                </Text>
              </Box>

              <Box>
                <Heading
                  as="h4"
                  fontSize="md"
                  fontWeight="700"
                  color={activeColor}
                  mb={3}
                >
                  {intl.formatMessage({ id: "routeselection.highlights" }) ||
                    "Highlights"}
                </Heading>

                {loadingPOIs ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Loading points of interest...
                  </Text>
                ) : (
                  <VStack gap={4}>
                    {routePOIs
                      // Filter: Show only every 3rd POI (index 2, 5, 8...)
                      .filter((_, index) => (index + 1) % 3 === 0)
                      .map((poi) => (
                      <Box
                        key={poi.id}
                        w="100%"
                        bg="white"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                      >
                        {poi.image_path && (
                          <FallbackImage
                            src={getImageUrl(poi.image_path)}
                            fallbackSrc="https://via.placeholder.com/400x200?text=No+Image"
                            alt={poi.name}
                            w="100%"
                            h="180px"
                            objectFit="cover"
                          />
                        )}
                        <Box p={3}>
                          <HStack justify="space-between" mb={1}>
                            <Text
                              fontWeight="700"
                              fontSize="sm"
                              color="gray.800"
                            >
                              {poi.name}
                            </Text>
                          </HStack>
                          {/* Description text removed */}
                        </Box>
                      </Box>
                    ))}
                    {routePOIs.filter((_, index) => (index + 1) % 3 === 0).length === 0 && (
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                         See map for details.
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>
            </VStack>
          )}
        </Box>

        {/* === FOOTER BUTTON (Only in Detail View) === */}
        {selectedRoute && (
          <Box p={4} bg="white" borderTop="1px solid" borderColor="gray.100">
            <Button
              w="100%"
              bg={activeColor}
              color="white"
              size="lg"
              fontWeight="bold"
              onClick={() => navigate(`/playroute/${selectedRoute.id}`)}
              _hover={{ opacity: 0.9 }}
              _active={{ opacity: 0.8 }}
              boxShadow="lg"
            >
              {intl.formatMessage({ id: "routeselection.start" })}
            </Button>
          </Box>
        )}
      </Box>

      {/* 🔹 Chat Widget */}
      <RideyChat 
        ref={rideyChatRef} 
        currentLanguage={currentLang} 
        intl={intl} 
      />
    </Flex>
  );
}
