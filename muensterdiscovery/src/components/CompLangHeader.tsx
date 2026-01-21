import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, HStack, Image, Button, Avatar, Menu, Portal, Text } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import MenuComponent from "./menu";
import { languageItems, currentLanguage, setCurrentLanguage } from "./languageSelector";
//import type { LanguageType } from "./languageSelector";
import muensterdiscovery_logo from "../assets/logo.png";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";


export default function CompLangHeader() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    <Box data-lang={currentLanguage}></Box>

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

        return data.publicUrl; // Das ist die direkte URL zum Bild
    };


    const handleProfileClick = () => {
        navigate("/profile");
    };

    const boxStyles = {
        position: "fixed" as const,
        top: "10px",
        zIndex: 1000,
        bg: "white",
        borderRadius: "full",
        p: 2,
        boxShadow: "md"
    };

    return (
        <>
            {/* --- LINKE SEITE (Menü + Logo) --- */}
            <Box
                {...boxStyles}
                left="10px"
            >
                <HStack gap={3}>
                    <MenuComponent />
                    <Image
                        src={muensterdiscovery_logo}
                        alt="Münster Discovery Logo"
                        height="40px"
                        onClick={() => navigate("/")}
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                        transition="opacity 0.2s"
                        border="0px"
                        bg="white"
                    />
                </HStack>
            </Box>

            {/* --- RECHTE SEITE (Sprache + Profil / Login) --- */}
            <Box
                {...boxStyles}
                right="10px"
            >
                <HStack gap={3}>
                    {/* Language Selector */}
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                fontWeight="600"
                                _hover={{ bg: "orange.100" }}
                                px={3}
                            >
                                {languageItems.find(l => l.value === currentLanguage)?.label}
                            </Button>
                        </Menu.Trigger>

                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content
                                    bg="white"
                                    borderRadius="2xl"
                                    boxShadow="xl"
                                    border="1px solid"
                                    borderColor="orange.200"
                                    p={2}
                                    minW="140px"
                                >
                                    {languageItems.map(language => (
                                        <Menu.Item
                                            key={language.value}
                                            value={language.value}
                                            onClick={() => setCurrentLanguage(language.value)}
                                            borderRadius="xl"
                                            px={3}
                                            py={2.5}
                                            _hover={{ bg: "orange.50" }}
                                            _focus={{ bg: "orange.100" }}
                                        >
                                            <HStack justify="space-between" w="full">
                                                <Text
                                                    fontWeight="600"
                                                    color="gray.700"
                                                    fontSize="sm"
                                                >
                                                    {language.label}
                                                </Text>

                                                {language.value === currentLanguage && (
                                                    <Box
                                                        w="6px"
                                                        h="6px"
                                                        borderRadius="full"
                                                        bg="orange.400"
                                                    />
                                                )}
                                            </HStack>
                                        </Menu.Item>
                                    ))}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>


                    {/* Login / Avatar */}
                    {user ? (
                        <Avatar.Root
                            size="sm"
                            onClick={handleProfileClick}
                            cursor="pointer"
                            bg="orange.500"
                            _hover={{ opacity: 0.8 }}
                        >
                            <Avatar.Image src={getProfileImage(user?.id ?? "")} loading="eager" />
                            <Avatar.Fallback color="white">
                                {default_profile_image}
                            </Avatar.Fallback>
                        </Avatar.Root>
                    ) : (
                        <Button
                            size="sm"
                            colorScheme="orange"
                            bg="orange.500"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                    )}
                </HStack>
            </Box>
        </>
    );
}
