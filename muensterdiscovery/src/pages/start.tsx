import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button, Image } from "@chakra-ui/react";
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
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: "Slide 1",
            content: <Text fontSize="2xl" fontWeight="bold">Slide 1 Content</Text>,
            image: undefined,
        },
        {
            id: 2,
            title: "Slide 2",
            content: <Text fontSize="2xl" fontWeight="bold">Slide 2 Content</Text>,
            image: undefined,
        },
        {
            id: 3,
            title: "Slide 3",
            content: <Text fontSize="2xl" fontWeight="bold">Slide 3 Content</Text>,
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
        </Box>
    );
}
