import { Box, VStack, Text,Link as ChakraLink, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { useIntl } from "react-intl";
import { useState, useEffect } from "react";

export default function Imprint() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    <Box data-lang={currentLang}></Box>


    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    return (
        <Box bg="orange.50" minH="100vh" p={4}>
            {/* Header */}
            <CompLangHeader />

            {/* Logo */}
            <VStack align="center">

                {/* Title */}
                <Text
                    fontSize={{ base: "2xl", md: "4xl" }}
                    fontWeight="bold"
                    color="orange.500"
                    letterSpacing="wide"
                    textAlign="center"
                    textTransform="uppercase"
                >
                    {intl.formatMessage({ id: "imprint.title" })}
                </Text>

                {/* Content */}
                <VStack
                    bg="white"
                    p={6}
                    rounded="lg"
                    shadow="md"
                    maxW="600px"
                    w="full"
                >
                    <Text textAlign={"center"}>
                        {intl.formatMessage({ id: "imprint.content" })}{" "}
                        <ChakraLink 
                            href="https://github.com/lraeuschel/muensterdiscovery" 
                            color="orange.500"
                        >
                            {intl.formatMessage({ id: "imprint.github_link_text" })}
                        </ChakraLink>
                    </Text>
                </VStack>

                {/* Footer */}
                <VStack mt={8}>
                    <Text color="gray.500" fontSize="sm">
                        © 2025 muensterdiscovery
                    </Text>
                    <Button
                        colorPalette={"orange"}
                        size="lg"
                        onClick={() => navigate("/")}
                        width={"fit-content"}
                    >
                        {intl.formatMessage({ id: "imprint.home_button" })}
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
}
