import { useState, useRef, useEffect, useMemo } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Button,
    Grid,
} from "@chakra-ui/react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";

import muensterdiscovery_logo from "../assets/logo.png";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import marker_rot from "../icons/marker_rot.svg";

import type { User, Achievement, VisitedPOI, Voronoi } from "../types";
import {
    getCurrentUser,
    getCurrentUserProfile,
    getUserAchievements,
    getVisitedPOIs,
    getVoronoiPolygons
} from "../services/DatabaseConnection";
import { supabase } from "../SupabaseClient";

export default function Profile() {
    const intl = useIntl();
    const navigate = useNavigate();

    // ---------------- Language ----------------
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string>(default_profile_image);

    <Box data-lang={currentLang}></Box>

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange(setCurrentLang);
        return unsubscribe;
    }, []);

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


    // ---------------- Data ----------------
    const [profile, setProfile] = useState<User | null>(null);
    const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
    const [visitedPOIs, setVisitedPOIs] = useState<VisitedPOI[]>([]);
    const [voronois, setVoronois] = useState<Voronoi[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const user = await getCurrentUser();
            if (!user) {
                navigate("/login");
                return;
            }

            const [
                profileData,
                achievements,
                visitedpois,
                voronoiData
            ] = await Promise.all([
                getCurrentUserProfile(user.id),
                getUserAchievements(user.id),
                getVisitedPOIs(user.id),
                getVoronoiPolygons()
            ]);

            loadProfileImage(user.id);

            setProfile(profileData);
            setMyAchievements(achievements);

            setVisitedPOIs(visitedpois);
            setVoronois(voronoiData);
        };

        fetchData();
    }, [navigate]);


    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    const visitedPoiIds = useMemo(
        () => new Set(visitedPOIs.map(p => p.id)),
        [visitedPOIs]
    );

    console.log("Visited POI IDs:", visitedPoiIds);

    const geoJsonToLatLngs = (geojson: any): [number, number][][][] => {
        const geometry = geojson.type === "Feature"
            ? geojson.geometry
            : geojson;

        if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.map(
                (polygon: number[][][]) =>
                    polygon.map(
                        (ring: number[][]) =>
                            ring.map(
                                (coord: number[]) => [coord[1], coord[0]]
                            )
                    )
            );
        }

        if (geometry.type === "Polygon") {
            return [
                geometry.coordinates.map(
                    (ring: number[][]) =>
                        ring.map(
                            (coord: number[]) => [coord[1], coord[0]]
                        )
                )
            ];
        }

        return [];
    };



    const munsterCenter: [number, number] = [51.9607, 7.6261];

    // ---------------- Render ----------------
    return (
        <Box bg="orange.50" minH="100vh" pb={8} data-lang={currentLang}>
            <CompLangHeader />

            <VStack gap={6} mt="80px" px={4}>
                {/* Greeting */}
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {intl.formatMessage(
                        { id: "profile.greeting" },
                        { username: profile?.username ?? "BavariaOne" }
                    )}
                </Text>

                {/* Profile image + buttons */}
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

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />

                    <VStack gap={3}>
                        <Button colorPalette="orange" size="sm" width="200px" onClick={handleChangeProfilePicture}>
                            {intl.formatMessage({ id: "profile.change_picture" })}
                        </Button>
                        <Button colorPalette="orange" size="sm" width="200px" variant="outline">
                            {intl.formatMessage({ id: "profile.change_data" })}
                        </Button>
                        <Button
                            colorPalette="orange"
                            size="sm"
                            width="200px"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                navigate("/login");
                            }}
                        >
                            {intl.formatMessage({ id: "profile.logout" })}
                        </Button>
                    </VStack>
                </HStack>

                {/* Map */}
                <Box width="100%" maxW="600px">
                    <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={2}>
                        {intl.formatMessage({ id: "profile.explored_areas" })}
                    </Text>

                    <Box height="300px" borderRadius="lg" overflow="hidden" border="2px solid" borderColor="orange.300">
                        <MapContainer
                            center={munsterCenter}
                            zoom={12}
                            style={{ width: "100%", height: "100%" }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Voronoi Polygons */}
                            {voronois.map(v => {
                                const isVisited = visitedPoiIds.has(v.id);

                                return (
                                    <Polygon
                                        key={v.id}
                                        positions={geoJsonToLatLngs(v.geoJSON)}
                                        pathOptions={{
                                            color: isVisited ? "#c53030" : "#718096",
                                            fillColor: isVisited ? "#fc8181" : "#a0aec0",
                                            fillOpacity: isVisited ? 0.5 : 0.3,
                                            weight: 1
                                        }}
                                    />
                                );
                            })}

                            {/* Visited POI markers */}
                            {visitedPOIs.map(poi => (
                                <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={L.icon({ iconUrl: marker_rot, iconSize: [30, 30], iconAnchor: [15, 30] })}>
                                    <Popup offset={[0, -20]}>{poi.name}, {intl.formatMessage({ id: "profile.visited_at" })} {intl.formatDate(new Date(poi.visited))}, {intl.formatTime(new Date(poi.visited))}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Box>
                </Box>

                {/* Achievements */}
                <Box width="100%" maxW="600px">
                    <Text fontSize="lg" fontWeight="semibold" color="orange.600" mb={4}>
                        {intl.formatMessage({ id: "profile.achievements" })}
                    </Text>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                        {myAchievements.length === 0 ? (
                            <Text color="orange.500">Noch keine Auszeichnungen verdient.</Text>
                        ) : (
                            myAchievements.map(a => (
                                <VStack key={a.id} gap={2}>
                                    <Box p={2} borderRadius="full" border="4px solid" borderColor="gold" bg="white">
                                        <Image src={muensterdiscovery_logo} boxSize="80px" borderRadius="full" />
                                    </Box>
                                    <Text fontWeight="bold" textAlign="center">{a.achievement}</Text>
                                    <Text fontSize="sm" color="gray.600" textAlign="center">{a.description}</Text>
                                </VStack>
                            ))
                        )}
                    </Grid>
                </Box>
            </VStack>
        </Box>
    );
}