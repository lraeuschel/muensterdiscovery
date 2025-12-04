import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; 
import { Box, HStack, Image, Button, Avatar } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import MenuComponent from "./menu";
import muensterdiscovery_logo from "../assets/logo.png";

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // 1. Initial den User holen
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // 2. Listener für Login/Logout Events
        // Header ändert sich automatisch wenn z.B. ausgeloggt oder eingeloggt
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Cleanup beim Unmounten
        return () => subscription.unsubscribe();
    }, []);

    const handleProfileClick = () => {
        // Leite zum Profil weiter oder öffne ein Menü
        navigate("/profile");
    };

    const getInitials = (email: string) => {
        return email ? email.charAt(0).toUpperCase() : "U";
    };

    // Gemeinsame Styles für beide "Inseln" (damit sie gleich aussehen)
    const boxStyles = {
        position: "fixed" as const, // "as const" ist für TypeScript wichtig bei position
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
                {...boxStyles} // Styles übernehmen
                left="10px"    // Links positionieren
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
                    // WENN EINGELOGGT: Zeige Avatar
                    <Avatar.Root 
                        size="sm" 
                        onClick={handleProfileClick}
                        cursor="pointer"
                        bg="teal.500"
                        _hover={{ opacity: 0.8 }}
                    >
                        <Avatar.Fallback color="white">
                            {getInitials(user.email || "U")}
                        </Avatar.Fallback>
                        <Avatar.Image src={user.user_metadata?.avatar_url} />
                    </Avatar.Root>
                ) : (
                    // WENN NICHT EINGELOGGT: Zeige Login Button
                    <Button 
                        size="sm" 
                        colorScheme="teal" 
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                )}
            </Box>
        </>
    );
}