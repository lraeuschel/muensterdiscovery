import { useState, useRef, useEffect, useMemo } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Button,
    Grid,
    Separator
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
    getVoronoiPolygons,
    checkAndUnlockPoiAchievements
} from "../services/DatabaseConnection";
import { supabase } from "../SupabaseClient";

export default function Profile() {
    const intl = useIntl();
    const navigate = useNavigate();

    // ---------------- Language ----------------
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange(setCurrentLang);
        return unsubscribe;
    }, []);

    // ---------------- Profile Image ----------------
    const [profileImage, setProfileImage] = useState<string>(default_profile_image);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChangeProfilePicture = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert(intl.formatMessage({ id: "profile.invalid_image" }));
            return;
        }

        // Sofortiges Preview
        setProfileImage(URL.createObjectURL(file));

        await uploadProfileImage(file);
    };

    const uploadProfileImage = async (file: File) => {
        const user = await getCurrentUser();
        if (!user) return;

        const filePath = `${user.id}/profile_image.jpg`;

        const { error } = await supabase.storage
            .from("profile_images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type
            });

        if (error) {
            console.error("Error uploading image:", error);
            return;
        }

        await loadProfileImage(user.id);
    };

    const loadProfileImage = async (userId: string) => {
        const { data } = supabase.storage
            .from("profile_images")
            .getPublicUrl(`${userId}/profile_image.jpg`);

        setProfileImage(data?.publicUrl ?? default_profile_image);
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

            try {
                await checkAndUnlockPoiAchievements(user.id);
            } catch (e) {
                console.error("Fehler beim Prüfen der Achievements:", e);
            }

            const [profileData, achievements, pois, voronoiData] =
                await Promise.all([
                    getCurrentUserProfile(user.id),
                    getUserAchievements(user.id),
                    getVisitedPOIs(user.id),
                    getVoronoiPolygons()
                ]);

            loadProfileImage(user.id);

            setProfile(profileData);
            setMyAchievements(achievements);
            setVisitedPOIs(pois);
            setVoronois(voronoiData);
        };

        fetchData();
    }, [navigate]);

    // ---------------- Helpers ----------------
    const visitedPoiIds = useMemo(
        () => new Set(visitedPOIs.map(p => p.id)),
        [visitedPOIs]
    );

    const geoJsonToLatLngs = (geojson: any): [number, number][][][] => {
        const g = geojson.type === "Feature" ? geojson.geometry : geojson;

        if (g.type === "MultiPolygon") {
            return g.coordinates.map((polygon: number[][][]) =>
                polygon.map((ring: number[][]) =>
                    ring.map(([lon, lat]) => [lat, lon])
                )
            );
        }

        if (g.type === "Polygon") {
            return [
                g.coordinates.map((ring: number[][]) =>
                    ring.map(([lon, lat]) => [lat, lon])
                )
            ];
        }

        return [];
    };

    // ---------------- Render ----------------
    return (
        <Box minH="100vh" bg="orange.50" data-lang={currentLang}>
            <CompLangHeader />

            <VStack
                gap={{ base: 6, md: 8 }}
                pt={{ base: "80px", md: "90px" }}
                pb={{ base: 6, md: 10 }}
                px={{ base: 3, md: 8 }}
                maxW="1200px"
                mx="auto"
            >
                {/* HERO CARD */}
                <Box
                    w="full"
                    bg="white"
                    borderRadius="3xl"
                    boxShadow="xl"
                    p={{ base: 6, md: 8 }}
                    border="1px solid"
                    borderColor="orange.200"
                >
                    <HStack
                        gap={{ base: 4, md: 6 }}
                        align={{ base: "center", md: "flex-start" }}
                        flexDirection={{ base: "column", md: "row" }}
                        textAlign={{ base: "center", md: "left" }}
                    >
                        <Image
                            src={profileImage}
                            boxSize={{ base: "100px", md: "120px" }}
                            borderRadius="full"
                            border="4px solid"
                            borderColor="orange.400"
                            objectFit="cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                    default_profile_image;
                            }}
                        />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            hidden
                        />

                        <VStack
                            align={{ base: "center", md: "flex-start" }}
                            gap={3}
                            flex="1"
                        >
                            <Text fontSize="2xl" fontWeight="800" color="orange.600">
                                {intl.formatMessage(
                                    { id: "profile.greeting" },
                                    { username: profile?.username ?? "Explorer" }
                                )}
                            </Text>

                            <Separator borderColor="orange.200" />

                            <HStack
                                gap={2}
                                flexWrap="wrap"
                                justify={{ base: "center", md: "flex-start" }}
                            >
                                <Button
                                    size="sm"
                                    colorScheme="orange"
                                    onClick={handleChangeProfilePicture}
                                >
                                    {intl.formatMessage({ id: "profile.change_picture" })}
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={async () => {
                                        await supabase.auth.signOut();
                                        navigate("/login");
                                    }}
                                >
                                    {intl.formatMessage({ id: "profile.logout" })}
                                </Button>
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>

                {/* MAP CARD */}
                <Box
                    w="full"
                    bg="white"
                    borderRadius="3xl"
                    boxShadow="xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="orange.200"
                >
                    <Box h={{ base: "260px", sm: "300px", md: "380px" }}>
                        <MapContainer
                            center={[51.9607, 7.6261]}
                            zoom={12}
                            style={{ height: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap & CARTO'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />

                            {voronois.map(v => {
                                const visited = visitedPoiIds.has(v.id);

                                return (
                                    <Polygon
                                        key={v.id}
                                        positions={geoJsonToLatLngs(v.geoJSON)}
                                        pathOptions={{
                                            color: visited ? "#9b2c2c" : "#718096",
                                            fillColor: visited ? "#feb2b2" : "#e2e8f0",
                                            fillOpacity: 0.2,
                                            weight: visited ? 3 : 1
                                        }}
                                    />
                                );
                            })}

                            {visitedPOIs.map(poi => (
                                <Marker
                                    key={poi.id}
                                    position={[poi.lat, poi.lon]}
                                    icon={L.icon({
                                        iconUrl: marker_rot,
                                        iconSize: [30, 30],
                                        iconAnchor: [15, 30]
                                    })}
                                >
                                    <Popup offset={[0, -20]}>
                                        <strong>{poi.name}</strong>
                                        <br />
                                        {intl.formatMessage({ id: "profile.visited_at" })}{" "}
                                        {intl.formatDate(new Date(poi.visited), {
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                        })}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Box>
                </Box>

                {/* ACHIEVEMENTS */}
                <Box w="full">
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)"
                        }}
                        gap={{ base: 4, md: 6 }}
                    >
                        {myAchievements.map(a => (
                            <Box
                                key={a.id}
                                bg="white"
                                borderRadius="2xl"
                                p={5}
                                boxShadow="md"
                                textAlign="center"
                                border="1px solid"
                                borderColor="orange.200"
                            >
                                <Image
                                    src={muensterdiscovery_logo}
                                    boxSize="70px"
                                    mx="auto"
                                    mb={3}
                                />
                                <Text fontWeight="700" color="orange.700">
                                    {a.achievement}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    {a.description}
                                </Text>
                            </Box>
                        ))}
                    </Grid>
                </Box>
            </VStack>
        </Box>
    );
}
