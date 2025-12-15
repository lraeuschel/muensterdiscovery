import { useState, useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, Image, Button, Grid } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useIntl } from 'react-intl';
import Header from "../components/Header";
import muensterdiscovery_logo from "../assets/logo.png";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router-dom";

type User = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

type Achievement = {
    id: number;
    achievement: string;
    description: string;
}

type POI = {
    id: number;
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
}

export default function Profile() {
    const intl = useIntl();
    const navigate = useNavigate();
    
    // State für Profilbild
    const [profileImage, setProfileImage] = useState<string>(default_profile_image);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handler für Bildauswahl
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validierung: Nur Bilder erlauben
            if (!file.type.startsWith('image/')) {
                alert(intl.formatMessage({ id: "profile.invalid_image" }));
                return;
            }
            // Erstelle eine lokale URL für das Bild
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleChangeProfilePicture = () => {
        fileInputRef.current?.click();
    };

    // Mock explored areas (beispielhafte Bereiche in Münster)
    // const exploredAreas: LatLngBoundsExpression[] = [
    //     [[51.955, 7.620], [51.965, 7.635]], // Altstadt
    //     [[51.945, 7.610], [51.950, 7.620]], // Hafen
    //     [[51.960, 7.630], [51.968, 7.645]], // Promenade
    // ];

    const [profile, setProfile] = useState<User | null>(null); // Benutzerprofil
    const [myAchievements, setMyAchievements] = useState<Achievement[]>([]); // Verdiente Auszeichnungen
    const [visitedPOIs, setVisitedPOIs] = useState<POI[]>([]); // Besuchte POIs


    const munsterCenter: [number, number] = [51.9607, 7.6261];

    useEffect(() => {
        const fetchUserData = async () => {
            try {

                // Prüfe eingeloggten User
                const {data: { user }} = await supabase.auth.getUser(); // Speichere daten in Variable user
                if (!user) {
                    navigate("/login");
                    return;
                }

                // Hole Profilinformationen
                const {data: profileData, error: profileError} = await supabase // Speicherung der Daten in profileData
                    .from("profiles")
                    .select("id, first_name, last_name, username, email")
                    .eq("id", user.id)
                    .single();
                if (profileError) throw profileError;
                setProfile(profileData);

                // Hole verdiente Auszeichnungen
                const {data: achievementData, error: achievementError} = await supabase
                    .from("user_achievements")
                    .select("achievements(id, achievement, description)")
                    .eq('profile_id', user.id);
                if (achievementError) throw achievementError;
                if (achievementData) {
                    const achievements = achievementData.map((item: any) => item.achievements); // Extrahiere die Achievement-Daten aus dem verschachtelten Objekt
                    setMyAchievements(achievements);
                }

                console.log("Profile data loaded:", profileData);
                console.log("Achievements data loaded:", achievementData);

                // Hole besuchte POIs
                const {data: poiData, error: poiError} = await supabase
                    .from("user_POIs")
                    .select("POIs(id, name, description, location)")
                    .eq('profile_id', user.id);
                if (poiError) throw poiError;
                if (poiData) {
                    console.log("Rohdaten POIs:", poiData);
                    const pois = poiData.map((item: any) => item.POIs);
                    setVisitedPOIs(pois);
                }


            } catch (error) {
                console.error("Fehler beim Laden der Profildaten:", error);
            }
        };

        fetchUserData();
    }, [navigate, intl]);

    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <Header />
            
            {/* Content Container */}
            <VStack gap={6} mt="80px" px={4}>
                {/* Begrüßungstext */}
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {intl.formatMessage({ id: "profile.greeting" }, { username: profile?.username ?? "BavariaOne" })}
                </Text>

                {/* Profilbild und Buttons */}
                <HStack gap={6} align="start" flexWrap="wrap" justify="center">
                    <Image
                        src={profileImage}
                        alt="Profilbild"
                        borderRadius="full"
                        boxSize="120px"
                        border="4px solid"
                        borderColor="orange.400"
                        objectFit="cover"
                    />
                    
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    
                    <VStack gap={3} align="stretch">
                        <Button colorPalette="orange" size="sm" width="200px" onClick={handleChangeProfilePicture}>
                            {intl.formatMessage({ id: "profile.change_picture" })}
                        </Button>
                        <Button colorPalette="orange" size="sm" width="200px" variant="outline">
                            {intl.formatMessage({ id: "profile.change_data" })}
                        </Button>
                        <Button
                            colorPalette="orange" size="sm" width="200px"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                navigate("/login");
                            }}
                        >
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
                            
                            {/* Explorierte POIs als Marker */}
                            {visitedPOIs.map((poi) => (
                                <Marker key={poi.id} position={[poi.location.coordinates[1], poi.location.coordinates[0]]}>
                                    <Popup>
                                        Besucht: {poi.name}
                                    </Popup>
                                </Marker>
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
                        {myAchievements.length === 0 ? (
                            <Text color="orange.500">
                                Noch keine Auszeichnungen verdient.
                            </Text>
                        ) : (
                            myAchievements.map((achievement) => (
                                <VStack gap={2} key={achievement.id}>
                                    <Box
                                        p={2}
                                        borderRadius="full"
                                        border="4px solid"
                                        borderColor="gold" 
                                        bg="white"
                                    >
                                    <Image
                                        src={muensterdiscovery_logo} // Fallback Logo
                                        alt={achievement.achievement}
                                        boxSize="80px"
                                        borderRadius="full"
                                    />
                                    </Box>
                                    <Text fontWeight="bold" textAlign="center" fontSize="md">
                                        {achievement.achievement}
                                    </Text>
                                    <Text textAlign="center" fontSize="sm" color="gray.600">
                                        {achievement.description}
                                    </Text>
                                </VStack>
                                    ))
                        )}
                    </Grid>
                </Box>
            </VStack>
        </Box>
    );
}