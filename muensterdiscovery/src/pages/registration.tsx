import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import { Input, Button, Text, Flex, Box, Heading, VStack} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";

import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { useIntl } from "react-intl";

export default function Signup() {
    const intl = useIntl();
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    // Definiere Platzhalter für Formularfelder
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        const { data: existingUser } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .maybeSingle(); // maybeSingle gibt null zurück, wenn nichts gefunden wird

        if (existingUser) {
            setMessage(intl.formatMessage({ id: "registration.username_taken" })); // "Benutzername bereits vergeben.""
            return;
        }

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                }
            }
        });

        if (signupError) {
            setMessage(signupError.message);
        } else if (signupData.user?.identities?.length === 0) {
            setMessage(intl.formatMessage({ id: "registration.already_have_account" }));
            return;
        }

        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setUsername("");
        setMessage(intl.formatMessage({ id: "registration.email_confirmation_message" }));
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
                        {intl.formatMessage({ id: "registration.title" })}
                    </Heading>

                    <form onSubmit={handleSignup}>
                        <VStack>

                            <FormControl>
                                <FormLabel color="orange.700">{intl.formatMessage({ id: "registration.firstname" })}</FormLabel>
                                <Input
                                    bg="orange.50"
                                    borderColor="orange.300"
                                    _focus={{ borderColor: "orange.500" }}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="orange.700">{intl.formatMessage({ id: "registration.lastname" })}</FormLabel>
                                <Input
                                    bg="orange.50"
                                    borderColor="orange.300"
                                    _focus={{ borderColor: "orange.500" }}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="orange.700">{intl.formatMessage({ id: "registration.username" })}</FormLabel>
                                <Input
                                    bg="orange.50"
                                    borderColor="orange.300"
                                    _focus={{ borderColor: "orange.500" }}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="orange.700">{intl.formatMessage({ id: "registration.email" })}</FormLabel>
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
                                <FormLabel color="orange.700">{intl.formatMessage({ id: "registration.password" })}</FormLabel>
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
                                colorScheme="orange"
                                width="100%"
                                rounded="lg"
                                size="lg"
                                type="submit"
                            >
                                {intl.formatMessage({ id: "registration.register_button" })}
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