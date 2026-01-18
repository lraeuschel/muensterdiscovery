import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button, Image, Grid, GridItem, Link, IconButton } from "@chakra-ui/react";
import { useIntl } from 'react-intl';
import { useNavigate } from "react-router-dom";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import RideyChat from "../components/RideyChat";
import { supabase } from "../SupabaseClient";
import { getUserAchievements } from "../services/DatabaseConnection";
import { getMood, type Mood } from "../services/rideyScore";
import rideyHappy from "../assets/ridey_happy.png";
import rideySad from "../assets/ridey_traurig.png"; 
//import rideyChristmas from "../assets/ridey_weihnachten.png";
import type { User } from "@supabase/supabase-js";
import type { Achievement } from "../types";
import { CiRoute } from "react-icons/ci";
import { MdOutlineLeaderboard } from "react-icons/md";
import { IoEarthOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { getRandomPOI } from "../services/poiService";
import type { POI } from "../types";
import { MdMilitaryTech } from "react-icons/md";
import { useRef } from "react"; // Add useRef to existing import
import { BsQuestionCircle } from "react-icons/bs";
import type { RideyChatRef } from "../components/RideyChat";


export default function Start() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [_, setIsLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [__, setAchievements] = useState<Achievement[]>([]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [mood, setMood] = useState<Mood | null>(null);
    const [randomPOI, setRandomPOI] = useState<POI | null>(null);
    const rideyChatRef = useRef<RideyChatRef>(null);

    
    const getMascotImage = () => {
        switch (mood) {
            case "happy": return rideyHappy;
            case "sad": return rideySad;
            default: return rideySad;
        }
    };

      useEffect(() => {
        const loadRandomPOI = async () => {
        const poi = await getRandomPOI();
        setRandomPOI(poi);
        };

        loadRandomPOI();

        const interval = setInterval(() => {
        loadRandomPOI();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return undefined;
        return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
    };


    const slides = [
        {
            id: 1,
            title: randomPOI?.name,
            context: (
                <VStack gap={2} textAlign="center" maxW="600px">
                    <Text fontSize="md" color="gray.700" lineClamp={3}>
                        {randomPOI?.info}
                    </Text>
                </VStack>
            ),
            content: (
                <VStack gap={2} textAlign="center" maxW="600px">
                    <Text fontSize="md" color="gray.700" lineClamp={3}>
                        {randomPOI?.info}
                    </Text>
                </VStack>
            ),
            image: getImageUrl(randomPOI?.image_path),
        },
        {
            id: 2,
            title: (mood === "happy" ? intl.formatMessage({ id: "start.slide1_title.happy" }) : mood === "sad" ? intl.formatMessage({ id: "start.slide1_title.sad" }) : intl.formatMessage({ id: "start.slide1_title.neutral" })),
            context: (
                <VStack gap={4} textAlign="center" maxW="600px">
                    <Text fontSize="md" color="gray.700">
                        {mood === "happy" ? intl.formatMessage({ id: "start.slide1_content.happy" }) : mood === "sad" ? intl.formatMessage({ id: "start.slide1_content.sad" }) : intl.formatMessage({ id: "start.slide1_content.neutral" })}
                    </Text>
                </VStack>
            ),
            content: (
                <VStack gap={4} textAlign="center" maxW="600px">
                    <Text fontSize="md" color="gray.700">
                        {mood === "happy"
                            ? intl.formatMessage({ id: "start.slide1_content.happy" })
                            : mood === "sad"
                                ? intl.formatMessage({ id: "start.slide1_content.sad" })
                                : intl.formatMessage({ id: "start.slide1_content.sad" })
                        }
                    </Text>
                        <Button
                            aria-label="Ask about this POI"
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={(e) => {
                                e.stopPropagation();
                                rideyChatRef.current?.openChatWithQuestion(
                                    `What can I do to make Ridey happy?`
                                );
                            }}
                            _hover={{ bg: "orange.100" }}
                            p={0}
                            minW="auto"
                        >
                            <BsQuestionCircle size={20} />
                        </Button>
                </VStack>
                
            ),
            image: getMascotImage(),
        },
        // Slide 3: Achievement - Medal Design
        {
        id: 3,
        title: selectedAchievement?.achievement || intl.formatMessage({ id: "start.slide2_title" }),
        content: (
            <VStack gap={6} align="center">
            {/* Medal Container with ribbon effect */}
            <VStack gap={0} align="center">
                {/* Ribbon top */}
                <HStack gap={3} h="30px" align="flex-end">
                <Box w="3" h="12" bg="yellow.400" borderRadius="sm" />
                <Box w="3" h="12" bg="yellow.400" borderRadius="sm" />
                </HStack>

                {/* Medal Circle */}
                <Box
                position="relative"
                w="120px"
                h="120px"
                borderRadius="full"
                boxShadow="0 8px 16px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(0, 0, 0, 0.1), inset 4px 4px 8px rgba(255, 255, 255, 0.3)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
                }}
                >
                {/* Inner circle for depth */}
                <Box
                    w="110px"
                    h="110px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                    background: "linear-gradient(135deg, #FFED4E 0%, #FFD700 100%)",
                    }}
                >
                    <MdMilitaryTech size={60} color="#FF6B00" />
                </Box>
                </Box>

                {/* Ribbon bottom */}
                <HStack gap={3} h="30px" align="flex-start">
                <Box w="3" h="12" bg="yellow.400" borderRadius="sm" />
                <Box w="3" h="12" bg="yellow.400" borderRadius="sm" />
                </HStack>
            </VStack>

            {/* Achievement Description */}
            <Text
                fontSize="md"
                color="gray.700"
                textAlign="center"
                maxW="400px"
                fontStyle="italic"
            >
                {selectedAchievement?.description || intl.formatMessage({ id: "start.slide2_content" })}
            </Text>
            </VStack>
        ),
        image: undefined,
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 15000);

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
                try {
                    const m = await getMood(session.user.id, { happy: 40, sad: 20 });
                    setMood(m);
                } catch (err) {
                    console.error("Error computing mood:", err);
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
            {<RideyChat ref={rideyChatRef} currentLanguage={currentLang} intl={intl} />}


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

                {/* <Text
                    fontSize="s"
                    fontWeight="extrabold"
                    color="orange.600"
                    textAlign="center"
                    mt="-20px"
                >
                    EXPLORING MÜNSTER
                </Text> */}
            </VStack>

            {/* Slideshow Container */}
            <VStack gap={4} px={4} align="center" justify="center" flex={1} minH="500px">
            {/* Slide 1: POI with Background Image */}
            {currentSlide === 0 ? (
                <Box
                position="relative"
                w="100%"
                maxW="800px"
                h="450px"
                borderRadius="2xl"
                boxShadow="xl"
                overflow="hidden"
                bg="gray.200"
                >
                {/* Background Image */}
                {slides[currentSlide].image && (
                    <Image
                    src={slides[currentSlide].image}
                    alt="POI Background"
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    objectPosition="center"
                    />
                )}

                {/* Dark Overlay */}
                {slides[currentSlide].image && (
                    <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    bg="blackAlpha.300"
                    />
                )}

                {/* Content Card at Bottom */}
                <VStack
                    position="absolute"
                    bottom={6}
                    left={0}
                    right={0}
                    mx="auto"
                    w="calc(100% - 48px)"
                    maxW="700px"
                    bg="white"
                    borderRadius="xl"
                    p={6}
                    boxShadow="lg"
                    gap={3}
                    zIndex={10}
                >
                    {/* Title with Question Mark Button */}
                    <HStack w="full" justify="space-between" align="center">
                        <Text
                            fontSize="xl"
                            fontWeight="800"
                            color="orange.600"
                            textAlign="center"
                            lineClamp={2}
                            flex={1}
                        >
                            {slides[currentSlide].title}
                        </Text>
                        <Button
                            aria-label="Ask about this POI"
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (randomPOI?.name) {
                                    rideyChatRef.current?.openChatWithQuestion(
                                        `What can I do at ${randomPOI.name}?`
                                    );
                                }
                            }}
                            _hover={{ bg: "orange.100" }}
                            p={0}
                            minW="auto"
                        >
                            <BsQuestionCircle size={20} />
                        </Button>

                    </HStack>
                    
                    <Text
                        fontSize="sm"
                        color="gray.700"
                        textAlign="center"
                        lineClamp={2}
                    >
                        {slides[currentSlide].content}
                    </Text>
                </VStack>
                </Box>
            ) : (
                /* Slides 2, 3, etc: Regular Card Style */
                <Box
                bg="white"
                borderRadius="lg"
                boxShadow="lg"
                overflow="hidden"
                p={6}
                textAlign="center"
                w="100%"
                maxW="800px"
                minH="400px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                >
                {/* Image if exists */}
                {slides[currentSlide].image && (
                    <Image
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    maxH="250px"
                    mx="auto"
                    mb={4}
                    borderRadius="lg"
                    />
                )}

                {/* Title */}
                <Text fontSize="2xl" fontWeight="bold" mb={4} color="orange.600">
                    {slides[currentSlide].title}
                </Text>

                {/* Content */}
                <Box maxW="600px">
                    {slides[currentSlide].content}
                </Box>
                </Box>
            )}

                {/* Slide Indicators */}
                <HStack gap={3} justify="center" mt={4}>
                    {slides.map((_, index) => (
                        <Button
                            key={index}
                            size="sm"
                            w={currentSlide === index ? "12" : "3"}
                            h="3"
                            borderRadius="full"
                            bg={currentSlide === index ? "orange.500" : "gray.300"}
                            onClick={() => goToSlide(index)}
                            _hover={{
                                bg: currentSlide === index ? "orange.600" : "gray.400",
                            }}
                            transition="all 0.3s"
                            aria-label={`Go to slide ${index + 1}`}
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

            {/* Tiles Grid 2x2 - Distinct & Editable */}
            <VStack gap={6} px={4} py={8} align="center" w="100%">
                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    w="100%"
                    maxW="800px"
                >
                    {/* Tile 1 */}
                    <GridItem
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
                        onClick={() => navigate("/routeselection")}
                    >
                        <Text 
                            fontSize="lg" 
                            fontWeight="bold" 
                            color="orange.400"
                            mt= "-10px"
                            >

                            {intl.formatMessage({ id: "start.tile.1" })}
                        </Text>
                        <Text 
                            fontSize="xs" 
                            color="gray.400" 
                            textAlign="center"
                            
                            >
                            {intl.formatMessage({ id: "start.tile.1.context" })}
                        </Text>
                        <CiRoute size={60} color="grey"/>
                    </GridItem>

                    {/* Tile 2 */}
                    <GridItem
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
                        onClick={() => navigate("/openworld")}
                    >
                        <Text fontSize="lg" fontWeight="bold" color="orange.400">
                            {intl.formatMessage({ id: "start.tile.2" })}
                        </Text>
                        <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                            {intl.formatMessage({ id: "start.tile.2.context" })}
                        </Text>
                        <IoEarthOutline size={60} color="grey"/>
                    </GridItem>

                    {/* Tile 3 */}
                    <GridItem
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
                        onClick={() => navigate("/leaderboard")}
                    >
                        <Text fontSize="lg" fontWeight="bold" color="orange.400">
                            {intl.formatMessage({ id: "start.tile.3" })}
                        </Text>
                        <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                            {intl.formatMessage({ id: "start.tile.3.context" })}
                        </Text>
                        <MdOutlineLeaderboard size={60} color="grey"/>
                    </GridItem>

                    {/* Tile 4 */}
                    <GridItem
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
                        onClick={() => navigate("/profile")}
                    >
                        <Text fontSize="lg" fontWeight="bold" color="orange.400">
                            {intl.formatMessage({ id: "start.tile.4" })}
                        </Text>
                        <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                            {intl.formatMessage({ id: "start.tile.4.context" })}
                        </Text>
                        <CgProfile size={60} color="grey"/>
                    </GridItem>
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
