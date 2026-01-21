import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, HStack, Image, Button, Avatar, Text, VStack } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import { languageItems, currentLanguage, setCurrentLanguage } from "./languageSelector";
import muensterdiscovery_logo from "../assets/logo.png";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import { useIntl } from "react-intl";

// icons
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { CiRoute } from "react-icons/ci";
import { MdOutlineLeaderboard } from "react-icons/md";
import { IoEarthOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { RiHome2Line } from "react-icons/ri";

import { Collapsible } from "@chakra-ui/react"; // Chakra v3

export default function CompLangHeader() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const intl = useIntl();

    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    const menuItems = [
        { value: "welcome", icon: RiHome2Line, path: "/" },
        { value: "profile", icon: CgProfile, path: "/profile" },
        { value: "open-world", icon: IoEarthOutline, path: "/openworld" },
        { value: "leaderboard", icon: MdOutlineLeaderboard, path: "/leaderboard" },
        { value: "routeselection", icon: CiRoute, path: "/routeselection" },
        { value: "help", icon: IoIosHelpCircleOutline, path: "/help" }
    ];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

        return () => subscription.unsubscribe();
    }, []);

    const getProfileImage = (userId: string) => {
        const { data } = supabase.storage
            .from('profile_images')
            .getPublicUrl(`${userId}/profile_image.jpg`);
        return data.publicUrl ?? default_profile_image;
    };

    const handleProfileClick = () => navigate("/profile");

    const boxStyles = {
        position: "fixed" as const,
        top: "10px",
        zIndex: 1000,
        bg: "white",
        boxShadow: "md",
        borderRadius: "full",
        overflow: "hidden",
        transition: "all 0.25s ease",
    };

    return (
        <>
            {/* --- LINKES MENÜ --- */}
            <Box
                {...boxStyles}
                left="10px"
                borderRadius="2xl"        // feste abgerundete Ecken
                overflow="hidden"
                transition="height 0.25s ease"
            >
                <VStack align="start" gap={0}>
                    {/* Obere Zeile: Hamburger + Logo */}
                    <HStack gap={2} align="center" p={2}>
                        <Button
                            variant="ghost"
                            size="md"
                            _hover={{ bg: "orange.100" }}
                            onClick={() => setLeftOpen(o => !o)}
                        >
                            <RxHamburgerMenu size={24} />
                        </Button>

                        <Image
                            src={muensterdiscovery_logo}
                            alt="Logo"
                            height="45px"
                            onClick={() => navigate("/")}
                            cursor="pointer"
                            _hover={{ opacity: 0.8 }}
                            transition="opacity 0.2s"
                        />
                    </HStack>

                    {/* Expandierender Bereich */}
                    <Collapsible.Root open={leftOpen}>
                        <Collapsible.Content>
                            <VStack align="stretch" gap={1} px={2} pb={2}>
                                {menuItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <HStack
                                            key={item.value}
                                            px={3}
                                            py={2.5}
                                            borderRadius="xl"
                                            cursor="pointer"
                                            _hover={{ bg: "orange.50" }}
                                            onClick={() => {
                                                navigate(item.path);
                                                setLeftOpen(false);
                                            }}
                                        >
                                            <Box color="orange.500"><Icon size={20} /></Box>
                                            <Text fontWeight="600" color="gray.700">
                                                {intl.formatMessage({ id: `menu.${item.value}` })}
                                            </Text>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </VStack>
            </Box>



            {/* --- RECHTER BEREICH (Sprache + Avatar) --- */}
            <Box {...boxStyles} left="10px" borderRadius="2xl" overflow="hidden" transition="height 0.25s ease">
                <VStack align="start" gap={0}>
                    {/* Linke obere Zeile: Hamburger + Logo */}
                    <HStack gap={2} align="center" p={2}>
                        <Button
                            variant="ghost"
                            size="md"
                            _hover={{ bg: "orange.100" }}
                            onClick={() => setLeftOpen(o => !o)}
                        >
                            <RxHamburgerMenu size={24} />
                        </Button>

                        <Image
                            src={muensterdiscovery_logo}
                            alt="Logo"
                            height="45px"
                            onClick={() => navigate("/")}
                            cursor="pointer"
                            _hover={{ opacity: 0.8 }}
                            transition="opacity 0.2s"
                        />
                    </HStack>

                    {/* Linke expandierende Menüpunkte */}
                    <Collapsible.Root open={leftOpen}>
                        <Collapsible.Content>
                            <VStack align="stretch" gap={1} px={2} pb={2}>
                                {menuItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <HStack
                                            key={item.value}
                                            px={3}
                                            py={2.5}
                                            borderRadius="xl"
                                            cursor="pointer"
                                            _hover={{ bg: "orange.50" }}
                                            onClick={() => {
                                                navigate(item.path);
                                                setLeftOpen(false);
                                            }}
                                        >
                                            <Box color="orange.500"><Icon size={20} /></Box>
                                            <Text fontWeight="600" color="gray.700">
                                                {intl.formatMessage({ id: `menu.${item.value}` })}
                                            </Text>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </VStack>
            </Box>

            {/* --- Rechte Seite: Sprache + Avatar --- */}
            <Box {...boxStyles} right="10px" borderRadius="2xl" overflow="hidden" transition="height 0.25s ease">
                <VStack align="start" gap={0}>
                    {/* Obere Zeile: Sprache + Avatar */}
                    <HStack gap={2} align="center" p={2}>
                        <Button
                            variant="ghost"
                            size="md"
                            fontWeight="600"
                            _hover={{ bg: "orange.100" }}
                            px={3}
                            onClick={() => setRightOpen(o => !o)}
                        >
                            {languageItems.find(l => l.value === currentLanguage)?.label}
                        </Button>

                        {user ? (
                            <Avatar.Root
                                size="md"
                                onClick={handleProfileClick}
                                cursor="pointer"
                                bg="orange.500"
                                _hover={{ opacity: 0.8 }}
                            >
                                <Avatar.Image
                                    src={getProfileImage(user.id)}
                                    border="3px solid"
                                    borderColor="orange.400"
                                />
                                <Avatar.Fallback color="white" />
                            </Avatar.Root>
                        ) : (
                            <Button
                                size="md"
                                colorScheme="orange"
                                bg="orange.500"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </Button>
                        )}
                    </HStack>

                    {/* Rechte expandierende Sprache */}
                    <Collapsible.Root open={rightOpen}>
                        <Collapsible.Content>
                            <VStack align="stretch" gap={1} px={2} pb={2}>
                                {languageItems.map(language => (
                                    <HStack
                                        key={language.value}
                                        px={3}
                                        py={2.5}
                                        borderRadius="xl"
                                        cursor="pointer"
                                        _hover={{ bg: "orange.50" }}
                                        onClick={() => {
                                            setCurrentLanguage(language.value);
                                            setRightOpen(false);
                                        }}
                                    >
                                        <Text fontWeight="600" color="gray.700" flex="1">
                                            {language.label}
                                        </Text>
                                        {language.value === currentLanguage && (
                                            <Box w="6px" h="6px" borderRadius="full" bg="orange.400" />
                                        )}
                                    </HStack>
                                ))}
                            </VStack>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </VStack>
            </Box>

        </>
    );
}
