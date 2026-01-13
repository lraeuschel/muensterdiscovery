import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button, Image, Grid, GridItem, Link } from "@chakra-ui/react";
import { useIntl } from 'react-intl';
import { useNavigate } from "react-router-dom";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import RideyChat from "../components/RideyChat";
import { supabase } from "../SupabaseClient";
import { getUserAchievements } from "../services/DatabaseConnection";
import type { User } from "@supabase/supabase-js";
import type { Achievement } from "../types";

export default function Start() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const slides = [
        {
            id: 1,
            title: intl.formatMessage({ id: "start.slide1_title" }),
            content: <Text fontSize="2xl" fontWeight="bold">{intl.formatMessage({ id: "start.slide1_content" })}</Text>,
            image: undefined,
        },
        {
            id: 2,
            title: selectedAchievement?.achievement || intl.formatMessage({ id: "start.slide2_title" }),
            content: (
                <VStack gap={4} textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {selectedAchievement?.achievement || intl.formatMessage({ id: "start.slide2_title" })}
                    </Text>
                    <Text fontSize="md" color="gray.700">
                        {selectedAchievement?.description || intl.formatMessage({ id: "start.slide2_content" })}
                    </Text>
                </VStack>
            ),
            image: undefined,
        },
        {
            id: 3,
            title: intl.formatMessage({ id: "start.slide3_title" }),
            content: <Text fontSize="2xl" fontWeight="bold">{intl.formatMessage({ id: "start.slide3_content" })}</Text>,
            image: undefined,
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

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
            
            try {
                const userAchievements = await getUserAchievements(session.user.id);
                setAchievements(userAchievements);
                
                if (userAchievements.length > 0) {
                    const randomIndex = Math.floor(Math.random() * userAchievements.length);
                    setSelectedAchievement(userAchievements[randomIndex]);
                }
            } catch (error) {
                console.error("Error fetching user achievements:", error);
            }
            
            setIsLoading(false);
        };
        checkAuth();
    }, [navigate]);

    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <CompLangHeader />
            {<RideyChat currentLanguage={currentLang} />}

            {/* Header */}
            <VStack mt="80px" mb={8}>
                <Text
                    fontSize="3xl"
                    fontWeight="extrabold"
                    color="orange.400"
                    textAlign="center"
                    mt="-60px"
                >
                    MUENSTERDISCOVERY
                </Text>
            </VStack>

            {/* Slideshow Container */}
            <VStack gap={4} px={4} align="center" justify="center" flex={1} minH="500px">
                {/* Slide Display */}
                <Box
                    position="relative"
                    w="100%"
                    maxW="800px"
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                    overflow="hidden"
                    minH="400px"
                >
                    {slides[currentSlide].image && (
                        <Image
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                        />
                    )}
                    <VStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        justify="center"
                        align="center"
                        bg={!slides[currentSlide].image ? "white" : "rgba(0, 0, 0, 0.3)"}
                        p={8}
                    >
                        {slides[currentSlide].content}
                    </VStack>
                </Box>

                {/* Slide Indicators */}
                <HStack gap={2} justify="center">
                    {slides.map((_, index) => (
                        <Button
                            key={index}
                            size="sm"
                            w={currentSlide === index ? "8" : "3"}
                            h="3"
                            borderRadius="full"
                            bg={currentSlide === index ? "orange.500" : "gray.300"}
                            onClick={() => goToSlide(index)}
                            _hover={{
                                bg: currentSlide === index ? "orange.600" : "gray.400",
                            }}
                        />
                    ))}
                </HStack>
            </VStack>

            {/* Welcome Message */}
            <VStack gap={4} px={4} py={8} align="center" w="100%">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600" textAlign="center">
                    {intl.formatMessage({ id: "start.welcome_message" }, { name: user?.user_metadata?.username || user?.email || "Explorer" })}
                </Text>
                <Text fontSize="md" color="gray.600" textAlign="center" maxW="600px">
                    {intl.formatMessage({ id: "start.discover_message" })}
                </Text>
            </VStack>

            {/* Tiles Grid 2x2 */}
            <VStack gap={6} px={4} py={8} align="center" w="100%">
                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    w="100%"
                    maxW="800px"
                >
                    {[...Array(4)].map((_, index) => (
                        <GridItem
                            key={index}
                            bg="white"
                            borderRadius="lg"
                            boxShadow="md"
                            p={6}
                            minH="200px"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            cursor="pointer"
                            transition="all 0.3s"
                            _hover={{
                                boxShadow: "lg",
                                transform: "translateY(-4px)",
                            }}
                        >
                            <Text fontSize="lg" fontWeight="bold" color="orange.400">
                                {intl.formatMessage({ id: "start.tile" }, { number: index + 1 })}
                            </Text>
                            <Text fontSize="sm" color="gray.500" mt={2}>
                                {intl.formatMessage({ id: "start.add_content" })}
                            </Text>
                        </GridItem>
                    ))}
                </Grid>
            </VStack>

            {/* Divider */}
            <Box w="100%" h="1px" bg="orange.200" my={8} />

            {/* Footer */}
            <VStack gap={6} px={4} py={8} align="center" w="100%" bg="white" mt={8}>
                <VStack gap={4} align="center" maxW="1000px">
                    {/* Footer Links */}
                    <HStack gap={6} justify="center" wrap="wrap" fontSize="sm">
                        <Link
                            href="/muensterdiscovery/imprint"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {intl.formatMessage({ id: "welcome.imprint" })}
                        </Link>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="/muensterdiscovery/help"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {intl.formatMessage({ id: "menu.help" })}
                        </Link>
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
