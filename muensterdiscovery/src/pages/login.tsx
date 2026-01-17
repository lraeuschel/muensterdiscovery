import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import { Input, Button, Text, Flex, Box, Heading, VStack} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { useIntl } from "react-intl";

export default function Login() {
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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setMessage(intl.formatMessage({ id: "login.error" }));
            return;
        }

        setMessage(intl.formatMessage({ id: "login.success" }));
        // Redirect to profile page after successful login
        navigate("/profile");
    }

    return (
        <>
            <CompLangHeader />

            <Flex justify="center" align="center" minH="100vh" bg="orange.50" pt="80px">
                <Box
                    bg="white"
                    p={8}
                    rounded="xl"
                    shadow="lg"
                    width="100%"
                    maxW="420px"
                    border="2px solid"
                    borderColor="orange.200"
                >
                    <Heading
                        mb={6}
                        textAlign="center"
                        size="lg"
                        color="orange.600"
                    >
                        {intl.formatMessage({ id: "login.title" })}
                    </Heading>

                    <form onSubmit={handleLogin}>
                        <VStack>
                            <FormControl>
                                <FormLabel color="orange.700">
                                    {intl.formatMessage({ id: "login.email" })}
                                </FormLabel>
                                <Input
                                    type="email"
                                    bg="orange.50"
                                    borderColor="orange.300"
                                    _focus={{ borderColor: "orange.500" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="orange.700">
                                    {intl.formatMessage({ id: "login.password" })}
                                </FormLabel>
                                <Input
                                    type="password"
                                    bg="orange.50"
                                    borderColor="orange.300"
                                    _focus={{ borderColor: "orange.500" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="orange"
                                width="100%"
                                rounded="lg"
                                size="lg"
                            >
                                {intl.formatMessage({ id: "login.button" })}
                            </Button>

                            {message && (
                                <Text mt={2} textAlign="center" color="orange.600" fontWeight="medium">
                                    {message}
                                </Text>
                            )}
                        </VStack>
                    </form>
                </Box>
            </Flex>
        </>
    );
}
