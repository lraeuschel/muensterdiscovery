import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";

import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";

import { addUserAchievement, getCurrentUser, getRoutes } from "../services/DatabaseConnection";

export default function Help() {
  const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
  const [userId, setUserId] = useState<string>("");
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onCurrentLanguageChange((lang) => setCurrentLang(lang));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    addUserAchievement(userId, 1);
  }, [userId]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const fetchedRoutes = await getRoutes();
      setRoutes(fetchedRoutes);
    };
    fetchRoutes();
  }, []);

  return (
    <Box data-lang={currentLang} p={4}>
      <CompLangHeader />
      <Text fontSize="lg" mt={4}>
        Help Page — routes loaded: {routes.length}
      </Text>
    </Box>
  );
}
