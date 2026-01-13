import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; 
import { Box, HStack, Image, Button, Avatar } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import MenuComponent from "./menu";
import LanguageSelector, { currentLanguage, setCurrentLanguage } from "./languageSelector";
import type { LanguageType } from "./languageSelector";
import muensterdiscovery_logo from "../assets/logo.png";

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    const handleSetLanguage = (lang: LanguageType) => {
        setCurrentLang(lang);
        setCurrentLanguage(lang);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const getInitials = (email: string) => {
        return email ? email.charAt(0).toUpperCase() : "U";
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
            {}
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
                    />
                </HStack>
            </Box>

            {/* --- RECHTE SEITE (Profil / Login) --- */}
            <Box 
                {...boxStyles} // Styles übernehmen
                right="10px"   // Rechts positionieren
            >
                {/* Conditional Rendering basierend auf dem User State */}
                {user ? (
                    <Avatar.Root 
                        size="sm" 
                        onClick={handleProfileClick}
                        cursor="pointer"
                        bg="orange.500"
                        _hover={{ opacity: 0.8 }}
                    >
                        <Avatar.Fallback color="white">
                            {getInitials(user.email || "U")}
                        </Avatar.Fallback>
                        <Avatar.Image src={user.user_metadata?.avatar_url} />
                    </Avatar.Root>
                ) : (
                    <Button 
                        size="sm" 
                        colorScheme="orange" 
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                )}
            </Box>
        </>
    );
}