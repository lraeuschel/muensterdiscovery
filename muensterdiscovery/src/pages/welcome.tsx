import { Link, useNavigate } from "react-router-dom";
import { Box, Button, VStack, Text, Image } from "@chakra-ui/react";
import muensterdiscovery_logo from "../assets/logo.png";
import { useIntl } from "react-intl";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import RideyChat from "../components/RideyChat";
import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";

export default function Welcome() {
    const navigate = useNavigate();
    const intl = useIntl();
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/start");
            }
        };
        checkSession();
    }, [navigate]);

    return (
        <Box bg="orange.50" minH="100vh">
            <CompLangHeader />
            {<RideyChat currentLanguage={currentLang} intl={intl} />}

            <VStack>
                <Text
                    fontSize={{ base: "2xl", md: "4xl" }}
                    fontWeight="bold"
                    color="orange.500"
                    letterSpacing="wide"
                    textAlign="center"
                    textTransform="uppercase"
                    mt={["140px", "100px", "80px"]}
                >
                    {intl.formatMessage({ id: "welcome.title" })}
                </Text>
                <Image src={muensterdiscovery_logo} alt="Muenster Discovery Logo" boxSize="400px"/>
                <Button
                    colorPalette={"orange"}
                    size="lg"
                    onClick={() => navigate("/login")}
                    width={"160px"}
                >
                    {intl.formatMessage({ id: "welcome.login_button" })}
                </Button>
                <Text color="gray.500" fontWeight="semibold" fontSize="sm" whiteSpace="nowrap">
                    {intl.formatMessage({ id: "welcome.or_text" })}
                </Text>
                <Button
                    colorPalette={"orange"}
                    size="lg"
                    onClick={() => navigate("/registration")}
                    width={"160px"}
                >
                    {intl.formatMessage({ id: "welcome.register_button" })}
                </Button>
                <Button
                    colorPalette={"transparent"}
                    size="lg"
                    onClick={() => navigate("/help")}
                    width={"160px"}
                    mt={15}
                >
                    {intl.formatMessage({ id: "welcome.help_button" })}
                </Button>
                <VStack mt={15}>
                    <Text>
                        @2025 muensterdiscovery
                    </Text>
                    <Link to="/imprint">
                        {intl.formatMessage({ id: "welcome.imprint" })}
                    </Link>
                </VStack>
            </VStack>
        </Box>
    );
}
