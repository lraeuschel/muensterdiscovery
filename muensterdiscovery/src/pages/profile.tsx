import { Box, VStack, HStack, Text, Image, Button, Grid } from "@chakra-ui/react";
import { MapContainer, TileLayer, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngBoundsExpression } from 'leaflet';
import { useIntl } from 'react-intl';
import Header from "../components/Header";
import muensterdiscovery_logo from "../assets/logo.png";
import profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";

export default function Profile() {
    const intl = useIntl();
    // Mock explored areas (beispielhafte Bereiche in Münster)
    const exploredAreas: LatLngBoundsExpression[] = [
        [[51.955, 7.620], [51.965, 7.635]], // Altstadt
        [[51.945, 7.610], [51.950, 7.620]], // Hafen
        [[51.960, 7.630], [51.968, 7.645]], // Promenade
    ];

    const munsterCenter: [number, number] = [51.9607, 7.6261];

    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <Header />
            
            {/* Content Container */}
            <VStack gap={6} mt="80px" px={4}>
                {/* Begrüßungstext */}
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {intl.formatMessage({ id: "profile.greeting" }, { username: "BavariaOne" })}
                </Text>

                {/* Profilbild und Buttons */}
                <HStack gap={6} align="start" flexWrap="wrap" justify="center">
                    <Image
                        src={profile_image}
                        alt="Profilbild"
                        borderRadius="full"
                        boxSize="120px"
                        border="4px solid"
                        borderColor="orange.400"
                    />
                    
                    <VStack gap={3} align="stretch">
                        <Button colorPalette="orange" size="sm" width="200px">
                            {intl.formatMessage({ id: "profile.change_picture" })}
                        </Button>
                        <Button colorPalette="orange" size="sm" width="200px" variant="outline">
                            {intl.formatMessage({ id: "profile.change_data" })}
                        </Button>
                        <Button colorPalette="red" size="sm" width="200px" variant="outline">
                            {intl.formatMessage({ id: "profile.logout" })}
                        </Button>
                    </VStack>
                </HStack>

                {/* Explorierte Bereiche - Karte */}
                <Box width="100%" maxW="600px">
                    <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={2}>
                        {intl.formatMessage({ id: "profile.explored_areas" })}
                    </Text>
                    <Box 
                        height="300px" 
                        borderRadius="lg" 
                        overflow="hidden" 
                        border="2px solid" 
                        borderColor="orange.300"
                    >
                        <MapContainer
                            center={munsterCenter}
                            zoom={13}
                            style={{ width: '100%', height: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* Explorierte Bereiche als grüne Rechtecke */}
                            {exploredAreas.map((bounds, index) => (
                                <Rectangle
                                    key={index}
                                    bounds={bounds}
                                    pathOptions={{
                                        color: '#48bb78',
                                        fillColor: '#48bb78',
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                />
                            ))}
                        </MapContainer>
                    </Box>
                </Box>

                {/* Favoriten-Routen */}
                <Box width="100%" maxW="600px">
                    <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={2}>
                        {intl.formatMessage({ id: "profile.favorites" })}
                    </Text>
                    <VStack gap={3} align="stretch">
                        <Button colorPalette="orange" variant="outline" size="lg" width="100%">
                            🚴 {intl.formatMessage({ id: "profile.route1" })}
                        </Button>
                        <Button colorPalette="orange" variant="outline" size="lg" width="100%">
                            🌳 {intl.formatMessage({ id: "profile.route2" })}
                        </Button>
                    </VStack>
                </Box>

                {/* Auszeichnungen */}
                <Box width="100%" maxW="600px">
                    <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={4}>
                        {intl.formatMessage({ id: "profile.achievements" })}
                    </Text>
                    
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                        {/* Auszeichnung 1 */}
                        <VStack gap={2}>
                            <Box
                                p={2}
                                borderRadius="full"
                                border="4px solid"
                                borderColor="gold"
                                bg="white"
                            >
                                <Image
                                    src={muensterdiscovery_logo}
                                    alt={intl.formatMessage({ id: "profile.achievement1_title" })}
                                    boxSize="80px"
                                />
                            </Box>
                            <Text fontWeight="bold" textAlign="center" fontSize="md">
                                {intl.formatMessage({ id: "profile.achievement1_title" })}
                            </Text>
                            <Text textAlign="center" fontSize="sm" color="gray.600">
                                {intl.formatMessage({ id: "profile.achievement1_desc" })}
                            </Text>
                        </VStack>

                        {/* Auszeichnung 2 */}
                        <VStack gap={2}>
                            <Box
                                p={2}
                                borderRadius="full"
                                border="4px solid"
                                borderColor="orange.400"
                                bg="white"
                            >
                                <Image
                                    src={muensterdiscovery_logo}
                                    alt={intl.formatMessage({ id: "profile.achievement2_title" })}
                                    boxSize="80px"
                                />
                            </Box>
                            <Text fontWeight="bold" textAlign="center" fontSize="md">
                                {intl.formatMessage({ id: "profile.achievement2_title" })}
                            </Text>
                            <Text textAlign="center" fontSize="sm" color="gray.600">
                                {intl.formatMessage({ id: "profile.achievement2_desc" })}
                            </Text>
                        </VStack>

                        {/* Auszeichnung 3 */}
                        <VStack gap={2}>
                            <Box
                                p={2}
                                borderRadius="full"
                                border="4px solid"
                                borderColor="green.400"
                                bg="white"
                            >
                                <Image
                                    src={muensterdiscovery_logo}
                                    alt={intl.formatMessage({ id: "profile.achievement3_title" })}
                                    boxSize="80px"
                                />
                            </Box>
                            <Text fontWeight="bold" textAlign="center" fontSize="md">
                                {intl.formatMessage({ id: "profile.achievement3_title" })}
                            </Text>
                            <Text textAlign="center" fontSize="sm" color="gray.600">
                                {intl.formatMessage({ id: "profile.achievement3_desc" })}
                            </Text>
                        </VStack>
                    </Grid>
                </Box>
            </VStack>
        </Box>
    );
}