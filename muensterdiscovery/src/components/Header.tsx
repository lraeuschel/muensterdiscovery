import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, HStack, Button, Avatar } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import LanguageSelector, { currentLanguage, setCurrentLanguage } from "./languageSelector";
import type { LanguageType } from "./languageSelector";

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  return (
    <HStack
      as="header"
      w="100%"
      p={4}
      justify="space-between"
      bg="white"
      boxShadow="md"
      position="fixed"
      top={0}
      zIndex={1000}
      gap={4}
    >
      <Box onClick={() => navigate("/")} cursor="pointer" fontWeight="bold">
        Logo
      </Box>

      <HStack gap={4}>
        <HStack gap={2}>
            <LanguageSelector 
                currentLang={currentLang} 
                setLanguage={handleSetLanguage} 
            />
        </HStack>

        {/* User Auth */}
        {user ? (
          <Box onClick={handleProfileClick} cursor="pointer">
            <Avatar.Root>
              <Avatar.Fallback>
                {getInitials(user.email || "U")}
              </Avatar.Fallback>
              <Avatar.Image src={user.user_metadata?.avatar_url} />
            </Avatar.Root>
          </Box>
        ) : (
          <Button onClick={() => navigate("/login")}>Login</Button>
        )}
      </HStack>
    </HStack>
  );
}
