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


    const getMascotImage = () => {
        switch (mood) {
            case "happy": return rideyHappy;
            case "sad": return rideySad; // or rideyHappy if you lack assets
            default: return rideySad; // or rideyHappy
        }
    };

    const slides = [
         {
            id: 1,
            title: (mood === "happy" ? intl.formatMessage({ id: "start.slide1_title.happy" }) : mood === "sad" ? intl.formatMessage({ id: "start.slide1_title.sad" }) : intl.formatMessage({ id: "start.slide1_title.neutral" })),
            context: (                
                    <VStack gap={4} textAlign="center">
                        <Text fontSize="md" color="gray.700">
                            {mood === "happy" ? intl.formatMessage({ id: "start.slide1_content.happy" }) : mood === "sad" ? intl.formatMessage({ id: "start.slide1_content.sad" }) : intl.formatMessage({ id: "start.slide1_content.neutral" })}
                        </Text>
                    </VStack>),
            content: (
            <Text fontSize="md" color="gray.700" mt="-10px">
                {mood === "happy" 
                ? intl.formatMessage({ id: "start.slide1_content.happy" },) 
                : mood === "sad" 
                    ? intl.formatMessage({ id: "start.slide1_content.sad" }) 
                    : intl.formatMessage({ id: "start.slide1_content.sad" })
                }
            </Text>
            ),
            image: getMascotImage(),
        },
        {
            id: 2,
            title: selectedAchievement?.achievement || intl.formatMessage({ id: "start.slide2_title" }),
            content: (
                <VStack gap={4} textAlign="center">
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
            {<RideyChat currentLanguage={currentLang} intl={intl} />}

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
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {slides[currentSlide].image && (
                        <Image
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            w="350px"
                            h="350px"
                            objectFit="cover"
                            mt="60px"
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
                        p={8}
                    >
                        <Text fontSize="2xl" fontWeight="bold" color="orange.600" mb={4} textAlign="center" mt="-280px"
                        >
                            {slides[currentSlide].title}
                        </Text>
                        <Text fontSize="md" color="gray.600" textAlign="center">
                            {slides[currentSlide].content}
                        </Text>
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
