import { Select } from "@chakra-ui/react"
import MenuComponent from "../components/menu";
import {Box, createListCollection, Portal, HStack, VStack } from "@chakra-ui/react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
interface ArcgisMapElement extends HTMLElement {
  view: import("@arcgis/core/views/MapView").default;
}
import { ArcgisMap } from "@arcgis/map-components-react";




export default function RouteDisplay({ setLanguage }: { setLanguage: (lang: "de" | "en") => void }) {
    const languages = createListCollection({
        items: [
            { label: "🇩🇪", value: "de" },
            { label: "🇬🇧", value: "en" },
        ],
    });
    const handleViewReady = (event: CustomEvent) => {
        const mapElement = event.target as ArcgisMapElement;
        const view = mapElement.view;
        if (view) {
            view.center = [7.625, 51.960];
            view.zoom = 14;
        }
    };


    return (
        <Box minH="100vh">
            <HStack
                position="fixed"
                top="10px"
                right="10px"
                zIndex={10}
                width="100%"
                bg="whiteAlpha.900"
                >
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
                    <ArcgisMap
                        itemId="1f619312739c450fae0d1749a3805ba2"
                        style={{ height: "100vh", width: "100%", zIndex: 2 }}
                        onArcgisViewReadyChange={handleViewReady}
                        >
                    </ArcgisMap>
            </VStack>
        </Box>
    )
}