import {
    Box,
    VStack,
    Heading,
    Text,
    Accordion,
    Container,
    Button,
    HStack,
    Icon,
    SimpleGrid,
    Link
} from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { BsQuestionCircleFill, BsInfoCircleFill, BsChatQuoteFill } from "react-icons/bs";
import { FaPaperPlane } from "react-icons/fa";
import CompLangHeader from "../components/CompLangHeader";
import {
    currentLanguage,
    onCurrentLanguageChange,
} from "../components/languageSelector";
import { useState, useEffect } from "react";

export default function Help() {
    const intl = useIntl();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [, setCurrentLang] = useState(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    // Gemeinsame Styles für die Kacheln (analog zu start.tsx Tiles)
    const cardStyle = {
        bg: { base: "white", _dark: "gray.800" },
        p: 6,
        borderRadius: "2xl",
        shadow: "lg",
        border: "1px solid",
        borderColor: { base: "gray.100", _dark: "gray.700" },
        transition: "transform 0.2s",
        _hover: { transform: "translateY(-2px)", shadow: "xl", borderColor: "orange.300" }
    };

    return (
        <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} position="relative" pb={10}>

            {/* HEADER (Exakt wie start.tsx) */}
            <Box pt={8} pb={2} px={4} position="relative">

                {/* Sprachauswahl oben rechts positioniert */}
                <Box position="absolute" top={8} right={4} zIndex={10}>
                    <CompLangHeader />
                </Box>
            </Box>


            {/* CONTENT */}
            <Container maxW="container.lg" mt={10} py={8} px={{ base: 4, md: 8 }}>
                <VStack gap={8} align="stretch">

                    {/* Intro Section - Große Kachel */}
                    <Box {...cardStyle}>
                        <HStack gap={4} mb={4}>
                            <Icon as={BsInfoCircleFill} boxSize={8} color="orange.500" />
                            <Heading as="h1" size="lg" color={{ base: "gray.800", _dark: "white" }}>
                                {intl.formatMessage({ id: "help.title" })}
                            </Heading>
                        </HStack>
                        <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.300" }} lineHeight="tall">
                            {intl.formatMessage({ id: "help.intro_text" })}
                        </Text>
                    </Box>

                    {/* FAQ Section - Kachel */}
                    <Box {...cardStyle}>
                        <HStack gap={4} mb={6}>
                            <Icon as={BsQuestionCircleFill} boxSize={6} color="orange.500" />
                            <Heading as="h2" size="md" color={{ base: "gray.800", _dark: "white" }}>
                                {intl.formatMessage({ id: "help.faq_title" })}
                            </Heading>
                        </HStack>

                        <Accordion.Root multiple collapsible defaultValue={["q1"]} variant="plain">
                            <VStack gap={4} align="stretch">

                                {/* Frage 1 */}
                                <Accordion.Item value="q1" borderBottomWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
                                    <Accordion.ItemTrigger _expanded={{ color: "orange.600" }} py={3}>
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                                            {intl.formatMessage({ id: "help.faq.q1" })}
                                        </Box>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent pb={4} color={{ base: "gray.600", _dark: "gray.400" }}>
                                        {intl.formatMessage({ id: "help.faq.a1" })}
                                    </Accordion.ItemContent>
                                </Accordion.Item>

                                {/* Frage 2 */}
                                <Accordion.Item value="q2" borderBottomWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
                                    <Accordion.ItemTrigger _expanded={{ color: "orange.600" }} py={3}>
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                                            {intl.formatMessage({ id: "help.faq.q2" })}
                                        </Box>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent pb={4} color={{ base: "gray.600", _dark: "gray.400" }}>
                                        {intl.formatMessage({ id: "help.faq.a2" })}
                                    </Accordion.ItemContent>
                                </Accordion.Item>

                                {/* Frage 3 */}
                                <Accordion.Item value="q3" borderBottomWidth="1px" borderColor={{ base: "gray.100", _dark: "gray.700" }}>
                                    <Accordion.ItemTrigger _expanded={{ color: "orange.600" }} py={3}>
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                                            {intl.formatMessage({ id: "help.faq.q3" })}
                                        </Box>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent pb={4} color={{ base: "gray.600", _dark: "gray.400" }}>
                                        {intl.formatMessage({ id: "help.faq.a3" })}
                                    </Accordion.ItemContent>
                                </Accordion.Item>

                                {/* Frage 4 */}
                                <Accordion.Item value="q4" border="none">
                                    <Accordion.ItemTrigger _expanded={{ color: "orange.600" }} py={3}>
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                                            {intl.formatMessage({ id: "help.faq.q4" })}
                                        </Box>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent pb={4} color={{ base: "gray.600", _dark: "gray.400" }}>
                                        {intl.formatMessage({ id: "help.faq.a4" })}
                                    </Accordion.ItemContent>
                                </Accordion.Item>

                            </VStack>
                        </Accordion.Root>
                    </Box>

                    {/* Untere Kacheln Grid: Kontakt & Ridey */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>

                        {/* Kontakt Kachel */}
                        <Box {...cardStyle} bgGradient="linear(to-br, orange.50, white)" _dark={{ bgGradient: "linear(to-br, orange.900, gray.800)" }}>
                            <VStack align="start" gap={3}>
                                <HStack color="orange.600">
                                    <Icon as={FaPaperPlane} />
                                    <Heading size="sm">{intl.formatMessage({ id: "help.still_questions" })}</Heading>
                                </HStack>
                                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                                    {intl.formatMessage({ id: "help.contact_support" })}
                                </Text>

                                <Button
                                    asChild
                                    size="sm"
                                    variant="solid"
                                    bg="orange.500"
                                    color="white"
                                    _hover={{ bg: "orange.600" }}
                                    mt={2}
                                >
                                    <a href="mailto:mweicker@uni-muenster.de">
                                        {intl.formatMessage({ id: "help.send_email" })}
                                    </a>
                                </Button>
                            </VStack>
                        </Box>

                        {/* Ridey Chat Kachel */}
                        <Box {...cardStyle}>
                            <VStack align="start" gap={3}>
                                <HStack color="orange.600">
                                    <Icon as={BsChatQuoteFill} />
                                    <Heading size="sm">Ridey Chat</Heading>
                                </HStack>
                                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                                    {intl.formatMessage({ id: "help.faq.a3" })}
                                </Text>
                            </VStack>
                        </Box>

                    </SimpleGrid>

                </VStack>
            </Container>

            {/* Footer */}
            <VStack gap={6} px={4} py={8} align="center" w="100%" bg="white" mt={8}>
                <VStack gap={4} align="center" maxW="1000px">
                    {/* Footer Links */}
                    <HStack gap={6} justify="center" wrap="wrap" fontSize="sm">
                        <Text
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                            cursor="pointer"
                            onClick={() => navigate("/imprint")}
                        >
                            {intl.formatMessage({ id: "welcome.imprint" })}
                        </Text>
                        <Text color="gray.400">•</Text>
                        <Text
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                            cursor="pointer"
                            onClick={() => navigate("/help")}
                        >
                            {intl.formatMessage({ id: "menu.help" })}
                        </Text>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="https://github.com/lraeuschel/muensterdiscovery"
                            target="_blank"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            GitHub
                        </Link>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="https://huggingface.co/spaces/MIDI11/chatwithridey"
                            target="_blank"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            HuggingFace (ChatWithRidey)
                        </Link>
                    </HStack>

                    {/* Copyright */}
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                        © 2026 MünsterDiscovery. {intl.formatMessage({ id: "footer.all_rights_reserved" })}
                    </Text>
                </VStack>
            </VStack>

        </Box>
    );
}
