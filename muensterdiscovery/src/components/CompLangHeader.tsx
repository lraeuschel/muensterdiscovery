import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, HStack, Button, Avatar, Text } from "@chakra-ui/react";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";
import { languageItems, currentLanguage, setCurrentLanguage } from "./languageSelector";
import type { LanguageType } from "./languageSelector";

export default function CompLangHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<LanguageType>(currentLanguage);

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

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  return (
    <HStack 
      justify="space-between" 
      p={4} 
      bg="white" 
      shadow="md" 
      gap={4}
    >
      <Box onClick={() => navigate("/")} cursor="pointer">
        Logo
      </Box>

      <HStack gap={4}> 
        
        <Text>{languageItems.find((l) => l.value === lang)?.label}</Text>

        <HStack gap={2}>
          {languageItems.map((language) => (
            <Button
              key={language.value}
              size="xs"
              variant={lang === language.value ? "solid" : "outline"}
              onClick={() => {
                setLang(language.value);
                setCurrentLanguage(language.value);
              }}
            >
              {language.label}
            </Button>
          ))}
        </HStack>

        {/* User Auth */}
        {user ? (
          <Avatar.Root size="sm">
            <Avatar.Fallback>
                {getInitials(user.email || "U")}
            </Avatar.Fallback>
            <Avatar.Image src={user.user_metadata?.avatar_url} />
          </Avatar.Root>
        ) : (
          <Button size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </HStack>
    </HStack>
  );
}
