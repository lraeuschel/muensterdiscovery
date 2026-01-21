import { useState, useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, Image, Button, Grid } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useIntl } from 'react-intl';
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import muensterdiscovery_logo from "../assets/logo.png";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import { useNavigate } from "react-router-dom";
import type { User, Achievement, POI } from "../types";
import { getCurrentUser, getCurrentUserProfile, getUserAchievements, getVisitedPOIs } from "../services/DatabaseConnection";
import { supabase } from "../SupabaseClient";

export default function Profile() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string>(default_profile_image);

    <Box data-lang={currentLang}></Box>

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    // State für Profilbild

    // Handler für Bildauswahl
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // 1. Validierung
        if (!file.type.startsWith('image/')) {
                alert(intl.formatMessage({ id: "profile.invalid_image" }));
                return;
            }

        // 2. Lade das Bild zu Supabase Storage hoch
        await uploadProfileImage(file);
    };

    const uploadProfileImage = async (file: File) => {
        // Hole den aktuellen Benutzer
        const user = await getCurrentUser();

        if (!user) {
            console.error("Error fetching user:");
            return;
        }

        // Erstelle einen eindeutigen Dateinamen
        const filePath = `${user.id}/profile_image.jpg`;

        // Lade das Bild zu Supabase Storage hoch
        const { error: uploadError } = await supabase.storage
            .from('profile_images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type,
            });
        
        if (uploadError) {
            console.error("Error uploading image:", uploadError);
            return;
        }

        // Hole die Signed URL des hochgeladenen Bildes
        await loadProfileImage(user.id);
    };

    const loadProfileImage = async (userId: string) => {
        const { data } = supabase.storage
            .from('profile_images')
            .getPublicUrl(`${userId}/profile_image.jpg`);

        if (data.publicUrl) {
            setProfileImage(data.publicUrl);
        } else {
            setProfileImage(default_profile_image);
        }
    };



    const handleChangeProfilePicture = () => {
        fileInputRef.current?.click();
    };

    const [profile, setProfile] = useState<User | null>(null); // Benutzerprofil
    const [myAchievements, setMyAchievements] = useState<Achievement[]>([]); // Verdiente Auszeichnungen
    const [visitedPOIs, setVisitedPOIs] = useState<POI[]>([]); // Besuchte POIs


    const munsterCenter: [number, number] = [51.9607, 7.6261];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    navigate("/login");
                    return;
                }

                const [profileData, achievements, pois] = await Promise.all([
                    getCurrentUserProfile(user.id),
                    getUserAchievements(user.id),
                    getVisitedPOIs(user.id),
                ]);

                // Public URL statt Signed URL
                loadProfileImage(user.id);

                setProfile(profileData);
                setMyAchievements(achievements);
                setVisitedPOIs(pois);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [navigate]);


    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <CompLangHeader />

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
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = default_profile_image;
                        }}
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
                                <Marker key={poi.id} position={[poi.lat, poi.lon]}>
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