import { Box, VStack, Text, HStack, Image, Link as ChakraLink, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import MenuComponent from "../components/menu";
import LanguageSelector from "../components/languageSelector";
import muensterdiscovery_logo from "../assets/logo.png";
import type { LanguageType } from "../components/languageSelector";
import { useIntl } from "react-intl";

export default function Imprint({ setLanguage }: { setLanguage: (lang: LanguageType) => void }) {
    const intl = useIntl();
    const navigate = useNavigate();

    return (
        <Box bg="orange.50" minH="100vh" p={4}>
            {/* Header */}
            <HStack justify="space-between" mb={8}>
                <MenuComponent />
                <LanguageSelector setLanguage={setLanguage} />
            </HStack>

            {/* Logo */}
            <VStack spacing={6} align="center">
                <Image src={muensterdiscovery_logo} alt="Muenster Discovery Logo" boxSize="200px" />

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
                    spacing={4}
                    bg="white"
                    p={6}
                    rounded="lg"
                    shadow="md"
                    maxW="600px"
                    w="full"
                >
                    <Text>
                        {intl.formatMessage({ id: "imprint.content" })}{" "}
                        <ChakraLink 
                            href="https://github.com/lraeuschel/muensterdiscovery" 
                            isExternal 
                            color="orange.500"
                        >
                            GitHub Repository
                        </ChakraLink>
                    </Text>
                </VStack>

                {/* Footer */}
                <VStack mt={8} spacing={2}>
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
