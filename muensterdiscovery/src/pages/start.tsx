import { useState, useEffect } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useIntl } from 'react-intl';
import { useNavigate } from "react-router-dom";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import RideyChat from "../components/RideyChat";
import { supabase } from "../SupabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Start() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/welcome");
                return;
            }
            setUser(session.user);
            setIsLoading(false);
        };
        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return (
            <Box bg="orange.50" minH="100vh">
                <CompLangHeader />
                <VStack mt="80px">
                    <Text>{intl.formatMessage({ id: "common.loading" })}</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <CompLangHeader />
            {<RideyChat currentLanguage={currentLang} />}

            {/* Content Container */}
            <VStack gap={6} mt="80px" px={4} align="center">
                {/* Placeholder for additional content */}
            </VStack>
        </Box>
    );
}
