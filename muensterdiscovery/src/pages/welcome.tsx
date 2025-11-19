// import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, VStack, Text, Image, createListCollection, Portal, HStack } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react"
import muensterdiscovery_logo from "../assets/logo.png";
import { useIntl } from "react-intl";
import MenuComponent from "../components/menu";

export default function Welcome({ setLanguage }: { setLanguage: (lang: "de" | "en") => void }) {
    const navigate = useNavigate();
    const intl = useIntl();

    const languages = createListCollection({
        items: [
            { label: "🇩🇪", value: "de" },
            { label: "🇬🇧", value: "en" },
        ],
    });

    return (
        <Box bg="orange.50" minH="100vh">
            <HStack>
                <MenuComponent />
                <Select.Root collection={languages} size="sm" width="20%" position={"fixed"} variant={"subtle"} top={"10px"} right={"10px"}>
                    {/* <Select.HiddenSelect />
                    <Select.Label>{intl.formatMessage({ id: "welcome.select_language" })}</Select.Label> */}
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder= "🇩🇪 / 🇬🇧" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {languages.items.map((language) => (
                                    <Select.Item item={language} key={language.value} onClick={() => setLanguage(language.value === "de" || language.value === "en" ? language.value : "de")}>
                                        {language.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
            </HStack>
            
            <VStack>
                <Text
                    fontSize={{ base: "2xl", md: "4xl" }}
                    fontWeight="bold"
                    color="orange.500"
                    letterSpacing="wide"
                    textAlign="center"
                    textTransform="uppercase"
                    mt={12}
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
